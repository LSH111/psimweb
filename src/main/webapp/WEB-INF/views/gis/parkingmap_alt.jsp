<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8"/>
    <title>주차장 지도(대안)</title>
    <style>
        html, body {width:100%; height:100%; margin:0; padding:0; overflow:hidden;}
        #map {width:100%; height:100%; position:relative;}
        .mode-toggle {position:absolute; top:16px; left:16px; z-index:20; display:flex; gap:8px;}
        .mode-toggle button {padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; background:white; cursor:pointer;}
        .mode-toggle button.active {background:#2563eb; color:white; border-color:#1d4ed8;}
        .radius-group {position:absolute; bottom:90px; right:16px; z-index:20; display:flex; gap:6px;}
        .radius-group .radius-btn {padding:8px 10px; background:white; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer;}
        .radius-group .radius-btn.active {background:#2563eb; color:white; border-color:#1d4ed8;}
        .status {position:absolute; bottom:16px; left:50%; transform:translateX(-50%); background:white; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; z-index:20; display:none;}
        .search-panel {position:absolute; top:16px; right:16px; z-index:20; background:white; padding:12px; border:1px solid #e2e8f0; border-radius:10px; width:260px; box-shadow:0 6px 18px rgba(0,0,0,0.1);} 
        .search-panel select, .search-panel button {width:100%; margin-top:6px; padding:8px;}
    </style>
    <script>
        const contextPath = '${pageContext.request.contextPath}';
    </script>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=services,clusterer,geometry"></script>
</head>
<body>
<div id="map"></div>

<div class="mode-toggle">
    <button type="button" id="btnNationwide" class="active">전국 보기</button>
    <button type="button" id="btnNearby">내 주변</button>
</div>

<div class="radius-group" id="radiusGroup" style="display:none;">
    <button type="button" class="radius-btn" data-radius="500">500m</button>
    <button type="button" class="radius-btn" data-radius="1000">1km</button>
    <button type="button" class="radius-btn" data-radius="1500">1.5km</button>
</div>

<div class="search-panel" id="searchPanel">
    <select id="sido"><option value="">시도 선택</option></select>
    <select id="sigungu" disabled><option value="">시군구 선택</option></select>
    <div style="margin-top:6px;">
        <label style="font-size:12px;color:#475569;display:block;margin-bottom:4px;">주차장 형태(전국 보기)</label>
        <div id="typeFilter" style="display:flex; gap:6px; flex-wrap:wrap;">
            <label><input type="radio" name="prkType" value="" checked/> 전체</label>
            <label><input type="radio" name="prkType" value="1"/> 노상</label>
            <label><input type="radio" name="prkType" value="2"/> 노외</label>
            <label><input type="radio" name="prkType" value="3"/> 부설</label>
        </div>
    </div>
    <button type="button" id="btnSearch">주차장 검색</button>
    <div id="statusFilter" style="margin-top:8px; display:none;">
        <label style="font-size:12px;color:#475569;display:block;margin-bottom:4px;">진행상태(내 주변)</label>
        <select id="statusSelect">
            <option value="">전체</option>
            <option value="10">조사중</option>
            <option value="20">승인대기</option>
            <option value="30">승인완료</option>
        </select>
    </div>
</div>

<div class="status" id="statusMsg"></div>

<script>
    let map, geocoder, markers = [], clusterer, myLocMarker, myAccCircle, watchId = null, radiusCircle = null;
    let mode = 'nationwide';

    function showStatus(text) {
        const el = document.getElementById('statusMsg');
        el.textContent = text;
        el.style.display = 'block';
        setTimeout(()=> el.style.display='none', 3000);
    }

    function clearMarkers() {
        if (clusterer) clusterer.clear();
        markers.forEach(m => m.setMap(null));
        markers = [];
    }

    function fetchJson(url, params={}) {
        const qs = new URLSearchParams(params).toString();
        return fetch(contextPath + url + (qs ? '?' + qs : '')).then(r=>r.json());
    }

    function loadSido() {
        return fetchJson('/cmm/codes/sido').then(res=>{
            const sel = document.getElementById('sido');
            res.data?.forEach(it=>{
                const opt = document.createElement('option');
                opt.value = it.codeCd; opt.textContent = it.codeNm;
                sel.appendChild(opt);
            });
        });
    }
    function loadSigungu(sidoCd) {
        const sel = document.getElementById('sigungu');
        sel.innerHTML = '<option value="">시군구 선택</option>';
        sel.disabled = !sidoCd;
        if (!sidoCd) return;
        fetchJson('/cmm/codes/sigungu', {sidoCd}).then(res=>{
            res.data?.forEach(it=>{
                const opt=document.createElement('option');
                opt.value=it.codeCd; opt.textContent=it.codeNm;
                sel.appendChild(opt);
            });
        });
    }

    function renderParking(list) {
        clearMarkers();
        const kakaoMarkers = list.filter(p=>p.prkPlceLat && p.prkPlceLon).map(p=>{
            const m = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(parseFloat(p.prkPlceLat), parseFloat(p.prkPlceLon)),
                title: p.prkplceNm
            });
            return m;
        });
        markers = kakaoMarkers;
        if (!clusterer) {
            clusterer = new kakao.maps.MarkerClusterer({ map, averageCenter:true, minLevel:7 });
        }
        clusterer.addMarkers(kakaoMarkers);
    }

    function searchNationwide() {
        const sido = document.getElementById('sido').value;
        const sigungu = document.getElementById('sigungu').value;
        const prkType = document.querySelector('input[name=\"prkType\"]:checked')?.value || '';
        fetchJson('/prk/parking-map-data', {sidoCd: sido, sigunguCd: sigungu, prkPlceType: prkType}).then(res=>{
            renderParking(res.list || []);
            if (geocoder) {
                const parts=[]; if(sido) parts.push(document.getElementById('sido').selectedOptions[0].text);
                if(sigungu) parts.push(document.getElementById('sigungu').selectedOptions[0].text);
                const q=parts.join(' ');
                if(q) geocoder.addressSearch(q,(result,status)=>{
                    if(status===kakao.maps.services.Status.OK && result[0]) {
                        map.setCenter(new kakao.maps.LatLng(result[0].y, result[0].x));
                        map.setLevel(sigungu?6:7);
                    }
                });
            }
            var cnt = (res.list && res.list.length) ? res.list.length : 0;
            showStatus('전국 보기: ' + cnt + '건');
        });
    }

    function drawRadius(lat,lng,radius){
        if(radiusCircle) radiusCircle.setMap(null);
        radiusCircle=new kakao.maps.Circle({center:new kakao.maps.LatLng(lat,lng), radius:radius,
            strokeWeight:2, strokeColor:'#2563eb', strokeOpacity:0.8,
            fillColor:'#2563eb', fillOpacity:0.1});
        radiusCircle.setMap(map);
    }

    function searchNearby(lat,lng,radius){
        drawRadius(lat,lng,radius);
        map.setCenter(new kakao.maps.LatLng(lat,lng));
        map.setLevel(5);
        // 반경 검색 API가 없으면 기존 데이터 필터로 대체 가능
        const statusVal = document.getElementById('statusSelect')?.value || '';
        fetchJson('/prk/parking-map-data').then(res=>{
            const filtered=(res.list||[]).filter(p=>{
                if(!p.prkPlceLat||!p.prkPlceLon) return false;
                const dist=kakao.maps.geometry.spherical.computeDistanceBetween(
                    new kakao.maps.LatLng(lat,lng),
                    new kakao.maps.LatLng(parseFloat(p.prkPlceLat), parseFloat(p.prkPlceLon))
                );
                if (dist>radius) return false;
                if (statusVal && p.prgsStsCd !== statusVal) return false;
                return true;
            });
            renderParking(filtered);
            showStatus('내 주변 ' + (radius>=1000?radius/1000+'km':radius+'m') + ': ' + filtered.length + '건');
        });
    }

    function init() {
        map = new kakao.maps.Map(document.getElementById('map'), {
            center: new kakao.maps.LatLng(37.5665,126.9780), level:5
        });
        geocoder = new kakao.maps.services.Geocoder();
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

        loadSido();
        document.getElementById('sido').addEventListener('change', e=>loadSigungu(e.target.value));
        function switchToNationwide() {
            mode='nationwide';
            document.getElementById('btnNationwide').classList.add('active');
            document.getElementById('btnNearby').classList.remove('active');
            document.getElementById('radiusGroup').style.display='none';
            document.getElementById('typeFilter').style.display='flex';
            document.getElementById('statusFilter').style.display='none';
            searchNationwide();
        }

        function switchToNearby() {
            mode='nearby';
            document.getElementById('btnNearby').classList.add('active');
            document.getElementById('btnNationwide').classList.remove('active');
            document.getElementById('radiusGroup').style.display='flex';
            document.getElementById('typeFilter').style.display='none';
            document.getElementById('statusFilter').style.display='block';
            navigator.geolocation.getCurrentPosition(pos=>{
                const lat=pos.coords.latitude, lng=pos.coords.longitude;
                const firstBtn=document.querySelector('.radius-btn');
                if(firstBtn){
                    document.querySelectorAll('.radius-btn').forEach(b=>b.classList.remove('active'));
                    firstBtn.classList.add('active');
                    const radius=parseInt(firstBtn.dataset.radius,10);
                    searchNearby(lat,lng,radius);
                }
                if(!myLocMarker){
                    myLocMarker=new kakao.maps.Marker({position:new kakao.maps.LatLng(lat,lng)});
                } else {
                    myLocMarker.setPosition(new kakao.maps.LatLng(lat,lng));
                }
                myLocMarker.setMap(map);
            }, ()=>{
                showStatus('현재 위치를 가져올 수 없습니다.', 'error');
            });
        }

        document.getElementById('btnSearch').addEventListener('click', switchToNationwide);
        document.getElementById('btnNationwide').addEventListener('click', switchToNationwide);
        document.getElementById('btnNearby').addEventListener('click', switchToNearby);

        document.querySelectorAll('.radius-btn').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                if(mode!=='nearby') return;
                if(!myLocMarker || !myLocMarker.getPosition()) {
                    showStatus('현재 위치를 먼저 확인하세요.');
                    return;
                }
                document.querySelectorAll('.radius-btn').forEach(b=>b.classList.remove('active'));
                btn.classList.add('active');
                const radius=parseInt(btn.dataset.radius,10);
                const pos=myLocMarker.getPosition();
                searchNearby(pos.getLat(), pos.getLng(), radius);
            });
        });

        // 초기 전국 검색
        searchNationwide();
    }

    kakao.maps.load(init);
</script>
</body>
</html>
