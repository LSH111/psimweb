<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
    <title>주차장 지도</title>

    <!-- 외부 보안/확장 프로그램(SES/lockdown) 감지 및 안내 -->
    <script>
        (function () {
            const hasSes = !!(window.lockdown || window.ses || window.Compartment);
            const hasMozExtensionScript = Array.from(document.scripts || []).some(s => (s.src || '').startsWith('moz-extension://'));
            if (hasSes || hasMozExtensionScript) {
                console.warn('지도 로딩을 방해할 수 있는 보안 스크립트/확장 프로그램이 감지되었습니다.');
                const msg = document.createElement('div');
                msg.setAttribute('role', 'status');
                msg.style.cssText = 'padding:12px;background:#fee2e2;color:#7f1d1d;border:1px solid #fecdd3;margin:8px 12px;border-radius:8px;';
                msg.innerText = '지도 로딩을 방해할 수 있는 브라우저 확장 프로그램/보안 스크립트가 감지되었습니다. 확장 프로그램을 잠시 비활성화한 후 다시 시도하세요.';
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.prepend(msg);
                });
            }
        })();
    </script>

    <script type="text/javascript">
        // 컨텍스트 경로 (예: /spis)
        const contextPath = '${pageContext.request.contextPath}';
    </script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js" crossorigin="anonymous"></script>
    <!-- Kakao Maps JS -->
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=services"></script>

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
            overflow: hidden !important;
            transition: max-height 0.3s ease !important;
        }

        .search-panel.collapsed .search-content {
            max-height: 0 !important;
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
            display: flex !important;
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

        .parking-item.disabled {
            opacity: 0.6 !important;
            cursor: default !important;
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

        .parking-item-info {
            margin-bottom: 8px !important;
            padding: 8px 10px !important;
            border: 1px dashed #cbd5e1 !important;
            background: #f8fafc !important;
            color: #475569 !important;
            border-radius: 6px !important;
            font-size: 12px !important;
        }

        .parking-item-location.no-coord {
            color: #b91c1c !important;
            font-weight: 600 !important;
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
    let accuracyCircle = null;
    let watchId = null;
    let parkingMarkers = [];

    // 검색 패널 토글
    function toggleSearchPanel() {
        const panel = document.getElementById('searchPanel');
        panel.classList.toggle('collapsed');
    }

    // 상태 메시지 표시
    function showMessage(text, type = 'info') {
        const messageEl = document.getElementById('statusMessage');
        messageEl.textContent = text;
        messageEl.className = `status-message ${type}`;
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

    // 좌표 유효성 체크
    function hasCoordinates(parking) {
        if (!parking) return false;
        const lat = parseFloat(parking.prkPlceLat);
        const lon = parseFloat(parking.prkPlceLon);
        return Number.isFinite(lat) && Number.isFinite(lon);
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

        const sidoSelect = document.getElementById('searchSido');
        const sigunguSelect = document.getElementById('searchSigungu');

        const sidoText = sidoSelect.options[sidoSelect.selectedIndex]?.text || '';
        const sigunguText = sigunguSelect.options[sigunguSelect.selectedIndex]?.text || '';

        console.log('🔍 검색 조건:', {
            sidoCd: sidoCd,
            sidoText: sidoText,
            sigunguCd: sigunguCd,
            sigunguText: sigunguText
        });

        if (!sidoCd) {
            showSearchResult('시도를 선택해주세요', true);
            return;
        }

        try {
            showMessage('🔍 주차장 검색 중...', 'info');

            const params = {sidoCd: sidoCd};
            if (sigunguCd) params.sigunguCd = sigunguCd;

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

                displayParkingMarkers(result.list);
                displayParkingList(result.list);
                showMessage(`✅ ${result.list.length}개 주차장 표시`, 'success');

                const searchResult = document.getElementById('searchResult');
                if (searchResult) {
                    searchResult.style.display = 'none';
                }
            } else {
                displayParkingMarkers([]);
                displayParkingList([]);

                let searchCondition = sidoText;
                if (sigunguText && sigunguText !== '시군구 선택') {
                    searchCondition += ' ' + sigunguText;
                }

                showSearchResult(`${searchCondition}: 검색 결과 없음`, true);
                showMessage('검색 결과 없음', 'error');
            }
        } catch (error) {
            console.error('❌ 주차장 검색 실패:', error);
            showSearchResult('검색 중 오류가 발생했습니다', true);
            showMessage('검색 실패', 'error');
        }
    }

    // 주차장 리스트 표시
    function displayParkingList(parkingList) {
        const headerEl = document.getElementById('parkingListHeader');
        const itemsContainer = document.getElementById('parkingListItems');
        const countEl = document.getElementById('parkingCount');

        if (!parkingList || parkingList.length === 0) {
            headerEl.style.display = 'none';
            itemsContainer.innerHTML = '<div class="parking-list-empty">검색 결과가 없습니다</div>';
            return;
        }

        headerEl.style.display = 'flex';
        countEl.textContent = parkingList.length + '개';

        const validParkings = parkingList.filter(hasCoordinates);
        const missingCoordsCount = parkingList.length - validParkings.length;

        let infoHtml = '';
        if (missingCoordsCount > 0) {
            infoHtml = '<div class="parking-item-info">좌표 정보가 없는 ' + missingCoordsCount + '건은 지도 이동/표시가 불가합니다.</div>';
        }

        itemsContainer.innerHTML = infoHtml + parkingList.map(parking => {
            const lat = parseFloat(parking.prkPlceLat);
            const lon = parseFloat(parking.prkPlceLon);
            const hasCoord = Number.isFinite(lat) && Number.isFinite(lon);
            const locationParts = [];
            if (parking.sidoNm) locationParts.push(parking.sidoNm);
            if (parking.sigunguNm) locationParts.push(parking.sigunguNm);
            const locationDisplay = locationParts.join(' ') || '';

            const typeClass = parking.prkPlceType === '01' ? 'type-01' :
                parking.prkPlceType === '02' ? 'type-02' :
                    parking.prkPlceType === '03' ? 'type-03' : '';

            const itemClasses = hasCoord ? 'parking-item' : 'parking-item disabled';
            const onClickAttr = hasCoord
                ? ' onclick="moveToParking(' + lat + ', ' + lon + ', \'' + escapeHtml(parking.prkplceNm) + '\', \'' + parking.prkPlceManageNo + '\', \'' + parking.prkPlceType + '\')"'
                : '';

            let html = '<div class="' + itemClasses + '"' + onClickAttr + '>';
            html += '<div class="parking-item-name">';
            html += escapeHtml(parking.prkplceNm);
            html += '<span class="parking-item-type ' + typeClass + '">' + getParkingTypeText(parking.prkPlceType) + '</span>';
            html += '</div>';

            if (locationDisplay) {
                const locClass = hasCoord ? 'parking-item-location' : 'parking-item-location no-coord';
                const suffix = hasCoord ? '' : ' (좌표 없음)';
                html += '<div class="' + locClass + '">📍 ' + escapeHtml(locationDisplay) + suffix + '</div>';
            } else if (!hasCoord) {
                html += '<div class="parking-item-location no-coord">좌표 정보 없음 (지도 표시 불가)</div>';
            }

            html += '<div class="parking-item-address">' + escapeHtml(parking.dtadd || '주소 정보 없음') + '</div>';
            html += '</div>';

            return html;
        }).join('');
    }

    // 주차장으로 이동
    function moveToParking(lat, lng, name, manageNo, type) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
            showMessage('이 주차장은 좌표 정보가 없어 지도 이동이 불가합니다.', 'error');
            return;
        }

        const position = new kakao.maps.LatLng(latNum, lngNum);
        map.setCenter(position);
        map.setLevel(3);

        const targetMarker = parkingMarkers.find(marker => {
            const markerPos = marker.getPosition();
            return Math.abs(markerPos.getLat() - latNum) < 0.00001 &&
                Math.abs(markerPos.getLng() - lngNum) < 0.00001;
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

    // 정확도 원 생성
    function createAccuracyCircle() {
        return new kakao.maps.Circle({
            strokeWeight: 2,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            fillColor: '#3b82f6',
            fillOpacity: 0.15
        });
    }

    // 주차장 타입별 마커 이미지 경로 반환 (코드 01/02/03 우선)
    /*function getParkingMarkerImage(prkPlceType) {
        const type = (prkPlceType ?? '').toString().trim();

        let color = 'blue'; // 기본값
        if (['노상', '01', '1', 'on', 'ON'].includes(type)) {
            return `/static/img/prking/marker-red-P-64.svg`;
        } else if (['노외', '02', '2', 'off', 'OFF'].includes(type)) {
            return `/static/img/prking/marker-blue-P-64.svg`;
        } else if (['부설', '03', '3', 'build', 'BUILD', 'bld', 'BLD'].includes(type)) {
            return `/static/img/prking/marker-green-P-64.svg`;
        }
    }*/
    function getParkingMarkerImage(prkPlceType) {
        const base = '<c:url value="/static/img/prking"/>';
        const type = (prkPlceType ?? '').toString().trim();

        if (['노상', '01', '1', 'on', 'ON'].includes(type)) return base + '/marker-red-P-64.svg';
        if (['노외', '02', '2', 'off', 'OFF'].includes(type)) return base + '/marker-blue-P-64.svg';
        if (['부설', '03', '3', 'build', 'BUILD', 'bld', 'BLD'].includes(type)) return base + '/marker-green-P-64.svg';

        return base + '/marker-blue-P-64.svg'; // fallback
    }

    // 주차장 마커 생성
    function createParkingMarker(parking) {
        const typeForMarker = parking.prkPlceTypeCd || parking.prkPlceType;
        const imageSrc = getParkingMarkerImage(typeForMarker);
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

    // 주차장 정보 인포윈도우 표시
    function showParkingInfo(parking, marker) {
        const locationParts = [];
        if (parking.sidoNm) locationParts.push(parking.sidoNm);
        if (parking.sigunguNm) locationParts.push(parking.sigunguNm);
        const locationDisplay = locationParts.join(' ') || '';
        const detailUrl = contextPath + '/prk/parkinglist?openDetail=' +
            encodeURIComponent(parking.prkPlceManageNo) +
            '&type=' + encodeURIComponent(parking.prkPlceType);

        let content = '<div style="padding:15px;min-width:200px;max-width:300px;">';
        content += '<div style="font-weight:bold;font-size:14px;margin-bottom:8px;color:#1e40af;">';
        content += parking.prkplceNm;
        content += '</div>';
        content += '<div style="font-size:12px;color:#666;margin-bottom:4px;">';
        content += '<span style="display:inline-block;padding:2px 6px;background:#e0e7ff;border-radius:4px;font-size:11px;margin-right:4px;">';
        content += getParkingTypeText(parking.prkPlceType);
        content += '</span>';
        content += '</div>';

        if (locationDisplay) {
            content += '<div style="font-size:12px;color:#666;margin-bottom:4px;font-weight:500;">';
            content += '📍 ' + locationDisplay;
            content += '</div>';
        }

        content += '<div style="font-size:12px;color:#666;margin-bottom:8px;">';
        content += parking.dtadd || '주소 정보 없음';
        content += '</div>';
        content += '<a href="' + detailUrl + '" ';
        content += 'onclick="openParkingDetail(\'' + parking.prkPlceManageNo + '\', \'' + parking.prkPlceType + '\'); return false;" ';
        content += 'aria-label="주차장 상세보기" ';
        content += 'style="display:inline-block;padding:6px 12px;background:#2563eb;color:white;text-decoration:none;border-radius:4px;font-size:12px;cursor:pointer;">';
        content += '상세보기';
        content += '</a>';
        content += '</div>';

        const infowindow = new kakao.maps.InfoWindow({
            content: content,
            removable: true
        });

        infowindow.open(map, marker);
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
        if (type === '노상' || type === '01') return '노상';
        if (type === '노외' || type === '02') return '노외';
        if (type === '부설' || type === '03') return '부설';
        return type;
    }

    // 주차장 마커 표시
    function displayParkingMarkers(parkingList) {
        parkingMarkers.forEach(marker => marker.setMap(null));
        parkingMarkers = [];

        const validParkings = (parkingList || [])
            .map(p => ({
                ...p,
                lat: parseFloat(p.prkPlceLat),
                lng: parseFloat(p.prkPlceLon)
            }))
            .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

        console.log('📍 유효한 좌표를 가진 주차장:', validParkings.length + '개');

        if (validParkings.length === 0) return;

        const bounds = new kakao.maps.LatLngBounds();

        validParkings.forEach(parking => {
            const marker = createParkingMarker(parking);

            marker.setMap(map);
            parkingMarkers.push(marker);

            bounds.extend(new kakao.maps.LatLng(
                parking.lat,
                parking.lng
            ));
        });

        if (validParkings.length > 0) {
            map.setBounds(bounds);
        }
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

        if (!accuracyCircle) {
            accuracyCircle = createAccuracyCircle();
            accuracyCircle.setMap(map);
        }
        accuracyCircle.setPosition(newPosition);
        accuracyCircle.setRadius(Math.max(10, accuracy));
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

        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => {
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
                stopLocationTracking();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // 위치 추적 중지
    function stopLocationTracking() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;

            const btn = document.getElementById('btnCurrentLocation');
            btn.style.background = 'white';
            btn.style.color = '#2563eb';

            showMessage('⏸️ 위치 추적 중지', 'info');
        }
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

                map.relayout();
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

            const address = `${sido.trim()} ${sigungu.trim()}`.trim();
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
                    const sidoOption = sidoSelect.querySelector(`option[value="${sidoCd}"]`);
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
                                    const sigunguOption = sigunguSelect.querySelector(`option[value="${sigunguCd}"]`);
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
