/* buildparking.js — 부설주차장 상세 페이지 */

// ========== 유틸 ==========
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function params() {
    const sp = new URLSearchParams(location.search);
    return new Proxy({}, {get: (_, k) => sp.get(k) || ''});
}

function num(v) {
    const n = parseInt((v || '').toString().replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

const p = params();

// 🔥 숫자를 한국 통화 형식으로 포맷팅
function formatCurrency(value) {
    const numValue = Number(value);
    if (!numValue || isNaN(numValue) || numValue <= 0) {
        return '';
    }
    return numValue.toLocaleString('ko-KR');
}

// 🔥 통화 형식 문자열을 숫자로 변환
function parseCurrency(value) {
    if (!value) return null;
    const cleaned = value.toString().replace(/,/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return (isNaN(parsed) || parsed <= 0) ? null : parsed;
}

// 🔥 input 요소에 실시간 통화 포맷팅 적용
function applyCurrencyFormat(input) {
    if (!input) return;

    input.addEventListener('input', function (e) {
        const cursorPosition = this.selectionStart;
        const oldLength = this.value.length;

        const numericValue = this.value.replace(/[^0-9]/g, '');
        const formatted = numericValue ? parseInt(numericValue, 10).toLocaleString('ko-KR') : '';
        this.value = formatted;

        const newLength = formatted.length;
        const diff = newLength - oldLength;
        this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    });

    input.addEventListener('blur', function () {
        if (this.value) {
            const numericValue = this.value.replace(/[^0-9]/g, '');
            this.value = numericValue ? parseInt(numericValue, 10).toLocaleString('ko-KR') : '';
        }
    });
}

// ========== 🔥 행정구역 코드 로더 추가 ==========
const RegionCodeLoader = {
    // 진행상태 로드
    async loadProgressStatus() {
        try {
            const response = await fetch('/cmm/codes/status');
            const result = await response.json();

            const statusSelect = $('#f_status');
            if (!statusSelect) return;

            statusSelect.innerHTML = '<option value="">선택</option>';
            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    statusSelect.appendChild(option);
                });
                console.log('✅ 진행상태 로드 완료:', result.data.length);
            }
        } catch (error) {
            console.error('❌ 진행상태 로드 실패:', error);
        }
    },

    // 시도 목록 로드
    async loadSidoList() {
        try {
            const response = await fetch('/cmm/codes/sido');
            const result = await response.json();

            const sidoSelect = $('#f_sido');
            if (!sidoSelect) return;

            sidoSelect.innerHTML = '<option value="">선택</option>';
            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sidoSelect.appendChild(option);
                });
                console.log('✅ 시도 목록 로드 완료:', result.data.length);
            }
        } catch (error) {
            console.error('❌ 시도 로드 실패:', error);
        }
    },

    // 시군구 목록 로드
    async loadSigunguList(sidoCd) {
        try {
            const sigunguSelect = $('#f_sigungu');
            const emdSelect = $('#f_emd');

            if (!sigunguSelect || !emdSelect) return;

            sigunguSelect.innerHTML = '<option value="">선택</option>';
            emdSelect.innerHTML = '<option value="">선택</option>';
            emdSelect.disabled = true;

            if (!sidoCd) {
                sigunguSelect.disabled = true;
                return;
            }

            const response = await fetch(`/cmm/codes/sigungu?sidoCd=${sidoCd}`);
            const result = await response.json();

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sigunguSelect.appendChild(option);
                });
                sigunguSelect.disabled = false;
                console.log('✅ 시군구 목록 로드 완료:', result.data.length);
            }
        } catch (error) {
            console.error('❌ 시군구 로드 실패:', error);
        }
    },

    // 읍면동 목록 로드
    async loadEmdList(sigunguCd) {
        try {
            const emdSelect = $('#f_emd');
            if (!emdSelect) return;

            emdSelect.innerHTML = '<option value="">선택</option>';

            if (!sigunguCd) {
                emdSelect.disabled = true;
                return;
            }

            const response = await fetch(`/cmm/codes/emd?sigunguCd=${sigunguCd}`);
            const result = await response.json();

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.emdCd;
                    option.textContent = item.lgalEmdNm;
                    emdSelect.appendChild(option);
                });
                emdSelect.disabled = false;
                console.log('✅ 읍면동 목록 로드 완료:', result.data.length);
            }
        } catch (error) {
            console.error('❌ 읍면동 로드 실패:', error);
        }
    },

    // 🔥 이벤트 리스너 설정
    setupEventListeners() {
        const sidoSelect = $('#f_sido');
        const sigunguSelect = $('#f_sigungu');

        if (sidoSelect) {
            sidoSelect.addEventListener('change', (e) => {
                console.log('🔄 시도 변경:', e.target.value);
                this.loadSigunguList(e.target.value);
            });
        }

        if (sigunguSelect) {
            sigunguSelect.addEventListener('change', (e) => {
                console.log('🔄 시군구 변경:', e.target.value);
                this.loadEmdList(e.target.value);
            });
        }
    }
};

// ========== 🔥 동적 코드 로더 ==========
const CodeLoader = {
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
                input.dataset.codeName = code.codeNm;
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

    populateOperationTimeRadios(dayType, codes) {
        const capitalizedDayType = dayType.charAt(0).toUpperCase() + dayType.slice(1);
        const containerId = `#${dayType}_operation_group`;
        const radioName = `${dayType}Operation`;

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
                input.dataset.codeName = code.codeNm;

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
    },

    async applyAllDynamicCodes() {
        const groups = await this.loadDynamicCodes();
        if (!groups) {
            console.warn('⚠️ 동적 코드 로드 실패. 기본 옵션 사용');
            return;
        }

        // PRK_001: 관리주체(소유주체) - (공영/민영 등)
        if (groups['PRK_001']) {
            this.populateRadioGroup('#owner_type_group', 'ownerType', groups['PRK_001'].codes);
        }

        // PRK_015: 급지구분
        if (groups['PRK_015']) {
            this.populateSelect('#f_grade', groups['PRK_015'].codes);
        }

        // PRK_003: 부제시행여부
        if (groups['PRK_003']) {
            this.populateSelect('#f_oddEven', groups['PRK_003'].codes, false);
        }

        // PRK_002: 운영주체
        if (groups['PRK_002']) {
            this.populateRadioGroup('#operation_entity_group', 'operationEntity', groups['PRK_002'].codes);
        }

        // PRK_004: 운영시간코드
        if (groups['PRK_004']) {
            window.OPERATION_TIME_CODES = groups['PRK_004'].codes;
            console.log('✅ PRK_004 운영시간 코드 로드:', window.OPERATION_TIME_CODES);

            this.populateOperationTimeRadios('weekday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('saturday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('holiday', groups['PRK_004'].codes);
        }

        // PRK_007: 요금지불방식
        if (groups['PRK_007']) {
            const codesWithoutEtc = groups['PRK_007'].codes.filter(code =>
                !code.codeNm.includes('기타') && !code.codeCd.includes('기타')
            );

            const payGroup = $('#pay_group');
            if (payGroup) {
                this.populateCheckboxGroup('#pay_group', 'payMethod', codesWithoutEtc);
                this.addEtcCheckbox(payGroup, 'pay_etc_chk', 'pay_etc_input', 'payMethod');
            }
        }

        // PRK_008: 요금정산방식
        if (groups['PRK_008']) {
            this.populateCheckboxGroup('#settle_group', 'settleMethod', groups['PRK_008'].codes);
        }

        // PRK_009: 주차장구분
        if (groups['PRK_009']) {
            this.populateRadioGroup('#parking_type_group', 'parkingType', groups['PRK_009'].codes);
        }

        // PRK_010: 차량인식종류
        if (groups['PRK_010']) {
            this.populateRadioGroup('#vehicle_recognition_group', 'vehicleRecognition', groups['PRK_010'].codes);
        }

        // PRK_011: 기계식주차장형태
        if (groups['PRK_011']) {
            this.populateRadioGroup('#mech_prklot_type_group', 'mechPrklotType', groups['PRK_011'].codes);
        }

        // PRK_012: 기계식주차장 작동여부
        if (groups['PRK_012']) {
            this.populateRadioGroup('#mech_prklot_oper_group', 'mechPrklotOper', groups['PRK_012'].codes);
        }

        console.log('✅ 모든 동적 코드 적용 완료');
    }
};

// ========== 기본 필드 ==========
const f_id = $('#f_id'), f_name = $('#f_name'), f_status = $('#f_status'), f_type = $('#f_type');
const f_sido = $('#f_sido'), f_sigungu = $('#f_sigungu'), f_emd = $('#f_emd');
const f_addrJ = $('#f_addr_jibun'), f_addrR = $('#f_addr_road');
const f_lat = $('#f_lat'), f_lng = $('#f_lng');
const v_id = $('#v_id'), v_name = $('#v_name'), v_addr = $('#v_addr');

// 🔥 샘플 데이터 제거 - URL 파라미터만 사용
if (f_id) f_id.value = p.id || '';
if (f_name) f_name.value = p.name || '';
if (f_status) f_status.value = p.status || '';
if (f_type) f_type.value = '부설';
if (f_sido) f_sido.value = p.sido || '';
if (f_sigungu) f_sigungu.value = p.sigungu || '';
if (f_emd) f_emd.value = p.emd || '';
if (f_addrJ) f_addrJ.value = p.jibun || p.addr || '';
if (f_addrR) f_addrR.value = p.road || '';
if (v_id) v_id.textContent = f_id?.value || '';
if (v_name) v_name.textContent = f_name?.value || '부설주차장 상세';
updateHeaderAddr();

// ========== 주소찾기 레이어 ==========
const layer = $('#postcodeLayer'), container = $('#postcodeContainer');
$('#btnFindAddr')?.addEventListener('click', () => {
    if (!layer || !container) return;
    layer.style.display = 'block';
    container.innerHTML = '';
    new daum.Postcode({
        oncomplete(data) {
            console.log('🔍 다음 주소 API 응답:', data);

            // 🔥 주소 파싱 및 자동 입력
            parseAndFillAddress(data);

            // 레이어 닫기
            layer.style.display = 'none';
        }, width: '100%', height: '100%'
    }).embed(container);
});
$('#postcodeClose')?.addEventListener('click', () => {
    if (layer) layer.style.display = 'none';
});
layer?.addEventListener('click', (e) => {
    if (e.target === layer) layer.style.display = 'none';
});

// 🔥 주소 데이터 파싱 및 입력 함수
async function parseAndFillAddress(data) {
    try {
        console.log('📝 주소 파싱 시작', data);

        // 1. 우편번호
        const f_zip = document.getElementById('f_zip');
        if (f_zip && data.zonecode) {
            f_zip.value = data.zonecode;
            console.log('✅ 우편번호:', data.zonecode);
        }

        // 2. 지번주소 / 도로명주소 먼저 입력
        if (f_addrJ && data.jibunAddress) {
            f_addrJ.value = data.jibunAddress;
            console.log('✅ 지번주소:', data.jibunAddress);
        }

        if (f_addrR) {
            const roadAddr = data.roadAddress || data.autoRoadAddress || '';
            f_addrR.value = roadAddr;
            console.log('✅ 도로명주소:', roadAddr);
        }

        // 3. 시도/시군구/읍면동 코드 매핑용 객체
        const regionMap = {
            sido: data.sido,
            sigungu: data.sigungu,
            bname: data.bname,
            bname1: data.bname1,
            bname2: data.bname2
        };
        console.log('🗺️ 행정구역 정보:', regionMap);

        // 4. 시도 선택 - 축약형을 정식 명칭으로 변환하여 매칭
        if (regionMap.sido) {
            const sidoSelect = $('#f_sido');
            if (sidoSelect) {
                const sidoMap = {
                    '서울': '서울특별시', '부산': '부산광역시', '대구': '대구광역시',
                    '인천': '인천광역시', '광주': '광주광역시', '대전': '대전광역시',
                    '울산': '울산광역시', '세종': '세종특별자치시', '경기': '경기도',
                    '강원': '강원특별자치도', '충북': '충청북도', '충남': '충청남도',
                    '전북': '전북특별자치도', '전남': '전라남도', '경북': '경상북도',
                    '경남': '경상남도', '제주': '제주특별자치도'
                };
                const fullSidoName = sidoMap[regionMap.sido] || regionMap.sido;
                const sidoOption = Array.from(sidoSelect.options).find(
                    opt => opt.textContent.trim() === fullSidoName
                );

                if (sidoOption) {
                    sidoSelect.value = sidoOption.value;
                    console.log('✅ 시도 선택:', fullSidoName, '→', sidoOption.value);
                    sidoSelect.dispatchEvent(new Event('change'));
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    console.warn('⚠️ 시도를 찾을 수 없음:', fullSidoName);
                }
            }
        }

        // 5. 시군구 선택 - 텍스트로 매칭
        if (regionMap.sigungu) {
            const sigunguSelect = $('#f_sigungu');
            if (sigunguSelect) {
                const sigunguOption = Array.from(sigunguSelect.options).find(
                    opt => opt.textContent.trim().includes(regionMap.sigungu)
                );

                if (sigunguOption) {
                    sigunguSelect.value = sigunguOption.value;
                    console.log('✅ 시군구 선택:', regionMap.sigungu, '→', sigunguOption.value);
                    sigunguSelect.dispatchEvent(new Event('change'));
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    console.warn('⚠️ 시군구를 찾을 수 없음:', regionMap.sigungu);
                }
            }
        }

        // 6. 읍면동 선택 - bname 또는 bname1 사용
        const emdTargetName = regionMap.bname1 || (regionMap.bname ? regionMap.bname.split(' ')[0] : '');
        if (emdTargetName) {
            const emdSelect = $('#f_emd');
            if (emdSelect) {
                const emdOption = Array.from(emdSelect.options).find(opt =>
                    opt.textContent.trim() === emdTargetName
                );

                if (emdOption) {
                    emdSelect.value = emdOption.value;
                    console.log('✅ 읍면동 선택:', emdTargetName, '→', emdOption.value);
                    emdSelect.dispatchEvent(new Event('change'));
                } else {
                    console.warn('⚠️ 읍면동을 찾을 수 없음:', emdTargetName);
                }
            }
        }

        // 7. 리 입력 - bname2 또는 bname에서 추출
        const riInput = $('#f_ri');
        if (riInput) {
            riInput.value = ''; // 초기화
            if (regionMap.bname2 && regionMap.bname2.endsWith('리')) {
                riInput.value = regionMap.bname2;
            } else if (regionMap.bname && regionMap.bname.includes(' ')) {
                const parts = regionMap.bname.split(' ');
                const riPart = parts.find(p => p.endsWith('리'));
                if (riPart) {
                    riInput.value = riPart;
                }
            }
            if (riInput.value) console.log('✅ 리 입력:', riInput.value);
        }

        // 8. 산 여부 판단
        const isMountain = data.jibunAddress && data.jibunAddress.includes('산');
        const mountainRadios = document.querySelectorAll('input[name="mountainYn"]');
        mountainRadios.forEach(radio => {
            if (radio.value === (isMountain ? 'Y' : 'N')) {
                radio.checked = true;
            }
        });
        console.log('✅ 산 여부:', isMountain ? '산' : '일반');

        // 9. 본번/부번 파싱
        const jibunAddress = data.jibunAddress || '';
        let mainNum = '';
        let subNum = '';

        const mountainPattern = /산\s*(\d+)/;
        const mountainMatch = jibunAddress.match(mountainPattern);

        if (mountainMatch) {
            mainNum = mountainMatch[1];
        } else {
            // "123-45" 또는 "123" 형식, 공백이나 문자열 끝으로 끝나는 경우
            const addressPattern = /(\d+)(?:-(\d+))?(?=\s|$)/;
            const addressMatch = jibunAddress.match(addressPattern);

            if (addressMatch) {
                mainNum = addressMatch[1];
                subNum = addressMatch[2] || '';
            }
        }

        const mainNumInput = $('#f_mainNum');
        const subNumInput = $('#f_subNum');

        if (mainNumInput) {
            mainNumInput.value = mainNum;
            console.log('✅ 본번:', mainNum);
        }
        if (subNumInput) {
            subNumInput.value = subNum;
            console.log('✅ 부번:', subNum);
        }

        // 10. 건물명 입력
        const buildingNameInput = $('#f_buildingName');
        if (buildingNameInput && data.buildingName) {
            buildingNameInput.value = data.buildingName;
            console.log('✅ 건물명:', data.buildingName);
        }

        // 헤더 주소 업데이트
        updateHeaderAddr();

        console.log('✅ 주소 파싱 및 입력 완료');

    } catch (error) {
        console.error('❌ 주소 파싱 오류:', error);
        alert('주소 정보를 처리하는 중 오류가 발생했습니다.');
    }
}

// ========== 사진 업로드/좌표 ==========
const inLib = $('#f_photo_lib'), inCam = $('#f_photo_cam');
$('#btnPickFromLibrary')?.addEventListener('click', () => inLib?.click());
$('#btnTakePhoto')?.addEventListener('click', () => inCam?.click());
$('#btnUseGeolocation')?.addEventListener('click', async () => {
    const c = await geoFromDevice();
    if (c && f_lat && f_lng) {
        f_lat.value = c.lat.toFixed(6);
        f_lng.value = c.lng.toFixed(6);
    }
});
$('#btnClearPhoto')?.addEventListener('click', () => {
    if (inLib) inLib.value = '';
    if (inCam) inCam.value = '';
    $('#preview')?.removeAttribute('src');
    if (f_lat) f_lat.value = '';
    if (f_lng) f_lng.value = '';
});
inLib?.addEventListener('change', (e) => handleFiles(e.target.files, 'lib'));
inCam?.addEventListener('change', (e) => handleFiles(e.target.files, 'cam'));

async function handleFiles(list, mode) {
    const file = list && list[0];
    if (!file) return;

    uploadProgress.show(file);

    try {
        $('#preview').src = URL.createObjectURL(file);
    } catch (_) {
    }
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
                if (g && typeof g.latitude === 'number' && typeof g.longitude === 'number') coords = {
                    lat: g.latitude,
                    lng: g.longitude
                };
            } catch (_) {
            }
        }
        if (!coords && (/jpe?g$/i.test(file.name) || file.type === 'image/jpeg')) {
            try {
                coords = await readJpegGpsSafe(file);
            } catch (_) {
            }
        }
        if (coords && f_lat && f_lng) {
            f_lat.value = Number(coords.lat).toFixed(6);
            f_lng.value = Number(coords.lng).toFixed(6);
        }
    } catch (err) {
        console.error(err);
        uploadProgress.error('좌표 추출 실패');
    }
}

async function geoFromDeviceSilent() {
    if (!('geolocation' in navigator) || !isSecureContext) return null;
    try {
        const p = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
        }));
        return {lat: p.coords.latitude, lng: p.coords.longitude};
    } catch (_) {
        try {
            const p = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {
                enableHighAccuracy: false,
                timeout: 12000,
                maximumAge: 0
            }));
            return {lat: p.coords.latitude, lng: p.coords.longitude};
        } catch (__) {
            return null;
        }
    }
}

async function geoFromDevice() {
    if (!('geolocation' in navigator)) {
        alert('이 브라우저는 위치 기능을 지원하지 않습니다.');
        return null;
    }
    if (!isSecureContext) {
        alert('HTTPS 또는 http://localhost 에서만 위치 사용 가능');
        return null;
    }
    try {
        const p = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
        }));
        return {lat: p.coords.latitude, lng: p.coords.longitude};
    } catch (e1) {
        try {
            const p = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {
                enableHighAccuracy: false,
                timeout: 12000,
                maximumAge: 0
            }));
            return {lat: p.coords.latitude, lng: p.coords.longitude};
        } catch (e2) {
            alert('위치 확인 실패');
            return null;
        }
    }
}

// ========== JPEG EXIF 보조 파서 ==========
function u16(v, o, le) {
    return v.getUint16(o, !!le);
}

function u32(v, o, le) {
    return v.getUint32(o, !!le);
}

async function readJpegGpsSafe(file) {
    const buf = await file.arrayBuffer();
    const v = new DataView(buf);
    if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
    let off = 2;
    while (off + 4 <= v.byteLength) {
        const marker = v.getUint16(off);
        off += 2;
        if ((marker & 0xFFF0) !== 0xFFE0) break;
        const size = v.getUint16(off);
        off += 2;
        const next = off + size - 2;
        if (next > v.byteLength) break;
        if (marker === 0xFFE1) {
            if (off + 6 <= v.byteLength && v.getUint32(off) === 0x45786966) {
                const c = parseExifForGps(v, off + 6);
                if (c) return c;
            }
        }
        off = next;
    }
    return null;

    function parseExifForGps(view, tiff) {
        if (tiff + 8 > view.byteLength) return null;
        const endian = view.getUint16(tiff), le = endian === 0x4949;
        if (!le && endian !== 0x4D4D) return null;
        const ifd0 = tiff + u32(view, tiff + 4, le);
        if (!rng(ifd0, 2)) return null;
        const n = u16(view, ifd0, le);
        let gpsPtr = 0;
        for (let i = 0; i < n; i++) {
            const e = ifd0 + 2 + i * 12;
            if (!rng(e, 12)) return null;
            const tag = u16(view, e, le);
            if (tag === 0x8825) {
                gpsPtr = tiff + u32(view, e + 8, le);
                break;
            }
        }
        if (!gpsPtr || !rng(gpsPtr, 2)) return null;
        const m = u16(view, gpsPtr, le);
        let latRef = 'N', lonRef = 'E', lat = null, lon = null;
        for (let i = 0; i < m; i++) {
            const e = gpsPtr + 2 + i * 12;
            if (!rng(e, 12)) break;
            const tag = u16(view, e, le), type = u16(view, e + 2, le), cnt = u32(view, e + 4, le);
            const ofsRel = u32(view, e + 8, le);
            const ptr = (cnt <= 4) ? (e + 8) : (tiff + ofsRel);
            if ((tag === 0x0001 || tag === 0x0003) && type === 2 && cnt >= 2) {
                if (rng(ptr, 1)) {
                    const ch = String.fromCharCode(view.getUint8(ptr));
                    if (tag === 0x0001) latRef = ch;
                    if (tag === 0x0003) lonRef = ch;
                }
            }
            if ((tag === 0x0002 || tag === 0x0004) && type === 5 && cnt === 3) {
                const p = tiff + ofsRel;
                if (!rng(p, 24)) continue;
                const d = u32(view, p, le), m2 = u32(view, p + 8, le), s = u32(view, p + 16, le);
                const dd = (d / (u32(view, p + 4, le) || 1)), mm = (m2 / (u32(view, p + 12, le) || 1)),
                    ss = (s / (u32(view, p + 20, le) || 1));
                const dec = dd + (mm / 60) + (ss / 3600);
                if (tag === 0x0002) lat = dec; else if (tag === 0x0004) lon = dec;
            }
        }
        if (lat != null && lon != null) {
            if (latRef === 'S') lat = -lat;
            if (lonRef === 'W') lon = -lon;
            return {lat, lng: lon};
        }
        return null;
    }

    function rng(s, l) {
        return s >= 0 && (s + (l || 0)) <= v.byteLength;
    }
}

// ========== 면수 합계/검증 (항상 자동합계) ==========
const totalInput = $('#f_totalStalls');
const normalInput = $('#f_st_normal');
const disInput = $('#f_st_dis');
const smallInput = $('#f_st_small');
const greenInput = $('#f_st_green');
const pregInput = $('#f_st_preg');

if (totalInput) totalInput.readOnly = true;

function detailSum() {
    return num(normalInput?.value) + num(disInput?.value) + num(smallInput?.value) + num(greenInput?.value) + num(pregInput?.value);
}

function recompute() {
    const sum = detailSum();
    if (totalInput) totalInput.value = sum;
}

[normalInput, disInput, smallInput, greenInput, pregInput].forEach(el => el?.addEventListener('input', recompute));
recompute();

// ========== 헤더 주소 ==========
function updateHeaderAddr() {
    const sido = f_sido?.value?.trim() || '';
    const sigungu = f_sigungu?.value?.trim() || '';
    const emd = f_emd?.value?.trim() || '';
    const j = f_addrJ?.value?.trim() || '';
    const r = f_addrR?.value?.trim() || '';

    const adminArea = [sido, sigungu, emd].filter(Boolean).join(' ');
    const address = [j, r].filter(Boolean).join(' / ');
    const fullAddress = [adminArea, address].filter(Boolean).join(' · ');

    if (v_addr) {
        v_addr.textContent = fullAddress ? ' · ' + fullAddress : '';
    }
}

// ========== 파일 업로드 진행률 관리 ==========
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

        this.fileName.textContent = file.name;
        this.fileSize.textContent = `0MB / ${this.formatFileSize(file.size)}`;
        this.fileStatus.textContent = '전송중';
        this.fileStatus.className = 'file-status uploading';

        this.updateSummary(0, file.size);
        this.updateProgress(0);
        this.updateFileProgress(0);
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

        if (this.btnComplete) this.btnComplete.style.display = 'inline-block';
        if (this.btnCancel) this.btnCancel.style.display = 'none';

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

const uploadProgress = new FileUploadProgress();

// ========== 기계식주차장 작동여부 입력창 토글 함수 ==========
function setupMechPrklotOperToggle() {
    const operGroup = document.getElementById('mech_prklot_oper_group');
    const operInputWrap = document.getElementById('mech_prklot_oper_input_wrap');
    const operValueInput = document.getElementById('f_mech_prklot_oper_value');

    if (!operGroup || !operInputWrap) {
        console.warn('⚠️ 기계식주차장 작동여부 요소를 찾을 수 없습니다.');
        return;
    }

    operGroup.addEventListener('change', function (e) {
        if (e.target.type === 'radio' && e.target.name === 'mechPrklotOper') {
            const selectedValue = e.target.value;

            if (selectedValue === '03') {
                operInputWrap.style.display = 'block';
                console.log('✅ 작동여부 입력창 표시 (codeCd: 03)');
            } else {
                operInputWrap.style.display = 'none';
                if (operValueInput) {
                    operValueInput.value = '';
                }
                console.log('✅ 작동여부 입력창 숨김');
            }
        }
    });

    const checkedRadio = operGroup.querySelector('input[name="mechPrklotOper"]:checked');
    if (checkedRadio && checkedRadio.value === '03') {
        operInputWrap.style.display = 'block';
    }

    console.log('✅ 기계식주차장 작동여부 토글 설정 완료');
}

// ========== 🔥 운영주체 민간위탁/민간직영 토글 ==========
function setupOperationEntityToggle() {
    const operationRadios = $$('input[name="operationEntity"]');
    const companyWrap = $('#operation_company_wrap');

    operationRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const isPrivate = (this.value === '민간위탁' || this.value === '민간직영') && this.checked;
            if (companyWrap) companyWrap.style.display = isPrivate ? 'block' : 'none';
            if (!isPrivate) {
                const companyInput = $('#f_operation_company');
                if (companyInput) companyInput.value = '';
            }
        });
    });

    console.log('✅ 운영주체 토글 설정 완료');
}

// ========== 🔥 시간제운영 처리 함수 ==========
function setupTimeOperationEvents(dayType) {
    const group = $(`#${dayType}_operation_group`);
    const timeWrap = $(`#${dayType}_time_wrap`);

    if (group && timeWrap) {
        group.addEventListener('change', function (e) {
            if (e.target.name === `${dayType}Operation`) {
                timeWrap.style.display = e.target.value === '02' ? 'block' : 'none';
            }
        });
    }
}

// ========== 🔥 주차장 표지판 토글 ==========
function setupSignToggle() {
    const signRadios = $$('input[name="parkingSign"]');
    const signPhotoWrap = $('#sign_photo_wrap');

    if (!signPhotoWrap) {
        console.warn('⚠️ #sign_photo_wrap 요소를 찾을 수 없습니다.');
        return;
    }

    signRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isVisible = radio.checked && (radio.value === 'Y' || radio.value === '있음');
            signPhotoWrap.style.display = isVisible ? 'block' : 'none';
            console.log('🖼️ 표지판 사진:', {value: radio.value, visible: isVisible});
        });
    });

    const checkedSign = signRadios.find(r => r.checked);
    if (checkedSign) {
        const isVisible = checkedSign.value === 'Y' || checkedSign.value === '있음';
        signPhotoWrap.style.display = isVisible ? 'block' : 'none';
    }

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

// ========== 🔥 시설 사진 토글 ==========
function setupFacilityPhotoToggles() {
    // 발권기
    const ticketRadios = $$('input[name="ticketMachine"]');
    const ticketPhotoWrap = $('#ticket_photo_wrap');
    ticketRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isVisible = radio.checked && radio.value === 'Y';
            if (ticketPhotoWrap) ticketPhotoWrap.style.display = isVisible ? 'block' : 'none';
        });
    });

    // 차단기
    const barrierRadios = $$('input[name="barrier"]');
    const barrierPhotoWrap = $('#barrier_photo_wrap');
    const vehicleRecognitionWrap = $('#vehicle_recognition_wrap');
    barrierRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isVisible = radio.checked && radio.value === 'Y';
            if (barrierPhotoWrap) barrierPhotoWrap.style.display = isVisible ? 'block' : 'none';
            if (vehicleRecognitionWrap) vehicleRecognitionWrap.style.display = isVisible ? 'block' : 'none';
        });
    });

    // 출차알람
    const alarmRadios = $$('input[name="alarm"]');
    const exitAlarmPhotoWrap = $('#exit_alarm_photo_wrap');
    alarmRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isVisible = radio.checked && radio.value === 'Y';
            if (exitAlarmPhotoWrap) exitAlarmPhotoWrap.style.display = isVisible ? 'block' : 'none';
        });
    });

    console.log('✅ 시설 사진 토글 설정 완료');
}

// ========== 🔥 주차장 입구 사진 이벤트 ==========
function setupEntrancePhotoEvents() {
    const entrancePhotoLib = $('#f_entrance_photo_lib');
    const entrancePhotoCam = $('#f_entrance_photo_cam');
    const entrancePreview = $('#entrance_preview');
    const entranceLat = $('#f_entrance_lat');
    const entranceLng = $('#f_entrance_lng');

    $('#btnEntrancePhotoLibrary')?.addEventListener('click', () => {
        entrancePhotoLib?.click();
    });

    $('#btnEntrancePhotoCamera')?.addEventListener('click', () => {
        entrancePhotoCam?.click();
    });

    $('#btnClearEntrancePhoto')?.addEventListener('click', () => {
        if (entrancePhotoLib) entrancePhotoLib.value = '';
        if (entrancePhotoCam) entrancePhotoCam.value = '';
        if (entrancePreview) {
            entrancePreview.src = '';
            entrancePreview.style.display = 'none';
        }
        if (entranceLat) entranceLat.value = '';
        if (entranceLng) entranceLng.value = '';
    });

    entrancePhotoLib?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (entrancePreview) {
                entrancePreview.src = URL.createObjectURL(file);
                entrancePreview.style.display = 'block';
            }
        } catch (err) {
            console.error('사진 미리보기 오류:', err);
        }

        try {
            let coords = null;
            if (window.exifr) {
                const gps = await exifr.gps(file);
                if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
                    coords = {lat: gps.latitude, lng: gps.longitude};
                }
            }

            if (coords && entranceLat && entranceLng) {
                entranceLat.value = coords.lat.toFixed(6);
                entranceLng.value = coords.lng.toFixed(6);
            }
        } catch (err) {
            console.error('GPS 좌표 추출 오류:', err);
        }
    });

    entrancePhotoCam?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (entrancePreview) {
                entrancePreview.src = URL.createObjectURL(file);
                entrancePreview.style.display = 'block';
            }
        } catch (err) {
            console.error('사진 미리보기 오류:', err);
        }

        const coords = await geoFromDeviceSilent();
        if (coords && entranceLat && entranceLng) {
            entranceLat.value = coords.lat.toFixed(6);
            entranceLng.value = coords.lng.toFixed(6);
        }
    });

    console.log('✅ 주차장 입구 사진 이벤트 설정 완료');
}

// ========== 🔥 사전점검 이벤트 ==========
function setupPreInspectionEvents() {
    const buildingFloorRadios = $$('input[name="buildingFloor"]');
    const fallPreventionWrap = $('#fall_prevention_wrap');

    buildingFloorRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (fallPreventionWrap) {
                fallPreventionWrap.style.display = (this.value === '2층이상') ? 'block' : 'none';
            }
        });
    });

    console.log('✅ 사전점검 이벤트 설정 완료');
}

// ========== 🔥 보행안전시설 활성화 ==========
function setupPedestrianSafetyEvents() {
    const totalInput = $('#f_totalStalls');
    const pedestrianWrap = $('#pedestrian_safety_wrap');
    const speedBump = $('#f_speed_bump_count');
    const crosswalk = $('#f_crosswalk_count');
    const pedestrianCrossing = $('#f_pedestrian_crossing_count');

    function checkTotalStalls() {
        const total = num(totalInput?.value);
        const isEnabled = total >= 400;

        if (pedestrianWrap) {
            pedestrianWrap.style.opacity = isEnabled ? '1' : '0.5';
            pedestrianWrap.style.pointerEvents = isEnabled ? 'auto' : 'none';
        }

        [speedBump, crosswalk, pedestrianCrossing].forEach(input => {
            if (input) {
                input.disabled = !isEnabled;
                if (!isEnabled) input.value = '';
            }
        });
    }

    if (totalInput) {
        totalInput.addEventListener('input', checkTotalStalls);
        totalInput.addEventListener('change', checkTotalStalls);
    }

    [normalInput, disInput, smallInput, greenInput, pregInput].forEach(input => {
        input?.addEventListener('input', checkTotalStalls);
    });

    checkTotalStalls();
    console.log('✅ 보행안전시설 활성화 설정 완료');
}

// ========== 🔥 주차 첨두 시간대 검증 ==========
function setupPeakTimeValidation() {
    const dayStart = $('#f_peak_day_start');
    const dayEnd = $('#f_peak_day_end');
    const nightStart = $('#f_peak_night_start');
    const nightEnd = $('#f_peak_night_end');

    if (dayStart) {
        dayStart.addEventListener('blur', function () {
            const val = parseInt(this.value);
            if (val < 7 || val > 20) {
                alert('주간 첨두 시작 시간은 7시 이상 20시 이하여야 합니다.');
                this.value = '';
            }
        });
    }

    if (dayEnd) {
        dayEnd.addEventListener('blur', function () {
            const val = parseInt(this.value);
            if (val < 7 || val > 20) {
                alert('주간 첨두 종료 시간은 7시 이상 20시 이하여야 합니다.');
                this.value = '';
            }
            if (dayStart && dayStart.value && val < parseInt(dayStart.value)) {
                alert('종료 시간은 시작 시간보다 커야 합니다.');
                this.value = '';
            }
        });
    }

    if (nightStart) {
        nightStart.addEventListener('blur', function () {
            const val = parseInt(this.value);
            if (val < 20 || val > 23) {
                alert('야간 첨두 시작 시간은 20시 이상 23시 이하여야 합니다.');
                this.value = '';
            }
        });
    }

    if (nightEnd) {
        nightEnd.addEventListener('blur', function () {
            const val = parseInt(this.value);
            if (val < 0 || val > 7) {
                alert('야간 첨두 종료 시간은 익일 0시 이상 7시 이하여야 합니다.');
                this.value = '';
            }
        });
    }

    console.log('✅ 주차 첨두 시간대 검증 설정 완료');
}

// ========== 🔥 전역 변수로 사업관리번호, 정보일련번호 저장 ==========
let loadedBizMngNo = null;
let loadedPrkPlceInfoSn = null;

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

// ========== 🔥 페이지 로드 시 서버에서 데이터 가져오기 ==========
async function loadParkingDetailFromServer() {
    const prkPlceManageNo = p.id;

    if (!prkPlceManageNo) {
        console.warn('⚠️ 주차장 관리번호가 없습니다.');
        return;
    }

    LoadingIndicator.show('주차장 정보를 불러오는 중...');

    try {
        console.log('🔄 부설주차장 상세 정보 로드 시작:', prkPlceManageNo);

        const response = await fetch(`/prk/buildparking-detail?prkPlceManageNo=${encodeURIComponent(prkPlceManageNo)}`);
        const result = await response.json();

        if (result.success && result.data) {
            console.log('✅ 서버 데이터 로드 성공:', result.data);
            await populateFormWithData(result.data);
        } else {
            console.error('❌ 서버 데이터 로드 실패:', result.message);
            alert('주차장 정보를 불러오지 못했습니다: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('❌ 서버 통신 오류:', error);
        alert('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
        LoadingIndicator.hide();
        console.log('✅ 로딩 인디케이터 숨김');
    }
}

// 🔥 서버 데이터로 폼 채우기 ==========
async function populateFormWithData(data) {
    console.log('📝 폼 데이터 채우기 시작', data);

    // 🔥 사업관리번호, 정보일련번호 저장
    if (data.prkBizMngNo) {
        loadedBizMngNo = data.prkBizMngNo;
        console.log('✅ 사업관리번호 저장:', loadedBizMngNo);
    }
    if (data.prkPlceInfoSn) {
        loadedPrkPlceInfoSn = data.prkPlceInfoSn;
        console.log('✅ 정보일련번호 저장:', loadedPrkPlceInfoSn);
    }

    // 기본 정보
    if (f_id) f_id.value = data.prkPlceManageNo || '';
    if (f_name) f_name.value = data.prkplceNm || '';
    // 🔥 진행상태 바인딩 (select)
    if (f_status && data.prgsStsCd) {
        f_status.value = data.prgsStsCd;
        console.log('✅ 진행상태 바인딩:', data.prgsStsCd);
    }
    // 🔥 행정구역 바인딩 (select) - sidoCd, sigunguCd 사용
    if (data.sidoCd) {
        const f_sido = $('#f_sido');
        if (f_sido) {
            f_sido.value = data.sidoCd;
            console.log('✅ 시도코드 바인딩:', data.sidoCd);

            // 시군구 로드
            await RegionCodeLoader.loadSigunguList(data.sidoCd);

            if (data.sigunguCd) {
                const f_sigungu = $('#f_sigungu');
                if (f_sigungu) {
                    f_sigungu.value = data.sigunguCd;
                    console.log('✅ 시군구코드 바인딩:', data.sigunguCd);

                    // 읍면동 로드
                    await RegionCodeLoader.loadEmdList(data.sigunguCd);

                    if (data.emdCd) {
                        const f_emd = $('#f_emd');
                        if (f_emd) {
                            f_emd.value = data.emdCd;
                            console.log('✅ 읍면동코드 바인딩:', data.emdCd);
                        }
                    }
                }
            }
        }
    }
    if (f_addrJ) f_addrJ.value = data.dtadd || '';
    if (f_addrR) f_addrR.value = '';

    // 🔥 우편번호 바인딩
    const f_zip = document.getElementById('f_zip');
    if (f_zip && data.zip) {
        f_zip.value = data.zip;
        console.log('✅ 우편번호 바인딩:', data.zip);
    }

    if (f_lat) f_lat.value = data.prkPlceLat || '';
    if (f_lng) f_lng.value = data.prkPlceLon || '';

    if (v_id) v_id.textContent = data.prkPlceManageNo || '';
    if (v_name) v_name.textContent = data.prkplceNm || '부설주차장 상세';
    updateHeaderAddr();

    // 주차면수
    if (totalInput) totalInput.value = data.totPrkCnt || 0;
    if (disInput) disInput.value = data.disabPrkCnt || 0;
    if (smallInput) smallInput.value = data.compactPrkCnt || 0;
    if (greenInput) greenInput.value = data.ecoPrkCnt || 0;
    if (pregInput) pregInput.value = data.pregnantPrkCnt || 0;

    if (normalInput && data.totPrkCnt) {
        const normal = data.totPrkCnt - (data.disabPrkCnt || 0) - (data.compactPrkCnt || 0)
            - (data.ecoPrkCnt || 0) - (data.pregnantPrkCnt || 0);
        normalInput.value = Math.max(0, normal);
    }

    // 운영주체
    if (data.operMbyCd) {
        const ownRadio = document.querySelector(`input[name="operationEntity"][value="${data.operMbyCd}"]`);
        if (ownRadio) {
            ownRadio.checked = true;
            ownRadio.dispatchEvent(new Event('change'));
        }
    }

    // 관리기관
    const f_mgr_name = $('#f_management_agency');
    const f_mgr_tel = $('#f_management_tel');
    if (f_mgr_name) f_mgr_name.value = data.mgrOrg || '';
    if (f_mgr_tel) f_mgr_tel.value = data.mgrOrgTelNo || '';

    // 부제시행여부
    const f_oddEven = $('#f_oddEven');
    if (f_oddEven && data.subordnOpertnCd) {
        f_oddEven.value = data.subordnOpertnCd;
    }

    // 🔥 급지구분
    const f_grade = $('#f_grade');
    if (f_grade && data.chrgGrdCd) {
        f_grade.value = data.chrgGrdCd;
        console.log('✅ 급지구분 바인딩:', data.chrgGrdCd);
    }

    // 주차관리 시설 정보
    console.log('📌 주차관리 시설 정보:', {
        표지판: data.prklotSignCd,
        발권기: data.tcktMchnYn,
        차단기: data.barrGteYn,
        출차알람: data.exitAlrmYn,
        차량인식: data.vehRcgnTpCd
    });

    if (data.prklotSignCd) {
        const signRadio = document.querySelector(`input[name="parkingSign"][value="${data.prklotSignCd}"]`);
        if (signRadio) {
            signRadio.checked = true;
            signRadio.dispatchEvent(new Event('change'));
        }
    }

    if (data.tcktMchnYn) {
        const ticketRadio = document.querySelector(`input[name="ticketMachine"][value="${data.tcktMchnYn}"]`);
        if (ticketRadio) {
            ticketRadio.checked = true;
            ticketRadio.dispatchEvent(new Event('change'));
        }
    }

    if (data.barrGteYn) {
        const barrierRadio = document.querySelector(`input[name="barrier"][value="${data.barrGteYn}"]`);
        if (barrierRadio) {
            barrierRadio.checked = true;
            barrierRadio.dispatchEvent(new Event('change'));
        }
    }

    if (data.barrGteYn === 'Y' && data.vehRcgnTpCd) {
        const vehRecognitionRadio = document.querySelector(`input[name="vehicleRecognition"][value="${data.vehRcgnTpCd}"]`);
        if (vehRecognitionRadio) {
            vehRecognitionRadio.checked = true;
        }
    }

    if (data.exitAlrmYn) {
        const exitAlarmRadio = document.querySelector(`input[name="alarm"][value="${data.exitAlrmYn}"]`);
        if (exitAlarmRadio) {
            exitAlarmRadio.checked = true;
            exitAlarmRadio.dispatchEvent(new Event('change'));
        }
    }

    console.log('✅ 주차관리 시설 정보 바인딩 완료');

    // 주차 첨두 시간대
    if ($('#f_peak_day_start') && data.wkPeakStrTm) {
        const startHour = data.wkPeakStrTm.substring(0, 2);
        $('#f_peak_day_start').value = parseInt(startHour, 10);
    }
    if ($('#f_peak_day_end') && data.wkPeakEndTm) {
        const endHour = data.wkPeakEndTm.substring(0, 2);
        $('#f_peak_day_end').value = parseInt(endHour, 10);
    }
    if ($('#f_peak_day_count')) {
        $('#f_peak_day_count').value = data.wkPrkVehCnt || '';
    }

    if ($('#f_peak_night_start') && data.ntPeakStrTm) {
        const startHour = data.ntPeakStrTm.substring(0, 2);
        $('#f_peak_night_start').value = parseInt(startHour, 10);
    }
    if ($('#f_peak_night_end') && data.ntPeakEndTm) {
        const endHour = data.ntPeakEndTm.substring(0, 2);
        $('#f_peak_night_end').value = parseInt(endHour, 10);
    }
    if ($('#f_peak_night_count')) {
        $('#f_peak_night_count').value = data.ntPrkVehCnt || '';
    }

    // 주차장 입구 좌표
    if ($('#f_entrance_lat')) $('#f_entrance_lat').value = data.prklotEntrLat || '';
    if ($('#f_entrance_lng')) $('#f_entrance_lng').value = data.prklotEntrLon || '';

    // 사전점검 정보
    if (data.bldg2fPrklotCd) {
        const floorValue = (data.bldg2fPrklotCd === '01' || data.bldg2fPrklotCd === '1') ? '1층' : '2층이상';
        const bldgFloorRadio = document.querySelector(`input[name="buildingFloor"][value="${floorValue}"]`);
        if (bldgFloorRadio) {
            bldgFloorRadio.checked = true;
            bldgFloorRadio.dispatchEvent(new Event('change'));
        }
    }

    if (data.fallPrevFcltyYn) {
        const fallPrevRadio = document.querySelector(`input[name="fallPrevention"][value="${data.fallPrevFcltyYn}"]`);
        if (fallPrevRadio) {
            fallPrevRadio.checked = true;
        }
    }

    if (data.slpYn) {
        const slopeRadio = document.querySelector(`input[name="slope"][value="${data.slpYn}"]`);
        if (slopeRadio) {
            slopeRadio.checked = true;
        }
    }

    if ($('#f_speed_bump_count')) $('#f_speed_bump_count').value = data.spdBumpQty || '';
    if ($('#f_crosswalk_count')) $('#f_crosswalk_count').value = data.stopLineQty || '';
    if ($('#f_pedestrian_crossing_count')) $('#f_pedestrian_crossing_count').value = data.crswlkQty || '';

    // 안전시설
    const antislpFacilityChk = document.getElementById('antislp_facility_chk');
    const slpGuideSignChk = document.getElementById('slp_guide_sign_chk');

    if (antislpFacilityChk) {
        antislpFacilityChk.checked = (data.antislpFcltyYn === 'Y');
    }

    if (slpGuideSignChk) {
        slpGuideSignChk.checked = (data.slpCtnGuidSignYn === 'Y');
    }

    // 특이사항
    if ($('#f_partclr_matter')) $('#f_partclr_matter').value = data.partclrMatter || '';

    // 🔥 진행상태 확인 후 ReadOnly 처리
    const isApproved = (data.prgsStsCd === '승인' || data.prgsStsCd === 'APPROVED');

    if (isApproved) {
        console.log('🔒 승인 상태 → 전체 필드 ReadOnly 처리');
        setAllFieldsReadOnly(true);

        const btnSave = $('#btnSave');
        const btnSaveTop = $('#btnSaveTop');
        if (btnSave) btnSave.setAttribute('disabled', 'true');
        if (btnSaveTop) btnSaveTop.setAttribute('disabled', 'true');
    } else {
        console.log('✏️ 편집 가능 상태');
        setAllFieldsReadOnly(false);

        const btnSave = $('#btnSave');
        const btnSaveTop = $('#btnSaveTop');
        if (btnSave) btnSave.removeAttribute('disabled');
        if (btnSaveTop) btnSaveTop.removeAttribute('disabled');
    }

    console.log('✅ 폼 데이터 채우기 완료');
}

// ========== 🔥 모든 필드를 ReadOnly로 설정하는 함수 ==========
function setAllFieldsReadOnly(isReadOnly) {
    const inputs = $$('input[type="text"], input[type="number"], input[type="tel"], input[type="date"], textarea');
    inputs.forEach(input => {
        if (isReadOnly) {
            input.readOnly = true;
            input.style.backgroundColor = '#f3f4f6';
            input.style.cursor = 'not-allowed';
        } else {
            if (input.id === 'f_id' || input.id === 'f_totalStalls') {
                input.readOnly = true;
            } else if (input.id === 'f_addr_jibun' || input.id === 'f_addr_road') {
                input.readOnly = true;
            } else if (input.id === 'f_entrance_lat' || input.id === 'f_entrance_lng') {
                input.readOnly = true;
            } else {
                input.readOnly = false;
                input.style.backgroundColor = '';
                input.style.cursor = '';
            }
        }
    });

    const selects = $$('select');
    selects.forEach(select => {
        select.disabled = isReadOnly;
    });

    const radiosAndChecks = $$('input[type="radio"], input[type="checkbox"]');
    radiosAndChecks.forEach(input => {
        input.disabled = isReadOnly;
    });

    const fileButtons = [
        '#btnPickFromLibrary', '#btnTakePhoto', '#btnUseGeolocation', '#btnClearPhoto',
        '#btnFindAddr',
        '#btnEntrancePhotoLibrary', '#btnEntrancePhotoCamera', '#btnClearEntrancePhoto',
        '#btnSignPhotoLibrary', '#btnSignPhotoCamera', '#btnClearSignPhoto',
        '#btnTicketPhotoLibrary', '#btnTicketPhotoCamera', '#btnClearTicketPhoto',
        '#btnBarrierPhotoLibrary', '#btnBarrierPhotoCamera', '#btnClearBarrierPhoto',
        '#btnExitAlarmPhotoLibrary', '#btnExitAlarmPhotoCamera', '#btnClearExitAlarmPhoto'
    ];
    fileButtons.forEach(selector => {
        const btn = $(selector);
        if (btn) btn.disabled = isReadOnly;
    });

    console.log(`🔒 모든 필드 ${isReadOnly ? 'ReadOnly' : '편집 가능'} 처리 완료`);
}

// 🔥 좌표로 행정구역 정보 가져오기
async function convertCoordToRegion(longitude, latitude) {
    try {
        const response = await fetch(`/api/kakao/coord2region?longitude=${longitude}&latitude=${latitude}`);
        const result = await response.json();

        if (result.success) {
            // 시도, 시군구, 읍면동 자동 입력
            if (result.sido) {
                document.getElementById('f_sido').value = result.sido;
            }
            if (result.sigungu) {
                document.getElementById('f_sigungu').value = result.sigungu;
            }
            if (result.emd) {
                document.getElementById('f_emd').value = result.emd;
            }

            console.log('좌표->행정구역 변환 성공:', result);

            // 헤더 주소 업데이트
            updateHeaderAddr();

            return result;
        } else {
            console.warn('행정구역 변환 실패:', result.message);
        }
    } catch (error) {
        console.error('좌표->행정구역 변환 에러:', error);
    }
}

// 🔥 좌표를 주소로 변환하는 함수 (우편번호 포함)
async function convertCoordToAddress(longitude, latitude) {
    try {
        const response = await fetch(`/api/kakao/coord2address?longitude=${longitude}&latitude=${latitude}`);
        const result = await response.json();

        if (result.success) {
            // 지번 주소
            if (result.jibunAddress) {
                document.getElementById('f_addr_jibun').value = result.jibunAddress;
            }

            // 도로명 주소
            if (result.roadAddress) {
                document.getElementById('f_addr_road').value = result.roadAddress;
            }

            // 🔥 우편번호 저장
            if (result.zoneNo) {
                const f_zip = document.getElementById('f_zip');
                if (f_zip) {
                    f_zip.value = result.zoneNo;
                    console.log('📮 우편번호 저장:', result.zoneNo);
                }
            }

            // 시도, 시군구, 읍면동 추출
            if (result.data && result.data.address) {
                const addr = result.data.address;
                document.getElementById('f_sido').value = addr.region_1depth_name || '';
                document.getElementById('f_sigungu').value = addr.region_2depth_name || '';
                document.getElementById('f_emd').value = addr.region_3depth_name || '';
            }

            // 🔥 추가: 행정구역 정보도 함께 가져오기
            await convertCoordToRegion(longitude, latitude);

            console.log('좌표->주소 변환 성공:', result);

            // 헤더 주소 업데이트
            updateHeaderAddr();

            return result;
        } else {
            console.warn('주소 변환 실패:', result.message);
            alert('주소를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('좌표->주소 변환 에러:', error);
        alert('주소 변환 중 오류가 발생했습니다.');
    }
}

// 기기 위치로 좌표 설정 버튼 클릭 시 주소 및 행정구역도 함께 가져오기
document.getElementById('btnUseGeolocation')?.addEventListener('click', async function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function (position) {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);

                document.getElementById('f_lat').value = lat;
                document.getElementById('f_lng').value = lng;

                // 좌표를 주소로 변환 (우편번호 포함)
                await convertCoordToAddress(lng, lat);

                alert('현재 위치의 좌표, 주소, 우편번호, 행정구역 정보를 가져왔습니다.');
            },
            function (error) {
                console.error('위치 정보 가져오기 실패:', error);
                alert('위치 정보를 가져올 수 없습니다.');
            }
        );
    } else {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
});

// EXIF에서 GPS 좌표를 추출한 후 주소 및 행정구역으로 변환
async function handlePhotoWithGPS(file) {
    try {
        const exif = await exifr.parse(file);
        if (exif && exif.latitude && exif.longitude) {
            const lat = exif.latitude.toFixed(6);
            const lng = exif.longitude.toFixed(6);

            document.getElementById('f_lat').value = lat;
            document.getElementById('f_lng').value = lng;

            // 좌표를 주소로 변환 (우편번호 포함)
            await convertCoordToAddress(lng, lat);

            alert('사진에서 GPS 좌표, 주소, 우편번호, 행정구역 정보를 추출했습니다.');
        } else {
            alert('사진에 GPS 정보가 없습니다.');
        }
    } catch (error) {
        console.error('EXIF 파싱 에러:', error);
    }
}

// ========== 저장 함수 수정 ==========
async function doSave() {
    try {
        console.log('🚀 저장 프로세스 시작');

        const ownerTypeCode = document.querySelector('input[name="parkingType"]:checked')?.value;
        if (!ownerTypeCode) {
            alert('관리주체(소유주체)를 선택해주세요.');
            // 저장 버튼 비활성화 등 UI 처리 로직이 있다면 여기서 복구해주는 것이 좋습니다.
            return; // 저장 프로세스를 중단합니다.
        }

        const validationErrors = validateRequiredFields();
        if (validationErrors.length > 0) {
            alert('다음 항목을 입력해주세요:\n\n' + validationErrors.join('\n'));
            console.warn('❌ 유효성 검사 실패:', validationErrors);
            return;
        }
        console.log('✅ 유효성 검사 통과');


        const payload = buildPayload();
        console.log('📝 생성된 Payload:', payload);

        const isNewRecord = !payload.id || payload.id.trim() === '';
        console.log(isNewRecord ? '✨ 신규 등록 모드' : `✏️ 수정 모드 (ID: ${payload.id})`);


        const serverData = mapPayloadToServerFormat(payload);

        // 🔥 신규 등록 시 주차장관리번호를 보내지 않아야 서버에서 자동 생성됩니다. (onparking.js 참조)
        if (isNewRecord) {
            delete serverData.prkPlceManageNo;
            console.log('🗑️ 신규 등록이므로 prkPlceManageNo 필드 제거');
        }

        console.log('📤 서버 전송 데이터:', serverData);


        const formData = new FormData();
        formData.append('parkingData', new Blob([JSON.stringify(serverData)], {
            type: 'application/json'
        }));

        // 🔥 사진 파일들을 FormData에 추가 (onparking.js 형식)
        const photoInputs = {
            mainPhoto: ['f_photo_lib', 'f_photo_cam'],
            signPhoto: ['f_sign_photo_lib', 'f_sign_photo_cam'],
            ticketPhoto: ['f_ticket_photo_lib', 'f_ticket_photo_cam'],
            barrierPhoto: ['f_barrier_photo_lib', 'f_barrier_photo_cam'],
            exitAlarmPhoto: ['f_exit_alarm_photo_lib', 'f_exit_alarm_photo_cam'],
            entrancePhoto: ['f_entrance_photo_lib', 'f_entrance_photo_cam']
        };

        for (const [key, ids] of Object.entries(photoInputs)) {
            const libInput = document.getElementById(ids[0]);
            const camInput = document.getElementById(ids[1]);

            if (libInput && libInput.files.length > 0) {
                formData.append(key, libInput.files[0]);
                console.log(`📸 사진 추가 (${key}):`, libInput.files[0].name);
            } else if (camInput && camInput.files.length > 0) {
                formData.append(key, camInput.files[0]);
                console.log(`📸 사진 추가 (${key}):`, camInput.files[0].name);
            }
        }


        console.log('📡 서버에 데이터 전송 시작...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('⏰ 요청 시간 초과');
        }, 30000);


        const response = await fetch('/prk/buildparking-update', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 서버 에러 응답:', {status: response.status, body: errorText});
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }

        const result = await response.json();
        console.log('✅ 서버 응답:', result);


        if (result.success) {
            alert(isNewRecord ? '신규 등록되었습니다.' : '수정되었습니다.');
            setTimeout(() => {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({type: 'navigate', url: '/prk/parkinglist'}, '*');
                } else {
                    location.href = '/prk/parkinglist';
                }
            }, 500);
        } else {
            alert('❌ 저장 실패: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('💥 저장 프로세스 중 예외 발생:', error);
        if (error.name === 'AbortError') {
            alert('⏰ 서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        } else {
            alert('저장 중 오류가 발생했습니다. 개발자 콘솔을 확인해주세요.');
        }
    }
}

function buildPayload() {
    const payload = {
        id: f_id?.value,
        name: f_name?.value,
        status: f_status?.value,
        type: '부설',
        sido: f_sido?.value,
        sigungu: f_sigungu?.value,
        emd: f_emd?.value,
        addrJibun: f_addrJ?.value,
        addrRoad: f_addrR?.value,
        lat: f_lat?.value,
        lng: f_lng?.value,

        totalStalls: num(totalInput?.value),
        stalls: {
            normal: num(normalInput?.value),
            disabled: num(disInput?.value),
            compact: num(smallInput?.value),
            eco: num(greenInput?.value),
            pregnant: num(pregInput?.value)
        }
    };

    return payload;
}

function mapPayloadToServerFormat(payload) {
    const data = {
        prkBizMngNo: loadedBizMngNo,
        prkPlceInfoSn: loadedPrkPlceInfoSn,
        prkPlceManageNo: payload.id,
        prkplceNm: payload.name,
        dtadd: payload.addrJibun || payload.addrRoad,
        prkPlceLat: payload.lat,
        prkPlceLon: payload.lng,

        // 🔥 우편번호 추가
        zip: document.getElementById('f_zip')?.value || null,

        /* ==========  지번 정보 ========== */
        bdnbr: document.getElementById('f_buildingName')?.value || null,
        lnmMnno: document.getElementById('f_mainNum')?.value || null,
        lnmSbno: document.getElementById('f_subNum')?.value || null,
        mntnYn: document.querySelector('input[name="mountainYn"]:checked')?.value || 'N',
        liCd: document.getElementById('f_ri')?.value || null,
        rnmadr: document.getElementById('f_addr_road')?.value || null,


        totPrkCnt: payload.totalStalls,
        disabPrkCnt: payload.stalls.disabled,
        compactPrkCnt: payload.stalls.compact,
        ecoPrkCnt: payload.stalls.eco,
        pregnantPrkCnt: payload.stalls.pregnant,

        prkplceSe: document.querySelector('input[name="parkingType"]:checked')?.value,

        operMbyCd: document.querySelector('input[name="operationEntity"]:checked')?.value,
        mgrOrg: $('#f_management_agency')?.value,
        mgrOrgTelNo: $('#f_management_tel')?.value,
        subordnOpertnCd: $('#f_oddEven')?.value,
        chrgGrdCd: $('#f_grade')?.value, // 🔥 급지구분 추가

        prklotSignYn: document.querySelector('input[name="parkingSign"]:checked')?.value,
        tcktMchnYn: document.querySelector('input[name="ticketMachine"]:checked')?.value,
        barrGteYn: document.querySelector('input[name="barrier"]:checked')?.value,
        exitAlrmYn: document.querySelector('input[name="alarm"]:checked')?.value,
        vehRcgnTpCd: document.querySelector('input[name="vehicleRecognition"]:checked')?.value,

        wkPeakStrTm: formatPeakTime($('#f_peak_day_start')?.value),
        wkPeakEndTm: formatPeakTime($('#f_peak_day_end')?.value),
        wkPrkVehCnt: num($('#f_peak_day_count')?.value),
        ntPeakStrTm: formatPeakTime($('#f_peak_night_start')?.value),
        ntPeakEndTm: formatPeakTime($('#f_peak_night_end')?.value),
        ntPrkVehCnt: num($('#f_peak_night_count')?.value),

        prklotEntrLat: $('#f_entrance_lat')?.value,
        prklotEntrLon: $('#f_entrance_lng')?.value,

        bldg2fPrklotCd: document.querySelector('input[name="buildingFloor"]:checked')?.value === '1층' ? '01' : '02',
        fallPrevFcltyYn: document.querySelector('input[name="fallPrevention"]:checked')?.value,
        slpYn: document.querySelector('input[name="slope"]:checked')?.value,
        antislpFcltyYn: $('#antislp_facility_chk')?.checked ? 'Y' : 'N',
        slpCtnGuidSignYn: $('#slp_guide_sign_chk')?.checked ? 'Y' : 'N',

        spdBumpQty: num($('#f_speed_bump_count')?.value),
        stopLineQty: num($('#f_crosswalk_count')?.value),
        crswlkQty: num($('#f_pedestrian_crossing_count')?.value),

        partclrMatter: $('#f_partclr_matter')?.value
    };

    return data;
}

function formatPeakTime(hour) {
    if (!hour) return null;
    const h = String(hour).padStart(2, '0');
    return h + '00';
}

function validateRequiredFields() {
    const errors = [];

    const total = num(totalInput?.value);
    if (total === 0) {
        errors.push('• 총 주차면수를 입력해주세요');
    }

    const ownSelected = $$('input[name="operationEntity"]:checked').length > 0;
    if (!ownSelected) {
        errors.push('• 운영주체를 선택해주세요');
    }

    const mgrName = $('#f_management_agency')?.value?.trim();
    if (!mgrName) {
        errors.push('• 관리기관명을 입력해주세요');
    }

    const oddEven = $('#f_oddEven')?.value;
    if (!oddEven) {
        errors.push('• 부제 시행 여부를 선택해주세요');
    }

    return errors;
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log('=== 부설주차장 페이지 초기화 시작 ===');

    try {
        console.log('Step 1: 초기화 시작');
        const isNewRecord = !p.id;

        console.log('Step 2: 공통 코드 로드 시작');
        await RegionCodeLoader.loadProgressStatus();
        console.log('Step 2a: 진행상태 로드 완료');

        await RegionCodeLoader.loadSidoList();
        console.log('Step 2b: 시도 목록 로드 완료');

        RegionCodeLoader.setupEventListeners();
        console.log('Step 2c: 행정구역 리스너 설정 완료');

        await CodeLoader.applyAllDynamicCodes();
        console.log('Step 2d: 동적 코드 적용 완료');

        console.log('Step 3: UI 이벤트 리스너 설정 시작');
        setupMechPrklotOperToggle();
        setupOperationEntityToggle();
        setupTimeOperationEvents('weekday');
        setupTimeOperationEvents('saturday');
        setupTimeOperationEvents('holiday');
        setupSignToggle();
        setupFacilityPhotoToggles();
        setupEntrancePhotoEvents();
        setupPreInspectionEvents();
        setupPedestrianSafetyEvents();
        setupPeakTimeValidation();
        console.log('Step 3a: UI 이벤트 리스너 설정 완료');

        console.log('Step 4: 저장 버튼 이벤트 리스너 등록');
        const btnSave = document.getElementById('btnSave');
        const btnSaveTop = document.getElementById('btnSaveTop');

        if (btnSave) {
            btnSave.addEventListener('click', function (e) {
                e.preventDefault();
                doSave();
            });
        } else {
            console.error('❌ btnSave 요소를 찾을 수 없습니다!');
        }

        if (btnSaveTop) {
            btnSaveTop.addEventListener('click', function (e) {
                e.preventDefault();
                doSave();
            });
        } else {
            console.error('❌ btnSaveTop 요소를 찾을 수 없습니다!');
        }
        console.log('Step 4a: 저장 버튼 이벤트 리스너 등록 완료');

        console.log(`Step 5: 모드 분기 처리 (isNewRecord: ${isNewRecord})`);
        if (isNewRecord) {
            console.log('✨ 신규 등록 모드입니다.');
            if (f_status) {
                f_status.value = '10'; // '조사중' 코드
            }
        } else {
            console.log(`✏️ 수정 모드입니다. (ID: ${p.id})`);
            await loadParkingDetailFromServer();
        }
        console.log('Step 5a: 모드 분기 처리 완료');

        console.log('=== 부설주차장 페이지 초기화 완료 ===');

    } catch (error) {
        console.error('❌ 페이지 초기화 중 심각한 오류 발생:', error);
        alert('페이지 초기화 중 오류가 발생했습니다. 개발자 콘솔을 확인해주세요.');
    }
});

/**
 * 🔥 저장 성공 후 페이지 처리 공통 함수
 * @param {string} fallbackUrl - 부모 창이 없을 때 이동할 목록 페이지 URL
 */
function handlePostSave(fallbackUrl) {
    // 1. 알림 표시
    alert('저장이 완료되었습니다.');

    // 2. 부모 창(Opener)이 존재하는지 확인 (새 탭/팝업으로 열린 경우)
    if (window.opener && !window.opener.closed) {
        try {
            // 부모 창에 reloadList 함수가 있으면 실행
            if (typeof window.opener.reloadList === 'function') {
                window.opener.reloadList();
            } else {
                // 함수가 없으면 단순히 부모 창 새로고침
                window.opener.location.reload();
            }

            // 부모 창으로 포커스 이동 (브라우저 정책에 따라 제한될 수 있음)
            window.opener.focus();

        } catch (e) {
            console.warn('부모 창 제어 중 오류 (Cross-Origin 등):', e);
        } finally {
            // 현재 창 닫기
            window.close();
        }
    }
    // 3. 부모 창이 없는 경우 (그냥 페이지 이동으로 들어온 경우)
    else {
        location.href = fallbackUrl;
    }
}