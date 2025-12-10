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

// 업로드 리스트 유틸이 없을 때 안전 가드 (onparking.js 동일 패턴)
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

//추가: 민간위탁/민간직영 유형을 코드/명으로 판별
function resolvePrivateOwnType(codeCd, codeNm) {
    const cd = (codeCd || '').trim();
    const nm = (codeNm || '').trim();
    if (!cd && !nm) return null;
    if (cd === '04' || nm.includes('민간위탁')) return 'trust';
    if (cd === '05' || nm.includes('민간직영') || nm.includes('민간지역')) return 'direct';
    return null;
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

// NOTE: 첨두시간(시 단위 입력)을 HH00 포맷으로 변환해 DB 필드에 맞춘다.
//       시간은 0~23시까지만 인정(2400과 같은 값 방지).
function formatPeakTime(hour) {
    if (hour === undefined || hour === null) return null;
    const str = hour.toString().trim();
    if (!str) return null;
    const parsed = parseInt(str, 10);
    if (Number.isNaN(parsed)) return null;
    const safeHour = Math.min(Math.max(parsed, 0), 23);
    return String(safeHour).padStart(2, '0') + '00';
}

// NOTE: DB에서 내려온 첨두시간(HH00 또는 숫자)을 시간(HH) 정수로 변환
function extractPeakHour(value) {
    if (value === undefined || value === null) return null;
    const str = value.toString().padStart(4, '0');
    const hourStr = str.substring(0, 2);
    const parsed = parseInt(hourStr, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

// NOTE: 주차장구분(01/02/03) 코드 포맷을 일관되게 맞춘다.
function normalizeParkingTypeCode(value) {
    if (value === undefined || value === null) return '';
    const str = value.toString().trim();
    if (!str) return '';
    if (/^\d+$/.test(str)) {
        return str.padStart(2, '0');
    }
    return str;
}

// 🔥 input 요소에 실시간 통화 포맷팅 적용
function applyCurrencyFormat(input) {
    if (!input) return;

    input.addEventListener('input', function (e) {
        const cursorPosition = this.selectionStart;
        const oldLength = this.value.length;

        // 숫자만 추출
        const numericValue = this.value.replace(/[^0-9]/g, '');

        // 포맷 적용
        const formatted = numericValue ? parseInt(numericValue, 10).toLocaleString('ko-KR') : '';
        this.value = formatted;

        // 커서 위치 조정
        const newLength = formatted.length;
        const diff = newLength - oldLength;
        this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    });

    // blur 시에도 포맷 적용
    input.addEventListener('blur', function () {
        if (this.value) {
            const numericValue = this.value.replace(/[^0-9]/g, '');
            this.value = numericValue ? parseInt(numericValue, 10).toLocaleString('ko-KR') : '';
        }
    });
}

// 🔥 전화번호 포맷팅 (onparking.js와 동일한 방식)
function formatPhoneNumber(value) {
    if (!value) return '';
    const digits = value.replace(/[^0-9]/g, '');

    if (digits.length <= 2) return digits;

    // 서울(02) 지역번호
    if (digits.startsWith('02')) {
        if (digits.length <= 5) {          // 02-123
            return digits.replace(/^(\d{2})(\d+)/, '$1-$2');
        } else if (digits.length <= 9) {   // 02-123-4567
            return digits.replace(/^(\d{2})(\d{3})(\d+)/, '$1-$2-$3');
        } else {                           // 02-1234-5678
            return digits.replace(/^(\d{2})(\d{4})(\d+)/, '$1-$2-$3');
        }
    }

    // 그 외 3자리 앞번호 (010, 031, 070 등)
    if (digits.length <= 7) {              // 010-1234
        return digits.replace(/^(\d{3})(\d+)/, '$1-$2');
    } else if (digits.length <= 10) {      // 031-123-4567
        return digits.replace(/^(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    } else {                               // 010-1234-5678
        return digits.replace(/^(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
    }
}

// 🔥 전화번호 인풋에 실시간 포맷팅 적용
function applyPhoneFormat(input) {
    if (!input) return;

    input.addEventListener('input', function () {
        const before = this.value;
        const cursorPos = this.selectionStart ?? before.length;

        const digits = before.replace(/[^0-9]/g, '');
        const formatted = formatPhoneNumber(digits);
        this.value = formatted;

        const diff = formatted.length - before.length;
        const newPos = cursorPos + diff;
        this.selectionStart = this.selectionEnd = Math.max(0, newPos);
    });

    input.addEventListener('blur', function () {
        this.value = formatPhoneNumber(this.value);
    });
}

// ========== 🔥 행정구역 코드 로더 추가 ==========
const RegionCodeLoader = {
    // 진행상태 로드
    async loadProgressStatus() {
        try {
            const response = await fetch(withBase('/cmm/codes/status'));
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
                input.dataset.codeName = code.codeNm || '';
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
            console.log('PRK_002 운영주체 codes:', groups['PRK_002'].codes);
            this.populateRadioGroup('#own_group', 'own', groups['PRK_002'].codes);
            setTimeout(() => {
                const ownRadios = $$('input[name="own"]');
                const ownWrap = $('#own_company_wrap');
                //추가: 민간위탁/민간직영 전용 필드 캐시
                const trustWrap = $('#own_trust_company');
                const directWrap = $('#own_direct_company');
                const syncCompanyInput = () => {
                    const checked = ownRadios.find(r => r.checked);
                    const codeCd = (checked?.value || '').trim();
                    const codeNm = checked?.dataset.codeName || '';
                    const privateType = resolvePrivateOwnType(codeCd, codeNm);
                    if (!ownWrap) return;
                    if (!privateType) {
                        ownWrap.hidden = true;
                        if (trustWrap) trustWrap.hidden = true;
                        if (directWrap) directWrap.hidden = true;
                        return;
                    }
                    ownWrap.hidden = false;
                    if (trustWrap) trustWrap.hidden = privateType !== 'trust';
                    if (directWrap) directWrap.hidden = privateType !== 'direct';
                };
                ownRadios.forEach(r => {
                    r.addEventListener('change', syncCompanyInput);
                });
                syncCompanyInput();
            }, 100);
        }

        // PRK_004: 운영시간코드
        if (groups['PRK_004']) {
            window.OPERATION_TIME_CODES = groups['PRK_004'].codes;

            this.populateOperationTimeRadios('day', 'weekday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('day', 'saturday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('day', 'holiday', groups['PRK_004'].codes);

            this.populateOperationTimeRadios('night', 'weekday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('night', 'saturday', groups['PRK_004'].codes);
            this.populateOperationTimeRadios('night', 'holiday', groups['PRK_004'].codes);
        }

        // PRK_006: 요금지불방식
        if (groups['PRK_006']) {
            const codesWithoutEtc = groups['PRK_006'].codes.filter(code =>
                !code.codeNm.includes('기타') && !code.codeCd.includes('기타')
            );

            const dayPayGroup = $('#day_pay_group');
            if (dayPayGroup) {
                this.populateCheckboxGroup('#day_pay_group', 'dayPayMethod', codesWithoutEtc);
                this.addEtcCheckbox(dayPayGroup, 'day_pay_etc_chk', 'day_pay_etc_input', 'dayPayMethod');
            }

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

        // PRK_009: 주차장구분
        if (groups['PRK_009']) {
            this.populateRadioGroup('#parking_type_group', 'parkingType', groups['PRK_009'].codes);
        }

        // PRK_008: 차량인식종류
        if (groups['PRK_008']) {
            this.populateRadioGroup('#vehicle_recognition_group', 'vehicleRecognition', groups['PRK_008'].codes);
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
if (f_type) f_type.value = '노외';
if (f_sido) f_sido.value = p.sido || '';
if (f_sigungu) f_sigungu.value = p.sigungu || '';
if (f_emd) f_emd.value = p.emd || '';
if (f_addrJ) f_addrJ.value = p.jibun || p.addr || '';
if (f_addrR) f_addrR.value = p.road || '';
if (v_id) v_id.textContent = f_id?.value || '';
if (v_name) v_name.textContent = f_name?.value || '노외주차장 상세';
updateHeaderAddr();

// ========== 🔥 주소찾기 레이어 추가 ==========
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

// ========== 🔥 공통 유효성 검증 모듈 ==========
const FormValidator = {
    // 에러가 발생한 첫 번째 요소를 저장 (스크롤 이동용)
    firstErrorElement: null,

    /**
     * 초기화: 이전 에러 스타일 모두 제거
     */
    reset() {
        this.firstErrorElement = null;
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error', 'shake-element');
        });
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
    }
};

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

// ========== 사진 업로드/좌표 ==========
const inLib = $('#f_photo_lib'), inCam = $('#f_photo_cam');
$('#btnPickFromLibrary')?.addEventListener('click', () => {
    const input = document.getElementById('f_photo_lib');
    console.log('btnPickFromLibrary click', {input, disabled: input?.disabled});
    if (input) input.click();
});
$('#btnTakePhoto')?.addEventListener('click', () => {
    const input = document.getElementById('f_photo_cam');
    console.log('btnTakePhoto click', {input, disabled: input?.disabled});
    if (input) input.click();
});
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

// ========== 🔥 시간대별 섹션 표시/숨김 함수 ==========
function toggleTimeSections() {
    const chkDay = $('#chk_day');
    const chkNight = $('#chk_night');

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

    const isDayChecked = chkDay && chkDay.checked;
    const isNightChecked = chkNight && chkNight.checked;

    daySections.forEach(selector => {
        const element = $(selector);
        if (element) element.style.display = isDayChecked ? 'block' : 'none';
    });

    nightSections.forEach(selector => {
        const element = $(selector);
        if (element) element.style.display = isNightChecked ? 'block' : 'none';
    });

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

    [dayResWrap, dayNormalWrap, nightResWrap, nightNormalWrap].forEach(el => {
        if (el) el.hidden = true;
    });

    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;

    const isBoth = (v === '03');
    const isResident = (v === '02');
    const isNormalStreet = (v === '01');

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

// ========== 시간제운영 처리 함수 ==========
function setupTimeOperationEvents(timeType) {
    const weekdayGroup = $(`#${timeType}_weekday_operation_group`);
    const weekdayTimeInputs = $(`#${timeType}_weekday_time_inputs`);

    if (weekdayGroup && weekdayTimeInputs) {
        weekdayGroup.addEventListener('change', function (e) {
            if (e.target.name === `${timeType}WeekdayOperation`) {
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
    const weekdayCode = weekdayRadio?.value || '01';
    const weekdayName = weekdayRadio?.dataset.codeName || '전일운영';

    result.weekday = {
        type: weekdayName,
        code: weekdayCode,
        time: null
    };

    if (weekdayCode === '02') {
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

function formatTime(hour, minute) {
    const h = String(hour || 0).padStart(2, '0');
    const m = String(minute || 0).padStart(2, '0');
    return h + m;
}

// ========== 🔥 법정동코드 생성 함수 (공통 유틸 사용) ==========
function generateLdongCd() {
    const f_sigungu = document.getElementById('f_sigungu');
    const f_emd = document.getElementById('f_emd');
    const f_ri = document.getElementById('f_ri');

    const sigunguCd = f_sigungu?.value;
    const emdCd = f_emd?.value;
    const liCd = f_ri?.value;

    const ldongCd = LdongUtil.generateLdongCd(sigunguCd, emdCd, liCd);
    if (!ldongCd) {
        console.error('❌ 법정동코드 생성 실패:', sigunguCd, emdCd, liCd);
    } else {
    }
    return ldongCd;
}

// ========== 주차관리 시설 정보 이벤트 ==========
function setupFacilityPhotoEvents() {
    /**
     * 공통 설정용 헬퍼
     * @param {{type:string, libId:string, camId:string, previewId:string,
     *          btnLibId:string, btnCamId:string, btnClearId:string}} cfg
     */
    function setupFacility(cfg) {
        const libInput = document.getElementById(cfg.libId);
        const camInput = document.getElementById(cfg.camId);
        const preview = document.getElementById(cfg.previewId);

        const btnLib = document.getElementById(cfg.btnLibId);
        const btnCam = document.getElementById(cfg.btnCamId);
        const btnClear = document.getElementById(cfg.btnClearId);

        // 사진첩에서 선택 버튼
        if (btnLib && libInput) {
            btnLib.addEventListener('click', () => libInput.click());
        }

        // 카메라 촬영 버튼
        if (btnCam && camInput) {
            btnCam.addEventListener('click', () => camInput.click());
        }

        // 파일 선택(사진첩)
        if (libInput) {
            libInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    handleFacilityPhoto(files, cfg.type);
                }
            });
        }

        // 파일 선택(카메라)
        if (camInput) {
            camInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    handleFacilityPhoto(files, cfg.type);
                }
            });
        }

        // 초기화 버튼
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (libInput) libInput.value = '';
                if (camInput) camInput.value = '';
                if (preview) {
                    preview.src = '';
                    preview.style.display = 'none';
                }
            });
        }
    }

    // 표지판 / 발권기 / 차단기 / 출차알람 각 시설별 설정
    const facilities = [
        {
            type: 'sign',
            libId: 'f_sign_photo_lib',
            camId: 'f_sign_photo_cam',
            previewId: 'sign_preview',
            btnLibId: 'btnSignPhotoLibrary',
            btnCamId: 'btnSignPhotoCamera',
            btnClearId: 'btnClearSignPhoto'
        },
        {
            type: 'ticket',
            libId: 'f_ticket_photo_lib',
            camId: 'f_ticket_photo_cam',
            previewId: 'ticket_preview',
            btnLibId: 'btnTicketPhotoLibrary',
            btnCamId: 'btnTicketPhotoCamera',
            btnClearId: 'btnClearTicketPhoto'
        },
        {
            type: 'barrier',
            libId: 'f_barrier_photo_lib',
            camId: 'f_barrier_photo_cam',
            previewId: 'barrier_preview',
            btnLibId: 'btnBarrierPhotoLibrary',
            btnCamId: 'btnBarrierPhotoCamera',
            btnClearId: 'btnClearBarrierPhoto'
        },
        {
            type: 'exit_alarm',
            libId: 'f_exit_alarm_photo_lib',
            camId: 'f_exit_alarm_photo_cam',
            previewId: 'exit_alarm_preview',
            btnLibId: 'btnExitAlarmPhotoLibrary',
            btnCamId: 'btnExitAlarmPhotoCamera',
            btnClearId: 'btnClearExitAlarmPhoto'
        },
        {
            type: 'fall_prevention',
            libId: 'f_fall_photo_lib',
            camId: 'f_fall_photo_cam',
            previewId: 'fall_preview',
            btnLibId: 'btnFallPhotoLibrary',
            btnCamId: 'btnFallPhotoCamera',
            btnClearId: 'btnClearFallPhoto'
        },
        {
            type: 'parking_guide',
            libId: 'f_parking_guide_photo_lib',
            camId: 'f_parking_guide_photo_cam',
            previewId: 'parking_guide_preview',
            btnLibId: 'btnParkingGuidePhotoLibrary',
            btnCamId: 'btnParkingGuidePhotoCamera',
            btnClearId: 'btnClearParkingGuidePhoto'
        }
    ];

    facilities.forEach(setupFacility);

}

async function handleFacilityPhoto(files, type) {
    const file = files && files[0];
    if (!file) return;

    const previewMap = {
        'sign': $('#sign_preview'),
        'ticket': $('#ticket_preview'),
        'barrier': $('#barrier_preview'),
        'exit_alarm': $('#exit_alarm_preview'),
        'fall_prevention': $('#fall_preview'),
        'parking_guide': $('#parking_guide_preview')
    };

    const preview = previewMap[type];
    if (preview) {
        try {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
        } catch (e) {
            console.error('사진 미리보기 오류:', e);
        }
    }
}

async function handleFacilityPhoto(files, type) {
    const file = files && files[0];
    if (!file) return;

    const previewMap = {
        'sign': $('#sign_preview'),
        'ticket': $('#ticket_preview'),
        'barrier': $('#barrier_preview'),
        'exit_alarm': $('#exit_alarm_preview'),
        'fall_prevention': $('#fall_preview'),
        'parking_guide': $('#parking_guide_preview')
    };

    const preview = previewMap[type];
    if (preview) {
        try {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
        } catch (e) {
            console.error('사진 미리보기 오류:', e);
        }
    }
}

// ========== 주차 첨두 시간대 검증 ==========
function setupPeakTimeValidation() {
    const dayStart = $('#f_peak_day_start');
    const dayEnd = $('#f_peak_day_end');
    const nightStart = $('#f_peak_night_start');
    const nightEnd = $('#f_peak_night_end');

    // 주간 첨두 시간대 검증 (7~20시)
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
            // 시작 시간보다 종료 시간이 작으면 경고
            if (dayStart && dayStart.value && val < parseInt(dayStart.value)) {
                alert('종료 시간은 시작 시간보다 커야 합니다.');
                this.value = '';
            }
        });
    }

    // 야간 첨두 시간대 검증 (20~익일07시)
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

// ========== 주차장 입구 사진 이벤트 ==========
function setupEntrancePhotoEvents() {
    const entrancePhotoLib = $('#f_entrance_photo_lib');
    const entrancePhotoCam = $('#f_entrance_photo_cam');
    const entrancePreview = $('#entrance_preview');
    const entranceLat = $('#f_entrance_lat');
    const entranceLng = $('#f_entrance_lng');

    // 사진첩에서 선택 버튼
    $('#btnEntrancePhotoLibrary')?.addEventListener('click', () => {
        entrancePhotoLib?.click();
    });

    // 카메라 촬영 버튼
    $('#btnEntrancePhotoCamera')?.addEventListener('click', () => {
        entrancePhotoCam?.click();
    });

    // 초기화 버튼
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

    // 사진첩 파일 선택 시
    entrancePhotoLib?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 미리보기
        try {
            if (entrancePreview) {
                entrancePreview.src = URL.createObjectURL(file);
                entrancePreview.style.display = 'block';
            }
        } catch (err) {
            console.error('사진 미리보기 오류:', err);
        }

        // EXIF에서 GPS 좌표 추출
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

    // 카메라 촬영 시
    entrancePhotoCam?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 미리보기
        try {
            if (entrancePreview) {
                entrancePreview.src = URL.createObjectURL(file);
                entrancePreview.style.display = 'block';
            }
        } catch (err) {
            console.error('사진 미리보기 오류:', err);
        }

        // 기기 위치 사용
        const coords = await geoFromDeviceSilent();
        if (coords && entranceLat && entranceLng) {
            entranceLat.value = coords.lat.toFixed(6);
            entranceLng.value = coords.lng.toFixed(6);
        }
    });

}

// ========== 사전점검 이벤트 ==========
function setupPreInspectionEvents() {
    // 1) 2층 이상 건축물 선택 시 추락방지시설 표시
    const buildingFloorRadios = $$('input[name="buildingFloor"]');
    const fallPreventionWrap = $('#fall_prevention_wrap');

    buildingFloorRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (fallPreventionWrap) {
                fallPreventionWrap.style.display = (this.value === '2층이상') ? 'block' : 'none';
            }
        });
    });

    // 🔥 2) 경사 여부 선택 시 경사도 입력창 표시/숨김
    const slopeRadios = $$('input[name="slope"]');
    const slopeOver7Wrap = $('#slope_over_7_wrap');

    slopeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (slopeOver7Wrap) {
                const shouldShow = (this.value === 'Y' && this.checked);
                slopeOver7Wrap.style.display = shouldShow ? 'block' : 'none';
            }
        });
    });

    // 3) 차단기 '있음' 선택 시 차량인식종류 표시
    const barrierRadios = $$('input[name="barrier"]');
    const vehicleRecognitionWrap = $('#vehicle_recognition_wrap');

    barrierRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (vehicleRecognitionWrap) {
                vehicleRecognitionWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });

    // 4) 표지판, 발권기, 차단기, 출차알람 사진 업로드 영역 토글
    const signRadios = $$('input[name="parkingSign"]');
    const signPhotoWrap = $('#sign_photo_wrap');
    signRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (signPhotoWrap) {
                signPhotoWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });
    if (signPhotoWrap) {
        const checked = signRadios.find(r => r.checked && r.value === 'Y');
        signPhotoWrap.style.display = checked ? 'block' : 'none';
    }

    // 추락방지시설 사진 토글
    const fallRadios = $$('input[name="fallPrevention"]');
    const fallPhotoWrap = $('#fall_photo_wrap');
    fallRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (fallPhotoWrap) {
                fallPhotoWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });
    if (fallPhotoWrap) {
        const checkedFall = fallRadios.find(r => r.checked && r.value === 'Y');
        fallPhotoWrap.style.display = checkedFall ? 'block' : 'none';
    }

    const ticketRadios = $$('input[name="ticketMachine"]');
    const ticketPhotoWrap = $('#ticket_photo_wrap');
    ticketRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (ticketPhotoWrap) {
                ticketPhotoWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });
    if (ticketPhotoWrap) {
        const checked = ticketRadios.find(r => r.checked && r.value === 'Y');
        ticketPhotoWrap.style.display = checked ? 'block' : 'none';
    }

    const barrierPhotoWrap = $('#barrier_photo_wrap');
    barrierRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (barrierPhotoWrap) {
                barrierPhotoWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });
    if (barrierPhotoWrap) {
        const checkedBarrier = barrierRadios.find(r => r.checked && r.value === 'Y');
        barrierPhotoWrap.style.display = checkedBarrier ? 'block' : 'none';
    }

    const exitAlarmRadios = $$('input[name="exitAlarm"]');
    const exitAlarmPhotoWrap = $('#exit_alarm_photo_wrap');
    exitAlarmRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (exitAlarmPhotoWrap) {
                exitAlarmPhotoWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });
    if (exitAlarmPhotoWrap) {
        const checkedExit = exitAlarmRadios.find(r => r.checked && r.value === 'Y');
        exitAlarmPhotoWrap.style.display = checkedExit ? 'block' : 'none';
    }

    // 주차방향시설 사진 토글
    const parkingGuideRadios = $$('input[name="parkingGuide"]');
    const parkingGuidePhotoWrap = $('#parking_guide_photo_wrap');
    parkingGuideRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (parkingGuidePhotoWrap) {
                parkingGuidePhotoWrap.style.display = (this.value === 'Y' && this.checked) ? 'block' : 'none';
            }
        });
    });
    if (parkingGuidePhotoWrap) {
        const checkedGuide = parkingGuideRadios.find(r => r.checked && r.value === 'Y');
        parkingGuidePhotoWrap.style.display = checkedGuide ? 'block' : 'none';
    }

}

// ========== 보행안전시설 활성화 ==========
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

    // 세부 면수 입력 시에도 체크
    [normalInput, disInput, smallInput, greenInput, pregInput].forEach(input => {
        input?.addEventListener('input', checkTotalStalls);
    });

    checkTotalStalls();
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

// 진행상태 select에 코드/명칭을 방어적으로 매핑
function applyStatusSelect(selectEl, statusValue) {
    if (!selectEl) return;
    const val = (statusValue || '').trim();
    if (!val) return;
    selectEl.value = val;
    if (selectEl.value === val) return;
    const options = Array.from(selectEl.options || []);
    const match = options.find(opt => opt.textContent.trim() === val);
    if (match) selectEl.value = match.value;
}

// ========== 🔥 페이지 로드 시 서버에서 데이터 가져오기 ==========
async function loadParkingDetailFromServer() {
    const prkPlceManageNo = document.getElementById('prkPlceManageNo')?.value || p.id;

    if (!prkPlceManageNo && !window.initialParking) {
        console.warn('⚠️ 주차장 관리번호가 없습니다. 신규 등록 모드입니다.');
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

// ========== 🔥 서버 데이터로 폼 채우기 ==========
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
    applyStatusSelect($('#f_status'), data.prgsStsCd || data.prgsStsNm || '');
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
    if (f_addrR) f_addrR.value = data.dtadd || '';
    const f_mainNum = $('#f_mainNum');
    if (f_mainNum) f_mainNum.value = data.lnmMnno || '';
    const f_subNum = $('#f_subNum');
    if (f_subNum) f_subNum.value = data.lnmSbno || '';
    if (f_lat) f_lat.value = data.prkPlceLat || '';
    if (f_lng) f_lng.value = data.prkPlceLon || '';
    // 🔥 우편번호 바인딩
    const f_zip = document.getElementById('f_zip');
    if (f_zip && data.zip) {
        f_zip.value = data.zip;
    }

    // 헤더 정보 업데이트
    if (v_id) v_id.textContent = data.prkPlceManageNo || '';
    if (v_name) v_name.textContent = data.prkplceNm || '노외주차장 상세';
    updateHeaderAddr();

    // 주차면수 정보
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

    // 운영 정보
    // NOTE: prkplceSe 코드로 주차장구분 라디오를 재설정
    const initialParkingType = normalizeParkingTypeCode(data.prkplceSe || data.parkingType);
    if (initialParkingType) {
        const parkingTypeRadio = document.querySelector(`input[name="parkingType"][value="${initialParkingType}"]`);
        if (parkingTypeRadio) {
            parkingTypeRadio.checked = true;
            parkingTypeRadio.dispatchEvent(new Event('change'));
        } else if (data.prkplceSe) {
            // NOTE: 혹시 값이 '2'처럼 들어온 경우 대비
            const fallbackRadio = document.querySelector(`input[name="parkingType"][value="${data.prkplceSe}"]`);
            if (fallbackRadio) {
                fallbackRadio.checked = true;
                fallbackRadio.dispatchEvent(new Event('change'));
            }
        }
    }
    //추가: 유형별 업체명 입력값 바인딩
    const trustCompanyInput = $('#f_own_trust_company');
    const directCompanyInput = $('#f_own_direct_company');
    const fallbackCompany = data.compNm || '';
    if (trustCompanyInput) {
        trustCompanyInput.value = data.trutCompNm || (data.operMbyCd === '04' ? fallbackCompany : '');
    }
    if (directCompanyInput) {
        directCompanyInput.value = data.dirtCompNm || (data.operMbyCd === '05' ? fallbackCompany : '');
    }
    if (data.operMbyCd) {
        const ownRadio = document.querySelector(`input[name="own"][value="${data.operMbyCd}"]`);
        if (ownRadio) {
            ownRadio.checked = true;
            ownRadio.dispatchEvent(new Event('change'));
        }
    }

    if ($('#f_mgr_name')) $('#f_mgr_name').value = data.mgrOrg || '';
    if ($('#f_mgr_tel')) {
        const telInput = $('#f_mgr_tel');
        // 숫자만 넘어온 경우에도 하이픈 포함 포맷으로 표시
        telInput.value = formatPhoneNumber(data.mgrOrgTelNo || '');
    }
    if ($('#f_oddEven')) $('#f_oddEven').value = data.subordnOpertnCd || '';

    // 시간대 체크박스
    const chkDay = $('#chk_day');
    const chkNight = $('#chk_night');

    if (data.dyntDvCd) {
        if (data.dyntDvCd === '01' || data.dyntDvCd === '03') {
            if (chkDay) {
                chkDay.checked = true;
                chkDay.dispatchEvent(new Event('change'));
            }
        }
        if (data.dyntDvCd === '02' || data.dyntDvCd === '03') {
            if (chkNight) {
                chkNight.checked = true;
                chkNight.dispatchEvent(new Event('change'));
            }
        }
    }

    // 운영방식
    if (data.prkOperMthdCd) {
        const opRadio = document.querySelector(`input[name="opType"][value="${data.prkOperMthdCd}"]`);
        if (opRadio) {
            opRadio.checked = true;
            opRadio.dispatchEvent(new Event('change'));
        }
    }

    // 급지 정보
    if ($('#f_day_grade')) $('#f_day_grade').value = data.wkZon || '';
    if ($('#f_night_grade')) $('#f_night_grade').value = data.ntZon || '';

    // 요금 정보
    if ($('#f_day_feeType')) $('#f_day_feeType').value = data.wkFeeAplyCd || '';
    if ($('#f_night_feeType')) $('#f_night_feeType').value = data.ntFeeAplyCd || '';

    // 🔥 주간 요금 정보 (거주자) - 통화 포맷팅 적용
    if ($('#f_day_res_all')) $('#f_day_res_all').value = formatCurrency(data.wkResDayFee);
    if ($('#f_day_res_day')) $('#f_day_res_day').value = formatCurrency(data.wkResFtFee);
    if ($('#f_day_res_full')) $('#f_day_res_full').value = formatCurrency(data.wkResWkFee);

    // 🔥 주간 요금 정보 (일반) - 통화 포맷팅 적용
    if ($('#f_day_fee_first30')) $('#f_day_fee_first30').value = formatCurrency(data.wkGnFrst30mFee);
    if ($('#f_day_fee_per10')) $('#f_day_fee_per10').value = formatCurrency(data.wkGnInt10mFee);
    if ($('#f_day_fee_per60')) $('#f_day_fee_per60').value = formatCurrency(data.wkGn1hFee);
    if ($('#f_day_fee_daily')) $('#f_day_fee_daily').value = formatCurrency(data.wkGnDayFee);
    if ($('#f_day_fee_monthly')) $('#f_day_fee_monthly').value = formatCurrency(data.wkFeeMnthPassPrc);
    if ($('#f_day_fee_halfyear')) $('#f_day_fee_halfyear').value = formatCurrency(data.wkFeeHfyrPassPrc);

    // 🔥 야간 요금 정보 (거주자) - 통화 포맷팅 적용
    if ($('#f_night_res_all')) $('#f_night_res_all').value = formatCurrency(data.ntResDayFee);
    if ($('#f_night_res_full')) $('#f_night_res_full').value = formatCurrency(data.ntResWkFee);
    if ($('#f_night_res_night')) $('#f_night_res_night').value = formatCurrency(data.ntResNtFee);

    // 🔥 야간 요금 정보 (일반) - 통화 포맷팅 적용
    if ($('#f_night_fee_first30')) $('#f_night_fee_first30').value = formatCurrency(data.ntGnFrst30mFee);
    if ($('#f_night_fee_per10')) $('#f_night_fee_per10').value = formatCurrency(data.ntGnInt10mFee);
    if ($('#f_night_fee_per60')) $('#f_night_fee_per60').value = formatCurrency(data.ntGn1hFee);
    if ($('#f_night_fee_daily')) $('#f_night_fee_daily').value = formatCurrency(data.ntGnDayFee);
    if ($('#f_night_fee_monthly')) $('#f_night_fee_monthly').value = formatCurrency(data.ntFeeMnthPassPrc);
    if ($('#f_night_fee_halfyear')) $('#f_night_fee_halfyear').value = formatCurrency(data.ntFeeHfyrPassPrc);


    // 🔥 운영시간 바인딩
    if (data.wkWkdyOperTmCd) {
        bindOperationTime('day', 'weekday', data.wkWkdyOperTmCd, data.wkWkdyOperStarTm, data.wkWkdyOperEndTm);
    }
    if (data.wkSatOperTmCd) {
        bindOperationTime('day', 'saturday', data.wkSatOperTmCd, data.wkSatOperStarTm, data.wkSatOperEndTm);
    }
    if (data.wkHldyOperTmCd) {
        bindOperationTime('day', 'holiday', data.wkHldyOperTmCd, data.wkHldyOperStarTm, data.wkHldyOperEndTm);
    }

    if (data.ntWkdyOperTmCd) {
        bindOperationTime('night', 'weekday', data.ntWkdyOperTmCd, data.ntWkdyOperStarTm, data.ntWkdyOperEndTm);
    }
    if (data.ntSatOperTmCd) {
        bindOperationTime('night', 'saturday', data.ntSatOperTmCd, data.ntSatOperStarTm, data.ntSatOperEndTm);
    }
    if (data.ntHldyOperTmCd) {
        bindOperationTime('night', 'holiday', data.ntHldyOperTmCd, data.ntHldyOperStarTm, data.ntHldyOperEndTm);
    }

    // 🔥 요금지불방식 바인딩
    if (data.wkFeeMthdCd) {
        bindCheckboxes('dayPayMethod', data.wkFeeMthdCd);
        if (data.wkFeeMthdCd.includes('04') && data.wkFeePayMthdOthr) {
            const dayPayEtcChk = $('#day_pay_etc_chk');
            const dayPayEtcInput = $('#day_pay_etc_input');
            if (dayPayEtcChk) dayPayEtcChk.checked = true;
            if (dayPayEtcInput) {
                dayPayEtcInput.disabled = false;
                dayPayEtcInput.value = data.wkFeePayMthdOthr;
            }
        }
    }

    if (data.ntFeeMthdCd) {
        bindCheckboxes('nightPayMethod', data.ntFeeMthdCd);
        if (data.ntFeeMthdCd.includes('04') && data.ntFeePayMthdOthr) {
            const nightPayEtcChk = $('#night_pay_etc_chk');
            const nightPayEtcInput = $('#night_pay_etc_input');
            if (nightPayEtcChk) nightPayEtcChk.checked = true;
            if (nightPayEtcInput) {
                nightPayEtcInput.disabled = false;
                nightPayEtcInput.value = data.ntFeePayMthdOthr;
            }
        }
    }

    // 🔥 요금정산방식 바인딩
    if (data.wkFeeStlmtMthdCd) {
        bindCheckboxes('daySettleMethod', data.wkFeeStlmtMthdCd);
    }
    if (data.ntFeeStlmtMthdCd) {
        bindCheckboxes('nightSettleMethod', data.ntFeeStlmtMthdCd);
    }

    // 🔥 주차관리 시설 정보 바인딩 (Y/N 라디오 버튼)

    // 1) 주차장표지판 유무
    if (data.prklotSignYn) {
        const signRadio = document.querySelector(`input[name="parkingSign"][value="${data.prklotSignYn}"]`);
        if (signRadio) {
            signRadio.checked = true;
            signRadio.dispatchEvent(new Event('change'));
        }
    }

    // 2) 발권기 유무
    if (data.tcktMchnYn) {
        const ticketRadio = document.querySelector(`input[name="ticketMachine"][value="${data.tcktMchnYn}"]`);
        if (ticketRadio) {
            ticketRadio.checked = true;
            ticketRadio.dispatchEvent(new Event('change'));
        }
    }

    // 3) 차단기 유무
    if (data.barrGteYn) {
        const barrierRadio = document.querySelector(`input[name="barrier"][value="${data.barrGteYn}"]`);
        if (barrierRadio) {
            barrierRadio.checked = true;
            barrierRadio.dispatchEvent(new Event('change'));
        }
    }

    // 4) 차량인식종류 (차단기가 'Y'인 경우에만)
    if (data.barrGteYn === 'Y' && data.vehRcgnTpCd) {
        const vehRecognitionRadio = document.querySelector(`input[name="vehicleRecognition"][value="${data.vehRcgnTpCd}"]`);
        if (vehRecognitionRadio) {
            vehRecognitionRadio.checked = true;
        }
    }

    // 5) 출차알람 유무
    if (data.exitAlrmYn) {
        const exitAlarmRadio = document.querySelector(`input[name="exitAlarm"][value="${data.exitAlrmYn}"]`);
        if (exitAlarmRadio) {
            exitAlarmRadio.checked = true;
            exitAlarmRadio.dispatchEvent(new Event('change'));
        }
    }


    // 🔥 주차 첨두 시간대 바인딩

    if ($('#f_peak_day_start')) {
        const startHour = extractPeakHour(data.wkPeakStrTm);
        if (startHour !== null) $('#f_peak_day_start').value = startHour;
    }
    if ($('#f_peak_day_end')) {
        const endHour = extractPeakHour(data.wkPeakEndTm);
        if (endHour !== null) $('#f_peak_day_end').value = endHour;
    }
    if ($('#f_peak_day_count')) {
        $('#f_peak_day_count').value = data.wkPrkVehCnt || '';
    }

    if ($('#f_peak_night_start')) {
        const startHour = extractPeakHour(data.ntPeakStrTm);
        if (startHour !== null) $('#f_peak_night_start').value = startHour;
    }
    if ($('#f_peak_night_end')) {
        const endHour = extractPeakHour(data.ntPeakEndTm);
        if (endHour !== null) $('#f_peak_night_end').value = endHour;
    }
    if ($('#f_peak_night_count')) {
        $('#f_peak_night_count').value = data.ntPrkVehCnt || '';
    }


    // 🔥 주차장 입구 좌표 바인딩
    if ($('#f_entrance_lat')) $('#f_entrance_lat').value = data.prklotEntrLat || '';
    if ($('#f_entrance_lng')) $('#f_entrance_lng').value = data.prklotEntrLon || '';

    // 🔥 사전점검 정보 바인딩

    // 1) 2층 이상 건축물 주차장여부
    if (data.bldg2fPrklotCd) {
        const floorValue = (data.bldg2fPrklotCd === '01' || data.bldg2fPrklotCd === '1') ? '1층' : '2층이상';
        const bldgFloorRadio = document.querySelector(`input[name="buildingFloor"][value="${floorValue}"]`);
        if (bldgFloorRadio) {
            bldgFloorRadio.checked = true;
            bldgFloorRadio.dispatchEvent(new Event('change'));
        }
    }

    // 2) 추락방지시설 유무
    if (data.fallPrevFcltyYn) {
        const fallPrevRadio = document.querySelector(`input[name="fallPrevention"][value="${data.fallPrevFcltyYn}"]`);
        if (fallPrevRadio) {
            fallPrevRadio.checked = true;
        }
    }

    // 3) 경사 여부
    if (data.slpYn) {
        const slopeRadio = document.querySelector(`input[name="slope"][value="${data.slpYn}"]`);
        if (slopeRadio) {
            slopeRadio.checked = true;
            slopeRadio.dispatchEvent(new Event('change'));
        }
    }
    // 4) 7% 초과 면수
    if ($('#f_slope_over_7_value') && data.slp7gtAreaCnt) {
        $('#f_slope_over_7_value').value = data.slp7gtAreaCnt;
    }

    // 5) 보행안전시설
    if ($('#f_speed_bump_count')) $('#f_speed_bump_count').value = data.spdBumpQty || '';
    if ($('#f_crosswalk_count')) $('#f_crosswalk_count').value = data.stopLineQty || '';
    if ($('#f_pedestrian_crossing_count')) $('#f_pedestrian_crossing_count').value = data.crswlkQty || '';


    // 🔥 안전시설 바인딩 (antislpFcltyYn, slpCtnGuidSignYn)
    const antislpFacilityChk = document.getElementById('antislp_facility_chk');
    const slpGuideSignChk = document.getElementById('slp_guide_sign_chk');

    if (antislpFacilityChk) {
        antislpFacilityChk.checked = (data.antislpFcltyYn === 'Y');
    }

    if (slpGuideSignChk) {
        slpGuideSignChk.checked = (data.slpCtnGuidSignYn === 'Y');
    }


    // 🔥 주간/야간 주차대수
    if ($('#f_day_parked_cnt')) $('#f_day_parked_cnt').value = data.wkPrkVehCnt || '';
    if ($('#f_night_parked_cnt')) $('#f_night_parked_cnt').value = data.ntPrkVehCnt || '';

    // 🔥 특이사항
    if ($('#f_partclr_matter')) $('#f_partclr_matter').value = data.partclrMatter || '';

    // 🔥 2. 진행상태 확인 후 ReadOnly 처리 (코드값 30=승인)
    const statusValue = (data.prgsStsCd || $('#f_status')?.value || serverStatusValue || '').trim();
    applyApprovalLock(statusValue);

    // UI 업데이트
    setTimeout(() => {
        toggleTimeSections();
        if (typeof syncFeeSections === 'function') {
            syncFeeSections();
        }
    }, 200);

}

// ========== 🔥 운영시간 바인딩 함수 ==========
function bindOperationTime(timeType, dayType, operTmCd, startTime, endTime) {

    const capitalizedDayType = dayType.charAt(0).toUpperCase() + dayType.slice(1);
    const radioName = `${timeType}${capitalizedDayType}Operation`;

    const radioButton = document.querySelector(`input[name="${radioName}"][value="${operTmCd}"]`);
    if (radioButton) {
        radioButton.checked = true;
        radioButton.dispatchEvent(new Event('change', {bubbles: true}));
    }

    if (operTmCd === '02' && startTime && endTime) {
        const startHour = startTime.substring(0, 2);
        const startMin = startTime.substring(2, 4);
        const endHour = endTime.substring(0, 2);
        const endMin = endTime.substring(2, 4);

        const startHourInput = $(`#${timeType}_${dayType}_start_hour`);
        const startMinInput = $(`#${timeType}_${dayType}_start_min`);
        const endHourInput = $(`#${timeType}_${dayType}_end_hour`);
        const endMinInput = $(`#${timeType}_${dayType}_end_min`);

        if (startHourInput) startHourInput.value = parseInt(startHour, 10);
        if (startMinInput) startMinInput.value = parseInt(startMin, 10);
        if (endHourInput) endHourInput.value = parseInt(endHour, 10);
        if (endMinInput) endMinInput.value = parseInt(endMin, 10);

    }
}

// ========== 🔥 체크박스 바인딩 함수 ==========
function bindCheckboxes(name, codeString) {
    if (!codeString) return;

    const codes = codeString.split(',').map(c => c.trim()).filter(c => c);

    codes.forEach(code => {
        if (code === '04' || code === '기타') {
            const etcCheckbox = $(`#${name.replace('Method', '')}_etc_chk`);
            if (etcCheckbox) {
                etcCheckbox.checked = true;
                const etcInput = $(`#${name.replace('Method', '')}_etc_input`);
                if (etcInput) etcInput.disabled = false;
            }
            return;
        }

        const checkbox = document.querySelector(`input[name="${name}"][value="${code}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
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
            } else if (input.id === 'f_entrance_lat' || input.id === 'f_entrance_lng') {
                // 주차장 입구 좌표는 항상 readOnly
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

    // 라디오/체크박스
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

    // 파일 업로드 버튼
    const fileButtons = [
        '#btnPickFromLibrary', '#btnTakePhoto', '#btnUseGeolocation', '#btnClearPhoto',
        '#btnFindAddr',
        '#btnEntrancePhotoLibrary', '#btnEntrancePhotoCamera', '#btnClearEntrancePhoto',
        '#btnSignPhotoLibrary', '#btnSignPhotoCamera', '#btnClearSignPhoto',
        '#btnTicketPhotoLibrary', '#btnTicketPhotoCamera', '#btnClearTicketPhoto',
        '#btnBarrierPhotoLibrary', '#btnBarrierPhotoCamera', '#btnClearBarrierPhoto',
        '#btnExitAlarmPhotoLibrary', '#btnExitAlarmPhotoCamera', '#btnClearExitAlarmPhoto',
        '#btnFallPhotoLibrary', '#btnFallPhotoCamera', '#btnClearFallPhoto',
        '#btnParkingGuidePhotoLibrary', '#btnParkingGuidePhotoCamera', '#btnClearParkingGuidePhoto'
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

// ========== 저장 ==========
function buildPayload() {
    const currentOpTypeRadios = $$('input[name="opType"]');
    const selectedOp = (currentOpTypeRadios.find(r => r.checked)?.value) || '';
    const sumNow = detailSum();

    const isDayChecked = $('#chk_day')?.checked || false;
    const isNightChecked = $('#chk_night')?.checked || false;
    const rawParkingType = document.querySelector('input[name="parkingType"]:checked')?.value || '';
    const selectedParkingType = normalizeParkingTypeCode(rawParkingType);

    const payload = {
        id: f_id?.value,
        name: f_name?.value,
        status: f_status?.value,
        type: '노외',
        // NOTE: 주차장구분 라디오 값도 저장에 포함 (prkplceSe에 매핑)
        parkingType: selectedParkingType,
        operationType: selectedOp,
        ldongCd: generateLdongCd(),
        //추가: 민간위탁/민간직영 입력값 동시 전달
        trustCompanyName: $('#f_own_trust_company')?.value?.trim() || '',
        directCompanyName: $('#f_own_direct_company')?.value?.trim() || '',
        times: {
            day: isDayChecked,
            night: isNightChecked
        }
    };

    if (isDayChecked) {
        payload.day = {
            operatingHours: collectOperatingHours('day')
        };
    }

    if (isNightChecked) {
        payload.night = {
            operatingHours: collectOperatingHours('night')
        };
    }

    payload.sidoCd = $('#f_sido')?.value || '';
    payload.sigunguCd = $('#f_sigungu')?.value || null;
    payload.emdCd = $('#f_emd')?.value || null;

    return payload;
}

// ========== 🔥 필수 입력 검증 함수 ==========
function validateRequiredFields() {
    const errors = [];


    // 주차면수 검증
    const total = num(totalInput?.value);
    if (total === 0) {
        errors.push('- 주차면수를 입력해주세요');
    } else {
    }

    // 운영 정보 검증
    const ownRadio = document.querySelector('input[name="own"]:checked');
    if (!ownRadio) {
        errors.push('- 운영주체를 선택해주세요');
    } else {
        //추가: 민간위탁/민간직영 각각 필수값 확인
        const codeCd = ownRadio.value || '';
        const codeNm = ownRadio.dataset?.codeName || '';
        const privateType = resolvePrivateOwnType(codeCd, codeNm);
        if (privateType === 'trust') {
            const trustValue = $('#f_own_trust_company')?.value?.trim();
            if (!trustValue) {
                errors.push('• 민간위탁 업체명을 입력해주세요.');
            }
        } else if (privateType === 'direct') {
            const directValue = $('#f_own_direct_company')?.value?.trim();
            if (!directValue) {
                errors.push('• 민간직영 업체명을 입력해주세요.');
            }
        }
    }

    // 행정구역 코드
    const ldongCd = generateLdongCd();
    if (!ldongCd) {
        errors.push('• 법정동코드(ldong_cd)는 10자리여야 합니다');
    }

    // 시간대 검증
    const isDayChecked = $('#chk_day')?.checked;
    const isNightChecked = $('#chk_night')?.checked;

    if (!isDayChecked && !isNightChecked) {
        errors.push('- 주간 또는 야간 운영시간을 선택해주세요');
    } else {
    }

    return errors;
}

// ========== 🔥 서버 데이터 매핑 함수 ==========
function mapPayloadToServerFormat(payload) {
    const ldongCd = generateLdongCd();
    if (!ldongCd || ldongCd.length !== 10) {
        throw new Error('법정동코드(ldong_cd)는 10자리여야 합니다.');
    }
    const f_sido = document.getElementById('f_sido');
    const f_sigungu = document.getElementById('f_sigungu');
    const f_emd = document.getElementById('f_emd');

    const normalizedPlceType = normalizeParkingTypeCode(payload.prkPlceType || '02');
    const normalizedPrkplceSe = normalizeParkingTypeCode(payload.parkingType || '02');

    const serverData = {
        prkBizMngNo: loadedBizMngNo,
        prkPlceInfoSn: loadedPrkPlceInfoSn,
        prkPlceManageNo: payload.id,
        prkplceNm: payload.name,
        prgsStsCd: payload.status,
        prkPlceType: normalizedPlceType || '02', // 노외주차장 구분 코드
        // NOTE: 화면에서 선택한 prkplceSe(주차장구분 코드) 전달
        prkplceSe: normalizedPrkplceSe || '02',
        // NOTE: 민간위탁/직영 업체명은 값이 있으면 그대로 trut_comp_nm/dirt_comp_nm에 저장한다.
        trutCompNm: payload.trustCompanyName || null,
        dirtCompNm: payload.directCompanyName || null,
        sidoCd: f_sido?.value || null,
        sigunguCd: f_sigungu?.value || null,
        emdCd: f_emd?.value || null,
        ldongCd: ldongCd,

        /* ========== 🔥 지번 및 주소 정보 (화면 ID와 매핑 확인) ========== */
        // 화면의 '건물명'을 bdnbr(건물번호/명) 필드에 매핑
        bdnbr: document.getElementById('f_buildingName')?.value || null,
        // 본번
        lnmMnno: document.getElementById('f_mainNum')?.value || null,
        // 부번
        lnmSbno: document.getElementById('f_subNum')?.value || null,
        // 산 여부
        mntnYn: document.querySelector('input[name="mountainYn"]:checked')?.value || 'N',
        // 리(里)
        liCd: document.getElementById('f_ri')?.value || null,
        // 도로명 주소
        rnmadr: document.getElementById('f_addr_road')?.value || null,

        // 🔥 [추가] 누락되었던 지번 주소 및 메인 좌표 매핑
        dtadd: document.getElementById('f_addr_jibun')?.value || null,
        prkPlceLat: document.getElementById('f_lat')?.value || null,
        prkPlceLon: document.getElementById('f_lng')?.value || null,

        // 주차면수
        totPrkCnt: num(totalInput?.value),
        disabPrkCnt: num(disInput?.value),
        compactPrkCnt: num(smallInput?.value),
        ecoPrkCnt: num(greenInput?.value),
        pregnantPrkCnt: num(pregInput?.value),

        // 🔥 우편번호 추가
        zip: document.getElementById('f_zip')?.value || null,

        // 운영정보
        operMbyCd: document.querySelector('input[name="own"]:checked')?.value,
        mgrOrg: $('#f_mgr_name')?.value,
        mgrOrgTelNo: $('#f_mgr_tel')?.value,
        subordnOpertnCd: $('#f_oddEven')?.value,

        // 시간대 구분
        dyntDvCd: payload.times.day && payload.times.night ? '03' :
            payload.times.day ? '01' : '02',

        // 운영방식
        prkOperMthdCd: payload.operationType,

        // NOTE: 첨두시간대 (주간/야간) 필드도 함께 서버로 전달
        wkPeakStrTm: formatPeakTime($('#f_peak_day_start')?.value),
        wkPeakEndTm: formatPeakTime($('#f_peak_day_end')?.value),
        wkPrkVehCnt: num($('#f_peak_day_count')?.value),
        ntPeakStrTm: formatPeakTime($('#f_peak_night_start')?.value),
        ntPeakEndTm: formatPeakTime($('#f_peak_night_end')?.value),
        ntPrkVehCnt: num($('#f_peak_night_count')?.value)
    };
    // NOTE: 상단 serverData에 바로 매핑했으므로 여기선 추가 처리 없음.
    // 주간 데이터
    if (payload.times.day && payload.day) {
        serverData.wkZon = $('#f_day_grade')?.value;
        serverData.wkFeeAplyCd = $('#f_day_feeType')?.value;

        // 주간 거주자 요금
        serverData.wkResDayFee = parseCurrency($('#f_day_res_all')?.value);
        serverData.wkResFtFee = parseCurrency($('#f_day_res_day')?.value);
        serverData.wkResWkFee = parseCurrency($('#f_day_res_full')?.value);

        // 주간 일반 요금
        serverData.wkGnFrst30mFee = parseCurrency($('#f_day_fee_first30')?.value);
        serverData.wkGnInt10mFee = parseCurrency($('#f_day_fee_per10')?.value);
        serverData.wkGn1hFee = parseCurrency($('#f_day_fee_per60')?.value);
        serverData.wkGnDayFee = parseCurrency($('#f_day_fee_daily')?.value);
        serverData.wkFeeMnthPassPrc = parseCurrency($('#f_day_fee_monthly')?.value);
        serverData.wkFeeHfyrPassPrc = parseCurrency($('#f_day_fee_halfyear')?.value);

        // 주간 운영시간
        const dayHours = payload.day.operatingHours;
        serverData.wkWkdyOperTmCd = dayHours.weekday.code;
        if (dayHours.weekday.time) {
            serverData.wkWkdyOperStarTm = dayHours.weekday.time.startTime;
            serverData.wkWkdyOperEndTm = dayHours.weekday.time.endTime;
        }

        serverData.wkSatOperTmCd = dayHours.saturday.code;
        if (dayHours.saturday.time) {
            serverData.wkSatOperStarTm = dayHours.saturday.time.startTime;
            serverData.wkSatOperEndTm = dayHours.saturday.time.endTime;
        }

        serverData.wkHldyOperTmCd = dayHours.holiday.code;
        if (dayHours.holiday.time) {
            serverData.wkHldyOperStarTm = dayHours.holiday.time.startTime;
            serverData.wkHldyOperEndTm = dayHours.holiday.time.endTime;
        }

        // 주간 지불/정산방식
        serverData.wkFeeMthdCd = collectPayMethods('day').join(',');
        serverData.wkFeeStlmtMthdCd = collectSettleMethods('day').join(',');
    }

    // 야간 데이터
    if (payload.times.night && payload.night) {
        serverData.ntZon = $('#f_night_grade')?.value;
        serverData.ntFeeAplyCd = $('#f_night_feeType')?.value;

        // 야간 거주자 요금
        serverData.ntResDayFee = parseCurrency($('#f_night_res_all')?.value);
        serverData.ntResWkFee = parseCurrency($('#f_night_res_full')?.value);
        serverData.ntResNtFee = parseCurrency($('#f_night_res_night')?.value);

        // 야간 일반 요금
        serverData.ntGnFrst30mFee = parseCurrency($('#f_night_fee_first30')?.value);
        serverData.ntGnInt10mFee = parseCurrency($('#f_night_fee_per10')?.value);
        serverData.ntGn1hFee = parseCurrency($('#f_night_fee_per60')?.value);
        serverData.ntGnDayFee = parseCurrency($('#f_night_fee_daily')?.value);
        serverData.ntFeeMnthPassPrc = parseCurrency($('#f_night_fee_monthly')?.value);
        serverData.ntFeeHfyrPassPrc = parseCurrency($('#f_night_fee_halfyear')?.value);

        // 야간 운영시간
        const nightHours = payload.night.operatingHours;
        serverData.ntWkdyOperTmCd = nightHours.weekday.code;
        if (nightHours.weekday.time) {
            serverData.ntWkdyOperStarTm = nightHours.weekday.time.startTime;
            serverData.ntWkdyOperEndTm = nightHours.weekday.time.endTime;
        }

        serverData.ntSatOperTmCd = nightHours.saturday.code;
        if (nightHours.saturday.time) {
            serverData.ntSatOperStarTm = nightHours.saturday.time.startTime;
            serverData.ntSatOperEndTm = nightHours.saturday.time.endTime;
        }

        serverData.ntHldyOperTmCd = nightHours.holiday.code;
        if (nightHours.holiday.time) {
            serverData.ntHldyOperStarTm = nightHours.holiday.time.startTime;
            serverData.ntHldyOperEndTm = nightHours.holiday.time.endTime;
        }

        // 야간 지불/정산방식
        serverData.ntFeeMthdCd = collectPayMethods('night').join(',');
        serverData.ntFeeStlmtMthdCd = collectSettleMethods('night').join(',');
    }

    // 주차관리 시설
    serverData.prklotSignYn = document.querySelector('input[name="parkingSign"]:checked')?.value;
    serverData.tcktMchnYn = document.querySelector('input[name="ticketMachine"]:checked')?.value;
    serverData.barrGteYn = document.querySelector('input[name="barrier"]:checked')?.value;
    serverData.vehRcgnTpCd = document.querySelector('input[name="vehicleRecognition"]:checked')?.value;
    serverData.exitAlrmYn = document.querySelector('input[name="exitAlarm"]:checked')?.value;

    // 사전점검
    const buildingFloor = document.querySelector('input[name="buildingFloor"]:checked')?.value;
    serverData.bldg2fPrklotCd = buildingFloor === '1층' ? '01' : '02';
    serverData.fallPrevFcltyYn = document.querySelector('input[name="fallPrevention"]:checked')?.value;
    serverData.slpYn = document.querySelector('input[name="slope"]:checked')?.value;
    serverData.slp7gtAreaCnt = num($('#f_slope_over_7_value')?.value);

    // 보행안전시설
    serverData.spdBumpQty = num($('#f_speed_bump_count')?.value);
    serverData.stopLineQty = num($('#f_crosswalk_count')?.value);
    serverData.crswlkQty = num($('#f_pedestrian_crossing_count')?.value);

    // 안전시설
    serverData.antislpFcltyYn = $('#antislp_facility_chk')?.checked ? 'Y' : 'N';
    serverData.slpCtnGuidSignYn = $('#slp_guide_sign_chk')?.checked ? 'Y' : 'N';

    // 주차장 입구
    serverData.prklotEntrLat = $('#f_entrance_lat')?.value;
    serverData.prklotEntrLon = $('#f_entrance_lng')?.value;

    // 특이사항
    serverData.partclrMatter = $('#f_partclr_matter')?.value;

    return serverData;
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
    }// 🔥 좌표를 주소로 변환하는 함수 (우편번호 포함)
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
}

// ========== 🔥 DOMContentLoaded - 맨 아래쪽에 위치 ==========
document.addEventListener('DOMContentLoaded', async function () {

    try {
        if (serverStatusValue) {
            applyApprovalLock(serverStatusValue);
        }
        // 1. 행정구역 코드 로드
        await RegionCodeLoader.loadProgressStatus();
        await RegionCodeLoader.loadSidoList();
        RegionCodeLoader.setupEventListeners();

        // 2. 동적 코드 로드
        await CodeLoader.applyAllDynamicCodes();

        // 3. 이벤트 리스너 설정
        setupDayNightSections();
        setupTimeOperationEvents('day');
        setupTimeOperationEvents('night');
        setupFacilityPhotoEvents();
        setupPeakTimeValidation();
        setupEntrancePhotoEvents();
        setupPreInspectionEvents();
        setupPedestrianSafetyEvents();

        // 4. 서버에서 주차장 상세 데이터 로드
        await loadParkingDetailFromServer();

        // 🔥 5. 통화 포맷 적용
        applyCurrencyFormat($('#f_day_res_all'));
        applyCurrencyFormat($('#f_day_res_day'));
        applyCurrencyFormat($('#f_day_res_full'));
        applyCurrencyFormat($('#f_day_fee_first30'));
        applyCurrencyFormat($('#f_day_fee_per10'));
        applyCurrencyFormat($('#f_day_fee_per60'));
        applyCurrencyFormat($('#f_day_fee_daily'));
        applyCurrencyFormat($('#f_day_fee_monthly'));
        applyCurrencyFormat($('#f_day_fee_halfyear'));

        applyCurrencyFormat($('#f_night_res_all'));
        applyCurrencyFormat($('#f_night_res_full'));
        applyCurrencyFormat($('#f_night_res_night'));
        applyCurrencyFormat($('#f_night_fee_first30'));
        applyCurrencyFormat($('#f_night_fee_per10'));
        applyCurrencyFormat($('#f_night_fee_per60'));
        applyCurrencyFormat($('#f_night_fee_daily'));
        applyCurrencyFormat($('#f_night_fee_monthly'));
        applyCurrencyFormat($('#f_night_fee_halfyear'));

        // 🔥 5-1. 전화번호 인풋 포맷 적용 (onparking.js 기준)
        const mgrTelInput = document.getElementById('f_mgr_tel');

        if (mgrTelInput) {
            // ① 서버에서 채워진 값도 바로 하이픈 포맷으로 보여주기
            mgrTelInput.value = formatPhoneNumber(mgrTelInput.value || '');
            // ② 이후 입력/수정 시 실시간 포맷
            applyPhoneFormat(mgrTelInput);
        } else {
            console.warn('⚠️ 관리기관 전화번호 입력요소(id="f_mgr_tel")를 찾을 수 없습니다.');
        }

        // 필요 시 다른 tel 인풋 전체에 적용
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            if (input !== mgrTelInput) {
                applyPhoneFormat(input);
            }
        });

        // 6. 초기 파일 목록 로드
        const hiddenInfoSn = document.getElementById('prkPlceInfoSn')?.value;
        if (hiddenInfoSn) {
            await reloadParkingPhotos(hiddenInfoSn);
        }

        // 🔥 6. 저장 버튼 이벤트 - 수정된 부분

        const btnSave = document.getElementById('btnSave');
        const btnSaveTop = document.getElementById('btnSaveTop');


        if (btnSave) {
            btnSave.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();
                await doSave();
            });
        } else {
            console.error('❌ btnSave를 찾을 수 없습니다!');
        }

        if (btnSaveTop) {
            btnSaveTop.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();
                await doSave();
            });
        } else {
            console.error('❌ btnSaveTop를 찾을 수 없습니다!');
        }


    } catch (error) {
        console.error('❌ 초기화 중 오류:', error);
        alert('페이지 초기화 중 오류가 발생했습니다.');
    }
});

// ========== 🔥 저장 함수 - doSave() ==========
async function doSave() {

    // 1. 🔥 검증 초기화 (이전 에러 상태 제거)
    FormValidator.reset();
    clearValidationErrors();

    // 2. 🔥 필수 항목 검증 (순서대로 체크, 실패 시 false 반환하지만 계속 진행하지 않고 중단하려면 && 연산자 활용 또는 if문 나열)
    // 모든 필드를 다 체크해서 빨간불을 켜고 싶다면 아래처럼 변수에 누적합니다.
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
    if (ownRadio) {
        const codeCd = (ownRadio.value || '').trim();
        const codeNm = ownRadio.dataset.codeName || '';
        //추가: 유형별 업체명 필수 검증
        const privateType = resolvePrivateOwnType(codeCd, codeNm);
        if (privateType === 'trust') {
            isValid = FormValidator.check('#f_own_trust_company', '민간위탁 업체명을 입력해주세요') && isValid;
        } else if (privateType === 'direct') {
            isValid = FormValidator.check('#f_own_direct_company', '민간직영 업체명을 입력해주세요') && isValid;
        }
    }

    // --- (F) 관리기관 정보 ---
    isValid = FormValidator.check('#f_mgr_name', '관리기관명을 입력해주세요') && isValid;
    isValid = FormValidator.check('#f_mgr_tel', '관리기관 전화번호를 입력해주세요') && isValid;
    isValid = FormValidator.check('#f_oddEven', '부제 시행 여부를 선택해주세요') && isValid;

    // --- (G) 주간/야간 체크 여부 ---
    const isDay = document.querySelector('#chk_day').checked;
    const isNight = document.querySelector('#chk_night').checked;
    if (!isDay && !isNight) {
        // 체크박스는 그룹 컨테이너를 찾아서 에러 표시
        const timeGroup = document.querySelector('#chk_day').closest('.check-group') || document.querySelector('#chk_day').parentElement;
        FormValidator.showError(timeGroup, '주간 또는 야간 운영시간을 최소 하나 선택해주세요');
        isValid = false;
    }

    // 3. 🔥 유효성 검사 실패 시 중단
    if (!isValid) {
        console.warn('❌ 유효성 검사 실패: 필수 입력 항목 누락');
        showValidationErrors(['필수 입력 항목을 확인해주세요. (붉은색 표시 항목)']);
        return; // 저장 중단
    }

    try {
        clearValidationErrors();
        const validationErrors = validateRequiredFields();


        if (validationErrors.length > 0) {
            showValidationErrors(validationErrors);
            return;
        }


        const payload = buildPayload();

        // 🔥 신규/수정 여부는 payload.id 유무로만 판단하고,
        //    관리번호가 비어 있어도 저장은 진행하게 둡니다.
        const isNewRecord = !payload.id || payload.id.trim() === '';

        const serverData = mapPayloadToServerFormat(payload);

        if (isNewRecord) {
            delete serverData.prkPlceManageNo;
        }

        // 🔥 FormData 생성
        const formData = new FormData();
        // JSON 데이터를 Blob으로 추가
        formData.append('parkingData', new Blob([JSON.stringify(serverData)], {
            type: 'application/json'
        }));

        // 사진 파일 추가
        const mainPhotoLib = document.getElementById('f_photo_lib');
        const mainPhotoCam = document.getElementById('f_photo_cam');

        if (mainPhotoLib && mainPhotoLib.files && mainPhotoLib.files.length > 0) {
            formData.append('mainPhoto', mainPhotoLib.files[0]);
            appendUploadedFiles('#uploadedFileList', mainPhotoLib.files);
        } else if (mainPhotoCam && mainPhotoCam.files && mainPhotoCam.files.length > 0) {
            formData.append('mainPhoto', mainPhotoCam.files[0]);
            appendUploadedFiles('#uploadedFileList', mainPhotoCam.files);
        }

        // 표지판, 발권기, 차단기, 출차알람, 입구 사진도 동일하게 추가
        const photoFiles = [
            {lib: 'f_sign_photo_lib', cam: 'f_sign_photo_cam', key: 'signPhoto'},
            {lib: 'f_ticket_photo_lib', cam: 'f_ticket_photo_cam', key: 'ticketPhoto'},
            {lib: 'f_barrier_photo_lib', cam: 'f_barrier_photo_cam', key: 'barrierPhoto'},
            {lib: 'f_exit_alarm_photo_lib', cam: 'f_exit_alarm_photo_cam', key: 'exitAlarmPhoto'},
            {lib: 'f_entrance_photo_lib', cam: 'f_entrance_photo_cam', key: 'entrancePhoto'},
            {lib: 'f_fall_photo_lib', cam: 'f_fall_photo_cam', key: 'fallPrevPhoto'},
            {lib: 'f_parking_guide_photo_lib', cam: 'f_parking_guide_photo_cam', key: 'parkingGuidePhoto'}
        ];

        photoFiles.forEach(photo => {
            const libInput = document.getElementById(photo.lib);
            const camInput = document.getElementById(photo.cam);

            if (libInput && libInput.files && libInput.files.length > 0) {
                formData.append(photo.key, libInput.files[0]);
                appendUploadedFiles('#uploadedFileList', libInput.files);
            } else if (camInput && camInput.files && camInput.files.length > 0) {
                formData.append(photo.key, camInput.files[0]);
                appendUploadedFiles('#uploadedFileList', camInput.files);
            }
        });


        const response = await fetch(withBase('/prk/offparking-update'), {
            method: 'POST',
            body: formData
        });


        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            const hiddenInfoSn = document.getElementById('prkPlceInfoSn')?.value;
            const infoSn = result.prkPlceInfoSn || hiddenInfoSn || loadedPrkPlceInfoSn;
            if (infoSn) document.getElementById('prkPlceInfoSn').value = infoSn;
            if (infoSn) await reloadParkingPhotos(infoSn);
            handlePostSave(isNewRecord, '/prk/parkinglist');
        } else {
            alert('❌ 저장 실패: ' + (result.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('❌ 저장 중 오류:', error);
        showValidationErrors(['저장 중 오류가 발생했습니다: ' + error.message]);
    }
}

function handlePostSave(isNew) {
    alert('저장이 완료되었습니다.');

    if (typeof clearUploadProgressUI === 'function') {
        clearUploadProgressUI(); // 진행률만 정리, 완료 리스트는 유지
    }

    try {
        if (window.parent && typeof window.parent.closeNewParkingTabAndGoList === 'function') {
            window.parent.closeNewParkingTabAndGoList('offparking');
            return;
        }
        if (window.parent && typeof window.parent.reloadList === 'function') {
            window.parent.reloadList();
            return;
        }
        if (window.opener && !window.opener.closed) {
            if (typeof window.opener.closeNewParkingTabAndGoList === 'function') {
                window.opener.closeNewParkingTabAndGoList('offparking');
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
    const match = path.match(/OFF_[A-Z_]+/i);
    if (match && match[0]) return match[0].toUpperCase();
    return '';
}

function applyPhotoPreviews(infoSn, photos) {
    const previewMap = {
        OFF_MAIN: 'preview',
        OFF_SIGN: 'sign_preview',
        OFF_TICKET: 'ticket_preview',
        OFF_BARRIER: 'barrier_preview',
        OFF_EXIT_ALARM: 'exit_alarm_preview',
        OFF_ENTRANCE: 'entrance_preview',
        OFF_FALL_PREV: 'fall_preview',
        OFF_PARK_GUIDE: 'parking_guide_preview'
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
        const mainPhotos = photos.filter(p => normalizeImgId(p) === 'OFF_MAIN');
        renderUploadedList(mainPhotos);
        applyPhotoPreviews(infoSn, photos);
    } catch (e) {
        console.warn('⚠️ 파일 목록 재조회 실패:', e);
    }
}
