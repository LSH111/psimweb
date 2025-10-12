(() => {
    const $ = (s) => document.querySelector(s);
    const params = () => {
        const sp = new URLSearchParams(location.search);
        return new Proxy({}, { get: (_, k) => sp.get(k) || '' });
    };
    const p = params();

    // ===== 요소 참조
    const f_id = $('#f_id'), f_name = $('#f_name'), f_status = $('#f_status'), f_type = $('#f_type');
    const f_sido = $('#f_sido'), f_sigungu = $('#f_sigungu'), f_emd = $('#f_emd');
    const f_addrJ = $('#f_addr_jibun'), f_addrR = $('#f_addr_road');
    const f_lat = $('#f_lat'), f_lng = $('#f_lng');
    const v_id = $('#v_id'), v_name = $('#v_name'), v_addr = $('#v_addr');

    const btnPrint = $('#btnPrint');
    const btnSave = $('#btnSave');
    const btnSaveTop = $('#btnSaveTop');

    // 샘플 바인딩
    const sample = { id:'PRK-0002', name:'연남로 노상', status:'PENDING', sido:'서울특별시', sigungu:'마포구', emd:'연남동', addrJ:'서울 마포구 연남동 123-45', addrR:'서울 마포구 연남로 123' };
    f_id.value = p.id || sample.id;
    f_name.value = p.name || sample.name;
    f_status.value = p.status || sample.status;
    f_type.value = '노상';
    f_sido.value = p.sido || sample.sido;
    f_sigungu.value = p.sigungu || sample.sigungu;
    f_emd.value = p.emd || sample.emd;
    f_addrJ.value = p.jibun || p.addr || sample.addrJ;
    f_addrR.value = p.road || sample.addrR;
    v_id.textContent = f_id.value;
    v_name.textContent = f_name.value || '노상주차장 상세';
    updateHeaderAddr();

    // ===== 주소찾기
    const layer = $('#postcodeLayer'), container = $('#postcodeContainer');
    $('#btnFindAddr')?.addEventListener('click', () => {
        layer.style.display = 'block'; container.innerHTML = '';
        if (typeof daum === 'undefined' || !daum.Postcode) {
            alert('주소검색 스크립트가 로드되지 않았습니다.');
            return;
        }
        new daum.Postcode({
            oncomplete(data){
                const road = data.roadAddress || data.address || '';
                const jibun = data.jibunAddress || data.autoJibunAddress || data.address || '';
                f_addrJ.value = jibun; f_addrR.value = road;
                updateHeaderAddr();
                layer.style.display = 'none';
            },
            width: '100%', height: '100%'
        }).embed(container);
    });
    $('#postcodeClose')?.addEventListener('click', () => layer.style.display = 'none');
    layer?.addEventListener('click', (e) => { if (e.target === layer) layer.style.display = 'none'; });

    // ===== 사진/좌표
    const inLib = $('#f_photo_lib'), inCam = $('#f_photo_cam');
    $('#btnPickFromLibrary')?.addEventListener('click', () => inLib.click());
    $('#btnTakePhoto')?.addEventListener('click', () => inCam.click());
    $('#btnUseGeolocation')?.addEventListener('click', async () => {
        const c = await geoFromDevice(); if (c){ f_lat.value = c.lat.toFixed(6); f_lng.value = c.lng.toFixed(6); }
    });
    $('#btnClearPhoto')?.addEventListener('click', () => {
        inLib.value = ''; inCam.value = ''; $('#preview')?.removeAttribute('src'); f_lat.value=''; f_lng.value='';
    });
    inLib?.addEventListener('change', (e) => handleFiles(e.target.files, 'lib'));
    inCam?.addEventListener('change', (e) => handleFiles(e.target.files, 'cam'));

    async function handleFiles(list, mode){
        const file = list && list[0]; if (!file) return;
        try { $('#preview').src = URL.createObjectURL(file); } catch(_){}
        if (mode === 'cam'){
            const c = await geoFromDeviceSilent();
            if (c){ f_lat.value = c.lat.toFixed(6); f_lng.value = c.lng.toFixed(6); }
            return;
        }
        // 라이브러리에서 고른 사진 → EXIF GPS 시도
        try{
            let coords = null;
            if (window.exifr){
                try{
                    const g = await exifr.gps(file);
                    if (g && typeof g.latitude === 'number' && typeof g.longitude === 'number') coords = { lat:g.latitude, lng:g.longitude };
                }catch(_){}
            }
            if (!coords && (/jpe?g$/i.test(file.name) || file.type === 'image/jpeg')){
                try{ coords = await readJpegGpsSafe(file); }catch(_){}
            }
            if (coords){ f_lat.value = Number(coords.lat).toFixed(6); f_lng.value = Number(coords.lng).toFixed(6); }
        }catch(err){ console.error(err); }
    }

    async function geoFromDeviceSilent(){
        if (!('geolocation' in navigator) || !isSecureContext) return null;
        try{
            const p = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true, timeout:8000, maximumAge:0}));
            return {lat:p.coords.latitude, lng:p.coords.longitude};
        }catch(_){
            try{
                const p = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:false, timeout:12000, maximumAge:0}));
                return {lat:p.coords.latitude, lng:p.coords.longitude};
            }catch(__){ return null; }
        }
    }
    async function geoFromDevice(){
        if (!('geolocation' in navigator)) { alert('이 브라우저는 위치 기능을 지원하지 않습니다.'); return null; }
        if (!isSecureContext) { alert('HTTPS 또는 http://localhost 에서만 위치 사용 가능'); return null; }
        try{
            const p = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true, timeout:8000, maximumAge:0}));
            return {lat:p.coords.latitude, lng:p.coords.longitude};
        }catch(e1){
            try{
                const p = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:false, timeout:12000, maximumAge:0}));
                return {lat:p.coords.latitude, lng:p.coords.longitude};
            }catch(e2){ alert('위치 확인 실패'); return null; }
        }
    }

    // 간단한 JPEG EXIF GPS 파서 (오류 시 무시)
    function u16(v,o,le){ return v.getUint16(o, !!le); }
    function u32(v,o,le){ return v.getUint32(o, !!le); }
    async function readJpegGpsSafe(file){
        const buf = await file.arrayBuffer(); const v = new DataView(buf);
        if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
        let off = 2;
        while (off+4 <= v.byteLength){
            const marker = v.getUint16(off); off += 2;
            if ((marker & 0xFFF0) !== 0xFFE0) break;
            const size = v.getUint16(off); off += 2;
            const next = off + size - 2; if (next > v.byteLength) break;
            if (marker === 0xFFE1){
                if (off+6 <= v.byteLength && v.getUint32(off) === 0x45786966){
                    const c = parseExifForGps(v, off+6); if (c) return c;
                }
            }
            off = next;
        }
        return null;

        function parseExifForGps(view, tiff){
            if (tiff+8 > view.byteLength) return null;
            const endian = view.getUint16(tiff), le = endian === 0x4949; if (!le && endian !== 0x4D4D) return null;
            const ifd0 = tiff + u32(view, tiff+4, le);
            const n = u16(view, ifd0, le); let gpsPtr = 0;
            for (let i=0;i<n;i++){
                const e = ifd0+2+i*12; const tag = u16(view, e, le);
                if (tag === 0x8825){ gpsPtr = tiff + u32(view, e+8, le); break; }
            }
            if (!gpsPtr) return null;
            const m = u16(view, gpsPtr, le); let latRef='N', lonRef='E', lat=null, lon=null;
            for (let i=0;i<m;i++){
                const e = gpsPtr+2+i*12; const tag = u16(view, e, le), type=u16(view,e+2,le), cnt=u32(view,e+4,le);
                const ofsRel=u32(view,e+8,le); const ptr=(cnt<=4)?(e+8):(tiff+ofsRel);
                if ((tag===0x0001||tag===0x0003)&&type===2&&cnt>=2){
                    const ch=String.fromCharCode(view.getUint8(ptr));
                    if (tag===0x0001) latRef=ch; else lonRef=ch;
                }
                if ((tag===0x0002||tag===0x0004)&&type===5&&cnt===3){
                    const p=tiff+ofsRel;
                    const d=u32(view,p,le)/(u32(view,p+4,le)||1);
                    const m2=u32(view,p+8,le)/(u32(view,p+12,le)||1);
                    const s=u32(view,p+16,le)/(u32(view,p+20,le)||1);
                    const dec=d + (m2/60) + (s/3600);
                    if (tag===0x0002) lat=dec; else lon=dec;
                }
            }
            if (lat!=null && lon!=null){ if (latRef==='S') lat=-lat; if (lonRef==='W') lon=-lon; return {lat, lng:lon}; }
            return null;
        }
    }

    // ===== 라디오/체크 토글
    const ownRadios = [...document.querySelectorAll('input[name="own"]')];
    const ownWrap = $('#own_company_wrap'), ownCompany = $('#f_own_company');
    ownRadios.forEach(r => r.addEventListener('change', () => {
        const isPrivate = (r.value === '민간위탁' && r.checked);
        ownWrap.hidden = !isPrivate;
        if (!isPrivate) ownCompany.value = '';
    }));

    const opTypeRadios = [...document.querySelectorAll('input[name="opType"]')];
    const resWrap = $('#res_fee_wrap');
    function syncResWrap(){
        const v = opTypeRadios.find(r=>r.checked)?.value || '';
        resWrap.hidden = !v.includes('거주자우선주차장');
    }
    opTypeRadios.forEach(r => r.addEventListener('change', syncResWrap));
    syncResWrap();

    const chkDay = $('#chk_day'), dayDetail = $('#day_detail_wrap');
    function syncDay(){ dayDetail.hidden = !chkDay.checked; }
    chkDay?.addEventListener('change', syncDay);
    syncDay();

    // ===== 총면수/세부면수 연동 + 미리보기 =====
    const totalInput = document.querySelector('#f_totalStalls');
    const ctlTotal   = document.querySelector('.stalls-total');  // 경고 테두리 표시
    const disInput   = document.querySelector('#f_st_dis');
    const smallInput = document.querySelector('#f_st_small');
    const greenInput = document.querySelector('#f_st_green');
    const pregInput  = document.querySelector('#f_st_preg');
    const autoSumEl  = document.querySelector('#autoSum');
    const msgEl      = document.querySelector('#stallsMsg');
    const previewEl  = document.querySelector('#stallsPreview');

    const num = (v) => {
        const n = parseInt((v||'').toString().replace(/[^0-9]/g,''),10);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    };
    const detailSum = () =>
        num(disInput.value) + num(smallInput.value) + num(greenInput.value) + num(pregInput.value);

    function setWarn(on, text){
        ctlTotal?.classList.toggle('warn', !!on);
        if (msgEl){
            msgEl.textContent = text || '';
            msgEl.classList.toggle('warn', !!on);
            msgEl.classList.toggle('ok', !on && !!text);
        }
    }
    function updatePreview(t, d, s, g, p){
        if (previewEl)
            previewEl.textContent = `총 ${t.toLocaleString()}면 (장애인 ${d}, 경차 ${s}, 친환경 ${g}, 임산부 ${p})`;
    }
    function recompute(){
        const d = num(disInput.value);
        const s = num(smallInput.value);
        const g = num(greenInput.value);
        const p = num(pregInput.value);
        const sum = d + s + g + p;

        if (autoSumEl?.checked){
            totalInput.value = sum;
            setWarn(false, sum ? `세부합 ${sum.toLocaleString()}면 자동반영` : '');
        }else{
            const total = num(totalInput.value);
            if (total !== sum){
                const diff = total - sum;
                setWarn(true, `세부합 ${sum.toLocaleString()}면 ≠ 총 ${total.toLocaleString()}면 (차이 ${diff>0?'+':''}${diff})`);
            }else if (total || sum){
                setWarn(false, `세부합과 총면수가 일치합니다 (${sum.toLocaleString()}면)`);
            }else{
                setWarn(false, '');
            }
        }
        updatePreview(num(totalInput.value), d, s, g, p);
    }

    // 이벤트 바인딩
    [disInput, smallInput, greenInput, pregInput].forEach(el => el?.addEventListener('input', recompute));
    totalInput?.addEventListener('input', recompute);
    autoSumEl?.addEventListener('change', recompute);

    // 초기 계산
    recompute();

    // ===== 헤더 주소
    function updateHeaderAddr(){
        const j=f_addrJ.value?.trim(); const r=f_addrR.value?.trim();
        v_addr.textContent = (j||r) ? ' · '+[j,r].filter(Boolean).join(' / ') : '';
    }
    window.updateHeaderAddr = updateHeaderAddr; // 필요 시 외부에서 재사용

    // ===== 저장
    function doSave(){
        if (!$('#autoSum')?.checked){
            const sum = detailSum(); const total = num(totalInput.value);
            if (total !== sum){ alert('총면수와 세부면수의 합이 일치하지 않습니다.'); return; }
        }
        const own = (document.querySelector('input[name="own"]:checked')||{}).value || '';
        const opType = (document.querySelector('input[name="opType"]:checked')||{}).value || '';
        const payload = {
            id:f_id.value, name:f_name.value, status:f_status.value, type:'노상',
            sido:f_sido.value, sigungu:f_sigungu.value, emd:f_emd.value,
            addrJibun:f_addrJ.value, addrRoad:f_addrR.value, lat:f_lat.value, lng:f_lng.value,
            totalStalls: num(totalInput.value),
            stalls:{ disabled:num(disInput.value), compact:num(smallInput.value), eco:num(greenInput.value), pregnant:num(pregInput.value) },
            autoTotalFromDetail: !!$('#autoSum')?.checked,
            ownerType: own,
            ownerCompany: (own==='민간위탁') ? ($('#f_own_company')?.value||'') : '',
            manager:{ name:$('#f_mgr_name')?.value||'', tel:$('#f_mgr_tel')?.value||'' },
            oddEven: $('#f_oddEven')?.value||'',
            operationType: opType,
            times:{ day:$('#chk_day')?.checked||false, night:$('#chk_night')?.checked||false },
            dayDetail: ($('#chk_day')?.checked) ? { grade: $('#f_day_grade')?.value||'', feeType: $('#f_day_feeType')?.value||'' } : null,
            residentFees: (!$('#res_fee_wrap')?.hidden) ? {
                all:num($('#f_res_all')?.value), day:num($('#f_res_day')?.value),
                full:num($('#f_res_full')?.value), night:num($('#f_res_night')?.value)
            } : null
        };
        console.log('SAVE(offstreet):', payload);
        alert('샘플 저장 완료(콘솔 확인). 실제 API로 교체하세요.');
    }
    btnSave?.addEventListener('click', doSave);
    btnSaveTop?.addEventListener('click', doSave);

    // 인쇄
    btnPrint?.addEventListener('click', () => window.print());
})();