// 공통 코드 관련 함수들
const CodeUtils = {
    // 진행상태 목록 로드
    async loadStatusList() {
        try {
            const response = await fetch('/cmm/codes/status');
            const result = await response.json();

            if (result.success) {
                const statusSelect = document.getElementById('status');
                if (statusSelect) {
                    // 기존 하드코딩된 옵션들을 제거하고 DB 데이터로 교체
                    statusSelect.innerHTML = '<option value="">전체</option>';

                    result.data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.codeCd;
                        option.textContent = item.codeNm;
                        statusSelect.appendChild(option);
                    });
                } else {
                    console.warn('진행상태 select 엘리먼트(id="status")를 찾을 수 없습니다.');
                }
            } else {
                console.error('진행상태 목록 로드 실패:', result.message);
            }
        } catch (error) {
            console.error('진행상태 목록 로드 중 오류:', error);
        }
    },
    // 주차형태 목록 로드
    async loadParkingTypeList() {
        try {
            const response = await fetch('/cmm/codes/parking-type');
            const result = await response.json();

            if (result.success) {
                const prkTypeSelect = document.getElementById('prkType');
                if (prkTypeSelect) {
                    // 기존 하드코딩된 옵션들을 제거하고 DB 데이터로 교체
                    prkTypeSelect.innerHTML = '<option value="">전체</option>';

                    result.data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.codeCd;
                        option.textContent = item.codeNm;
                        prkTypeSelect.appendChild(option);
                    });
                } else {
                    console.warn('주차형태 select 엘리먼트(id="prkType")를 찾을 수 없습니다.');
                }
            } else {
                console.error('주차형태 목록 로드 실패:', result.message);
            }
        } catch (error) {
            console.error('주차형태 목록 로드 중 오류:', error);
        }
    },
    // 시도 목록 로드
    async loadSidoList() {
        try {
            const response = await fetch('/cmm/codes/sido');
            const result = await response.json();
            
            if (result.success) {
                const sidoSelect = document.getElementById('sido');
                sidoSelect.innerHTML = '<option value="">전체</option>';
                
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sidoSelect.appendChild(option);
                });
            } else {
                console.error('시도 목록 로드 실패:', result.message);
            }
        } catch (error) {
            console.error('시도 목록 로드 중 오류:', error);
        }
    },
    
    // 시군구 목록 로드
    async loadSigunguList(sidoCd) {
        try {
            const sigunguSelect = document.getElementById('sigungu');
            const emdSelect = document.getElementById('emd');
            
            // 초기화
            sigunguSelect.innerHTML = '<option value="">전체</option>';
            emdSelect.innerHTML = '<option value="">전체</option>';
            emdSelect.disabled = true;
            
            if (!sidoCd) {
                sigunguSelect.disabled = true;
                return;
            }
            
            const response = await fetch(`/cmm/codes/sigungu?sidoCd=${encodeURIComponent(sidoCd)}`);
            const result = await response.json();
            
            if (result.success) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sigunguSelect.appendChild(option);
                });
                sigunguSelect.disabled = false;
            } else {
                console.error('시군구 목록 로드 실패:', result.message);
                sigunguSelect.disabled = true;
            }
        } catch (error) {
            console.error('시군구 목록 로드 중 오류:', error);
            document.getElementById('sigungu').disabled = true;
        }
    },

    // 읍면동 목록 로드 함수
    async loadEmdList(sigunguCd) {
        try {
            console.log('읍면동 목록 로드 시작, 시군구코드:', sigunguCd);
            
            const emdSelect = document.getElementById('emd');
            if (!emdSelect) {
                console.error('읍면동 select 엘리먼트를 찾을 수 없습니다.');
                return;
            }
            
            emdSelect.innerHTML = '<option value="">전체</option>';
            
            if (!sigunguCd) {
                emdSelect.disabled = true;
                return;
            }
            
            const response = await fetch(`/cmm/codes/emd?sigunguCd=${sigunguCd}`);
            const result = await response.json();
            console.log('읍면동 목록 응답:', result);

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.emdCd;        // emdCd 사용
                    option.textContent = item.lgalEmdNm;  // lgalEmdNm 사용
                    emdSelect.appendChild(option);
                });
                emdSelect.disabled = false;
                console.log('읍면동 목록 로드 완료:', result.data.length + '개');
            } else {
                console.log('읍면동 데이터가 없거나 로드 실패:', result.message);
                emdSelect.disabled = true;
            }
        } catch (error) {
            console.error('읍면동 목록 로드 중 오류:', error);
            const emdSelect = document.getElementById('emd');
            if (emdSelect) emdSelect.disabled = true;
        }
    }
};

// 이벤트 리스너 설정 함수
function setupAreaSelectors() {
    console.log('이벤트 리스너 설정 시작');
    
    const sidoSelect = document.getElementById('sido');
    const sigunguSelect = document.getElementById('sigungu');
    const emdSelect = document.getElementById('emd');

    if (!sidoSelect || !sigunguSelect || !emdSelect) {
        console.error('필요한 select 엘리먼트를 찾을 수 없습니다.');
        return;
    }

    // 시도 선택 시 시군구 목록 로드
    sidoSelect.addEventListener('change', async (e) => {
        const sidoCd = e.target.value;
        console.log('시도 선택됨:', sidoCd);
        await CodeUtils.loadSigunguList(sidoCd);
    });

    // 시군구 선택 시 읍면동 목록 로드
    sigunguSelect.addEventListener('change', async (e) => {
        const sigunguCd = e.target.value;
        console.log('시군구 선택됨:', sigunguCd);
        await CodeUtils.loadEmdList(sigunguCd);
    });
    
    console.log('이벤트 리스너 설정 완료');
}

/* =========================
   실제 서버 API 연동 버전
   ========================= */

// 행정구역 데이터 - 실제로는 서버에서 가져와야 함
const ADM = {
    "서울특별시": {
        "종로구": ["사직동","삼청동","평창동","청운효자동"],
        "마포구": ["아현동","도화동","연남동","상암동"]
    },
    "경기도": {
        "성남시 분당구": ["정자동","수내동","서현동","야탑동"],
        "용인시 수지구": ["풍덕천동","상현동","성복동"]
    },
    "대전광역시": {
        "유성구": ["궁동","봉명동","신성동"],
        "서구": ["둔산동","가수원동","탄방동"]
    }
};

// 서버에서 가져온 실제 데이터를 저장할 변수
let DATA = [];

const MAX_DETAIL_TABS = 8;
const PAGE_SIZE_DEFAULT = 20; // 기본 페이지 크기를 20으로 증가

// 결과 패널에 one-card 플래그가 있으면 1, 아니면 기본값
function getPageSize(){
    return PAGE_SIZE_DEFAULT;
}

/* =========================
   상태/헬퍼
   ========================= */
let currentPage = 1;
let filtered = [];
const selected = new Set();

const $id  = (id) => document.getElementById(id);
const $one = (sel, root=document) => root.querySelector(sel);
const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function toast(msg){
    const t = $id('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 3000);
}

function badgeStatus(s){
    if (s === 'APPROVED' || s === '승인') return '<span class="badge status appr">승인</span>';
    if (s === 'PENDING' || s === '진행중')  return '<span class="badge status pend">진행중</span>';
    if (s === 'REJECTED' || s === '반려') return '<span class="badge status reject">반려</span>';
    if (s === 'TEMP' || s === '임시저장')     return '<span class="badge">임시저장</span>';
    return '<span class="badge">'+s+'</span>';
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
        
        const response = await fetch('/prk/parking-data?' + params.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success !== false) {
            // 서버 데이터를 기존 구조에 맞게 변환
            DATA = (data.list || []).map(item => ({
                nm: item.prkplceNm || '',
                type: item.prkPlceType || '',
                status: item.prgsStsCd || '',
                sido: item.sidoNm || '',
                sigungu: item.sigunguNm || '',
                emd: item.lgalEmdNm || '',
                addr: item.dtadd || '',
                manageNo: item.prkPlceManageNo || item.manageNo || '',
                zip: item.zip || '',
                userNm: item.userNm || ''
            }));
            
            filtered = [...DATA];
            
            // 페이지 정보 업데이트
            if (data.totalCount !== undefined) {
                updateSummary(data.totalCount);
            }
            
            render();
        } else {
            throw new Error(data.message || '데이터 로드 실패');
        }
    } catch (error) {
        console.error('서버 데이터 로드 실패:', error);
        toast('데이터를 불러오는데 실패했습니다: ' + error.message);
        
        // 실패 시 빈 데이터로 렌더링
        DATA = [];
        filtered = [];
        render();
    }
}

// 검색 조건 수집
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

    // 주차형태도 검색 조건에 포함
    const parkingType = document.getElementById('parkingType');
    if (parkingType && parkingType.value) {
        params.parkingType = parkingType.value;
    }

    return params;
}

// 요약 정보 업데이트
function updateSummary(totalCount) {
    const summary = $id('summary');
    if (summary) {
        summary.textContent = `총 ${totalCount.toLocaleString()}건`;
    }
}

/* =========================
   행정구역 셀렉트 (기존 유지)
   ========================= */
/* =========================
   필터/렌더 (서버 연동으로 수정)
   ========================= */
async function applyFilter() {
    currentPage = 1;
    await loadDataFromServer();
}

function render() {
    const tbody = $id('tbody'),
        cards = $id('cards'),
        summary = $id('summary');
    if (!tbody || !cards || summary === null) return;

    // 현재 페이지 데이터 계산
    const total = filtered.length;
    const pageSize = getPageSize();
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > pages) currentPage = pages;
    const start = (currentPage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    // 테이블 렌더링
    tbody.innerHTML = pageRows.map((r, i) => {
        const seq = start + i + 1;
        const checked = selected.has(r.manageNo) ? 'checked' : '';
        return `
      <tr data-id="${ r.manageNo }">
        <td class="num">${ seq }</td>
        <td class="check"><input type="checkbox" class="row-check" ${ checked } aria-label="선택: ${ r.nm }" /></td>
        <td>${ r.type }</td>
        <td>${ badgeStatus(r.status) }</td>
        <td>${ r.sido }</td>
        <td>${ r.sigungu }</td>
        <td>${ r.emd }</td>
        <td><span class="addr">${ r.addr }</span></td>
        <td><strong>${ r.nm }</strong>
          <div class="muted">${ r.manageNo }</div>
        </td>
      </tr>`;
    }).join('');

    // 카드 렌더링
    cards.innerHTML = pageRows.map(r => {
        const checked = selected.has(r.manageNo) ? 'checked' : '';
        return `
      <article class="card" data-id="${ r.manageNo }" aria-label="${ r.nm }">
        <div class="card-head">
          <input type="checkbox" class="card-check" ${ checked } aria-label="선택: ${ r.nm }" />
          <div class="muted">${ r.manageNo }</div>
        </div>
        <div class="name">${ r.nm }</div>
        <div><span class="badge">${ r.type }</span> · ${ badgeStatus(r.status) }</div>
        <div class="muted">${ r.sido } ${ r.sigungu } ${ r.emd }</div>
        <div class="addr">${ r.addr }</div>
      </article>`;
    }).join('');

    renderPager(pages);
    bindRowChecks();
    bindCardChecks();
    bindOpenDetailHandlers(pageRows);
}

function renderPager(pages) {
    const pager = $id('pager');
    if (!pager) return;

    pager.innerHTML = '';
    const makeBtn = (txt, page, disabled, active) => {
        const b = document.createElement('button');
        b.className = 'page-btn' + (active ? ' active' : '');
        b.textContent = txt;
        b.disabled = !!disabled;
        b.addEventListener('click', async () => {
            currentPage = page;
            await loadDataFromServer(); // 서버에서 새로운 페이지 데이터 로드
        });
        return b;
    };
    pager.appendChild(makeBtn('«', 1, currentPage === 1, false));
    pager.appendChild(makeBtn('‹', Math.max(1, currentPage - 1), currentPage === 1, false));
    const span = 3;
    const from = Math.max(1, currentPage - span);
    const to = Math.min(pages, currentPage + span);
    for (let p = from; p <= to; p++) pager.appendChild(makeBtn(String(p), p, false, p === currentPage));
    pager.appendChild(makeBtn('›', Math.min(pages, currentPage + 1), currentPage === pages, false));
    pager.appendChild(makeBtn('»', pages, currentPage === pages, false));
}

/* =========================
   체크박스 동기화 (기존 유지)
   ========================= */
function bindRowChecks() {
    const tbody = $id('tbody'),
        cards = $id('cards');
    if (!tbody || !cards) return;
    tbody.querySelectorAll('.row-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const tr = e.target.closest('tr');
            const id = tr.dataset.id;
            if (e.target.checked) selected.add(id);
            else selected.delete(id);
            syncHeaderCheck();
            const card = cards.querySelector(`.card[data-id="${ id }"] .card-check`);
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
            if (e.target.checked) selected.add(id);
            else selected.delete(id);
            const row = tbody.querySelector(`tr[data-id="${ id }"] .row-check`);
            if (row) row.checked = e.target.checked;
            syncHeaderCheck();
        });
    });
}

function syncHeaderCheck() {
    const tbody = $id('tbody'),
        checkAll = $id('checkAll');
    if (!tbody || !checkAll) return;
    const visible = Array.from(tbody.querySelectorAll('tr')).map(tr => tr.dataset.id);
    const allChecked = visible.length > 0 && visible.every(id => selected.has(id));
    checkAll.checked = allChecked;
    checkAll.indeterminate = !allChecked && visible.some(id => selected.has(id));
}

// 전체 선택 체크박스 바인딩
(function() {
    const checkAll = $id('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', () => {
            const tbody = $id('tbody'),
                cards = $id('cards');
            if (!tbody || !cards) return;
            const visible = Array.from(tbody.querySelectorAll('tr')).map(tr => tr.dataset.id);
            if (checkAll.checked) visible.forEach(id => selected.add(id));
            else visible.forEach(id => selected.delete(id));
            tbody.querySelectorAll('.row-check').forEach(chk => {
                const id = chk.closest('tr').dataset.id;
                chk.checked = selected.has(id);
            });
            visible.forEach(id => {
                const cardChk = cards.querySelector(`.card[data-id="${ id }"] .card-check`);
                if (cardChk) cardChk.checked = selected.has(id);
            });
            syncHeaderCheck();
        });
    }
})();

/* =========================
   CSV 내보내기 (서버 데이터 기반으로 수정)
   ========================= */
async function exportCSV() {
    try {
        // 현재 검색 조건으로 전체 데이터 조회
        const formData = getSearchParams();
        const params = new URLSearchParams({
            ...formData,
            page: 1,
            size: 9999999 // 전체 데이터 조회를 위한 큰 숫자
        });

        // 내보내기 시작 알림
        toast('CSV 파일을 생성하는 중입니다...');

        const response = await fetch('/prk/parking-data?' + params.toString(), {
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

        // CSV 헤더와 데이터 생성
        const header = [
            '순번', '관리번호', '주차장명', '주차장구분', '진행상태',
            '시도', '시군구', '읍면동', '상세주소', '우편번호', '사용자명'
        ];

        const rows = exportData.map((item, idx) => [
            idx + 1,
            item.prkPlceManageNo,
            item.prkplceNm,
            item.prkPlceType,
            getStatusText(item.prgsStsCd), // 상태코드를 한글로 변환
            item.sidoNm,
            item.sigunguNm,
            item.lgalEmdNm,
            item.dtadd,
            item.zip,
            item.userNm
        ]);

        // CSV 문자열 생성
        const csv = [header, ...rows].map(cols =>
            cols.map(v => {
                const s = String(v ?? '').replace(/"/g, '""');
                return /[",\n\r]/.test(s) ? `"${s}"` : s;
            }).join(',')
        ).join('\n');

        // 파일 다운로드
        downloadCSV(csv, `parking_list_${getCurrentDateString()}.csv`);

        toast(`CSV 내보내기 완료 (${exportData.length}건)`);

    } catch (error) {
        console.error('CSV 내보내기 실패:', error);
        toast('CSV 내보내기 실패: ' + error.message);
    }
}

// 상태코드를 한글 텍스트로 변환
function getStatusText(statusCode) {
    // DB에서 가져온 코드에 따라 매핑 (필요시 동적으로 변경 가능)
    const statusMap = {
        '01': '승인',
        '02': '진행중',
        '03': '반려',
        '04': '임시저장'
    };

    return statusMap[statusCode] || statusCode || '-';
}

// 현재 날짜 문자열 생성 (YYYYMMDD 형식)
function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// CSV 파일 다운로드 함수
function downloadCSV(csvString, fileName) {
    const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8;"
    });

    // 표준 다운로드 방식
    if ('download' in document.createElement('a')) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        return;
    }

    // IE 지원
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
        return;
    }

    // 데이터 URL fallback
    try {
        const dataUrl = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvString);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e) {
        toast('이 브라우저에서는 CSV 다운로드를 지원하지 않습니다.');
    }
}

async function sendSelected() {
    if (selected.size === 0) {
        toast('전송할 항목이 없습니다. (선택 0)');
        return;
    }
    const items = DATA.filter(r => selected.has(r.manageNo)).map(r => ({
        manageNo: r.manageNo,
        nm: r.nm,
        type: r.type,
        status: r.status,
        sido: r.sido,
        sigungu: r.sigungu,
        emd: r.emd,
        addr: r.addr
    }));
    try {
        // 실제 전송 API 엔드포인트로 수정
        const res = await fetch('/api/internal/parkings/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items
            })
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(('HTTP ' + res.status + ' ' + res.statusText + ' ' + txt).trim());
        }
        toast('전송 완료 · ' + items.length + '건');
    } catch (err) {
        console.error(err);
        toast('전송 실패: ' + (err?.message || err));
    }
}

/* =========================
   상단 흰색 탭 엔진
   ========================= */

// 상단 흰색 탭 엔진
function getTabHost() {
    return {
        tabBar: $one('.tabs'),
        panelsWrap: $one('.tab-panels')
    };
}

function getOpenCountTop(){
    const { tabBar } = getTabHost(); if (!tabBar) return 0;
    return $all('.tab-btn', tabBar).filter(b=>b.id !== 'tabList').length;
}

function activateTop(tabId){
    const { tabBar, panelsWrap } = getTabHost();
    if (!tabBar || !panelsWrap) return;

    // 버튼 활성화
    $all('.tab-btn', tabBar).forEach(btn=>{
        const active = (btn.id === tabId);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
    });

    // 패널 표시
    $all('.tab-panel', panelsWrap).forEach(p=>{
        const owner = $one(`.tab-btn[aria-controls="${p.id}"]`, tabBar);
        p.hidden = !(owner && owner.id === tabId);
    });

    $id(tabId)?.scrollIntoView({ inline:'nearest', behavior:'smooth' });
    resizeDetail();
}

function ensureDetailTabTop(rec){
    const { tabBar, panelsWrap } = getTabHost();
    if (!tabBar || !panelsWrap){
        toast('상세 탭 영역이 없습니다(.tabs/.tab-panels).');
        return;
    }

    const tabId   = `tab-${rec.manageNo}`;
    const panelId = `panel-${rec.manageNo}`;

    // 이미 있으면 활성화
    if ($id(tabId) && $id(panelId)){ activateTop(tabId); return; }

    // 최대 개수 제한(목록 제외)
    if (getOpenCountTop() >= MAX_DETAIL_TABS){
        toast(`상세 탭은 최대 ${MAX_DETAIL_TABS}개까지 열 수 있습니다.`);
        return;
    }

    // 구분 → 경로 매핑
    const routeMap = { '노상':'/prk/offparking', '노외':'/prk/onparking', '부설':'/prk/buildparking' };
    const path = routeMap[rec.type];

    // 탭 버튼
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.id = tabId;
    btn.type = 'button';
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected','false');
    btn.innerHTML = `${rec.nm} <span class="x" aria-hidden="true">✕</span>`;
    tabBar.appendChild(btn);

    // 상세 패널: iframe만 + 없는 경우 메시지
    const panel = document.createElement('section');
    panel.className = 'tab-panel';
    panel.id = panelId;
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = true;
    panel.innerHTML = `
      <iframe class="detail-frame" title="상세: ${rec.nm}"
              style="width:100%;border:0;display:block;min-height:420px"
              loading="eager" allow="geolocation"
              sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
      <div class="no-page muted" style="padding:12px;display:none">페이지가 없습니다.</div>
    `;
    panelsWrap.appendChild(panel);

    const iframe = panel.querySelector('iframe');
    const noPage = panel.querySelector('.no-page');

    // 매핑이 없으면 곧장 안내문구
    if (!path){
        iframe.remove();
        noPage.style.display = 'block';
        activateTop(tabId);
        return;
    }

    // 쿼리 구성
    const sp = new URLSearchParams({
        id: rec.manageNo, name: rec.nm, status: rec.status,
        sido: rec.sido, sigungu: rec.sigungu, emd: rec.emd, addr: rec.addr
    });
    const url = `${path}?${sp.toString()}`;

    // 페이지 존재 여부 확인(HEAD). 없으면 안내문구로 대체
    fetch(url, { method:'HEAD' })
        .then(res => res.ok)
        .catch(()=>false)
        .then(ok=>{
            if (ok){
                iframe.src = url;
                iframe.addEventListener('load', ()=>{ resizeDetail(); });
            }else{
                iframe.remove();
                noPage.style.display = 'block';
            }
        });

    activateTop(tabId);
}

function closeTop(btn){
    if (!btn || btn.id === 'tabList') return;
    const panelId = btn.getAttribute('aria-controls');
    const panel = $id(panelId);
    const wasActive = btn.classList.contains('active');
    btn.remove();
    panel?.remove();
    if (wasActive){
        const { tabBar } = getTabHost();
        const all = $all('.tab-btn', tabBar);
        const fallback = all[all.length - 1] || $id('tabList');
        fallback && activateTop(fallback.id);
    }
    if (getOpenCountTop() === 0) activateTop('tabList');
}

/* =========================
   목록/카드 → 상세 탭 열기
   ========================= */
function bindOpenDetailHandlers(pageRows){
    const tbody = $id('tbody'), cards = $id('cards');
    if (!tbody || !cards) return;

    tbody.onclick = (e)=>{
        if (e.target.closest('input,button,label,a')) return;
        const tr = e.target.closest('tr'); if (!tr) return;
        const id = tr.dataset.id;
        const rec = pageRows.find(r=>r.manageNo===id);
        if (rec) ensureDetailTabTop(rec);
    };

    cards.onclick = (e)=>{
        if (e.target.closest('input,button,label,a')) return;
        const card = e.target.closest('.card'); if (!card) return;
        const id = card.dataset.id;
        const rec = pageRows.find(r=>r.manageNo===id);
        if (rec) ensureDetailTabTop(rec);
    };
}

/* =========================
   크기/하이브리드 바인딩
   ========================= */
function resizeDetail(){
    // 현재 보이는 상세 패널 내 iframe 높이 자동 조절
    const panelsWrap = $one('.tab-panels');
    if (!panelsWrap) return;
    const activeIframe = panelsWrap.querySelector('.tab-panel:not([hidden]) iframe');
    if (!activeIframe) return;

    const top = activeIframe.getBoundingClientRect().top;
    const vh  = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const footerGap = 16;
    const min = Math.max(420, vh - top - footerGap);
    activeIframe.style.minHeight = min + 'px';
}

function initHybridBindings(){
    // 100vh 보정(모바일 주소창 높이 변화 대응)
    const setVh = ()=>{
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        resizeDetail();
    };
    setVh();
    window.addEventListener('resize', setVh, { passive:true });

    // Android 하드웨어 Back (Cordova)
    if (window.cordova){
        document.addEventListener('backbutton', (e)=>{
            e.preventDefault();
            const { tabBar } = getTabHost();
            const opened = $all('.tab-btn', tabBar).filter(b=>b.id!=='tabList');
            if (opened.length){ closeTop(opened[opened.length-1]); }
            else { activateTop('tabList'); }
        }, false);
    }

    // Capacitor Back
    if (window.Capacitor && window.Capacitor.App && window.Capacitor.App.addListener){
        window.Capacitor.App.addListener('backButton', ({canGoBack})=>{
            const { tabBar } = getTabHost();
            const opened = $all('.tab-btn', tabBar).filter(b=>b.id!=='tabList');
            if (opened.length){ closeTop(opened[opened.length-1]); }
            else { activateTop('tabList'); }
        });
    }
}
// 검색 조건 초기화 함수
function resetSearchForm() {
    const form = $id('searchForm');
    if (!form) return;

    // 폼의 모든 입력 필드 초기화
    form.reset();

    // select 요소들을 명시적으로 "전체" 옵션으로 설정
    const selectElements = [
        'sido', 'sigungu', 'emd', 'prkType', 'status'
    ];

    selectElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.selectedIndex = 0; // "전체" 옵션 선택

            // 시군구, 읍면동은 비활성화
            if (id === 'sigungu' || id === 'emd') {
                element.disabled = true;
                element.innerHTML = '<option value="">전체</option>';
            }
        }
    });

    // 검색 결과 초기화
    currentPage = 1;
    loadDataFromServer();

    console.log('검색 조건이 초기화되었습니다.');
}

/* =========================
   초기화 (서버 연동으로 수정)
   ========================= */
async function init(){
    $id('panelDetail')?.setAttribute('hidden','');

    // 공통코드 데이터 로드 (병렬 처리)
    await Promise.all([
        CodeUtils.loadSidoList(),
        CodeUtils.loadParkingTypeList(),
        CodeUtils.loadStatusList()  // 진행상태 로드 추가
    ]);

    // 행정구역 셀렉터 이벤트 리스너 설정
    setupAreaSelectors();

    // 초기 데이터 로드
    await loadDataFromServer();

    const { tabBar } = getTabHost();
    if (tabBar && !tabBar.__bound){
        tabBar.__bound = true;

        $id('tabList')?.addEventListener('click', ()=> activateTop('tabList'));

        tabBar.addEventListener('click', (e)=>{
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            if (e.target.closest('.x') && btn.id !== 'tabList'){ closeTop(btn); return; }
            activateTop(btn.id);
        });

        tabBar.addEventListener('keydown', (e)=>{
            if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
            const tabs = $all('.tab-btn', tabBar);
            const idx = tabs.findIndex(t => t.classList.contains('active'));
            let next = idx;
            if (e.key==='ArrowRight') next = Math.min(idx+1, tabs.length-1);
            if (e.key==='ArrowLeft')  next = Math.max(idx-1, 0);
            if (e.key==='Home')       next = 0;
            if (e.key==='End')        next = tabs.length-1;
            e.preventDefault();
            activateTop(tabs[next].id);
            tabs[next].focus();
        });

        document.addEventListener('click', (e)=>{
            const b = e.target.closest('button[data-action="back-to-list"]');
            if (!b) return;
            activateTop('tabList');
        });

        activateTop('tabList');
    }

    // 폼/버튼 이벤트
    $id('searchForm')?.addEventListener('submit', async (e)=>{ 
        e.preventDefault(); 
        await applyFilter();
    });

    // 초기화 버튼 이벤트 추가
    $id('resetBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetSearchForm();
    });

    $id('exportBtn')?.addEventListener('click', exportCSV);
    $id('sendBtn')?.addEventListener('click', sendSelected);

    window.addEventListener('resize', resizeDetail, { passive:true });
    initHybridBindings();
}

// DOM 준비 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}