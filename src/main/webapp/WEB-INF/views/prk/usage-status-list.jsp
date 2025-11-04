<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <title>주차이용실태관리</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/usage-status.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/usage-add.css"/>
    <!-- contextPath 및 세션 정보를 JavaScript 전역 변수로 정의 -->
    <script>
        var contextPath = '${pageContext.request.contextPath}';
        // 🔥 세션 정보 전달
        var sessionInfo = {
            prkBizMngNo: '${prkBizMngNo}',
            sigunguCd: '${sigunguCd}',
            sidoCd: '${sidoCd}',
            userNm: '${userName}',         // 🔥 조사원명 (중복)
            mbtlnum: '${userTel}'         // 🔥 조사원 연락처 (중복)
        };
        console.log('세션 정보:', sessionInfo);
    </script>
</head>
<body>

<!-- 🔥 Content 영역 -->
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
                                        <option value="Y">적</option>
                                        <option value="N">불</option>
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
                       test         aria-selected="true">목록
                        </button>
                        <!-- 🔥 등록 탭 (초기에는 숨김) -->
                        <button id="tabAdd" class="tab-btn" role="tab" aria-controls="panelAdd"
                                aria-selected="false" style="display:none;">등록
                            <span class="tab-close" aria-label="탭 닫기">×</span>
                        </button>
                    </div>

                    <div class="tab-panels">
                        <!-- 목록 패널 -->
                        <div id="panelList" class="tab-panel active" role="tabpanel" aria-labelledby="tabList">
                            <div id="cards" class="cards" aria-label="검색 결과 - 카드 목록"></div>
                        </div>

                        <!-- 🔥 등록 패널 (초기에는 숨김) -->
                        <div id="panelAdd" class="tab-panel" role="tabpanel" aria-labelledby="tabAdd" style="display:none;">
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

<!-- Footer 영역 -->
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>

<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
<script defer src="${pageContext.request.contextPath}/static/js/usage-status-list.js"></script>
<script defer src="${pageContext.request.contextPath}/static/js/usage-add.js"></script>

</body>
</html>