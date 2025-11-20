/**
 * 주차이용실태 목록 관리 (같은 위치 = 하나의 마커 + 클릭 시 목록 표시)
 */
(function() {
    'use strict';

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));

    // ========== 🔥 Kakao Map 객체 및 마커 배열 ==========
    let kakaoMap = null;
    let markers = [];
    let overlays = [];
    let currentInfoWindow = null;
    let clusterer = null;

    // ========== 🔥 Kakao Map 초기화 ==========
    function initKakaoMap() {
        const mapContainer = $('#mapContainer');
        if (!mapContainer) {
            console.error('❌ 지도 컨테이너를 찾을 수 없습니다.');
            return;
        }

        if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
            console.warn('⏳ Kakao Maps API 로딩 중... 재시도합니다.');

            let retryCount = 0;
            const maxRetries = 10;

            const checkKakaoLoaded = setInterval(() => {
                retryCount++;

                if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                    clearInterval(checkKakaoLoaded);
                    console.log('✅ Kakao Maps API 로드 완료');
                    initializeMap();
                } else if (retryCount >= maxRetries) {
                    clearInterval(checkKakaoLoaded);
                    console.error('❌ Kakao Maps API 로드 실패 (타임아웃)');
                    mapContainer.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; background:#f1f5f9; color:#64748b; border-radius:8px;">지도를 불러올 수 없습니다</div>';
                }
            }, 500);

            return;
        }

        initializeMap();
    }

    function initializeMap() {
        const mapContainer = $('#mapContainer');
        if (!mapContainer || kakaoMap) return;

        try {
            console.log('🗺️ 지도 객체 생성 시작...');

            const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780);
            const mapOption = { center: defaultCenter, level: 7 };

            kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
            console.log('✅ Kakao Map 초기화 완료!');

            getCurrentLocationAndSetCenter();

            if (window.initialUsageData && window.initialUsageData.length > 0) {
                addMarkersToMap(window.initialUsageData);
            }

        } catch (error) {
            console.error('❌ 지도 초기화 오류:', error);
        }
    }

    function getCurrentLocationAndSetCenter() {
        if (!kakaoMap || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentPosition = new kakao.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                );
                kakaoMap.setCenter(currentPosition);
                kakaoMap.setLevel(5);
            },
            (error) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const currentPosition = new kakao.maps.LatLng(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        kakaoMap.setCenter(currentPosition);
                        kakaoMap.setLevel(5);
                    },
                    () => console.log('💡 기본 위치 사용'),
                    { enableHighAccuracy: false, timeout: 12000 }
                );
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    // ========== 🔥 지도에 마커 추가 (적법/불법 혼합 표시) ==========
    function addMarkersToMap(dataList) {
        if (!kakaoMap) return;

        // 기존 마커 제거
        if (clusterer) clusterer.clear();
        markers.forEach(marker => marker.setMap(null));
        overlays.forEach(overlay => overlay.setMap(null));
        markers = [];
        overlays = [];

        const bounds = new kakao.maps.LatLngBounds();

        // 🔥 좌표별로 그룹화
        const locationGroups = new Map();

        dataList.forEach((item, index) => {
            const lat = parseFloat(item.plceLat);
            const lng = parseFloat(item.plceLon);

            if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

            const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;

            if (!locationGroups.has(key)) {
                locationGroups.set(key, []);
            }
            locationGroups.get(key).push({ ...item, originalLat: lat, originalLng: lng, index });
        });

        console.log(`📍 ${locationGroups.size}개 위치에 ${dataList.length}개 데이터`);

        // 🔥 각 위치마다 하나의 마커만 생성
        locationGroups.forEach((items) => {
            const position = new kakao.maps.LatLng(items[0].originalLat, items[0].originalLng);

            // 🔥 적법/불법 여부 확인
            const hasLegal = items.some(item => item.lawCd === '1');
            const hasIllegal = items.some(item => item.lawCd !== '1');

            // 🔥 마커 색상 결정 (로컬 SVG 파일 사용)
            let markerImageUrl;
            let badgeColor;

            if (hasLegal && hasIllegal) {
                // 🔥 혼합: 주황색 SVG 마커
                markerImageUrl = `${contextPath}/static/img/marker-orange-48px.svg`;
                badgeColor = '#FF8A00'; // SVG 파일과 동일한 색상
            } else if (hasLegal) {
                // 적법만: 파란색 SVG 마커
                markerImageUrl = `${contextPath}/static/img/marker-blue-48px.svg`;
                badgeColor = '#007AFF'; // SVG 파일과 동일한 색상
            } else {
                // 불법만: 빨간색 SVG 마커
                markerImageUrl = `${contextPath}/static/img/marker-red-48px.svg`;
                badgeColor = '#FF3B30'; // SVG 파일과 동일한 색상
            }

            const imageSize = new kakao.maps.Size(48, 48);
            const markerImage = new kakao.maps.MarkerImage(markerImageUrl, imageSize);

            const marker = new kakao.maps.Marker({
                position: position,
                image: markerImage,
                title: items.length > 1 ? `${items.length}건` : (items[0].vhcleNo || '차량번호 없음')
            });

            marker.itemData = items;
            marker.setMap(kakaoMap);
            markers.push(marker);
            bounds.extend(position);

            // 🔥 개수 표시 (2개 이상일 때만)
            if (items.length > 1) {
                const content = `
                        <div style="
                            position: absolute;
                            bottom: 30px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: ${badgeColor};
                            color: white;
                            min-width: 24px;
                            height: 24px;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            padding: 0 6px;
                        ">
                            ${items.length}
                        </div>
                    `;

                const customOverlay = new kakao.maps.CustomOverlay({
                    position: position,
                    content: content,
                    yAnchor: 0,
                    zIndex: 100
                });

                customOverlay.setMap(kakaoMap);
                overlays.push(customOverlay);
            }

            // 🔥 클릭 이벤트
            kakao.maps.event.addListener(marker, 'click', function() {
                // 🔥 지도 중심 이동 제거 - InfoWindow만 표시
                if (items.length === 1) {
                    showInfoWindow(marker, items[0]);
                    scrollToCard(items[0].cmplSn);
                } else {
                    showMultipleInfoWindow(marker, items);
                }
            });
        });

        // 클러스터러 적용
        if (markers.length > 0) {
            clusterer = new kakao.maps.MarkerClusterer({
                map: kakaoMap,
                markers: markers,
                gridSize: 100,
                averageCenter: true,
                minLevel: 5,
                minClusterSize: 2,
                disableClickZoom: false,
                styles: [{
                    width: '60px',
                    height: '60px',
                    background: '#ef4444',
                    borderRadius: '30px',
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    lineHeight: '60px',
                    fontSize: '16px',
                    border: '4px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }]
            });

            kakaoMap.setBounds(bounds);
        }

        console.log(`✅ 지도에 ${markers.length}개 위치 표시 완료`);
    }

    // ========== 🔥 단일 항목 인포윈도우 (마커 옆에 표시) ==========
    function showInfoWindow(marker, item) {
        if (currentInfoWindow) {
            currentInfoWindow.setMap(null);
        }

        const isLegal = (item.lawCd === '1');
        const statusColor = isLegal ? '#3b82f6' : '#ef4444';
        const statusText = isLegal ? '적법 주차' : '불법 주차';

        const content = document.createElement('div');
        content.style.cssText = 'position:relative; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2); border:1px solid #e5e7eb;';
        content.innerHTML = `
                <div style="padding:15px; min-width:200px;">
                    <button onclick="closeInfoWindow()" 
                            style="position:absolute; top:8px; right:8px; width:24px; height:24px; 
                                   border:none; background:#f1f5f9; cursor:pointer; 
                                   font-size:18px; color:#64748b; border-radius:4px;">
                        ×
                    </button>
                    <div style="font-weight:bold; color:${statusColor}; margin-bottom:8px;">
                        ${statusText}
                    </div>
                    <div style="margin-bottom:6px;">
                        <strong>차량번호:</strong> ${item.vhcleNo || '-'}
                    </div>
                    <div style="margin-bottom:6px;">
                        <strong>조사일:</strong> ${item.examinDd || '-'}
                    </div>
                    <div style="margin-bottom:6px;">
                        <strong>조사원:</strong> ${item.srvyId || '-'}
                    </div>
                </div>
            `;

        const customOverlay = new kakao.maps.CustomOverlay({
            content: content,
            position: marker.getPosition(),
            xAnchor: -0.1,  // 🔥 마커 오른쪽에 표시
            yAnchor: 0.5,   // 🔥 마커와 같은 높이
            zIndex: 999
        });

        customOverlay.setMap(kakaoMap);
        currentInfoWindow = customOverlay;
    }

    // ========== 🔥 여러 항목 인포윈도우 (마커 옆에 표시) ==========
    function showMultipleInfoWindow(marker, items) {
        if (currentInfoWindow) {
            currentInfoWindow.setMap(null);
        }

        const itemsHtml = items.map((item, idx) => {
            const isLegal = (item.lawCd === '1');
            const statusColor = isLegal ? '#3b82f6' : '#ef4444';
            const statusText = isLegal ? '적법' : '불법';

            return `
                    <div style="padding:12px; border-bottom:1px solid #e2e8f0; cursor:pointer; transition: background 0.2s;"
                         onmouseover="this.style.background='#f8fafc'"
                         onmouseout="this.style.background='white'"
                         onclick="window.handleMultiItemClick('${item.cmplSn}')">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-weight:600; color:#1e293b; font-size:15px;">
                                ${idx + 1}. ${item.vhcleNo || '-'}
                            </span>
                            <span style="font-size:12px; padding:3px 10px; background:${statusColor}; color:white; border-radius:12px;">
                                ${statusText}
                            </span>
                        </div>
                        <div style="font-size:13px; color:#64748b; margin-bottom:4px;">
                            📅 ${item.examinDd || '-'}
                        </div>
                        <div style="font-size:13px; color:#64748b;">
                            👤 ${item.srvyId || '-'}
                        </div>
                    </div>
                `;
        }).join('');

        const content = document.createElement('div');
        content.style.cssText = 'position:relative; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2); border:1px solid #e5e7eb;';
        content.innerHTML = `
                <div style="padding:15px; min-width:300px; max-width:350px; max-height:450px; overflow-y:auto;">
                    <button onclick="closeInfoWindow()" 
                            style="position:sticky; top:0; right:0; float:right; width:32px; height:32px; 
                                   border:none; background:#f1f5f9; cursor:pointer; 
                                   font-size:20px; color:#64748b; border-radius:6px; z-index:10; 
                                   transition: all 0.2s;"
                            onmouseover="this.style.background='#e2e8f0'"
                            onmouseout="this.style.background='#f1f5f9'">
                        ×
                    </button>
                    <div style="font-weight:bold; margin-bottom:12px; color:#1e293b; font-size:17px;">
                        📍 이 위치의 주차 현황
                    </div>
                    <div style="font-size:14px; color:#64748b; margin-bottom:16px; padding:8px 12px; background:#f8fafc; border-radius:6px;">
                        총 <span style="color:#ef4444; font-weight:600; font-size:16px;">${items.length}건</span>
                    </div>
                    <div style="clear:both;">
                        ${itemsHtml}
                    </div>
                </div>
            `;

        const customOverlay = new kakao.maps.CustomOverlay({
            content: content,
            position: marker.getPosition(),
            xAnchor: -0.1,  // 🔥 마커 오른쪽에 표시
            yAnchor: 0.5,   // 🔥 마커와 같은 높이
            zIndex: 999
        });

        customOverlay.setMap(kakaoMap);
        currentInfoWindow = customOverlay;
    }

    // ========== 🔥 인포윈도우 항목 클릭 핸들러 ==========
    window.handleMultiItemClick = function(cmplSn) {
        if (currentInfoWindow) {
            currentInfoWindow.setMap(null);
        }
        scrollToCard(cmplSn);
    };

    window.closeInfoWindow = function() {
        if (currentInfoWindow) {
            currentInfoWindow.setMap(null);
            currentInfoWindow = null;
        }
    };

    function scrollToCard(cmplSn) {
        const card = document.querySelector(`[data-id="${cmplSn}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            card.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5)';
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 2000);
        }
    }

    // ========== 🔥 파일 목록 로드 함수 ==========
    async function loadFileList(cmplSn) {
        try {
            const response = await fetch(`${contextPath}/prk/api/usage-status/files?cmplSn=${cmplSn}`);
            const result = await response.json();

            if (result.success && result.files && result.files.length > 0) {
                return result.files;
            }
            return [];
        } catch (error) {
            console.error('❌ 파일 목록 로드 실패:', error);
            return [];
        }
    }

    // ========== 🔥 파일 목록 렌더링 함수 ==========
    function renderFileList(files) {
        if (!files || files.length === 0) {
            return '<span class="no-files">첨부파일 없음</span>';
        }

        return files.map(file => {
            return `
                <span class="file-item" 
                      data-cmpl-sn="${file.cmplSn}"
                      data-prk-img-id="${file.prkImgId}"
                      data-seq-no="${file.seqNo}"
                      title="${file.realFileNm}">
                    📎 ${file.realFileNm}
                </span>
            `;
        }).join('');
    }

    // ========== 🔥 이미지 미리보기 함수 (위치 자동 조정) ==========
    function showImagePreview(event, cmplSn, prkImgId, seqNo) {
        const tooltip = $('#imagePreviewTooltip');
        const img = $('#previewImage');

        if (!tooltip || !img) return;

        const imageUrl = `${contextPath}/file/preview?cmplSn=${cmplSn}&prkImgId=${prkImgId}&seqNo=${seqNo}`;
        img.src = imageUrl;

        // 🔥 이미지 로드 후 위치 조정
        img.onload = function() {
            positionTooltip(event, tooltip);
        };

        // 🔥 일단 기본 위치에 표시
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
        tooltip.style.display = 'block';
    }

    // 🔥 툴팁 위치 자동 조정 함수
    function positionTooltip(event, tooltip) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = event.pageX + 15;
        let top = event.pageY + 15;

        // 🔥 오른쪽으로 벗어나는 경우 → 마우스 왼쪽에 표시
        if (tooltipRect.right > viewportWidth) {
            left = event.pageX - tooltipRect.width - 15;
        }

        // 🔥 아래쪽으로 벗어나는 경우 → 마우스 위쪽에 표시
        if (tooltipRect.bottom > viewportHeight) {
            top = event.pageY - tooltipRect.height - 15;
        }

        // 🔥 왼쪽으로 벗어나는 경우 → 최소 여백 확보
        if (left < 10) {
            left = 10;
        }

        // 🔥 위쪽으로 벗어나는 경우 → 최소 여백 확보
        if (top < 10) {
            top = 10;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideImagePreview() {
        const tooltip = $('#imagePreviewTooltip');
        const img = $('#previewImage');

        if (tooltip) {
            tooltip.style.display = 'none';
        }

        // 🔥 이미지 src 초기화 (메모리 절약)
        if (img) {
            img.src = '';
        }
    }

    function moveImagePreview(event) {
        const tooltip = $('#imagePreviewTooltip');
        if (tooltip && tooltip.style.display === 'block') {
            // 🔥 이동 시에도 위치 자동 조정
            positionTooltip(event, tooltip);
        }
    }

    // ========== 🔥 파일 이벤트 리스너 설정 ==========
    function attachFileEventListeners() {
        document.addEventListener('mouseenter', function(e) {
            if (e.target.classList.contains('file-item')) {
                const cmplSn = e.target.dataset.cmplSn;
                const prkImgId = e.target.dataset.prkImgId;
                const seqNo = e.target.dataset.seqNo;
                showImagePreview(e, cmplSn, prkImgId, seqNo);
            }
        }, true);

        document.addEventListener('mouseleave', function(e) {
            if (e.target.classList.contains('file-item')) {
                hideImagePreview();
            }
        }, true);

        document.addEventListener('mousemove', function(e) {
            if (e.target.classList.contains('file-item')) {
                moveImagePreview(e);
            }
        });
    }

    // ========== 행정구역 코드 로드 ==========
    const SearchCodeUtils = {
        async loadSidoList() {
            try {
                const response = await fetch(`${contextPath}/cmm/codes/sido`);
                const result = await response.json();
                const sidoSelect = $('#searchSido');
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
            }
        },

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
            }
        }
    };

    // ========== 탭 전환 함수들 ==========
    function showAddTab() {
        const tabAdd = $('#tabAdd');
        if (tabAdd) tabAdd.style.display = 'inline-flex';
        switchToAddTab();
        if (typeof window.initUsageAddForm === 'function') {
            window.initUsageAddForm();
        }
    }

    function hideAddTab() {
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

        if (kakaoMap) {
            setTimeout(() => kakaoMap.relayout(), 100);
        }
    }

    function switchToAddTab() {
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

            const response = await fetch(`${contextPath}/prk/api/usage-status/list?${params}`);
            const result = await response.json();

            if (result.success) {
                await displayList(result.list || []);
                updateSummary(result.totalCount || 0);
                addMarkersToMap(result.list || []);
            } else {
                await displayList([]);
                updateSummary(0);
            }
        } catch (error) {
            console.error('❌ 목록 조회 오류:', error);
            await displayList([]);
            updateSummary(0);
        }
    }

    async function displayList(list) {
        const container = $('#cards');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div style="font-size:2rem; margin-bottom:16px; color:#94a3b8;">🔍</div>
                    <div>검색 결과가 없습니다</div>
                </div>
            `;
            return;
        }

        // 🔥 각 카드마다 파일 목록 로드
        const cardsHtml = await Promise.all(list.map(async (item) => {
            const lawBadgeClass = item.lawCd === '1' ? 'success' : 'danger';
            const borderColor = item.lawCd === '1' ? '#3b82f6' : '#ef4444';

            const locationParts = [];
            if (item.sidoNm) locationParts.push(item.sidoNm);
            if (item.sigunguNm) locationParts.push(item.sigunguNm);
            if (item.lgalEmdNm) locationParts.push(item.lgalEmdNm);
            const locationDisplay = locationParts.join(' ') || '-';

            // 🔥 파일 목록 로드
            const files = await loadFileList(item.cmplSn);
            const filesHtml = renderFileList(files);

            return `
                <article class="card" data-id="${item.cmplSn || ''}" 
                         style="cursor:pointer; transition: all 0.2s ease; border-left:4px solid ${borderColor};"
                         onclick="handleCardClick(${item.plceLat}, ${item.plceLon}, '${item.cmplSn}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <span style="font-size:1.3rem; color:#1e293b; font-weight:600;">
                            ${item.examinDd || '-'}
                        </span>
                        <span class="badge ${lawBadgeClass}" style="font-size:0.85rem; padding:6px 12px;">
                            ${item.lawCdNm || '미정'}
                        </span>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:0.9rem; color:#64748b; margin-bottom:4px;">차량번호</div>
                        <div style="font-size:1.1rem; font-weight:600; color:#1e293b;">${item.vhcleNo || '-'}</div>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:0.9rem; color:#64748b; margin-bottom:4px;">위치</div>
                        <div style="font-size:0.95rem; color:#475569;">${locationDisplay}</div>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:0.9rem; color:#64748b; margin-bottom:4px;">조사원</div>
                        <div style="font-size:0.95rem; color:#475569;">${item.srvyId || '-'}</div>
                    </div>
                    <div class="card-files-section">
                        <div class="card-files-label">📎 첨부파일</div>
                        <div class="file-list">
                            ${filesHtml}
                        </div>
                    </div>
                </article>
            `;
        }));

        container.innerHTML = cardsHtml.join('');
    }

    window.handleCardClick = function(lat, lng, cmplSn) {
        if (!kakaoMap || !lat || !lng) return;

        const position = new kakao.maps.LatLng(parseFloat(lat), parseFloat(lng));

        // 🔥 부드러운 이동으로 변경 (panTo 대신 setCenter 사용)
        kakaoMap.setCenter(position);

        // 🔥 줌 레벨은 현재 유지 (필요시 조정)
        if (kakaoMap.getLevel() > 4) {
            kakaoMap.setLevel(4);
        }

        const marker = markers.find(m => {
            if (!m.itemData) return false;
            return m.itemData.some(item => item.cmplSn === cmplSn);
        });

        if (marker) {
            setTimeout(() => {
                kakao.maps.event.trigger(marker, 'click');
            }, 300); // 지도 이동 후 InfoWindow 표시
        }
    };

    function updateSummary(count) {
        const summary = $('#summary');
        if (summary) {
            summary.textContent = `총 ${count}건`;
        }
    }

    window.loadUsageStatusList = loadUsageStatusList;

    // ========== DOM 로드 후 실행 ==========
    document.addEventListener('DOMContentLoaded', async function () {
        console.log('📄 usage-status-list.js 로드 완료');

        initKakaoMap();

        const tabAdd = $('#tabAdd');
        const panelAdd = $('#panelAdd');

        if (tabAdd) {
            tabAdd.style.display = 'none';
            tabAdd.classList.remove('active');
        }

        if (panelAdd) {
            panelAdd.style.display = 'none';
            panelAdd.classList.remove('active');
        }

        await SearchCodeUtils.loadSidoList();

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

        const btnAdd = $('#btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', showAddTab);
        }

        const tabClose = document.querySelector('#tabAdd .tab-close');
        if (tabClose) {
            tabClose.addEventListener('click', function (e) {
                e.stopPropagation();
                hideAddTab();
            });
        }

        initSearchForm();
        loadUsageStatusList();

        // 🔥 파일 이벤트 리스너 등록
        attachFileEventListeners();
    });

})();