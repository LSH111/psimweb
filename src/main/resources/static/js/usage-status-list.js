

/* usage-status-list.js — 주차이용실태 목록 + 탭 전환 */

// 유틸
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// ========== 행정구역 코드 로드 ==========
const SearchCodeUtils = {
    // 시도 목록 로드 (검색 영역용)
    async loadSidoList() {
        try {
            const response = await fetch(`${contextPath}/cmm/codes/sido`);
            const result = await response.json();

            const sidoSelect = $('#searchSido');  // ⚠️ 수정: f_sido → searchSido
            if (!sidoSelect) return;

            sidoSelect.innerHTML = '<option value="">전체</option>';

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sidoSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('시도 목록 로드 실패:', error);
        }
    },

    // 시군구 목록 로드 (검색 영역용)
    async loadSigunguList(sidoCd) {
        try {
            const sigunguSelect = $('#searchSigungu');
            const emdSelect = $('#searchEmd');

            if (!sigunguSelect || !emdSelect) return;

            sigunguSelect.innerHTML = '<option value="">전체</option>';
            emdSelect.innerHTML = '<option value="">전체</option>';
            emdSelect.disabled = true;

            if (!sidoCd) {
                sigunguSelect.disabled = true;
                return;
            }

            const response = await fetch(`${contextPath}/cmm/codes/sigungu?sidoCd=${sidoCd}`);
            const result = await response.json();

            if (result.success && result.data) {
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
        } catch (error) {
            console.error('시군구 목록 로드 실패:', error);
            const sigunguSelect = $('#searchSigungu');
            if (sigunguSelect) sigunguSelect.disabled = true;
        }
    },

    // 읍면동 목록 로드 (검색 영역용)
    async loadEmdList(sigunguCd) {
        try {
            const emdSelect = $('#searchEmd');
            if (!emdSelect) return;

            emdSelect.innerHTML = '<option value="">전체</option>';

            if (!sigunguCd) {
                emdSelect.disabled = true;
                return;
            }

            const response = await fetch(`${contextPath}/cmm/codes/emd?sigunguCd=${sigunguCd}`);
            const result = await response.json();

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
        } catch (error) {
            console.error('읍면동 목록 로드 실패:', error);
            const emdSelect = $('#searchEmd');
            if (emdSelect) emdSelect.disabled = true;
        }
    }
};

// ========== DOM 로드 후 실행 ==========
document.addEventListener('DOMContentLoaded', async function () {
    console.log('📄 usage-status-list.js 로드 완료');

    // 🔥 등록 탭 강제 숨김
    const tabAdd = $('#tabAdd');
    const panelAdd = $('#panelAdd');

    if (tabAdd) {
        tabAdd.style.display = 'none';
        tabAdd.classList.remove('active');
        tabAdd.setAttribute('aria-selected', 'false');
    }

    if (panelAdd) {
        panelAdd.style.display = 'none';
        panelAdd.classList.remove('active');
    }

    // 🔥 목록 탭으로 강제 전환
    const tabList = $('#tabList');
    const panelList = $('#panelList');

    if (tabList) {
        tabList.classList.add('active');
        tabList.setAttribute('aria-selected', 'true');
    }

    if (panelList) {
        panelList.classList.add('active');
        panelList.style.display = 'block';
    }

    // 행정구역 데이터 로드 (검색 영역)
    await SearchCodeUtils.loadSidoList();

    // 행정구역 이벤트 리스너 (검색 영역)
    const sidoSelect = $('#searchSido');
    const sigunguSelect = $('#searchSigungu');

    if (sidoSelect) {
        sidoSelect.addEventListener('change', async (e) => {
            await SearchCodeUtils.loadSigunguList(e.target.value);
        });
    }

    if (sigunguSelect) {
        sigunguSelect.addEventListener('change', async (e) => {
            await SearchCodeUtils.loadEmdList(e.target.value);
        });
    }

    // 추가 버튼 클릭 이벤트
    const btnAdd = $('#btnAdd');
    if (btnAdd) {
        btnAdd.addEventListener('click', function () {
            console.log('✅ 추가 버튼 클릭됨');
            showAddTab();
        });
    }

    // 탭 닫기 버튼 이벤트
    const tabClose = document.querySelector('#tabAdd .tab-close');
    if (tabClose) {
        tabClose.addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('✅ 탭 닫기 클릭됨');
            hideAddTab();
        });
    }

    // 목록 탭 클릭 이벤트
    if (tabList) {
        tabList.addEventListener('click', function () {
            console.log('✅ 목록 탭 클릭됨');
            switchToListTab();
        });
    }

    // 등록 탭 클릭 이벤트
    if (tabAdd) {
        tabAdd.addEventListener('click', function (e) {
            // X 버튼 클릭 시에는 탭 전환 안 함
            if (e.target.classList.contains('tab-close')) {
                return;
            }
            console.log('✅ 등록 탭 클릭됨');
            switchToAddTab();
        });
    }

    // 검색 폼 초기화
    initSearchForm();

    // 초기 목록 로드
    loadUsageStatusList();
});

// ========== 탭 전환 함수 ==========

function showAddTab() {
    console.log('📂 등록 탭 표시');
    const tabAdd = $('#tabAdd');

    if (tabAdd) {
        tabAdd.style.display = 'inline-flex';
    }

    switchToAddTab();

    // 🔥 usage-add.js의 초기화 함수 호출
    if (typeof window.initUsageAddForm === 'function') {
        window.initUsageAddForm();
    }

    // 🔥 사진 업로드 버튼 재초기화
    if (typeof window.reinitPhotoUploadButtons === 'function') {
        setTimeout(() => {
            window.reinitPhotoUploadButtons();
        }, 300);
    }
}

function hideAddTab() {
    console.log('📂 등록 탭 숨김');
    const tabAdd = $('#tabAdd');
    const panelAdd = $('#panelAdd');

    if (tabAdd) {
        tabAdd.style.display = 'none';
        tabAdd.classList.remove('active');
        tabAdd.setAttribute('aria-selected', 'false');
    }

    if (panelAdd) {
        panelAdd.style.display = 'none';
        panelAdd.classList.remove('active');
    }

    switchToListTab();

    if (typeof window.resetUsageAddForm === 'function') {
        window.resetUsageAddForm();
    }
}

function switchToListTab() {
    console.log('📋 목록 탭으로 전환');
    const tabList = $('#tabList');
    const tabAdd = $('#tabAdd');
    const panelList = $('#panelList');
    const panelAdd = $('#panelAdd');

    if (tabList) {
        tabList.classList.add('active');
        tabList.setAttribute('aria-selected', 'true');
    }
    if (tabAdd) {
        tabAdd.classList.remove('active');
        tabAdd.setAttribute('aria-selected', 'false');
    }

    if (panelList) {
        panelList.classList.add('active');
        panelList.style.display = 'block';
    }
    if (panelAdd) {
        panelAdd.classList.remove('active');
        panelAdd.style.display = 'none';
    }
}

function switchToAddTab() {
    console.log('📝 등록 탭으로 전환');
    const tabList = $('#tabList');
    const tabAdd = $('#tabAdd');
    const panelList = $('#panelList');
    const panelAdd = $('#panelAdd');

    if (tabList) {
        tabList.classList.remove('active');
        tabList.setAttribute('aria-selected', 'false');
    }
    if (tabAdd) {
        tabAdd.classList.add('active');
        tabAdd.setAttribute('aria-selected', 'true');
    }

    if (panelList) {
        panelList.classList.remove('active');
        panelList.style.display = 'none';
    }
    if (panelAdd) {
        panelAdd.classList.add('active');
        panelAdd.style.display = 'block';
    }
}

// ========== 검색 기능 ==========

function initSearchForm() {
    const searchForm = $('#searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            loadUsageStatusList();
        });
    }

    const resetBtn = $('#resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (searchForm) searchForm.reset();

            // 시군구, 읍면동 초기화
            const sigunguSelect = $('#searchSigungu');
            const emdSelect = $('#searchEmd');
            if (sigunguSelect) {
                sigunguSelect.disabled = true;
                sigunguSelect.innerHTML = '<option value="">전체</option>';
            }
            if (emdSelect) {
                emdSelect.disabled = true;
                emdSelect.innerHTML = '<option value="">전체</option>';
            }

            loadUsageStatusList();
        });
    }
}

async function loadUsageStatusList() {
    try {
        const searchForm = $('#searchForm');
        if (!searchForm) return;

        const formData = new FormData(searchForm);
        const params = new URLSearchParams(formData);

        // 🔥 검색 파라미터 로깅
        console.log('🔍 검색 조건:', Object.fromEntries(params));

        const response = await fetch(`${contextPath}/prk/api/usage-status/list?${params}`);
        const result = await response.json();

        // 🔥 응답 데이터 로깅
        console.log('📦 서버 응답:', result);

        if (result.success) {
            displayList(result.list || []);
            updateSummary(result.totalCount || 0);
        } else {
            console.error('❌ 목록 조회 실패:', result.message);
            displayList([]);
            updateSummary(0);
        }
    } catch (error) {
        console.error('❌ 목록 조회 오류:', error);
        displayList([]);
        updateSummary(0);
    }
}

function displayList(list) {
    const container = $('#cards');
    if (!container) return;

    console.log('📋 목록 데이터:', list);

    if (list.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div style="font-size:2rem; margin-bottom:16px; color:#94a3b8;">검색 결과 없음</div>
                <div>검색 결과가 없습니다</div>
                <div style="font-size:0.9rem; color:#cbd5e1; margin-top:8px;">
                    다른 검색 조건을 시도해보세요
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(item => {
        // 적/불 상태에 따른 배지 색상
        const lawBadgeClass = item.lawCd === '1' ? 'success' : (item.lawCd === '2' ? 'danger' : 'secondary');

        // 시간 포맷팅 (1:11 ~ 23:23 형식)
        const timeDisplay = item.examinTimelge ?
            item.examinTimelge.replace(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/, '$1:$2 ~ $3:$4') : '-';

        // 행정구역 정보 포맷팅
        const locationParts = [];
        if (item.sidoNm) locationParts.push(item.sidoNm);
        if (item.sigunguNm) locationParts.push(item.sigunguNm);
        if (item.lgalEmdNm) locationParts.push(item.lgalEmdNm);
        const locationDisplay = locationParts.length > 0 ? locationParts.join(' ') : '-';

        return `
            <article class="card" data-id="${item.cmplSn || ''}" style="cursor:pointer; transition: all 0.2s ease;">
                <!-- 상단: 날짜 & 적/불 배지 -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:1.3rem; color:#1e293b; font-weight:600;">
                            ${item.examinDd || '-'}
                        </span>
                        <span style="font-size:0.95rem; color:#64748b; font-weight:500;">
                            ${timeDisplay}
                        </span>
                    </div>
                    <span class="badge ${lawBadgeClass}" style="font-size:0.85rem; padding:6px 12px;">
                        ${item.lawCdNm || '미정'}
                    </span>
                </div>

                <!-- 행정구역 정보 -->
                <div style="margin-bottom:14px; padding:12px 16px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:8px; box-shadow:0 2px 4px rgba(102,126,234,0.2);">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.85rem; color:#e0e7ff; font-weight:500;">위치</span>
                        <span style="font-size:0.95rem; color:#ffffff; font-weight:600; letter-spacing:0.3px;">
                            ${locationDisplay}
                        </span>
                    </div>
                </div>
        
                <!-- 차량 정보 -->
                <div style="margin-bottom:14px; padding:12px 14px; background:#f8fafc; border-left:4px solid #3b82f6; border-radius:6px;">
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <span style="font-size:0.8rem; color:#64748b; font-weight:600;">차량번호</span>
                        <span style="font-size:1.15rem; color:#1e293b; font-weight:700; letter-spacing:0.8px;">
                            ${item.vhcleNo || '-'}
                        </span>
                        ${item.vhctyNm ? `
                            <span style="font-size:0.85rem; color:#64748b; font-weight:500; padding:4px 10px; background:#e2e8f0; border-radius:12px;">
                                ${item.vhctyNm}
                            </span>
                        ` : ''}
                        ${item.dyntDvNm ? `
                            <span style="font-size:0.85rem; color:#ffffff; font-weight:500; padding:4px 10px; background:#8b5cf6; border-radius:12px;">
                                ${item.dyntDvNm}
                            </span>
                        ` : ''}
                    </div>
                </div>
        
                <!-- 조사원 정보 -->
                <div style="display:flex; align-items:center; gap:20px; padding:10px 0; border-top:2px solid #f1f5f9;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;">조사원</span>
                        <span style="font-size:0.9rem; color:#475569; font-weight:500;">
                            ${item.srvyId || '미상'}
                        </span>
                    </div>
                    ${item.srvyTel ? `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;">연락처</span>
                            <span style="font-size:0.9rem; color:#475569; font-weight:500;">
                                ${formatPhoneNumber(item.srvyTel)}
                            </span>
                        </div>
                    ` : ''}
                </div>
        
                <!-- 비고 (있을 경우만 표시) -->
                ${item.remark && item.remark.trim() ? `
                    <div style="margin-top:14px; padding:12px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:6px;">
                        <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                            <span style="font-size:0.8rem; color:#92400e; font-weight:600;">비고</span>
                        </div>
                        <div style="font-size:0.9rem; color:#78350f; line-height:1.5;">
                            ${item.remark.length > 80 ? item.remark.substring(0, 80) + '...' : item.remark}
                        </div>
                    </div>
                ` : ''}
            </article>
        `;
    }).join('');

    // 카드 호버 효과 추가
    container.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });

        card.addEventListener('click', function() {
            const cmplSn = this.dataset.id;
            if (cmplSn) {
                console.log('카드 클릭됨 - cmplSn:', cmplSn);
                showToast('상세 정보 조회 기능은 준비 중입니다.', 'info');
                // TODO: 상세 조회 기능 구현
                // loadUsageStatusDetail(cmplSn);
            }
        });
    });
}

// 전화번호 포맷팅 함수
function formatPhoneNumber(phone) {
    if (!phone) return '-';

    // 숫자만 추출
    const numbers = phone.replace(/[^\d]/g, '');

    // 010-1234-5678 형식으로 변환
    if (numbers.length === 11) {
        return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 10) {
        return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone;
}

function updateSummary(count) {
    const summary = $('#summary');
    if (summary) {
        summary.textContent = `총 ${count}건`;
    }
}

// 토스트 메시지
function showToast(message, type = 'info') {
    const toast = $('#toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}