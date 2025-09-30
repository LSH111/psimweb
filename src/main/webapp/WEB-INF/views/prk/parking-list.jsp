<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <jsp:include page="/WEB-INF/views/fragments/_head.jspf"/>
  <title>주차장 목록</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/parking-list.css"/>
</head>
<body>
  <jsp:include page="/WEB-INF/views/fragments/_header.jspf"/>
  <main class="main container">
    <div class="card">
      <div class="wrap">
    <h1 class="title">주차장 실태 관리 목록</h1>
    <p class="sub">모바일/아이패드: 카드 전용 · 데스크톱: 테이블/카드 자동 전환 · 탭(목록/상세)</p>

    <!-- 검색 패널 -->
    <section class="panel" aria-label="검색 조건">
      <form id="searchForm">
        <div class="filters">
          <div>
            <label for="sido">시도</label>
            <div class="control">
              <select id="sido" name="sido">
                <option value="">전체</option>
              </select>
            </div>
          </div>

          <div>
            <label for="sigungu">시군구</label>
            <div class="control">
              <select id="sigungu" name="sigungu" disabled>
                <option value="">전체</option>
              </select>
            </div>
          </div>

          <div>
            <label for="emd">읍면동</label>
            <div class="control">
              <select id="emd" name="emd" disabled>
                <option value="">전체</option>
              </select>
            </div>
          </div>

          <div>
            <label for="prkNm">주차장명</label>
            <div class="control">
              <input id="prkNm" name="prkNm" type="text" placeholder="예) 중앙공영주차장" />
            </div>
          </div>

          <div>
            <label for="prkType">주차장형태</label>
            <div class="control">
              <select id="prkType" name="prkType">
                <option value="">전체</option>
                <option>노상</option>
                <option>노외</option>
                <option>부설</option>
              </select>
            </div>
          </div>

          <div>
            <label for="status">진행상태</label>
            <div class="control">
              <select id="status" name="status">
                <option value="">전체</option>
                <option value="APPROVED">승인</option>
                <option value="PENDING">진행중</option>
                <option value="REJECTED">반려</option>
                <option value="TEMP">임시저장</option>
              </select>
            </div>
          </div>

          <div class="span2">
            <label for="addr">상세주소</label>
            <div class="control">
              <input id="addr" name="addr" type="text" placeholder="도로명/지번 등 일부를 입력" />
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="btn">검색</button>
          <button type="button" id="resetBtn" class="btn ghost">초기화</button>
          <button type="button" id="exportBtn" class="btn sec">CSV 내보내기</button>
          <!-- 추가: 선택 전송 -->
          <button type="button" id="sendBtn" class="btn">선택 전송</button>
          <span class="right muted" id="hint">데모 데이터 기반 클라이언트 필터링</span>
        </div>
      </form>
    </section>

    <!-- 결과/탭 -->
    <section class="result-panel">
      <div class="summary" id="summary">총 0건</div>

      <div class="tabs" role="tablist" aria-label="목록/상세">
        <button id="tabList" class="tab-btn active" role="tab" aria-controls="panelList" aria-selected="true">목록</button>
        <button id="tabDetail" class="tab-btn" role="tab" aria-controls="panelDetail" aria-selected="false">상세</button>
      </div>

      <div class="tab-panels">
        <!-- 목록 패널 -->
        <div id="panelList" class="tab-panel" role="tabpanel" aria-labelledby="tabList">
          <!-- 카드 (모바일/아이패드) -->
          <div id="cards" class="cards" aria-label="검색 결과 - 카드 목록"></div>

          <!-- 테이블 (데스크톱) -->
          <div class="table-wrap" aria-label="검색 결과 - 테이블">
            <table>
              <thead>
                <tr>
                  <th style="width:64px" class="num">순번</th>
                  <th style="width:60px" class="check">
                    <input id="checkAll" type="checkbox" aria-label="현재 페이지 전체 선택" />
                  </th>
                  <th style="width:10%">주차장구분</th>
                  <th style="width:10%">진행상태</th>
                  <th style="width:12%">시도</th>
                  <th style="width:12%">시군구</th>
                  <th style="width:12%">읍면동</th>
                  <th>상세주소</th>
                  <th style="width:18%">주차장명</th>
                </tr>
              </thead>
              <tbody id="tbody"></tbody>
            </table>
          </div>

          <div id="pager" class="pager" role="navigation" aria-label="페이지네이션"></div>
        </div>

        <!-- 상세 패널 -->
        <div id="panelDetail" class="tab-panel detail-wrap" role="tabpanel" aria-labelledby="tabDetail" hidden>
          <iframe id="detailFrame" allow="geolocation" title="상세보기"></iframe>
        </div>
      </div>
    </section>
  </div>

  <!-- 토스트 -->
  <div id="toast" class="toast" role="status" aria-live="polite"></div>

<script>
/** ====== 데모 데이터/행정구역 ====== */
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
  {nm:"중앙공영주차장", type:"노상", status:"APPROVED", sido:"서울특별시", sigungu:"종로구", emd:"사직동", addr:"사직로 1", manageNo:"PRK-0001"},
  {nm:"연남로 노상", type:"노상", status:"PENDING",  sido:"서울특별시", sigungu:"마포구", emd:"연남동", addr:"연남로 123", manageNo:"PRK-0002"},
  {nm:"상암DMC 복합", type:"부설", status:"TEMP",    sido:"서울특별시", sigungu:"마포구", emd:"상암동", addr:"월드컵북로 400", manageNo:"PRK-0003"},
  {nm:"분당구청 노외", type:"노외", status:"APPROVED",sido:"경기도", sigungu:"성남시 분당구", emd:"정자동", addr:"분당로 23", manageNo:"PRK-0004"},
  {nm:"서현역 노외",  type:"노외", status:"REJECTED",sido:"경기도", sigungu:"성남시 분당구", emd:"서현동", addr:"황새울로 333", manageNo:"PRK-0005"},
  {nm:"수지 성복 부설", type:"부설", status:"APPROVED",sido:"경기도", sigungu:"용인시 수지구", emd:"성복동", addr:"성복로 77", manageNo:"PRK-0006"},
  {nm:"DCC 노외",     type:"노외", status:"PENDING",  sido:"대전광역시", sigungu:"서구", emd:"둔산동", addr:"엑스포로 1", manageNo:"PRK-0007"},
  {nm:"KAIST 부설",   type:"부설", status:"APPROVED", sido:"대전광역시", sigungu:"유성구", emd:"궁동", addr:"대학로 291", manageNo:"PRK-0008"},
  {nm:"유성 홈플 노상", type:"노상", status:"TEMP",   sido:"대전광역시", sigungu:"유성구", emd:"봉명동", addr:"온천서로 11", manageNo:"PRK-0009"},
  {nm:"탄방동 노상",  type:"노상", status:"APPROVED", sido:"대전광역시", sigungu:"서구", emd:"탄방동", addr:"문정로 25", manageNo:"PRK-0010"},
];

const PAGE_SIZE = 6;
const INTERNAL_API = '/api/internal/parkings/submit'; // TODO: 실제 내부 API 엔드포인트로 교체

/* ====== 엘리먼트 ====== */
const $ = (s)=>document.querySelector(s);
const form = $('#searchForm');
const sidoSel = $('#sido');
const sggSel  = $('#sigungu');
const emdSel  = $('#emd');
const prkNm   = $('#prkNm');
const prkType = $('#prkType');
const status  = $('#status');
const addr    = $('#addr');

const tbody = $('#tbody');
const cards = $('#cards');
const pager = $('#pager');
const summary = $('#summary');
const checkAll = $('#checkAll');

const resetBtn = $('#resetBtn');
const exportBtn = $('#exportBtn');
const sendBtn = $('#sendBtn');

const tabListBtn = $('#tabList');
const tabDetailBtn = $('#tabDetail');
const panelList = $('#panelList');
const panelDetail = $('#panelDetail');
const detailFrame = $('#detailFrame');

const toast = $('#toast');

let currentPage = 1;
let filtered = [...DATA];
const selected = new Set();

/** ===== 행정구역 셀렉트 구성 ===== */
function initAdm(){
  Object.keys(ADM).forEach(sido=>{
    sidoSel.add(new Option(sido, sido));
  });

  sidoSel.addEventListener('change', ()=>{
    sggSel.innerHTML = '<option value="">전체</option>';
    emdSel.innerHTML = '<option value="">전체</option>';
    emdSel.disabled = true;

    const s = sidoSel.value;
    if(!s){ sggSel.disabled = true; return; }
    sggSel.disabled = false;
    Object.keys(ADM[s]).forEach(sgg=>{
      sggSel.add(new Option(sgg, sgg));
    });
  });

  sggSel.addEventListener('change', ()=>{
    emdSel.innerHTML = '<option value="">전체</option>';
    const s = sidoSel.value, g = sggSel.value;
    if(!g){ emdSel.disabled = true; return; }
    emdSel.disabled = false;
    ADM[s][g].forEach(e=> emdSel.add(new Option(e, e)));
  });
}

/** ===== 필터링 ===== */
function applyFilter(){
  const f = {
    sido: sidoSel.value.trim(),
    sgg : sggSel.value.trim(),
    emd : emdSel.value.trim(),
    nm  : prkNm.value.trim(),
    type: prkType.value.trim(),
    st  : status.value.trim(),
    ad  : addr.value.trim()
  };

  filtered = DATA.filter(r=>{
    if(f.sido && r.sido !== f.sido) return false;
    if(f.sgg && r.sigungu !== f.sgg) return false;
    if(f.emd && r.emd !== f.emd) return false;
    if(f.nm && !r.nm.includes(f.nm)) return false;
    if(f.type && r.type !== f.type) return false;
    if(f.st && r.status !== f.st) return false;
    if(f.ad && !(`${r.addr}`.includes(f.ad))) return false;
    return true;
  });

  currentPage = 1;
  render();
}

function badgeStatus(s){
  if(s==='APPROVED') return '<span class="badge status appr">승인</span>';
  if(s==='PENDING')  return '<span class="badge status pend">진행중</span>';
  if(s==='REJECTED') return '<span class="badge status reject">반려</span>';
  if(s==='TEMP')     return '<span class="badge">임시저장</span>';
  return `<span class="badge">${s}</span>`;
}

/** ===== 렌더링 (테이블 + 카드 + 페이지) ===== */
function render(){
  summary.textContent = `총 ${filtered.length}건`;

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if(currentPage > pages) currentPage = pages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  // 테이블
  tbody.innerHTML = pageRows.map((r, i)=>{
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
      </tr>
    `;
  }).join('');

  // 카드(모바일/아이패드) — 체크박스 추가
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
      </article>
    `;
  }).join('');

  renderPager(pages);
  bindRowChecks();     // 테이블 체크박스
  bindCardChecks();    // 카드 체크박스
  bindOpenDetailHandlers(pageRows); // 행/카드 클릭 → 상세
}

function renderPager(pages){
  pager.innerHTML = '';
  const makeBtn = (txt, page, disabled=false, active=false)=>{
    const b = document.createElement('button');
    b.className = 'page-btn' + (active?' active':'');
    b.textContent = txt;
    b.disabled = disabled;
    b.addEventListener('click', ()=>{ currentPage = page; render(); });
    return b;
  };
  pager.appendChild(makeBtn('«', 1, currentPage===1));
  pager.appendChild(makeBtn('‹', Math.max(1,currentPage-1), currentPage===1));
  const span = 3;
  const from = Math.max(1, currentPage - span);
  const to   = Math.min(pages, currentPage + span);
  for(let p=from; p<=to; p++){
    pager.appendChild(makeBtn(String(p), p, false, p===currentPage));
  }
  pager.appendChild(makeBtn('›', Math.min(pages,currentPage+1), currentPage===pages));
  pager.appendChild(makeBtn('»', pages, currentPage===pages));
}

/** ===== 선택(체크박스) 처리 ===== */
function bindRowChecks(){
  document.querySelectorAll('.row-check').forEach(chk=>{
    chk.addEventListener('change', (e)=>{
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      if(e.target.checked) selected.add(id);
      else selected.delete(id);
      syncHeaderCheck();
      // 카드 뷰의 동일 항목 체크 상태도 동기화
      const card = cards.querySelector(`.card[data-id="${id}"] .card-check`);
      if(card) card.checked = e.target.checked;
    });
  });
}
function bindCardChecks(){
  document.querySelectorAll('.card-check').forEach(chk=>{
    chk.addEventListener('click', e=> e.stopPropagation()); // 카드 클릭으로 상세 열림 방지
    chk.addEventListener('change', (e)=>{
      const card = e.target.closest('.card');
      const id = card.dataset.id;
      if(e.target.checked) selected.add(id);
      else selected.delete(id);
      // 테이블 뷰의 동일 항목 체크 상태도 동기화
      const row = tbody.querySelector(`tr[data-id="${id}"] .row-check`);
      if(row) row.checked = e.target.checked;
      syncHeaderCheck();
    });
  });
}

function syncHeaderCheck(){
  const visible = Array.from(tbody.querySelectorAll('tr')).map(tr=>tr.dataset.id);
  const allChecked = visible.length>0 && visible.every(id=>selected.has(id));
  if (checkAll){
    checkAll.checked = allChecked;
    checkAll.indeterminate = !allChecked && visible.some(id=>selected.has(id));
  }
}

checkAll?.addEventListener('change', ()=>{
  const visible = Array.from(tbody.querySelectorAll('tr')).map(tr=>tr.dataset.id);
  if(checkAll.checked){
    visible.forEach(id=>selected.add(id));
  }else{
    visible.forEach(id=>selected.delete(id));
  }
  Array.from(tbody.querySelectorAll('.row-check')).forEach(chk=>{
    const id = chk.closest('tr').dataset.id;
    chk.checked = selected.has(id);
  });
  // 카드 쪽도 동기화
  visible.forEach(id=>{
    const cardChk = cards.querySelector(`.card[data-id="${id}"] .card-check`);
    if(cardChk) cardChk.checked = selected.has(id);
  });
  syncHeaderCheck();
});

/** ===== CSV 내보내기 (필터 결과 전체) ===== */
function exportCSV(){
  const header = ['순번','관리번호','주차장구분','진행상태','시도','시군구','읍면동','상세주소','주차장명'];
  const rows = filtered.map((r, idx)=>[
    idx+1, r.manageNo, r.type,
    (r.status==='APPROVED'?'승인':r.status==='PENDING'?'진행중':r.status==='REJECTED'?'반려':r.status==='TEMP'?'임시저장':r.status),
    r.sido, r.sigungu, r.emd, r.addr, r.nm
  ]);
  const csv = [header, ...rows].map(cols =>
    cols.map(v => {
      const s = String(v ?? '').replace(/"/g,'""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(',')
  ).join('\n');

  const blob = new Blob(["\uFEFF"+csv], {type: "text/csv;charset=utf-8;"}); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'parking_list.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/** ===== 선택 전송(모바일 카드/데스크톱 테이블 공통) ===== */
async function sendSelected(){
  if(selected.size === 0){
    showToast('전송할 항목이 없습니다. (선택 0)');
    return;
  }
  // 선택된 레코드만 payload 구성
  const items = DATA.filter(r => selected.has(r.manageNo))
                    .map(r => ({
                      manageNo: r.manageNo, nm: r.nm, type: r.type, status: r.status,
                      sido: r.sido, sigungu: r.sigungu, emd: r.emd, addr: r.addr
                    }));

  try{
    const res = await fetch(INTERNAL_API, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ items })
    });
    if(!res.ok){
      const txt = await res.text().catch(()=> '');
      throw new Error(`HTTP ${res.status} ${res.statusText} ${txt||''}`.trim());
    }
    showToast(`전송 완료 · ${items.length}건`);
  }catch(err){
    console.error(err);
    showToast('전송 실패: ' + (err?.message || err));
  }
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2200);
}

/** ===== 탭 전환 ===== */
function activateTab(which){
  const listActive = which==='list';
  tabListBtn.classList.toggle('active', listActive);
  tabDetailBtn.classList.toggle('active', !listActive);
  tabListBtn.setAttribute('aria-selected', String(listActive));
  tabDetailBtn.setAttribute('aria-selected', String(!listActive));
  panelList.hidden = !listActive;
  panelDetail.hidden = listActive;
}
tabListBtn.addEventListener('click', ()=> activateTab('list'));
tabDetailBtn.addEventListener('click', ()=> activateTab('detail'));

/** ===== 상세 로딩 ===== */
function buildDetailUrl(rec){
  const map = { '노상':'offparking.html', '노외':'onparking.html', '부설':'buildparking.html' };
  const file = map[rec.type] || 'offparking.html';

  const sp = new URLSearchParams({
    id: rec.manageNo,
    name: rec.nm,
    status: rec.status,
    sido: rec.sido,
    sigungu: rec.sigungu,
    emd: rec.emd,
    addr: rec.addr
  });
  return `${file}?${sp.toString()}`;
}
function openDetail(rec){
  const url = buildDetailUrl(rec);
  detailFrame.src = url;
  activateTab('detail');
}

/** 목록에서 클릭(행/카드) → 상세 열기 (체크박스 클릭은 제외) */
function bindOpenDetailHandlers(pageRows){
  tbody.onclick = (e)=>{
    const target = e.target;
    if (target.closest('input,button,label,a')) return;
    const tr = target.closest('tr'); if(!tr) return;
    const id = tr.dataset.id;
    const rec = pageRows.find(r=>r.manageNo===id);
    if(rec) openDetail(rec);
  };
  cards.onclick = (e)=>{
    if (e.target.closest('input,button,label,a')) return; // 카드 체크박스 제외
    const card = e.target.closest('.card'); if(!card) return;
    const id = card.dataset.id;
    const rec = pageRows.find(r=>r.manageNo===id);
    if(rec) openDetail(rec);
  };
}

/** ===== 이벤트 바인딩 ===== */
form.addEventListener('submit', e=>{ e.preventDefault(); applyFilter(); });
resetBtn.addEventListener('click', ()=>{
  form.reset();
  sggSel.innerHTML = '<option value="">전체</option>'; sggSel.disabled = true;
  emdSel.innerHTML = '<option value="">전체</option>'; emdSel.disabled = true;
  filtered = [...DATA]; currentPage = 1; render();
  selected.clear(); syncHeaderCheck();
});
exportBtn.addEventListener('click', exportCSV);
sendBtn.addEventListener('click', sendSelected);

/** ===== 초기화 ===== */
function init(){
  initAdm();
  applyFilter();
  activateTab('list');
}
init();

/** ===== 실제 연동 시 참고 =====
 * - 내부 전송 API 예시: POST /api/internal/parkings/submit
 *   요청: { items: [{manageNo,nm,type,status,sido,sigungu,emd,addr}, ...] }
 *   응답: 200 OK (JSON) { ok: true, count: n }
 */
</script>
    </div>
  </main>
  <jsp:include page="/WEB-INF/views/fragments/_footer.jspf"/>
</body>
</html>
