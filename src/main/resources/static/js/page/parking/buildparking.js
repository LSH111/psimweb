/* buildparking.js — 부설주차장 상세 페이지 */

// ========== 유틸 ==========
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const __CTX = (() => {
    if (window.contextPath) return window.contextPath.replace(/\/$/, '');
    const match = window.location.pathname.match(/^\/[^/]+/);
    return match ? match[0] : '';
})();
const withBase = (url) => {
    if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
    if (__CTX && url.startsWith('/')) return `${__CTX}${url}`;
    return url;
};

// 업로드 리스트 유틸이 없을 때 안전 가드 (onparking.js 동일)
if (typeof window.appendUploadedFiles === 'undefined') {
    window.appendUploadedFiles = function (listSelector, files) {
        const list = document.querySelector(listSelector || '#uploadedFileList');
        if (!list || !files) return;
        Array.from(files).forEach((file) => {
            const li = document.createElement('li');
            li.className = 'uploaded-file';
            li.textContent = file.name || file.filename || '파일';
            list.appendChild(li);
        });
    };
}

function params() {
    const sp = new URLSearchParams(location.search);
    return new Proxy({}, {get: (_, k) => sp.get(k) || ''});
}

function num(v) {
    const n = parseInt((v || '').toString().replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseDecimal(v) {
    if (!v) return null;
    const sanitized = v.toString().trim().replace(/[^0-9.-]/g, '');
    if (!sanitized) return null;
    const parsed = parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDateInput(value) {
    if (!value) return '';
    const str = value.toString().trim();
    if (!str) return '';
    if (/^\d{8}$/.test(str)) {
        return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6)}`;
    }
    return str.length >= 10 ? str.slice(0, 10) : str;
}

function formatDateForDb(value) {
    const normalized = normalizeDateInput(value);
    if (!normalized) return null;
    const digits = normalized.replace(/[^0-9]/g, '');
    return digits.length === 8 ? digits : null;
}

const p = params();
const serverStatusValue = (document.body?.dataset?.status || document.getElementById('statusCode')?.value || '').trim();

// ========== 이미지 미리보기 ==========
if (typeof ImagePreview === 'undefined') {
    var ImagePreview = {
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
        async show(prkPlceInfoSn, prkImgId, seqNo, fileName, event) {
            this.createTooltip();
            const loadingDiv = this.tooltip.querySelector('.tooltip-loading');
            const img = this.tooltip.querySelector('.tooltip-image');
            const fileNameEl = this.tooltip.querySelector('.tooltip-filename');
            loadingDiv.style.display = 'block';
            img.style.display = 'none';
            fileNameEl.textContent = fileName || '';
            this.updatePosition(event);
            this.tooltip.style.display = 'block';
            try {
                const imageUrl = withBase(`/prk/photo?prkPlceInfoSn=${prkPlceInfoSn}&prkImgId=${prkImgId}&seqNo=${seqNo}`);
                img.onload = () => {
                    loadingDiv.style.display = 'none';
                    img.style.display = 'block';
                };
                img.onerror = () => {
                    loadingDiv.innerHTML = '<p style="color: #ef4444;">이미지를 불러올 수 없습니다</p>';
                };
                img.src = imageUrl;
            } catch (error) {
                loadingDiv.innerHTML = '<p style="color: #ef4444;">오류가 발생했습니다</p>';
            }
        },
        updatePosition(event) {
            if (!this.tooltip) return;
            const offset = 15;
            const x = event.clientX;
            const y = event.clientY;
            const tooltipRect = this.tooltip.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let left = x + offset;
            let top = y + offset;
            if (left + tooltipRect.width > vw) left = x - tooltipRect.width - offset;
            if (top + tooltipRect.height > vh) top = y - tooltipRect.height - offset;
            this.tooltip.style.left = `${left}px`;
            this.tooltip.style.top = `${top}px`;
        },
        hide() {
            if (this.tooltip) this.tooltip.style.display = 'none';
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }
        },
        showWithDelay(prkPlceInfoSn, prkImgId, seqNo, fileName, event, delay = 300) {
            if (this.currentTimeout) clearTimeout(this.currentTimeout);
            this.currentTimeout = setTimeout(() => {
                this.show(prkPlceInfoSn, prkImgId, seqNo, fileName, event);
            }, delay);
        }
    };
}

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

const PAY_METHOD_ETC_CODE = '04';

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

// 🔥 법정동코드 생성 (공통 유틸 사용: 시군구5 + 읍면동3 + 리2)
function generateLdongCd() {
    const f_sigungu = document.getElementById('f_sigungu');
    const f_emd = document.getElementById('f_emd');
    const f_ri = document.getElementById('f_ri');

    const sigunguCd = f_sigungu?.value;
    const emdCd = f_emd?.value;
    const liCd = f_ri?.value;

    // 공통 유틸이 로드되지 않았을 경우를 대비한 안전 가드
    if (typeof LdongUtil === 'undefined') {
        window.LdongUtil = {
            generateLdongCd: function (sigungu, emd, li) {
                const norm = (v, len) => {
                    const digits = (v || '').toString().replace(/\D/g, '');
                    if (!digits) return '';
                    if (digits.length > len) return digits.substring(0, len);
                    return (Array(len + 1).join('0') + digits).slice(-len);
                };
                const s5 = norm(sigungu, 5);
                const e3 = norm(emd, 3);
                const l2 = norm(li, 2) || '00';
                const ld = `${s5}${e3}${l2}`;
                return /^\d{10}$/.test(ld) ? ld : null;
            }
        };
    }

    const ldongCd = LdongUtil.generateLdongCd(sigunguCd, emdCd, liCd);
    if (!ldongCd) {
        console.error('❌ 법정동코드 생성 실패:', sigunguCd, emdCd, liCd);
    } else {
    }
    return ldongCd;
}

// 🔥 관리주체(소유주체) 코드 정규화/선택 헬퍼
function normalizeOwnCdValue(raw) {
    if (raw === undefined || raw === null) return '';
    const value = String(raw).trim();
    if (!value) return '';
    if (value.includes('공영')) return '1';
    if (value.includes('민영') || value.includes('민간')) return '2';
    if (value.includes('기타')) return '9';
    const stripped = value.replace(/^0+/, '');
    return ['1', '2', '9'].includes(stripped) ? stripped : '';
}

function applyOwnCdSelection(rawValue) {
    const normalized = normalizeOwnCdValue(rawValue);
    if (!normalized) return;
    const radio = document.querySelector(`input[name="ownCd"][value="${normalized}"]`);
    if (radio) {
        radio.checked = true;
    }
}

function getSelectedOwnCd() {
    return document.querySelector('input[name="ownCd"]:checked')?.value || '';
}

// ========== 🔥 행정구역 코드 로더 추가 ==========
const RegionCodeLoader = {
    // 진행상태 로드
    async loadProgressStatus() {
        try {
            const response = await fetch(withBase('/cmm/codes/status'));
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
            }
        } catch (error) {
            console.error('❌ 진행상태 로드 실패:', error);
        }
    },

    // 시도 목록 로드
    async loadSidoList() {
        try {
            const response = await fetch(withBase('/cmm/codes/sido'));
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

            const response = await fetch(withBase(`/cmm/codes/sigungu?sidoCd=${sidoCd}`));
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

            const response = await fetch(withBase(`/cmm/codes/emd?sigunguCd=${sigunguCd}`));
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
            console.error('❌ 읍면동 로드 실패:', error);
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
    async loadDynamicCodes() {
        try {
            const response = await fetch(withBase('/cmm/codes/dynamic-groups'));
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

        // PRK_001: 관리주체(소유주체)
        // 부설 화면은 서버/DB와 값 매핑(1/2/9)이 고정되어 있어 기존 라디오를 유지합니다.

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

            this.populateOperationTimeRadios('weekday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('saturday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('holiday', groups['PRK_004'].codes);
        }

        // PRK_007: 요금지불방식
        if (groups['PRK_006']) {
            const codesWithoutEtc = groups['PRK_006'].codes.filter(code =>
                !code.codeNm.includes('기타') && !code.codeCd.includes('기타')
            );

            const payGroup = $('#pay_group');
            if (payGroup) {
                this.populateCheckboxGroup('#pay_group', 'payMethod', codesWithoutEtc);
                this.addEtcCheckbox(payGroup, 'pay_etc_chk', 'pay_etc_input', 'payMethod');
            }
        }

        // PRK_007: 요금정산방식
        if (groups['PRK_007']) {
            this.populateCheckboxGroup('#settle_group', 'settleMethod', groups['PRK_007'].codes);
        }

        // PRK_009: 주차장구분
        if (groups['PRK_009']) {
            this.populateRadioGroup('#parking_type_group', 'parkingType', groups['PRK_009'].codes);
        }

        // PRK_008: 차량인식종류
        if (groups['PRK_008']) {
            this.populateRadioGroup('#vehicle_recognition_group', 'vehicleRecognition', groups['PRK_008'].codes);
        }

        // PRK_011: 기계식주차장형태
        if (groups['PRK_011']) {
            this.populateRadioGroup('#mech_prklot_type_group', 'mechPrklotType', groups['PRK_011'].codes);
        }

        // PRK_012: 기계식주차장 작동여부
        if (groups['PRK_012']) {
            this.populateRadioGroup('#mech_prklot_oper_group', 'mechPrklotOper', groups['PRK_012'].codes);
        }

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

        // 1. 우편번호
        const f_zip = document.getElementById('f_zip');
        if (f_zip && data.zonecode) {
            f_zip.value = data.zonecode;
        }

        // 2. 지번주소 / 도로명주소 먼저 입력
        if (f_addrJ && data.jibunAddress) {
            f_addrJ.value = data.jibunAddress;
        }

        if (f_addrR) {
            const roadAddr = data.roadAddress || data.autoRoadAddress || '';
            f_addrR.value = roadAddr;
        }

        // 3. 시도/시군구/읍면동 코드 매핑용 객체
        const regionMap = {
            sido: data.sido,
            sigungu: data.sigungu,
            bname: data.bname,
            bname1: data.bname1,
            bname2: data.bname2
        };

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
        }

        // 8. 산 여부 판단
        const isMountain = data.jibunAddress && data.jibunAddress.includes('산');
        setMountainRadioByBoolean(!!isMountain);

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
        }
        if (subNumInput) {
            subNumInput.value = subNum;
        }

        // 10. 건물명 입력
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
    const sido = f_sido?.selectedOptions?.[0]?.textContent?.trim() || '';
    const sigungu = f_sigungu?.selectedOptions?.[0]?.textContent?.trim() || '';
    const emd = f_emd?.selectedOptions?.[0]?.textContent?.trim() || '';
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
                this.progressArea?.classList.remove('completed');
            }, 500);
            // 진행률 UI가 즉시 사라지면 파일이 사라진 것으로 보여 혼란이 생기므로 자동 숨김은 제거한다.
        }
    }

    error(message) {
        if (this.fileStatus) {
            this.fileStatus.textContent = message || '전송실패';
            this.fileStatus.className = 'file-status error';
        }
    }

    autoHideSoon() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }
        this.autoHideTimer = setTimeout(() => this.hide(), 1200);
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
        if (this.progressArea) {
            this.progressArea.classList.remove('completed');
        }
        if (this.fileItem) {
            this.fileItem.style.display = 'none';
        }
        if (this.fileName) this.fileName.textContent = '';
        if (this.fileSize) this.fileSize.textContent = '0MB / 0MB';
        if (this.fileStatus) {
            this.fileStatus.textContent = '';
            this.fileStatus.className = 'file-status';
        }

        if (this.btnComplete) this.btnComplete.style.display = 'none';
        if (this.btnCancel) this.btnCancel.style.display = 'inline-block';
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }
}

const uploadProgress = new FileUploadProgress();

function clearUploadProgressUI() {
    if (uploadProgress && typeof uploadProgress.hide === 'function') {
        uploadProgress.hide();
    }
    const progressArea = document.getElementById('upload-progress-area');
    if (progressArea) {
        progressArea.style.display = 'none';
    }
}

function closeParentTabAndRefreshList() {
    if (!window.parent || window.parent === window) return false;
    try {
        if (typeof window.parent.reloadList === 'function') {
            window.parent.reloadList();
        }

        const iframeEl = window.frameElement;
        const panelEl = iframeEl ? iframeEl.closest('.tab-panel') : null;
        if (panelEl && window.parent.Tabs && typeof window.parent.Tabs.closeTop === 'function') {
            const tabBtn = window.parent.document.querySelector(`.tab-btn[aria-controls="${panelEl.id}"]`);
            if (tabBtn) {
                window.parent.Tabs.closeTop(tabBtn);
                if (window.parent.Tabs.activateTop) {
                    window.parent.Tabs.activateTop('tabList');
                }
                return true;
            }
        }
    } catch (e) {
        console.warn('부모 탭 제어 실패:', e);
    }
    return false;
}

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
            } else {
                operInputWrap.style.display = 'none';
                if (operValueInput) {
                    operValueInput.value = '';
                }
            }
        }
    });

    const checkedRadio = operGroup.querySelector('input[name="mechPrklotOper"]:checked');
    if (checkedRadio && checkedRadio.value === '03') {
        operInputWrap.style.display = 'block';
    }

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

}

// ========== 🔥 시간제운영 처리 함수 ==========
function setupTimeOperationEvents(dayType) {
    const group = $(`#${dayType}_operation_group`);
    const timeWrap = $(`#${dayType}_time_wrap`);

    if (group && timeWrap) {
        group.addEventListener('change', function (e) {
            if (e.target.name === `${dayType}Operation`) {
                const formatted = formatOperationCode(e.target.value);
                timeWrap.style.display = requiresOperationTimeDetail(formatted) ? 'block' : 'none';
            }
        });
    }
}

function normalizeOperationCode(code) {
    if (code === null || code === undefined) return '';
    const trimmed = code.toString().trim();
    if (!trimmed) return '';
    const normalized = trimmed.replace(/^0+/, '');
    return normalized || '0';
}

function formatOperationCode(code) {
    const normalized = normalizeOperationCode(code);
    if (!normalized) return null;
    return normalized.padStart(2, '0');
}

function requiresOperationTimeDetail(code) {
    const normalized = normalizeOperationCode(code);
    return normalized === '2';
}

function setOperationTimeFromData(dayType, code, startStr, endStr) {
    if (!dayType) return;
    const normalized = normalizeOperationCode(code);
    const candidates = [];
    if (code) candidates.push(code.toString());
    if (normalized && normalized !== code) candidates.push(normalized);

    let target = null;
    for (const value of candidates) {
        target = document.querySelector(`input[name="${dayType}Operation"][value="${value}"]`);
        if (target) break;
    }

    if (target) {
        target.checked = true;
        target.dispatchEvent(new Event('change'));
    }

    const timeWrap = document.getElementById(`${dayType}_time_wrap`);
    if (timeWrap) {
        timeWrap.style.display = requiresOperationTimeDetail(normalized) ? 'block' : 'none';
    }

    fillOperationTimeInputs(dayType, startStr, endStr);
}

function fillOperationTimeInputs(dayType, startStr, endStr) {
    const start = parseTimeStringForInput(startStr);
    const end = parseTimeStringForInput(endStr);

    const startHour = document.getElementById(`${dayType}_start_hour`);
    const startMin = document.getElementById(`${dayType}_start_min`);
    const endHour = document.getElementById(`${dayType}_end_hour`);
    const endMin = document.getElementById(`${dayType}_end_min`);

    if (startHour && start.hour != null) startHour.value = start.hour;
    if (startMin && start.minute != null) startMin.value = start.minute;
    if (endHour && end.hour != null) endHour.value = end.hour;
    if (endMin && end.minute != null) endMin.value = end.minute;
}

function parseTimeStringForInput(value) {
    if (!value) return {hour: null, minute: null};
    const digits = value.toString().replace(/[^0-9]/g, '');
    if (!digits) return {hour: null, minute: null};
    const padded = digits.padStart(4, '0');
    const hour = parseInt(padded.slice(0, 2), 10);
    const minute = parseInt(padded.slice(2, 4), 10);
    if (!Number.isFinite(hour) || hour < 0) return {hour: null, minute: null};
    return {
        hour: Math.min(hour, 23),
        minute: Number.isFinite(minute) ? Math.min(Math.max(minute, 0), 59) : 0
    };
}

function formatOperationTimeForDb(hourValue, minuteValue) {
    if (hourValue === undefined || hourValue === null || hourValue === '') return null;
    const hour = parseInt(hourValue, 10);
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) return null;
    let minute = parseInt(minuteValue, 10);
    if (!Number.isFinite(minute) || minute < 0 || minute > 59) minute = 0;
    return `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
}

function collectOperationTimePayload(dayType) {
    const rawCode = document.querySelector(`input[name="${dayType}Operation"]:checked`)?.value;
    const formattedCode = formatOperationCode(rawCode);
    const requiresDetail = requiresOperationTimeDetail(formattedCode);

    const startHour = document.getElementById(`${dayType}_start_hour`)?.value;
    const startMin = document.getElementById(`${dayType}_start_min`)?.value;
    const endHour = document.getElementById(`${dayType}_end_hour`)?.value;
    const endMin = document.getElementById(`${dayType}_end_min`)?.value;

    return {
        code: formattedCode,
        start: requiresDetail ? formatOperationTimeForDb(startHour, startMin) : null,
        end: requiresDetail ? formatOperationTimeForDb(endHour, endMin) : null
    };
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

function setupFallPhotoHandlers() {
    const fallPhotoLib = $('#f_fall_photo_lib');
    const fallPhotoCam = $('#f_fall_photo_cam');
    const fallPreview = $('#fall_preview');
    const fallPhotoWrap = $('#fall_photo_wrap');
    const fallRadios = $$('input[name="fallPrevention"]');

    $('#btnFallPhotoLibrary')?.addEventListener('click', () => fallPhotoLib?.click());
    $('#btnFallPhotoCamera')?.addEventListener('click', () => fallPhotoCam?.click());

    $('#btnClearFallPhoto')?.addEventListener('click', () => {
        if (fallPhotoLib) fallPhotoLib.value = '';
        if (fallPhotoCam) fallPhotoCam.value = '';
        if (fallPreview) {
            fallPreview.removeAttribute('src');
            fallPreview.style.display = 'none';
        }
    });

    fallPhotoLib?.addEventListener('change', (e) => handleFallPhoto(e.target.files));
    fallPhotoCam?.addEventListener('change', (e) => handleFallPhoto(e.target.files));

    fallRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (fallPhotoWrap) {
                fallPhotoWrap.style.display = (this.checked && this.value === 'Y') ? 'block' : 'none';
            }
        });
    });
    if (fallPhotoWrap) {
        const checkedFall = fallRadios.find(r => r.checked && r.value === 'Y');
        fallPhotoWrap.style.display = checkedFall ? 'block' : 'none';
    }
}

async function handleFallPhoto(files) {
    const file = files && files[0];
    if (!file) return;

    const fallPreview = $('#fall_preview');
    if (fallPreview) {
        try {
            fallPreview.src = URL.createObjectURL(file);
            fallPreview.style.display = 'block';
        } catch (err) {
            console.error('사진 미리보기 오류:', err);
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

}

// ========== 🔥 발권기/차단기/출차알람 사진 업로드 이벤트 ==========
function setupFacilityPhotoUploads() {
    const facilities = [
        {
            libId: 'f_ticket_photo_lib',
            camId: 'f_ticket_photo_cam',
            previewId: 'ticket_preview',
            btnLibId: 'btnTicketPhotoLibrary',
            btnCamId: 'btnTicketPhotoCamera',
            btnClearId: 'btnClearTicketPhoto'
        },
        {
            libId: 'f_barrier_photo_lib',
            camId: 'f_barrier_photo_cam',
            previewId: 'barrier_preview',
            btnLibId: 'btnBarrierPhotoLibrary',
            btnCamId: 'btnBarrierPhotoCamera',
            btnClearId: 'btnClearBarrierPhoto'
        },
        {
            libId: 'f_exit_alarm_photo_lib',
            camId: 'f_exit_alarm_photo_cam',
            previewId: 'exit_alarm_preview',
            btnLibId: 'btnExitAlarmPhotoLibrary',
            btnCamId: 'btnExitAlarmPhotoCamera',
            btnClearId: 'btnClearExitAlarmPhoto'
        }
    ];

    facilities.forEach(cfg => {
        const libInput = document.getElementById(cfg.libId);
        const camInput = document.getElementById(cfg.camId);
        const preview = document.getElementById(cfg.previewId);
        const btnLib = document.getElementById(cfg.btnLibId);
        const btnCam = document.getElementById(cfg.btnCamId);
        const btnClear = document.getElementById(cfg.btnClearId);

        const showPreview = (file) => {
            if (!preview || !file) return;
            try {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            } catch (err) {
                console.error('사진 미리보기 오류:', err);
            }
        };

        btnLib?.addEventListener('click', () => libInput?.click());
        btnCam?.addEventListener('click', () => camInput?.click());

        btnClear?.addEventListener('click', () => {
            if (libInput) libInput.value = '';
            if (camInput) camInput.value = '';
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        });

        libInput?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) showPreview(file);
        });
        camInput?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) showPreview(file);
        });
    });
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

}

// ========== 🔥 사전점검 이벤트 ==========
function setupPreInspectionEvents() {
    const buildingFloorRadios = $$('input[name="buildingFloor"]');
    const fallPreventionWrap = $('#fall_prevention_wrap');
    const fallPhotoWrap = $('#fall_photo_wrap');

    buildingFloorRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (fallPreventionWrap) {
                fallPreventionWrap.style.display = (this.value === '2층이상') ? 'block' : 'none';
                if (fallPhotoWrap && this.value !== '2층이상') {
                    fallPhotoWrap.style.display = 'none';
                }
            }
        });
    });

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

}

// ========== 🔥 전역 변수로 사업관리번호, 정보일련번호 저장 ==========
let loadedBizMngNo = null;
let loadedPrkPlceInfoSn = null;
let autoManagerAdminSet = false;
let prevManagerValue = null;
let prevAdminValue = null;

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

// 진행상태 select에 코드/명칭을 방어적으로 매핑
function applyStatusSelect(selectEl, statusValue) {
    if (!selectEl) return;
    const val = (statusValue || '').trim();
    if (!val) return;
    selectEl.value = val;
    if (selectEl.value === val) return;
    const match = Array.from(selectEl.options || []).find(opt => opt.textContent.trim() === val);
    if (match) selectEl.value = match.value;
}

// 전화번호 포맷팅 (off/onparking과 동일)
function formatPhoneNumber(value) {
    if (!value) return '';
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 2) return digits;
    if (digits.startsWith('02')) {
        if (digits.length <= 5) return digits.replace(/^(\d{2})(\d+)/, '$1-$2');
        if (digits.length <= 9) return digits.replace(/^(\d{2})(\d{3})(\d+)/, '$1-$2-$3');
        return digits.replace(/^(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
    }
    if (digits.length <= 7) return digits.replace(/^(\d{3})(\d+)/, '$1-$2');
    if (digits.length <= 10) return digits.replace(/^(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    return digits.replace(/^(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
}

function applyPhoneFormat(input) {
    if (!input) return;
    input.addEventListener('input', function () {
        const before = this.value;
        const pos = this.selectionStart ?? before.length;
        const formatted = formatPhoneNumber(before);
        this.value = formatted;
        const diff = formatted.length - before.length;
        const newPos = pos + diff;
        this.selectionStart = this.selectionEnd = Math.max(0, newPos);
    });
    input.addEventListener('blur', function () {
        this.value = formatPhoneNumber(this.value);
    });
}

function setRadioValue(name, value) {
    if (!value) return;
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
    }
}

// 🔥 산 여부 값(Y/N 또는 1/0) 정규화
function normalizeMountainYnValue(value) {
    if (value === undefined || value === null) return null;
    const str = value.toString().trim().toUpperCase();
    if (!str) return null;
    if (str === 'Y' || str === '1') return 'Y';
    if (str === 'N' || str === '0') return 'N';
    return null;
}

// 🔥 산 여부 라디오 버튼 상태를 통합 헬퍼로 설정
function setMountainRadioByYn(value, triggerChange = false) {
    const yn = normalizeMountainYnValue(value);
    if (!yn) return;
    const candidates = yn === 'Y' ? ['Y', '1'] : ['N', '0'];
    for (const candidate of candidates) {
        const radio = document.querySelector(`input[name="mountainYn"][value="${candidate}"]`);
        if (radio) {
            radio.checked = true;
            if (triggerChange) {
                radio.dispatchEvent(new Event('change'));
            }
            return;
        }
    }
}

function setMountainRadioByBoolean(isMountain, triggerChange = false) {
    setMountainRadioByYn(isMountain ? 'Y' : 'N', triggerChange);
}

function getMechanicalSpacesTotal() {
    const ids = ['f_indoor_mechanical_spaces', 'f_outdoor_mechanical_spaces'];
    return ids.map(id => {
        const v = document.getElementById(id)?.value;
        const n = parseInt((v || '').toString().replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    }).reduce((a, b) => a + b, 0);
}

function applyManagerAdminAutoRule() {
    const total = getMechanicalSpacesTotal();
    const mgrY = document.querySelector('input[name="manager"][value="Y"]');
    const mgrN = document.querySelector('input[name="manager"][value="N"]');
    const admY = document.querySelector('input[name="admin"][value="Y"]');
    const admN = document.querySelector('input[name="admin"][value="N"]');
    if (total >= 20 && mgrY && mgrN && admY && admN) {
        if (mgrN.checked && admN.checked) {
            prevManagerValue = mgrY.checked ? 'Y' : (mgrN.checked ? 'N' : null);
            prevAdminValue = admY.checked ? 'Y' : (admN.checked ? 'N' : null);
            autoManagerAdminSet = true;
            mgrY.checked = true;
            mgrY.dispatchEvent(new Event('change'));
        } else {
            autoManagerAdminSet = false;
        }
    } else if (autoManagerAdminSet) {
        if (prevManagerValue) setRadioValue('manager', prevManagerValue);
        if (prevAdminValue) setRadioValue('admin', prevAdminValue);
        autoManagerAdminSet = false;
    }
}

function bindMechanicalAutoRule() {
    ['f_indoor_mechanical_spaces', 'f_outdoor_mechanical_spaces'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => applyManagerAdminAutoRule());
            el.addEventListener('input', () => applyManagerAdminAutoRule());
        }
    });
}

// ========== 🔥 페이지 로드 시 서버에서 데이터 가져오기 ==========
async function loadParkingDetailFromServer() {
    const prkPlceManageNo = document.getElementById('prkPlceManageNo')?.value || p.id;

    if (!prkPlceManageNo && !window.initialParking) {
        console.warn('⚠️ 주차장 관리번호가 없습니다.');
        return;
    }

    LoadingIndicator.show('주차장 정보를 불러오는 중...');

    try {
        if (window.initialParking) {
            await populateFormWithData(window.initialParking);
            return;
        }

        console.warn('initialParking 데이터가 없어 서버 요청을 건너뜁니다.');
    } catch (error) {
        console.error('❌ 서버 통신 오류:', error);
        alert('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
        LoadingIndicator.hide();
    }
}

// 🔥 서버 데이터로 폼 채우기 ==========
async function populateFormWithData(data) {

    // 🔥 사업관리번호, 정보일련번호 저장
    if (data.prkBizMngNo) {
        loadedBizMngNo = data.prkBizMngNo;
    }
    if (data.prkPlceInfoSn) {
        loadedPrkPlceInfoSn = data.prkPlceInfoSn;
    }

    // 기본 정보
    if (f_id) f_id.value = data.prkPlceManageNo || '';
    if (f_name) f_name.value = data.prkplceNm || '';
    // 🔥 진행상태 바인딩 (select)
    applyStatusSelect($('#f_status'), data.prgsStsCd || data.prgsStsNm || $('#f_status')?.dataset?.defaultStatus || '');
    // 🔥 행정구역 바인딩 (select) - sidoCd, sigunguCd 사용
    if (data.sidoCd) {
        const f_sido = $('#f_sido');
        if (f_sido) {
            f_sido.value = data.sidoCd;

            // 시군구 로드
            await RegionCodeLoader.loadSigunguList(data.sidoCd);

            if (data.sigunguCd) {
                const f_sigungu = $('#f_sigungu');
                if (f_sigungu) {
                    f_sigungu.value = data.sigunguCd;

                    // 읍면동 로드
                    await RegionCodeLoader.loadEmdList(data.sigunguCd);

                    if (data.emdCd) {
                        const f_emd = $('#f_emd');
                        if (f_emd) {
                            f_emd.value = data.emdCd;
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
    }

    // 🔥 산 여부 바인딩 (서버 값으로 라디오 버튼 상태 유지)
    setMountainRadioByYn(data.mntnYn, true);

    if (f_lat) f_lat.value = data.prkPlceLat || '';
    if (f_lng) f_lng.value = data.prkPlceLon || '';

    if (v_id) v_id.textContent = data.prkPlceManageNo || '';
    if (v_name) v_name.textContent = data.prkplceNm || '부설주차장 상세';
    updateHeaderAddr();

    // 🔧 [요청] 허가/검사/면적 정보 바인딩
    const permitInput = $('#f_permit_date');
    if (permitInput) permitInput.value = normalizeDateInput(data.prmisnDt);
    const inspInput = $('#f_inspection_date');
    if (inspInput) inspInput.value = normalizeDateInput(data.useInspDt);
    const siteAreaInput = $('#f_site_area');
    if (siteAreaInput) siteAreaInput.value = data.plotAr ?? '';
    const totalAreaInput = $('#f_total_floor_area');
    if (totalAreaInput) totalAreaInput.value = data.myeonAr ?? '';

    // 🔧 [요청] 기계식주차장 정보 바인딩
    if (data.mechPrklotTpCd) {
        const mechTypeRadio = document.querySelector(`input[name="mechPrklotType"][value="${data.mechPrklotTpCd}"]`);
        if (mechTypeRadio) {
            mechTypeRadio.checked = true;
            mechTypeRadio.dispatchEvent(new Event('change'));
        }
    }
    if (data.mechPrklotOperYn) {
        const mechOperRadio = document.querySelector(`input[name="mechPrklotOper"][value="${data.mechPrklotOperYn}"]`);
        if (mechOperRadio) {
            mechOperRadio.checked = true;
            mechOperRadio.dispatchEvent(new Event('change'));
        }
    }
    const mechOperDetail = $('#f_mech_prklot_oper_value');
    if (mechOperDetail) {
        mechOperDetail.value = data.mechPrkInopCnt != null ? data.mechPrkInopCnt : '';
    }

    // 🔧 [요청] 주차시설형태/급지 입력값 바인딩
    const assignValue = (selector, value) => {
        const el = document.querySelector(selector);
        if (el) el.value = value != null ? value : '';
    };
    assignValue('#f_total_floors', data.prkFcltyTpTotFlrCapa);
    assignValue('#f_total_scale_area', data.prkFcltyTpTotDeckCapa);
    assignValue('#f_indoor_ground_floors', data.indrSelfFlrCnt);
    assignValue('#f_indoor_ground_area', data.indrSelfDeckCnt);
    assignValue('#f_indoor_ground_spaces', data.indrSelfTotSpaceCnt);
    assignValue('#f_indoor_mechanical_floors', data.indrMechFlrCnt);
    assignValue('#f_indoor_mechanical_area', data.indrMechDeckCnt);
    assignValue('#f_indoor_mechanical_spaces', data.indrMechTotSpaceCnt);
    assignValue('#f_outdoor_ground_floors', data.outdrSelfFlrCnt);
    assignValue('#f_outdoor_ground_area', data.outdrSelfDeckCnt);
    assignValue('#f_outdoor_ground_spaces', data.outdrSelfTotSpaceCnt);
    assignValue('#f_outdoor_mechanical_floors', data.outdrMechFlrCnt);
    assignValue('#f_outdoor_mechanical_area', data.outdrMechDeckCnt);
    assignValue('#f_outdoor_mechanical_spaces', data.outdrMechTotSpaceCnt);

    // 기계식 주차면 입력값 반영 (총면수 기반 자동 규칙 사용)
    const indoorMech = document.getElementById('f_indoor_mechanical_spaces');
    const outdoorMech = document.getElementById('f_outdoor_mechanical_spaces');
    if (indoorMech) indoorMech.value = data.indrMechTotSpaceCnt ?? indoorMech.value ?? '';
    if (outdoorMech) outdoorMech.value = data.outdrMechTotSpaceCnt ?? outdoorMech.value ?? '';

    // 안내문 유무
    setRadioValue('announcement', data.guidDocYn === 'Y' ? 'Y' : 'N');
    setRadioValue('safetyCheck', data.safeInspYn === 'Y' ? 'Y' : 'N');

    // 관리인/관리자 유무
    setRadioValue('manager', data.mgrYn === 'Y' ? 'Y' : 'N');
    setRadioValue('admin', data.admYn === 'Y' ? 'Y' : 'N');

    // 관리기관 전화번호 포맷팅
    const mgrTelInput = document.getElementById('f_management_tel');
    if (mgrTelInput) {
        mgrTelInput.value = formatPhoneNumber(data.mgrOrgTelNo || mgrTelInput.value || '');
    }
    applyManagerAdminAutoRule();

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
    if (f_mgr_tel) f_mgr_tel.value = formatPhoneNumber(data.mgrOrgTelNo || f_mgr_tel.value || '');

    // 부제시행여부
    const f_oddEven = $('#f_oddEven');
    if (f_oddEven && data.subordnOpertnCd) {
        f_oddEven.value = data.subordnOpertnCd;
    }

    // 🔥 급지구분
    const f_grade = $('#f_grade');
    if (f_grade && data.chrgGrdCd) {
        f_grade.value = data.chrgGrdCd;
    }

    setOperationTimeFromData('weekday', data.wkdyOperTmCd, data.wkdyTmbasOperStrTm, data.wkdyTmbasOperEndTm);
    setOperationTimeFromData('saturday', data.satOperTmCd, data.satTmbasOperStrTm, data.satTmbasOperEndTm);
    setOperationTimeFromData('holiday', data.hldyOperTmCd, data.hldyTmbasOperStrTm, data.hldyTmbasOperEndTm);

    // 주차관리 시설 정보

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

    const residentFeeMeta = extractResidentFeeFromRemark(data.partclrMatter || '');
    const fallbackResidentFees = residentFeeMeta.fees || {};
    if ($('#f_partclr_matter')) $('#f_partclr_matter').value = residentFeeMeta.remark || '';

    // 요금 지불/정산 방식 적용
    applyPayMethods(data.feePayMthdCd || data.wkFeeMthdCd || data.ntFeeMthdCd || '', data.feePayMthdOthr || '');
    applySettleMethods(data.feeSetlMthdCd || data.wkFeeStlmtMthdCd || data.ntFeeStlmtMthdCd || '');

    // 요금 입력값 반영
    const resolveResidentValue = (primary, fallback) => {
        if (primary !== undefined && primary !== null && primary !== '') return primary;
        return (fallback !== undefined && fallback !== null) ? fallback : '';
    };

    assignValue('#f_day_res_all', resolveResidentValue(data.wkResDayFee, fallbackResidentFees.dayAll));
    assignValue('#f_day_res_day', resolveResidentValue(data.wkResWkFee, fallbackResidentFees.dayOnly));
    assignValue('#f_day_res_full', resolveResidentValue(data.wkResFtFee, fallbackResidentFees.fullTime));

    assignValue('#f_fee_first30', data.feeFrst30minPrc ?? data.wkGnFrst30mFee);
    assignValue('#f_day_fee_per10', data.fee10minPrc ?? data.wkGnInt10mFee);
    assignValue('#f_day_fee_per60', data.fee1hrPrc ?? data.wkGn1hFee);
    assignValue('#f_fee_daily', data.feeDayPrc ?? data.wkGnDayFee);
    assignValue('#f_fee_monthly', data.feeMnthPassPrc ?? data.wkFeeMnthPassPrc);
    assignValue('#f_fee_halfyear', data.feeHfyrPassPrc ?? data.wkFeeHfyrPassPrc);

    // 🔥 사진 미리보기 로드
    const infoSnForPhoto = loadedPrkPlceInfoSn || data.prkPlceInfoSn || document.getElementById('prkPlceInfoSn')?.value;
    if (infoSnForPhoto) {
        reloadParkingPhotos(infoSnForPhoto);
    }

    // 🔥 진행상태 확인 후 ReadOnly 처리 (코드값 30=승인)
    const statusValue = (data.prgsStsCd || $('#f_status')?.value || serverStatusValue || '').trim();
    applyApprovalLock(statusValue);

}

// ========== 🔥 모든 필드를 ReadOnly로 설정하는 함수 ==========
function isApprovedStatus(value) {
    if (!value) return false;
    const v = value.toString().trim();
    const upper = v.toUpperCase();
    return v === '30' || v === '20' || v === '승인' || v === '승인대기' || v === '승인대기중'
        || upper === 'APPROVED' || upper === 'APPROVAL_PENDING';
}

function applyApprovalLock(statusValue) {
    const approved = isApprovedStatus(statusValue);
    setAllFieldsReadOnly(approved);
    const btnSave = $('#btnSave');
    const btnSaveTop = $('#btnSaveTop');
    if (btnSave) btnSave.disabled = approved;
    if (btnSaveTop) btnSaveTop.disabled = approved;
    return approved;
}

// 요금 지불방식 적용 (콤마 구분 코드 문자열)
function applyPayMethods(codesStr, etcText = '') {
    const codes = (codesStr || '').split(',').map(s => s.trim()).filter(Boolean);
    const checks = document.querySelectorAll('input[name="payMethod"]');
    checks.forEach(c => {
        c.checked = false;
    });
    const etcChk = document.getElementById('pay_etc_chk');
    const etcInput = document.getElementById('pay_etc_input');
    if (etcInput) etcInput.value = '';

    codes.forEach(code => {
        if (code.startsWith('기타:')) {
            if (etcChk) etcChk.checked = true;
            if (etcInput) {
                etcInput.disabled = false;
                etcInput.value = code.substring(3) || '';
            }
            return;
        }
        if (code === '기타' || code === PAY_METHOD_ETC_CODE) {
            if (etcChk) etcChk.checked = true;
            if (etcInput) etcInput.disabled = false;
            return;
        }
        const chk = document.querySelector(`input[name="payMethod"][value="${code}"]`);
        if (chk) chk.checked = true;
    });
    if (etcChk) {
        if (etcText) {
            etcChk.checked = true;
            if (etcInput) {
                etcInput.disabled = false;
                etcInput.value = etcText;
            }
        } else if (etcChk.checked && etcInput && !etcInput.value) {
            etcInput.disabled = false;
        }
    }
}

// 요금 정산방식 적용 (콤마 구분 코드 문자열)
function applySettleMethods(codesStr) {
    const codes = (codesStr || '').split(',').map(s => s.trim()).filter(Boolean);
    const checks = document.querySelectorAll('input[name="settleMethod"]');
    checks.forEach(c => {
        c.checked = codes.includes(c.value);
    });
}

function collectPayMethods() {
    const checks = Array.from(document.querySelectorAll('input[name="payMethod"]'));
    const etcChk = document.getElementById('pay_etc_chk');
    const etcInput = document.getElementById('pay_etc_input');
    const codes = [];
    checks.forEach(c => {
        if (!c.checked) return;
        const value = c.value === '기타' ? PAY_METHOD_ETC_CODE : c.value;
        if (value && !codes.includes(value)) {
            codes.push(value);
        }
    });
    let etcText = null;
    if (etcChk?.checked) {
        const text = (etcInput?.value || '').trim();
        etcText = text || null;
        if (!codes.includes(PAY_METHOD_ETC_CODE)) {
            codes.push(PAY_METHOD_ETC_CODE);
        }
    }
    return {codes, etcText};
}

function collectSettleMethods() {
    const checks = Array.from(document.querySelectorAll('input[name="settleMethod"]'));
    return checks.filter(c => c.checked).map(c => c.value);
}

const RESIDENT_FEE_TAG = '[[RESIDENT_FEE]]';

function extractResidentFeeFromRemark(text) {
    if (!text) {
        return {remark: '', fees: null};
    }
    const markerIndex = text.indexOf(RESIDENT_FEE_TAG);
    if (markerIndex === -1) {
        return {remark: text, fees: null};
    }
    const remark = text.substring(0, markerIndex).trimEnd();
    const rawJson = text.substring(markerIndex + RESIDENT_FEE_TAG.length).trim();
    if (!rawJson) {
        return {remark, fees: null};
    }
    try {
        const parsed = JSON.parse(rawJson);
        return {
            remark,
            fees: {
                dayAll: parsed.dayAll ?? null,
                dayOnly: parsed.dayOnly ?? null,
                fullTime: parsed.fullTime ?? null
            }
        };
    } catch (err) {
        console.warn('⚠️ 거주자 요금 메타데이터 파싱 실패:', err);
        return {remark: text, fees: null};
    }
}

function encodeResidentFeeToRemark(remarkText, fees) {
    const baseRemark = remarkText || '';
    if (!fees || (fees.dayAll == null && fees.dayOnly == null && fees.fullTime == null)) {
        return baseRemark;
    }
    const cleanRemark = extractResidentFeeFromRemark(baseRemark).remark;
    const payload = {
        dayAll: fees.dayAll,
        dayOnly: fees.dayOnly,
        fullTime: fees.fullTime

    };
    const json = JSON.stringify(payload);
    const separator = cleanRemark && !cleanRemark.endsWith('\n') ? '\n' : '';
    return `${cleanRemark}${separator}${RESIDENT_FEE_TAG}${json}`;
}

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
        if (isReadOnly) {
            select.disabled = true;
            select.style.backgroundColor = '#f3f4f6';
            select.style.cursor = 'not-allowed';
            select.style.pointerEvents = 'none';
        } else {
            select.disabled = false;
            select.style.backgroundColor = '';
            select.style.cursor = '';
            select.style.pointerEvents = '';
        }
    });

    const radiosAndChecks = $$('input[type="radio"], input[type="checkbox"]');
    radiosAndChecks.forEach(input => {
        if (isReadOnly) {
            input.disabled = true;
            input.style.cursor = 'not-allowed';
            input.style.pointerEvents = 'none';
        } else {
            input.disabled = false;
            input.style.cursor = '';
            input.style.pointerEvents = '';
        }
    });

    const fileButtons = [
        '#btnPickFromLibrary', '#btnTakePhoto', '#btnUseGeolocation', '#btnClearPhoto',
        '#btnFindAddr',
        '#btnEntrancePhotoLibrary', '#btnEntrancePhotoCamera', '#btnClearEntrancePhoto',
        '#btnSignPhotoLibrary', '#btnSignPhotoCamera', '#btnClearSignPhoto',
        '#btnTicketPhotoLibrary', '#btnTicketPhotoCamera', '#btnClearTicketPhoto',
        '#btnBarrierPhotoLibrary', '#btnBarrierPhotoCamera', '#btnClearBarrierPhoto',
        '#btnExitAlarmPhotoLibrary', '#btnExitAlarmPhotoCamera', '#btnClearExitAlarmPhoto',
        '#btnFallPhotoLibrary', '#btnFallPhotoCamera', '#btnClearFallPhoto'
    ];
    fileButtons.forEach(selector => {
        const btn = $(selector);
        if (btn) {
            btn.disabled = isReadOnly;
            if (isReadOnly) {
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            } else {
                btn.style.cursor = '';
                btn.style.opacity = '';
                btn.style.pointerEvents = '';
            }
        }
    });

}

// 🔥 좌표로 행정구역 정보 가져오기
async function convertCoordToRegion(longitude, latitude) {
    try {
        const response = await fetch(withBase(`/api/kakao/coord2region?longitude=${longitude}&latitude=${latitude}`));
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
        const response = await fetch(withBase(`/api/kakao/coord2address?longitude=${longitude}&latitude=${latitude}`));
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

// ========== 저장 함수 수정 ==========
async function doSave() {
    try {

        clearValidationErrors();
        const validationErrors = validateRequiredFields();
        if (validationErrors.length > 0) {
            console.warn('❌ 유효성 검사 실패:', validationErrors);
            showValidationErrors(validationErrors);
            return;
        }


        const payload = buildPayload();

        const isNewRecord = !payload.id || payload.id.trim() === '';


        const serverData = mapPayloadToServerFormat(payload);
        // 디버그: 전송 데이터 확인
        console.log('🚚 payload', payload);
        console.log('📦 serverData', serverData);

        // 🔥 신규 등록 시 주차장관리번호를 보내지 않아야 서버에서 자동 생성됩니다. (onparking.js 참조)
        if (isNewRecord) {
            delete serverData.prkPlceManageNo;
        }


        const formData = new FormData();
        // 서버 측 필수 값: 소유주체 코드가 없으면 기본 '9'(기타)로 전송
        formData.append('ownCd', payload.ownCd || '9');
        formData.append('prkplceSe', payload.ownCd || '9');
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
            entrancePhoto: ['f_entrance_photo_lib', 'f_entrance_photo_cam'],
            fallPrevPhoto: ['f_fall_photo_lib', 'f_fall_photo_cam']
        };

        for (const [key, ids] of Object.entries(photoInputs)) {
            const libInput = document.getElementById(ids[0]);
            const camInput = document.getElementById(ids[1]);

            if (libInput && libInput.files.length > 0) {
                formData.append(key, libInput.files[0]);
                appendUploadedFiles('#uploadedFileList', libInput.files);
            } else if (camInput && camInput.files.length > 0) {
                formData.append(key, camInput.files[0]);
                appendUploadedFiles('#uploadedFileList', camInput.files);
            }
        }


        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('⏰ 요청 시간 초과');
        }, 30000);


        const response = await fetch(withBase('/prk/buildparking-update'), {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 서버 에러 응답:', {status: response.status, body: errorText});
            try {
                const parsed = JSON.parse(errorText);
                if (parsed && parsed.message) {
                    showValidationErrors([parsed.message]);
                } else if (parsed && parsed.errors) {
                    showValidationErrors(parsed.errors);
                } else {
                    showValidationErrors(['요청이 거부되었습니다. 잠시 후 다시 시도해주세요.']);
                }
            } catch (e) {
                showValidationErrors(['요청이 거부되었습니다. 잠시 후 다시 시도해주세요.']);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }

        const result = await response.json();


        if (result.success) {
            const hiddenInfoSn = document.getElementById('prkPlceInfoSn')?.value || loadedPrkPlceInfoSn;
            const infoSn = result.prkPlceInfoSn || hiddenInfoSn;
            if (infoSn) document.getElementById('prkPlceInfoSn').value = infoSn;
            if (infoSn) await reloadParkingPhotos(infoSn);
            handlePostSave(isNewRecord, '/prk/parkinglist');
        } else {
            alert('❌ 저장 실패: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('💥 저장 프로세스 중 예외 발생:', error);
        if (error.name === 'AbortError') {
            showValidationErrors(['⏰ 서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.']);
        } else {
            showValidationErrors(['저장 중 오류가 발생했습니다. 개발자 콘솔을 확인해주세요.']);
        }
    }
}

function ensureValidationBox() {
    var box = document.getElementById('validationErrors');
    if (!box) {
        box = document.createElement('div');
        box.id = 'validationErrors';
        box.className = 'validation-errors';
        box.style.color = '#c62828';
        box.style.margin = '12px 0';
        box.style.display = 'none';
        var form = document.querySelector('form') || document.body;
        form.insertBefore(box, form.firstChild);
    }
    return box;
}

function clearValidationErrors() {
    var box = document.getElementById('validationErrors');
    if (box) {
        box.style.display = 'none';
        box.innerHTML = '';
    }
}

function showValidationErrors(errors) {
    var box = ensureValidationBox();
    var listHtml = '<ul style=\"padding-left:16px; margin:4px 0;\">' + errors.map(function (msg) {
        return '<li>' + msg + '</li>';
    }).join('') + '</ul>';
    box.innerHTML = '<strong>입력 오류가 있습니다.</strong>' + listHtml;
    box.style.display = 'block';

    var firstInvalid = document.querySelector('[aria-invalid=\"true\"], input:invalid, textarea:invalid, select:invalid');
    if (firstInvalid && typeof firstInvalid.focus === 'function') {
        firstInvalid.focus();
    }
    var top = box.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({top: top, behavior: 'smooth'});
}

function buildPayload() {
    const payload = {
        id: f_id?.value,
        name: f_name?.value,
        status: f_status?.value,
        type: '부설',
        // 서버 요구사항 대응: 관리주체 미입력 시 기본값(기타=9) 사용
        ownCd: getSelectedOwnCd() || '9',
        // 행정구역 코드
        sidoCd: f_sido?.value,
        sigunguCd: f_sigungu?.value,
        emdCd: f_emd?.value,
        // 주소/좌표
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
        },
        // 허가/검사/면적/기계식 정보를 함께 수집
        permitDate: $('#f_permit_date')?.value || null,
        inspectionDate: $('#f_inspection_date')?.value || null,
        siteArea: parseDecimal($('#f_site_area')?.value),
        totalFloorArea: parseDecimal($('#f_total_floor_area')?.value),
        mechPrklotType: document.querySelector('input[name="mechPrklotType"]:checked')?.value,
        mechPrklotOper: document.querySelector('input[name="mechPrklotOper"]:checked')?.value,
        mechPrklotOperDetail: $('#f_mech_prklot_oper_value')?.value || null,
        facilityTotalFloors: num($('#f_total_floors')?.value),
        facilityTotalArea: parseDecimal($('#f_total_scale_area')?.value),
        indoorGroundFloors: num($('#f_indoor_ground_floors')?.value),
        indoorGroundArea: parseDecimal($('#f_indoor_ground_area')?.value),
        indoorGroundSpaces: num($('#f_indoor_ground_spaces')?.value),
        indoorMechanicalFloors: num($('#f_indoor_mechanical_floors')?.value),
        indoorMechanicalArea: parseDecimal($('#f_indoor_mechanical_area')?.value),
        indoorMechanicalSpaces: num($('#f_indoor_mechanical_spaces')?.value),
        outdoorGroundFloors: num($('#f_outdoor_ground_floors')?.value),
        outdoorGroundArea: parseDecimal($('#f_outdoor_ground_area')?.value),
        outdoorGroundSpaces: num($('#f_outdoor_ground_spaces')?.value),
        outdoorMechanicalFloors: num($('#f_outdoor_mechanical_floors')?.value),
        outdoorMechanicalArea: parseDecimal($('#f_outdoor_mechanical_area')?.value),
        outdoorMechanicalSpaces: num($('#f_outdoor_mechanical_spaces')?.value)
    };

    // 🔥 법정동코드 10자리 필수 생성
    payload.ldongCd = generateLdongCd();
    if (!payload.ldongCd || payload.ldongCd.length !== 10) {
        throw new Error('법정동코드(ldong_cd)는 10자리여야 합니다.');
    }
    return payload;
}

function mapPayloadToServerFormat(payload) {
    const weekdayOp = collectOperationTimePayload('weekday');
    const saturdayOp = collectOperationTimePayload('saturday');
    const holidayOp = collectOperationTimePayload('holiday');

    const residentFees = {
        dayAll: parseCurrency($('#f_day_res_all')?.value),
        dayOnly: parseCurrency($('#f_day_res_day')?.value),
        fullTime: parseCurrency($('#f_day_res_full')?.value)
    };

    const generalFees = {
        first30: parseCurrency($('#f_fee_first30')?.value),
        per10: parseCurrency($('#f_day_fee_per10')?.value),
        per60: parseCurrency($('#f_day_fee_per60')?.value),
        daily: parseCurrency($('#f_fee_daily')?.value),
        monthly: parseCurrency($('#f_fee_monthly')?.value),
        halfyear: parseCurrency($('#f_fee_halfyear')?.value)
    };

    const payMethodSelection = collectPayMethods();
    const payMethods = payMethodSelection.codes;
    const payMethodEtcValue = payMethodSelection.etcText || null;
    const normalizedPayMethods = payMethods.map(code => code === '기타' ? PAY_METHOD_ETC_CODE : code);

    const settleMethods = collectSettleMethods();

    const remarkInput = $('#f_partclr_matter')?.value || '';
    const data = {
        prkBizMngNo: loadedBizMngNo,
        prkPlceInfoSn: loadedPrkPlceInfoSn,
        prkPlceManageNo: payload.id,
        prkplceNm: payload.name,
        dtadd: payload.addrJibun || payload.addrRoad,
        prkPlceLat: payload.lat,
        prkPlceLon: payload.lng,
        // 관리주체(소유주체) 기본값 세팅(기타=9)로 서버 요구사항 충족 (prkplceSe/ownCd 모두 전달)
        prkplceSe: payload.ownCd || '9',
        ownCd: payload.ownCd || '9',
        ldongCd: payload.ldongCd,
        sidoCd: payload.sidoCd,
        sigunguCd: payload.sigunguCd,
        emdCd: payload.emdCd,
        // 허가/면적/기계식 정보
        prmisnDt: formatDateForDb(payload.permitDate),
        useInspDt: formatDateForDb(payload.inspectionDate),
        plotAr: payload.siteArea,
        myeonAr: payload.totalFloorArea,
        mechPrklotTpCd: payload.mechPrklotType,
        mechPrklotOperYn: payload.mechPrklotOper,
        mechPrkInopCnt: num(payload.mechPrklotOperDetail),
        prkFcltyTpTotFlrCapa: payload.facilityTotalFloors,
        prkFcltyTpTotDeckCapa: payload.facilityTotalArea,
        indrSelfTotSpaceCnt: payload.indoorGroundSpaces,
        indrSelfFlrCnt: payload.indoorGroundFloors,
        indrSelfDeckCnt: payload.indoorGroundArea,
        indrMechTotSpaceCnt: payload.indoorMechanicalSpaces,
        indrMechFlrCnt: payload.indoorMechanicalFloors,
        indrMechDeckCnt: payload.indoorMechanicalArea,
        outdrSelfTotSpaceCnt: payload.outdoorGroundSpaces,
        outdrSelfFlrCnt: payload.outdoorGroundFloors,
        outdrSelfDeckCnt: payload.outdoorGroundArea,
        outdrMechTotSpaceCnt: payload.outdoorMechanicalSpaces,
        outdrMechFlrCnt: payload.outdoorMechanicalFloors,
        outdrMechDeckCnt: payload.outdoorMechanicalArea,

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

        // 주차장 유형
        prkPlceType: document.querySelector('input[name="parkingType"]:checked')?.value || '3',

        operMbyCd: document.querySelector('input[name="operationEntity"]:checked')?.value,
        mgrOrg: $('#f_management_agency')?.value,
        mgrOrgTelNo: $('#f_management_tel')?.value,
        subordnOpertnCd: $('#f_oddEven')?.value,
        chrgGrdCd: $('#f_grade')?.value, // 🔥 급지구분 추가
        wkdyOperTmCd: weekdayOp.code,
        wkdyTmbasOperStrTm: weekdayOp.start,
        wkdyTmbasOperEndTm: weekdayOp.end,
        satOperTmCd: saturdayOp.code,
        satTmbasOperStrTm: saturdayOp.start,
        satTmbasOperEndTm: saturdayOp.end,
        hldyOperTmCd: holidayOp.code,
        hldyTmbasOperStrTm: holidayOp.start,
        hldyTmbasOperEndTm: holidayOp.end,

        // 요금 지불/정산 방식
        wkFeeMthdCd: normalizedPayMethods.join(','),
        wkFeeStlmtMthdCd: settleMethods.join(','),
        // 야간 필드가 없으므로 동일 값을 복제해 서버 컬럼 채움
        ntFeeMthdCd: normalizedPayMethods.join(','),
        ntFeeStlmtMthdCd: settleMethods.join(','),
        // 부설 테이블 전용 컬럼 매핑
        feePayMthdCd: normalizedPayMethods.join(','),
        feePayMthdOthr: payMethodEtcValue,
        feeSetlMthdCd: settleMethods.join(','),

        // 요금(거주자/일반) - 주간 기준 필드 사용
        wkResDayFee: residentFees.dayAll,
        wkResWkFee: residentFees.dayOnly,
        wkResFtFee: residentFees.fullTime,
        wkGnFrst30mFee: generalFees.first30,
        wkGnInt10mFee: generalFees.per10,
        wkGn1hFee: generalFees.per60,
        wkGnDayFee: generalFees.daily,
        wkFeeMnthPassPrc: generalFees.monthly,
        wkFeeHfyrPassPrc: generalFees.halfyear,
        // 야간 필드가 없으므로 동일 값 복제
        ntResDayFee: residentFees.dayAll,
        ntResWkFee: residentFees.dayOnly,
        ntResFtFee: residentFees.fullTime,
        ntGnFrst30mFee: generalFees.first30,
        ntGnInt10mFee: generalFees.per10,
        ntGn1hFee: generalFees.per60,
        ntGnDayFee: generalFees.daily,
        ntFeeMnthPassPrc: generalFees.monthly,
        ntFeeHfyrPassPrc: generalFees.halfyear,
        feeFrst30minPrc: generalFees.first30,
        fee10minPrc: generalFees.per10,
        fee1hrPrc: generalFees.per60,
        feeDayPrc: generalFees.daily,
        feeMnthPassPrc: generalFees.monthly,
        feeHfyrPassPrc: generalFees.halfyear,

        prklotSignCd: document.querySelector('input[name="parkingSign"]:checked')?.value,
        tcktMchnYn: document.querySelector('input[name="ticketMachine"]:checked')?.value,
        barrGteYn: document.querySelector('input[name="barrier"]:checked')?.value,
        exitAlrmYn: document.querySelector('input[name="alarm"]:checked')?.value,
        vehRcgnTpCd: document.querySelector('input[name="vehicleRecognition"]:checked')?.value,
        guidDocYn: document.querySelector('input[name="announcement"]:checked')?.value || 'N',
        safeInspYn: document.querySelector('input[name="safetyCheck"]:checked')?.value || 'N',
        mgrYn: document.querySelector('input[name="manager"]:checked')?.value || 'N',
        admYn: document.querySelector('input[name="admin"]:checked')?.value || 'N',

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

        partclrMatter: encodeResidentFeeToRemark(remarkInput, residentFees)
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

    const prkType = document.querySelector('input[name="parkingType"]:checked')?.value;
    if (!prkType) {
        errors.push('• 주차장구분을 선택해주세요');
    }

    const ldongCd = generateLdongCd();
    if (!ldongCd) {
        errors.push('• 행정구역(시군구/읍면동)을 선택해주세요');
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

    const prkPlceManageNo = document.getElementById('prkPlceManageNo')?.value || p.id;
    const isNewRecord = !prkPlceManageNo;

    // 이벤트/토글 선적용: 네트워크 실패 시에도 버튼 동작 보장
    setupMechPrklotOperToggle();
    setupOperationEntityToggle();
    setupTimeOperationEvents('weekday');
    setupTimeOperationEvents('saturday');
    setupTimeOperationEvents('holiday');
    setupSignToggle();
    setupFacilityPhotoToggles();
    setupFacilityPhotoUploads();
    setupFallPhotoHandlers();
    setupEntrancePhotoEvents();
    setupPreInspectionEvents();
    setupPedestrianSafetyEvents();
    setupPeakTimeValidation();

    applyPhoneFormat(document.getElementById('f_management_tel'));
    bindMechanicalAutoRule();
    applyManagerAdminAutoRule();

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

    try {
        if (serverStatusValue) {
            applyApprovalLock(serverStatusValue);
        }

        await RegionCodeLoader.loadProgressStatus();
        await RegionCodeLoader.loadSidoList();
        RegionCodeLoader.setupEventListeners();
        await CodeLoader.applyAllDynamicCodes();

        if (isNewRecord) {
            if (f_status) {
                f_status.value = '10'; // '조사중' 코드
            }
        } else {
            await loadParkingDetailFromServer();
            const hiddenInfoSn = document.getElementById('prkPlceInfoSn')?.value || loadedPrkPlceInfoSn;
            if (hiddenInfoSn) {
                const section = document.querySelector('[data-section="photo-info"]');
                if (section) {
                    section.scrollIntoView({behavior: 'smooth'});
                }
            }
        }

        setupApprovalButtons();

    } catch (e) {
        console.error('❌ 페이지 초기화 중 오류', e);
    }

});

/**
 * 🔥 저장 성공 후 페이지 처리 공통 함수
 * @param {boolean} isNew - 신규 여부
 * @param {string} fallbackUrl - 부모 창이 없을 때 이동할 목록 페이지 URL
 */
function handlePostSave(isNew) {
    alert(isNew ? '신규 등록되었습니다.' : '수정되었습니다.');

    if (typeof clearUploadProgressUI === 'function') {
        clearUploadProgressUI(); // 진행률만 정리, 완료 리스트는 유지
    }

    try {
        if (window.parent && typeof window.parent.closeNewParkingTabAndGoList === 'function') {
            window.parent.closeNewParkingTabAndGoList('buildparking');
            return;
        }
        if (window.parent && typeof window.parent.reloadList === 'function') {
            window.parent.reloadList();
            return;
        }
        if (window.opener && !window.opener.closed) {
            if (typeof window.opener.closeNewParkingTabAndGoList === 'function') {
                window.opener.closeNewParkingTabAndGoList('buildparking');
            } else if (typeof window.opener.reloadList === 'function') {
                window.opener.reloadList();
            } else {
                window.opener.location.reload();
            }
            window.opener.focus();
            window.close();

        }
    } catch (e) {
        console.warn('부모 창 제어 중 오류:', e);
    }
}

// ========== 🔥 파일 목록 렌더/재조회 ==========
let hoverPreviewDiv = null;

function ensureHoverPreview() {
    if (hoverPreviewDiv) return hoverPreviewDiv;
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.zIndex = '9999';
    div.style.pointerEvents = 'none';
    div.style.padding = '6px';
    div.style.background = '#fff';
    div.style.border = '1px solid #d1d5db';
    div.style.borderRadius = '4px';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    div.style.display = 'none';
    div.innerHTML = '<div style="font-size:12px;color:#374151;margin-top:4px;"></div>';
    document.body.appendChild(div);
    hoverPreviewDiv = div;
    return div;
}

function showHoverPreview(e, url, name) {
    const div = ensureHoverPreview();
    div.style.display = 'block';
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '240px';
    img.style.maxHeight = '180px';
    img.style.display = 'block';
    img.style.objectFit = 'contain';
    div.innerHTML = '';
    div.appendChild(img);
    const caption = document.createElement('div');
    caption.textContent = name || '';
    caption.style.fontSize = '12px';
    caption.style.color = '#374151';
    caption.style.marginTop = '4px';
    div.appendChild(caption);
    positionHoverPreview(e);
}

function hideHoverPreview() {
    if (hoverPreviewDiv) hoverPreviewDiv.style.display = 'none';
}

function positionHoverPreview(e) {
    if (!hoverPreviewDiv) return;
    const offset = 12;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;
    let left = e.clientX + offset;
    let top = e.clientY + offset;
    const rect = hoverPreviewDiv.getBoundingClientRect();
    if (left + rect.width > maxW) left = e.clientX - rect.width - offset;
    if (top + rect.height > maxH) top = e.clientY - rect.height - offset;
    hoverPreviewDiv.style.left = `${left}px`;
    hoverPreviewDiv.style.top = `${top}px`;
}

function renderUploadedList(photos) {
    const list = document.querySelector('#uploadedFileList');
    if (!list) return;
    list.innerHTML = '';
    (photos || []).forEach(p => {
        const li = document.createElement('li');
        li.className = 'uploaded-file';
        const infoSn = p.prkPlceInfoSn || p.prk_plce_info_sn || p.prkplceinfosn || document.querySelector('#prkPlceInfoSn')?.value;
        const imgId = p.prkImgId || p.prk_img_id || p.prkimgid;
        const seq = p.seqNo || p.seq_no || p.seqno;
        li.dataset.seqNo = seq ?? '';
        const name = p.realFileNm || p.real_file_nm || p.realfilenm || p.fileNm || p.file_nm || p.filenm || p.filename || p.fileName || '파일';
        li.textContent = name;
        if (infoSn && imgId && seq != null && typeof ImagePreview?.showWithDelay === 'function') {
            li.addEventListener('mouseenter', (e) => {
                ImagePreview.showWithDelay(infoSn, imgId, seq, name, e, 300);
            });
            li.addEventListener('mouseleave', () => ImagePreview.hide && ImagePreview.hide());
        } else if (!infoSn || !imgId || seq == null) {
            console.warn('⚠️ 미리보기 데이터 누락:', {infoSn, imgId, seq});
        }
        list.appendChild(li);
    });
}

// 보조: 전역에 확실히 노출
window.renderUploadedList = renderUploadedList;

function normalizeImgId(p) {
    const direct = (p.prkImgId || p.prk_img_id || p.prkimgid || '').toString().trim();
    if (direct) return direct.toUpperCase();
    const path = (p.filePath || p.file_path || '').toString();
    const match = path.match(/BLD_[A-Z_]+/i);
    if (match && match[0]) return match[0].toUpperCase();
    return '';
}

function applyPhotoPreviews(infoSn, photos) {
    const previewMap = {
        BLD_MAIN: 'preview',
        BLD_SIGN: 'sign_preview',
        BLD_TICKET: 'ticket_preview',
        BLD_BARRIER: 'barrier_preview',
        BLD_EXIT_ALARM: 'exit_alarm_preview',
        BLD_ENTRANCE: 'entrance_preview',
        BLD_FALL_PREV: 'fall_preview'
    };

    // 초기화
    Object.values(previewMap).forEach(id => {
        const img = document.getElementById(id);
        if (img) {
            img.removeAttribute('src');
            img.style.display = 'none';
        }
    });

    const firstByType = {};
    (photos || []).forEach(p => {
        const imgId = normalizeImgId(p);
        if (!imgId) return;
        if (!firstByType[imgId]) firstByType[imgId] = p;
    });

    Object.entries(firstByType).forEach(([imgId, photo]) => {
        const targetId = previewMap[imgId];
        if (!targetId) return;
        const img = document.getElementById(targetId);
        const seq = photo.seqNo || photo.seq_no || photo.seqno;
        if (img && infoSn && seq != null) {
            img.src = withBase(`/prk/photo?prkPlceInfoSn=${infoSn}&prkImgId=${imgId}&seqNo=${seq}`);
            img.style.display = 'block';
            img.title = photo.realFileNm || photo.real_file_nm || photo.fileNm || photo.file_nm || imgId;
        }
    });
}

async function reloadParkingPhotos(infoSn) {
    if (!infoSn) return;
    try {
        const resp = await fetch(withBase(`/prk/parking-photos?prkPlceInfoSn=${infoSn}`));
        const json = await resp.json();
        const photos = json.photos || [];
        const mainPhotos = photos.filter(p => normalizeImgId(p) === 'BLD_MAIN');
        renderUploadedList(mainPhotos);
        applyPhotoPreviews(infoSn, photos);
    } catch (e) {
        console.warn('⚠️ 파일 목록 재조회 실패:', e);
    }
}

// 승인/결재 버튼 세팅 (미구현 시 안전한 더미)
function setupApprovalButtons() {
    // 필요한 경우 실제 구현을 연결
}
