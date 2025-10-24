/* onparking.js — 노상주차장 상세 페이지 (주간/야간 기능 + 동적 코드) */

// ========== 유틸 ==========
const $  = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));
function params(){ const sp=new URLSearchParams(location.search); return new Proxy({}, {get:(_,k)=> sp.get(k)||''}); }
function num(v){ const n=parseInt((v||'').toString().replace(/[^0-9]/g,''),10); return Number.isFinite(n)&&n>=0?n:0; }
const p = params();

// ========== 🔥 동적 코드 로더 ==========
const CodeLoader = {
    // 1️⃣ 서버에서 모든 코드 그룹 가져오기
    async loadDynamicCodes() {
        try {
            console.log('=== 동적 코드 로드 시작 ===');
            const response = await fetch('/cmm/codes/dynamic-groups');
            const result = await response.json();

            if (result.success && result.groups) {
                console.log('✅ 로드된 코드 그룹:', Object.keys(result.groups));
                return result.groups;
            } else {
                console.error('❌ 동적 코드 로드 실패:', result.message);
                return null;
            }
        } catch (error) {
            console.error('❌ 동적 코드 로드 중 오류:', error);
            return null;
        }
    },

    // 2️⃣ Select 박스 채우기
    populateSelect(selectId, codes, includeDefault = true) {
        const select = $(selectId);
        if (!select) {
            console.warn(`⚠️ ${selectId} 요소를 찾을 수 없습니다.`);
            return;
        }

        select.innerHTML = includeDefault ? '<option value="">선택</option>' : '';

        if (codes && codes.length > 0) {
            codes.forEach(code => {
                const option = document.createElement('option');
                option.value = code.codeCd;
                option.textContent = code.codeNm;
                select.appendChild(option);
            });
            console.log(`✅ ${selectId} 옵션 ${codes.length}개 추가`);
        }
    },

    // 3️⃣ 라디오 버튼 그룹 채우기
    populateRadioGroup(containerId, radioName, codes) {
        const container = $(containerId);
        if (!container) {
            console.warn(`⚠️ ${containerId} 요소를 찾을 수 없습니다.`);
            return;
        }

        container.innerHTML = '';

        if (codes && codes.length > 0) {
            codes.forEach((code, index) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                const span = document.createElement('span');

                input.type = 'radio';
                input.name = radioName;
                input.value = code.codeCd;
                if (index === 0) input.checked = true;

                span.textContent = code.codeNm;

                label.appendChild(input);
                label.appendChild(document.createTextNode(' '));
                label.appendChild(span);
                container.appendChild(label);
            });
            console.log(`✅ ${containerId} 라디오 ${codes.length}개 추가`);
        }
    },

    // 4️⃣ 체크박스 그룹 채우기
    populateCheckboxGroup(containerId, checkboxName, codes) {
        const container = $(containerId);
        if (!container) {
            console.warn(`⚠️ ${containerId} 요소를 찾을 수 없습니다.`);
            return;
        }

        container.querySelectorAll('label[data-dynamic="true"]').forEach(el => el.remove());

        if (codes && codes.length > 0) {
            codes.forEach(code => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                const span = document.createElement('span');

                input.type = 'checkbox';
                input.name = checkboxName;
                input.value = code.codeCd;

                span.textContent = code.codeNm;

                label.setAttribute('data-dynamic', 'true');
                label.appendChild(input);
                label.appendChild(document.createTextNode(' '));
                label.appendChild(span);
                container.appendChild(label);
            });
            console.log(`✅ ${containerId} 체크박스 ${codes.length}개 추가`);
        }
    },

    // 5️⃣ 모든 동적 코드 적용
    async applyAllDynamicCodes() {
        const groups = await this.loadDynamicCodes();
        if (!groups) {
            console.warn('⚠️ 동적 코드 로드 실패. 기본 옵션 사용');
            return;
        }

        // PRK_015: 급지구분
        if (groups['PRK_015']) {
            this.populateSelect('#f_day_grade', groups['PRK_015'].codes);
            this.populateSelect('#f_night_grade', groups['PRK_015'].codes);
        }

        // PRK_005: 요금부과여부
        if (groups['PRK_005']) {
            this.populateSelect('#f_day_feeType', groups['PRK_005'].codes);
            this.populateSelect('#f_night_feeType', groups['PRK_005'].codes);
        }

        // PRK_003: 부제시행여부
        if (groups['PRK_003']) {
            this.populateSelect('#f_oddEven', groups['PRK_003'].codes, false);
        }

        // PRK_001: 주차장운영방식
        if (groups['PRK_001']) {
            this.populateRadioGroup('#op_group', 'opType', groups['PRK_001'].codes);
            setTimeout(() => {
                $$('input[name="opType"]').forEach(r => {
                    r.addEventListener('change', syncFeeSections);
                });
                syncFeeSections();
            }, 100);
        }

        // PRK_002: 운영주체
        if (groups['PRK_002']) {
            this.populateRadioGroup('#own_group', 'own', groups['PRK_002'].codes);
            setTimeout(() => {
                const ownRadios = $$('input[name="own"]');
                const ownWrap = $('#own_company_wrap');
                const ownCompany = $('#f_own_company');
                ownRadios.forEach(r => {
                    r.addEventListener('change', () => {
                        const isPrivate = r.value.includes('민간') && r.checked;
                        if (ownWrap) ownWrap.hidden = !isPrivate;
                        if (!isPrivate && ownCompany) ownCompany.value = '';
                    });
                });
            }, 100);
        }

        // PRK_006: 요금지불방식
        if (groups['PRK_006']) {
            // ✅ "기타"를 제외한 코드만 필터링
            const codesWithoutEtc = groups['PRK_006'].codes.filter(code =>
                !code.codeNm.includes('기타') && !code.codeCd.includes('기타')
            );

            console.log('PRK_006 전체:', groups['PRK_006'].codes.length);
            console.log('기타 제외:', codesWithoutEtc.length);

            // 주간 요금지불방식
            const dayPayGroup = $('#day_pay_group');
            if (dayPayGroup) {
                this.populateCheckboxGroup('#day_pay_group', 'dayPayMethod', codesWithoutEtc);
                this.addEtcCheckbox(dayPayGroup, 'day_pay_etc_chk', 'day_pay_etc_input', 'dayPayMethod');
            }

            // 야간 요금지불방식
            const nightPayGroup = $('#night_pay_group');
            if (nightPayGroup) {
                this.populateCheckboxGroup('#night_pay_group', 'nightPayMethod', codesWithoutEtc);
                this.addEtcCheckbox(nightPayGroup, 'night_pay_etc_chk', 'night_pay_etc_input', 'nightPayMethod');
            }
        }

        // PRK_007: 요금정산방식
        if (groups['PRK_007']) {
            this.populateCheckboxGroup('#day_settle_group', 'daySettleMethod', groups['PRK_007'].codes);
            this.populateCheckboxGroup('#night_settle_group', 'nightSettleMethod', groups['PRK_007'].codes);
        }

        console.log('✅ 모든 동적 코드 적용 완료');
    },

    // "기타" 체크박스 + 입력 필드 추가
    addEtcCheckbox(container, checkId, inputId, name) {
        const label = document.createElement('label');
        label.className = 'pay-etc';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkId;
        checkbox.name = name;
        checkbox.value = '기타';

        const span = document.createElement('span');
        span.textContent = '기타';

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = inputId;
        textInput.placeholder = '기타 지불수단 입력';
        textInput.disabled = true;

        label.appendChild(checkbox);
        label.appendChild(span);
        label.appendChild(textInput);
        container.appendChild(label);

        checkbox.addEventListener('change', () => {
            textInput.disabled = !checkbox.checked;
            if (!checkbox.checked) textInput.value = '';
            if (checkbox.checked) textInput.focus();
        });
    }
};

// ========== 기본 필드 ==========
const f_id=$('#f_id'), f_name=$('#f_name'), f_status=$('#f_status'), f_type=$('#f_type');
const f_sido=$('#f_sido'), f_sigungu=$('#f_sigungu'), f_emd=$('#f_emd');
const f_addrJ=$('#f_addr_jibun'), f_addrR=$('#f_addr_road');
const f_lat=$('#f_lat'), f_lng=$('#f_lng');
const v_id=$('#v_id'), v_name=$('#v_name'), v_addr=$('#v_addr');

// 초기 주입
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

// ========== JPEG EXIF 보조 파서 ==========
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

// ========== 면수 합계/검증 ==========
const totalInput = $('#f_totalStalls');
const ctlTotal   = $('#ctl_total');
const normalInput = $('#f_st_normal');
const disInput   = $('#f_st_dis');
const smallInput = $('#f_st_small');
const greenInput = $('#f_st_green');
const pregInput  = $('#f_st_preg');
const msgEl      = $('#stallsMsg');

if (totalInput) totalInput.readOnly = true;

function detailSum(){
    return num(normalInput?.value)+num(disInput?.value)+num(smallInput?.value)+num(greenInput?.value)+num(pregInput?.value);
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
function syncFeeSections(){
    const dayResWrap = $('#day_res_fee_wrap');
    const dayNormalWrap = $('#day_normal_fee_wrap');
    const nightResWrap = $('#night_res_fee_wrap');
    const nightNormalWrap = $('#night_normal_fee_wrap');

    const currentOpTypeRadios = $$('input[name="opType"]');
    const v = (currentOpTypeRadios.find(r=>r.checked)?.value) || '';

    [dayResWrap, dayNormalWrap, nightResWrap, nightNormalWrap].forEach(el => {
        if (el) el.hidden = true;
    });

    // 주간/야간 체크 상태 확인
    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;

    // ⚠️ 선택된 라디오의 텍스트도 함께 확인 (codeCd 또는 codeNm 둘 다 지원)
    const selectedRadio = currentOpTypeRadios.find(r => r.checked);
    const opText = selectedRadio?.nextElementSibling?.textContent?.trim() || '';

    console.log('🔄 syncFeeSections:', {
        value: v,
        text: opText,
        isDayChecked,
        isNightChecked
    });

    // codeCd 또는 codeNm으로 판별
    const isNormalStreet = v === '01' || opText.includes('일반노상');
    const isResident = v === '02' || opText.includes('거주자우선');
    const isBoth = v === '03' || opText.includes('일반노상+거주자우선') || opText.includes('일반+거주자');

    // 운영방식에 따라 표시
    if (isNormalStreet) {
        if (isDayChecked && dayNormalWrap) dayNormalWrap.hidden = false;
        if (isNightChecked && nightNormalWrap) nightNormalWrap.hidden = false;
    } else if (isResident) {
        if (isDayChecked && dayResWrap) dayResWrap.hidden = false;
        if (isNightChecked && nightResWrap) nightResWrap.hidden = false;
    } else if (isBoth) {
        if (isDayChecked) {
            if (dayResWrap) dayResWrap.hidden = false;
            if (dayNormalWrap) dayNormalWrap.hidden = false;
        }
        if (isNightChecked) {
            if (nightResWrap) nightResWrap.hidden = false;
            if (nightNormalWrap) nightNormalWrap.hidden = false;
        }
    }

    console.log('📊 섹션 표시 상태:', {
        dayResHidden: dayResWrap?.hidden,
        dayNormalHidden: dayNormalWrap?.hidden,
        nightResHidden: nightResWrap?.hidden,
        nightNormalHidden: nightNormalWrap?.hidden
    });
}

// ========== 주간/야간 체크박스 처리 ==========
function setupDayNightSections() {
    const chkDay = $('#chk_day');
    const chkNight = $('#chk_night');
    const opTypeWrap = $('#op_type_wrap');

    const daySections = [
        '#day_detail_wrap',
        '#day_fee_charge_wrap',
        '#day_fee_level_wrap',
        '#day_fee_pay_wrap',
        '#day_fee_settle_wrap',
        '#day_operation_time_section'
    ];

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

    function checkOperationTypeVisibility() {
        const isDayChecked = chkDay?.checked || false;
        const isNightChecked = chkNight?.checked || false;

        if (opTypeWrap) {
            opTypeWrap.style.display = (isDayChecked || isNightChecked) ? 'block' : 'none';
        }

        if (!isDayChecked && !isNightChecked) {
            toggleSections(daySections, false);
            toggleSections(nightSections, false);
        }
    }

    if (chkDay) {
        chkDay.addEventListener('change', function() {
            toggleSections(daySections, this.checked);
            checkOperationTypeVisibility();
            if (this.checked) syncFeeSections();
        });
    }

    if (chkNight) {
        chkNight.addEventListener('change', function() {
            toggleSections(nightSections, this.checked);
            checkOperationTypeVisibility();
            if (this.checked) syncFeeSections();
        });
    }

    checkOperationTypeVisibility();
}

// ========== 시간제운영 처리 함수 ==========
function setupTimeOperationEvents(timeType) {
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
    const currentOpTypeRadios = $$('input[name="opType"]');
    const ownRadios = $$('input[name="own"]');
    const own = (ownRadios.find(r=>r.checked)||{}).value || '';
    const selectedOp = (currentOpTypeRadios.find(r=>r.checked)?.value) || '';
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

    if (isDayChecked) {
        payload.day = {
            grade: $('#f_day_grade')?.value || '',
            feeType: $('#f_day_feeType')?.value || '',
            payMethods: collectPayMethods('day'),
            settleMethods: collectSettleMethods('day'),
            operatingHours: collectOperatingHours('day')
        };

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

    if (isNightChecked) {
        payload.night = {
            grade: $('#f_night_grade')?.value || '',
            feeType: $('#f_night_feeType')?.value || '',
            payMethods: collectPayMethods('night'),
            settleMethods: collectSettleMethods('night'),
            operatingHours: collectOperatingHours('night')
        };

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

// ========== 주차장 표지판 토글 ==========
function setupSignToggle() {
    const signRadios = $$('input[name="parkingSign"]');
    const signPhotoWrap = $('#sign_photo_wrap');

    if (!signPhotoWrap) {
        console.warn('⚠️ #sign_photo_wrap 요소를 찾을 수 없습니다.');
        return;
    }

    signRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // value가 'Y' 또는 '있음'일 때 표시
            const isVisible = radio.checked && (radio.value === 'Y' || radio.value === '있음');
            signPhotoWrap.style.display = isVisible ? 'block' : 'none';

            console.log('🖼️ 표지판 사진:', { value: radio.value, visible: isVisible });
        });
    });

    // 초기 상태 설정
    const checkedSign = signRadios.find(r => r.checked);
    if (checkedSign) {
        const isVisible = checkedSign.value === 'Y' || checkedSign.value === '있음';
        signPhotoWrap.style.display = isVisible ? 'block' : 'none';
    }

    // 표지판 사진 업로드 버튼 이벤트
    const signPhotoLib = $('#f_sign_photo_lib');
    const signPhotoCam = $('#f_sign_photo_cam');
    const signPreview = $('#sign_preview');

    $('#btnSignPhotoLibrary')?.addEventListener('click', () => signPhotoLib?.click());
    $('#btnSignPhotoCamera')?.addEventListener('click', () => signPhotoCam?.click());

    $('#btnClearSignPhoto')?.addEventListener('click', () => {
        if (signPhotoLib) signPhotoLib.value = '';
        if (signPhotoCam) signPhotoCam.value = '';
        if (signPreview) {
            signPreview.removeAttribute('src');
            signPreview.style.display = 'none';
        }
    });

    signPhotoLib?.addEventListener('change', (e) => handleSignPhoto(e.target.files));
    signPhotoCam?.addEventListener('change', (e) => handleSignPhoto(e.target.files));
}

async function handleSignPhoto(files) {
    const file = files && files[0];
    if (!file) return;

    const signPreview = $('#sign_preview');
    if (signPreview) {
        try {
            signPreview.src = URL.createObjectURL(file);
            signPreview.style.display = 'block';
        } catch (err) {
            console.error('표지판 사진 미리보기 실패:', err);
        }
    }
}

// ========== 경사구간 토글 ==========
function setupSlopeToggle() {
    const slopeRadios = $$('input[name="slopeSection"]');
    const slopeInputWrap = $('#slope_input_wrap');

    if (!slopeInputWrap) {
        console.warn('⚠️ #slope_input_wrap 요소를 찾을 수 없습니다.');
        return;
    }

    slopeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // value가 'Y' 또는 '있음'일 때 표시
            const isVisible = radio.checked && (radio.value === 'Y' || radio.value === '있음');
            slopeInputWrap.style.display = isVisible ? 'block' : 'none';

            // 숨길 때 입력값 초기화
            if (!isVisible) {
                const slopeStart = $('#f_slope_start');
                const slopeEnd = $('#f_slope_end');
                if (slopeStart) slopeStart.value = '';
                if (slopeEnd) slopeEnd.value = '';
            }

            console.log('📐 경사구간 입력:', { value: radio.value, visible: isVisible });
        });
    });

    // 초기 상태 설정
    const checkedSlope = slopeRadios.find(r => r.checked);
    if (checkedSlope) {
        const isVisible = checkedSlope.value === 'Y' || checkedSlope.value === '있음';
        slopeInputWrap.style.display = isVisible ? 'block' : 'none';
    }
}

// ========== 🔥 서버에서 주차장 상세 데이터 로드 ==========
async function loadParkingDetailFromServer(prkPlceManageNo) {
    try {
        console.log('🔍 서버에서 데이터 로드 시작:', prkPlceManageNo);

        const response = await fetch(`/prk/onparking-detail?prkPlceManageNo=${encodeURIComponent(prkPlceManageNo)}`);
        const result = await response.json();

        if (result.success && result.data) {
            console.log('✅ 서버 데이터 로드 성공:', result.data);
            bindDataToForm(result.data);
        } else {
            console.warn('⚠️ 데이터 없음:', result.message);
            alert('주차장 정보를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        alert('데이터 로드 중 오류가 발생했습니다.');
    }
}

// ========== 🔥 폼에 데이터 바인딩 ==========
function bindDataToForm(data) {
    console.log('📝 폼 데이터 바인딩 시작', data);

    // 기본 정보
    const f_id = document.getElementById('f_id');
    const f_name = document.getElementById('f_name');
    const f_sido = document.getElementById('f_sido');
    const f_sigungu = document.getElementById('f_sigungu');
    const f_lat = document.getElementById('f_lat');
    const f_lng = document.getElementById('f_lng');

    if (f_id) f_id.value = data.prkPlceManageNo || '';
    if (f_name) f_name.value = data.prkplceNm || '';
    if (f_sido) f_sido.value = data.sidoCd || '';
    if (f_sigungu) f_sigungu.value = data.sigunguCd || '';
    if (f_lat) f_lat.value = data.prkPlceLat || '';
    if (f_lng) f_lng.value = data.prkPlceLon || '';

    // 주소
    const f_addrJ = document.getElementById('f_addr_jibun');
    if (f_addrJ) f_addrJ.value = data.dtadd || '';

    // 주차면수
    const totalInput = document.getElementById('f_totalStalls');
    const normalInput = document.getElementById('f_st_normal');
    const disInput = document.getElementById('f_st_dis');
    const smallInput = document.getElementById('f_st_small');
    const greenInput = document.getElementById('f_st_green');
    const pregInput = document.getElementById('f_st_preg');

    if (totalInput) totalInput.value = data.totPrkCnt || 0;
    if (disInput) disInput.value = data.disabPrkCnt || 0;
    if (smallInput) smallInput.value = data.compactPrkCnt || 0;
    if (greenInput) greenInput.value = data.ecoPrkCnt || 0;
    if (pregInput) pregInput.value = data.pregnantPrkCnt || 0;

    // 일반 주차면수 계산
    if (normalInput && data.totPrkCnt) {
        const normal = data.totPrkCnt - (data.disabPrkCnt || 0) - (data.compactPrkCnt || 0)
            - (data.ecoPrkCnt || 0) - (data.pregnantPrkCnt || 0);
        normalInput.value = Math.max(0, normal);
    }

    // 주차장 운영방식 (prkOperMthdCd)
    if (data.prkOperMthdCd) {
        const opTypeRadios = document.getElementsByName('opType');
        // 코드 값에 따라 라디오 버튼 선택
        // 01: 일반노상주차장, 02: 거주자우선주차장, 03: 일반노상+거주자우선
        const opTypeMap = {
            '01': '일반노상주차장',
            '02': '거주자우선주차장',
            '03': '일반노상주차장+거주자우선주차장'
        };
        const opTypeValue = opTypeMap[data.prkOperMthdCd];
        if (opTypeValue) {
            opTypeRadios.forEach(radio => {
                if (radio.value === opTypeValue) radio.checked = true;
            });
        }
    }

    // 운영주체 (operMbyCd)
    if (data.operMbyCd) {
        const ownRadios = document.getElementsByName('own');
        // 01: 시운영, 02: 구(군)운영, 03: 공단위탁, 04: 민간위탁
        const ownMap = {
            '01': '시운영',
            '02': '구(군)운영',
            '03': '공단위탁',
            '04': '민간위탁'
        };
        const ownValue = ownMap[data.operMbyCd];
        if (ownValue) {
            ownRadios.forEach(radio => {
                if (radio.value === ownValue) radio.checked = true;
            });
        }
    }

    // 관리기관
    const f_mgr_name = document.getElementById('f_mgr_name');
    const f_mgr_tel = document.getElementById('f_mgr_tel');
    if (f_mgr_name) f_mgr_name.value = data.mgrOrg || '';
    if (f_mgr_tel) f_mgr_tel.value = data.mgrOrgTelNo || '';

    // 부제 시행 여부
    const f_oddEven = document.getElementById('f_oddEven');
    if (f_oddEven && data.subordnOpertnCd) {
        f_oddEven.value = data.subordnOpertnCd;
    }

    // 주야간 구분 (dyntDvCd)
    const chkDay = document.getElementById('chk_day');
    const chkNight = document.getElementById('chk_night');

    if (data.dyntDvCd && chkDay && chkNight) {
        // 01: 주간, 02: 야간, 03: 주간+야간
        if (data.dyntDvCd === '01' || data.dyntDvCd === '03') {
            chkDay.checked = true;
        }
        if (data.dyntDvCd === '02' || data.dyntDvCd === '03') {
            chkNight.checked = true;
        }
    }

    // 급지 정보
    const f_day_grade = document.getElementById('f_day_grade');
    const f_night_grade = document.getElementById('f_night_grade');

    if (f_day_grade && data.wkZon) {
        f_day_grade.value = data.wkZon;
    }
    if (f_night_grade && data.ntZon) {
        f_night_grade.value = data.ntZon;
    }

    // 주간 요금 정보
    const f_day_feeType = document.getElementById('f_day_feeType');
    if (f_day_feeType && data.wkFeeAplyCd) {
        f_day_feeType.value = data.wkFeeAplyCd;
    }

    // 거주자우선 요금 (주간)
    const f_day_res_all = document.getElementById('f_day_res_all');
    const f_day_res_day = document.getElementById('f_day_res_day');
    const f_day_res_full = document.getElementById('f_day_res_full');

    if (f_day_res_all && data.wkResDayFee) f_day_res_all.value = data.wkResDayFee;
    if (f_day_res_day && data.wkResWkFee) f_day_res_day.value = data.wkResWkFee;
    if (f_day_res_full && data.wkResFtFee) f_day_res_full.value = data.wkResFtFee;

    // 일반노상 요금 (주간)
    const f_day_fee_first30 = document.getElementById('f_day_fee_first30');
    const f_day_fee_per10 = document.getElementById('f_day_fee_per10');
    const f_day_fee_per60 = document.getElementById('f_day_fee_per60');
    const f_day_fee_daily = document.getElementById('f_day_fee_daily');

    if (f_day_fee_first30 && data.wkGnFrst30mFee) f_day_fee_first30.value = data.wkGnFrst30mFee;
    if (f_day_fee_per10 && data.wkGnInt10mFee) f_day_fee_per10.value = data.wkGnInt10mFee;
    if (f_day_fee_per60 && data.wkGn1hFee) f_day_fee_per60.value = data.wkGn1hFee;
    if (f_day_fee_daily && data.wkGnDayFee) f_day_fee_daily.value = data.wkGnDayFee;

    // 야간 요금 정보
    const f_night_feeType = document.getElementById('f_night_feeType');
    if (f_night_feeType && data.ntFeeAplyCd) {
        f_night_feeType.value = data.ntFeeAplyCd;
    }

    // 거주자우선 요금 (야간)
    const f_night_res_all = document.getElementById('f_night_res_all');
    const f_night_res_full = document.getElementById('f_night_res_full');
    const f_night_res_night = document.getElementById('f_night_res_night');

    if (f_night_res_all && data.ntResDayFee) f_night_res_all.value = data.ntResDayFee;
    if (f_night_res_full && data.ntResFtFee) f_night_res_full.value = data.ntResFtFee;
    if (f_night_res_night && data.ntResNtFee) f_night_res_night.value = data.ntResNtFee;

    // 일반노상 요금 (야간)
    const f_night_fee_first30 = document.getElementById('f_night_fee_first30');
    const f_night_fee_per10 = document.getElementById('f_night_fee_per10');
    const f_night_fee_per60 = document.getElementById('f_night_fee_per60');
    const f_night_fee_daily = document.getElementById('f_night_fee_daily');

    if (f_night_fee_first30 && data.ntGnFrst30mFee) f_night_fee_first30.value = data.ntGnFrst30mFee;
    if (f_night_fee_per10 && data.ntGnInt10mFee) f_night_fee_per10.value = data.ntGnInt10mFee;
    if (f_night_fee_per60 && data.ntGn1hFee) f_night_fee_per60.value = data.ntGn1hFee;
    if (f_night_fee_daily && data.ntGnDayFee) f_night_fee_daily.value = data.ntGnDayFee;

    // 기타 정보
    const sign_yes = document.getElementById('sign_yes');
    const sign_no = document.getElementById('sign_no');
    if (sign_yes && sign_no) {
        if (data.prklotSignYn === 'Y') {
            sign_yes.checked = true;
        } else {
            sign_no.checked = true;
        }
    }

    const slope_yes = document.getElementById('slope_yes');
    const slope_no = document.getElementById('slope_no');
    if (slope_yes && slope_no) {
        if (data.slpSecYn === 'Y') {
            slope_yes.checked = true;
        } else {
            slope_no.checked = true;
        }
    }

    // 비고
    const f_partclr_matter = document.getElementById('f_partclr_matter');
    if (f_partclr_matter && data.partclrMatter) {
        f_partclr_matter.value = data.partclrMatter;
        console.log('✅ 특이사항 바인딩 완료');
    }

    // 동적 UI 업데이트 함수 호출 (주간/야간 섹션 표시 등)
    if (typeof syncFeeSections === 'function') {
        syncFeeSections();
    }

    console.log('✅ 폼 데이터 바인딩 완료');
}

// ========== 헬퍼 함수들 ==========
function setRadioValue(name, value) {
    if (!value) return;
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
    }
}

function setCheckboxValue(name, value, checked) {
    const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (checkbox) {
        checkbox.checked = checked;
    }
}

function doSave(){
    const payload = buildPayload();
    console.log('SAVE(onparking):', payload);
    alert('주간/야간 데이터 저장 완료(콘솔 확인). 실제 API로 교체하세요.');
}

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', async function(){
    console.log('📄 페이지 로드 시작');

    // 🔥 최우선: 동적 코드 로드
    await CodeLoader.applyAllDynamicCodes();

    // 🔥 URL에서 prkPlceManageNo가 있으면 서버에서 데이터 로드
    const urlParams = new URLSearchParams(window.location.search);
    const manageNo = urlParams.get('id') || urlParams.get('prkPlceManageNo');

    if (manageNo) {
        await loadParkingDetailFromServer(manageNo);
    }

    // 주간/야간 섹션 설정
    setupDayNightSections();

    // 시간제운영 이벤트 설정
    setupTimeOperationEvents('day');
    setupTimeOperationEvents('night');

    // ========== 주차장 표지판 있음/없음 처리 ==========
    setupSignToggle();

    // ========== 경사구간 있음/없음 처리 ==========
    setupSlopeToggle();

    // 저장 버튼 이벤트
    $('#btnSave')?.addEventListener('click', doSave);
    $('#btnSaveTop')?.addEventListener('click', doSave);

    console.log('✅ 페이지 초기화 완료');
});