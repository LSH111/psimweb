<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <title>주차이용실태관리</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/usage-status.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/usage-add.css"/>
    <script src="${pageContext.request.contextPath}/static/vendor/exifr/full.umd.js"></script>
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>

    <!-- 🔥 1. 전역 변수 먼저 정의 -->
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

    <style>
        /* 🔥 파일명 표시 스타일 */
        .file-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
        }

        .file-item {
            position: relative;
            display: inline-block;
            padding: 4px 10px;
            
            background-color: #f1f5f9;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-item:hover {
            background-color: #e0e7ff;
            color: #4f46e5;
            transform: translateY(-1px);
        }

        .loading-files,
        .no-files,
        .error-files {
            font-size: 12px;
            color: #94a3b8;
            font-style: italic;
        }

        .error-files {
            color: #ef4444;
        }

        /* 🔥 이미지 미리보기 툴팁 */
        .image-preview-tooltip {
            position: fixed;
            display: none;
            z-index: 10000;
            max-width: 450px;
            max-height: 450px;
            border: 3px solid #334155;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            background: white;
            pointer-events: none;
            overflow: hidden;
        }

        .image-preview-tooltip img {
            display: block;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            background: #f8fafc;
        }

        /* 카드에 파일 영역 스타일 */
        .card-files-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }

        .card-files-label {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 6px;
            font-weight: 500;
        }
    </style>
</head>
<body>

<!-- Content 영역 -->
<main class="app-content">
    <div class="container">
        <div class="card">
            <div class="wrap">
                <h1 class="title">주차이용실태관리</h1>

                <!-- 검색 패널 -->
                <section class="panel" aria-label="검색 조건">
                    <form id="searchForm">
                        <div class="filters">
                            <div>
                                <label for="searchYear">조사년도</label>
                                <div class="control">
                                    <select id="searchYear" name="searchYear">
                                        <option value="">전체</option>
                                        <option value="2025">2025년</option>
                                        <option value="2024">2024년</option>
                                        <option value="2023">2023년</option>
                                        <option value="2022">2022년</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="searchSido">시/도</label>
                                <div class="control">
                                    <select id="searchSido" name="searchSidoCode">
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="searchSigungu">시/군/구</label>
                                <div class="control">
                                    <select id="searchSigungu" name="searchSigunguCode" disabled>
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="searchEmd">읍/면/동</label>
                                <div class="control">
                                    <select id="searchEmd" name="searchEmdCode" disabled>
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="searchLawCd">적/불</label>
                                <div class="control">
                                    <select id="searchLawCd" name="searchLawCd">
                                        <option value="">전체</option>
                                        <option value="1">적</option>
                                        <option value="2">불</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="searchVehicleNo">차량번호</label>
                                <div class="control">
                                    <input id="searchVehicleNo" name="searchVehicleNo" type="text"
                                           placeholder="예) 12가3456"/>
                                </div>
                            </div>
                        </div>
                        <div class="actions">
                            <button type="submit" class="btn">검색</button>
                            <button type="button" id="resetBtn" class="btn ghost">초기화</button>
                        </div>
                    </form>
                </section>

                <!-- 결과/탭 -->
                <section class="result-panel one-card">
                    <div class="summary-header"
                         style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div class="summary" id="summary">총 0건</div>
                        <div class="actions">
                            <button type="button" id="btnAdd" class="btn">추가</button>
                        </div>
                    </div>

                    <div class="tabs" role="tablist" aria-label="목록">
                        <button id="tabList" class="tab-btn active" role="tab" aria-controls="panelList"
                                aria-selected="true">목록
                        </button>
                        <button id="tabAdd" class="tab-btn" role="tab" aria-controls="panelAdd"
                                aria-selected="false" style="display:none;">
                            <span class="tab-label">등록</span>
                            <span class="tab-close" aria-label="탭 닫기">×</span>
                        </button>
                    </div>

                    <div class="tab-panels">
                        <!-- 목록 패널 -->
                        <div id="panelList" class="tab-panel active" role="tabpanel" aria-labelledby="tabList">
                            <!-- 지도 영역 -->
                            <div id="mapContainer"
                                 style="width:100%; height:400px; margin-bottom:20px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);"></div>

                            <!-- 범례 -->
                            <div style="display:flex; gap:16px; margin-bottom:16px; padding:12px; background:#f8fafc; border-radius:6px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div style="width:12px; height:12px; background:#3b82f6; border-radius:50%;"></div>
                                    <span style="font-size:0.9rem; color:#475569;">적법 주차</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div style="width:12px; height:12px; background:#ef4444; border-radius:50%;"></div>
                                    <span style="font-size:0.9rem; color:#475569;">불법 주차</span>
                                </div>
                            </div>

                            <!-- 목록 카드 영역 -->
                            <div id="cards" class="cards" aria-label="검색 결과 - 카드 목록"></div>
                        </div>

                        <!-- 등록 패널 -->
                        <div id="panelAdd" class="tab-panel" role="tabpanel" aria-labelledby="tabAdd"
                             style="display:none;">
                            <div class="add-form-container">
                                <jsp:include page="/WEB-INF/views/prk/usage-add.jsp"/>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div id="toast" class="toast" role="status" aria-live="polite"></div>
        </div>
    </div>
</main>

<!-- 🔥 이미지 미리보기 툴팁 -->
<div id="imagePreviewTooltip" class="image-preview-tooltip">
    <img id="previewImage" src="" alt="미리보기">
</div>

<!-- Footer 영역 -->
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>

<!-- 🔥 2. 외부 라이브러리 (동기 로드) -->
<script src="https://cdn.jsdelivr.net/npm/exif-js"></script>
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>

<!-- 🔥 3. Kakao Maps SDK (JavaScript 키 사용) -->
<script type="text/javascript"
        src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a1194f70f6ecf2ece7a703a4a07a0876&libraries=clusterer"
        onerror="console.error('❌ Kakao Maps API 스크립트 로드 실패'); window.kakaoMapsLoadError = true;">
</script>

<!-- 🔥 4. Kakao Maps 로드 확인 -->
<script>
    (function () {

        if (window.kakaoMapsLoadError) {
            console.error('❌ Kakao Maps API 스크립트 파일 로드 실패');
            window.kakaoMapsReady = false;
            window.dispatchEvent(new Event('kakaoMapsLoadFailed'));
            return;
        }

        let checkCount = 0;
        const maxChecks = 20;

        const checkInterval = setInterval(function () {
            checkCount++;


            if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                clearInterval(checkInterval);
                window.kakaoMapsReady = true;
                window.dispatchEvent(new Event('kakaoMapsLoaded'));
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                console.error('❌ Kakao Maps API 로드 실패 (최대 재시도 초과)');
                window.kakaoMapsReady = false;
                window.dispatchEvent(new Event('kakaoMapsLoadFailed'));
            }
        }, 500);
    })();
</script>

<!-- 🔥 5. 공통 → 컴포넌트 → 페이지 스크립트 -->
<script src="${pageContext.request.contextPath}/static/js/component/toast.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/modal.js"></script>
<script src="${pageContext.request.contextPath}/static/js/page/usage-status-list.js"></script>
<script src="${pageContext.request.contextPath}/static/js/page/usage-add.js"></script>

</body>
</html>
