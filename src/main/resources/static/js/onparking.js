/* offparking.js — 노상주차장 상세 페이지 전용 (주간/야간 기능 포함) */

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

// ========== 면수 합계/검증 (항상 자동합계) ==========
const totalInput = $('#f_totalStalls');
const ctlTotal   = $('#ctl_total');
const normalInput = $('#f_st_normal');
const disInput   = $('#f_st_dis');
const smallInput = $('#f_st_small');
const greenInput = $('#f_st_green');
const pregInput  = $('#f_st_preg');
const msgEl      = $('#stallsMsg');

// 총면수는 사람이 수정하지 않도록
if (totalInput) totalInput.readOnly = true;

function detailSum(){
    return num(normalInput?.value)+num(disInput?.value)+num(smallInput?.value)+num(greenInput?.value)+num(pregInput?.value);
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
    if (totalInput) totalInput.value = sum;
}
[normalInput, disInput, smallInput, greenInput, pregInput].forEach(el=> el?.addEventListener('input', recompute));
recompute();

// ========== 헤더 주소 ==========
function updateHeaderAddr(){
    const j=f_addrJ?.value?.trim(); const r=f_addrR?.value?.trim();
    if (v_addr) v_addr.textContent = (j||r) ? ' · '+[j,r].filter(Boolean).join(' / ') : '';
}

// ========== 운영방식 & 요금 섹션 제어 ==========
const opTypeRadios = $$('input[name="opType"]');

function syncFeeSections(){
    const v = (opTypeRadios.find(r=>r.checked)?.value) || '';

    // 주간 섹션들
    const dayResWrap = $('#day_res_fee_wrap');
    const dayNormalWrap = $('#day_normal_fee_wrap');

    // 야간 섹션들
    const nightResWrap = $('#night_res_fee_wrap');
    const nightNormalWrap = $('#night_normal_fee_wrap');

    // 모든 섹션 일단 숨김
    [dayResWrap, dayNormalWrap, nightResWrap, nightNormalWrap].forEach(el => {
        if (el) el.hidden = true;
    });

    // 운영방식에 따라 섹션 표시
    if (v === '일반노상주차장') {
        if (dayNormalWrap) dayNormalWrap.hidden = false;
        if (nightNormalWrap) nightNormalWrap.hidden = false;
    } else if (v === '거주자우선주차장') {
        if (dayResWrap) dayResWrap.hidden = false;
        if (nightResWrap) nightResWrap.hidden = false;
    } else if (v === '일반노상주차장+거주자우선주차장') {
        if (dayResWrap) dayResWrap.hidden = false;
        if (dayNormalWrap) dayNormalWrap.hidden = false;
        if (nightResWrap) nightResWrap.hidden = false;
        if (nightNormalWrap) nightNormalWrap.hidden = false;
    }
}
opTypeRadios.forEach(r=> r.addEventListener('change', syncFeeSections));
syncFeeSections();

// ========== 주간/야간 체크박스 처리 ==========
function setupDayNightSections() {
    const chkDay = $('#chk_day'); //주간
    const chkNight = $('#chk_night'); //야간
    const opTypeWrap = $('#op_type_wrap'); //운영방식

    // 주간 관련 섹션들
    const daySections = [
        '#day_detail_wrap',
        '#day_fee_charge_wrap',
        '#day_fee_level_wrap',
        '#day_fee_pay_wrap',
        '#day_fee_settle_wrap',
        '#day_operation_time_section'
    ];

    // 야간 관련 섹션들
    const nightSections = [
        '#night_detail_wrap',
        '#night_fee_charge_wrap',
        '#night_fee_level_wrap',
        '#night_fee_pay_wrap',
        '#night_fee_settle_wrap',
        '#night_operation_time_section'
    ];

    function toggleSections(sections, isVisible) {
        sections.forEach(selector => {
            const element = $(selector);
            if (element) element.style.display = isVisible ? 'block' : 'none';
        });
    }

    // 운영방식 섹션 표시 여부 체크
    function checkOperationTypeVisibility() {
        const isDayChecked = chkDay?.checked || false;
        const isNightChecked = chkNight?.checked || false;

        // 주간 또는 야간 중 하나라도 선택되면 운영방식 표시
        if (opTypeWrap) {
            opTypeWrap.style.display = (isDayChecked || isNightChecked) ? 'block' : 'none';
        }

        // 둘 다 선택 해제되면 하위 섹션도 모두 숨김
        if (!isDayChecked && !isNightChecked) {
            toggleSections(daySections, false);
            toggleSections(nightSections, false);
        }
    }

    // 주간 체크박스 이벤트
    if (chkDay) {
        chkDay.addEventListener('change', function() {
            toggleSections(daySections, this.checked);
            checkOperationTypeVisibility(); // ✅ 이 줄이 있어야 함
            if (this.checked) syncFeeSections(); // 요금 섹션도 다시 동기화
        });
    }

    // 야간 체크박스 이벤트
    if (chkNight) {
        chkNight.addEventListener('change', function() {
            toggleSections(nightSections, this.checked);
            checkOperationTypeVisibility(); // ✅ 이 줄이 있어야 함
            if (this.checked) syncFeeSections(); // 요금 섹션도 다시 동기화
        });
    }

    // 초기 상태 체크
    checkOperationTypeVisibility();
}

// ========== 시간제운영 처리 함수 ==========
function setupTimeOperationEvents(timeType) {
    // 평일
    const weekdayGroup = $(`#${timeType}_weekday_operation_group`);
    const weekdayTimeInputs = $(`#${timeType}_weekday_time_inputs`);

    if (weekdayGroup && weekdayTimeInputs) {
        weekdayGroup.addEventListener('change', function(e) {
            if (e.target.name === `${timeType}WeekdayOperation`) {
                weekdayTimeInputs.style.display =
                    e.target.value === '시간제운영' ? 'block' : 'none';
            }
        });
    }

    // 토요일
    const saturdayGroup = $(`#${timeType}_saturday_operation_group`);
    const saturdayTimeInputs = $(`#${timeType}_saturday_time_inputs`);

    if (saturdayGroup && saturdayTimeInputs) {
        saturdayGroup.addEventListener('change', function(e) {
            if (e.target.name === `${timeType}SaturdayOperation`) {
                saturdayTimeInputs.style.display =
                    e.target.value === '시간제운영' ? 'block' : 'none';
            }
        });
    }

    // 공휴일
    const holidayGroup = $(`#${timeType}_holiday_operation_group`);
    const holidayTimeInputs = $(`#${timeType}_holiday_time_inputs`);

    if (holidayGroup && holidayTimeInputs) {
        holidayGroup.addEventListener('change', function(e) {
            if (e.target.name === `${timeType}HolidayOperation`) {
                holidayTimeInputs.style.display =
                    e.target.value === '시간제운영' ? 'block' : 'none';
            }
        });
    }
}

// ========== 요금 지불/정산방식 처리 ==========
function setupPaymentMethods() {
    // 주간 요금지불방식
    const dayPayEtcChk = $('#day_pay_etc_chk');
    const dayPayEtcInput = $('#day_pay_etc_input');

    if (dayPayEtcChk && dayPayEtcInput) {
        dayPayEtcChk.addEventListener('change', () => {
            const on = dayPayEtcChk.checked;
            dayPayEtcInput.disabled = !on;
            if (!on) dayPayEtcInput.value = '';
            if (on) dayPayEtcInput.focus();
        });
    }

    // 야간 요금지불방식
    const nightPayEtcChk = $('#night_pay_etc_chk');
    const nightPayEtcInput = $('#night_pay_etc_input');

    if (nightPayEtcChk && nightPayEtcInput) {
        nightPayEtcChk.addEventListener('change', () => {
            const on = nightPayEtcChk.checked;
            nightPayEtcInput.disabled = !on;
            if (!on) nightPayEtcInput.value = '';
            if (on) nightPayEtcInput.focus();
        });
    }
}

// ========== 데이터 수집 함수들 ==========
function collectPayMethods(timeType) {
    const payChecks = Array.from(document.querySelectorAll(`input[name="${timeType}PayMethod"]`));
    const payEtcChk = $(`#${timeType}_pay_etc_chk`);
    const payEtcInput = $(`#${timeType}_pay_etc_input`);

    const vals = payChecks.filter(c => c.checked).map(c => c.value);
    if (payEtcChk?.checked) {
        const t = (payEtcInput?.value || '').trim();
        if (t) vals.push(`기타:${t}`);
        else if (!vals.includes('기타')) vals.push('기타');
    }
    return vals;
}

function collectSettleMethods(timeType) {
    const settleChecks = Array.from(document.querySelectorAll(`input[name="${timeType}SettleMethod"]`));
    return settleChecks.filter(c => c.checked).map(c => c.value);
}

function collectOperatingHours(timeType) {
    // 평일
    const weekdayOperation = document.querySelector(`input[name="${timeType}WeekdayOperation"]:checked`)?.value || '전일운영';
    let weekdayTime = null;
    if (weekdayOperation === '시간제운영') {
        weekdayTime = {
            startHour: num($(`#${timeType}_weekday_start_hour`)?.value),
            startMin: num($(`#${timeType}_weekday_start_min`)?.value),
            endHour: num($(`#${timeType}_weekday_end_hour`)?.value),
            endMin: num($(`#${timeType}_weekday_end_min`)?.value)
        };
    }

    // 토요일
    const saturdayOperation = document.querySelector(`input[name="${timeType}SaturdayOperation"]:checked`)?.value || '전일운영';
    let saturdayTime = null;
    if (saturdayOperation === '시간제운영') {
        saturdayTime = {
            startHour: num($(`#${timeType}_saturday_start_hour`)?.value),
            startMin: num($(`#${timeType}_saturday_start_min`)?.value),
            endHour: num($(`#${timeType}_saturday_end_hour`)?.value),
            endMin: num($(`#${timeType}_saturday_end_min`)?.value)
        };
    }

    // 공휴일
    const holidayOperation = document.querySelector(`input[name="${timeType}HolidayOperation"]:checked`)?.value || '전일운영';
    let holidayTime = null;
    if (holidayOperation === '시간제운영') {
        holidayTime = {
            startHour: num($(`#${timeType}_holiday_start_hour`)?.value),
            startMin: num($(`#${timeType}_holiday_start_min`)?.value),
            endHour: num($(`#${timeType}_holiday_end_hour`)?.value),
            endMin: num($(`#${timeType}_holiday_end_min`)?.value)
        };
    }

    return {
        weekday: { type: weekdayOperation, time: weekdayTime },
        saturday: { type: saturdayOperation, time: saturdayTime },
        holiday: { type: holidayOperation, time: holidayTime }
    };
}

// ========== 저장 ==========
function buildPayload(){
    const own = (ownRadios.find(r=>r.checked)||{}).value || '';
    const selectedOp = (opTypeRadios.find(r=>r.checked)?.value) || '';
    const sumNow = detailSum();

    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;

    const payload={
        id: f_id?.value,
        name: f_name?.value,
        status: f_status?.value,
        type: '노상',
        sido: f_sido?.value,
        sigungu: f_sigungu?.value,
        emd: f_emd?.value,
        addrJibun: f_addrJ?.value,
        addrRoad: f_addrR?.value,
        lat: f_lat?.value,
        lng: f_lng?.value,

        totalStalls: sumNow,
        stalls: {
            normal: num(normalInput?.value),
            disabled: num(disInput?.value),
            compact: num(smallInput?.value),
            eco: num(greenInput?.value),
            pregnant: num(pregInput?.value)
        },
        autoTotalFromDetail: true,

        ownerType: own,
        ownerCompany: (own==='민간위탁') ? ($('#f_own_company')?.value||'') : '',
        manager: {
            name: $('#f_mgr_name')?.value||'',
            tel: $('#f_mgr_tel')?.value||''
        },

        oddEven: $('#f_oddEven')?.value||'',
        operationType: selectedOp,
        times: {
            day: isDayChecked,
            night: isNightChecked
        }
    };

    // 주간 데이터
    if (isDayChecked) {
        payload.day = {
            grade: $('#f_day_grade')?.value || '',
            feeType: $('#f_day_feeType')?.value || '',
            payMethods: collectPayMethods('day'),
            settleMethods: collectSettleMethods('day'),
            operatingHours: collectOperatingHours('day')
        };

        // 주간 요금 데이터

        if (selectedOp.includes('거주자우선주차장')) {
            payload.day.residentFees = {
                all: num($('#f_day_res_all')?.value),
                day: num($('#f_day_res_day')?.value),
                full: num($('#f_day_res_full')?.value),
                night: num($('#f_day_res_night')?.value)
            };
        }

        if (selectedOp.includes('일반노상주차장')) {
            payload.day.normalStreetFees = {
                first30: num($('#f_day_fee_first30')?.value),
                per10: num($('#f_day_fee_per10')?.value),
                per60: num($('#f_day_fee_per60')?.value),
                daily: num($('#f_day_fee_daily')?.value),
                monthly: num($('#f_day_fee_monthly')?.value),
                halfyear: num($('#f_day_fee_halfyear')?.value)
            };
        }
    }

    // 야간 데이터
    if (isNightChecked) {
        payload.night = {
            grade: $('#f_night_grade')?.value || '',
            feeType: $('#f_night_feeType')?.value || '',
            payMethods: collectPayMethods('night'),
            settleMethods: collectSettleMethods('night'),
            operatingHours: collectOperatingHours('night')
        };

        // 야간 요금 데이터
        if (selectedOp.includes('거주자우선주차장')) {
            payload.night.residentFees = {
                all: num($('#f_night_res_all')?.value),
                day: num($('#f_night_res_day')?.value),
                full: num($('#f_night_res_full')?.value),
                night: num($('#f_night_res_night')?.value)
            };
        }

        if (selectedOp.includes('일반노상주차장')) {
            payload.night.normalStreetFees = {
                first30: num($('#f_night_fee_first30')?.value),
                per10: num($('#f_night_fee_per10')?.value),
                per60: num($('#f_night_fee_per60')?.value),
                daily: num($('#f_night_fee_daily')?.value),
                monthly: num($('#f_night_fee_monthly')?.value),
                halfyear: num($('#f_night_fee_halfyear')?.value)
            };
        }
    }

    return payload;
}

function doSave(){
    const payload = buildPayload();
    console.log('SAVE(offstreet):', payload);
    alert('주간/야간 데이터 저장 완료(콘솔 확인). 실제 API로 교체하세요.');
}

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', function() {
    // 주간/야간 섹션 설정
    setupDayNightSections();

    // 시간제운영 이벤트 설정
    setupTimeOperationEvents('day');
    setupTimeOperationEvents('night');

    // 요금 지불방식 설정
    setupPaymentMethods();

    // 저장 버튼 이벤트
    $('#btnSave')?.addEventListener('click', doSave);
    $('#btnSaveTop')?.addEventListener('click', doSave);
});

// 파일 업로드 진행률 관리
class FileUploadProgress {
    constructor() {
        this.progressArea = document.getElementById('upload-progress-area');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.fileItem = document.getElementById('upload-file-item');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.fileStatus = document.getElementById('file-status');
        this.fileProgressFill = document.getElementById('file-progress-fill');
        this.uploadSummary = document.querySelector('.upload-summary');
        this.btnCancel = document.getElementById('btn-upload-cancel');
        this.btnComplete = document.getElementById('btn-upload-complete');

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.btnCancel) {
            this.btnCancel.addEventListener('click', () => {
                this.cancel();
            });
        }

        if (this.btnComplete) {
            this.btnComplete.addEventListener('click', () => {
                this.hide();
            });
        }
    }

    show(file) {
        if (!this.progressArea || !file) return;

        this.currentFile = file;
        this.progressArea.style.display = 'block';
        this.fileItem.style.display = 'flex';

        // 파일 정보 설정
        this.fileName.textContent = file.name;
        this.fileSize.textContent = `0MB / ${this.formatFileSize(file.size)}`;
        this.fileStatus.textContent = '전송중';
        this.fileStatus.className = 'file-status uploading';

        // 요약 정보 업데이트
        this.updateSummary(0, file.size);

        // 진행률 초기화
        this.updateProgress(0);
        this.updateFileProgress(0);

        // 시뮬레이션된 업로드 진행률 시작
        this.startSimulatedProgress();
    }

    hide() {
        if (this.progressArea) {
            this.progressArea.style.display = 'none';
        }
        this.reset();
    }

    cancel() {
        this.hide();
        // 실제로는 업로드 취소 로직 추가
        console.log('업로드 취소됨');
    }

    updateProgress(percent) {
        if (this.progressFill) {
            this.progressFill.style.width = `${percent}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(percent)}%`;
        }
    }

    updateFileProgress(percent) {
        if (this.fileProgressFill) {
            this.fileProgressFill.style.width = `${percent}%`;
        }

        if (this.currentFile && this.fileSize) {
            const uploaded = (this.currentFile.size * percent / 100);
            this.fileSize.textContent =
                `${this.formatFileSize(uploaded)} / ${this.formatFileSize(this.currentFile.size)}`;
        }
    }

    updateSummary(uploadedSize, totalSize) {
        if (!this.uploadSummary) return;

        const statusEl = this.uploadSummary.querySelector('.upload-status');
        const sizeEl = this.uploadSummary.querySelector('.upload-size');
        const percentEl = this.uploadSummary.querySelector('.upload-percent');

        if (statusEl) statusEl.textContent = '0개 / 1개';
        if (sizeEl) sizeEl.textContent =
            `${this.formatFileSize(uploadedSize)} / ${this.formatFileSize(totalSize)}`;

        const percent = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;
        if (percentEl) percentEl.textContent = `${100 - percent}% 남음`;
    }

    complete() {
        this.updateProgress(100);
        this.updateFileProgress(100);

        if (this.fileStatus) {
            this.fileStatus.textContent = '전송완료';
            this.fileStatus.className = 'file-status completed';
        }

        if (this.currentFile) {
            this.updateSummary(this.currentFile.size, this.currentFile.size);
        }

        // 완료 버튼 표시
        if (this.btnComplete) this.btnComplete.style.display = 'inline-block';
        if (this.btnCancel) this.btnCancel.style.display = 'none';

        // 완료 애니메이션
        if (this.progressArea) {
            this.progressArea.classList.add('completed');
            setTimeout(() => {
                this.progressArea.classList.remove('completed');
            }, 500);
        }
    }

    error(message) {
        if (this.fileStatus) {
            this.fileStatus.textContent = message || '전송실패';
            this.fileStatus.className = 'file-status error';
        }
    }

    startSimulatedProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.complete(), 200);
            }
            this.updateProgress(progress);
            this.updateFileProgress(progress);

            if (this.currentFile) {
                this.updateSummary(
                    this.currentFile.size * progress / 100,
                    this.currentFile.size
                );
            }
        }, 100);

        this.currentInterval = interval;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    }

    reset() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }

        this.currentFile = null;
        this.updateProgress(0);
        this.updateFileProgress(0);

        if (this.btnComplete) this.btnComplete.style.display = 'none';
        if (this.btnCancel) this.btnCancel.style.display = 'inline-block';
    }
}

// 파일 업로드 진행률 인스턴스 생성
const uploadProgress = new FileUploadProgress();

// 기존 handleFiles 함수 수정
async function handleFiles(list, mode){
    const file = list && list[0];
    if (!file) return;

    // 업로드 진행률 표시
    uploadProgress.show(file);

    try {
        $('#preview').src = URL.createObjectURL(file);
    } catch(_) {}

    if (mode === 'cam') {
        const c = await geoFromDeviceSilent();
        if (c && f_lat && f_lng) {
            f_lat.value = c.lat.toFixed(6);
            f_lng.value = c.lng.toFixed(6);
        }
        return;
    }

    try {
        let coords = null;
        if (window.exifr) {
            try {
                const g = await exifr.gps(file);
                if (g && typeof g.latitude === 'number' && typeof g.longitude === 'number') {
                    coords = {lat: g.latitude, lng: g.longitude};
                }
            } catch(_) {}
        }
        if (!coords && (/jpe?g$/i.test(file.name) || file.type === 'image/jpeg')) {
            try {
                coords = await readJpegGpsSafe(file);
            } catch(_) {}
        }
        if (coords && f_lat && f_lng) {
            f_lat.value = Number(coords.lat).toFixed(6);
            f_lng.value = Number(coords.lng).toFixed(6);
        }
    } catch(err) {
        console.error(err);
        uploadProgress.error('좌표 추출 실패');
    }
}

// 기존 코드에 다음 로직 추가

document.addEventListener('DOMContentLoaded', function() {
    // 1. 주차장 표지판 라디오 버튼 이벤트
    const signYes = document.getElementById('sign_yes');
    const signNo = document.getElementById('sign_no');
    const signPhotoWrap = document.getElementById('sign_photo_wrap');
    const signPreview = document.getElementById('sign_preview');
    const signPhotoLib = document.getElementById('f_sign_photo_lib');
    const signPhotoCam = document.getElementById('f_sign_photo_cam');

    function toggleSignPhotoArea() {
        if (signYes.checked) {
            signPhotoWrap.style.display = 'block';
        } else {
            signPhotoWrap.style.display = 'none';
            // 사진 초기화
            clearSignPhoto();
        }
    }

    signYes.addEventListener('change', toggleSignPhotoArea);
    signNo.addEventListener('change', toggleSignPhotoArea);

    // 표지판 사진 업로드 버튼들
    document.getElementById('btnSignPhotoLibrary').addEventListener('click', function() {
        signPhotoLib.click();
    });

    document.getElementById('btnSignPhotoCamera').addEventListener('click', function() {
        signPhotoCam.click();
    });

    document.getElementById('btnClearSignPhoto').addEventListener('click', clearSignPhoto);

    // 표지판 사진 파일 선택 이벤트
    signPhotoLib.addEventListener('change', handleSignPhotoSelect);
    signPhotoCam.addEventListener('change', handleSignPhotoSelect);

    function handleSignPhotoSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                signPreview.src = e.target.result;
                signPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    function clearSignPhoto() {
        signPhotoLib.value = '';
        signPhotoCam.value = '';
        signPreview.src = '';
        signPreview.style.display = 'none';
    }

    // 2. 경사구간 여부 라디오 버튼 이벤트
    const slopeYes = document.getElementById('slope_yes');
    const slopeNo = document.getElementById('slope_no');
    const slopeInputWrap = document.getElementById('slope_input_wrap');
    const slopeStartInput = document.getElementById('f_slope_start');
    const slopeEndInput = document.getElementById('f_slope_end');

    function toggleSlopeInput() {
        if (slopeYes.checked) {
            slopeInputWrap.style.display = 'block';
        } else {
            slopeInputWrap.style.display = 'none';
            // '없음' 선택 시 입력값 초기화
            if (slopeStartInput && slopeEndInput && (slopeStartInput.value || slopeEndInput.value)) {
                if (confirm('경사구간을 "없음"으로 변경하면 입력된 경사도 정보가 삭제됩니다. 계속하시겠습니까?')) {
                    slopeStartInput.value = '';
                    slopeEndInput.value = '';
                } else {
                    // 사용자가 취소하면 다시 "있음"으로 되돌림
                    slopeYes.checked = true;
                    return;
                }
            }
        }
    }

    slopeYes.addEventListener('change', toggleSlopeInput);
    slopeNo.addEventListener('change', toggleSlopeInput);

    // 경사도 입력 유효성 검증
    [slopeStartInput, slopeEndInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (value && (value <= 4 || value > 6)) {
                    this.setCustomValidity('경사도는 4% 초과 6% 이하 범위에서 입력해주세요.');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    });

    // 3. 안전시설 기타 옵션 처리
    const safetyEtcChk = document.getElementById('safety_etc_chk');
    const safetyEtcInput = document.getElementById('safety_etc_input');

    safetyEtcChk.addEventListener('change', function() {
        if (this.checked) {
            safetyEtcInput.disabled = false;
            safetyEtcInput.focus();
        } else {
            safetyEtcInput.disabled = true;
            safetyEtcInput.value = '';
        }
    });

    // 기타 텍스트 입력 시 자동으로 체크박스 체크
    safetyEtcInput.addEventListener('input', function() {
        if (this.value.trim()) {
            safetyEtcChk.checked = true;
        }
    });

    // 초기화 함수들을 전역으로 등록 (다른 함수에서 사용할 수 있도록)
    window.clearSignPhoto = clearSignPhoto;
    window.toggleSignPhotoArea = toggleSignPhotoArea;
    window.toggleSlopeInput = toggleSlopeInput;
});