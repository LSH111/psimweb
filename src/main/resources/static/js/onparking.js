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

        // 🔥 PRK_004: 운영시간코드 (라디오 버튼 동적 생성)
        if (groups['PRK_004']) {
            window.OPERATION_TIME_CODES = groups['PRK_004'].codes;
            console.log('✅ PRK_004 운영시간 코드 로드:', window.OPERATION_TIME_CODES);

            // 주간 운영시간 라디오 버튼 생성
            this.populateOperationTimeRadios('day', 'weekday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('day', 'saturday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('day', 'holiday', groups['PRK_004'].codes);

            // 야간 운영시간 라디오 버튼 생성
            this.populateOperationTimeRadios('night', 'weekday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('night', 'saturday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('night', 'holiday', groups['PRK_004'].codes);
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

    // 🔥 운영시간 라디오 버튼 생성 함수
    populateOperationTimeRadios(timeType, dayType, codes) {
        const capitalizedDayType = dayType.charAt(0).toUpperCase() + dayType.slice(1);
        const containerId = `#${timeType}_${dayType}_operation_group`;
        const radioName = `${timeType}${capitalizedDayType}Operation`;

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
                input.value = code.codeCd; // ✅ codeCd를 value로 사용 ("01", "02", "03")
                input.dataset.codeName = code.codeNm; // codeNm을 data 속성에 저장

                // 첫 번째 항목을 기본 선택
                if (index === 0) input.checked = true;

                span.textContent = code.codeNm;

                label.appendChild(input);
                label.appendChild(document.createTextNode(' '));
                label.appendChild(span);
                container.appendChild(label);
            });

            console.log(`✅ ${containerId} 라디오 버튼 ${codes.length}개 생성`);
        }
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

// 🔥 샘플 데이터 제거 - URL 파라미터만 사용
if (f_id)     f_id.value   = p.id || '';
if (f_name)   f_name.value = p.name || '';
if (f_status) f_status.value = p.status || '';
if (f_type)   f_type.value = '노상';
if (f_sido)   f_sido.value = p.sido || '';
if (f_sigungu)f_sigungu.value = p.sigungu || '';
if (f_emd)    f_emd.value  = p.emd || '';
if (f_addrJ)  f_addrJ.value = p.jibun || p.addr || '';
if (f_addrR)  f_addrR.value = p.road || '';
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
    const sido = f_sido?.value?.trim() || '';
    const sigungu = f_sigungu?.value?.trim() || '';
    const emd = f_emd?.value?.trim() || '';
    const j = f_addrJ?.value?.trim() || '';
    const r = f_addrR?.value?.trim() || '';

    // 행정구역 조합
    const adminArea = [sido, sigungu, emd].filter(Boolean).join(' ');

    // 주소 조합
    const address = [j, r].filter(Boolean).join(' / ');

    // 최종 표시: 행정구역 + 주소
    const fullAddress = [adminArea, address].filter(Boolean).join(' · ');

    if (v_addr) {
        v_addr.textContent = fullAddress ? ' · ' + fullAddress : '';
    }
}

// ========== 운영방식 & 요금 섹션 제어 ==========
function syncFeeSections(){
    const dayResWrap = $('#day_res_fee_wrap');
    const dayNormalWrap = $('#day_normal_fee_wrap');
    const nightResWrap = $('#night_res_fee_wrap');
    const nightNormalWrap = $('#night_normal_fee_wrap');

    const currentOpTypeRadios = $$('input[name="opType"]');
    const selectedRadio = currentOpTypeRadios.find(r => r.checked);
    const v = selectedRadio?.value || '';

    // 먼저 모든 섹션 숨김
    [dayResWrap, dayNormalWrap, nightResWrap, nightNormalWrap].forEach(el => {
        if (el) el.hidden = true;
    });

    // 주간/야간 체크 상태 확인
    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;

    console.log('🔄 syncFeeSections - 코드값:', v, '주간:', isDayChecked, '야간:', isNightChecked);

    // ✅ 코드 값으로만 판별
    const isBoth = (v === '03');
    const isResident = (v === '02');
    const isNormalStreet = (v === '01');

    console.log('📋 운영방식 판별:', { isBoth, isResident, isNormalStreet });

    // 운영방식에 따라 표시
    if (isBoth) {
        console.log('✅ 복합 모드 (03)');
        if (isDayChecked) {
            if (dayResWrap) dayResWrap.hidden = false;
            if (dayNormalWrap) dayNormalWrap.hidden = false;
        }
        if (isNightChecked) {
            if (nightResWrap) nightResWrap.hidden = false;
            if (nightNormalWrap) nightNormalWrap.hidden = false;
        }
    } else if (isResident) {
        console.log('✅ 거주자우선 모드 (02)');
        if (isDayChecked && dayResWrap) dayResWrap.hidden = false;
        if (isNightChecked && nightResWrap) nightResWrap.hidden = false;
    } else if (isNormalStreet) {
        console.log('✅ 일반노상 모드 (01)');
        if (isDayChecked && dayNormalWrap) dayNormalWrap.hidden = false;
        if (isNightChecked && nightNormalWrap) nightNormalWrap.hidden = false;
    }

    console.log('📊 최종:', {
        dayRes: !dayResWrap?.hidden,
        dayNormal: !dayNormalWrap?.hidden,
        nightRes: !nightResWrap?.hidden,
        nightNormal: !nightNormalWrap?.hidden
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
                // ✅ codeCd 값으로 비교: '02' = 시간제운영
                weekdayTimeInputs.style.display =
                    e.target.value === '02' ? 'block' : 'none';
            }
        });
    }

    const saturdayGroup = $(`#${timeType}_saturday_operation_group`);
    const saturdayTimeInputs = $(`#${timeType}_saturday_time_inputs`);

    if (saturdayGroup && saturdayTimeInputs) {
        saturdayGroup.addEventListener('change', function(e) {
            if (e.target.name === `${timeType}SaturdayOperation`) {
                saturdayTimeInputs.style.display =
                    e.target.value === '02' ? 'block' : 'none';
            }
        });
    }

    const holidayGroup = $(`#${timeType}_holiday_operation_group`);
    const holidayTimeInputs = $(`#${timeType}_holiday_time_inputs`);

    if (holidayGroup && holidayTimeInputs) {
        holidayGroup.addEventListener('change', function(e) {
            if (e.target.name === `${timeType}HolidayOperation`) {
                holidayTimeInputs.style.display =
                    e.target.value === '02' ? 'block' : 'none';
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
    const result = {};

    // 평일
    const weekdayRadio = document.querySelector(`input[name="${timeType}WeekdayOperation"]:checked`);
    const weekdayCode = weekdayRadio?.value || '01'; // codeCd 직접 사용
    const weekdayName = weekdayRadio?.dataset.codeName || '전일운영';

    result.weekday = {
        type: weekdayName,
        code: weekdayCode,
        time: null
    };

    if (weekdayCode === '02') { // 시간제운영
        const startHour = num($(`#${timeType}_weekday_start_hour`)?.value);
        const startMin = num($(`#${timeType}_weekday_start_min`)?.value);
        const endHour = num($(`#${timeType}_weekday_end_hour`)?.value);
        const endMin = num($(`#${timeType}_weekday_end_min`)?.value);

        result.weekday.time = {
            startHour, startMin, endHour, endMin,
            startTime: formatTime(startHour, startMin),
            endTime: formatTime(endHour, endMin)
        };
    }

    // 토요일
    const saturdayRadio = document.querySelector(`input[name="${timeType}SaturdayOperation"]:checked`);
    const saturdayCode = saturdayRadio?.value || '01';
    const saturdayName = saturdayRadio?.dataset.codeName || '전일운영';

    result.saturday = {
        type: saturdayName,
        code: saturdayCode,
        time: null
    };

    if (saturdayCode === '02') {
        const startHour = num($(`#${timeType}_saturday_start_hour`)?.value);
        const startMin = num($(`#${timeType}_saturday_start_min`)?.value);
        const endHour = num($(`#${timeType}_saturday_end_hour`)?.value);
        const endMin = num($(`#${timeType}_saturday_end_min`)?.value);

        result.saturday.time = {
            startHour, startMin, endHour, endMin,
            startTime: formatTime(startHour, startMin),
            endTime: formatTime(endHour, endMin)
        };
    }

    // 공휴일
    const holidayRadio = document.querySelector(`input[name="${timeType}HolidayOperation"]:checked`);
    const holidayCode = holidayRadio?.value || '01';
    const holidayName = holidayRadio?.dataset.codeName || '전일운영';

    result.holiday = {
        type: holidayName,
        code: holidayCode,
        time: null
    };

    if (holidayCode === '02') {
        const startHour = num($(`#${timeType}_holiday_start_hour`)?.value);
        const startMin = num($(`#${timeType}_holiday_start_min`)?.value);
        const endHour = num($(`#${timeType}_holiday_end_hour`)?.value);
        const endMin = num($(`#${timeType}_holiday_end_min`)?.value);

        result.holiday.time = {
            startHour, startMin, endHour, endMin,
            startTime: formatTime(startHour, startMin),
            endTime: formatTime(endHour, endMin)
        };
    }

    return result;
}

// 🔥 시간을 HHMM 형식으로 변환
function formatTime(hour, minute) {
    const h = String(hour || 0).padStart(2, '0');
    const m = String(minute || 0).padStart(2, '0');
    return h + m;
}
// 🔥 운영 타입을 PRK_004 코드로 변환 (Fallback용)
function operationTypeToCode(operationType) {
    // 🔥 PRK_004 코드가 로드된 경우 사용
    if (window.OPERATION_TIME_CODES) {
        const codeInfo = window.OPERATION_TIME_CODES.find(c => c.codeNm === operationType);
        if (codeInfo) {
            return codeInfo.codeCd;
        }
    }

    // 🔥 Fallback: 하드코딩 매핑
    switch (operationType) {
        case '전일운영':
            return '01';
        case '시간제운영':
            return '02';
        case '운영안함':
            return '03';
        default:
            return '01';
    }
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
        },

        // 🔥 경사구간 정보 수정
        slope: {
            slpSecYn: $('#slope_yes')?.checked ? 'Y' : 'N',
            sixleCnt: $('#slope_yes')?.checked ? num($('#f_slope_start')?.value) : null,
            sixgtCnt: $('#slope_yes')?.checked ? num($('#f_slope_end')?.value) : null
        },

        // 🔥 안전시설 정보 추가
        safety: {
            antislpFcltyYn: $('#antislp_facility_chk')?.checked ? 'Y' : 'N',
            slpCtnGuidSignYn: $('#slp_guide_sign_chk')?.checked ? 'Y' : 'N'
        },

        // 🔥 비고 정보 추가
        partclrMatter: $('#f_partclr_matter')?.value || ''
    };

    // 경사구간 필드 값 확인
    console.log('f_slope_start:', $('#f_slope_start')?.value);
    console.log('f_slope_end:', $('#f_slope_end')?.value);
    console.log('slope_yes checked:', $('#slope_yes')?.checked);


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

    // 🔥 입력값 초기화 함수
    function clearSlopeInputs() {
        const slopeStart = $('#f_slope_start'); // sixleCnt 값이 들어감
        const slopeEnd = $('#f_slope_end');     // sixgtCnt 값이 들어감

        if (slopeStart) slopeStart.value = '';
        if (slopeEnd) slopeEnd.value = '';
    }

    // 🔥 토글 처리 함수
    function toggleSlopeInput(isVisible) {
        slopeInputWrap.style.display = isVisible ? 'block' : 'none';

        // 숨길 때 입력값 초기화
        if (!isVisible) {
            clearSlopeInputs();
        }

        console.log('📐 경사구간 입력:', { visible: isVisible });
    }

    slopeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isVisible = radio.checked && radio.value === 'Y';
            toggleSlopeInput(isVisible);
        });
    });

    // 초기 상태 설정
    const checkedSlope = slopeRadios.find(r => r.checked);
    if (checkedSlope) {
        const isVisible = checkedSlope.value === 'Y';
        toggleSlopeInput(isVisible);
    } else {
        slopeInputWrap.style.display = 'none';
    }
}

function toggleSlopeInput(isVisible) {
    // 🔥 입력값 확인 후 사용자에게 확인 받기
    if (!isVisible) {
        const hasValue =
            $('#f_sixle_cnt')?.value ||
            $('#f_sixgt_cnt')?.value ||
            $('#f_slope_start')?.value ||
            $('#f_slope_end')?.value;

        if (hasValue && !confirm('경사구간을 "없음"으로 변경하면 입력된 정보가 삭제됩니다. 계속하시겠습니까?')) {
            // 사용자가 취소하면 다시 "있음"으로 되돌림
            const slopeYes = $('#slope_yes');
            if (slopeYes) slopeYes.checked = true;
            return;
        }
        clearSlopeInputs();
    }

    slopeInputWrap.style.display = isVisible ? 'block' : 'none';
    console.log('📐 경사구간 입력:', { visible: isVisible });
}

// ========== 🔥 로딩 인디케이터 ==========
const LoadingIndicator = {
    show(message = '데이터를 불러오는 중...') {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `
                <div class="loader-backdrop">
                    <div class="loader-content">
                        <div class="loader-spinner"></div>
                        <div class="loader-message">${message}</div>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    },

    hide() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
};

// ========== 🔥 서버에서 상세 데이터 로드 ==========
async function loadParkingDetail(prkPlceManageNo) {
    if (!prkPlceManageNo) {
        console.warn('⚠️ 주차장 관리번호가 없습니다.');
        return;
    }

    LoadingIndicator.show('주차장 정보를 불러오는 중...');

    try {
        console.log('🔍 서버에서 상세 데이터 로드 시작:', prkPlceManageNo);

        const response = await fetch(`/prk/onparking-detail?prkPlceManageNo=${encodeURIComponent(prkPlceManageNo)}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            console.log('✅ 서버 데이터 로드 완료:', result.data);
            bindDataToForm(result.data);
        } else {
            console.error('❌ 데이터 로드 실패:', result.message);
            alert('데이터를 불러오는데 실패했습니다: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('❌ 데이터 로드 중 오류:', error);
        alert('데이터를 불러오는데 실패했습니다: ' + error.message);
    } finally {
        LoadingIndicator.hide();
        console.log('✅ 로딩 인디케이터 숨김');
    }
}

// ========== 🔥 숫자를 한국 통화 형식으로 포맷팅 ==========
function formatCurrency(value) {
    // 🔥 문자열 → 숫자 변환 추가
    const numValue = Number(value);
    // 🔥 유효성 검사 강화
    if (!numValue || isNaN(numValue) || numValue <= 0) {
        return '';
    }
    return numValue.toLocaleString('ko-KR');
}

// ========== 🔥 쉼표로 구분된 코드를 체크박스에 바인딩 ==========
function bindCheckboxes(name, codeString) {
    if (!codeString) return;

    const codes = codeString.split(',').map(c => c.trim()).filter(c => c);
    console.log(`✅ 체크박스 바인딩: ${name} =`, codes);

    codes.forEach(code => {
        // 🔥 "04" 또는 "기타" 코드 처리
        if (code === '04' || code === '기타') {
            const etcCheckbox = document.getElementById(`${name.replace('Method', '')}_etc_chk`);
            if (etcCheckbox) {
                etcCheckbox.checked = true;
                console.log(`  ✓ ${name} 기타 체크박스 활성화`);

                // 기타 입력 필드도 활성화
                const etcInput = document.getElementById(`${name.replace('Method', '')}_etc_input`);
                if (etcInput) {
                    etcInput.disabled = false;
                }
            } else {
                console.warn(`  ⚠️ 기타 체크박스를 찾을 수 없음: ${name}`);
            }
            return;
        }

        const checkbox = document.querySelector(`input[name="${name}"][value="${code}"]`);
        if (checkbox) {
            checkbox.checked = true;
            console.log(`  ✓ ${name} 체크: ${code}`);
        } else {
            console.warn(`  ⚠️ 체크박스를 찾을 수 없음: ${name} = ${code}`);
        }
    });
}

// ========== 🔥 전화번호 포맷팅 함수 ==========
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';

    // 숫자만 추출
    const numbers = phoneNumber.replace(/[^0-9]/g, '');

    if (numbers.length === 0) return '';

    // 전화번호 길이에 따라 포맷 적용
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        // 02-1234 형식 또는 010-1234 형식
        if (numbers.startsWith('02')) {
            return numbers.slice(0, 2) + '-' + numbers.slice(2);
        } else {
            return numbers.slice(0, 3) + '-' + numbers.slice(3);
        }
    } else if (numbers.length <= 10) {
        // 02-123-4567 형식 또는 031-123-4567 형식
        if (numbers.startsWith('02')) {
            return numbers.slice(0, 2) + '-' + numbers.slice(2, 5) + '-' + numbers.slice(5);
        } else {
            return numbers.slice(0, 3) + '-' + numbers.slice(3, 6) + '-' + numbers.slice(6);
        }
    } else {
        // 010-1234-5678 형식 또는 02-1234-5678 형식
        if (numbers.startsWith('02')) {
            return numbers.slice(0, 2) + '-' + numbers.slice(2, 6) + '-' + numbers.slice(6, 10);
        } else {
            return numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
        }
    }
}

// ========== 🔥 전역 변수로 사업관리번호 저장 ==========
let loadedBizMngNo = null; // 🔥 서버에서 로드한 사업관리번호 저장

// ========== 🔥 폼에 데이터 바인딩 ==========
function bindDataToForm(data) {
    console.log('📝 폼 데이터 바인딩 시작', data);

    // 🔥 사업관리번호 저장 (UPDATE 시 필수)
    if (data.prkBizMngNo) {
        loadedBizMngNo = data.prkBizMngNo;
        console.log('✅ 사업관리번호 저장:', loadedBizMngNo);
    }

    // 🔥 1. 기본 필드 매핑
    if (f_id) f_id.value = data.prkPlceManageNo || '';
    if (f_name) f_name.value = data.prkplceNm || '';
    if (f_status) f_status.value = data.prgsStsCd || '';  // ✅ prgsStsCd 사용
    if (f_type) f_type.value = '노상';

    // 🔥 행정구역 (코드명이 아닌 코드값 사용)
    if (f_sido) f_sido.value = data.sidoNm || '';
    if (f_sigungu) f_sigungu.value = data.sigunguNm || '';
    if (f_emd) f_emd.value = data.lgalEmdNm || '';

    // 주소
    if (f_addrJ) f_addrJ.value = data.dtadd || '';
    if (f_addrR) f_addrR.value = '';  // 도로명 주소는 별도 필드 필요

    // 좌표
    if (f_lat) f_lat.value = data.prkPlceLat || '';
    if (f_lng) f_lng.value = data.prkPlceLon || '';

    // 주차면수
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

    // 주차장운영방식 값 설정 (코드 값으로 직접 비교)
    if (data.prkOperMthdCd) {
        console.log('🔍 서버에서 받은 운영방식 코드:', data.prkOperMthdCd);

        const opTypeRadios = document.getElementsByName('opType');
        opTypeRadios.forEach(radio => {
            if (radio.value === data.prkOperMthdCd) {
                radio.checked = true;
                console.log('✅ 주차장운영방식 선택:', radio.value);
            }
        });
    }

    // 운영주체 (operMbyCd)
    if (data.operMbyCd) {
        console.log('🔍 서버에서 받은 운영주체 코드:', data.operMbyCd);

        const ownRadios = document.getElementsByName('own');
        ownRadios.forEach(radio => {
            if (radio.value === data.operMbyCd) {
                radio.checked = true;
                console.log('✅ 운영주체 선택:', radio.value);
            }
        });
    }

    // 관리기관
    const f_mgr_name = document.getElementById('f_mgr_name');
    const f_mgr_tel = document.getElementById('f_mgr_tel');
    if (f_mgr_name) f_mgr_name.value = data.mgrOrg || '';
    if (f_mgr_tel) f_mgr_tel.value = formatPhoneNumber(data.mgrOrgTelNo) || ''; // 🔥 포맷팅 적용

    // 부제 시행 여부
    const f_oddEven = document.getElementById('f_oddEven');
    if (f_oddEven && data.subordnOpertnCd) {
        f_oddEven.value = data.subordnOpertnCd;
    }

    // 주야간 구분 (dyntDvCd)
    const chkDay = document.getElementById('chk_day');
    const chkNight = document.getElementById('chk_night');

    if (data.dyntDvCd && chkDay && chkNight) {
        if (data.dyntDvCd === '01' || data.dyntDvCd === '03') {
            chkDay.checked = true;
        }
        if (data.dyntDvCd === '02' || data.dyntDvCd === '03') {
            chkNight.checked = true;
        }

        const opTypeWrap = document.getElementById('op_type_wrap');
        if (opTypeWrap && (chkDay.checked || chkNight.checked)) {
            opTypeWrap.style.display = 'block';
            console.log('✅ 주차장운영방식 영역 표시');
        }

        const daySections = [
            'day_detail_wrap',
            'day_fee_charge_wrap',
            'day_fee_level_wrap',
            'day_fee_pay_wrap',
            'day_fee_settle_wrap',
            'day_operation_time_section'
        ];

        const nightSections = [
            'night_detail_wrap',
            'night_fee_charge_wrap',
            'night_fee_level_wrap',
            'night_fee_pay_wrap',
            'night_fee_settle_wrap',
            'night_operation_time_section'
        ];

        if (chkDay.checked) {
            daySections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            });
            console.log('✅ 주간 섹션들 표시');
        }

        if (chkNight.checked) {
            nightSections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            });
            console.log('✅ 야간 섹션들 표시');
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

    // 🔥 거주자우선 요금 (주간) - 통화 포맷팅
    const f_day_res_all = document.getElementById('f_day_res_all');
    const f_day_res_day = document.getElementById('f_day_res_day');
    const f_day_res_full = document.getElementById('f_day_res_full');

    if (f_day_res_all && data.wkResDayFee) f_day_res_all.value = formatCurrency(data.wkResDayFee);
    if (f_day_res_day && data.wkResWkFee) f_day_res_day.value = formatCurrency(data.wkResWkFee);
    if (f_day_res_full && data.wkResFtFee) f_day_res_full.value = formatCurrency(data.wkResFtFee);

    // 🔥 일반노상 요금 (주간) - 통화 포맷팅
    const f_day_fee_first30 = document.getElementById('f_day_fee_first30');
    const f_day_fee_per10 = document.getElementById('f_day_fee_per10');
    const f_day_fee_per60 = document.getElementById('f_day_fee_per60');
    const f_day_fee_daily = document.getElementById('f_day_fee_daily');
    const f_day_fee_monthly = document.getElementById('f_day_fee_monthly');
    const f_day_fee_halfyear = document.getElementById('f_day_fee_halfyear');

    if (f_day_fee_first30 && data.wkGnFrst30mFee) f_day_fee_first30.value = formatCurrency(data.wkGnFrst30mFee);
    if (f_day_fee_per10 && data.wkGnInt10mFee) f_day_fee_per10.value = formatCurrency(data.wkGnInt10mFee);
    if (f_day_fee_per60 && data.wkGn1hFee) f_day_fee_per60.value = formatCurrency(data.wkGn1hFee);
    if (f_day_fee_daily && data.wkGnDayFee) f_day_fee_daily.value = formatCurrency(data.wkGnDayFee);
    if (f_day_fee_monthly && data.wkFeeMnthPassPrc) f_day_fee_monthly.value = formatCurrency(data.wkFeeMnthPassPrc);
    if (f_day_fee_halfyear && data.wkFeeHfyrPassPrc) f_day_fee_halfyear.value = formatCurrency(data.wkFeeHfyrPassPrc);

    // 야간 요금 정보
    const f_night_feeType = document.getElementById('f_night_feeType');
    if (f_night_feeType && data.ntFeeAplyCd) {
        f_night_feeType.value = data.ntFeeAplyCd;
    }

    // 🔥 거주자우선 요금 (야간) - 통화 포맷팅
    const f_night_res_all = document.getElementById('f_night_res_all');
    const f_night_res_full = document.getElementById('f_night_res_full');
    const f_night_res_night = document.getElementById('f_night_res_night');

    if (f_night_res_all && data.ntResDayFee) f_night_res_all.value = formatCurrency(data.ntResDayFee);
    if (f_night_res_full && data.ntResFtFee) f_night_res_full.value = formatCurrency(data.ntResFtFee);
    if (f_night_res_night && data.ntResNtFee) f_night_res_night.value = formatCurrency(data.ntResNtFee);

    // 🔥 일반노상 요금 (야간) - DB 값 그대로 표시
    const f_night_fee_first30 = document.getElementById('f_night_fee_first30');
    const f_night_fee_per10 = document.getElementById('f_night_fee_per10');
    const f_night_fee_per60 = document.getElementById('f_night_fee_per60');
    const f_night_fee_daily = document.getElementById('f_night_fee_daily');
    const f_night_fee_monthly = document.getElementById('f_night_fee_monthly');
    const f_night_fee_halfyear = document.getElementById('f_night_fee_halfyear');

    if (f_night_fee_first30 && data.ntGnFrst30mFee) f_night_fee_first30.value = formatCurrency(data.ntGnFrst30mFee);
    if (f_night_fee_per10 && data.ntGnInt10mFee) f_night_fee_per10.value = formatCurrency(data.ntGnInt10mFee);
    if (f_night_fee_per60 && data.ntGn1hFee) f_night_fee_per60.value = formatCurrency(data.ntGn1hFee);
    if (f_night_fee_daily && data.ntGnDayFee) f_night_fee_daily.value = formatCurrency(data.ntGnDayFee);
    if (f_night_fee_monthly && data.ntFeeMnthPassPrc) f_night_fee_monthly.value = formatCurrency(data.ntFeeMnthPassPrc);
    if (f_night_fee_halfyear && data.ntFeeHfyrPassPrc) f_night_fee_halfyear.value = formatCurrency(data.ntFeeHfyrPassPrc);

    // 🔥 요금지불방식 (쉼표로 구분된 코드)
    if (data.wkFeeMthdCd) {
        console.log('💳 주간 요금지불방식 코드:', data.wkFeeMthdCd);
        bindCheckboxes('dayPayMethod', data.wkFeeMthdCd);

        // 🔥 "04" 코드가 있고 기타 텍스트가 있으면 입력 필드에 설정
        if (data.wkFeeMthdCd.includes('04') && data.wkFeePayMthdOthr) {
            const dayPayEtcInput = document.getElementById('day_pay_etc_input');
            if (dayPayEtcInput) {
                dayPayEtcInput.value = data.wkFeePayMthdOthr;
                console.log('  ✅ 주간 기타 지불방식:', data.wkFeePayMthdOthr);
            }
        }
    }

    if (data.ntFeeMthdCd) {
        console.log('💳 야간 요금지불방식 코드:', data.ntFeeMthdCd);
        bindCheckboxes('nightPayMethod', data.ntFeeMthdCd);

        // 🔥 "04" 코드가 있고 기타 텍스트가 있으면 입력 필드에 설정
        if (data.ntFeeMthdCd.includes('04') && data.ntFeePayMthdOthr) {
            const nightPayEtcInput = document.getElementById('night_pay_etc_input');
            if (nightPayEtcInput) {
                nightPayEtcInput.value = data.ntFeePayMthdOthr;
                console.log('  ✅ 야간 기타 지불방식:', data.ntFeePayMthdOthr);
            }
        }
    }

    // 🔥 요금정산방식 (쉼표로 구분된 코드)
    if (data.wkFeeStlmtMthdCd) {
        console.log('🧾 주간 요금정산방식 코드:', data.wkFeeStlmtMthdCd);
        bindCheckboxes('daySettleMethod', data.wkFeeStlmtMthdCd);
    }

    if (data.ntFeeStlmtMthdCd) {
        console.log('🧾 야간 요금정산방식 코드:', data.ntFeeStlmtMthdCd);
        bindCheckboxes('nightSettleMethod', data.ntFeeStlmtMthdCd);
    }

    // 🔥 요금지불방식 기타 필드 바인딩
    if (data.wkFeePayMthdOthr) {
        const dayPayEtcInput = document.getElementById('day_pay_etc_input');
        const dayPayEtcChk = document.getElementById('day_pay_etc_chk');
        if (dayPayEtcInput && dayPayEtcChk) {
            dayPayEtcChk.checked = true;
            dayPayEtcInput.disabled = false;
            dayPayEtcInput.value = data.wkFeePayMthdOthr;
            console.log('✅ 주간 요금지불방식 기타:', data.wkFeePayMthdOthr);
        }
    }

    if (data.ntFeePayMthdOthr) {
        const nightPayEtcInput = document.getElementById('night_pay_etc_input');
        const nightPayEtcChk = document.getElementById('night_pay_etc_chk');
        if (nightPayEtcInput && nightPayEtcChk) {
            nightPayEtcChk.checked = true;
            nightPayEtcInput.disabled = false;
            nightPayEtcInput.value = data.ntFeePayMthdOthr;
            console.log('✅ 야간 요금지불방식 기타:', data.ntFeePayMthdOthr);
        }
    }

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

    // 경사구간 정보
    const slope_yes = document.getElementById('slope_yes');
    const slope_no = document.getElementById('slope_no');
    if (slope_yes && slope_no) {
        if (data.slpSecYn === 'Y') {
            slope_yes.checked = true;

            // 🔥 change 이벤트 트리거하여 입력 영역 표시
            slope_yes.dispatchEvent(new Event('change', { bubbles: true }));

            // 🔥 sixleCnt → f_slope_start, sixgtCnt → f_slope_end
            const f_slope_start = document.getElementById('f_slope_start');
            const f_slope_end = document.getElementById('f_slope_end');

            if (f_slope_start && data.sixleCnt) {
                f_slope_start.value = data.sixleCnt;
                console.log('✅ 4% 초과 6% 이하 개수:', data.sixleCnt);
            }
            if (f_slope_end && data.sixgtCnt) {
                f_slope_end.value = data.sixgtCnt;
                console.log('✅ 6% 초과 개수:', data.sixgtCnt);
            }

            console.log('✅ 경사구간 데이터 바인딩:', {
                slpSecYn: data.slpSecYn,
                sixleCnt: data.sixleCnt,
                sixgtCnt: data.sixgtCnt
            });
        } else {
            slope_no.checked = true;

            // 🔥 change 이벤트 트리거
            slope_no.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // 🔥 안전시설 바인딩 (antislpFcltyYn, slpCtnGuidSignYn)
    const antislpFacilityChk = document.getElementById('antislp_facility_chk');
    const slpGuideSignChk = document.getElementById('slp_guide_sign_chk');

    if (antislpFacilityChk) {
        antislpFacilityChk.checked = (data.antislpFcltyYn === 'Y');
        console.log('✅ 미끄럼방지시설:', data.antislpFcltyYn === 'Y' ? '있음' : '없음');
    }

    if (slpGuideSignChk) {
        slpGuideSignChk.checked = (data.slpCtnGuidSignYn === 'Y');
        console.log('✅ 미끄럼주의안내표지판:', data.slpCtnGuidSignYn === 'Y' ? '있음' : '없음');
    }

    // 비고
    const f_partclr_matter = document.getElementById('f_partclr_matter');
    if (f_partclr_matter && data.partclrMatter) {
        f_partclr_matter.value = data.partclrMatter;
        console.log('✅ 특이사항 바인딩 완료');
    }

    // 🔥 주간 운영시간 바인딩
    if (data.wkWkdyOperTmCd) {
        bindOperationTime('day', 'weekday', data.wkWkdyOperTmCd, data.wkWkdyOperStarTm, data.wkWkdyOperEndTm);
    }
    if (data.wkSatOperTmCd) {
        bindOperationTime('day', 'saturday', data.wkSatOperTmCd, data.wkSatOperStarTm, data.wkSatOperEndTm);
    }
    if (data.wkHldyOperTmCd) {
        bindOperationTime('day', 'holiday', data.wkHldyOperTmCd, data.wkHldyOperStarTm, data.wkHldyOperEndTm);
    }

    // 🔥 야간 운영시간 바인딩
    if (data.ntWkdyOperTmCd) {
        bindOperationTime('night', 'weekday', data.ntWkdyOperTmCd, data.ntWkdyOperStarTm, data.ntWkdyOperEndTm);
    }
    if (data.ntSatOperTmCd) {
        bindOperationTime('night', 'saturday', data.ntSatOperTmCd, data.ntSatOperStarTm, data.ntSatOperEndTm);
    }
    if (data.ntHldyOperTmCd) {
        bindOperationTime('night', 'holiday', data.ntHldyOperTmCd, data.ntHldyOperStarTm, data.ntHldyOperEndTm);
    }

    // 🔥 2. 진행상태 확인 후 ReadOnly 처리
    const isApproved = (data.prgsStsCd === '승인' || data.prgsStsCd === 'APPROVED');

    if (isApproved) {
        console.log('🔒 승인 상태 → 전체 필드 ReadOnly 처리');
        setAllFieldsReadOnly(true);

        // 저장 버튼 비활성화
        const btnSave = document.getElementById('btnSave');
        const btnSaveTop = document.getElementById('btnSaveTop');
        if (btnSave) btnSave.setAttribute('disabled', 'true');
        if (btnSaveTop) btnSaveTop.setAttribute('disabled', 'true');
    } else {
        console.log('✏️ 편집 가능 상태');
        setAllFieldsReadOnly(false);

        // 저장 버튼 활성화
        const btnSave = document.getElementById('btnSave');
        const btnSaveTop = document.getElementById('btnSaveTop');
        if (btnSave) btnSave.removeAttribute('disabled');
        if (btnSaveTop) btnSaveTop.removeAttribute('disabled');
    }

    // 헤더 업데이트
    if (v_id) v_id.textContent = data.prkPlceManageNo || '';
    if (v_name) v_name.textContent = data.prkplceNm || '노상주차장 상세';
    updateHeaderAddr();
    recompute();

    // ✅ 동적 UI 업데이트
    setTimeout(() => {
        console.log('🔄 UI 업데이트 시작');

        const chkDay = document.getElementById('chk_day');
        const chkNight = document.getElementById('chk_night');

        if (chkDay && chkDay.checked) {
            chkDay.dispatchEvent(new Event('change'));
        }
        if (chkNight && chkNight.checked) {
            chkNight.dispatchEvent(new Event('change'));
        }

        if (typeof syncFeeSections === 'function') {
            syncFeeSections();
        }

        console.log('✅ UI 업데이트 완료');
    }, 200);

    console.log('✅ 폼 데이터 바인딩 완료');
}

// ========== 🔥 모든 필드를 ReadOnly로 설정하는 함수 ==========
function setAllFieldsReadOnly(isReadOnly) {
    // 텍스트/숫자 입력 필드
    const inputs = $$('input[type="text"], input[type="number"], input[type="tel"], textarea');
    inputs.forEach(input => {
        // 🔥 승인 상태면 모든 필드 readOnly 처리
        if (isReadOnly) {
            input.readOnly = true;
            input.style.backgroundColor = '#f3f4f6';
            input.style.cursor = 'not-allowed';
        } else {
            // 편집 가능 상태에서만 특정 필드 제외
            if (input.id === 'f_id' || input.id === 'f_totalStalls') {
                // 관리번호, 총 주차면수는 항상 readOnly
                input.readOnly = true;
            } else if (input.id === 'f_addr_jibun' || input.id === 'f_addr_road') {
                // 주소는 항상 readOnly (주소찾기 사용)
                input.readOnly = true;
            } else {
                input.readOnly = false;
                input.style.backgroundColor = '';
                input.style.cursor = '';
            }
        }
    });

    // Select 박스
    const selects = $$('select');
    selects.forEach(select => {
        select.disabled = isReadOnly;
    });

    // 라디오/체크박스
    const radiosAndChecks = $$('input[type="radio"], input[type="checkbox"]');
    radiosAndChecks.forEach(input => {
        input.disabled = isReadOnly;
    });

    // 파일 업로드 버튼
    const fileButtons = [
        '#btnPickFromLibrary', '#btnTakePhoto', '#btnUseGeolocation', '#btnClearPhoto',
        '#btnFindAddr',
        '#btnSignPhotoLibrary', '#btnSignPhotoCamera', '#btnClearSignPhoto'
    ];
    fileButtons.forEach(selector => {
        const btn = $(selector);
        if (btn) btn.disabled = isReadOnly;
    });

    console.log(`🔒 모든 필드 ${isReadOnly ? 'ReadOnly' : '편집 가능'} 처리 완료`);
}

// 🔥 운영시간 바인딩 함수 (PRK_004 코드 기반)
function bindOperationTime(timeType, dayType, operTmCd, startTime, endTime) {
    console.log(`🕐 운영시간 바인딩: ${timeType} ${dayType}`, { operTmCd, startTime, endTime });

    const capitalizedDayType = dayType.charAt(0).toUpperCase() + dayType.slice(1);
    const radioName = `${timeType}${capitalizedDayType}Operation`;

    // ✅ codeCd 값으로 직접 라디오 버튼 선택
    const radioButton = document.querySelector(`input[name="${radioName}"][value="${operTmCd}"]`);
    if (radioButton) {
        radioButton.checked = true;
        console.log(`✅ ${radioName} = ${operTmCd} (${radioButton.dataset.codeName})`);

        // change 이벤트 트리거하여 시간 입력 필드 표시/숨김
        radioButton.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        console.warn(`⚠️ 라디오 버튼을 찾을 수 없음: ${radioName} = ${operTmCd}`);
    }

    // 시간제운영인 경우 시간 입력
    if (operTmCd === '02' && startTime && endTime) {
        // HHMM 형식 파싱 (예: '0900' -> 시간: 09, 분: 00)
        const startHour = startTime.substring(0, 2);
        const startMin = startTime.substring(2, 4);
        const endHour = endTime.substring(0, 2);
        const endMin = endTime.substring(2, 4);

        // 시작 시간 입력
        const startHourInput = document.getElementById(`${timeType}_${dayType}_start_hour`);
        const startMinInput = document.getElementById(`${timeType}_${dayType}_start_min`);
        if (startHourInput) startHourInput.value = parseInt(startHour, 10);
        if (startMinInput) startMinInput.value = parseInt(startMin, 10);

        // 종료 시간 입력
        const endHourInput = document.getElementById(`${timeType}_${dayType}_end_hour`);
        const endMinInput = document.getElementById(`${timeType}_${dayType}_end_min`);
        if (endHourInput) endHourInput.value = parseInt(endHour, 10);
        if (endMinInput) endMinInput.value = parseInt(endMin, 10);

        console.log(`✅ 시간제운영 시간 설정: ${startHour}:${startMin} ~ ${endHour}:${endMin}`);
    }
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

// ========== 저장 함수 수정 ==========
async function doSave() {
    try {

        // 🔥 1. 필수 입력 검증 (기본정보 제외)
        const validationErrors = validateRequiredFields();
        if (validationErrors.length > 0) {
            alert('다음 항목을 입력해주세요:\n\n' + validationErrors.join('\n'));
            return;
        }
        const payload = buildPayload();

        // 🔥 prkPlceManageNo 추가 (필수!)
        if (!payload.id) {
            alert('주차장 관리번호가 없습니다. 데이터를 다시 조회해주세요.');
            return;
        }

        // 🔥 서버 전송용 데이터 매핑
        const serverData = mapPayloadToServerFormat(payload);

        console.log('📤 전송 데이터:', serverData);

        const response = await fetch('/prk/onparking-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serverData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            // ✅ 모바일/하이브리드 환경 대응: alert 후 충분한 대기 시간 제공
            alert('저장되었습니다.');

            // 🔥 alert가 완전히 표시된 후 페이지 이동 (1.5초 대기)
            setTimeout(() => {
                window.location.href = '/prk/parkinglist';
            }, 1500);
        } else {
            alert('❌ 저장 실패: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('❌ 저장 중 오류:', error);
        alert('저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 🔥 쉼표 제거 및 숫자 변환 함수 추가
function parseCurrency(value) {
    if (!value) return null;
    // 문자열에서 쉼표 제거 후 숫자로 변환
    const cleaned = value.toString().replace(/,/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return (isNaN(parsed) || parsed <= 0) ? null : parsed;
}

// 🔥 프론트엔드 payload를 서버 VO 형식으로 변환
// 🔥 프론트엔드 payload를 서버 VO 형식으로 변환
function mapPayloadToServerFormat(payload) {
    const data = {
        // 사업관리번호
        prkBizMngNo: loadedBizMngNo,

        // 🔥 필수: 주차장 관리번호
        prkPlceManageNo: payload.id,

        // 기본 정보
        prkplceNm: payload.name,
        dtadd: payload.addrJibun || payload.addrRoad,
        prkPlceLat: payload.lat,
        prkPlceLon: payload.lng,

        // 주차면수
        totPrkCnt: payload.totalStalls,
        disabPrkCnt: payload.stalls.disabled,
        compactPrkCnt: payload.stalls.compact,
        ecoPrkCnt: payload.stalls.eco,
        pregnantPrkCnt: payload.stalls.pregnant,

        // 운영 정보
        prkOperMthdCd: mapOperationType(payload.operationType),
        operMbyCd: mapOwnerType(payload.ownerType),
        mgrOrg: payload.manager.name,
        mgrOrgTelNo: payload.manager.tel,
        subordnOpertnCd: payload.oddEven,

        // 주야간 구분
        dyntDvCd: getDayNightCode(payload.times.day, payload.times.night)
    };

    // 🔥 운영방식 코드 확인
    const operationTypeCode = mapOperationType(payload.operationType);
    const isNormalStreet = (operationTypeCode === '01'); // 일반노상주차장
    const isResident = (operationTypeCode === '02');     // 거주자우선주차장
    const isBoth = (operationTypeCode === '03');         // 복합

    console.log('🔍 운영방식 확인:', {
        원본: payload.operationType,
        변환코드: operationTypeCode,
        일반노상: isNormalStreet,
        거주자우선: isResident,
        복합: isBoth
    });

    // 주간 데이터
    if (payload.times.day && payload.day) {
        data.wkZon = payload.day.grade;
        data.wkFeeAplyCd = payload.day.feeType;

        // 주간 운영시간
        if (payload.day.operatingHours) {
            const weekday = payload.day.operatingHours.weekday;
            data.wkWkdyOperTmCd = weekday.code;
            if (weekday.time) {
                data.wkWkdyOperStarTm = weekday.time.startTime;
                data.wkWkdyOperEndTm = weekday.time.endTime;
            }

            const saturday = payload.day.operatingHours.saturday;
            data.wkSatOperTmCd = saturday.code;
            if (saturday.time) {
                data.wkSatOperStarTm = saturday.time.startTime;
                data.wkSatOperEndTm = saturday.time.endTime;
            }

            const holiday = payload.day.operatingHours.holiday;
            data.wkHldyOperTmCd = holiday.code;
            if (holiday.time) {
                data.wkHldyOperStarTm = holiday.time.startTime;
                data.wkHldyOperEndTm = holiday.time.endTime;
            }
        }

        // 🔥 주간 거주자 요금 - 거주자우선 또는 복합일 때만
        if (isResident || isBoth) {
            data.wkResDayFee = parseCurrency($('#f_day_res_day')?.value);
            data.wkResWkFee = parseCurrency($('#f_day_res_all')?.value);
            data.wkResFtFee = parseCurrency($('#f_day_res_full')?.value);
            console.log('💳 주간 거주자 요금 추가');
        }

        // 🔥 주간 일반 요금 - 일반노상 또는 복합일 때만
        if (isNormalStreet || isBoth) {
            data.wkGnFrst30mFee = parseCurrency($('#f_day_fee_first30')?.value);
            data.wkGnInt10mFee = parseCurrency($('#f_day_fee_per10')?.value);
            data.wkGn1hFee = parseCurrency($('#f_day_fee_per60')?.value);
            data.wkGnDayFee = parseCurrency($('#f_day_fee_daily')?.value);
            data.wkFeeMnthPassPrc = parseCurrency($('#f_day_fee_monthly')?.value);
            data.wkFeeHfyrPassPrc = parseCurrency($('#f_day_fee_halfyear')?.value);
            console.log('💳 주간 일반노상 요금 추가');
        }

        // 주간 지불/정산방식
        data.wkFeeMthdCd = joinCodes(payload.day.payMethods);
        data.wkFeeStlmtMthdCd = joinCodes(payload.day.settleMethods);

        // 기타 항목 추출
        const etcMethod = payload.day.payMethods?.find(m => m.startsWith('기타'));
        if (etcMethod && etcMethod.includes(':')) {
            data.wkFeePayMthdOthr = etcMethod.split(':')[1];
        }
    }

    // 야간 데이터
    if (payload.times.night && payload.night) {
        data.ntZon = payload.night.grade;
        data.ntFeeAplyCd = payload.night.feeType;

        // 야간 운영시간
        if (payload.night.operatingHours) {
            const weekday = payload.night.operatingHours.weekday;
            data.ntWkdyOperTmCd = weekday.code;
            if (weekday.time) {
                data.ntWkdyOperStarTm = weekday.time.startTime;
                data.ntWkdyOperEndTm = weekday.time.endTime;
            }

            const saturday = payload.night.operatingHours.saturday;
            data.ntSatOperTmCd = saturday.code;
            if (saturday.time) {
                data.ntSatOperStarTm = saturday.time.startTime;
                data.ntSatOperEndTm = saturday.time.endTime;
            }

            const holiday = payload.night.operatingHours.holiday;
            data.ntHldyOperTmCd = holiday.code;
            if (holiday.time) {
                data.ntHldyOperStarTm = holiday.time.startTime;
                data.ntHldyOperEndTm = holiday.time.endTime;
            }
        }

        // 🔥 야간 거주자 요금 - 거주자우선 또는 복합일 때만
        if (isResident || isBoth) {
            data.ntResDayFee = parseCurrency($('#f_night_res_all')?.value);
            data.ntResFtFee = parseCurrency($('#f_night_res_full')?.value);
            data.ntResNtFee = parseCurrency($('#f_night_res_night')?.value);
            console.log('💳 야간 거주자 요금 추가');
        }

        // 🔥 야간 일반 요금 - 일반노상 또는 복합일 때만
        if (isNormalStreet || isBoth) {
            data.ntGnFrst30mFee = parseCurrency($('#f_night_fee_first30')?.value);
            data.ntGnInt10mFee = parseCurrency($('#f_night_fee_per10')?.value);
            data.ntGn1hFee = parseCurrency($('#f_night_fee_per60')?.value);
            data.ntGnDayFee = parseCurrency($('#f_night_fee_daily')?.value);
            data.ntFeeMnthPassPrc = parseCurrency($('#f_night_fee_monthly')?.value);
            data.ntFeeHfyrPassPrc = parseCurrency($('#f_night_fee_halfyear')?.value);
            console.log('💳 야간 일반노상 요금 추가');
        }

        // 야간 지불/정산방식
        data.ntFeeMthdCd = joinCodes(payload.night.payMethods);
        data.ntFeeStlmtMthdCd = joinCodes(payload.night.settleMethods);

        // 기타 항목 추출
        const etcMethod = payload.night.payMethods?.find(m => m.startsWith('기타'));
        if (etcMethod && etcMethod.includes(':')) {
            data.ntFeePayMthdOthr = etcMethod.split(':')[1];
        }
    }

    // 경사구간
    if (payload.slope) {
        data.slpSecYn = payload.slope.slpSecYn;
        data.sixleCnt = payload.slope.sixleCnt;
        data.sixgtCnt = payload.slope.sixgtCnt;
    }

    // 안전시설
    if (payload.safety) {
        data.antislpFcltyYn = payload.safety.antislpFcltyYn;
        data.slpCtnGuidSignYn = payload.safety.slpCtnGuidSignYn;
    }

    // 🔥 비고 추가
    data.partclrMatter = payload.partclrMatter || null;

    // 🔥 전송 전 데이터 검증 로그
    console.log('💰 최종 전송 데이터:', data);

    return data;
}

// 🔥 운영방식 코드 변환
function mapOperationType(type) {
    if (type === '01' || type.includes('일반노상')) return '01';
    if (type === '02' || type.includes('거주자우선')) return '02';
    if (type === '03' || type.includes('복합')) return '03';
    return '01';
}

// 🔥 운영주체 코드 변환
function mapOwnerType(type) {
    if (type === '01' || type.includes('지자체')) return '01';
    if (type === '02' || type.includes('민간')) return '02';
    return '01';
}

// 🔥 주야간 구분 코드
function getDayNightCode(isDay, isNight) {
    if (isDay && isNight) return '03'; // 주간+야간
    if (isDay) return '01'; // 주간만
    if (isNight) return '02'; // 야간만
    return '01';
}

// 🔥 배열을 콤마로 연결
function joinCodes(arr) {
    if (!arr || arr.length === 0) return null;
    return arr.join(',');
}

// ========== 🔥 필수 입력 검증 함수 (기본정보 제외) ==========
function validateRequiredFields() {
    const errors = [];

    // 주간/야간 선택 여부 확인
    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;

    if (!isDayChecked && !isNightChecked) {
        errors.push('• 운영 시간대 (주간/야간)를 선택해주세요.');
        return errors; // 선택되지 않으면 추가 검증 불필요
    }

    // 주차장 운영방식
    const opTypeSelected = $$('input[name="opType"]:checked').length > 0;
    if (!opTypeSelected) {
        errors.push('• 주차장 운영방식을 선택해주세요.');
    }

    // 운영주체
    const ownSelected = $$('input[name="own"]:checked').length > 0;
    if (!ownSelected) {
        errors.push('• 운영주체를 선택해주세요.');
    }

    // 민간위탁인 경우 업체명 확인
    const ownRadios = $$('input[name="own"]');
    const selectedOwn = ownRadios.find(r => r.checked);
    if (selectedOwn && selectedOwn.value.includes('민간')) {
        const companyName = $('#f_own_company')?.value?.trim();
        if (!companyName) {
            errors.push('• 민간위탁 업체명을 입력해주세요.');
        }
    }

    // 관리기관명
    const mgrName = $('#f_mgr_name')?.value?.trim();
    if (!mgrName) {
        errors.push('• 관리기관명을 입력해주세요.');
    }

    // 관리기관 전화번호
    const mgrTel = $('#f_mgr_tel')?.value?.trim();
    if (!mgrTel) {
        errors.push('• 관리기관 전화번호를 입력해주세요.');
    }

    // 부제 시행 여부
    const oddEven = $('#f_oddEven')?.value;
    if (!oddEven) {
        errors.push('• 부제 시행 여부를 선택해주세요.');
    }

    // 주간 관련 검증
    if (isDayChecked) {
        // 주간 급지
        const dayGrade = $('#f_day_grade')?.value;
        if (!dayGrade) {
            errors.push('• [주간] 급지를 선택해주세요.');
        }

        // 주간 요금부과여부
        const dayFeeType = $('#f_day_feeType')?.value;
        if (!dayFeeType) {
            errors.push('• [주간] 요금 부과여부를 선택해주세요.');
        }

        // 주간 요금지불방식
        const dayPayMethods = $$('input[name="dayPayMethod"]:checked');
        if (dayPayMethods.length === 0) {
            errors.push('• [주간] 요금 지불방식을 선택해주세요.');
        }

        // 주간 요금정산방식
        const daySettleMethods = $$('input[name="daySettleMethod"]:checked');
        if (daySettleMethods.length === 0) {
            errors.push('• [주간] 요금 정산방식을 선택해주세요.');
        }

        // 주간 운영시간 - 평일
        const dayWeekdayOper = $('input[name="dayWeekdayOperation"]:checked');
        if (!dayWeekdayOper) {
            errors.push('• [주간] 평일 운영시간을 선택해주세요.');
        } else if (dayWeekdayOper.value === '02') {
            // 시간제운영인 경우 시간 입력 확인
            const startHour = $('#day_weekday_start_hour')?.value;
            const startMin = $('#day_weekday_start_min')?.value;
            const endHour = $('#day_weekday_end_hour')?.value;
            const endMin = $('#day_weekday_end_min')?.value;
            if (!startHour || !startMin || !endHour || !endMin) {
                errors.push('• [주간 평일] 시간제운영 시간을 입력해주세요.');
            }
        }

        // 주간 토요일
        const daySaturdayOper = $('input[name="daySaturdayOperation"]:checked');
        if (!daySaturdayOper) {
            errors.push('• [주간] 토요일 운영시간을 선택해주세요.');
        } else if (daySaturdayOper.value === '02') {
            const startHour = $('#day_saturday_start_hour')?.value;
            const startMin = $('#day_saturday_start_min')?.value;
            const endHour = $('#day_saturday_end_hour')?.value;
            const endMin = $('#day_saturday_end_min')?.value;
            if (!startHour || !startMin || !endHour || !endMin) {
                errors.push('• [주간 토요일] 시간제운영 시간을 입력해주세요.');
            }
        }

        // 주간 공휴일
        const dayHolidayOper = $('input[name="dayHolidayOperation"]:checked');
        if (!dayHolidayOper) {
            errors.push('• [주간] 공휴일 운영시간을 선택해주세요.');
        } else if (dayHolidayOper.value === '02') {
            const startHour = $('#day_holiday_start_hour')?.value;
            const startMin = $('#day_holiday_start_min')?.value;
            const endHour = $('#day_holiday_end_hour')?.value;
            const endMin = $('#day_holiday_end_min')?.value;
            if (!startHour || !startMin || !endHour || !endMin) {
                errors.push('• [주간 공휴일] 시간제운영 시간을 입력해주세요.');
            }
        }
    }

    // 야간 관련 검증
    if (isNightChecked) {
        // 야간 급지
        const nightGrade = $('#f_night_grade')?.value;
        if (!nightGrade) {
            errors.push('• [야간] 급지를 선택해주세요.');
        }

        // 야간 요금부과여부
        const nightFeeType = $('#f_night_feeType')?.value;
        if (!nightFeeType) {
            errors.push('• [야간] 요금 부과여부를 선택해주세요.');
        }

        // 야간 요금지불방식
        const nightPayMethods = $$('input[name="nightPayMethod"]:checked');
        if (nightPayMethods.length === 0) {
            errors.push('• [야간] 요금 지불방식을 선택해주세요.');
        }

        // 야간 요금정산방식
        const nightSettleMethods = $$('input[name="nightSettleMethod"]:checked');
        if (nightSettleMethods.length === 0) {
            errors.push('• [야간] 요금 정산방식을 선택해주세요.');
        }

        // 야간 운영시간 - 평일
        const nightWeekdayOper = $('input[name="nightWeekdayOperation"]:checked');
        if (!nightWeekdayOper) {
            errors.push('• [야간] 평일 운영시간을 선택해주세요.');
        } else if (nightWeekdayOper.value === '02') {
            const startHour = $('#night_weekday_start_hour')?.value;
            const startMin = $('#night_weekday_start_min')?.value;
            const endHour = $('#night_weekday_end_hour')?.value;
            const endMin = $('#night_weekday_end_min')?.value;
            if (!startHour || !startMin || !endHour || !endMin) {
                errors.push('• [야간 평일] 시간제운영 시간을 입력해주세요.');
            }
        }

        // 야간 토요일
        const nightSaturdayOper = $('input[name="nightSaturdayOperation"]:checked');
        if (!nightSaturdayOper) {
            errors.push('• [야간] 토요일 운영시간을 선택해주세요.');
        } else if (nightSaturdayOper.value === '02') {
            const startHour = $('#night_saturday_start_hour')?.value;
            const startMin = $('#night_saturday_start_min')?.value;
            const endHour = $('#night_saturday_end_hour')?.value;
            const endMin = $('#night_saturday_end_min')?.value;
            if (!startHour || !startMin || !endHour || !endMin) {
                errors.push('• [야간 토요일] 시간제운영 시간을 입력해주세요.');
            }
        }

        // 야간 공휴일
        const nightHolidayOper = $('input[name="nightHolidayOperation"]:checked');
        if (!nightHolidayOper) {
            errors.push('• [야간] 공휴일 운영시간을 선택해주세요.');
        } else if (nightHolidayOper.value === '02') {
            const startHour = $('#night_holiday_start_hour')?.value;
            const startMin = $('#night_holiday_start_min')?.value;
            const endHour = $('#night_holiday_end_hour')?.value;
            const endMin = $('#night_holiday_end_min')?.value;
            if (!startHour || !startMin || !endHour || !endMin) {
                errors.push('• [야간 공휴일] 시간제운영 시간을 입력해주세요.');
            }
        }
    }

    // 주차면수 확인
    const totalStalls = num($('#f_totalStalls')?.value);
    if (totalStalls === 0) {
        errors.push('• 총 주차면수를 입력해주세요 (세부 주차면수 입력 시 자동 계산됩니다)');
    }

    return errors;
}

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 페이지 로드 완료');

    // 1. 동적 코드 로드
    await CodeLoader.applyAllDynamicCodes();

    // 2. 주간/야간 섹션 설정
    setupDayNightSections();

    // 3. 시간제운영 이벤트 설정
    setupTimeOperationEvents('day');
    setupTimeOperationEvents('night');

    // 4. 경사구간 이벤트 설정
    setupSlopeToggle();

    // 5. 주차장 표지판 이벤트 설정
    setupSignToggle();

    // 🔥 전화번호 입력 필드에 자동 포맷팅 적용
    const f_mgr_tel = document.getElementById('f_mgr_tel');
    if (f_mgr_tel) {
        f_mgr_tel.addEventListener('input', function(e) {
            const cursorPosition = e.target.selectionStart;
            const oldValue = e.target.value;
            const formatted = formatPhoneNumber(oldValue);

            if (formatted !== oldValue) {
                e.target.value = formatted;

                // 커서 위치 조정 (하이픈이 추가되면 커서도 이동)
                const diff = formatted.length - oldValue.length;
                e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
            }
        });

        // 포커스를 잃을 때도 포맷팅
        f_mgr_tel.addEventListener('blur', function(e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    // 6. 저장 버튼 이벤트
    const btnSave = document.getElementById('btnSave');
    const btnSaveTop = document.getElementById('btnSaveTop');
    if (btnSave) btnSave.addEventListener('click', doSave);
    if (btnSaveTop) btnSaveTop.addEventListener('click', doSave);

    // 7. URL에서 관리번호 가져와서 상세 데이터 로드
    const prkPlceManageNo = p.id || f_id?.value;
    if (prkPlceManageNo && prkPlceManageNo !== '') {
        await loadParkingDetail(prkPlceManageNo);
    } else {
        console.log('ℹ️ 신규 등록 모드');
    }
});