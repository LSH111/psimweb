
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <title>주차장 지도</title>

    <!-- Kakao Maps JS -->
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=services"></script>


    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100%; height: 100vh; overflow: hidden; font-family: 'Pretendard', -apple-system, sans-serif; }
        #map { width: 100%; height: 100%; }

        /* 🔥 검색 패널 - 접을 수 있는 형태 */
        .search-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 10;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
            width: calc(100% - 40px);
            transition: all 0.3s ease;
        }

        /* 검색 헤더 (항상 표시) */
        .search-header {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e2e8f0;
            cursor: pointer;
            user-select: none;
        }

        .search-header:hover {
            background: #f8fafc;
        }

        .search-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .toggle-icon {
            font-size: 20px;
            color: #64748b;
            transition: transform 0.3s ease;
        }

        .search-panel.collapsed .toggle-icon {
            transform: rotate(-90deg);
        }

        /* 검색 컨텐츠 (접었다 펼 수 있음) */
        .search-content {
            max-height: calc(100vh - 200px);
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .search-panel.collapsed .search-content {
            max-height: 0;
        }

        .search-section {
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
        }

        .search-input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 10px;
        }

        .search-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
        }

        .search-input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .search-btn {
            width: 100%;
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .search-btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }

        .search-btn:active {
            transform: translateY(0);
        }

        .search-result {
            margin-top: 10px;
            padding: 8px 12px;
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 6px;
            font-size: 13px;
            color: #166534;
        }

        .search-error {
            background: #fef2f2;
            border-color: #fca5a5;
            color: #991b1b;
        }

        /* 🔥 주차장 리스트 */
        .parking-list-section {
            max-height: 400px;
            overflow-y: auto;
            padding: 12px 16px;
        }

        .parking-list-header {
            font-size: 13px;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px;
            background: #f1f5f9;
            border-radius: 6px;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .parking-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .parking-item:hover {
            background: #eff6ff;
            border-color: #3b82f6;
            transform: translateX(4px);
        }

        .parking-item-name {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }

        .parking-item-type {
            display: inline-block;
            padding: 2px 6px;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
        }

        .parking-item-type.type-01 {
            background: #fee2e2;
            color: #991b1b;
        }

        .parking-item-type.type-02 {
            background: #dbeafe;
            color: #1e40af;
        }

        .parking-item-type.type-03 {
            background: #dcfce7;
            color: #166534;
        }

        .parking-item-location {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 2px;
            font-weight: 500;
        }

        .parking-item-address {
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.4;
        }

        .parking-list-empty {
            text-align: center;
            padding: 32px 16px;
            color: #94a3b8;
            font-size: 13px;
        }

        /* 현재 위치 버튼 */
        .location-btn {
            position: absolute;
            bottom: 30px;
            right: 30px;
            z-index: 10;
            background: white;
            border: 2px solid #2563eb;
            border-radius: 50%;
            width: 56px;
            height: 56px;
            font-size: 24px;
            color: #2563eb;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .location-btn:hover {
            background: #2563eb;
            color: white;
            transform: scale(1.1);
        }

        /* 상태 메시지 */
        .status-message {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            background: white;
            border-radius: 8px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
            pointer-events: none;
            white-space: nowrap;
        }

        .status-message.success {
            border-left: 4px solid #10b981;
            color: #059669;
            background: #f0fdf4;
        }
        .status-message.error {
            border-left: 4px solid #ef4444;
            color: #dc2626;
            background: #fef2f2;
        }
        .status-message.info {
            border-left: 4px solid #3b82f6;
            color: #2563eb;
            background: #eff6ff;
        }

        /* 모바일 대응 */
        @media (max-width: 768px) {
            .search-panel {
                top: 10px;
                left: 10px;
                right: 10px;
                width: auto;
                max-width: none;
            }

            .parking-list-section {
                max-height: 300px;
            }

            .location-btn {
                bottom: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                font-size: 20px;
            }

            .status-message {
                bottom: 80px;
                font-size: 12px;
                padding: 10px 16px;
            }
        }
    </style>
</head>
<body>
<!-- 지도 영역 -->
<div id="map">
    <!-- 🔥 접을 수 있는 검색 패널 -->
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

    // 🔥 검색 패널 토글
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

    // 시도 목록 로드
    async function loadSidoList() {
        try {
            const response = await fetch('/cmm/codes/sido');
            const result = await response.json();
            const sidoSelect = document.getElementById('searchSido');

            if (!sidoSelect) {
                console.error('❌ searchSido 엘리먼트를 찾을 수 없습니다');
                return;
            }

            sidoSelect.innerHTML = '<option value="">시도 선택</option>';

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sidoSelect.appendChild(option);
                });
                console.log('✅ 시도 목록 로드 완료:', result.data.length + '개');
            }
        } catch (error) {
            console.error('❌ 시도 목록 로드 실패:', error);
        }
    }

    // 시군구 목록 로드
    async function loadSigunguList(sidoCd) {
        try {
            const sigunguSelect = document.getElementById('searchSigungu');

            if (!sigunguSelect) {
                console.error('❌ searchSigungu 엘리먼트를 찾을 수 없습니다');
                return;
            }

            sigunguSelect.innerHTML = '<option value="">시군구 선택</option>';
            sigunguSelect.disabled = true;

            if (!sidoCd) return;

            const response = await fetch(`/cmm/codes/sigungu?sidoCd=${sidoCd}`);
            const result = await response.json();

            if (result.success && result.data) {
                result.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.codeCd;
                    option.textContent = item.codeNm;
                    sigunguSelect.appendChild(option);
                });
                sigunguSelect.disabled = false;
                console.log('✅ 시군구 목록 로드 완료:', result.data.length + '개');
            }
        } catch (error) {
            console.error('❌ 시군구 목록 로드 실패:', error);
        }
    }

    // 주차장 검색
    async function searchParkingByRegion() {
        const sidoCd = document.getElementById('searchSido').value;
        const sigunguCd = document.getElementById('searchSigungu').value;

        // 🔥 시도/시군구 선택 정보 로깅
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

            const params = new URLSearchParams();
            params.append('sidoCd', sidoCd);

            // 🔥 시군구 코드도 반드시 전달
            if (sigunguCd) {
                params.append('sigunguCd', sigunguCd);
            }

            console.log('📤 전송 파라미터:', params.toString());

            const response = await fetch(`/prk/parking-map-data?${params}`);
            const result = await response.json();

            console.log('📥 응답 데이터:', result);

            if (result.success && result.list && result.list.length > 0) {
                console.log('✅ 주차장 검색 성공:', result.list.length + '개');

                // 🔥 검색 조건 표시 메시지 개선
                let searchCondition = sidoText;
                if (sigunguText && sigunguText !== '시군구 선택') {
                    searchCondition += ' ' + sigunguText;
                }

                displayParkingMarkers(result.list);
                displayParkingList(result.list);  // 🔥 리스트 표시 추가
                showMessage(`✅ ${result.list.length}개 주차장 표시`, 'success');
                showSearchResult(`${searchCondition}: ${result.list.length}개 주차장`);
            } else {
                displayParkingMarkers([]);
                displayParkingList([]);  // 🔥 빈 리스트 표시

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

    // 🔥 주차장 리스트 표시
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

        const validParkings = parkingList.filter(p => p.prkPlceLat && p.prkPlceLon);

        if (validParkings.length === 0) {
            itemsContainer.innerHTML = '<div class="parking-list-empty">표시할 수 있는 주차장이 없습니다</div>';
            return;
        }

        itemsContainer.innerHTML = validParkings.map(parking => {
            const locationParts = [];
            if (parking.sidoNm) locationParts.push(parking.sidoNm);
            if (parking.sigunguNm) locationParts.push(parking.sigunguNm);
            const locationDisplay = locationParts.join(' ') || '';

            const typeClass = parking.prkPlceType === '01' ? 'type-01' :
                parking.prkPlceType === '02' ? 'type-02' :
                    parking.prkPlceType === '03' ? 'type-03' : '';

            let html = '<div class="parking-item" onclick="moveToParking(' + parking.prkPlceLat + ', ' + parking.prkPlceLon + ', \'' + escapeHtml(parking.prkplceNm) + '\', \'' + parking.prkPlceManageNo + '\', \'' + parking.prkPlceType + '\')">';
            html += '<div class="parking-item-name">';
            html += escapeHtml(parking.prkplceNm);
            html += '<span class="parking-item-type ' + typeClass + '">' + getParkingTypeText(parking.prkPlceType) + '</span>';
            html += '</div>';

            if (locationDisplay) {
                html += '<div class="parking-item-location">📍 ' + escapeHtml(locationDisplay) + '</div>';
            }

            html += '<div class="parking-item-address">' + escapeHtml(parking.dtadd || '주소 정보 없음') + '</div>';
            html += '</div>';

            return html;
        }).join('');
    }

    // 🔥 주차장으로 이동
    function moveToParking(lat, lng, name, manageNo, type) {
        const position = new kakao.maps.LatLng(parseFloat(lat), parseFloat(lng));
        map.setCenter(position);
        map.setLevel(3);

        // 해당 마커 찾아서 클릭 이벤트 트리거
        const targetMarker = parkingMarkers.find(marker => {
            const markerPos = marker.getPosition();
            return Math.abs(markerPos.getLat() - lat) < 0.00001 &&
                Math.abs(markerPos.getLng() - lng) < 0.00001;
        });

        if (targetMarker) {
            kakao.maps.event.trigger(targetMarker, 'click');
        }

        showMessage('📍 ' + name, 'info');

        // 🔥 모바일에서는 자동으로 패널 접기
        if (window.innerWidth <= 768) {
            const panel = document.getElementById('searchPanel');
            if (panel && !panel.classList.contains('collapsed')) {
                panel.classList.add('collapsed');
            }
        }
    }

    // 🔥 HTML 이스케이프 처리
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
            { offset: new kakao.maps.Point(20, 20) }
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

    // 주차장 타입별 마커 이미지 경로 반환
    function getParkingMarkerImage(prkPlceType) {
        const basePath = '/static/img/prking/';
        let color = 'blue';

        if (prkPlceType === '노상' || prkPlceType === '01') {
            color = 'red';
        } else if (prkPlceType === '노외' || prkPlceType === '02') {
            color = 'blue';
        } else if (prkPlceType === '부설' || prkPlceType === '03') {
            color = 'green';
        }

        return basePath + `marker-${color}-P-64.svg`;
    }

    // 주차장 마커 생성
    function createParkingMarker(parking) {
        const imageSrc = getParkingMarkerImage(parking.prkPlceType);
        const imageSize = new kakao.maps.Size(64, 64);
        const imageOption = { offset: new kakao.maps.Point(16, 32) };

        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(parking.lat, parking.lng),
            image: markerImage,
            title: parking.prkplceNm,
            clickable: true
        });

        kakao.maps.event.addListener(marker, 'click', function() {
            showParkingInfo(parking, marker);
        });

        return marker;
    }

    // 주차장 정보 인포윈도우 표시
    function showParkingInfo(parking, marker) {
        // 🔥 행정구역 정보 조합
        const locationParts = [];
        if (parking.sidoNm) locationParts.push(parking.sidoNm);
        if (parking.sigunguNm) locationParts.push(parking.sigunguNm);
        const locationDisplay = locationParts.join(' ') || '';

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
        content += '<a href="javascript:void(0);" ';
        content += 'onclick="openParkingDetail(\'' + parking.prkPlceManageNo + '\', \'' + parking.prkPlceType + '\')" ';
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
        // 🔥 현재 검색 조건 저장 (돌아왔을 때 복원용)
        sessionStorage.setItem('parkingMapReturn', 'true');
        sessionStorage.setItem('parkingMapScrollY', window.scrollY);

        const url = `/prk/parkinglist?openDetail=${encodeURIComponent(prkPlceManageNo)}&type=${encodeURIComponent(prkPlceType)}`;
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

        const validParkings = parkingList.filter(p => p.prkPlceLat && p.prkPlceLon);

        console.log('📍 유효한 좌표를 가진 주차장:', validParkings.length + '개');

        if (validParkings.length === 0) return;

        const bounds = new kakao.maps.LatLngBounds();

        validParkings.forEach(parking => {
            const marker = createParkingMarker({
                ...parking,
                lat: parseFloat(parking.prkPlceLat),
                lng: parseFloat(parking.prkPlceLon)
            });

            marker.setMap(map);
            parkingMarkers.push(marker);

            bounds.extend(new kakao.maps.LatLng(
                parseFloat(parking.prkPlceLat),
                parseFloat(parking.prkPlceLon)
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
                switch(error.code) {
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
    function initMap() {
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

                console.log('✅ 카카오맵 로드 완료');

                // 🔥 시도 선택 이벤트 등록 전 엘리먼트 확인
                const searchSido = document.getElementById('searchSido');
                const searchSigungu = document.getElementById('searchSigungu');
                const regionSearchBtn = document.getElementById('regionSearchBtn');
                const btnCurrentLocation = document.getElementById('btnCurrentLocation');

                if (searchSido) {
                    searchSido.addEventListener('change', async function(e) {
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

                // 시도 목록 로드
                loadSidoList();

                // 자동 위치 추적 시작
                setTimeout(() => {
                    startLocationTracking();
                }, 500);

            } catch (error) {
                console.error('❌ 지도 초기화 오류:', error);
                showMessage('❌ 지도를 불러올 수 없습니다', 'error');
            }
        }
    }

    // DOM 로드 후 실행
    window.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 페이지 로드 완료');

        if (window.kakao && kakao.maps) {
            kakao.maps.load(initMap);
        } else {
            setTimeout(function() {
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
    window.addEventListener('beforeunload', function() {
        stopLocationTracking();
    });
</script>
</body>
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
</html>