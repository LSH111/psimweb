/* onparking.js — 노상주차장 상세 페이지 (주간/야간 기능 + 동적 코드) */

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

// ========== 🔥 행정구역 코드 로더 추가 ==========
const RegionCodeLoader = {
    // 진행상태 로드
    async loadProgressStatus() {
        try {
            const response = await fetch('/cmm/codes/status');
            const result = await response.json();
            const statusSelect = $('#f_status');
            if (!statusSelect) {
                return;
            }

            statusSelect.innerHTML = '<option value="">선택</option>';

            if (result.success && result.data && Array.isArray(result.data)) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    statusSelect.appendChild(option);
                });
            } else {
                console.error('❌ 진행상태 데이터 없음 또는 형식 오류:', result);
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
            }
        } catch (error) {
            console.error('시도 로드 실패:', error);
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
            }
        } catch (error) {
            console.error('시군구 로드 실패:', error);
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
            }
        } catch (error) {
            console.error('읍면동 로드 실패:', error);
        }
    },

    // 🔥 이벤트 리스너 설정
    setupEventListeners() {
        const sidoSelect = $('#f_sido');
        const sigunguSelect = $('#f_sigungu');

        if (sidoSelect) {
            sidoSelect.addEventListener('change', (e) => {
                this.loadSigunguList(e.target.value);
            });
        }

        if (sigunguSelect) {
            sigunguSelect.addEventListener('change', (e) => {
                this.loadEmdList(e.target.value);
            });
        }
    }
};

// ========== 🔥 동적 코드 로더 ==========
const CodeLoader = {
    // 1️⃣ 서버에서 모든 코드 그룹 가져오기
    async loadDynamicCodes() {
        try {
            const response = await fetch('/cmm/codes/dynamic-groups');
            const result = await response.json();
            if (result.success && result.groups) {
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

// ========== 🔥 공통 유효성 검증 모듈 ==========
const FormValidator = {
    firstErrorElement: null,

    /**
     * [수정됨] UI 에러 스타일만 안전하게 제거
     * 값(value)은 절대 건드리지 않음
     */
    clearErrorStyles() {
        this.firstErrorElement = null;

        // 1. 에러 클래스가 붙은 요소들 찾기
        const errorElements = document.querySelectorAll('.input-error');

        // 2. 호환성 높은 반복문 사용 (Array.from 의존성 제거)
        for (let i = 0; i < errorElements.length; i++) {
            errorElements[i].classList.remove('input-error', 'shake-element');
        }

        // 3. 토스트 메시지가 떠있다면 제거 (선택사항)
        const toast = document.getElementById('toast-container');
        if (toast) toast.innerHTML = '';

        console.log('🧹 유효성 UI 초기화 완료 (값은 유지됨)');
    },

    /**
     * 단일 필드 검증 (Input, Select)
     * @param {string} selector - CSS 선택자 (예: '#f_name')
     * @param {string} message - 에러 메시지
     * @returns {boolean} - 유효하면 true, 아니면 false
     */
    check(selector, message) {
        const el = document.querySelector(selector);
        // 요소가 없거나 값이 비어있으면 에러 처리
        if (!el || !el.value || el.value.trim() === '') {
            this.showError(el, message);
            return false;
        }
        return true;
    },

    /**
     * 라디오 버튼 그룹 검증
     * @param {string} name - input name 속성 (예: 'own')
     * @param {string} message - 에러 메시지
     * @returns {boolean}
     */
    checkRadio(name, message) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
            // 라디오 그룹은 부모 요소나 첫 번째 라디오 버튼에 시각적 효과를 줄 수 있음
            const firstRadio = document.querySelector(`input[name="${name}"]`);
            // 보통 라디오 버튼은 부모 div(.radio-group)에 테두리를 주는 것이 좋음
            const container = firstRadio ? firstRadio.closest('.radio-group') || firstRadio.parentElement : null;
            this.showError(container || firstRadio, message);
            return false;
        }
        return true;
    },

    /**
     * 에러 표시 및 포커스 저장 로직
     */
    showError(element, message) {
        if (!element) return;

        // 1. 빨간 테두리 및 흔들림 효과 추가
        element.classList.add('input-error', 'shake-element');

        // 2. 애니메이션 후 shake 클래스 제거 (재실행 가능하도록)
        setTimeout(() => element.classList.remove('shake-element'), 500);

        // 3. 첫 번째 에러만 기록 (스크롤 이동 및 토스트 메시지용)
        if (!this.firstErrorElement) {
            this.firstErrorElement = element;

            // 토스트 메시지 표시
            this.showToast(message);

            // 해당 위치로 스크롤 및 포커스
            element.scrollIntoView({behavior: 'smooth', block: 'center'});
            if (element.tagName !== 'DIV') element.focus();
        }
    },

    /**
     * 토스트 메시지 출력 UI
     */
    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) {
            alert(message); // 컨테이너 없으면 fallback
            return;
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message warning';
        toast.innerHTML = `<span>⚠️</span> ${message}`;

        container.appendChild(toast);

        // 3초 후 제거
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    // 호환성을 위해 reset을 호출해도 clearErrorStyles가 실행되도록 연결
    reset() {
        this.clearErrorStyles();
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
if (f_type) f_type.value = '노상';
if (f_sido) f_sido.value = p.sido || '';
if (f_sigungu) f_sigungu.value = p.sigungu || '';
if (f_emd) f_emd.value = p.emd || '';
if (f_addrJ) f_addrJ.value = p.jibun || p.addr || '';
if (f_addrR) f_addrR.value = p.road || '';
if (v_id) v_id.textContent = f_id?.value || '';
if (v_name) v_name.textContent = f_name?.value || '노상주차장 상세';
updateHeaderAddr();

// ========== 주소찾기 레이어 ==========
const layer = $('#postcodeLayer'), container = $('#postcodeContainer');
$('#btnFindAddr')?.addEventListener('click', () => {
    if (!layer || !container) return;
    layer.style.display = 'block';
    container.innerHTML = '';
    new daum.Postcode({
        oncomplete(data) {
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

// ========== 🔥 주소 데이터 파싱 및 입력 함수 ==========
async function parseAndFillAddress(data) {
    try {
        // 🔥 1. 우편번호
        const f_zip = document.getElementById('f_zip');
        if (f_zip && data.zonecode) {
            f_zip.value = data.zonecode;
        }
        // 🔥 2. 지번주소 / 도로명주소 먼저 입력
        if (f_addrJ && data.jibunAddress) {
            f_addrJ.value = data.jibunAddress;
        }

        if (f_addrR) {
            const roadAddr = data.roadAddress || data.autoRoadAddress || '';
            f_addrR.value = roadAddr;
        }
        // 🔥 3. 시도/시군구/읍면동 코드 매핑용 객체
        const regionMap = {
            sido: data.sido,          // "충북"
            sigungu: data.sigungu,    // "영동군"
            bname: data.bname,        // "황간면" 또는 "황간면 남성리" (읍면동 + 리)
            bname1: data.bname1,      // "황간면" (읍면동만)
            bname2: data.bname2       // "남성리" (리만)
        };
        // 🔥 4. 시도 선택 - 축약형을 정식 명칭으로 변환하여 매칭
        if (regionMap.sido) {
            const sidoSelect = $('#f_sido');
            if (sidoSelect) {
                // 🔥 축약형 → 정식 명칭 매핑
                const sidoMap = {
                    '서울': '서울특별시',
                    '부산': '부산광역시',
                    '대구': '대구광역시',
                    '인천': '인천광역시',
                    '광주': '광주광역시',
                    '대전': '대전광역시',
                    '울산': '울산광역시',
                    '세종': '세종특별자치시',
                    '경기': '경기도',
                    '강원': '강원도',
                    '충북': '충청북도',
                    '충남': '충청남도',
                    '전북': '전라북도',
                    '전남': '전라남도',
                    '경북': '경상북도',
                    '경남': '경상남도',
                    '제주': '제주특별자치도'
                };
                const fullSidoName = sidoMap[regionMap.sido] || regionMap.sido;
                // 옵션 중에서 정식 명칭으로 매칭
                const sidoOption = Array.from(sidoSelect.options).find(
                    opt => opt.textContent.trim() === fullSidoName
                );

                if (sidoOption) {
                    sidoSelect.value = sidoOption.value;
                    // change 이벤트 발생시켜 시군구 로드
                    sidoSelect.dispatchEvent(new Event('change'));
                    // 시군구 로드 대기
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    console.warn('⚠️ 시도를 찾을 수 없음:', fullSidoName);
                }
            }
        }

        // 🔥 5. 시군구 선택 - 텍스트로 매칭
        if (regionMap.sigungu) {
            const sigunguSelect = $('#f_sigungu');
            if (sigunguSelect) {
                // 옵션 중에서 텍스트가 포함된 것 찾기
                const sigunguOption = Array.from(sigunguSelect.options).find(
                    opt => opt.textContent.trim().includes(regionMap.sigungu)
                );

                if (sigunguOption) {
                    sigunguSelect.value = sigunguOption.value;
                    // change 이벤트 발생시켜 읍면동 로드
                    sigunguSelect.dispatchEvent(new Event('change'));
                    // 읍면동 로드 대기
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    console.warn('⚠️ 시군구를 찾을 수 없음:', regionMap.sigungu);
                }
            }
        }

        // 🔥 6. 읍면동 선택 - bname1(황간면)을 사용
        if (regionMap.bname1) {
            const emdSelect = $('#f_emd');
            if (emdSelect) {
                // 옵션 중에서 텍스트가 포함된 것 찾기
                const emdOption = Array.from(emdSelect.options).find(opt =>
                    opt.textContent.trim().includes(regionMap.bname1)
                );

                if (emdOption) {
                    emdSelect.value = emdOption.value;
                    // change 이벤트 발생
                    emdSelect.dispatchEvent(new Event('change'));
                } else {
                    console.warn('⚠️ 읍면동을 찾을 수 없음:', regionMap.bname1);
                }
            }
        } else if (regionMap.bname) {
            // 🔥 bname1이 없는 경우 bname에서 읍/면/동만 추출
            const emdSelect = $('#f_emd');
            if (emdSelect) {
                // "황간면 남성리" → "황간면"만 추출
                const emdText = regionMap.bname.split(' ')[0];
                const emdOption = Array.from(emdSelect.options).find(opt =>
                    opt.textContent.trim().includes(emdText)
                );
                if (emdOption) {
                    emdSelect.value = emdOption.value;
                    emdSelect.dispatchEvent(new Event('change'));
                } else {
                    console.warn('⚠️ 읍면동을 찾을 수 없음:', emdText);
                }
            }
        }

        // 🔥 7. 리 입력 - bname2를 우선 사용
        const riInput = $('#f_ri');
        if (riInput) {
            if (regionMap.bname2 && regionMap.bname2.includes('리')) {
                riInput.value = regionMap.bname2;
            } else if (regionMap.bname && regionMap.bname.includes('리')) {
                // bname2가 없으면 bname에서 리 추출
                const parts = regionMap.bname.split(' ');
                const riPart = parts.find(p => p.includes('리'));
                if (riPart) {
                    riInput.value = riPart;
                }
            }
        }

        // 🔥 8. 산 여부 판단
        const isMountain = data.jibunAddress && data.jibunAddress.includes('산');
        const mountainRadios = document.querySelectorAll('input[name="mountainYn"]');
        mountainRadios.forEach(radio => {
            if (radio.value === (isMountain ? 'Y' : 'N')) {
                radio.checked = true;
            }
        });
        // 🔥 9. 본번/부번 파싱 - 지번주소에서 직접 추출
        const jibunAddress = data.jibunAddress || '';
        let mainNum = '';
        let subNum = '';

        // 🔥 "산"을 제외하고 번지 정보만 추출
        // 예: "충청북도 영동군 황간면 남성리 산12" → "12"
        // 예: "충청북도 영동군 황간면 남성리 123-45" → "123", "45"

        // 패턴 1: "산 123" 형식
        const mountainPattern = /산\s*(\d+)/;
        const mountainMatch = jibunAddress.match(mountainPattern);

        if (mountainMatch) {
            mainNum = mountainMatch[1];
        } else {
            // 패턴 2: "123-45" 또는 "123" 형식
            const addressPattern = /(\d+)(?:-(\d+))?(?:\s|$)/;
            const addressMatch = jibunAddress.match(addressPattern);

            if (addressMatch) {
                mainNum = addressMatch[1];
                subNum = addressMatch[2] || '';
            }
        }

        const mainNumInput = $('#f_mainNum');
        const subNumInput = $('#f_subNum');

        if (mainNumInput && mainNum) {
            mainNumInput.value = mainNum;
        }
        if (subNumInput && subNum) {
            subNumInput.value = subNum;
        }

        // 🔥 10. 건물명 입력
        const buildingNameInput = $('#f_buildingName');
        if (buildingNameInput && data.buildingName) {
            buildingNameInput.value = data.buildingName;
        }
        // 헤더 주소 업데이트
        updateHeaderAddr();
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

// ========== 면수 합계/검증 ==========
const totalInput = $('#f_totalStalls');
const ctlTotal = $('#ctl_total');
const normalInput = $('#f_st_normal');
const disInput = $('#f_st_dis');
const smallInput = $('#f_st_small');
const greenInput = $('#f_st_green');
const pregInput = $('#f_st_preg');
const msgEl = $('#stallsMsg');

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
function syncFeeSections() {
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
    // ✅ 코드 값으로만 판별
    const isBoth = (v === '03');
    const isResident = (v === '02');
    const isNormalStreet = (v === '01');
    // 운영방식에 따라 표시
    if (isBoth) {
        if (isDayChecked) {
            if (dayResWrap) dayResWrap.hidden = false;
            if (dayNormalWrap) dayNormalWrap.hidden = false;
        }
        if (isNightChecked) {
            if (nightResWrap) nightResWrap.hidden = false;
            if (nightNormalWrap) nightNormalWrap.hidden = false;
        }
    } else if (isResident) {
        if (isDayChecked && dayResWrap) dayResWrap.hidden = false;
        if (isNightChecked && nightResWrap) nightResWrap.hidden = false;
    } else if (isNormalStreet) {
        if (isDayChecked && dayNormalWrap) dayNormalWrap.hidden = false;
        if (isNightChecked && nightNormalWrap) nightNormalWrap.hidden = false;
    }
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
        chkDay.addEventListener('change', function () {
            toggleSections(daySections, this.checked);
            checkOperationTypeVisibility();
            if (this.checked) syncFeeSections();
        });
    }

    if (chkNight) {
        chkNight.addEventListener('change', function () {
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
        weekdayGroup.addEventListener('change', function (e) {
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
        saturdayGroup.addEventListener('change', function (e) {
            if (e.target.name === `${timeType}SaturdayOperation`) {
                saturdayTimeInputs.style.display =
                    e.target.value === '02' ? 'block' : 'none';
            }
        });
    }

    const holidayGroup = $(`#${timeType}_holiday_operation_group`);
    const holidayTimeInputs = $(`#${timeType}_holiday_time_inputs`);

    if (holidayGroup && holidayTimeInputs) {
        holidayGroup.addEventListener('change', function (e) {
            if (e.target.name === `${timeType}HolidayOperation`) {
                holidayTimeInputs.style.display =
                    e.target.value === '02' ? 'block' : 'none';
            }
        });
    }
}

// ========== 🔥 법정동코드 생성 함수 개선 (수정됨) ==========
function generateLdongCd() {
    const f_sigungu = document.getElementById('f_sigungu');
    const f_emd = document.getElementById('f_emd');

    // 1. 필수값 체크
    if (!f_sigungu || !f_sigungu.value) {
        console.error('❌ 시군구가 선택되지 않았습니다.');
        return null;
    }
    if (!f_emd || !f_emd.value) {
        console.warn('⚠️ 읍면동이 선택되지 않았습니다.');
        return null;
    }

    const sigunguCd = f_sigungu.value; // 예: "47150" (5자리)
    const emdCd = f_emd.value;         // 예: "120" (3자리) 또는 "12000" (5자리)

    // 2. 이미 10자리인 경우 (드물지만 방어 코드)
    if (emdCd.length === 10) {
        return emdCd;
    }

    // 3. 법정동코드 조합 로직 (표준: 시군구5 + 읍면동3 + 리2 = 총 10자리)
    // 시군구 코드는 무조건 5자리여야 함
    if (sigunguCd.length !== 5) {
        console.error('❌ 시군구 코드가 5자리가 아닙니다:', sigunguCd);
        return null;
    }

    let ldongCd = '';

    if (emdCd.length === 3) {
        // 읍면동이 3자리인 경우 (예: 120) -> 뒤에 리(00)을 붙여 10자리 완성
        // 조합: 47150 + 120 + 00 = 4715012000
        ldongCd = sigunguCd + emdCd + '00';
    } else if (emdCd.length === 5) {
        // 읍면동이 5자리인 경우 (예: 12000) -> 그대로 조합
        // 조합: 47150 + 12000 = 4715012000
        ldongCd = sigunguCd + emdCd;
    } else {
        console.error('❌ 읍면동 코드 길이 오류:', emdCd);
        return null;
    }

    // 4. 최종 검증
    if (ldongCd.length !== 10) {
        console.error('❌ 생성된 법정동코드 길이가 10자리가 아닙니다:', ldongCd);
        return null;
    }

    console.log(`✅ 법정동코드 생성: ${sigunguCd} + ${emdCd} => ${ldongCd}`);
    return ldongCd;
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

function buildPayload() {
    const currentOpTypeRadios = $$('input[name="opType"]');
    const ownRadios = $$('input[name="own"]');
    const own = (ownRadios.find(r => r.checked) || {}).value || '';
    const selectedOp = (currentOpTypeRadios.find(r => r.checked)?.value) || '';
    const sumNow = detailSum();

    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;

    // 🔥 행정구역 정보 - SELECT 요소에서 직접 가져오기
    const f_sido = document.getElementById('f_sido');
    const f_sigungu = document.getElementById('f_sigungu');
    const f_emd = document.getElementById('f_emd');
    // 🔥 법정동코드 생성
    const ldongCd = generateLdongCd();
    console.log("!!!!!!!ldongCd : ", ldongCd);

    if (!ldongCd) {
        console.error('❌ 법정동코드 생성 실패');
        alert('행정구역 정보(시도/시군구/읍면동)를 모두 선택해주세요.');
        throw new Error('법정동코드 생성 실패');
    }

    const payload = {
        id: f_id?.value,
        name: f_name?.value,
        status: f_status?.value,
        type: '노상',

        // 🔥 행정구역 정보 추가 (SELECT의 value 그대로)
        sido: f_sido?.value || null,
        sigungu: f_sigungu?.value || null,
        emd: f_emd?.value || null,
        ldongCd: ldongCd,  // 🔥 생성된 법정동코드 추가

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
        ownerCompany: (own === '민간위탁') ? ($('#f_own_company')?.value || '') : '',
        manager: {
            name: $('#f_mgr_name')?.value || '',
            tel: $('#f_mgr_tel')?.value || ''
        },

        oddEven: $('#f_oddEven')?.value || '',
        operationType: selectedOp,
        times: {
            day: isDayChecked,
            night: isNightChecked
        },

        // 🔥 경사구간 정보
        slope: {
            slpSecYn: $('#slope_yes')?.checked ? 'Y' : 'N',
            sixleCnt: $('#slope_yes')?.checked ? num($('#f_slope_start')?.value) : null,
            sixgtCnt: $('#slope_yes')?.checked ? num($('#f_slope_end')?.value) : null
        },

        // 🔥 안전시설 정보
        safety: {
            antislpFcltyYn: $('#antislp_facility_chk')?.checked ? 'Y' : 'N',
            slpCtnGuidSignYn: $('#slp_guide_sign_chk')?.checked ? 'Y' : 'N'
        },

        // 🔥 비고 정보
        partclrMatter: $('#f_partclr_matter')?.value || ''
    };

    if (isDayChecked) {
        payload.day = {
            grade: $('#f_day_grade')?.value || '',
            feeType: $('#f_day_feeType')?.value || '',
            payMethods: collectPayMethods('day'),
            settleMethods: collectSettleMethods('day'),
            operatingHours: collectOperatingHours('day')
        };

        if (selectedOp.includes('거주자우선주차장') || selectedOp === '02') {
            payload.day.residentFees = {
                all: num($('#f_day_res_all')?.value),
                day: num($('#f_day_res_day')?.value),
                full: num($('#f_day_res_full')?.value),
                night: num($('#f_day_res_night')?.value)
            };
        }

        if (selectedOp.includes('일반노상주차장') || selectedOp === '01') {
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

        if (selectedOp.includes('거주자우선주차장') || selectedOp === '02') {
            payload.night.residentFees = {
                all: num($('#f_night_res_all')?.value),
                day: num($('#f_night_res_day')?.value),
                full: num($('#f_night_res_full')?.value),
                night: num($('#f_night_res_night')?.value)
            };
        }

        if (selectedOp.includes('일반노상주차장') || selectedOp === '01') {
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
            // 🔥 값 정규화: 대소문자 무시, 공백 제거
            const value = (radio.value || '').trim().toLowerCase();
            const isVisible = radio.checked && (value === 'y' || value === '있음' || value === 'yes' || value === '1');
            signPhotoWrap.style.display = isVisible ? 'block' : 'none';

            console.log('🖼️ 표지판 사진:', {
                originalValue: radio.value,
                normalizedValue: value,
                checked: radio.checked,
                visible: isVisible
            });
        });
    });

    // 초기 상태 설정
    const checkedSign = signRadios.find(r => r.checked);
    if (checkedSign) {
        const value = (checkedSign.value || '').trim().toLowerCase();
        const isVisible = value === 'y' || value === '있음' || value === 'yes' || value === '1';
        signPhotoWrap.style.display = isVisible ? 'block' : 'none';
        console.log('🔧 초기 표지판 상태:', {value: checkedSign.value, visible: isVisible});
    } else {
        // 체크된 라디오가 없으면 기본적으로 숨김
        signPhotoWrap.style.display = 'none';
        console.log('⚠️ 선택된 표지판 라디오 버튼 없음 - 기본 숨김');
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

// ========== 경사구간 토글 수정 ==========
function setupSlopeToggle() {
    const slopeRadios = $$('input[name="slopeSection"]');
    const slopeInputWrap = $('#slope_input_wrap');

    if (!slopeInputWrap) {
        console.warn('⚠️ #slope_input_wrap 요소를 찾을 수 없습니다.');
        return;
    }

    // 🔥 입력값 초기화 함수 - 올바른 필드 ID 사용
    function clearSlopeInputs() {
        const slopeStart = $('#f_slope_start');
        const slopeEnd = $('#f_slope_end');

        if (slopeStart) slopeStart.value = '';
        if (slopeEnd) slopeEnd.value = '';
    }

    // 🔥 토글 처리 함수 수정
    function toggleSlopeInput(isVisible) {
        if (!isVisible) {
            // 🔥 올바른 필드 ID로 값 확인
            const hasValue = $('#f_slope_start')?.value || $('#f_slope_end')?.value;

            if (hasValue && !confirm('경사구간을 "없음"으로 변경하면 입력된 정보가 삭제됩니다. 계속하시겠습니까?')) {
                const slopeYes = $('#slope_yes');
                if (slopeYes) slopeYes.checked = true;
                return;
            }
            clearSlopeInputs();
        }
        slopeInputWrap.style.display = isVisible ? 'block' : 'none';
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

/*function toggleSlopeInput(isVisible) {
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
}*/

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
        const response = await fetch(`/prk/onparking-detail?prkPlceManageNo=${encodeURIComponent(prkPlceManageNo)}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
            bindDataToForm(result.data);
            // 🔥 핵심: 사진 정보 로드 호출 추가
            if (result.data.prkPlceInfoSn) {
                await loadAndDisplayPhotos(result.data.prkPlceInfoSn);
            }
        } else {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ 데이터 로드 실패');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('실패 사유:', result.message);
            console.error('요청한 관리번호:', prkPlceManageNo);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ 데이터 로드 중 예외 발생');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('예외 타입:', error.name);
        console.error('예외 메시지:', error.message);
        console.error('예외 스택:', error.stack);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } finally {
        LoadingIndicator.hide();
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
    codes.forEach(code => {
        // 🔥 "04" 또는 "기타" 코드 처리
        if (code === '04' || code === '기타') {
            const etcCheckbox = document.getElementById(`${name.replace('Method', '')}_etc_chk`);
            if (etcCheckbox) {
                etcCheckbox.checked = true;
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


// ========== 🔥 이미지 미리보기 기능 ==========
const ImagePreview = {
    tooltip: null,
    currentTimeout: null,

    createTooltip() {
        if (this.tooltip) return;

        this.tooltip = document.createElement('div');
        this.tooltip.id = 'image-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            display: none;
            background: white;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            pointer-events: none;
        `;

        this.tooltip.innerHTML = `
            <div class="tooltip-loading" style="text-align: center; padding: 20px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="margin-top: 10px; color: #666; font-size: 14px;">이미지 로딩 중...</p>
            </div>
            <img class="tooltip-image" style="display: none; max-width: 100%; height: auto; border-radius: 4px;">
            <p class="tooltip-filename" style="margin: 8px 0 0 0; font-size: 12px; color: #666; text-align: center;"></p>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(this.tooltip);
    },

    // 🔥 이미지 표시 - 수정
    async show(prkPlceInfoSn, prkImgId, seqNo, fileName, event) {
        this.createTooltip();
        const loadingDiv = this.tooltip.querySelector('.tooltip-loading');
        const img = this.tooltip.querySelector('.tooltip-image');
        const fileNameEl = this.tooltip.querySelector('.tooltip-filename');

        loadingDiv.style.display = 'block';
        img.style.display = 'none';
        fileNameEl.textContent = fileName;

        this.updatePosition(event);
        this.tooltip.style.display = 'block';

        try {
            // 🔥 URL 생성 - 정확한 파라미터 사용
            const imageUrl = `/prk/photo?prkPlceInfoSn=${prkPlceInfoSn}&prkImgId=${prkImgId}&seqNo=${seqNo}`;
            img.onload = () => {
                loadingDiv.style.display = 'none';
                img.style.display = 'block';
            };

            img.onerror = () => {
                loadingDiv.innerHTML = '<p style="color: #ef4444;">이미지를 불러올 수 없습니다</p>';
                console.error('❌ 이미지 로드 실패:', imageUrl);
            };

            img.src = imageUrl;

        } catch (error) {
            console.error('❌ 이미지 표시 오류:', error);
            loadingDiv.innerHTML = '<p style="color: #ef4444;">오류가 발생했습니다</p>';
        }
    },

    updatePosition(event) {
        if (!this.tooltip) return;

        const x = event.clientX;
        const y = event.clientY;
        const offset = 15;

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x + offset;
        let top = y + offset;

        if (left + tooltipRect.width > viewportWidth) {
            left = x - tooltipRect.width - offset;
        }

        if (top + tooltipRect.height > viewportHeight) {
            top = y - tooltipRect.height - offset;
        }

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    },

    hide() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }

        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
    },

    showWithDelay(prkPlceInfoSn, prkImgId, seqNo, fileName, event, delay = 300) {
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }

        this.currentTimeout = setTimeout(() => {
            this.show(prkPlceInfoSn, prkImgId, seqNo, fileName, event);
        }, delay);
    }
}

// ========== 🔥 사진 정보 로드 및 표시 - 중복 방지 개선 ==========
async function loadAndDisplayPhotos(prkPlceInfoSn) {
    if (!prkPlceInfoSn) {
        console.warn('⚠️ prkPlceInfoSn이 없습니다.');
        return;
    }

    try {
        const url = `/prk/parking-photos?prkPlceInfoSn=${prkPlceInfoSn}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.photos && result.photos.length > 0) {
            // 🔥 각 사진 정보 출력
            result.photos.forEach((photo, index) => {
            });

            // 🔥 컨테이너 초기화 - 기존 내용 완전히 제거
            const photoInfoDiv = document.getElementById('photo_info');
            const signPhotoInfoDiv = document.getElementById('sign_photo_info');

            if (photoInfoDiv) {
                photoInfoDiv.innerHTML = '';
            }

            if (signPhotoInfoDiv) {
                signPhotoInfoDiv.innerHTML = '';
            }

            // 현장 사진 표시
            const mainPhotos = result.photos.filter(p => p.prkimgid === 'ON_MAIN');
            if (photoInfoDiv && mainPhotos.length > 0) {
                mainPhotos.forEach(photo => {
                    displayPhotoInfo('photo_info', photo);
                });
            }

            // 표지판 사진 표시
            const signPhotos = result.photos.filter(p => p.prkimgid === 'ON_SIGN');
            if (signPhotoInfoDiv && signPhotos.length > 0) {
                signPhotos.forEach(photo => {
                    displayPhotoInfo('sign_photo_info', photo);
                });
            }
        } else {
            console.warn('⚠️ 조회된 사진이 없습니다.');
        }
    } catch (error) {
        console.error('❌ 사진 로드 실패:', error);
    }
}

// ========== 🔥 사진 정보 표시 - 중복 방지 개선 ==========
function displayPhotoInfo(containerId, photoData) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`❌ ${containerId} 없음`);
        return;
    }
    // 🔥 데이터 검증 - null/undefined 체크
    if (!photoData.prkplceinfosn || !photoData.prkimgid || photoData.seqno === null || photoData.seqno === undefined) {
        console.error('❌ 필수 데이터 누락:', photoData);
        return;
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'photo-info-item'; // 🔥 클래스 추가
    infoDiv.style.cssText = `
        margin-top: 10px;
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.2s;
    `;

    infoDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <svg style="width: 20px; height: 20px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <div style="flex: 1;">
                <div style="font-size: 14px; color: #374151; font-weight: 500;">${photoData.realfilenm}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">
                    등록일: ${formatDate(photoData.regdt)} · seqNo: ${photoData.seqno}
                </div>
            </div>
        </div>
    `;

    // 🔥 클릭 이벤트 - 한 번만 등록
    infoDiv.onclick = function (e) {
        e.stopPropagation();
        const url = `/prk/photo?prkPlceInfoSn=${photoData.prkplceinfosn}&prkImgId=${photoData.prkimgid}&seqNo=${photoData.seqno}`;
        window.open(url, '_blank');
    };

    // 🔥 마우스 이벤트 - 한 번만 등록
    infoDiv.onmouseenter = function (e) {
        infoDiv.style.background = '#f3f4f6';
        infoDiv.style.borderColor = '#d1d5db';
        ImagePreview.showWithDelay(
            photoData.prkplceinfosn,
            photoData.prkimgid,
            photoData.seqno,
            photoData.realfilenm,
            e,
            300
        );
    };

    infoDiv.onmousemove = function (e) {
        ImagePreview.updatePosition(e);
    };

    infoDiv.onmouseleave = function () {
        infoDiv.style.background = '#f9fafb';
        infoDiv.style.borderColor = '#e5e7eb';
        ImagePreview.hide();
    };

    container.appendChild(infoDiv);
}

// ========== 🔥 유틸리티 함수 ==========
function formatFileSize(bytes) {
    if (!bytes) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// ========== 🔥 전역 변수로 사업관리번호 저장 ==========
let loadedBizMngNo = null; // 🔥 서버에서 로드한 사업관리번호 저장

// ========== 🔥 폼에 데이터 바인딩 ==========
async function bindDataToForm(data) {
    // 🔥 사업관리번호 저장 (UPDATE 시 필수)
    if (data.prkBizMngNo) {
        loadedBizMngNo = data.prkBizMngNo;
    }

    // 🔥 주차장정보일련번호 저장
    if (data.prkPlceInfoSn) {
        // 🔥 사진 정보 로드
        await loadAndDisplayPhotos(data.prkPlceInfoSn);
    }

    // 🔥 1. 기본 필드 매핑
    if (f_id) f_id.value = data.prkPlceManageNo || '';
    if (f_name) f_name.value = data.prkplceNm || '';

    // 🔥 진행상태 바인딩 (재로드 없이 직접 설정)
    if (f_status && data.prgsStsCd) {
        // 1차 시도: 코드값으로 직접 설정
        f_status.value = data.prgsStsCd;
        // 값이 제대로 설정되지 않았다면 코드명으로 매칭 시도
        if (f_status.value !== data.prgsStsCd) {
            console.warn('⚠️ 코드값 바인딩 실패. 코드명으로 매칭 시도:', data.prgsStsCd);

            const statusText = data.prgsStsCd; // "승인", "승인대기" 등
            let matched = false;

            // select의 option들을 순회하면서 텍스트가 일치하는 값을 찾음
            for (let i = 0; i < f_status.options.length; i++) {
                const option = f_status.options[i];
                if (option.textContent.trim() === statusText.trim()) {
                    f_status.value = option.value;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                console.error('❌ 진행상태 바인딩 완전 실패. 옵션 확인:', {
                    시도한값: data.prgsStsCd,
                    실제값: f_status.value,
                    옵션수: f_status.options.length,
                    사용가능한옵션: Array.from(f_status.options).map(o => `${o.value}:${o.textContent}`)
                });
            }
        }
    }

    if (f_type) f_type.value = '노상';

    // 🔥 우편번호 바인딩
    const f_zip = document.getElementById('f_zip');
    if (f_zip && data.zip) {
        f_zip.value = data.zip;
    }

    // 🔥 주소 바인딩 - 지번주소 및 도로명주소
    if (f_addrJ) f_addrJ.value = data.dtadd || '';
    if (f_addrR) f_addrR.value = data.rnmadr || '';

    // 🔥 건물번호, 본번, 부번 바인딩
    const f_bdnbr = document.getElementById('f_bdnbr');
    if (f_bdnbr && data.bdnbr) {
        f_bdnbr.value = data.bdnbr;
    }

    const f_mainNum = document.getElementById('f_mainNum');
    if (f_mainNum && data.lnmMnno) {
        f_mainNum.value = data.lnmMnno;
    }

    const f_subNum = document.getElementById('f_subNum');
    if (f_subNum && data.lnmSbno) {
        f_subNum.value = data.lnmSbno;
    }

    // 🔥 리(里) 바인딩
    const f_ri = document.getElementById('f_ri');
    if (f_ri && data.liCd) {
        f_ri.value = data.liCd;
    }

    // 🔥 산 여부 바인딩
    const mountainRadios = document.querySelectorAll('input[name="mountainYn"]');
    mountainRadios.forEach(radio => {
        if (radio.value === (data.mntnYn === 'Y' ? 'Y' : 'N')) {
            radio.checked = true;
        }
    });

    // 🔥 좌표 바인딩
    if (f_lat) f_lat.value = data.prkPlceLat || '';
    if (f_lng) f_lng.value = data.prkPlceLon || '';

    // 🔥 행정구역 바인딩 - 이미 로드된 옵션 사용
    if (data.sidoCd) {
        const f_sido = $('#f_sido');
        if (f_sido) {
            // 🔥 시도 select가 비어있는지 확인
            if (f_sido.options.length <= 1) {
                await RegionCodeLoader.loadSidoList();
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            f_sido.value = data.sidoCd;
            if (data.sigunguCd) {
                await RegionCodeLoader.loadSigunguList(data.sidoCd);
                await new Promise(resolve => setTimeout(resolve, 200));

                const f_sigungu = $('#f_sigungu');
                if (f_sigungu) {
                    f_sigungu.value = data.sigunguCd;

                    if (data.emdCd) {
                        await RegionCodeLoader.loadEmdList(data.sigunguCd);
                        await new Promise(resolve => setTimeout(resolve, 200));

                        const f_emd = $('#f_emd');
                        if (f_emd) {
                            f_emd.value = data.emdCd;
                        } else {
                            console.error('❌ f_emd 요소를 찾을 수 없습니다.');
                        }
                    } else {
                        console.warn('⚠️ emdCd가 없습니다:', data.emdCd);
                    }
                }
            }
        }
    }

    // 🔥 리(里) 입력 필드 바인딩
    const riInput = $('#f_ri');
    if (riInput && data.ri) {
        riInput.value = data.ri;
    }

    // 주소
    if (f_addrJ) f_addrJ.value = data.dtadd || '';
    if (f_addrR) f_addrR.value = '';  // 도로명 주소는 별도 필드 필요

    // 🔥 도로명주소 바인딩 추가
    if (f_addrR && data.rnmadr) {
        f_addrR.value = data.rnmadr;
    }

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

        const opTypeRadios = document.getElementsByName('opType');
        opTypeRadios.forEach(radio => {
            if (radio.value === data.prkOperMthdCd) {
                radio.checked = true;
            }
        });
    }

    // 운영주체 (operMbyCd)
    if (data.operMbyCd) {
        const ownRadios = document.getElementsByName('own');
        ownRadios.forEach(radio => {
            if (radio.value === data.operMbyCd) {
                radio.checked = true;
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
        }

        if (chkNight.checked) {
            nightSections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'block';
            });
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
        bindCheckboxes('dayPayMethod', data.wkFeeMthdCd);

        // 🔥 "04" 코드가 있고 기타 텍스트가 있으면 입력 필드에 설정
        if (data.wkFeeMthdCd.includes('04') && data.wkFeePayMthdOthr) {
            const dayPayEtcInput = document.getElementById('day_pay_etc_input');
            if (dayPayEtcInput) {
                dayPayEtcInput.value = data.wkFeePayMthdOthr;
            }
        }
    }

    if (data.ntFeeMthdCd) {
        bindCheckboxes('nightPayMethod', data.ntFeeMthdCd);
        // 🔥 "04" 코드가 있고 기타 텍스트가 있으면 입력 필드에 설정
        if (data.ntFeeMthdCd.includes('04') && data.ntFeePayMthdOthr) {
            const nightPayEtcInput = document.getElementById('night_pay_etc_input');
            if (nightPayEtcInput) {
                nightPayEtcInput.value = data.ntFeePayMthdOthr;
            }
        }
    }

    // 🔥 요금정산방식 (쉼표로 구분된 코드)
    if (data.wkFeeStlmtMthdCd) {
        bindCheckboxes('daySettleMethod', data.wkFeeStlmtMthdCd);
    }

    if (data.ntFeeStlmtMthdCd) {
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
        }
    }

    if (data.ntFeePayMthdOthr) {
        const nightPayEtcInput = document.getElementById('night_pay_etc_input');
        const nightPayEtcChk = document.getElementById('night_pay_etc_chk');
        if (nightPayEtcInput && nightPayEtcChk) {
            nightPayEtcChk.checked = true;
            nightPayEtcInput.disabled = false;
            nightPayEtcInput.value = data.ntFeePayMthdOthr;
        }
    }
    // 기타 정보
    const sign_yes = document.getElementById('sign_yes');
    const sign_no = document.getElementById('sign_no');
    if (sign_yes && sign_no) {
        if (data.prklotSignYn === 'Y') {
            sign_yes.checked = true;
            // 🔥 change 이벤트 트리거 추가
            sign_yes.dispatchEvent(new Event('change', {bubbles: true}));
            console.log('✅ 표지판: 있음 선택');
        } else {
            sign_no.checked = true;
            sign_no.dispatchEvent(new Event('change', {bubbles: true}));
            console.log('✅ 표지판: 없음 선택');
        }
    }

    // 경사구간 정보
    const slope_yes = document.getElementById('slope_yes');
    const slope_no = document.getElementById('slope_no');
    if (slope_yes && slope_no) {
        if (data.slpSecYn === 'Y') {
            slope_yes.checked = true;

            // 🔥 change 이벤트 트리거하여 입력 영역 표시
            slope_yes.dispatchEvent(new Event('change', {bubbles: true}));

            // 🔥 sixleCnt → f_slope_start, sixgtCnt → f_slope_end
            const f_slope_start = document.getElementById('f_slope_start');
            const f_slope_end = document.getElementById('f_slope_end');

            if (f_slope_start && data.sixleCnt) {
                f_slope_start.value = data.sixleCnt;
            }
            if (f_slope_end && data.sixgtCnt) {
                f_slope_end.value = data.sixgtCnt;
            }
        } else {
            slope_no.checked = true;

            // 🔥 change 이벤트 트리거
            slope_no.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }

    // 🔥 안전시설 바인딩 (antislpFcltyYn, slpCtnGuidSignYn)
    const antislpFacilityChk = document.getElementById('antislp_facility_chk');
    const slpGuideSignChk = document.getElementById('slp_guide_sign_chk');

    if (antislpFacilityChk) {
        antislpFacilityChk.checked = (data.antislpFcltyYn === 'Y');
    }

    if (slpGuideSignChk) {
        slpGuideSignChk.checked = (data.slpCtnGuidSignYn === 'Y');
    }

    // 비고
    const f_partclr_matter = document.getElementById('f_partclr_matter');
    if (f_partclr_matter && data.partclrMatter) {
        f_partclr_matter.value = data.partclrMatter;
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
        setAllFieldsReadOnly(true);

        // 저장 버튼 비활성화
        const btnSave = document.getElementById('btnSave');
        const btnSaveTop = document.getElementById('btnSaveTop');
        if (btnSave) btnSave.setAttribute('disabled', 'true');
        if (btnSaveTop) btnSaveTop.setAttribute('disabled', 'true');
    } else {
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
    }, 200);
}

// ========== 🔥 모든 필드를 ReadOnly로 설정하는 함수 ==========
function setAllFieldsReadOnly(isReadOnly) {
    // 🔥 1. 텍스트/숫자 입력 필드
    const inputs = $$('input[type="text"], input[type="number"], input[type="tel"], textarea');
    inputs.forEach(input => {
        if (isReadOnly) {
            // 🔥 승인 상태 → 모든 필드 readonly
            input.readOnly = true;
            input.style.backgroundColor = '#f3f4f6';
            input.style.cursor = 'not-allowed';
        } else {
            // 🔥 편집 가능 상태
            const alwaysReadOnlyIds = ['f_id', 'f_totalStalls', 'f_addr_jibun', 'f_addr_road'];
            if (alwaysReadOnlyIds.includes(input.id)) {
                input.readOnly = true;
            } else {
                input.readOnly = false;
                input.style.backgroundColor = '';
                input.style.cursor = '';
            }
        }
    });

    // 🔥 2. Select 박스 (시도/시군구/읍면동 포함)
    const selects = $$('select');
    selects.forEach(select => {
        if (isReadOnly) {
            // 🔥 승인 상태 → 모든 SELECT disabled
            select.disabled = true;
            select.style.backgroundColor = '#f3f4f6';
            select.style.cursor = 'not-allowed';
            select.style.pointerEvents = 'none';  // 🔥 추가
        } else {
            // 🔥 편집 가능 상태 → SELECT 활성화
            select.disabled = false;
            select.style.backgroundColor = '';
            select.style.cursor = '';
            select.style.pointerEvents = '';
        }
    });

    // 🔥 3. 라디오/체크박스
    const radiosAndChecks = $$('input[type="radio"], input[type="checkbox"]');
    radiosAndChecks.forEach(input => {
        if (isReadOnly) {
            input.disabled = true;
            input.style.cursor = 'not-allowed';
            input.style.pointerEvents = 'none';  // 🔥 추가
        } else {
            input.disabled = false;
            input.style.cursor = '';
            input.style.pointerEvents = '';
        }
    });

    // 🔥 4. 파일 업로드 버튼
    const fileButtons = [
        '#btnPickFromLibrary', '#btnTakePhoto', '#btnUseGeolocation', '#btnClearPhoto',
        '#btnFindAddr',
        '#btnSignPhotoLibrary', '#btnSignPhotoCamera', '#btnClearSignPhoto'
    ];
    fileButtons.forEach(selector => {
        const btn = $(selector);
        if (btn) {
            if (isReadOnly) {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';  // 🔥 추가
            } else {
                btn.disabled = false;
                btn.style.cursor = '';
                btn.style.opacity = '';
                btn.style.pointerEvents = '';
            }
        }
    });
    console.log(`🔒 모든 필드 ${isReadOnly ? 'ReadOnly' : '편집 가능'} 처리 완료`);
}

// 🔥 운영시간 바인딩 함수 (PRK_004 코드 기반)
function bindOperationTime(timeType, dayType, operTmCd, startTime, endTime) {
    const capitalizedDayType = dayType.charAt(0).toUpperCase() + dayType.slice(1);
    const radioName = `${timeType}${capitalizedDayType}Operation`;

    // ✅ codeCd 값으로 직접 라디오 버튼 선택
    const radioButton = document.querySelector(`input[name="${radioName}"][value="${operTmCd}"]`);
    if (radioButton) {
        radioButton.checked = true;
        // change 이벤트 트리거하여 시간 입력 필드 표시/숨김
        radioButton.dispatchEvent(new Event('change', {bubbles: true}));
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

// ========== 🔥 필수 입력 검증 함수 ==========
function validateRequiredFields() {
    const errors = [];

    // 🔥 진행상태 검증 추가
    const statusValue = f_status?.value?.trim();
    if (!statusValue) {
        errors.push('• 진행상태를 선택해주세요.');

        // 진행상태 필드에 포커스
        if (f_status) {
            f_status.focus();
            f_status.style.borderColor = '#ef4444';
            setTimeout(() => {
                f_status.style.borderColor = '';
            }, 2000);
        }
    }

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

async function doSave() {
    console.log('🚀 저장 프로세스 시작');

    // 🔥 try 블록을 함수 시작 시점으로 이동하여 모든 에러를 포착
    try {
        // 1. 🔥 검증 초기화 (이전 에러 상태 제거)
        FormValidator.clearErrorStyles();

        // 2. 🔥 필수 항목 검증 (순서대로 체크)
        let isValid = true;

        // --- (A) 기본 정보 검증 ---
        isValid = FormValidator.check('#f_name', '주차장명을 입력해주세요') && isValid;
        isValid = FormValidator.check('#f_status', '진행상태를 선택해주세요') && isValid;

        // --- (B) 행정구역 검증 ---
        isValid = FormValidator.check('#f_sido', '시도를 선택해주세요') && isValid;
        isValid = FormValidator.check('#f_sigungu', '시군구를 선택해주세요') && isValid;
        isValid = FormValidator.check('#f_emd', '읍면동을 선택해주세요') && isValid;

        // --- (C) 필수 숫자형 데이터 ---
        isValid = FormValidator.check('#f_totalStalls', '총 주차면수를 입력해주세요') && isValid;

        // --- (D) 라디오 버튼 그룹 검증 ---
        isValid = FormValidator.checkRadio('own', '운영주체를 선택해주세요') && isValid;
        isValid = FormValidator.checkRadio('opType', '운영방식을 선택해주세요') && isValid;

        // --- (E) 조건부 검증 (예: 민간위탁일 때 업체명 필수) ---
        const ownRadio = document.querySelector('input[name="own"]:checked');
        if (ownRadio && ownRadio.value.includes('민간')) {
            isValid = FormValidator.check('#f_own_company', '위탁 업체명을 입력해주세요') && isValid;
        }

        // --- (F) 관리기관 정보 ---
        isValid = FormValidator.check('#f_mgr_name', '관리기관명을 입력해주세요') && isValid;
        isValid = FormValidator.check('#f_mgr_tel', '관리기관 전화번호를 입력해주세요') && isValid;
        isValid = FormValidator.check('#f_oddEven', '부제 시행 여부를 선택해주세요') && isValid;

        // --- (G) 주간/야간 체크 여부 ---
        const isDay = document.querySelector('#chk_day').checked;
        const isNight = document.querySelector('#chk_night').checked;
        if (!isDay && !isNight) {
            const timeGroup = document.querySelector('#chk_day').closest('.check-group') || document.querySelector('#chk_day').parentElement;
            FormValidator.showError(timeGroup, '주간 또는 야간 운영시간을 최소 하나 선택해주세요');
            isValid = false;
        }

        // 3. 🔥 유효성 검사 실패 시 중단
        if (!isValid) {
            console.warn('❌ 유효성 검사 실패: 필수 입력 항목 누락');
            alert('필수 입력 항목을 확인해주세요. (붉은색 표시 항목)');
            return;
        }

        // 4. 상세 비즈니스 로직 검증
        const validationErrors = validateRequiredFields();
        if (validationErrors.length > 0) {
            alert('다음 항목을 입력해주세요:\n\n' + validationErrors.join('\n'));
            return;
        }

        // 5. Payload 생성
        const payload = buildPayload();
        const isNewRecord = !payload.id || payload.id.trim() === '';

        // 6. 서버 데이터 포맷 변환
        const serverData = mapPayloadToServerFormat(payload);

        // 🔥 법정동코드 디버깅 로그
        console.log('📦 전송 데이터 확인 (법정동코드):', serverData.ldongCd);

        if (!serverData.prkplceNm) throw new Error('주차장명이 비어있습니다');
        if (!serverData.zip) throw new Error('우편번호가 비어있습니다');
        if (serverData.totPrkCnt === 0) throw new Error('주차면수가 0입니다');

        // 신규 등록 시 주차장관리번호 제거
        if (isNewRecord) {
            delete serverData.prkPlceManageNo;
        }

        // 7. FormData 생성
        const formData = new FormData();
        formData.append('parkingData', new Blob([JSON.stringify(serverData)], {
            type: 'application/json'
        }));

        // 🔥 사진 추가 로직...
        const mainPhotoLib = document.getElementById('f_photo_lib');
        const mainPhotoCam = document.getElementById('f_photo_cam');
        if (mainPhotoLib && mainPhotoLib.files && mainPhotoLib.files.length > 0) {
            formData.append('mainPhoto', mainPhotoLib.files[0]);
        } else if (mainPhotoCam && mainPhotoCam.files && mainPhotoCam.files.length > 0) {
            formData.append('mainPhoto', mainPhotoCam.files[0]);
        }

        const signPhotoLib = document.getElementById('f_sign_photo_lib');
        const signPhotoCam = document.getElementById('f_sign_photo_cam');
        if (signPhotoLib && signPhotoLib.files && signPhotoLib.files.length > 0) {
            formData.append('signPhoto', signPhotoLib.files[0]);
        } else if (signPhotoCam && signPhotoCam.files && signPhotoCam.files.length > 0) {
            formData.append('signPhoto', signPhotoCam.files[0]);
        }

        // 8. 전송
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('⏰ 요청 타임아웃 (시간 초과)');
        }, 60000);

        let response;
        try {
            response = await fetch('/prk/onparking-update', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }

        // 9. 응답 처리
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n\n${errorText}`);
        }
        const result = await response.json();
        if (result.success) {
            handlePostSave(isNewRecord ? '/prk/parkinglist' : '/prk/parkinglist');
        } else {
            console.error('❌ 저장 실패:', result.message);
            alert('저장 실패: ' + result.message);
        }

    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ doSave 함수 예외 발생');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('예외 메시지:', error.message);
        console.error('스택:', error.stack);

        if (error.name === 'AbortError') {
            alert('⏰ 서버 응답 시간이 초과되었습니다.');
        } else {
            alert('저장 중 오류가 발생했습니다:\n' + error.message);
        }
    }
}

// 🔥 쉼표 제거 및 숫자 변환 함수 수정 - null을 0으로 변환
function parseCurrency(value) {
    if (!value || value === '' || value === null || value === undefined) {
        return 0; // 🔥 null/빈값은 0으로 반환
    }
    // 문자열에서 쉼표 제거 후 숫자로 변환
    const cleaned = value.toString().replace(/,/g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return (isNaN(parsed) || parsed < 0) ? 0 : parsed; // 🔥 음수도 0으로
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

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', async function () {
    // 🔥 1. URL에서 관리번호 확인하여 신규/조회 구분
    const prkPlceManageNo = p.id || f_id?.value;
    const isNewRecord = !prkPlceManageNo || prkPlceManageNo === '';
    // 🔥 2. 진행상태 로드 (모든 상태 표시)
    await RegionCodeLoader.loadProgressStatus();
    // 3. 행정구역 코드 로드
    await RegionCodeLoader.loadSidoList();
    RegionCodeLoader.setupEventListeners();

    // 4. 동적 코드 로드
    await CodeLoader.applyAllDynamicCodes();

    // 5. 주간/야간 섹션 설정
    setupDayNightSections();

    // 6. 시간제운영 이벤트 설정
    setupTimeOperationEvents('day');
    setupTimeOperationEvents('night');

    // 7. 경사구간 이벤트 설정
    setupSlopeToggle();

    // 8. 주차장 표지판 이벤트 설정
    setupSignToggle();

    // 🔥 9. 전화번호 입력 필드에 자동 포맷팅 적용
    const f_mgr_tel = document.getElementById('f_mgr_tel');
    if (f_mgr_tel) {
        f_mgr_tel.addEventListener('input', function (e) {
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
        f_mgr_tel.addEventListener('blur', function (e) {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    // 🔥 10. 저장 버튼 이벤트 - 로그 추가
    const btnSave = document.getElementById('btnSave');
    const btnSaveTop = document.getElementById('btnSaveTop');
    if (btnSave) {
        btnSave.addEventListener('click', function (e) {
            e.preventDefault(); // 폼 제출 방지
            doSave();
        });
    } else {
        console.error('❌ btnSave 요소를 찾을 수 없습니다!');
    }

    if (btnSaveTop) {
        btnSaveTop.addEventListener('click', function (e) {
            e.preventDefault(); // 폼 제출 방지
            doSave();
        });
    } else {
        console.error('❌ btnSaveTop 요소를 찾을 수 없습니다!');
    }

    // 🔥 11. 상세 데이터 로드 (신규가 아닌 경우에만)
    if (!isNewRecord) {
        await loadParkingDetail(prkPlceManageNo);
    } else {
        // 🔥 신규 등록 시 기본값 설정
        if (f_status) {
            f_status.value = '10';
        }
    }
});

/**
 * Maps the payload data to the server format.
 * @param {Object} payload The payload data from the client.
 * @returns {Object} The server format data.
 */
// ========== 🔥 서버 데이터 매핑 함수 완전 수정 ==========
function mapPayloadToServerFormat(payload) {
    // Get the select values for administrative districts
    // 🔥 1. 행정구역 코드 가져오기
    const f_sido = document.getElementById('f_sido');
    const f_sigungu = document.getElementById('f_sigungu');
    const f_emd = document.getElementById('f_emd');

    const sidoCd = f_sido?.value || null;
    const sigunguCd = f_sigungu?.value || null;
    const emdCd = f_emd?.value || null;

    // 🔥 2. 법정동코드(ldongCd) 명시적 생성
    // 기존: emdCd만 사용하여 DB에 120만 들어감
    // 수정: generateLdongCd()를 호출하거나 직접 조합하여 10자리 코드 생성
    let ldongCd = null;
    if (sigunguCd && emdCd) {
        if (emdCd.length === 3) {
            // 시군구(5) + 읍면동(3) + 리(00) = 10자리
            ldongCd = sigunguCd + emdCd + '00';
        } else if (emdCd.length === 5) {
            // 시군구(5) + 읍면동(5) = 10자리 (경우에 따라 다름)
            ldongCd = sigunguCd + emdCd;
        } else if (emdCd.length === 10) {
            ldongCd = emdCd;
        } else {
            // 기본 조합 시도
            ldongCd = sigunguCd + emdCd.padEnd(5, '0');
        }
    }

    if (!ldongCd || ldongCd.length !== 10) {
        console.warn('⚠️ 법정동코드 생성 실패 또는 길이 오류:', ldongCd);
        // 실패 시 payload에 있는 값을 사용해봅니다 (buildPayload에서 생성했었다면)
        ldongCd = payload.ldongCd || ldongCd;
    }

    console.log(`🛠️ 법정동코드 매핑: 시군구(${sigunguCd}) + 읍면동(${emdCd}) => ldongCd(${ldongCd})`);

    const isNewRecord = !payload.id || payload.id.trim() === '';
    const prkBizMngNo = isNewRecord ? null : loadedBizMngNo;

    const serverData = {
        /* ========== Basic Information ========== */
        prkPlceManageNo: payload.id || null,
        prkplceNm: payload.name || '',
        prgsStsCd: payload.status || '10',
        prkPlceType: '1',

        // 🔥 수정: 명시적으로 생성한 10자리 ldongCd 사용
        ldongCd: ldongCd,

        zip: document.getElementById('f_zip')?.value || null,
        dtadd: document.getElementById('f_addr_jibun')?.value || null,
        rnmadr: document.getElementById('f_addr_road')?.value || null,
        prkPlceLat: document.getElementById('f_lat')?.value || null,
        prkPlceLon: document.getElementById('f_lng')?.value || null,

        /* ========== 🔥 행정구역 - 직접 매핑 ========== */
        sidoCd: sidoCd,
        sigunguCd: sigunguCd,
        emdCd: emdCd,

        /* ========== 🔥 사업관리번호 추가 ========== */
        prkBizMngNo: prkBizMngNo,

        // ... 나머지 데이터 매핑 (기존 코드 유지) ...
        totPrkCnt: num(totalInput?.value) || 0,
        disabPrkCnt: num(disInput?.value) || 0,
        compactPrkCnt: num(smallInput?.value) || 0,
        ecoPrkCnt: num(greenInput?.value) || 0,
        pregnantPrkCnt: num(pregInput?.value) || 0,

        prkOperMthdCd: payload.operationType || null,
        operMbyCd: document.querySelector('input[name="own"]:checked')?.value || null,
        mgrOrg: document.getElementById('f_mgr_name')?.value || null,
        mgrOrgTelNo: document.getElementById('f_mgr_tel')?.value || null,
        subordnOpertnCd: document.getElementById('f_oddEven')?.value || null,

        dyntDvCd: payload.times.day && payload.times.night ? '03' :
            payload.times.day ? '01' : '02',

        wkZon: document.getElementById('f_day_grade')?.value || null,
        wkFeeAplyCd: document.getElementById('f_day_feeType')?.value || null,
        wkResDayFee: parseCurrency(document.getElementById('f_day_res_all')?.value),
        wkResWkFee: parseCurrency(document.getElementById('f_day_res_day')?.value),
        wkResFtFee: parseCurrency(document.getElementById('f_day_res_full')?.value),
        wkGnFrst30mFee: parseCurrency(document.getElementById('f_day_fee_first30')?.value),
        wkGnInt10mFee: parseCurrency(document.getElementById('f_day_fee_per10')?.value),
        wkGn1hFee: parseCurrency(document.getElementById('f_day_fee_per60')?.value),
        wkGnDayFee: parseCurrency(document.getElementById('f_day_fee_daily')?.value),
        wkFeeMnthPassPrc: parseCurrency(document.getElementById('f_day_fee_monthly')?.value),
        wkFeeHfyrPassPrc: parseCurrency(document.getElementById('f_day_fee_halfyear')?.value),
        wkFeeMthdCd: collectPayMethods('day').join(',') || null,
        wkFeeStlmtMthdCd: collectSettleMethods('day').join(',') || null,
        wkFeePayMthdOthr: document.getElementById('day_pay_etc_input')?.value || null,

        ntZon: document.getElementById('f_night_grade')?.value || null,
        ntFeeAplyCd: document.getElementById('f_night_feeType')?.value || null,
        ntResDayFee: parseCurrency(document.getElementById('f_night_res_all')?.value),
        ntResWkFee: parseCurrency(document.getElementById('f_night_res_full')?.value),
        ntResNtFee: parseCurrency(document.getElementById('f_night_res_night')?.value),
        ntGnFrst30mFee: parseCurrency(document.getElementById('f_night_fee_first30')?.value),
        ntGnInt10mFee: parseCurrency(document.getElementById('f_night_fee_per10')?.value),
        ntGn1hFee: parseCurrency(document.getElementById('f_night_fee_per60')?.value),
        ntGnDayFee: parseCurrency(document.getElementById('f_night_fee_daily')?.value),
        ntFeeMnthPassPrc: parseCurrency(document.getElementById('f_night_fee_monthly')?.value),
        ntFeeHfyrPassPrc: parseCurrency(document.getElementById('f_night_fee_halfyear')?.value),
        ntFeeMthdCd: collectPayMethods('night').join(',') || null,
        ntFeeStlmtMthdCd: collectSettleMethods('night').join(',') || null,
        ntFeePayMthdOthr: document.getElementById('night_pay_etc_input')?.value || null,

        wkWkdyOperTmCd: null,
        wkWkdyOperStarTm: null,
        wkWkdyOperEndTm: null,
        wkSatOperTmCd: null,
        wkSatOperStarTm: null,
        wkSatOperEndTm: null,
        wkHldyOperTmCd: null,
        wkHldyOperStarTm: null,
        wkHldyOperEndTm: null,

        ntWkdyOperTmCd: null,
        ntWkdyOperStarTm: null,
        ntWkdyOperEndTm: null,
        ntSatOperTmCd: null,
        ntSatOperStarTm: null,
        ntSatOperEndTm: null,
        ntHldyOperTmCd: null,
        ntHldyOperStarTm: null,
        ntHldyOperEndTm: null,

        prklotSignYn: document.querySelector('input[name="parkingSign"]:checked')?.value || 'N',
        slpSecYn: document.getElementById('slope_yes')?.checked ? 'Y' : 'N',
        sixleCnt: document.getElementById('slope_yes')?.checked ? num(document.getElementById('f_slope_start')?.value) : null,
        sixgtCnt: document.getElementById('slope_yes')?.checked ? num(document.getElementById('f_slope_end')?.value) : null,
        antislpFcltyYn: document.getElementById('antislp_facility_chk')?.checked ? 'Y' : 'N',
        slpCtnGuidSignYn: document.getElementById('slp_guide_sign_chk')?.checked ? 'Y' : 'N',
        partclrMatter: document.getElementById('f_partclr_matter')?.value || null
    };

    // ... existing code (운영시간 바인딩 부분) ...
    if (payload.times.day && payload.day?.operatingHours) {
        const dayHours = payload.day.operatingHours;
        serverData.wkWkdyOperTmCd = dayHours.weekday?.code || null;
        if (dayHours.weekday?.time) {
            serverData.wkWkdyOperStarTm = dayHours.weekday.time.startTime;
            serverData.wkWkdyOperEndTm = dayHours.weekday.time.endTime;
        }
        serverData.wkSatOperTmCd = dayHours.saturday?.code || null;
        if (dayHours.saturday?.time) {
            serverData.wkSatOperStarTm = dayHours.saturday.time.startTime;
            serverData.wkSatOperEndTm = dayHours.saturday.time.endTime;
        }
        serverData.wkHldyOperTmCd = dayHours.holiday?.code || null;
        if (dayHours.holiday?.time) {
            serverData.wkHldyOperStarTm = dayHours.holiday.time.startTime;
            serverData.wkHldyOperEndTm = dayHours.holiday.time.endTime;
        }
    }

    if (payload.times.night && payload.night?.operatingHours) {
        const nightHours = payload.night.operatingHours;
        serverData.ntWkdyOperTmCd = nightHours.weekday?.code || null;
        if (nightHours.weekday?.time) {
            serverData.ntWkdyOperStarTm = nightHours.weekday.time.startTime;
            serverData.ntWkdyOperEndTm = nightHours.weekday.time.endTime;
        }
        serverData.ntSatOperTmCd = nightHours.saturday?.code || null;
        if (nightHours.saturday?.time) {
            serverData.ntSatOperStarTm = nightHours.saturday.time.startTime;
            serverData.ntSatOperEndTm = nightHours.saturday.time.endTime;
        }
        serverData.ntHldyOperTmCd = nightHours.holiday?.code || null;
        if (nightHours.holiday?.time) {
            serverData.ntHldyOperStarTm = nightHours.holiday.time.startTime;
            serverData.ntHldyOperEndTm = nightHours.holiday.time.endTime;
        }
    }

    return serverData;
}

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