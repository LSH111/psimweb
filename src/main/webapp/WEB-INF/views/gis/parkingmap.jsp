<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
    <title>주차장 지도</title>

    <script type="text/javascript">
        // 컨텍스트 경로 (예: /spis)
        const contextPath = '${pageContext.request.contextPath}';
    </script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" crossorigin="anonymous"></script>
    <!-- Kakao Maps JS -->
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=services,clusterer"></script>

    <!-- parkingmap 전용 스타일 -->
    <style>
        /* body/html - 헤더 높이 고려 */
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
        }

        body * {
            box-sizing: border-box !important;
        }

        /* 🔥 지도 영역 - margin-top 제거 */
        body > #map {
            width: 100% !important;
            height: 100vh !important; /* 전체 높이 */
            position: relative !important;
            margin-top: 0 !important; /* 제거 */
        }

        /* 검색 패널 */
        #map > .search-panel {
            position: absolute !important;
            top: 20px !important;
            left: 20px !important;
            z-index: 10 !important;
            background: white !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            max-width: 400px !important;
            width: calc(100% - 40px) !important;
            transition: all 0.3s ease !important;
        }

        .search-header {
            padding: 16px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            border-bottom: 1px solid #e2e8f0 !important;
            cursor: pointer !important;
            user-select: none !important;
            border-radius: 12px 12px 0 0 !important;
        }

        .search-header:hover {
            background: #f8fafc !important;
        }

        .search-title {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        .toggle-icon {
            font-size: 20px !important;
            color: #64748b !important;
            transition: transform 0.3s ease !important;
        }

        .search-panel.collapsed .toggle-icon {
            transform: rotate(-90deg) !important;
        }

        .search-content {
            max-height: calc(100vh - 280px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            transition: max-height 0.3s ease !important;
        }

        .search-panel.collapsed .search-content {
            max-height: 0 !important;
            overflow: hidden !important;
        }

        .search-section {
            padding: 16px !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }

        .search-input-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            margin-bottom: 10px !important;
        }

        .radius-select-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            margin: 12px 0 !important;
        }

        .radius-label {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #475569 !important;
        }

        .radius-options {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
        }

        .radius-option {
            padding: 8px 10px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            font-size: 12px !important;
            background: #f8fafc !important;
            color: #475569 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }

        .radius-option.active {
            border-color: #2563eb !important;
            background: #2563eb !important;
            color: white !important;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3) !important;
        }

        .type-filter-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
        }

        .type-label {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #475569 !important;
        }

        .type-options {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
        }

        .type-option {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 6px 10px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 999px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            background: #f8fafc !important;
            color: #475569 !important;
            transition: all 0.2s ease !important;
        }

        .type-option input {
            accent-color: #2563eb !important;
        }

        .type-option.active {
            border-color: #2563eb !important;
            background: rgba(37, 99, 235, 0.08) !important;
            color: #1d4ed8 !important;
        }

        .status-guide {
            margin-top: 14px !important;
            padding: 12px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 10px !important;
            background: #f8fafc !important;
        }

        .status-guide-title {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #475569 !important;
            margin-bottom: 8px !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }

        .status-guide-items {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
        }

        .status-guide-item {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            font-size: 13px !important;
            color: #1e293b !important;
        }

        .status-guide-item img {
            width: 28px !important;
            height: 28px !important;
        }

        .search-input {
            width: 100% !important;
            padding: 10px 12px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            transition: all 0.2s !important;
        }

        .search-input:focus {
            outline: none !important;
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }

        .search-btn {
            width: 100% !important;
            padding: 10px 20px !important;
            background: #2563eb !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
        }

        .search-btn:hover {
            background: #1d4ed8 !important;
            transform: translateY(-1px) !important;
        }

        .search-result {
            margin-top: 10px !important;
            padding: 8px 12px !important;
            background: #f0fdf4 !important;
            border: 1px solid #86efac !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            color: #166534 !important;
        }

        .search-error {
            background: #fef2f2 !important;
            border-color: #fca5a5 !important;
            color: #991b1b !important;
        }

        /* 주차장 리스트 */
        .parking-list-section {
            max-height: 350px !important;
            overflow-y: auto !important;
            padding: 12px 16px !important;
        }

        .parking-list-header {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #64748b !important;
            margin-bottom: 10px !important;
            display: flex !important; /* 기본 flex 레이아웃 유지 (JS에서 필요시 !important로 덮어씀) */
            align-items: center !important;
            justify-content: space-between !important;
            padding: 8px !important;
            background: #f1f5f9 !important;
            border-radius: 6px !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 1 !important;
        }

        .parking-item {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 12px !important;
            margin-bottom: 8px !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
        }

        .parking-item:hover {
            background: #eff6ff !important;
            border-color: #3b82f6 !important;
            transform: translateX(4px) !important;
        }

        .parking-item-name {
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin-bottom: 4px !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex-wrap: wrap !important;
        }

        .parking-item-type {
            display: inline-block !important;
            padding: 2px 6px !important;
            background: #e0e7ff !important;
            color: #3730a3 !important;
            border-radius: 4px !important;
            font-size: 11px !important;
            font-weight: 500 !important;
        }

        .parking-item-type.type-01 {
            background: #fee2e2 !important;
            color: #991b1b !important;
        }

        .parking-item-type.type-02 {
            background: #dbeafe !important;
            color: #1e40af !important;
        }

        .parking-item-type.type-03 {
            background: #dcfce7 !important;
            color: #166534 !important;
        }

        .parking-item-location {
            font-size: 12px !important;
            color: #64748b !important;
            margin-bottom: 2px !important;
            font-weight: 500 !important;
        }

        .parking-item-address {
            font-size: 11px !important;
            color: #94a3b8 !important;
            line-height: 1.4 !important;
        }

        .parking-list-empty {
            text-align: center !important;
            padding: 32px 16px !important;
            color: #94a3b8 !important;
            font-size: 13px !important;
        }

        /* 현재 위치 버튼 */
        .location-btn {
            position: absolute !important;
            bottom: 30px !important;
            right: 30px !important;
            z-index: 10 !important;
            background: white !important;
            border: 2px solid #2563eb !important;
            border-radius: 50% !important;
            width: 56px !important;
            height: 56px !important;
            font-size: 24px !important;
            color: #2563eb !important;
            cursor: pointer !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            transition: all 0.2s !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .location-btn:hover {
            background: #2563eb !important;
            color: white !important;
            transform: scale(1.1) !important;
        }

        /* 상태 메시지 */
        .status-message {
            position: absolute !important;
            bottom: 30px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 10 !important;
            background: white !important;
            border-radius: 8px !important;
            padding: 12px 20px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            max-width: 400px !important;
            pointer-events: none !important;
            white-space: nowrap !important;
        }

        .status-message.success {
            border-left: 4px solid #10b981 !important;
            color: #059669 !important;
            background: #f0fdf4 !important;
        }

        .status-message.error {
            border-left: 4px solid #ef4444 !important;
            color: #dc2626 !important;
            background: #fef2f2 !important;
        }

        .status-message.info {
            border-left: 4px solid #3b82f6 !important;
            color: #2563eb !important;
            background: #eff6ff !important;
        }

        /* 모바일 대응 */
        @media (max-width: 768px) {
            body > #map {
                height: 100vh !important; /* 전체 높이 */
                margin-top: 0 !important; /* 제거 */
            }

            #map > .search-panel {
                top: 10px !important;
                left: 10px !important;
                right: 10px !important;
                width: auto !important;
                max-width: none !important;
            }

            .search-header {
                padding: 14px !important;
            }

            .search-title {
                font-size: 15px !important;
            }

            .search-section {
                padding: 14px !important;
            }

            .search-content {
                max-height: calc(100vh - 200px) !important;
            }

            .parking-list-section {
                max-height: 250px !important;
            }

            .location-btn {
                bottom: 20px !important;
                right: 20px !important;
                width: 48px !important;
                height: 48px !important;
                font-size: 20px !important;
            }

            .status-message {
                bottom: 80px !important;
                font-size: 12px !important;
                padding: 10px 16px !important;
                max-width: calc(100% - 40px) !important;
            }
        }

        /* 가로 모드 */
        @media (max-height: 600px) and (orientation: landscape) {
            body > #map {
                height: 100vh !important; /* 전체 높이 */
                margin-top: 0 !important; /* 제거 */
            }

            #map > .search-panel {
                top: 10px !important;
                left: 10px !important;
                max-width: 350px !important;
                max-height: calc(100vh - 70px) !important;
            }

            .search-content {
                max-height: calc(100vh - 150px) !important;
            }

            .parking-list-section {
                max-height: 200px !important;
            }

            .location-btn {
                bottom: 15px !important;
                right: 15px !important;
                width: 44px !important;
                height: 44px !important;
                font-size: 18px !important;
            }

            .status-message {
                bottom: 70px !important;
                font-size: 11px !important;
                padding: 8px 14px !important;
            }
        }

        /* 스크롤바 스타일 */
        .parking-list-section::-webkit-scrollbar {
            width: 6px !important;
        }

        .parking-list-section::-webkit-scrollbar-track {
            background: #f1f5f9 !important;
            border-radius: 3px !important;
        }

        .parking-list-section::-webkit-scrollbar-thumb {
            background: #cbd5e1 !important;
            border-radius: 3px !important;
        }

        .parking-list-section::-webkit-scrollbar-thumb:hover {
            background: #94a3b8 !important;
        }
    </style>
</head>
<body>
<input type="hidden" id="loginSidoNm" value="${loginSidoNm}">
<input type="hidden" id="loginSigunguNm" value="${loginSigunguNm}">
<input type="hidden" id="loginSidoCd" value="${loginSidoCd}">
<input type="hidden" id="loginSigunguCd" value="${loginSigunguCd}">
<!-- 지도 영역 -->
<div id="map">
    <!-- 접을 수 있는 검색 패널 -->
    <div class="search-panel" id="searchPanel">
        <!-- 헤더 (항상 표시, 클릭하면 접기/펼치기) -->
        <div class="search-header" onclick="toggleSearchPanel()">
            <div class="search-title">
                🔍 주차장 검색
            </div>
            <div class="toggle-icon">▼</div>
        </div>

        <!-- 컨텐츠 (접을 수 있음) -->
        <div class="search-content">
            <!-- 검색 영역 -->
            <div class="search-section">
                <div class="search-input-group">
                    <select id="searchSido" class="search-input">
                        <option value="">시도 선택</option>
                    </select>
                    <select id="searchSigungu" class="search-input" disabled>
                        <option value="">시군구 선택</option>
                    </select>
                    <div style="display:flex; gap:8px;">
                        <select id="searchKeywordType" class="search-input" style="flex:0 0 110px;">
                            <option value="name">주차장명</option>
                            <option value="addr">상세주소</option>
                        </select>
                        <input id="searchParkingName" class="search-input" type="text" placeholder="검색어"/>
                    </div>
                </div>
                <div class="radius-select-group">
                    <div class="radius-label">반경 범위</div>
                    <div class="radius-options">
                        <button type="button" class="radius-option" data-radius="none">반경 없음</button>
                        <button type="button" class="radius-option active" data-radius="500">500m</button>
                        <button type="button" class="radius-option" data-radius="1000">1km</button>
                        <button type="button" class="radius-option" data-radius="1500">1.5km</button>
                    </div>
                </div>
                <div class="type-filter-group">
                    <div class="type-label">주차장 유형</div>
                    <div class="type-options" id="parkingTypeOptions">
                        <label class="type-option active">
                            <input type="checkbox" value="01" checked>
                            <span>노상</span>
                        </label>
                        <label class="type-option active">
                            <input type="checkbox" value="02" checked>
                            <span>노외</span>
                        </label>
                        <label class="type-option active">
                            <input type="checkbox" value="03" checked>
                            <span>부설</span>
                        </label>
                    </div>
                </div>
                <div class="status-guide" aria-label="진행 상태별 마커 안내">
                    <div class="status-guide-title">🛈 마커 상태 안내</div>
                    <div class="status-guide-items">
                        <div class="status-guide-item">
                            <img src="<c:url value='/static/img/prking/marker-red-P-64.svg'/>" alt="승인완료 마커 아이콘">
                            <span>승인완료</span>
                        </div>
                        <div class="status-guide-item">
                            <img src="<c:url value='/static/img/prking/marker-orange-P-64.svg'/>" alt="승인대기 마커 아이콘">
                            <span>승인대기</span>
                        </div>
                        <div class="status-guide-item">
                            <img src="<c:url value='/static/img/prking/marker-blue-P-64.svg'/>" alt="조사중 마커 아이콘">
                            <span>기본/조사중</span>
                        </div>
                        <div class="status-guide-item">
                            <img src="<c:url value='/static/img/prking/marker-gray-P-64.svg'/>" alt="반려 마커 아이콘">
                            <span>반려</span>
                        </div>
                    </div>
                </div>
                <button id="regionSearchBtn" class="search-btn">주차장 검색</button>
                <div id="searchResult" style="display:none;"></div>
            </div>

            <!-- 주차장 리스트 영역 -->
            <div class="parking-list-section">
                <div id="parkingListHeader" class="parking-list-header" style="display:none;">
                    <span>검색 결과</span>
                    <span id="parkingCount" style="color:#2563eb; font-weight:700;"></span>
                </div>
                <div id="parkingListItems">
                    <div class="parking-list-empty">
                        시도/시군구를 선택 후<br>검색해주세요
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 현재 위치 버튼 -->
<button id="btnCurrentLocation" class="location-btn" aria-label="현재 위치로 이동" title="현재 위치">📍</button>

<!-- 상태 메시지 -->
<div id="statusMessage" class="status-message" style="display: none;"></div>

<script>
    // 전역 변수
    let map = null;
    let myLocationMarker = null;
    let realtimeCircle = null;
    let isRealtimeTracking = false;
    let watchId = null;
    let parkingMarkers = [];
    let searchCircle = null;
    let searchRadiusMeters = 500;
    let lastSearchAllList = [];
    let clusterer = null;
    let selectedTypes = new Set(['01', '02', '03']);
    let currentInfoWindow = null; // 🔥 열린 인포윈도우를 추적해 하나만 표시

    function closeCurrentInfoWindow() {
        if (currentInfoWindow) {
            currentInfoWindow.close();
            currentInfoWindow = null;
        }
    }

    // 검색 패널 토글
    function toggleSearchPanel() {
        const panel = document.getElementById('searchPanel');
        panel.classList.toggle('collapsed');
    }

    // 상태 메시지 표시
    function showMessage(text, type = 'info') {
        const messageEl = document.getElementById('statusMessage');
        messageEl.textContent = text;
        messageEl.className = 'status-message ' + type;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // 검색 결과 표시
    function showSearchResult(message, isError = false) {
        const resultEl = document.getElementById('searchResult');
        resultEl.textContent = message;
        resultEl.className = isError ? 'search-result search-error' : 'search-result';
        resultEl.style.display = 'block';

        setTimeout(() => {
            resultEl.style.display = 'none';
        }, 5000);
    }

    function getRadiusLabel(radiusValue) {
        if (!radiusValue) return '반경 제한 없음';
        if (radiusValue >= 1000) {
            const km = radiusValue / 1000;
            return (Number.isInteger(km) ? km : km.toFixed(1)) + 'km';
        }
        return radiusValue + 'm';
    }

    function setupRadiusControls() {
        const radiusButtons = document.querySelectorAll('.radius-option');
        if (!radiusButtons || radiusButtons.length === 0) return;

        radiusButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                radiusButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const value = btn.dataset.radius;
                searchRadiusMeters = (value === 'none') ? null : parseInt(value || '0', 10);

                if (map) {
                    updateRadiusSearch(map.getCenter());
                }
            });
        });
    }

    function setupTypeFilters() {
        const typeInputs = document.querySelectorAll('#parkingTypeOptions input[type="checkbox"]');
        if (!typeInputs || typeInputs.length === 0) return;

        selectedTypes = new Set(Array.from(typeInputs)
            .filter(input => input.checked)
            .map(input => input.value));

        typeInputs.forEach((input) => {
            input.addEventListener('change', () => {
                const parent = input.closest('.type-option');
                if (input.checked) {
                    selectedTypes.add(input.value);
                    if (parent) parent.classList.add('active');
                } else {
                    if (selectedTypes.size <= 1 && selectedTypes.has(input.value)) {
                        input.checked = true;
                        showSearchResult('최소 1개 유형을 선택해주세요', true);
                        return;
                    }
                    selectedTypes.delete(input.value);
                    if (parent) parent.classList.remove('active');
                }

                if (map && lastSearchAllList && lastSearchAllList.length > 0) {
                    updateRadiusSearch(map.getCenter());
                }
            });
        });
    }

    // 시도 목록 로드 (항상 호출)
    function loadSidoList(defaultSidoCd) {
        const sidoSelect = document.getElementById('searchSido');

        if (!sidoSelect) {
            console.error('❌ searchSido 엘리먼트를 찾을 수 없습니다');
            return $.Deferred().resolve();
        }

        sidoSelect.innerHTML = '<option value="">시도 선택</option>';
        sidoSelect.disabled = true;

        return $.ajax({
            url: contextPath + '/cmm/codes/sido',
            type: 'GET',
            dataType: 'json'
        }).done(function (result) {
            if (result && result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sidoSelect.appendChild(option);
                });
                if (defaultSidoCd) {
                    sidoSelect.value = defaultSidoCd;
                    const defaultSigunguCd = document.getElementById('loginSigunguCd')?.value;
                    if (defaultSigunguCd) {
                        loadSigunguList(defaultSidoCd, defaultSigunguCd);
                    }
                }
                console.log('✅ 시도 목록 로드 완료:', result.data.length + '개');
            }
        }).fail(function (xhr, status, error) {
            console.error('❌ 시도 목록 로드 실패:', status, error, xhr.responseText);
            showMessage('❌ 시도 목록을 불러올 수 없습니다', 'error');
        }).always(function () {
            sidoSelect.disabled = false;
        });
    }

    // 시군구 목록 로드
    function loadSigunguList(sidoCd, defaultSigunguCd) {
        const sigunguSelect = document.getElementById('searchSigungu');

        if (!sigunguSelect) {
            console.error('❌ searchSigungu 엘리먼트를 찾을 수 없습니다');
            return $.Deferred().resolve();
        }

        sigunguSelect.innerHTML = '<option value="">시군구 선택</option>';
        sigunguSelect.disabled = true;

        if (!sidoCd) return $.Deferred().resolve();

        return $.ajax({
            url: contextPath + '/cmm/codes/sigungu',
            type: 'GET',
            dataType: 'json',
            data: {sido: sidoCd, sidoCd: sidoCd}
        }).done(function (result) {
            if (result && result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sigunguSelect.appendChild(option);
                });
                if (defaultSigunguCd) {
                    sigunguSelect.value = defaultSigunguCd;
                }
                sigunguSelect.disabled = false;
                console.log('✅ 시군구 목록 로드 완료:', result.data.length + '개');
            }
        }).fail(function (xhr, status, error) {
            console.error('❌ 시군구 목록 로드 실패:', status, error, xhr.responseText);
            showMessage('❌ 시군구 목록을 불러올 수 없습니다', 'error');
        });
    }

    async function searchParkingByRegion() {
        const sidoCd = document.getElementById('searchSido').value;
        const sigunguCd = document.getElementById('searchSigungu').value;
        const keywordValue = (document.getElementById('searchParkingName')?.value || '').trim();
        const keywordType = document.getElementById('searchKeywordType')?.value || 'name';

        const sidoSelect = document.getElementById('searchSido');
        const sigunguSelect = document.getElementById('searchSigungu');

        const sidoText = sidoSelect.options[sidoSelect.selectedIndex]?.text || '';
        const sigunguText = sigunguSelect.options[sigunguSelect.selectedIndex]?.text || '';

        console.log('🔍 검색 조건:', {
            sidoCd: sidoCd,
            sidoText: sidoText,
            sigunguCd: sigunguCd,
            sigunguText: sigunguText,
            keywordValue: keywordValue,
            keywordType: keywordType
        });

        try {
            showMessage('🔍 주차장 검색 중...', 'info');

        const params = {}; // 🔍 시도 선택이 비어 있어도 전체 검색 가능 (sidoCd 없으면 전체 조회)
            if (sidoCd) params.sidoCd = sidoCd;
            if (sigunguCd) params.sigunguCd = sigunguCd;
            if (keywordValue) {
                params.keyword = keywordValue;
                params.keywordType = keywordType || 'name';
            }

            console.log('📤 전송 파라미터:', params);

            const result = await $.ajax({
                url: contextPath + '/prk/parking-map-data',
                type: 'GET',
                dataType: 'json',
                data: params
            });

            console.log('📥 응답 데이터:', result);

            if (result.success && result.list && result.list.length > 0) {
                console.log('✅ 주차장 검색 성공:', result.list.length + '개');

                lastSearchAllList = result.list;
                // 검색 결과 중 첫 좌표로 지도 중심 이동 후 반경 필터링
                const firstWithCoord = lastSearchAllList.find(p => p.prkPlceLat && p.prkPlceLon);
                if (firstWithCoord) {
                    const newCenter = new kakao.maps.LatLng(parseFloat(firstWithCoord.prkPlceLat), parseFloat(firstWithCoord.prkPlceLon));
                    map.setCenter(newCenter);
                    updateRadiusSearch(newCenter);
                } else {
                    updateRadiusSearch(map.getCenter());
                }

                const searchResult = document.getElementById('searchResult');
                if (searchResult) {
                    searchResult.style.display = 'none';
                }
            } else {
                lastSearchAllList = [];
                displayParkingMarkers([]);
                displayParkingList([]);

                let searchCondition = sidoCd ? sidoText : '전체 시도';
                if (sigunguCd && sigunguText && sigunguText !== '시군구 선택') {
                    searchCondition += ' ' + sigunguText;
                }
                if (keywordValue) {
                    const label = keywordType === 'addr' ? '주소' : '주차장명';
                    searchCondition += (searchCondition ? ' / ' : '') + label + ': ' + keywordValue;
                }

                showSearchResult(searchCondition + ': 검색 결과 없음', true);
                showMessage('검색 결과 없음', 'error');
            }
        } catch (error) {
            console.error('❌ 주차장 검색 실패:', error);
            showSearchResult('검색 중 오류가 발생했습니다', true);
            showMessage('검색 실패', 'error');
        }
    }

    // 반경 필터링
    function filterByRadius(center, parkings, radiusMeter) {
        if (!parkings || parkings.length === 0) return [];
        if (!radiusMeter) return parkings;

        const line = new kakao.maps.Polyline(); // 거리 계산용

        return parkings.filter(p => {
            if (!p.prkPlceLat || !p.prkPlceLon) return false;

            const pos = new kakao.maps.LatLng(parseFloat(p.prkPlceLat), parseFloat(p.prkPlceLon));
            line.setPath([center, pos]);
            const dist = line.getLength(); // m 단위 거리
            return dist <= radiusMeter;
        });
    }

    // 지도 중심 기준 반경 내 데이터 표시 + 원 갱신
    function updateRadiusSearch(center) {
        if (!map || !center) return;
        if (!lastSearchAllList || lastSearchAllList.length === 0) {
            if (searchCircle) {
                searchCircle.setMap(null);
                searchCircle = null;
            }
            displayParkingMarkers([]);
            displayParkingList([]);
            return;
        }

        let filtered = lastSearchAllList;

        if (!searchRadiusMeters) {
            if (searchCircle) {
                searchCircle.setMap(null);
                searchCircle = null;
            }
        } else {
            if (!searchCircle) {
                searchCircle = new kakao.maps.Circle({
                    center: center,
                    radius: searchRadiusMeters,
                    strokeWeight: 2,
                    strokeColor: '#2563eb',
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid',
                    fillColor: '#2563eb',
                    fillOpacity: 0.1
                });
                searchCircle.setMap(map);
            } else {
                searchCircle.setOptions({
                    center: center,
                    radius: searchRadiusMeters
                });
                searchCircle.setMap(map);
            }

            filtered = filterByRadius(center, lastSearchAllList, searchRadiusMeters);
        }

        filtered = applyClientFilters(filtered);

        displayParkingMarkers(filtered);
        displayParkingList(filtered);

        const cnt = filtered ? filtered.length : 0;
        if (!searchRadiusMeters) {
            showMessage('✅ 반경 제한 없음 - ' + cnt + '개 주차장 표시', 'success');
        } else {
            showMessage('✅ ' + getRadiusLabel(searchRadiusMeters) + ' 내 ' + cnt + '개 주차장 표시', 'success');
        }
    }

    // 주차장 리스트 표시
    function displayParkingList(parkingList) {
        const headerEl = document.getElementById('parkingListHeader');
        const itemsContainer = document.getElementById('parkingListItems');
        const countEl = document.getElementById('parkingCount');

        if (!parkingList || parkingList.length === 0) {
            headerEl.style.setProperty('display', 'none', 'important'); // 헤더 감출 때 CSS !important와 충돌 방지
            itemsContainer.innerHTML = '<div class="parking-list-empty">검색 결과가 없습니다</div>';
            return;
        }

        headerEl.style.setProperty('display', 'flex', 'important');
        countEl.textContent = parkingList.length + '개';

        itemsContainer.innerHTML = parkingList.map(parking => {
            const locationParts = [];
            if (parking.sidoNm) locationParts.push(parking.sidoNm);
            if (parking.sigunguNm) locationParts.push(parking.sigunguNm);
            const locationDisplay = locationParts.join(' ') || '';

            const typeCode = normalizeParkingType(parking.prkPlceType || parking.prkPlceTypeCd);
            const typeClass = typeCode === '01' ? 'type-01' :
                typeCode === '02' ? 'type-02' :
                    typeCode === '03' ? 'type-03' : '';

            let html = '<div class="parking-item" onclick="moveToParking(' + parking.prkPlceLat + ', ' + parking.prkPlceLon + ', \'' + escapeHtml(parking.prkplceNm) + '\', \'' + parking.prkPlceManageNo + '\', \'' + (typeCode || '') + '\')">';
            html += '<div class="parking-item-name">';
            html += escapeHtml(parking.prkplceNm);
            html += '<span class="parking-item-type ' + typeClass + '">' + getParkingTypeText(typeCode || parking.prkPlceType) + '</span>';
            html += '</div>';

            if (locationDisplay) {
                const noCoord = (!parking.prkPlceLat || !parking.prkPlceLon);
                html += '<div class="parking-item-location">📍 ' + escapeHtml(locationDisplay) + (noCoord ? ' (좌표 없음)' : '') + '</div>';
            }

            html += '<div class="parking-item-address">' + escapeHtml(parking.dtadd || '주소 정보 없음') + '</div>';
            html += '</div>';

            return html;
        }).join('');
    }

    // 주차장으로 이동
    function moveToParking(lat, lng, name, manageNo, type) {
        const position = new kakao.maps.LatLng(parseFloat(lat), parseFloat(lng));
        map.setCenter(position);
        map.setLevel(3);

        const targetMarker = parkingMarkers.find(marker => {
            const markerPos = marker.getPosition();
            return Math.abs(markerPos.getLat() - lat) < 0.00001 &&
                Math.abs(markerPos.getLng() - lng) < 0.00001;
        });

        if (targetMarker) {
            kakao.maps.event.trigger(targetMarker, 'click');
        }

        showMessage('📍 ' + name, 'info');

        if (window.innerWidth <= 768) {
            const panel = document.getElementById('searchPanel');
            if (panel && !panel.classList.contains('collapsed')) {
                panel.classList.add('collapsed');
            }
        }
    }

    // HTML 이스케이프 처리
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function normalizeParkingType(type) {
        if (type === undefined || type === null) return '';
        const raw = type.toString().trim();
        if (!raw) return '';
        if (raw === '노상' || raw === '1' || raw === '01') return '01';
        if (raw === '노외' || raw === '2' || raw === '02') return '02';
        if (raw === '부설' || raw === '3' || raw === '03') return '03';
        if (/^\d$/.test(raw)) return '0' + raw;
        return raw;
    }

    function applyClientFilters(parkingList) {
        if (!parkingList || parkingList.length === 0) return [];
        if (!selectedTypes || selectedTypes.size === 0) return parkingList;
        return parkingList.filter(parking => {
            const typeCd = normalizeParkingType(parking.prkPlceType || parking.prkPlceTypeCd);
            if (!typeCd) return true;
            return selectedTypes.has(typeCd);
        });
    }

    // 내 위치 마커 생성
    function createMyLocationMarker() {
        const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
            '<defs>' +
            '<linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />' +
            '<stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />' +
            '</linearGradient>' +
            '</defs>' +
            '<circle cx="20" cy="20" r="18" fill="url(#grad)" stroke="white" stroke-width="3"/>' +
            '<circle cx="20" cy="15" r="6" fill="white"/>' +
            '<path d="M 12 28 Q 12 22 20 22 Q 28 22 28 28" fill="white"/>' +
            '</svg>';

        const markerSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

        const markerImage = new kakao.maps.MarkerImage(
            markerSvg,
            new kakao.maps.Size(40, 40),
            {offset: new kakao.maps.Point(20, 20)}
        );

        return new kakao.maps.Marker({
            image: markerImage,
            zIndex: 1000
        });
    }

    // 실시간 반경 원 생성
    function createRealtimeCircle() {
        return new kakao.maps.Circle({
            strokeWeight: 2,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            fillColor: '#3b82f6',
            fillOpacity: 0.15
        });
    }

    function updateRealtimeRadius(center, radiusMeter) {
        if (!isRealtimeTracking || !center) {
            if (realtimeCircle) {
                realtimeCircle.setMap(null);
                realtimeCircle = null;
            }
            return;
        }

        if (!realtimeCircle) {
            realtimeCircle = createRealtimeCircle();
            realtimeCircle.setMap(map);
        }

        realtimeCircle.setOptions({
            center: center,
            radius: Math.max(radiusMeter || 0, 10)
        });
    }

    // 진행상태별 마커 이미지 반환 (10=조사중:파랑, 20=승인대기:주황, 30=승인완료:빨강, 99=반려:회색)
    function getStatusMarkerImage(prgsStsCd) {
        const base = '<c:url value="/static/img/prking"/>';
        const cd = (prgsStsCd || '').toString().trim();
        if (cd === '20') return base + '/marker-orange-P-64.svg'; // 승인대기
        if (cd === '30') return base + '/marker-red-P-64.svg';    // 승인완료
        if (cd === '99') return base + '/marker-gray-P-64.svg';   // 반려
        return base + '/marker-blue-P-64.svg';                    // 기본/조사중
    }

    // 주차장 마커 생성
    function createParkingMarker(parking) {
        const imageSrc = getStatusMarkerImage(parking.prgsStsCd);
        const imageSize = new kakao.maps.Size(64, 64);
        const imageOption = {offset: new kakao.maps.Point(16, 32)};

        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(parking.lat, parking.lng),
            image: markerImage,
            title: parking.prkplceNm,
            clickable: true
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            showParkingInfo(parking, marker);
        });

        return marker;
    }

    // HHMM → HH:MM 형태로 포맷
    function formatTime(hhmm) {
        if (!hhmm) return '';
        var s = String(hhmm);
        if (s.length === 4) {
            return s.substring(0, 2) + ':' + s.substring(2, 4);
        }
        return s;
    }

    // 주차면수 한 줄 요약
    function buildCapacityText(parking) {
        var total = parking.totPrkCnt || 0;
        var parts = [];

        if (parking.disabPrkCnt) {
            parts.push('장애인:' + parking.disabPrkCnt);
        }
        if (parking.ecoPrkCnt) {
            parts.push('친환경:' + parking.ecoPrkCnt);
        }
        if (parking.compactPrkCnt) {
            parts.push('경차:' + parking.compactPrkCnt);
        }
        if (parking.pregnantPrkCnt) {
            parts.push('임산부:' + parking.pregnantPrkCnt);
        }

        var text = '주차면수 ' + total;
        if (parts.length > 0) {
            text += ' (' + parts.join(', ') + ')';
        }
        return text;
    }

    // 운영시간 한 줄 요약 (평일 기준)
    function buildOperTimeText(parking) {
        var typeCd = parking.prkPlceTypeCd || parking.prkPlceType; // 숫자코드(1/2/3) 가정

        var dayStart = parking.dayWkdyStartTm;
        var dayEnd = parking.dayWkdyEndTm;
        var nightStart = parking.nightWkdyStartTm;
        var nightEnd = parking.nightWkdyEndTm;

        // 운영시간 정보가 전혀 없으면
        if (!dayStart && !dayEnd && !nightStart && !nightEnd) {
            return '운영시간 정보 없음';
        }

        var parts = [];

        if (typeCd === '3') {
            // 3번(부설) : 주/야 구분 없음 → 평일만 표시
            if (dayStart && dayEnd) {
                parts.push('평일 ' + formatTime(dayStart) + ' ~ ' + formatTime(dayEnd));
            } else {
                parts.push('평일 운영시간 정보 없음');
            }
        } else {
            // 1, 2번 : 주/야간 구분
            if (dayStart && dayEnd) {
                parts.push('평일 주간 ' + formatTime(dayStart) + ' ~ ' + formatTime(dayEnd));
            }
            if (nightStart && nightEnd) {
                parts.push('야간 ' + formatTime(nightStart) + ' ~ ' + formatTime(nightEnd));
            }
            if (parts.length === 0) {
                parts.push('운영시간 정보 없음');
            }
        }

        return '운영시간 ' + parts.join(', ');
    }

    function formatNumberValue(value) {
        if (value === undefined || value === null || value === '') return null;
        var num = Number(value);
        if (!Number.isFinite(num) || num <= 0) return null;
        return num.toLocaleString('ko-KR');
    }

    function buildCapacityInfo(parking) {
        var total = formatNumberValue(parking.totPrkCnt);
        var details = [];
        var addDetail = function (label, value) {
            var formatted = formatNumberValue(value);
            if (formatted) {
                details.push(label + ' ' + formatted + '면');
            }
        };
        addDetail('장애인', parking.disabPrkCnt);
        addDetail('친환경', parking.ecoPrkCnt);
        addDetail('경차', parking.compactPrkCnt);
        addDetail('임산부', parking.pregnantPrkCnt);
        return {total: total, details: details};
    }

    function formatCurrencyValue(value) {
        var formatted = formatNumberValue(value);
        return formatted ? formatted + '원' : null;
    }

    function buildFeeInfo(parking) {
        const buildItems = (values) => {
            const list = [];
            const addFee = (label, value) => {
                const formatted = formatCurrencyValue(value);
                if (formatted) {
                    list.push(label + ' ' + formatted);
                }
            };
            addFee('최초 30분', values.first30);
            addFee('10분당', values.per10);
            addFee('1시간당', values.per60);
            addFee('일일', values.day);
            addFee('월 정기권', values.monthly);
            addFee('반기권', values.halfyear);
            return list;
        };
        const labelFrom = (name, code) => {
            if (name) return name;
            if (code) {
                const map = {
                    '01': '무료',
                    '02': '유료',
                    '03': '기타'
                };
                return map[code] || code;
            }
            return null;
        };
        return {
            day: buildItems({
                first30: parking.dayFeeFirst30m,
                per10: parking.dayFeePer10m,
                per60: parking.dayFeePer60m,
                day: parking.dayFeeDay,
                monthly: parking.dayFeeMonthly,
                halfyear: parking.dayFeeHalfyear
            }),
            dayLabel: labelFrom(parking.dayFeeApplyNm, parking.dayFeeApplyCd),
            night: buildItems({
                first30: parking.nightFeeFirst30m,
                per10: parking.nightFeePer10m,
                per60: parking.nightFeePer60m,
                day: parking.nightFeeDay,
                monthly: parking.nightFeeMonthly,
                halfyear: parking.nightFeeHalfyear
            }),
            nightLabel: labelFrom(parking.nightFeeApplyNm, parking.nightFeeApplyCd)
        };
    }

    const OPER_TM_LABELS = {
        '01': '전일 운영',
        '02': '시간제 운영',
        '03': '운영 안 함'
    };

    function formatTimeRange(start, end) {
        if (!start && !end) return null;
        if (start && end) {
            return formatTime(start) + ' ~ ' + formatTime(end);
        }
        if (start) return formatTime(start) + ' ~';
        if (end) return '~ ' + formatTime(end);
        return null;
    }

    function resolveOperationLabel(code) {
        if (!code) return null;
        return OPER_TM_LABELS[code] || code;
    }

    function buildOperationDetail(parking, typeCode) {
        const allowNight = !(typeCode === '03' || typeCode === '3');
        const buildSlot = (start, end, code, isNightSlot) => {
            if (isNightSlot && !allowNight) return null;
            const rangeText = formatTimeRange(start, end);
            const fallback = resolveOperationLabel(code);
            const display = rangeText || fallback || null;
            if (!display) return null;
            return {display, code, start, end};
        };
        return {
            weekday: {
                day: buildSlot(parking.dayWkdyStartTm, parking.dayWkdyEndTm, parking.dayWkdyOperTmCd, false),
                night: buildSlot(parking.nightWkdyStartTm, parking.nightWkdyEndTm, parking.nightWkdyOperTmCd, true)
            },
            saturday: {
                day: buildSlot(parking.satDayStartTm, parking.satDayEndTm, parking.dayWkdyOperTmCd, false),
                night: buildSlot(parking.satNightStartTm, parking.satNightEndTm, parking.nightWkdyOperTmCd, true)
            },
            holiday: {
                day: buildSlot(parking.hldyDayStartTm, parking.hldyDayEndTm, parking.dayWkdyOperTmCd, false),
                night: buildSlot(parking.hldyNightStartTm, parking.hldyNightEndTm, parking.nightWkdyOperTmCd, true)
            }
        };
    }

    // 팝업용 전체 요약 문자열
    function buildParkingSummary(parking) {
        const cap = buildCapacityText(parking);
        const oper = buildOperTimeText(parking);

        return {
            capacity: cap,
            operate: oper
        };
    }

    // 주차장 정보 인포윈도우 표시
    function showParkingInfo(parking, marker) {
        console.log('🛰️ parking marker data', parking);
        const locationParts = [];
        if (parking.sidoNm) locationParts.push(parking.sidoNm);
        if (parking.sigunguNm) locationParts.push(parking.sigunguNm);
        const locationDisplay = locationParts.join(' ') || '';

        let content = '<div style="padding:14px;min-width:250px;max-width:360px;min-height:195px;word-break:break-all;line-height:1.5;">';

        // 제목
        content += '<div style="font-weight:bold;font-size:14px;margin-bottom:8px;color:#1e40af;">';
        content += parking.prkplceNm;
        content += '</div>';

        const typeCode = normalizeParkingType(parking.prkPlceType || parking.prkPlceTypeCd);

        // 상태/유형 배지
        const statusText = parking.prgsStsNm || (statusNames[parking.prgsStsCd] || '미정');
        content += '<div style="font-size:12px;color:#666;margin-bottom:8px;">';
        content += '<span style="display:inline-block;padding:3px 8px;background:#eef2ff;border-radius:999px;font-size:11px;font-weight:700;margin-right:6px;">';
        content += statusText;
        content += '</span>';
        content += '<span style="display:inline-block;padding:2px 6px;background:#e0e7ff;border-radius:4px;font-size:11px;margin-right:4px;">';
        content += getParkingTypeText(parking.prkPlceType || parking.prkPlceTypeCd);
        content += '</span>';
        content += '</div>';

        const summary = buildParkingSummary(parking);
        const capacityInfo = buildCapacityInfo(parking);
        const feeInfo = buildFeeInfo(parking);
        const operDetail = buildOperationDetail(parking, typeCode);
        console.log('🕒 operation detail', operDetail);

        if (capacityInfo.total || capacityInfo.details.length > 0) {
            content += '<div style="font-size:12px;color:#1f2937;line-height:1.6;margin-bottom:8px;padding:10px;background:#f8fafc;border-radius:8px;">';
            content += '<div style="font-weight:700;color:#1d4ed8;margin-bottom:4px;">주차면수</div>';
            if (capacityInfo.total) {
                content += '<div>총 ' + capacityInfo.total + '면</div>';
            }
            if (capacityInfo.details.length > 0) {
                content += '<div style="color:#6b7280;margin-top:2px;">' + capacityInfo.details.join(' · ') + '</div>';
            }
            content += '</div>';
        }

        const hasDayFees = feeInfo.day.length > 0 || !!feeInfo.dayLabel;
        const hasNightFees = (typeCode !== '03' && typeCode !== '3') && (feeInfo.night.length > 0 || !!feeInfo.nightLabel);
        if (hasDayFees || hasNightFees) {
            content += '<div style="font-size:12px;color:#0f172a;line-height:1.6;margin-bottom:8px;padding:10px;background:#f0f9ff;border-radius:8px;">';
            content += '<div style="font-weight:700;color:#0369a1;margin-bottom:4px;">요금정보</div>';
            const renderFeeBlock = (label, list, levelText) => {
                content += '<div style="margin-top:4px;">';
                content += '<span style="display:inline-block;font-weight:600;color:#0ea5e9;margin-bottom:2px;">' + label;
                if (levelText) {
                    content += ' · ' + levelText;
                }
                content += '</span>';
                if (list.length > 0) {
                    list.forEach(item => {
                        content += '<div>' + item + '</div>';
                    });
                } else {
                    content += '<div style="color:#94a3b8;">상세 요금 없음</div>';
                }
                content += '</div>';
            };
            if (hasDayFees) {
                renderFeeBlock('주간', feeInfo.day, feeInfo.dayLabel);
            }
            if (hasNightFees) {
                renderFeeBlock('야간', feeInfo.night, feeInfo.nightLabel);
            }
            content += '</div>';
        }

        const operationSections = [
            {label: '평일', data: operDetail.weekday, color: '#c2410c'},
            {label: '토요일', data: operDetail.saturday, color: '#b45309'},
            {label: '공휴일', data: operDetail.holiday, color: '#92400e'}
        ];
        const hasOperationInfo = operationSections.some(section => {
            const daySlot = section.data.day;
            const nightSlot = section.data.night;
            return (daySlot && daySlot.display) || (nightSlot && nightSlot.display);
        });
        if (hasOperationInfo) {
            content += '<div style="font-size:12px;color:#7c2d12;line-height:1.6;margin-bottom:8px;padding:10px;background:#fff7ed;border-radius:8px;">';
            content += '<div style="font-weight:700;color:#c2410c;margin-bottom:4px;">운영시간</div>';
            operationSections.forEach(section => {
                const daySlotObj = section.data.day;
                const nightSlotObj = section.data.night;
                const daySlot = (daySlotObj && daySlotObj.display) ? daySlotObj.display : null;
                const nightSlot = (nightSlotObj && nightSlotObj.display) ? nightSlotObj.display : null;
                if (!daySlot && !nightSlot) return;
                content += '<div style="margin-top:6px;padding:8px;background:#fff1e6;border-radius:6px;">';
                content += '<div style="font-weight:700;color:' + section.color + ';margin-bottom:4px;">' + section.label + '</div>';
                if (daySlot) {
                    content += '<div style="padding-left:6px;color:#1f2937;border-left:3px solid rgba(180,83,9,0.4);margin-bottom:4px;">주간 <strong style="color:#0f172a;">' + daySlot + '</strong></div>';
                }
                if (nightSlot) {
                    content += '<div style="padding-left:6px;color:#1f2937;border-left:3px solid rgba(180,83,9,0.4);">야간 <strong style="color:#0f172a;">' + nightSlot + '</strong></div>';
                }
                content += '</div>';
            });
            content += '</div>';
        } else if (summary.operate) {
            const fallback = summary.operate.replace(/^운영시간\s*/, '').trim();
            if (fallback) {
                content += '<div style="font-size:12px;color:#7c2d12;line-height:1.6;margin-bottom:8px;padding:10px;background:#fff7ed;border-radius:8px;">';
                content += '<div style="font-weight:700;color:#c2410c;margin-bottom:4px;">운영시간</div>';
                content += '<div>' + fallback + '</div>';
                content += '</div>';
            }
        }

        // 위치
        if (locationDisplay) {
            content += '<div style="font-size:12px;color:#666;margin-bottom:4px;font-weight:500;">';
            content += '📍 ' + locationDisplay + (parking.dtadd || '');
            content += '</div>';
        }

        // (기존 dtadd 는 주소/등록일 등 용도로 쓰고 계셨으니 그대로 둡니다)
        /*content += '<div style="font-size:12px;color:#666;margin-bottom:8px;">';
        content += parking.dtadd || '주소 정보 없음';
        content += '</div>';*/

        // 상세보기 버튼
        content += '<a href="javascript:void(0);" ';
        content += 'onclick="openParkingDetail(\'' + parking.prkPlceManageNo + '\', \'' + (parking.prkPlceType || parking.prkPlceTypeCd) + '\')" ';
        content += 'style="display:inline-block;padding:6px 12px;background:#2563eb;color:white;text-decoration:none;border-radius:4px;font-size:12px;cursor:pointer;">';
        content += '상세보기';
        content += '</a>';

        content += '</div>';

        closeCurrentInfoWindow();

        const infowindow = new kakao.maps.InfoWindow({
            content: content,
            removable: true
        });

        infowindow.open(map, marker);
        currentInfoWindow = infowindow;
        kakao.maps.event.addListener(infowindow, 'close', () => {
            if (currentInfoWindow === infowindow) {
                currentInfoWindow = null;
            }
        });
    }

    // 주차장 상세보기 함수
    function openParkingDetail(prkPlceManageNo, prkPlceType) {
        // 🔥 현재 지도 상태 저장
        sessionStorage.setItem('parkingMapReturn', 'true');
        sessionStorage.setItem('parkingMapCenter', JSON.stringify({
            lat: map.getCenter().getLat(),
            lng: map.getCenter().getLng()
        }));
        sessionStorage.setItem('parkingMapLevel', map.getLevel());

        // 🔥 현재 검색 조건 저장
        const sidoCd = document.getElementById('searchSido')?.value || '';
        const sigunguCd = document.getElementById('searchSigungu')?.value || '';
        sessionStorage.setItem('parkingMapSido', sidoCd);
        sessionStorage.setItem('parkingMapSigungu', sigunguCd);

        const url = contextPath + '/prk/parkinglist?openDetail=' + encodeURIComponent(prkPlceManageNo) +
            '&type=' + encodeURIComponent(prkPlceType);
        window.location.href = url;
    }

    // 주차장 타입 텍스트 변환
    function getParkingTypeText(type) {
        const normalized = normalizeParkingType(type);
        if (normalized === '01') return '노상';
        if (normalized === '02') return '노외';
        if (normalized === '03') return '부설';
        return type || '';
    }

    // 주차장 마커 표시
    function displayParkingMarkers(parkingList) {
        parkingMarkers.forEach(marker => marker.setMap(null));
        parkingMarkers = [];
        if (clusterer) {
            clusterer.clear();
        }

        const validParkings = parkingList.filter(p => p.prkPlceLat && p.prkPlceLon);

        console.log('📍 유효한 좌표를 가진 주차장:', validParkings.length + '개');

        if (validParkings.length === 0) return;

        validParkings.forEach(parking => {
            const marker = createParkingMarker({
                ...parking,
                lat: parseFloat(parking.prkPlceLat),
                lng: parseFloat(parking.prkPlceLon)
            });

            if (!clusterer) {
                marker.setMap(map);
            }
            parkingMarkers.push(marker);
        });

        if (clusterer && parkingMarkers.length > 0) {
            clusterer.addMarkers(parkingMarkers);
        }
    }

    function getGeoOptions(highAccuracy = true) {
        return {
            enableHighAccuracy: !!highAccuracy,
            timeout: highAccuracy ? 10000 : 20000,
            maximumAge: highAccuracy ? 0 : 60000
        };
    }

    function showGeolocationError(error) {
        let errorMsg = '위치를 확인할 수 없습니다';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMsg = '❌ 위치 권한이 거부되었습니다';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMsg = '❌ 위치 정보를 사용할 수 없습니다';
                break;
            case error.TIMEOUT:
                errorMsg = '❌ 위치 확인 시간이 초과되었습니다';
                break;
        }

        showMessage(errorMsg, 'error');
    }

    function requestSinglePosition(highAccuracy = true, hasRetried = false) {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            updateLocation,
            (error) => {
                console.warn('⚠️ 현재 위치 확인 실패 (getCurrentPosition):', error);
                if (highAccuracy && !hasRetried) {
                    showMessage('⚠️ 고정밀 위치 확인 실패, 일반 정밀도로 재시도합니다', 'info');
                    requestSinglePosition(false, true);
                } else {
                    showGeolocationError(error);
                }
            },
            getGeoOptions(highAccuracy)
        );
    }

    function startGeoWatch(highAccuracy = true) {
        if (!navigator.geolocation) return;

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => {
                if (highAccuracy && error.code === error.POSITION_UNAVAILABLE) {
                    console.warn('⚠️ 고정밀 위치 추적 실패, 일반 정밀도로 전환합니다:', error);
                    showMessage('⚠️ 위치 신호가 약해 일반 정밀도로 전환합니다', 'info');
                    startGeoWatch(false);
                    return;
                }
                showGeolocationError(error);
                stopLocationTracking();
            },
            getGeoOptions(highAccuracy)
        );
    }

    // 위치 업데이트 처리
    function updateLocation(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy || 0;

        const newPosition = new kakao.maps.LatLng(lat, lng);

        if (!myLocationMarker) {
            myLocationMarker = createMyLocationMarker();
            myLocationMarker.setMap(map);
            map.setCenter(newPosition);
        }

        myLocationMarker.setPosition(newPosition);

        const realtimeRadius = Math.max(accuracy, 30);
        updateRealtimeRadius(newPosition, realtimeRadius);

        if (isRealtimeTracking) {
            map.setCenter(newPosition);
            if (lastSearchAllList && lastSearchAllList.length > 0) {
                updateRadiusSearch(newPosition);
            }
        }
    }

    // 실시간 위치 추적 시작
    function startLocationTracking() {
        const btn = document.getElementById('btnCurrentLocation');

        const isSecure = location.protocol === 'https:' ||
            location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1';

        if (!isSecure) {
            showMessage('⚠️ 위치 서비스는 HTTPS에서만 사용 가능합니다', 'error');
            return;
        }

        if (!navigator.geolocation) {
            showMessage('❌ 이 브라우저는 위치 서비스를 지원하지 않습니다', 'error');
            return;
        }

        if (watchId !== null) {
            stopLocationTracking();
            return;
        }

        btn.style.background = '#2563eb';
        btn.style.color = 'white';
        showMessage('🔍 실시간 위치 추적 시작', 'info');
        isRealtimeTracking = true;

        // 현재 위치 한 번 즉시 가져와서 지도 이동 (필요 시 저정밀 모드로 재시도)
        requestSinglePosition(true);

        // 실시간 추적 시작
        startGeoWatch(true);
    }

    // 위치 추적 중지
    function stopLocationTracking() {
        const wasTracking = isRealtimeTracking || watchId !== null;
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        if (!wasTracking) return;

        isRealtimeTracking = false;
        updateRealtimeRadius(null, 0);

        const btn = document.getElementById('btnCurrentLocation');
        if (btn) {
            btn.style.background = 'white';
            btn.style.color = '#2563eb';
        }

        showMessage('⏸️ 위치 추적 중지', 'info');
    }

    // 지도 초기화
    async function initMap() {
        if (window.kakao && kakao.maps) {
            try {
                const mapContainer = document.getElementById('map');
                const mapOption = {
                    center: new kakao.maps.LatLng(37.5665, 126.9780),
                    level: 5
                };

                map = new kakao.maps.Map(mapContainer, mapOption);

                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                const dismissInfoWindow = () => closeCurrentInfoWindow();
                kakao.maps.event.addListener(map, 'click', dismissInfoWindow);
                kakao.maps.event.addListener(map, 'dragstart', dismissInfoWindow);
                kakao.maps.event.addListener(map, 'zoom_changed', dismissInfoWindow);

                clusterer = new kakao.maps.MarkerClusterer({
                    map: map,
                    averageCenter: true,
                    minLevel: 6
                });

                // 지도 드래그 종료 시 반경 검색 갱신
                kakao.maps.event.addListener(map, 'dragend', function () {
                    const center = map.getCenter();
                    updateRadiusSearch(center);
                });

                console.log('✅ 카카오맵 로드 완료');

                const searchSido = document.getElementById('searchSido');
                const searchSigungu = document.getElementById('searchSigungu');
                const regionSearchBtn = document.getElementById('regionSearchBtn');
                const btnCurrentLocation = document.getElementById('btnCurrentLocation');

                // 로그인 지역 코드로 셀렉트 초기화
                const loginSidoCd = document.getElementById('loginSidoCd')?.value;
                const loginSigunguCd = document.getElementById('loginSigunguCd')?.value;

                if (searchSido) {
                    searchSido.addEventListener('change', async function (e) {
                        await loadSigunguList(e.target.value);
                    });
                    console.log('✅ 시도 선택 이벤트 등록 완료');
                } else {
                    console.error('❌ searchSido 엘리먼트를 찾을 수 없습니다');
                }

                if (regionSearchBtn) {
                    regionSearchBtn.addEventListener('click', searchParkingByRegion);
                    console.log('✅ 검색 버튼 이벤트 등록 완료');
                } else {
                    console.error('❌ regionSearchBtn 엘리먼트를 찾을 수 없습니다');
                }

                if (btnCurrentLocation) {
                    btnCurrentLocation.addEventListener('click', startLocationTracking);
                    console.log('✅ 위치 버튼 이벤트 등록 완료');
                }

                await loadSidoList(loginSidoCd);

                // 🔥 지도 복원 로직 수정
                const isReturnFromList = sessionStorage.getItem('parkingMapReturn');
                if (isReturnFromList === 'true') {
                    console.log('🔄 지도 상태 복원 시작');
                    // ⭐ 시도 목록 로드 완료 후 복원 실행
                    setTimeout(async () => {
                        await restoreMapState();
                    }, 800); // 시도 목록 로드 대기
                } else {
                    setTimeout(async () => {
                        const centered = await centerMapToLoginRegion(map);
                        if (!centered) {
                            startLocationTracking();
                        }
                    }, 500);
                }

            } catch (error) {
                console.error('❌ 지도 초기화 오류:', error);
                showMessage('❌ 지도를 불러올 수 없습니다', 'error');
            }
        }
    }

    // 🔥 로그인 지역으로 지도 중심 이동
    function centerMapToLoginRegion(targetMap) {
        return new Promise((resolve) => {
            let sido = document.getElementById('loginSidoNm')?.value?.trim();
            let sigungu = document.getElementById('loginSigunguNm')?.value?.trim();
            const loginSidoCd = document.getElementById('loginSidoCd')?.value;
            const loginSigunguCd = document.getElementById('loginSigunguCd')?.value;

            // 이름이 비어있으면 셀렉트 박스의 표시 텍스트를 사용
            const searchSidoEl = document.getElementById('searchSido');
            const searchSigunguEl = document.getElementById('searchSigungu');

            // 코드로 셀렉트 일치/텍스트 추출 시도
            if ((!sido || !sido.trim()) && loginSidoCd && searchSidoEl) {
                const match = Array.from(searchSidoEl.options).find(o => o.value === loginSidoCd);
                if (match) {
                    searchSidoEl.value = loginSidoCd;
                    if (match.text && match.text !== '시도 선택') sido = match.text.trim();
                }
            }
            if ((!sigungu || !sigungu.trim()) && loginSigunguCd && searchSigunguEl) {
                const match = Array.from(searchSigunguEl.options).find(o => o.value === loginSigunguCd);
                if (match) {
                    searchSigunguEl.value = loginSigunguCd;
                    if (match.text && match.text !== '시군구 선택') sigungu = match.text.trim();
                }
            }

            if ((!sido || !sido.trim()) && searchSidoEl) {
                const sidoText = searchSidoEl.options[searchSidoEl.selectedIndex]?.text;
                if (sidoText && sidoText !== '시도 선택') sido = sidoText.trim();
            }
            if ((!sigungu || !sigungu.trim()) && searchSigunguEl) {
                const sigunguText = searchSigunguEl.options[searchSigunguEl.selectedIndex]?.text;
                if (sigunguText && sigunguText !== '시군구 선택') sigungu = sigunguText.trim();
            }

            if (!sido || !sigungu || !sido.trim() || !sigungu.trim()) {
                console.warn('로그인 지역정보 없음');
                resolve(false);
                return;
            }

            const address = (sido ? sido.trim() : '') + ' ' + (sigungu ? sigungu.trim() : '');
            if (!address) {
                console.warn('로그인 지역정보 없음 (address empty)');
                resolve(false);
                return;
            }
            console.log('지도 중심 이동 시도:', address);

            const geocoder = new kakao.maps.services.Geocoder();

            geocoder.addressSearch(address, function (result, status) {
                if (status !== kakao.maps.services.Status.OK) {
                    console.error('주소 변환 실패', status);
                    resolve(false);
                    return;
                }
                const coords = result[0];
                targetMap.setCenter(new kakao.maps.LatLng(coords.y, coords.x));
                targetMap.setLevel(5);
                console.log('로그인 지역으로 지도 이동 성공');
                resolve(true);
            });
        });
    }

    // 🔥 지도 상태 복원 함수
    async function restoreMapState() {
        try {
            console.log('🔄 지도 상태 복원 시작');

            // 지도 위치 복원
            const centerData = sessionStorage.getItem('parkingMapCenter');
            const level = sessionStorage.getItem('parkingMapLevel');

            if (centerData) {
                const center = JSON.parse(centerData);
                const position = new kakao.maps.LatLng(center.lat, center.lng);
                map.setCenter(position);
                console.log('✅ 지도 중심 복원:', center);
            }

            if (level) {
                map.setLevel(parseInt(level));
                console.log('✅ 지도 레벨 복원:', level);
            }

            // 검색 조건 복원
            const sidoCd = sessionStorage.getItem('parkingMapSido');
            const sigunguCd = sessionStorage.getItem('parkingMapSigungu');

            console.log('📍 복원할 검색 조건:', {sidoCd, sigunguCd});

            if (sidoCd) {
                const sidoSelect = document.getElementById('searchSido');
                if (sidoSelect) {
                    // ⭐ 시도 선택 전 옵션 확인
                    const sidoOption = sidoSelect.querySelector('option[value="' + sidoCd + '"]');
                    if (sidoOption) {
                        sidoSelect.value = sidoCd;
                        console.log('✅ 시도 복원:', sidoCd);

                        // 시군구 목록 로드
                        if (sigunguCd) {
                            await loadSigunguList(sidoCd);

                            // ⭐ 시군구 목록 로드 완료 후 선택
                            const sigunguSelect = document.getElementById('searchSigungu');
                            if (sigunguSelect) {
                                // 짧은 대기 후 시군구 선택
                                setTimeout(() => {
                                    const sigunguOption = sigunguSelect.querySelector('option[value="' + sigunguCd + '"]');
                                    if (sigunguOption) {
                                        sigunguSelect.value = sigunguCd;
                                        console.log('✅ 시군구 복원:', sigunguCd);
                                    } else {
                                        console.warn('⚠️ 시군구 옵션을 찾을 수 없음:', sigunguCd);
                                    }
                                }, 300);
                            }
                        }

                        // ⭐ 주차장 데이터 자동 검색 (시군구 로드 대기)
                        setTimeout(async () => {
                            await searchParkingByRegion();
                        }, sigunguCd ? 600 : 300);
                    } else {
                        console.warn('⚠️ 시도 옵션을 찾을 수 없음:', sidoCd);
                    }
                }
            }

            // 세션 스토리지 정리
            sessionStorage.removeItem('parkingMapReturn');
            sessionStorage.removeItem('parkingMapCenter');
            sessionStorage.removeItem('parkingMapLevel');
            sessionStorage.removeItem('parkingMapSido');
            sessionStorage.removeItem('parkingMapSigungu');

            console.log('✅ 지도 상태 복원 완료');
            showMessage('📍 이전 위치로 복귀했습니다', 'success');

        } catch (error) {
            console.error('❌ 지도 상태 복원 실패:', error);
            showMessage('⚠️ 지도 복원 중 오류 발생', 'error');

            // 복원 실패 시 기본 동작
            setTimeout(() => {
                startLocationTracking();
            }, 500);
        }
    }

    // DOM 로드 후 실행
    window.addEventListener('DOMContentLoaded', function () {
        console.log('🚀 페이지 로드 완료');
        setupRadiusControls();
        setupTypeFilters();

        if (window.kakao && kakao.maps) {
            kakao.maps.load(initMap);
        } else {
            setTimeout(function () {
                if (window.kakao && kakao.maps) {
                    kakao.maps.load(initMap);
                } else {
                    console.error('❌ Kakao SDK 로드 실패');
                    showMessage('❌ 지도를 불러올 수 없습니다', 'error');
                }
            }, 1000);
        }
    });

    // 페이지 언로드 시 추적 중지
    window.addEventListener('beforeunload', function () {
        stopLocationTracking();
    });
</script>
</body>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
</html>
