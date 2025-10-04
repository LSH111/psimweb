<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/parkingmap.css"/>
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <title>주차장 지도</title>

    <!-- Kakao Maps JS (HTTPS + autoload=false) -->
    <script
            src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=services&autoload=false"
            defer
            id="kakao-sdk"
    ></script>

</head>
<body>

<div id="map" aria-label="지도"></div>

<section class="bottom" id="bottom">
    <div class="row">
        <div class="title">더미 주차장 10 <span class="sep">|</span> 반경 <b id="rLbl">1.0</b> km</div>
        <div class="muted" id="stat" style="margin-left:8px">초기화 중…</div>
        <button class="btn min minbtn" id="minList"></button>
    </div>
    <div class="row">
        <button class="btn" id="locBtn" title="현위치로 이동(1회)">현재 위치</button>
        <button class="btn" id="fitBtn" title="반경 내 전체 보기">전체 보기</button>
        <div class="chipbar" id="radiusBar" style="margin-left:auto">
            <div class="chip" data-r="0.5">0.5km</div>
            <div class="chip on" data-r="1">1km</div>
            <div class="chip" data-r="1.5">1.5km</div>
        </div>
    </div>
    <div class="list" id="listWrap">
        <div id="list" class="grid" role="listbox" aria-label="주차장 목록(반경 내)"></div>
    </div>
</section>

<section class="errdock" id="errdock" aria-label="오류 로그">
    <div class="hdr">
        <div class="title">오류 로그(에러만)</div>
        <div class="muted" id="errcount">0건</div>
        <button class="btnsm" id="copyErr">복사</button>
        <button class="btnsm" id="clearErr">지우기</button>
        <button class="btnsm minbtn" id="minErr"></button>
    </div>
    <div class="body" id="errbody"></div>
</section>

<script defer>
    /* ===== 유틸 & 오류 로그 ===== */
    const $ = (s)=>document.querySelector(s);
    const ok   = function(m){ $('#stat').innerHTML = '<span style="color:#10b981">✔</span> ' + m; };
    const warn = function(m){ $('#stat').innerHTML = '<span style="color:#f59e0b">!</span> ' + m; };
    const errBody=()=>$('#errbody'), errCnt=()=>$('#errcount'), errDock=()=>$('#errdock');
    window.addEventListener('error', e=> logERR('window.onerror: '+e.message,'', e.error?.stack||''));
    window.addEventListener('unhandledrejection', e=> logERR('unhandledrejection','', e.reason?.stack||String(e.reason)));
    const tstr=()=>new Date().toLocaleTimeString();
    function logERR(msg, url, detail){
        const row = document.createElement('div'); row.className = 'logrow';
        row.innerHTML = '<span class="time">[' + tstr() + ']</span>' +
                        '<span class="lvl">ERR</span> ' + msg +
                        (url ? '<div class="url">' + url + '</div>' : '') +
                        (detail ? '<div class="muted">' + detail + '</div>' : '');
        errBody().appendChild(row); errBody().scrollTop = errBody().scrollHeight;
        errCnt().textContent = errBody().querySelectorAll('.logrow').length + '건';
    }
    window.addEventListener('DOMContentLoaded', ()=>{
        $('#copyErr').onclick=async()=>{
            const txt=[...errBody().querySelectorAll('.logrow')].map(el=>el.innerText).join('\n');
            try{ await navigator.clipboard.writeText(txt||'(로그 없음)'); }catch(e){}
        };
        $('#clearErr').onclick=()=>{ errBody().innerHTML=''; errCnt().textContent='0건'; };
        $('#minErr').onclick=()=> errDock().classList.toggle('min');
        $('#minList').onclick=()=> $('#bottom').classList.toggle('min');
    });

    // Kakao SDK 로드 감시(진단)
    const sdk = document.getElementById('kakao-sdk');
    sdk?.addEventListener('error', ()=> logERR('[KAKAO] SDK load failed','https://dapi.kakao.com/v2/maps/sdk.js'));
    sdk?.addEventListener('load',  ()=> console.log('[KAKAO] SDK loaded'));

    /* ===== Kakao SDK 준비 후 초기화 ===== */
    window.addEventListener('DOMContentLoaded', function () {
        function initMapApp(){
            const mapEl = document.getElementById('map');
            const map = new kakao.maps.Map(mapEl, { center: new kakao.maps.LatLng(36.4,127.5), level: 12, draggable: true });
            map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

            // === 프로그램 이동 가드 ===
            let programmaticMove = false;
            function runAsProgrammatic(fn){
                programmaticMove = true;
                try { fn(); } finally { setTimeout(()=>{ programmaticMove = false; }, 0); }
            }

            // ✅ 재중심 예약( idle/panTo 백업 ) 관리 & 취소
            let centerJob = { idle: null, to: null };
            function cancelCenterJob(){
                if (centerJob.idle) {
                    kakao.maps.event.removeListener(map, 'idle', centerJob.idle);
                    centerJob.idle = null;
                }
                if (centerJob.to) {
                    clearTimeout(centerJob.to);
                    centerJob.to = null;
                }
            }

            // 사용자 조작 시: 예약만 즉시 취소(자동 복귀 자체가 없음)
            function userMoved(){
                if(!programmaticMove){
                    cancelCenterJob();
                }
            }
            kakao.maps.event.addListener(map, 'drag',           userMoved);
            kakao.maps.event.addListener(map, 'dragstart',      userMoved);
            kakao.maps.event.addListener(map, 'dragend',        userMoved);
            kakao.maps.event.addListener(map, 'zoom_start',     userMoved);
            kakao.maps.event.addListener(map, 'center_changed', userMoved);
            kakao.maps.event.addListener(map, 'bounds_changed', userMoved);

            // 버튼: 현재 위치 → 1회만 재중심
            $('#locBtn').onclick = ()=>{
                cancelCenterJob();
                recenterToMe(true); // one-shot
            };
            // 버튼: 전체 보기
            $('#fitBtn').onclick = ()=>{
                cancelCenterJob();
                runAsProgrammatic(()=> fitBounds());
            };

            // === 내 위치 표시 요소 ===
            const meState = { latlng:null, acc:0 };
            const ME_SVG = `data:image/svg+xml;utf8,`+encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 38 38'>
          <defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#0ea5e9'/><stop offset='1' stop-color='#2563eb'/></linearGradient></defs>
          <path d='M19 0c9 0 16 7 16 16 0 9-8 17-16 22-8-5-16-13-16-22C3 7 10 0 19 0z' fill='url(#g)'/>
          <circle cx='19' cy='12' r='5' fill='#fff'/>
          <path d='M10 26c2-5 6-7 9-7s7 2 9 7' stroke='#fff' stroke-width='3' fill='none' stroke-linecap='round'/>
        </svg>`
            );
            const meMarker = new kakao.maps.Marker({
                map, position: new kakao.maps.LatLng(36.4,127.5),
                image: new kakao.maps.MarkerImage(ME_SVG, new kakao.maps.Size(38,38), {offset:new kakao.maps.Point(19,38)})
            });
            const accCircle = new kakao.maps.Circle({
                map, center: new kakao.maps.LatLng(36.4,127.5), radius: 0,
                strokeWeight: 2, strokeColor: '#0ea5e9', strokeOpacity: 0.8, fillColor: '#0ea5e9', fillOpacity: 0.12
            });
            const radCircle = new kakao.maps.Circle({
                map, center: new kakao.maps.LatLng(36.4,127.5), radius: 1000,
                strokeWeight: 2, strokeColor: '#2563eb', strokeOpacity: 0.9, strokeStyle: 'dash',
                fillColor: '#2563eb', fillOpacity: 0.06
            });

            function updateMe(lat, lng, acc){
                const ll = new kakao.maps.LatLng(lat, lng);
                meState.latlng = ll; meState.acc = acc||0;
                meMarker.setPosition(ll);
                accCircle.setPosition(ll); accCircle.setRadius(Math.max(0, acc||0));
                radCircle.setPosition(ll);
            }

            // 안정화된 재중심(줌→센터→idle 후 panTo + 백업) — 항상 "한 세트만" 예약
            function recenterToMe(animate = true){
                if(!meState.latlng) return;
                cancelCenterJob(); // 새 예약 전 기존 예약 정리
                runAsProgrammatic(()=>{
                    if(map.getLevel() > 5) map.setLevel(5);
                    map.setCenter(meState.latlng);
                    if (animate) {
                        centerJob.idle = kakao.maps.event.addListener(map, 'idle', function(){
                            kakao.maps.event.removeListener(map, 'idle', centerJob.idle);
                            centerJob.idle = null;
                            runAsProgrammatic(()=> map.panTo(meState.latlng));
                        });
                        centerJob.to = setTimeout(()=>{
                            centerJob.to = null;
                            runAsProgrammatic(()=> map.panTo(meState.latlng));
                        }, 120);
                    }
                });
            }

            // === 반경/목록 ===
            const radiusState = { rKm: 1 };
            $('#rLbl').textContent = radiusState.rKm.toFixed(1);
            $('#radiusBar').addEventListener('click', (e)=>{
                const chip=e.target.closest('.chip'); if(!chip) return;
                $('#radiusBar').querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
                chip.classList.add('on');
                radiusState.rKm = Number(chip.dataset.r);
                $('#rLbl').textContent = radiusState.rKm.toFixed(1);
                radCircle.setRadius(radiusState.rKm*1000);
                applyRadiusFilter(); rebuildList();
            });

            function haversineKm(a,b){
                const R=6371,toRad=d=>d*Math.PI/180;
                const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
                const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2);
                const t=s1*s1+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*s2*s2;
                return 2*R*Math.asin(Math.sqrt(t));
            }

            const P_SVG = `data:image/svg+xml;utf8,`+encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 36 36'>
          <circle cx='18' cy='18' r='16' fill='#2563eb'/><text x='18' y='22' font-family='Arial,Helvetica,sans-serif' font-size='16' text-anchor='middle' fill='#fff' font-weight='700'>P</text>
        </svg>`
            );
            const prkImage = new kakao.maps.MarkerImage(P_SVG, new kakao.maps.Size(34,34), {offset:new kakao.maps.Point(17,17)});
            const prkMarkers = [];
            const info = new kakao.maps.InfoWindow({ removable:true });

            function openInfo(marker, meta){
                info.setContent(
                  '<div style="min-width:240px;padding:8px 10px">' +
                    '<div style="font-weight:800;margin-bottom:6px">' + (meta.nm || '주차장') + '</div>' +
                    '<div style="color:#374151;font-size:.9rem;line-height:1.35">' +
                      '형태: ' + (meta.type || '-') + ' · 구분: ' + (meta.owner || '-') + '<br>' +
                      '총면수: ' + ((meta.cap && meta.cap.total) ? meta.cap.total : 0) +
                        ' (장애 ' + ((meta.cap && meta.cap.disabled) ? meta.cap.disabled : 0) +
                        ', 경차 ' + ((meta.cap && meta.cap.compact) ? meta.cap.compact : 0) +
                        ', EV ' + ((meta.cap && meta.cap.ev) ? meta.cap.ev : 0) +
                        ', 임산부 ' + ((meta.cap && meta.cap.pregnant) ? meta.cap.pregnant : 0) + ')<br>' +
                      '운영시간: ' + (meta.hour || '-') + '<br>' +
                      '요금: ' + (meta.fee || '-') +
                    '</div>' +
                  '</div>'
                );
                info.open(map, marker);
                cancelCenterJob();
            }
            kakao.maps.event.addListener(map, 'click', ()=>{ info.close(); });

            function genDummy(lng,lat,n=10,rKm=2.5){
                const types=['노상','노외','부설']; const owners=['공영','민영']; const out=[];
                for(let i=0;i<n;i++){
                    const ang=Math.random()*Math.PI*2, r=Math.random()*rKm;
                    const dy=(r/111)*Math.sin(ang), dx=(r/(111*Math.cos(lat*Math.PI/180)))*Math.cos(ang);
                    out.push({
                        id: 'DM-' + (i+1), nm: '더미 주차장 ' + (i+1),
                        type: types[i%types.length], owner: owners[i%owners.length],
                        cap:{ total: 20+(i*3)%80, disabled:(i*2)%6, compact:(i*3)%10, ev:(i*4)%8, pregnant:(i*5)%5 },
                        hour:'연중무휴 24시간', fee: (i%2?'유료(30분 1000원)':'무료'),
                        lng: lng+dx, lat: lat+dy
                    });
                }
                return out;
            }

            function setDummyOnce(lat,lng){
                if(prkMarkers.length) return;
                genDummy(lng,lat,10,2.5).forEach(r=>{
                    const mk = new kakao.maps.Marker({ map, position: new kakao.maps.LatLng(r.lat,r.lng), image: prkImage });
                    mk._meta = r;
                    prkMarkers.push({ marker:mk, lat:r.lat, lng:r.lng, meta:r });
                    kakao.maps.event.addListener(mk, 'click', ()=>{
                        openInfo(mk, r);
                        cancelCenterJob();
                        runAsProgrammatic(()=> map.panTo(new kakao.maps.LatLng(r.lat,r.lng)));
                    });
                });
                applyRadiusFilter(); rebuildList();
            }

            function applyRadiusFilter(){
                if(!meState.latlng) return;
                const me = { lat: meState.latlng.getLat(), lng: meState.latlng.getLng() };
                prkMarkers.forEach(obj=>{
                    const d = haversineKm(me, {lat:obj.lat, lng:obj.lng});
                    obj._dist = d;
                    obj.marker.setMap(d <= radiusState.rKm ? map : null);
                });
            }

            const listEl = $('#list');
            function rebuildList(){
                if(!meState.latlng){ listEl.innerHTML=''; adjustListHeight(); return; }
                const me = { lat: meState.latlng.getLat(), lng: meState.latlng.getLng() };
                const items = prkMarkers
                    .map(o=>({ o, d: haversineKm(me, {lat:o.lat,lng:o.lng}) }))
                    .filter(x=> x.d <= radiusState.rKm)
                    .sort((a,b)=> a.d - b.d)
                    .map((x,i)=> ({ i, d:x.d, meta:x.o.meta, marker:x.o.marker }));

                listEl.innerHTML = items.map(function(r){
                  return (
                    '<div class="card" data-id="' + r.meta.id + '">' +
                      '<div class="nm">' + (r.i + 1) + '. ' + r.meta.nm + '</div>' +
                      '<div class="sub">' +
                        '<span class="badge">' + r.meta.type + '</span>' +
                        '<span class="badge">' + r.meta.owner + '</span>' +
                        '<span class="badge">' + r.d.toFixed(2) + 'km</span>' +
                      '</div>' +
                      '<div class="sub">총:' + r.meta.cap.total + ' / 장애:' + r.meta.cap.disabled + ' / 경차:' + r.meta.cap.compact + ' / EV:' + r.meta.cap.ev + ' / 임산부:' + r.meta.cap.pregnant + '</div>' +
                    '</div>'
                  );
                }).join('');

                listEl.querySelectorAll('.card').forEach(el=>{
                    el.addEventListener('click', ()=>{
                        const id = el.getAttribute('data-id');
                        const obj = prkMarkers.find(x=>x.meta.id===id);
                        if(!obj) return;
                        openInfo(obj.marker, obj.meta);
                        cancelCenterJob();
                        runAsProgrammatic(()=> map.panTo(new kakao.maps.LatLng(obj.lat,obj.lng)));
                    });
                });
                adjustListHeight();
            }

            function adjustListHeight(){
                const grid = $('#list'), wrap = $('#listWrap');
                const first = grid.querySelector('.card');
                if(!first){ wrap.style.maxHeight = '0px'; return; }
                const cardH = first.getBoundingClientRect().height;
                const gap = parseFloat(getComputedStyle(grid).gap) || 8;
                const visibleRows = 2, padding = 8*2;
                const maxH = cardH * visibleRows + gap * (visibleRows - 1) + padding;
                wrap.style.maxHeight = Math.ceil(maxH) + 'px';
            }

            function fitBounds(){
                const bounds = new kakao.maps.LatLngBounds();
                if(meState.latlng) bounds.extend(meState.latlng);
                prkMarkers.forEach(p=>{
                    if(!meState.latlng){ bounds.extend(new kakao.maps.LatLng(p.lat,p.lng)); return; }
                    const d = haversineKm({lat:meState.latlng.getLat(),lng:meState.latlng.getLng()}, {lat:p.lat,lng:p.lng});
                    if(d <= radiusState.rKm) bounds.extend(new kakao.maps.LatLng(p.lat,p.lng));
                });
                if(!bounds.isEmpty()){
                    const padB = Math.ceil($('#bottom').getBoundingClientRect().height + 20);
                    runAsProgrammatic(()=> map.setBounds(bounds, 20, 20, padB, 20));
                }
            }

            // === 현재 위치: 로드/버튼에서만 1회 이동 ===
            function inKorea(lng, lat){ return lng>124 && lng<132 && lat>32 && lat<39; }
            function coerceLngLat(rawLng, rawLat){
                let lng = Number(rawLng), lat = Number(rawLat);
                const looksSwapped = (Math.abs(lng) <= 90 && Math.abs(lat) > 90) || (!inKorea(lng,lat) && inKorea(lat,lng));
                if(looksSwapped){ const t=lng; lng=lat; lat=t; }
                return { lng, lat };
            }

            let didCenterOnce = false; // 맵 로드 후 1회만 재중심

            function locateWatch(){
                const host = location.hostname;
                const isLocal = host==='localhost'||host==='127.0.0.1'||host==='::1'||/^192\.168\.\d+\.\d+$/.test(host)||/\.local$/.test(host);
                const httpsOk = location.protocol==='https:' || isLocal;
                if(!httpsOk){ warn('현재위치는 HTTPS 또는 localhost/내부IP에서만 동작'); return; }
                if(!('geolocation' in navigator)){ warn('이 브라우저는 Geolocation 미지원'); return; }

                navigator.geolocation.getCurrentPosition(
                    p=>{
                        const f = coerceLngLat(p.coords.longitude, p.coords.latitude);
                        updateMe(f.lat, f.lng, p.coords.accuracy||0);
                        radCircle.setRadius(radiusState.rKm*1000);
                        setDummyOnce(f.lat, f.lng);

                        // ✅ 초기 로딩 시 1회만 지도 중심 이동
                        if(!didCenterOnce){
                            cancelCenterJob();
                            recenterToMe(true);
                            didCenterOnce = true;
                        }

                        ok('위치 확인 · ' + f.lat.toFixed(5) + ', ' + f.lng.toFixed(5));
                        startWatch();
                    },
                    e=>{
                        warn('위치 권한 거부/오류: 기본 위치로 표시');
                        const fb = { lat: 37.5665, lng: 126.9780 };
                        updateMe(fb.lat, fb.lng, 1000);
                        radCircle.setRadius(radiusState.rKm*1000);
                        setDummyOnce(fb.lat, fb.lng);
                    },
                    { enableHighAccuracy:true, maximumAge:0, timeout:8000 }
                );
            }

            // 위치 변경 모니터링: 지도 중심은 바꾸지 않음(요구사항)
            function startWatch(){
                navigator.geolocation.watchPosition(
                    p=>{
                        const f = coerceLngLat(p.coords.longitude, p.coords.latitude);
                        updateMe(f.lat, f.lng, p.coords.accuracy||0);
                        applyRadiusFilter(); rebuildList(); // 목록/반경만 갱신
                    },
                    ()=>{},
                    { enableHighAccuracy:true, maximumAge:2000, timeout:10000 }
                );
            }

            locateWatch();
            ok('Kakao 지도 준비 완료');
        }

        // autoload=false → SDK 준비 후 실행
        function waitAndLoad(){
            let tried = 0;
            const t = setInterval(() => {
                tried++;
                if (window.kakao && kakao.maps && typeof kakao.maps.load === 'function') {
                    clearInterval(t);
                    kakao.maps.load(initMapApp);
                } else if (tried === 60) {
                    clearInterval(t);
                    warn('Kakao SDK 로드 실패: 콘솔 도메인/네트워크 확인');
                    logERR('[KAKAO] SDK not loaded within timeout','https://dapi.kakao.com/v2/maps/sdk.js');
                }
            }, 50);
        }
        waitAndLoad();
    });
</script>
</body>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
</html>