window.reloadList = function () {

    // Case 1: 검색 폼을 submit하여 새로고침하는 경우 (전통적 방식)
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.submit();
        return;
    }

    // Case 2: AJAX 함수가 있는 경우 (SPA 방식)
    // 만약 loadParkingList() 같은 함수가 있다면 호출
    if (typeof loadParkingList === 'function') {
        loadParkingList();
        return;
    }

    // Case 3: 아무것도 없으면 페이지 단순 새로고침
    location.reload();
};

// 컨텍스트 경로 추론 (window.contextPath가 없을 경우 현재 URL에서 1단계까지 사용)
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

// 목록 탭 ID 상수 (탭 버튼 id 기준)
const LIST_TAB_ID = 'tabList';

function activateListTab() {
    if (window.Tabs && typeof window.Tabs.activateTop === 'function') {
        window.Tabs.activateTop(LIST_TAB_ID);
        return;
    }
    const listBtn = document.getElementById(LIST_TAB_ID);
    if (listBtn) {
        listBtn.click();
    }
}

/**
 * 신규 추가 탭을 닫고 목록 탭으로 이동 + 목록 재조회
 * - iframe 내부(on/off/build)에서 window.parent.closeNewParkingTabAndGoList() 호출
 */
window.closeNewParkingTabAndGoList = function () {
    try {
        const host = getTabHost ? getTabHost() : {tabBar: document.querySelector('.tabs')};
        const tabBar = host.tabBar;

        const activeBtn = tabBar ? tabBar.querySelector('.tab-btn.active') : null;
        if (activeBtn && activeBtn.id && activeBtn.id.indexOf('tab-new-') === 0) {
            window.Tabs && typeof window.Tabs.closeTop === 'function' && window.Tabs.closeTop(activeBtn);
        } else if (tabBar) {
            // 혹시 활성 탭이 아니어도 신규 탭이 남아 있으면 닫는다.
            const newBtn = tabBar.querySelector('.tab-btn[id^="tab-new-"]');
            if (newBtn && window.Tabs && typeof window.Tabs.closeTop === 'function') {
                window.Tabs.closeTop(newBtn);
            }
        }

        activateListTab();

        if (typeof window.reloadList === 'function') {
            window.reloadList();
        } else if (typeof window.loadParkingList === 'function') {
            window.loadParkingList();
        } else {
            window.location.reload();
        }
    } catch (e) {
        console.warn('⚠️ 신규 탭 닫기/목록 갱신 중 오류:', e);
        if (typeof window.reloadList === 'function') {
            window.reloadList();
        }
    }
};


// 공통 코드 관련 함수들
const CodeUtils = {
    async loadStatusList() {
        const result = await CodeApi.loadStatusList();
        if (result.success) {
            const statusSelect = document.getElementById('status');
            if (statusSelect) {
                statusSelect.innerHTML = '<option value="">전체</option>';
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    statusSelect.appendChild(option);
                });
            }
        }
    },
    async loadParkingTypeList() {
        const result = await CodeApi.loadParkingTypeList();
        if (result.success) {
            const prkTypeSelect = document.getElementById('prkType');
            if (prkTypeSelect) {
                prkTypeSelect.innerHTML = '<option value="">전체</option>';
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    prkTypeSelect.appendChild(option);
                });
            }
        }
    },
    async loadSidoList() {
        const result = await CodeApi.loadSidoList();
        if (result.success) {
            const sidoSelect = document.getElementById('sido');
            if (!sidoSelect) return;
            sidoSelect.innerHTML = '<option value="">전체</option>';
            result.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.codeCd;
                option.textContent = item.codeNm;
                sidoSelect.appendChild(option);
            });
        }
    },
    async loadSigunguList(sidoCd) {
        const sigunguSelect = document.getElementById('sigungu');
        const emdSelect = document.getElementById('emd');
        if (!sigunguSelect || !emdSelect) return;

        sigunguSelect.innerHTML = '<option value="">전체</option>';
        emdSelect.innerHTML = '<option value="">전체</option>';
        emdSelect.disabled = true;

        if (!sidoCd) {
            sigunguSelect.disabled = true;
            return;
        }

        const result = await CodeApi.loadSigunguList(sidoCd);
        if (result.success) {
            result.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.codeCd;
                option.textContent = item.codeNm;
                sigunguSelect.appendChild(option);
            });
            sigunguSelect.disabled = false;
        } else {
            sigunguSelect.disabled = true;
        }
    },
    async loadEmdList(sigunguCd) {
        const emdSelect = document.getElementById('emd');
        if (!emdSelect) return;

        emdSelect.innerHTML = '<option value="">전체</option>';

        if (!sigunguCd) {
            emdSelect.disabled = true;
            return;
        }

        const result = await CodeApi.loadEmdList(sigunguCd);
        if (result.success && result.data) {
            result.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.emdCd;
                option.textContent = item.lgalEmdNm;
                emdSelect.appendChild(option);
            });
            emdSelect.disabled = false;
        } else {
            emdSelect.disabled = true;
        }
    }
};

// 이벤트 리스너 설정 함수
function setupAreaSelectors() {

    const sidoSelect = document.getElementById('sido');
    const sigunguSelect = document.getElementById('sigungu');
    const emdSelect = document.getElementById('emd');

    if (!sidoSelect || !sigunguSelect || !emdSelect) {
        console.error('필요한 select 엘리먼트를 찾을 수 없습니다.');
        return;
    }

    sidoSelect.addEventListener('change', async (e) => {
        const sidoCd = e.target.value;
        await CodeUtils.loadSigunguList(sidoCd);
    });

    sigunguSelect.addEventListener('change', async (e) => {
        const sigunguCd = e.target.value;
        await CodeUtils.loadEmdList(sigunguCd);
    });

}

/* =========================
   전역 변수 및 상수
   ========================= */
let DATA = [];
const MAX_DETAIL_TABS = 8;
const PAGE_SIZE_DEFAULT = 20;
const NON_SENDABLE_STATUSES = new Set(['APPROVED', 'PENDING']);

function getPageSize() {
    return PAGE_SIZE_DEFAULT;
}

let currentPage = 1;
let filtered = [];
const selected = new Set();

const $id = (id) => document.getElementById(id);
const $one = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const STATUS_TEXT_MAP = {
    '00': '작성전',
    '10': '조사중',
    '20': '승인대기',
    '30': '승인',
    '99': '반려'
};
const STATUS_BLOCK_LIST = new Set(['20', '30']);
const STATUS_NAME_TO_CODE = Object.entries(STATUS_TEXT_MAP).reduce((acc, [cd, nm]) => {
    acc[nm] = cd;
    return acc;
}, {});
const normalizeStatus = (status) => {
    const raw = String(status || '').trim();
    if (STATUS_TEXT_MAP[raw]) return raw;               // already code
    if (STATUS_NAME_TO_CODE[raw]) return STATUS_NAME_TO_CODE[raw]; // 한글명 -> 코드
    return raw;
};
const isNonSendableStatus = (status) => STATUS_BLOCK_LIST.has(normalizeStatus(status));

function updateSendButtonState() {
    const sendBtn = $id('sendBtn');
    if (!sendBtn) return;
    const checkedCount = selected.size;
    sendBtn.disabled = checkedCount === 0;
}

function syncSelectedFromDOM() {
    const checkedValues = Array.from(document.querySelectorAll('input[name="selectedPrk"]:checked'))
        .map(chk => chk.value);
    const uniqueValues = [...new Set(checkedValues)];
    selected.clear();
    uniqueValues.forEach(v => selected.add(v));
    syncHeaderCheck();
    updateSendButtonState();
    return uniqueValues;
}

/* =========================
   서버 데이터 로드
   ========================= */
async function loadDataFromServer() {
    try {
        const formData = getSearchParams();
        const params = new URLSearchParams({
            ...formData,
            page: currentPage,
            size: getPageSize()
        });

        const response = await fetch(withBase('/prk/parking-data?' + params.toString()), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // 🔥 디버깅 로그 추가

        if (data.success !== false) {
            const mapped = (data.list || []).map((item, index) => {
                // 🔥 prkPlceInfoSn이 없는 경우 경고
                if (!item.prkPlceInfoSn) {
                    console.warn(`⚠️ [${index}] ${item.prkplceNm}에 prkPlceInfoSn이 없습니다!`);
                }

                return {
                    nm: item.prkplceNm || '',
                    type: item.prkPlceType || '',
                    status: item.prgsStsCd || '',
                    statusNm: item.prgsStsNm || '',
                    sido: item.sidoNm || '',
                    sigungu: item.sigunguNm || '',
                    emd: item.lgalEmdNm || '',
                    addr: item.dtadd || '',
                    manageNo: item.prkPlceManageNo || item.manageNo || '',
                    zip: item.zip || '',
                    userNm: item.userNm || '',
                    prkPlceInfoSn: item.prkPlceInfoSn || null  // 🔥 확인!
                };
            });

            const missingManageNo = mapped.filter(item => !item.manageNo);
            if (missingManageNo.length > 0) {
                console.warn(`⚠️ 주차장관리번호가 없는 항목 ${missingManageNo.length}건을 목록에서 제외합니다.`);
                toast(`관리번호 없는 ${missingManageNo.length}건을 제외하고 표시합니다.`);
            }

            DATA = mapped.filter(item => !!item.manageNo);

            filtered = [...DATA];

            // 🔥 prkPlceInfoSn이 null인 항목 카운트
            const nullCount = DATA.filter(item => !item.prkPlceInfoSn).length;
            if (nullCount > 0) {
                console.error(`❌ prkPlceInfoSn이 null인 항목: ${nullCount}/${DATA.length}개`);
                console.error('이 항목들은 전송 시 제외됩니다!');
            } else {
            }

            updateSummary(DATA.length);

            render();
            pruneSelected();
        } else {
            throw new Error(data.message || '데이터 로드 실패');
        }
    } catch (error) {
        console.error('서버 데이터 로드 실패:', error);
        toast('데이터를 불러오는데 실패했습니다: ' + error.message);
        DATA = [];
        filtered = [];
        render();
    }
}

function getSearchParams() {
    const form = $id('searchForm');
    if (!form) return {};

    const formData = new FormData(form);
    const params = {};

    for (let [key, value] of formData.entries()) {
        if (value && value.trim()) {
            params[key] = value.trim();
        }
    }

    return params;
}

function updateSummary(totalCount) {
    const summary = $id('summary');
    if (summary) {
        summary.textContent = `총 ${totalCount.toLocaleString()}건`;
    }
}

function pruneSelected() {
    let removed = 0;
    selected.forEach(id => {
        const rec = DATA.find(p => p.manageNo === id);
        const statusCode = normalizeStatus(rec?.status || rec?.statusNm);
        if (!rec || isNonSendableStatus(statusCode)) {
            selected.delete(id);
            removed += 1;
        }
    });
    if (removed > 0) {
        toast(`승인/승인대기 또는 없는 항목 ${removed}건을 전송 대상에서 제외했습니다.`);
    }
    updateSendButtonState();
}

async function applyFilter() {
    currentPage = 1;
    await loadDataFromServer();
}

function render() {
    const tbody = $id('tbody'),
        cards = $id('cards'),
        summary = $id('summary');
    if (!tbody || !cards || summary === null) return;

    const total = filtered.length;
    const pageSize = getPageSize();
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > pages) currentPage = pages;
    const start = (currentPage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    tbody.innerHTML = pageRows.map((r, i) => {
        const seq = start + i + 1;
        const statusCode = normalizeStatus(r.status || r.statusNm);
        const statusNm = STATUS_TEXT_MAP[statusCode] || r.statusNm || r.status || '';
        const blocked = isNonSendableStatus(statusCode);
        if (blocked && selected.has(r.manageNo)) selected.delete(r.manageNo);
        const checked = selected.has(r.manageNo) ? 'checked' : '';
        const disabled = blocked ? 'disabled' : '';
        const blockedMsg = blocked ? ' (승인/승인대기 제외)' : '';
        return `
      <tr data-id="${r.manageNo}" data-info-sn="${r.prkPlceInfoSn ?? ''}" data-status="${statusCode}">
        <td class="num">${seq}</td>
        <td class="check">
          <label class="row-check-wrap" aria-label="선택: ${r.nm}${blockedMsg}">
            <input type="checkbox" class="row-check" name="selectedPrk" value="${r.manageNo}" ${checked} ${disabled} aria-label="선택: ${r.nm}${blockedMsg}" />
          </label>
        </td>
        <td>${r.type}</td>
        <td>${FormatUtils.badgeStatus(statusCode || statusNm)}</td>
        <td>${r.sido}</td>
        <td>${r.sigungu}</td>
        <td>${r.emd}</td>
        <td><span class="addr">${r.addr}</span></td>
        <td><strong>${r.nm}</strong>
          <div class="muted">${r.manageNo}</div>
        </td>
      </tr>`;
    }).join('');

    cards.innerHTML = pageRows.map(r => {
        const statusCode = normalizeStatus(r.status || r.statusNm);
        const statusNm = STATUS_TEXT_MAP[statusCode] || r.statusNm || r.status || '';
        const blocked = isNonSendableStatus(statusCode);
        if (blocked && selected.has(r.manageNo)) selected.delete(r.manageNo);
        const checked = selected.has(r.manageNo) ? 'checked' : '';
        const disabled = blocked ? 'disabled' : '';
        return `
      <article class="card parking-item" data-id="${r.manageNo}" data-info-sn="${r.prkPlceInfoSn ?? ''}" data-status="${statusCode}" aria-label="${r.nm}">
        <label class="checkbox-wrap" aria-label="선택: ${r.nm}">
          <input
            type="checkbox"
            class="card-check"
            name="selectedPrk"
            value="${r.manageNo}"
            ${checked} ${disabled}
            aria-label="선택: ${r.nm}" />
        </label>
        <div class="card-body info">
          <div class="card-head">
            <div class="muted">${r.manageNo}</div>
          </div>
          <div class="name">${r.nm}</div>
          <div class="card-meta"><span class="badge">${r.type}</span> · ${FormatUtils.badgeStatus(statusCode || statusNm)}</div>
          <div class="location muted">${r.sido} ${r.sigungu} ${r.emd}</div>
          <div class="addr">${r.addr}</div>
        </div>
      </article>`;
    }).join('');

    renderPager(pages, currentPage, async (page) => {
        currentPage = page;
        await loadDataFromServer();
    });
    bindRowChecks();
    bindCardChecks();
    bindOpenDetailHandlers(pageRows);
    updateSendButtonState();
}

/* =========================
   체크박스 동기화
   ========================= */
function bindRowChecks() {
    const tbody = $id('tbody'),
        cards = $id('cards');
    if (!tbody || !cards) return;
    tbody.querySelectorAll('.row-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const tr = e.target.closest('tr');
            const id = tr.dataset.id;
            const status = tr.dataset.status;
            if (isNonSendableStatus(status)) {
                e.target.checked = false;
                selected.delete(id);
                toast('승인/승인대기 상태는 전송 대상에서 제외됩니다.');
                syncHeaderCheck();
                updateSendButtonState();
                return;
            }
            if (e.target.checked) selected.add(id);
            else selected.delete(id);
            syncHeaderCheck();
            updateSendButtonState();
            const card = cards.querySelector(`.card[data-id="${id}"] .card-check`);
            if (card) card.checked = e.target.checked;
        });
    });
}

function bindCardChecks() {
    const tbody = $id('tbody'),
        cards = $id('cards');
    if (!tbody || !cards) return;
    cards.querySelectorAll('.card-check').forEach(chk => {
        chk.addEventListener('click', e => e.stopPropagation());
        chk.addEventListener('change', (e) => {
            const card = e.target.closest('.card');
            const id = card.dataset.id;
            const status = card.dataset.status;
            if (isNonSendableStatus(status)) {
                e.target.checked = false;
                selected.delete(id);
                toast('승인/승인대기 상태는 전송 대상에서 제외됩니다.');
                syncHeaderCheck();
                updateSendButtonState();
                return;
            }
            if (e.target.checked) selected.add(id);
            else selected.delete(id);
            const row = tbody.querySelector(`tr[data-id="${id}"] .row-check`);
            if (row) row.checked = e.target.checked;
            syncHeaderCheck();
            updateSendButtonState();
        });
    });
}

function syncHeaderCheck() {
    const checkAll = $id('checkAll');
    if (!checkAll) return;
    const visible = Array.from(document.querySelectorAll('.card.parking-item'))
        .filter(card => !isNonSendableStatus(card.dataset.status))
        .map(card => card.dataset.id);
    const allChecked = visible.length > 0 && visible.every(id => selected.has(id));
    checkAll.checked = allChecked;
    checkAll.indeterminate = !allChecked && visible.some(id => selected.has(id));
    checkAll.disabled = visible.length === 0;
}

(function () {
    const checkAll = $id('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', () => {
            const tbody = $id('tbody'),
                cards = $id('cards');
            if (!tbody || !cards) return;
            const visible = Array.from(document.querySelectorAll('.card.parking-item'))
                .filter(card => !isNonSendableStatus(card.dataset.status))
                .map(card => card.dataset.id);
            if (checkAll.checked) visible.forEach(id => selected.add(id));
            else visible.forEach(id => selected.delete(id));
            tbody.querySelectorAll('.row-check').forEach(chk => {
                const id = chk.closest('tr').dataset.id;
                const blocked = isNonSendableStatus(chk.closest('tr').dataset.status);
                chk.checked = !blocked && selected.has(id);
            });
            cards.querySelectorAll('.card-check').forEach(chk => {
                const card = chk.closest('.card');
                const id = card?.dataset?.id;
                const blocked = isNonSendableStatus(card?.dataset?.status);
                chk.checked = !blocked && selected.has(id);
            });
            syncHeaderCheck();
            updateSendButtonState();
        });
    }
})();

/* =========================
   CSV 내보내기
   ========================= */
async function exportCSV() {
    try {
        const formData = getSearchParams();
        const params = new URLSearchParams({
            ...formData,
            page: 1,
            size: 9999999
        });

        toast('CSV 파일을 생성하는 중입니다...');

        const response = await fetch(withBase('/prk/parking-data?' + params.toString()), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success === false) {
            throw new Error(data.message || '데이터 조회 실패');
        }

        const exportData = (data.list || []).map(item => ({
            prkplceNm: item.prkplceNm || '',
            prkPlceType: item.prkPlceType || '',
            prgsStsCd: item.prgsStsCd || '',
            sidoNm: item.sidoNm || '',
            sigunguNm: item.sigunguNm || '',
            lgalEmdNm: item.lgalEmdNm || '',
            dtadd: item.dtadd || '',
            prkPlceManageNo: item.prkPlceManageNo || item.manageNo || '',
            zip: item.zip || '',
            userNm: item.userNm || ''
        }));

        if (exportData.length === 0) {
            toast('내보낼 데이터가 없습니다.');
            return;
        }

        const header = [
            '순번', '관리번호', '주차장명', '주차장구분', '진행상태',
            '시도', '시군구', '읍면동', '상세주소', '우편번호', '사용자명'
        ];

        const rows = exportData.map((item, idx) => [
            idx + 1,
            item.prkPlceManageNo,
            item.prkplceNm,
            item.prkPlceType,
            FormatUtils.getStatusText(item.prgsStsCd),
            item.sidoNm,
            item.sigunguNm,
            item.lgalEmdNm,
            item.dtadd,
            item.zip,
            item.userNm
        ]);

        const csv = [header, ...rows].map(cols =>
            cols.map(v => {
                const s = String(v ?? '').replace(/"/g, '""');
                return /[",\n\r]/.test(s) ? `"${s}"` : s;
            }).join(',')
        ).join('\n');

        Download.downloadCSV(csv, `parking_list_${FormatUtils.getCurrentDateString()}.csv`);

        toast(`CSV 내보내기 완료 (${exportData.length}건)`);

    } catch (error) {
        console.error('CSV 내보내기 실패:', error);
        toast('CSV 내보내기 실패: ' + error.message);
    }
}

async function sendSelected() {
    const checkedValues = syncSelectedFromDOM();
    const filteredValues = checkedValues.filter(id => {
        const rec = DATA.find(p => p.manageNo === id);
        const statusCode = normalizeStatus(rec?.status || rec?.statusNm);
        return rec && !isNonSendableStatus(statusCode);
    });

    if (filteredValues.length !== checkedValues.length) {
        toast('승인/승인대기 상태는 전송 대상에서 자동 제외됩니다.');
    }

    if (filteredValues.length === 0) {
        toast('전송할 항목이 없습니다. (선택 0)');
        return;
    }

    const parkingList = filteredValues.map(manageNo => {
        const parking = DATA.find(p => p.manageNo === manageNo);
        return {
            prkPlceManageNo: manageNo,
            prkPlceInfoSn: parking?.prkPlceInfoSn || null
        };
    }).filter(item => item.prkPlceInfoSn !== null);

    if (parkingList.length === 0) {
        toast('❌ 유효한 주차장 정보가 없습니다.');
        return;
    }

    showConfirmModal({
        title: '전송 확인',
        message: `선택한 ${filteredValues.length}개의 주차장을 승인 대기 상태로 변경하시겠습니까?`,
        confirmText: '확인',
        cancelText: '취소',
        onConfirm: async () => {
            try {
                toast('전송 중...');
                const res = await fetch(withBase('/prk/api/parking/update-status-pending'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        selectedPrk: checkedValues,
                        parkingList: parkingList
                    })
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} ${res.statusText}`);
                }

                const result = await res.json();

                if (result.success) {
                    toast(`✅ ${result.updatedCount}개 주차장 상태가 승인 대기로 변경되었습니다.`);

                    // 체크박스 자동 해제
                    selected.clear();
                    const checkAll = $id('checkAll');
                    if (checkAll) {
                        checkAll.checked = false;
                        checkAll.indeterminate = false;
                    }
                    document.querySelectorAll('input[name="selectedPrk"]').forEach(chk => {
                        chk.checked = false;
                    });
                    updateSendButtonState();

                    // 데이터 새로고침
                    await loadDataFromServer();
                } else {
                    toast('❌ ' + (result.message || '전송 실패'));
                }

            } catch (err) {
                console.error('전송 오류:', err);
                toast('❌ 전송 실패: ' + (err?.message || err));
            }
        }
    });
}

/* =========================
   상단 탭 엔진
   ========================= */
function getTabHost() {
    return Tabs.getTabHost ? Tabs.getTabHost() : {tabBar: $one('.tabs'), panelsWrap: $one('.tab-panels')};
}

function getOpenCountTop() {
    return Tabs.getOpenCountTop ? Tabs.getOpenCountTop() : 0;
}

function activateTop(tabId) {
    Tabs.activateTop && Tabs.activateTop(tabId);
}

function ensureDetailTabTop(rec) {
    Tabs.ensureDetailTabTop && Tabs.ensureDetailTabTop(rec, {maxTabs: MAX_DETAIL_TABS});
}

function closeTop(btn) {
    Tabs.closeTop && Tabs.closeTop(btn);
}

function bindOpenDetailHandlers(pageRows) {
    const tbody = $id('tbody'), cards = $id('cards');
    if (!tbody || !cards) return;

    tbody.onclick = (e) => {
        if (e.target.closest('input,button,label,a')) return;
        const tr = e.target.closest('tr');
        if (!tr) return;
        const id = tr.dataset.id;
        const infoSn = tr.dataset.infoSn;
        const rec = pageRows.find(r => r.manageNo === id && String(r.prkPlceInfoSn ?? '') === infoSn);
        if (rec) {
            if (!rec.manageNo || !rec.prkPlceInfoSn) {
                toast('관리번호/정보일련번호가 없어 상세를 열 수 없습니다.');
                return;
            }
            ensureDetailTabTop(rec);
        }
    };

    cards.onclick = (e) => {
        if (e.target.closest('input,button,label,a')) return;
        const card = e.target.closest('.card');
        if (!card) return;
        const id = card.dataset.id;
        const infoSn = card.dataset.infoSn;
        const rec = pageRows.find(r => r.manageNo === id && String(r.prkPlceInfoSn ?? '') === infoSn);
        if (rec) {
            if (!rec.manageNo || !rec.prkPlceInfoSn) {
                toast('관리번호/정보일련번호가 없어 상세를 열 수 없습니다.');
                return;
            }
            ensureDetailTabTop(rec);
        }
    };
}

function resizeDetail() {
    Tabs.resizeDetail && Tabs.resizeDetail();
}

function initHybridBindings() {
    Tabs.initHybridBindings && Tabs.initHybridBindings();
}

function resetSearchForm() {
    const form = $id('searchForm');
    if (!form) return;

    form.reset();

    const selectElements = [
        'sido', 'sigungu', 'emd', 'prkType', 'status'
    ];

    selectElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.selectedIndex = 0;
            if (id === 'sigungu' || id === 'emd') {
                element.disabled = true;
                element.innerHTML = '<option value="">전체</option>';
            }
        }
    });

    currentPage = 1;
    loadDataFromServer();

}

window.goBackToMap = function () {
    window.location.href = withBase('/gis/parkingmap');
};

function checkMapReturn() {
    const isFromMap = sessionStorage.getItem('parkingMapReturn');
    const backButton = document.getElementById('mapBackButton');

    if (isFromMap === 'true' && backButton) {
        backButton.style.display = 'block';
    }
}

async function loadAndOpenParkingDetail(prkPlceManageNo, prkPlceType, prkPlceInfoSn) {
    try {

        if (!prkPlceManageNo || !prkPlceInfoSn) {
            throw new Error('prkPlceManageNo 혹은 prkPlceInfoSn이 없습니다.');
        }

        const rec = {
            nm: prkPlceManageNo,
            type: prkPlceType || '',
            status: '',
            sido: '',
            sigungu: '',
            emd: '',
            addr: '',
            manageNo: prkPlceManageNo,
            prkPlceInfoSn
        };

        ensureDetailTabTop(rec);

    } catch (error) {
        console.error('❌ 주차장 상세 정보 조회 실패:', error);
        toast('주차장 정보를 불러올 수 없습니다: ' + error.message);
    }
}

/* =========================
   신규 주차장 추가 - 타입 선택 모달
   ========================= */
function handleAddNewParking() {

    const modalHTML = `
        <div id="parkingTypeModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 12px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="
                    margin: 0 0 24px 0;
                    font-size: 1.5rem;
                    color: #1e293b;
                    text-align: center;
                ">주차장 유형 선택</h2>
                
                <div style="
                    display: grid;
                    gap: 12px;
                    margin-bottom: 24px;
                ">
                    <button type="button" class="parking-type-option" data-type="onparking" style="
                        padding: 20px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #334155;
                    ">
                        🅿️ 노상 주차장
                    </button>
                    
                    <button type="button" class="parking-type-option" data-type="offparking" style="
                        padding: 20px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #334155;
                    ">
                        🏢 노외 주차장
                    </button>
                    
                    <button type="button" class="parking-type-option" data-type="buildparking" style="
                        padding: 20px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #334155;
                    ">
                        🏗️ 부설 주차장
                    </button>
                </div>
                
                <div style="text-align: center;">
                    <button type="button" id="cancelTypeSelection" style="
                        padding: 12px 32px;
                        border: 1px solid #cbd5e1;
                        border-radius: 6px;
                        background: white;
                        color: #64748b;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: all 0.2s;
                    ">취소</button>
                </div>
            </div>
        </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);

    const buttons = document.querySelectorAll('.parking-type-option');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.style.borderColor = '#3b82f6';
            this.style.background = '#eff6ff';
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function () {
            this.style.borderColor = '#e2e8f0';
            this.style.background = 'white';
            this.style.transform = 'translateY(0)';
        });

        btn.addEventListener('click', function () {
            const type = this.dataset.type;
            openNewParkingTab(type);
            closeTypeModal();
        });
    });

    const cancelBtn = document.getElementById('cancelTypeSelection');
    if (cancelBtn) {
        cancelBtn.addEventListener('mouseenter', function () {
            this.style.background = '#f1f5f9';
        });
        cancelBtn.addEventListener('mouseleave', function () {
            this.style.background = 'white';
        });
        cancelBtn.addEventListener('click', closeTypeModal);
    }

    const modal = document.getElementById('parkingTypeModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeTypeModal();
            }
        });
    }
}

function closeTypeModal() {
    const modal = document.getElementById('parkingTypeModal');
    if (modal) {
        modal.remove();
    }
}

function openNewParkingTab(type) {

    const {tabBar, panelsWrap} = getTabHost();
    if (!tabBar || !panelsWrap) {
        toast('탭 영역을 찾을 수 없습니다.');
        return;
    }

    const typeMap = {
        'onparking': {url: withBase('/prk/onparking'), name: '노상 주차장 신규 등록', icon: '🅿️'},
        'offparking': {url: withBase('/prk/offparking'), name: '노외 주차장 신규 등록', icon: '🏢'},
        'buildparking': {url: withBase('/prk/buildparking'), name: '부설 주차장 신규 등록', icon: '🏗️'}
    };

    const config = typeMap[type];
    if (!config) {
        toast('올바르지 않은 주차장 유형입니다.');
        return;
    }

    const tabId = `tab-new-${type}`;
    const panelId = `panel-new-${type}`;

    if ($id(tabId) && $id(panelId)) {
        activateTop(tabId);
        return;
    }

    if (getOpenCountTop() >= MAX_DETAIL_TABS) {
        toast(`상세 탭은 최대 ${MAX_DETAIL_TABS}개까지 열 수 있습니다.`);
        return;
    }

    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.id = tabId;
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected', 'false');
    btn.innerHTML = `${config.icon} ${config.name} <span class="x" aria-hidden="true">✕</span>`;
    tabBar.appendChild(btn);

    const panel = document.createElement('section');
    panel.className = 'tab-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = true;
    panel.innerHTML = `
        <iframe class="detail-frame" title="${config.name}"
                style="width:100%;border:0;display:block;min-height:420px"
                loading="eager" allow="geolocation"
                sandbox="allow-scripts allow-forms allow-same-origin allow-modals"></iframe>
    `;
    panelsWrap.appendChild(panel);

    const iframe = panel.querySelector('iframe');

    const url = `${config.url}?mode=new`;

    iframe.src = url;
    iframe.addEventListener('load', () => {
        resizeDetail();
    });

    activateTop(tabId);

    toast(`${config.name} 탭이 열렸습니다.`);
}

/* =========================
   초기화
   ========================= */
async function init() {
    $id('panelDetail')?.setAttribute('hidden', '');
    updateSendButtonState();

    checkMapReturn();

    await Promise.all([
        CodeUtils.loadSidoList(),
        CodeUtils.loadParkingTypeList(),
        CodeUtils.loadStatusList()
    ]);

    setupAreaSelectors();

    await loadDataFromServer();

    if (window.parkingDetailParams &&
        window.parkingDetailParams.openDetailId &&
        window.parkingDetailParams.parkingType) {

        const {openDetailId, parkingType, prkPlceInfoSn} = window.parkingDetailParams;

        setTimeout(() => {
            const parking = DATA.find(r => r.manageNo === openDetailId);
            if (parking) {
                ensureDetailTabTop(parking);
            } else {
                console.warn('⚠️ 주차장 데이터를 찾을 수 없음:', openDetailId);
                loadAndOpenParkingDetail(openDetailId, parkingType, prkPlceInfoSn);
            }
        }, 500);
    }

    const {tabBar} = getTabHost();
    if (tabBar && !tabBar.__bound) {
        tabBar.__bound = true;

        $id('tabList')?.addEventListener('click', () => activateTop('tabList'));

        tabBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            if (e.target.closest('.x') && btn.id !== 'tabList') {
                closeTop(btn);
                return;
            }
            activateTop(btn.id);
        });

        tabBar.addEventListener('keydown', (e) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
            const tabs = $all('.tab-btn', tabBar);
            const idx = tabs.findIndex(t => t.classList.contains('active'));
            let next = idx;
            if (e.key === 'ArrowRight') next = Math.min(idx + 1, tabs.length - 1);
            if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
            if (e.key === 'Home') next = 0;
            if (e.key === 'End') next = tabs.length - 1;
            e.preventDefault();
            activateTop(tabs[next].id);
            tabs[next].focus();
        });

        document.addEventListener('click', (e) => {
            const b = e.target.closest('button[data-action="back-to-list"]');
            if (!b) return;
            activateTop('tabList');
        });

        activateTop('tabList');
    }

    $id('searchForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await applyFilter();
    });

    $id('resetBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetSearchForm();
    });

    $id('exportBtn')?.addEventListener('click', exportCSV);
    $id('sendBtn')?.addEventListener('click', sendSelected);
    $id('addNewBtn')?.addEventListener('click', handleAddNewParking);

    window.addEventListener('resize', resizeDetail, {passive: true});
    initHybridBindings();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
