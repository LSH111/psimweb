/* offparking.js — 노상주차장 상세 페이지 전용 */

// ========== 유틸 ==========
const $  = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));
function params(){ const sp=new URLSearchParams(location.search); return new Proxy({}, {get:(_,k)=> sp.get(k)||''}); }
function num(v){ const n=parseInt((v||'').toString().replace(/[^0-9]/g,''),10); return Number.isFinite(n)&&n>=0?n:0; }
const p = params();

// ========== 기본 필드 ==========
const f_id=$('#f_id'), f_name=$('#f_name'), f_status=$('#f_status'), f_type=$('#f_type');
const f_sido=$('#f_sido'), f_sigungu=$('#f_sigungu'), f_emd=$('#f_emd');
const f_addrJ=$('#f_addr_jibun'), f_addrR=$('#f_addr_road');
const f_lat=$('#f_lat'), f_lng=$('#f_lng');
const v_id=$('#v_id'), v_name=$('#v_name'), v_addr=$('#v_addr');

// 초기 주입 (샘플 + 쿼리스트링)
const sample={ id:'PRK-0002', name:'연남로 노상', status:'PENDING', sido:'서울특별시', sigungu:'마포구', emd:'연남동', addrJ:'서울 마포구 연남동 123-45', addrR:'서울 마포구 연남로 123' };
if (f_id)     f_id.value   = p.id||sample.id;
if (f_name)   f_name.value = p.name||sample.name;
if (f_status) f_status.value = p.status||sample.status;
if (f_type)   f_type.value = '노상';
if (f_sido)   f_sido.value = p.sido||sample.sido;
if (f_sigungu)f_sigungu.value = p.sigungu||sample.sigungu;
if (f_emd)    f_emd.value  = p.emd||sample.emd;
if (f_addrJ)  f_addrJ.value = p.jibun||p.addr||sample.addrJ;
if (f_addrR)  f_addrR.value = p.road||sample.addrR;
if (v_id)     v_id.textContent = f_id?.value || '';
if (v_name)   v_name.textContent = f_name?.value || '노상주차장 상세';
updateHeaderAddr();

// ========== 주소찾기 레이어 ==========
const layer=$('#postcodeLayer'), container=$('#postcodeContainer');
$('#btnFindAddr')?.addEventListener('click', ()=>{
    if(!layer || !container) return;
    layer.style.display='block';
    container.innerHTML='';
    new daum.Postcode({
        oncomplete(data){
            const road = data.roadAddress || data.address || '';
            const jibun = data.jibunAddress || data.autoJibunAddress || data.address || '';
            if (f_addrJ) f_addrJ.value = jibun;
            if (f_addrR) f_addrR.value = road;
            updateHeaderAddr();
            layer.style.display='none';
        }, width:'100%', height:'100%'
    }).embed(container);
});
$('#postcodeClose')?.addEventListener('click', ()=>{ if(layer) layer.style.display='none'; });
layer?.addEventListener('click', (e)=>{ if(e.target===layer) layer.style.display='none'; });

// ========== 사진 업로드/좌표 ==========
const inLib=$('#f_photo_lib'), inCam=$('#f_photo_cam');
$('#btnPickFromLibrary')?.addEventListener('click', ()=> inLib?.click());
$('#btnTakePhoto')?.addEventListener('click', ()=> inCam?.click());
$('#btnUseGeolocation')?.addEventListener('click', async ()=>{
    const c=await geoFromDevice(); if(c && f_lat && f_lng){ f_lat.value=c.lat.toFixed(6); f_lng.value=c.lng.toFixed(6); }
});
$('#btnClearPhoto')?.addEventListener('click', ()=>{
    if(inLib) inLib.value=''; if(inCam) inCam.value='';
    $('#preview')?.removeAttribute('src');
    if (f_lat) f_lat.value=''; if (f_lng) f_lng.value='';
});
inLib?.addEventListener('change', (e)=> handleFiles(e.target.files, 'lib'));
inCam?.addEventListener('change', (e)=> handleFiles(e.target.files, 'cam'));

async function handleFiles(list, mode){
    const file=list && list[0]; if(!file) return;
    try{ $('#preview').src=URL.createObjectURL(file); }catch(_){}
    if(mode==='cam'){
        const c=await geoFromDeviceSilent();
        if(c && f_lat && f_lng){ f_lat.value=c.lat.toFixed(6); f_lng.value=c.lng.toFixed(6); }
        return;
    }
    try{
        let coords=null;
        if(window.exifr){
            try{
                const g=await exifr.gps(file);
                if(g && typeof g.latitude==='number' && typeof g.longitude==='number') coords={lat:g.latitude,lng:g.longitude};
            }catch(_){}
        }
        if(!coords && (/jpe?g$/i.test(file.name) || file.type==='image/jpeg')){
            try{ coords=await readJpegGpsSafe(file); }catch(_){}
        }
        if(coords && f_lat && f_lng){ f_lat.value=Number(coords.lat).toFixed(6); f_lng.value=Number(coords.lng).toFixed(6); }
    }catch(err){ console.error(err); }
}

async function geoFromDeviceSilent(){
    if(!('geolocation' in navigator) || !isSecureContext) return null;
    try{
        const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true, timeout:8000, maximumAge:0}));
        return {lat:p.coords.latitude, lng:p.coords.longitude};
    }catch(_){
        try{
            const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:false, timeout:12000, maximumAge:0}));
            return {lat:p.coords.latitude, lng:p.coords.longitude};
        }catch(__){ return null; }
    }
}
async function geoFromDevice(){
    if(!('geolocation' in navigator)) { alert('이 브라우저는 위치 기능을 지원하지 않습니다.'); return null; }
    if(!isSecureContext) { alert('HTTPS 또는 http://localhost 에서만 위치 사용 가능'); return null; }
    try{
        const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true, timeout:8000, maximumAge:0}));
        return {lat:p.coords.latitude, lng:p.coords.longitude};
    }catch(e1){
        try{
            const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:false, timeout:12000, maximumAge:0}));
            return {lat:p.coords.latitude, lng:p.coords.longitude};
        }catch(e2){ alert('위치 확인 실패'); return null; }
    }
}

// ========== JPEG EXIF 보조 파서(안전/간단) ==========
function u16(v,o,le){ return v.getUint16(o, !!le); }
function u32(v,o,le){ return v.getUint32(o, !!le); }
async function readJpegGpsSafe(file){
    const buf=await file.arrayBuffer(); const v=new DataView(buf);
    if(v.byteLength<4 || v.getUint16(0)!==0xFFD8) return null;
    let off=2;
    while(off+4<=v.byteLength){
        const marker=v.getUint16(off); off+=2;
        if((marker&0xFFF0)!==0xFFE0) break;
        const size=v.getUint16(off); off+=2;
        const next=off+size-2; if(next>v.byteLength) break;
        if(marker===0xFFE1){
            if(off+6<=v.byteLength && v.getUint32(off)===0x45786966){
                const c=parseExifForGps(v,off+6); if(c) return c;
            }
        }
        off=next;
    }
    return null;
    function parseExifForGps(view,tiff){
        if(tiff+8>view.byteLength) return null;
        const endian=view.getUint16(tiff), le=endian===0x4949; if(!le && endian!==0x4D4D) return null;
        const ifd0=tiff+u32(view,tiff+4,le); if(!rng(ifd0,2)) return null;
        const n=u16(view,ifd0,le); let gpsPtr=0;
        for(let i=0;i<n;i++){
            const e=ifd0+2+i*12; if(!rng(e,12)) return null;
            const tag=u16(view,e,le);
            if(tag===0x8825){ gpsPtr=tiff+u32(view,e+8,le); break; }
        }
        if(!gpsPtr || !rng(gpsPtr,2)) return null;
        const m=u16(view,gpsPtr,le); let latRef='N',lonRef='E',lat=null,lon=null;
        for(let i=0;i<m;i++){
            const e=gpsPtr+2+i*12; if(!rng(e,12)) break;
            const tag=u16(view,e,le), type=u16(view,e+2,le), cnt=u32(view,e+4,le);
            const ofsRel=u32(view,e+8,le); const ptr=(cnt<=4)?(e+8):(tiff+ofsRel);
            if((tag===0x0001||tag===0x0003)&&type===2&&cnt>=2){
                if(rng(ptr,1)){
                    const ch=String.fromCharCode(view.getUint8(ptr));
                    if(tag===0x0001)latRef=ch; if(tag===0x0003)lonRef=ch;
                }
            }
            if((tag===0x0002||tag===0x0004)&&type===5&&cnt===3){
                const p=tiff+ofsRel; if(!rng(p,24)) continue;
                const d=u32(view,p,le), m2=u32(view,p+8,le), s=u32(view,p+16,le);
                const dd=(d/(u32(view,p+4,le)||1)), mm=(m2/(u32(view,p+12,le)||1)), ss=(s/(u32(view,p+20,le)||1));
                const dec=dd + (mm/60) + (ss/3600);
                if(tag===0x0002) lat=dec; else if(tag===0x0004) lon=dec;
            }
        }
        if(lat!=null&&lon!=null){ if(latRef==='S')lat=-lat; if(lonRef==='W')lon=-lon; return {lat,lng:lon}; }
        return null;
    }
    function rng(s,l){ return s>=0 && (s+(l||0))<=v.byteLength; }
}

// ========== 라디오/체크 토글 ==========
const ownRadios=[...document.querySelectorAll('input[name="own"]')];
const ownWrap=$('#own_company_wrap'), ownCompany=$('#f_own_company');
ownRadios.forEach(r=>r.addEventListener('change', ()=>{
    const isPrivate = (r.value==='민간위탁' && r.checked);
    if (ownWrap) ownWrap.hidden = !isPrivate;
    if(!isPrivate && ownCompany) ownCompany.value='';
}));

// 운영시간(주간) 세부
const chkDay=$('#chk_day'), dayDetail=$('#day_detail_wrap');
function syncDay(){ if(dayDetail) dayDetail.hidden = !chkDay?.checked; }
chkDay?.addEventListener('change', syncDay);
syncDay();

// ========== 면수 합계/검증 ==========
const totalInput = $('#f_totalStalls');
const ctlTotal   = $('#ctl_total');
const disInput   = $('#f_st_dis');
const smallInput = $('#f_st_small');
const greenInput = $('#f_st_green');
const pregInput  = $('#f_st_preg');
const autoSumEl  = $('#autoSum');
const msgEl      = $('#stallsMsg');

function detailSum(){
    return num(disInput?.value)+num(smallInput?.value)+num(greenInput?.value)+num(pregInput?.value);
}
function setWarn(on, text){
    ctlTotal?.classList.toggle('warn', !!on);
    if (msgEl){
        msgEl.textContent = text || '';
        msgEl.classList.toggle('warn', !!on);
        msgEl.classList.toggle('ok', !on && !!text);
    }
}
function recompute(){
    const sum = detailSum();
    if (autoSumEl?.checked){
        if (totalInput) totalInput.value = sum;
        setWarn(false, sum ? `세부합 ${sum.toLocaleString()}면 자동반영` : '');
    }else{
        const total = num(totalInput?.value);
        if(total !== sum){
            const diff = total - sum;
            setWarn(true, `세부합 ${sum.toLocaleString()}면 ≠ 총 ${total.toLocaleString()}면 (차이 ${diff>0?'+':''}${diff})`);
        }else if(total || sum){
            setWarn(false, `세부합과 총면수가 일치합니다 (${sum.toLocaleString()}면)`);
        }else{
            setWarn(false, '');
        }
    }
}
[disInput, smallInput, greenInput, pregInput].forEach(el=> el?.addEventListener('input', recompute));
totalInput?.addEventListener('input', recompute);
autoSumEl?.addEventListener('change', recompute);
recompute();

// ========== 헤더 주소 ==========
function updateHeaderAddr(){
    const j=f_addrJ?.value?.trim(); const r=f_addrR?.value?.trim();
    if (v_addr) v_addr.textContent = (j||r) ? ' · '+[j,r].filter(Boolean).join(' / ') : '';
}

// ========== 운영방식 & 요금 섹션 제어 ==========
const opTypeRadios = $$('input[name="opType"]');
const resWrap    = $('#res_fee_wrap');      // 거주자우선 요금 섹션
const normalWrap = $('#normal_fee_wrap');   // 일반노상(승용차/일반) 요금 섹션

// 일반노상(승용차/일반) 요금 필드
const f_fee_first30  = $('#f_fee_first30');
const f_fee_per10    = $('#f_fee_per10');
const f_fee_per60    = $('#f_fee_per60');
const f_fee_daily    = $('#f_fee_daily');
const f_fee_monthly  = $('#f_fee_monthly');
const f_fee_halfyear = $('#f_fee_halfyear');

// 거주자우선 요금 필드
const f_res_all   = $('#f_res_all');
const f_res_day   = $('#f_res_day');
const f_res_full  = $('#f_res_full');
const f_res_night = $('#f_res_night');

function syncFeeSections(){
    const v = (opTypeRadios.find(r=>r.checked)?.value) || '';

    if (resWrap)    resWrap.hidden    = true;
    if (normalWrap) normalWrap.hidden = true;

    if (v === '일반노상주차장') {
        if (normalWrap) normalWrap.hidden = false;
    } else if (v === '거주자우선주차장') {
        if (resWrap) resWrap.hidden = false;
    } else if (v === '일반노상주차장+거주자우선주차장') {
        if (resWrap)    resWrap.hidden    = false;
        if (normalWrap) normalWrap.hidden = false; // 거주자우선 아래 일반노상
    }
}
opTypeRadios.forEach(r=> r.addEventListener('change', syncFeeSections));
syncFeeSections();

// ===== 요금 지불방식 처리 =====
// 요금 지불방식
const payChecks   = Array.from(document.querySelectorAll('input[name="payMethod"]'));
const payEtcChk   = document.getElementById('pay_etc_chk');
const payEtcInput = document.getElementById('pay_etc_input');

// 기타 체크박스 ↔ 입력창 활성/비활성
if (payEtcChk && payEtcInput) {
    payEtcChk.addEventListener('change', () => {
        const on = payEtcChk.checked;
        payEtcInput.disabled = !on;
        if (!on) payEtcInput.value = '';
        if (on) payEtcInput.focus();
    });
}

// (선택 사항) 저장 시 쓸 헬퍼
function getPayMethods() {
    const base = payChecks.filter(el => el.checked).map(el => el.value);
    if (payEtcChk?.checked) {
        const etc = (payEtcInput?.value || '').trim();
        if (etc) base.push(etc); // 기타 내용이 있으면 포함
    }
    return base;
}

// 선택값 수집
function collectPayMethods(){
    const vals = payChecks.filter(c => c.checked).map(c => c.value);
    if (payEtcChk?.checked) {
        const t = (payEtcInput?.value || '').trim();
        // 텍스트가 있으면 '기타:내용' 형태로 저장
        if (t) vals.push(`기타:${t}`);
        else if (!vals.includes('기타')) vals.push('기타'); // 내용 없이 기타만
    }
    return vals;
}

// ========== 저장 ==========
function buildPayload(){
    const own = (ownRadios.find(r=>r.checked)||{}).value || '';
    const selectedOp = (opTypeRadios.find(r=>r.checked)?.value) || '';

    const payload={
        id:f_id?.value, name:f_name?.value, status:f_status?.value, type:'노상',
        sido:f_sido?.value, sigungu:f_sigungu?.value, emd:f_emd?.value,
        addrJibun:f_addrJ?.value, addrRoad:f_addrR?.value, lat:f_lat?.value, lng:f_lng?.value,

        totalStalls: num(totalInput?.value),
        stalls:{
            disabled:num(disInput?.value),
            compact:num(smallInput?.value),
            eco:num(greenInput?.value),
            pregnant:num(pregInput?.value)
        },
        autoTotalFromDetail: !!(autoSumEl && autoSumEl.checked),

        ownerType: own,
        ownerCompany: (own==='민간위탁') ? ($('#f_own_company')?.value||'') : '',
        manager:{ name:$('#f_mgr_name')?.value||'', tel:$('#f_mgr_tel')?.value||'' },

        oddEven: $('#f_oddEven')?.value||'',

        operationType: selectedOp,
        times:{ day:$('#chk_day')?.checked||false, night:$('#chk_night')?.checked||false },
        dayDetail: ($('#chk_day')?.checked)
            ? { grade: $('#f_day_grade')?.value||'', feeType: $('#f_day_feeType')?.value||'' }
            : null,

        // 운영방식에 따른 요금 포함
        residentFees: (selectedOp.includes('거주자우선주차장')) ? {
            all:   num(f_res_all?.value),
            day:   num(f_res_day?.value),
            full:  num(f_res_full?.value),
            night: num(f_res_night?.value)
        } : null,

        normalStreetFees: (selectedOp.includes('일반노상주차장')) ? {
            first30:  num(f_fee_first30?.value),
            per10:    num(f_fee_per10?.value),
            per60:    num(f_fee_per60?.value),
            daily:    num(f_fee_daily?.value),
            monthly:  num(f_fee_monthly?.value),
            halfyear: num(f_fee_halfyear?.value)
        } : null,

        payMethods: collectPayMethods(),  // 추가
    };

    return payload;
}

function doSave(){
    if (autoSumEl && !autoSumEl.checked){
        const sum = detailSum();
        const total = num(totalInput?.value);
        if(total !== sum){
            alert('총면수와 세부면수의 합이 일치하지 않습니다. 확인해주세요.');
            return;
        }
    }
    const payload = buildPayload();
    console.log('SAVE(offstreet):', payload);
    alert('샘플 저장 완료(콘솔 확인). 실제 API로 교체하세요.');
}

$('#btnSave')?.addEventListener('click', doSave);
$('#btnSaveTop')?.addEventListener('click', doSave);