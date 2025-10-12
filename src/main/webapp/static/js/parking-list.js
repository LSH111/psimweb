/* =========================
   데모 데이터/행정구역
   ========================= */
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

const DATA = [
    { nm:"중앙공영주차장", type:"노상", status:"APPROVED",  sido:"서울특별시", sigungu:"종로구", emd:"사직동",  addr:"사직로 1",       manageNo:"PRK-0001" },
    { nm:"연남로 노상",     type:"노상", status:"PENDING",   sido:"서울특별시", sigungu:"마포구", emd:"연남동",  addr:"연남로 123",     manageNo:"PRK-0002" },
    { nm:"상암DMC 복합",    type:"부설", status:"TEMP",      sido:"서울특별시", sigungu:"마포구", emd:"상암동",  addr:"월드컵북로 400", manageNo:"PRK-0003" },
    { nm:"분당구청 노외",   type:"노외", status:"APPROVED",  sido:"경기도",     sigungu:"성남시 분당구", emd:"정자동", addr:"분당로 23", manageNo:"PRK-0004" },
    { nm:"서현역 노외",     type:"노외", status:"REJECTED",  sido:"경기도",     sigungu:"성남시 분당구", emd:"서현동", addr:"황새울로 333", manageNo:"PRK-0005" },
    { nm:"수지 성복 부설",   type:"부설", status:"APPROVED",  sido:"경기도",     sigungu:"용인시 수지구", emd:"성복동", addr:"성복로 77",  manageNo:"PRK-0006" },
    { nm:"DCC 노외",        type:"노외", status:"PENDING",   sido:"대전광역시", sigungu:"서구",  emd:"둔산동",  addr:"엑스포로 1",     manageNo:"PRK-0007" },
    { nm:"KAIST 부설",      type:"부설", status:"APPROVED",  sido:"대전광역시", sigungu:"유성구", emd:"궁동",   addr:"대학로 291",    manageNo:"PRK-0008" },
    { nm:"유성 홈플 노상",   type:"노상", status:"TEMP",      sido:"대전광역시", sigungu:"유성구", emd:"봉명동", addr:"온천서로 11",    manageNo:"PRK-0009" },
    { nm:"탄방동 노상",     type:"노상", status:"APPROVED",  sido:"대전광역시", sigungu:"서구",  emd:"탄방동", addr:"문정로 25",     manageNo:"PRK-0010" }
];

const PAGE_SIZE = 6;
const INTERNAL_API = '/api/internal/parkings/submit';
const MAX_DETAIL_TABS = 8;

/* =========================
   상태/헬퍼
   ========================= */
let currentPage = 1;
let filtered = [...DATA];
const selected = new Set();

const $id  = (id) => document.getElementById(id);
const $one = (sel, root=document) => root.querySelector(sel);
const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function toast(msg){
    const t = $id('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2000);
}

function badgeStatus(s){
    if (s === 'APPROVED') return '<span class="badge status appr">승인</span>';
    if (s === 'PENDING')  return '<span class="badge status pend">진행중</span>';
    if (s === 'REJECTED') return '<span class="badge status reject">반려</span>';
    if (s === 'TEMP')     return '<span class="badge">임시저장</span>';
    return '<span class="badge">'+s+'</span>';
}

/* =========================
   행정구역 셀렉트
   ========================= */
function initAdm(){
    const sidoSel = $id('sido'), sggSel = $id('sigungu'), emdSel = $id('emd');
    if (!sidoSel || !sggSel || !emdSel) return;

    Object.keys(ADM).forEach(s => sidoSel.add(new Option(s, s)));

    sidoSel.addEventListener('change', ()=>{
        sggSel.innerHTML = '<option value="">전체</option>';
        emdSel.innerHTML = '<option value="">전체</option>';
        emdSel.disabled = true;
        const s = sidoSel.value;
        if(!s){ sggSel.disabled = true; return; }
        sggSel.disabled = false;
        Object.keys(ADM[s]).forEach(g => sggSel.add(new Option(g, g)));
    });

    sggSel.addEventListener('change', ()=>{
        emdSel.innerHTML = '<option value="">전체</option>';
        const s = sidoSel.value, g = sggSel.value;
        if(!g){ emdSel.disabled = true; return; }
        emdSel.disabled = false;
        ADM[s][g].forEach(e => emdSel.add(new Option(e, e)));
    });
}

/* =========================
   필터/렌더
   ========================= */
function applyFilter(){
    const f = {
        sido: $id('sido')?.value.trim() || '',
        sgg:  $id('sigungu')?.value.trim() || '',
        emd:  $id('emd')?.value.trim() || '',
        nm:   $id('prkNm')?.value.trim() || '',
        type: $id('prkType')?.value.trim() || '',
        st:   $id('status')?.value.trim() || '',
        ad:   $id('addr')?.value.trim() || ''
    };

    filtered = DATA.filter(r=>{
        if (f.sido && r.sido !== f.sido) return false;
        if (f.sgg  && r.sigungu !== f.sgg) return false;
        if (f.emd  && r.emd !== f.emd) return false;
        if (f.nm   && r.nm.indexOf(f.nm) === -1) return false;
        if (f.type && r.type !== f.type) return false;
        if (f.st   && r.status !== f.st) return false;
        if (f.ad   && String(r.addr).indexOf(f.ad) === -1) return false;
        return true;
    });
    currentPage = 1;
    render();
}

function render(){
    const tbody = $id('tbody'), cards = $id('cards'), summary = $id('summary');
    if (!tbody || !cards || !summary) return;

    summary.textContent = '총 ' + filtered.length + '건';

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > pages) currentPage = pages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);

    // 테이블
    tbody.innerHTML = pageRows.map((r,i)=>{
        const seq = start + i + 1;
        const checked = selected.has(r.manageNo) ? 'checked' : '';
        return `
      <tr data-id="${r.manageNo}">
        <td class="num">${seq}</td>
        <td class="check"><input type="checkbox" class="row-check" ${checked} aria-label="선택: ${r.nm}" /></td>
        <td>${r.type}</td>
        <td>${badgeStatus(r.status)}</td>
        <td>${r.sido}</td>
        <td>${r.sigungu}</td>
        <td>${r.emd}</td>
        <td><span class="addr">${r.addr}</span></td>
        <td><strong>${r.nm}</strong><div class="muted">${r.manageNo}</div></td>
      </tr>`;
    }).join('');

    // 카드
    cards.innerHTML = pageRows.map(r=>{
        const checked = selected.has(r.manageNo) ? 'checked' : '';
        return `
      <article class="card" data-id="${r.manageNo}" aria-label="${r.nm}">
        <div class="card-head">
          <input type="checkbox" class="card-check" ${checked} aria-label="선택: ${r.nm}" />
          <div class="muted">${r.manageNo}</div>
        </div>
        <div class="name">${r.nm}</div>
        <div><span class="badge">${r.type}</span> · ${badgeStatus(r.status)}</div>
        <div class="muted">${r.sido} ${r.sigungu} ${r.emd}</div>
        <div class="addr">${r.addr}</div>
      </article>`;
    }).join('');

    renderPager(pages);
    bindRowChecks();
    bindCardChecks();
    bindOpenDetailHandlers(pageRows);
}

function renderPager(pages){
    const pager = $id('pager'); if (!pager) return;
    pager.innerHTML = '';
    const makeBtn = (txt, page, disabled, active)=>{
        const b = document.createElement('button');
        b.className = 'page-btn' + (active ? ' active' : '');
        b.textContent = txt;
        b.disabled = !!disabled;
        b.addEventListener('click', ()=>{ currentPage = page; render(); });
        return b;
    };
    pager.appendChild(makeBtn('«', 1, currentPage === 1, false));
    pager.appendChild(makeBtn('‹', Math.max(1, currentPage - 1), currentPage === 1, false));
    const span = 3;
    const from = Math.max(1, currentPage - span);
    const to   = Math.min(pages, currentPage + span);
    for (let p = from; p <= to; p++) pager.appendChild(makeBtn(String(p), p, false, p===currentPage));
    pager.appendChild(makeBtn('›', Math.min(pages, currentPage + 1), currentPage === pages, false));
    pager.appendChild(makeBtn('»', pages, currentPage === pages, false));
}

/* =========================
   체크박스 동기화
   ========================= */
function bindRowChecks(){
    const tbody = $id('tbody'), cards = $id('cards'); if (!tbody || !cards) return;
    tbody.querySelectorAll('.row-check').forEach(chk=>{
        chk.addEventListener('change', (e)=>{
            const tr = e.target.closest('tr'); const id = tr.dataset.id;
            if (e.target.checked) selected.add(id); else selected.delete(id);
            syncHeaderCheck();
            const card = cards.querySelector(`.card[data-id="${id}"] .card-check`);
            if (card) card.checked = e.target.checked;
        });
    });
}
function bindCardChecks(){
    const tbody = $id('tbody'), cards = $id('cards'); if (!tbody || !cards) return;
    cards.querySelectorAll('.card-check').forEach(chk=>{
        chk.addEventListener('click', e=>e.stopPropagation());
        chk.addEventListener('change', (e)=>{
            const card = e.target.closest('.card'); const id = card.dataset.id;
            if (e.target.checked) selected.add(id); else selected.delete(id);
            const row = tbody.querySelector(`tr[data-id="${id}"] .row-check`);
            if (row) row.checked = e.target.checked;
            syncHeaderCheck();
        });
    });
}
function syncHeaderCheck(){
    const tbody = $id('tbody'), checkAll = $id('checkAll'); if (!tbody || !checkAll) return;
    const visible = Array.from(tbody.querySelectorAll('tr')).map(tr=>tr.dataset.id);
    const allChecked = visible.length > 0 && visible.every(id=>selected.has(id));
    checkAll.checked = allChecked;
    checkAll.indeterminate = !allChecked && visible.some(id=>selected.has(id));
}
(function(){
    const checkAll = $id('checkAll');
    if (checkAll){
        checkAll.addEventListener('change', ()=>{
            const tbody = $id('tbody'), cards = $id('cards'); if (!tbody || !cards) return;
            const visible = Array.from(tbody.querySelectorAll('tr')).map(tr=>tr.dataset.id);
            if (checkAll.checked) visible.forEach(id=>selected.add(id)); else visible.forEach(id=>selected.delete(id));
            tbody.querySelectorAll('.row-check').forEach(chk=>{
                const id = chk.closest('tr').dataset.id; chk.checked = selected.has(id);
            });
            visible.forEach(id=>{
                const cardChk = cards.querySelector(`.card[data-id="${id}"] .card-check`);
                if (cardChk) cardChk.checked = selected.has(id);
            });
            syncHeaderCheck();
        });
    }
})();

/* =========================
   CSV/전송 (하이브리드 호환)
   ========================= */
function exportCSV(){
    const header = ['순번','관리번호','주차장구분','진행상태','시도','시군구','읍면동','상세주소','주차장명'];
    const rows = filtered.map((r, idx)=>[
        idx + 1, r.manageNo, r.type,
        (r.status === 'APPROVED' ? '승인' :
            r.status === 'PENDING'  ? '진행중' :
                r.status === 'REJECTED' ? '반려' :
                    r.status === 'TEMP'     ? '임시저장' : r.status),
        r.sido, r.sigungu, r.emd, r.addr, r.nm
    ]);
    const csv = [header, ...rows].map(cols =>
        cols.map(v=>{
            const s = String(v ?? '').replace(/"/g,'""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
        }).join(',')
    ).join('\n');

    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
    const fileName = 'parking_list.csv';

    // 표준 다운로드
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    if ('download' in a){
        a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(a.href);
        return;
    }

    // Web Share API
    if (navigator.share && navigator.canShare){
        try{
            const file = new File([blob], fileName, { type: blob.type });
            if (navigator.canShare({ files: [file] })){
                navigator.share({ files:[file], title:fileName }).catch(()=>{});
                return;
            }
        }catch(_){}
    }

    // data: URL fallback
    try{
        const dataUrl = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
        window.location.href = dataUrl;
    }catch(e){
        toast('이 기기에서는 CSV 저장을 지원하지 않습니다.');
    }
}

async function sendSelected(){
    if (selected.size === 0){ toast('전송할 항목이 없습니다. (선택 0)'); return; }
    const items = DATA.filter(r=>selected.has(r.manageNo)).map(r=>({
        manageNo:r.manageNo, nm:r.nm, type:r.type, status:r.status,
        sido:r.sido, sigungu:r.sigungu, emd:r.emd, addr:r.addr
    }));
    try{
        const res = await fetch(INTERNAL_API, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({items})
        });
        if (!res.ok){
            const txt = await res.text().catch(()=> '');
            throw new Error(('HTTP '+res.status+' '+res.statusText+' '+txt).trim());
        }
        toast('전송 완료 · ' + items.length + '건');
    }catch(err){
        console.error(err);
        toast('전송 실패: ' + (err?.message || err));
    }
}

/* =========================
   상단 흰색 탭 엔진 (.tabs / .tab-panels)
   ========================= */
function getTabHost(){
    return {
        tabBar:     $one('.tabs'),        // 상단 흰색 탭바(이미 JSP에 있음)
        panelsWrap: $one('.tab-panels')   // 패널 래퍼(이미 JSP에 있음)
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

/* =========================
   초기화
   ========================= */
function init(){
    // 하단 panelDetail은 사용하지 않음(디자인 유지용으로만 존재) → 숨김
    $id('panelDetail')?.setAttribute('hidden','');

    initAdm();
    applyFilter();

    // 탭바 동작 바인딩(1회)
    const { tabBar } = getTabHost();
    if (tabBar && !tabBar.__bound){
        tabBar.__bound = true;

        // 목록 탭
        $id('tabList')?.addEventListener('click', ()=> activateTop('tabList'));

        // 탭 클릭/닫기
        tabBar.addEventListener('click', (e)=>{
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            if (e.target.closest('.x') && btn.id !== 'tabList'){ closeTop(btn); return; }
            activateTop(btn.id);
        });

        // 키보드 네비
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

        // 상세 내부 "목록 보기"
        document.addEventListener('click', (e)=>{
            const b = e.target.closest('button[data-action="back-to-list"]');
            if (!b) return;
            activateTop('tabList');
        });

        // 초기 활성
        activateTop('tabList');
    }

    // 폼/버튼
    $id('searchForm')?.addEventListener('submit', (e)=>{ e.preventDefault(); applyFilter(); });
    $id('resetBtn')?.addEventListener('click', ()=>{
        const sggSel = $id('sigungu'), emdSel = $id('emd');
        $id('searchForm')?.reset();
        if (sggSel){ sggSel.innerHTML = '<option value="">전체</option>'; sggSel.disabled = true; }
        if (emdSel){ emdSel.innerHTML = '<option value="">전체</option>'; emdSel.disabled = true; }
        filtered = [...DATA]; currentPage = 1; render();
        selected.clear(); syncHeaderCheck();
    });
    $id('exportBtn')?.addEventListener('click', exportCSV);
    $id('sendBtn')?.addEventListener('click', sendSelected);

    // 리사이즈
    window.addEventListener('resize', resizeDetail, { passive:true });

    // 하이브리드 바인딩
    initHybridBindings();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();