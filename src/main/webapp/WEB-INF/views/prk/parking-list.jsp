<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <title>주차장 목록</title>
    <!-- KRDS Design System -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/token/krds_tokens.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/common/common.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/component/component.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/component/output.css"/>
    <!-- 🔥 URL 파라미터를 JavaScript 변수로 전달 -->
    <script>
        window.parkingDetailParams = {
            openDetailId: '<c:out value="${openDetailId}" default=""/>',
            parkingType: '<c:out value="${parkingType}" default=""/>',
            prkPlceInfoSn: '<c:out value="${param.prkPlceInfoSn}" default=""/>'
        };

        // 🔥 지도로 돌아가기 함수 (sessionStorage 유지)
        //function goBackToMap() {
            // sessionStorage는 그대로 유지 (parkingmap.jsp에서 복원 후 정리)
        //    window.location.href = '${pageContext.request.contextPath}/gis/parkingmap';
        //}

        /* =========================
           지도로 돌아가기
           ========================= */
        window.goBackToMap = function() {
            // 🔥 세션 스토리지 정리하지 않음 (지도에서 복원 후 삭제)
            window.location.href = '/gis/parkingmap';
        };
    </script>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/parking-list.css"/>
</head>
<body class="krds-body">

<!-- 🔥 Content 영역 -->
<main class="app-content krds-container">
    <div class="container">
        <div class="card krds-card">
            <div class="wrap">
                <h1 class="title krds-title">주차장 실태 관리 목록</h1>

                <!-- 검색 패널 -->
                <section class="panel" aria-label="검색 조건">
                    <!-- 🔥 지도에서 온 경우 뒤로가기 버튼 표시 -->
                    <div id="mapBackButton" style="display:none; padding:12px 16px; background:#eff6ff; border-left:4px solid #3b82f6; margin-bottom:16px; border-radius:8px;">
                        <button onclick="goBackToMap()" style="display:flex; align-items:center; gap:8px; background:white; border:1px solid #3b82f6; color:#2563eb; padding:10px 20px; border-radius:6px; cursor:pointer; font-size:14px; font-weight:600; transition: all 0.2s;">
                            <span style="font-size:18px;">←</span>
                            <span>주차장 지도로 돌아가기</span>
                        </button>
                    </div>
                    <form id="searchForm" class="krds-form">
                        <div class="filters krds-grid">
                            <div class="krds-form__item">
                                <label for="sido" class="form-label">시도</label>
                                <div class="control">
                                    <select id="sido" name="sido" class="form-select">
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="sigungu" class="form-label">시군구</label>
                                <div class="control">
                                    <select id="sigungu" name="sigungu" class="form-select" disabled>
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="emd" class="form-label">읍면동</label>
                                <div class="control">
                                    <select id="emd" name="emd" class="form-select" disabled>
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="prkNm" class="form-label">주차장명</label>
                                <div class="control">
                                    <input id="prkNm" name="prkNm" type="text" class="form-input" placeholder="예) 중앙공영주차장"/>
                                </div>
                            </div>
                            <div>
                                <label for="prkType" class="form-label">주차장형태</label>
                                <div class="control">
                                    <select id="prkType" name="prkType" class="form-select">
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="status" class="form-label">진행상태</label>
                                <div class="control">
                                    <select id="status" name="status" class="form-select">
                                        <option value="">전체</option>
                                    </select>
                                </div>
                            </div>
                            <div class="span2">
                                <label for="addr" class="form-label">상세주소</label>
                                <div class="control">
                                    <input id="addr" name="addr" type="text" class="form-input" placeholder="도로명/지번 등 일부를 입력"/>
                                </div>
                            </div>
                        </div>
                        <div class="actions krds-button-group">
                            <button type="submit" class="btn btn-primary">검색</button>
                            <button type="button" id="resetBtn" class="btn btn-secondary">초기화</button>
                            <button type="button" id="exportBtn" class="btn btn-outline">CSV 내보내기</button>
                            <button type="button" id="sendBtn" class="btn btn-secondary">선택 전송</button>
                            <button type="button" id="addNewBtn" class="btn btn-primary">신규 추가</button>
                        </div>
                    </form>
                </section>

                <!-- 결과/탭 -->
                <section class="result-panel one-card">
                    <div class="summary krds-chip" id="summary" aria-live="polite">총 0건</div>

                    <div class="tabs krds-tabs" role="tablist" aria-label="목록">
                        <button id="tabList" class="tab-btn active" role="tab" aria-controls="panelList" aria-selected="true">목록</button>
                    </div>

                    <div class="tab-panels">
                        <!-- 목록 패널 -->
                        <div id="panelList" class="tab-panel" role="tabpanel" aria-labelledby="tabList">
                            <div id="cards" class="cards" aria-label="검색 결과 - 카드 목록"></div>
                            <div class="table-wrap" aria-label="검색 결과 - 테이블">
                                <table>
                                    <caption>주차장 검색 결과</caption>
                                    <thead>
                                    <tr>
                                        <th scope="col" style="width:64px" class="num">순번</th>
                                        <th scope="col" style="width:60px" class="check">
                                            <input id="checkAll" type="checkbox" aria-label="현재 페이지 전체 선택"/>
                                        </th>
                                        <th scope="col" style="width:10%">주차장구분</th>
                                        <th scope="col" style="width:10%">진행상태</th>
                                        <th scope="col" style="width:12%">시도</th>
                                        <th scope="col" style="width:12%">시군구</th>
                                        <th scope="col" style="width:12%">읍면동</th>
                                        <th scope="col">상세주소</th>
                                        <th scope="col" style="width:18%">주차장명</th>
                                    </tr>
                                    </thead>
                                    <tbody id="tbody"></tbody>
                                </table>
                            </div>
                            <div id="pager" class="pager" role="navigation" aria-label="페이지네이션"></div>
                        </div>
                    </div>
                </section>
            </div>

            <div id="toast" class="toast" role="status" aria-live="polite"></div>
        </div>
    </div>
</main>

<!-- 🔥 Footer 영역 -->
<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>

<script src="${pageContext.request.contextPath}/static/js/common/dom-utils.js"></script>
<script src="${pageContext.request.contextPath}/static/js/common/format-utils.js"></script>
<script src="${pageContext.request.contextPath}/static/js/common/download.js"></script>
<script src="${pageContext.request.contextPath}/static/js/common/code-api.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/toast.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/modal.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/pager.js"></script>
<script src="${pageContext.request.contextPath}/static/js/component/tabs.js"></script>
<script defer src="${pageContext.request.contextPath}/static/js/page/parking-list.js"></script>

</body>
</html>
