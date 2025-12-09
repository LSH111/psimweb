<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>카카오맵 - 주차 위치 지도</title>

    <!-- 공통 스타일 -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/base.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/layout.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/components.css"/>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", sans-serif;
            background: #f8fafc;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .map-header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .map-title {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .map-description {
            font-size: 14px;
            color: #64748b;
        }

        /* 지도 컨테이너 */
        #mapContainer {
            width: 100%;
            height: 600px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }

        /* 범례 */
        .map-legend {
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .legend-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 12px;
        }

        .legend-items {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .legend-marker {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .legend-marker.legal {
            background: #3b82f6;
        }

        .legend-marker.illegal {
            background: #ef4444;
        }

        .legend-label {
            font-size: 14px;
            color: #475569;
        }

        /* 로딩 상태 */
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* 에러 메시지 */
        .error-message {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
    </style>

    <!-- 전역 변수 설정 -->
    <script>
        var contextPath = '${pageContext.request.contextPath}';
        var sessionInfo = {
            prkBizMngNo: '${prkBizMngNo}',
            sigunguCd: '${sigunguCd}',
            sidoCd: '${sidoCd}',
            userNm: '${userName}',
            mbtlnum: '${userTel}'
        };
    </script>
</head>
<body>
<div class="container">
    <!-- 헤더 -->
    <div class="map-header">
        <h1 class="map-title">🗺️ 주차 위치 지도</h1>
        <p class="map-description">카카오맵을 이용하여 주차 위치를 확인할 수 있습니다.</p>
    </div>

    <!-- 에러 메시지 영역 -->
    <div id="errorMessage" class="error-message" style="display:none;"></div>

    <!-- 지도 영역 -->
    <div style="position:relative;">
        <div id="mapContainer"></div>
        <div id="loadingOverlay" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>
    </div>

    <!-- 범례 -->
    <div class="map-legend">
        <h3 class="legend-title">범례</h3>
        <div class="legend-items">
            <div class="legend-item">
                <div class="legend-marker legal"></div>
                <span class="legend-label">적법 주차</span>
            </div>
            <div class="legend-item">
                <div class="legend-marker illegal"></div>
                <span class="legend-label">불법 주차</span>
            </div>
        </div>
    </div>
</div>

<!-- Kakao Maps SDK -->
<script type="text/javascript"
        src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=clusterer"
        onerror="console.error('❌ Kakao Maps API 스크립트 로드 실패'); window.kakaoMapsLoadError = true;">
</script>

<!-- Kakao Maps 로드 확인 -->
<script>
    (function () {

        if (window.kakaoMapsLoadError) {
            console.error('❌ Kakao Maps API 스크립트 파일 로드 실패');
            showError('Kakao Maps API를 로드할 수 없습니다.');
            return;
        }

        let checkCount = 0;
        const maxChecks = 20;

        const checkInterval = setInterval(function () {
            checkCount++;


            if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                clearInterval(checkInterval);
                window.kakaoMapsReady = true;
                initializeMap();
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                console.error('❌ Kakao Maps API 로드 실패 (최대 재시도 초과)');
                showError('Kakao Maps API 로드 시간이 초과되었습니다.');
            }
        }, 500);
    })();

    function showError(message) {
        const errorEl = document.getElementById('errorMessage');
        errorEl.textContent = '⚠️ ' + message;
        errorEl.style.display = 'block';
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    function hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
</script>

<!-- 지도 초기화 스크립트 -->
<script>
    let map = null;
    let markers = [];
    let clusterer = null;

    /**
     * 지도 초기화
     */
    function initializeMap() {
        try {
            // 지도 컨테이너
            const container = document.getElementById('mapContainer');

            // 지도 옵션 (서울시청 기준)
            const options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 3
            };

            // 지도 생성
            map = new kakao.maps.Map(container, options);

            // 클러스터러 생성
            clusterer = new kakao.maps.MarkerClusterer({
                map: map,
                averageCenter: true,
                minLevel: 5,
                disableClickZoom: true
            });

            // 샘플 마커 추가 (실제 환경에서는 API로 데이터 로드)
            addSampleMarkers();

            hideLoading();

        } catch (error) {
            console.error('❌ 지도 초기화 오류:', error);
            showError('지도를 초기화하는 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 마커 추가
     */
    function addMarker(lat, lng, isLegal, title, content) {
        if (!map) return;

        const position = new kakao.maps.LatLng(lat, lng);

        // 마커 이미지 설정
        const imageSrc = isLegal
            ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png'
            : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
        const imageSize = new kakao.maps.Size(24, 35);
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        // 마커 생성
        const marker = new kakao.maps.Marker({
            position: position,
            image: markerImage,
            title: title
        });

        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:10px; min-width:200px;">
                    <h4 style="margin:0 0 5px 0;">${title}</h4>
                    <p style="margin:0; font-size:12px; color:#666;">${content}</p>
                    <p style="margin:5px 0 0 0; font-size:11px; color:${isLegal ? '#3b82f6' : '#ef4444'};">
                        ${isLegal ? '✓ 적법 주차' : '✗ 불법 주차'}
                    </p>
                </div>`
        });

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
        });

        markers.push(marker);

        // 클러스터러에 마커 추가
        if (clusterer) {
            clusterer.addMarker(marker);
        }

        return marker;
    }

    /**
     * 샘플 마커 추가 (테스트용)
     */
    function addSampleMarkers() {
        // 서울 주요 지역에 샘플 마커 추가
        const sampleData = [
            {lat: 37.5665, lng: 126.9780, legal: true, title: '서울시청 주차장', content: '지하 3층 주차장'},
            {lat: 37.5700, lng: 126.9850, legal: false, title: '광화문 불법주차', content: '인도 위 주차'},
            {lat: 37.5650, lng: 126.9850, legal: true, title: '을지로 주차장', content: '노상 주차장'},
            {lat: 37.5600, lng: 126.9750, legal: false, title: '명동 불법주차', content: '이중주차'},
            {lat: 37.5720, lng: 126.9850, legal: true, title: '종로 주차장', content: '공영주차장'}
        ];

        sampleData.forEach(data => {
            addMarker(data.lat, data.lng, data.legal, data.title, data.content);
        });

    }

    /**
     * 모든 마커 제거
     */
    function clearMarkers() {
        if (clusterer) {
            clusterer.clear();
        }
        markers = [];
    }

    /**
     * 특정 위치로 지도 이동
     */
    function moveToLocation(lat, lng, level = 3) {
        if (!map) return;
        const moveLatLon = new kakao.maps.LatLng(lat, lng);
        map.setCenter(moveLatLon);
        map.setLevel(level);
    }
</script>
</body>
</html>
