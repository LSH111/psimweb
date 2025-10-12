<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
    <title>주차장 목록</title>
    <!-- 외부 CSS에는 상세 탭 스타일과 [hidden]{display:none!important;} 규칙이 포함되어야 합니다 -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/parking-list.css"/>
</head>
<body>

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
                                <input id="prkNm" name="prkNm" type="text" placeholder="예) 중앙공영주차장"/>
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
                                <input id="addr" name="addr" type="text" placeholder="도로명/지번 등 일부를 입력"/>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button type="submit" class="btn">검색</button>
                        <button type="button" id="resetBtn" class="btn ghost">초기화</button>
                        <button type="button" id="exportBtn" class="btn sec">CSV 내보내기</button>
                        <button type="button" id="sendBtn" class="btn">선택 전송</button>
                        <span class="right muted" id="hint">데모 데이터 기반 클라이언트 필터링</span>
                    </div>
                </form>
            </section>

            <!-- 결과/탭 -->
            <section class="result-panel">
                <div class="summary" id="summary">총 0건</div>

                <div class="tabs" role="tablist" aria-label="목록">
                    <button id="tabList" class="tab-btn active" role="tab" aria-controls="panelList" aria-selected="true">목록</button>
                </div>

                <div class="tab-panels">
                    <!-- 목록 패널 -->
                    <div id="panelList" class="tab-panel" role="tabpanel" aria-labelledby="tabList">
                        <div id="cards" class="cards" aria-label="검색 결과 - 카드 목록"></div>
                        <div class="table-wrap" aria-label="검색 결과 - 테이블">
                            <table>
                                <thead>
                                <tr>
                                    <th style="width:64px" class="num">순번</th>
                                    <th style="width:60px" class="check">
                                        <input id="checkAll" type="checkbox" aria-label="현재 페이지 전체 선택"/>
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
                    <%--<div id="panelDetail" class="tab-panel detail-wrap" role="tabpanel" aria-label="상세" style="min-width:0">
                        <div class="ld-tabs" id="ldTabs" role="tablist" aria-label="목록 및 상세 탭">
                            <div class="ld-tablist" id="ldTablist">
                                <!-- 고정 목록 탭 -->
                                <!-- <button class="ld-tab list-tab" role="tab" aria-selected="true" aria-controls="ld-panel-list" id="ld-tab-list">📋 목록</button>-->
                                <!-- 동적 목록 탭 -->
                            </div>
                            <div class="ld-panels" id="ldPanels">
                                <!--<section class="ld-panel" id="ld-panel-list" role="tabpanel" aria-labelledby="ld-tab-list" aria-hidden="false">
                                     목록 탭을 누르면 이 패널이 보이지만, 실제 목록은 위쪽 테이블/카드가 원본입니다
                                    <p style="margin:0;color:#94a3b8">위의 목록 테이블/카드를 이용하세요.</p>
                                </section> -->
                                <!-- 상세 패널들은 JS로 동적 추가 -->
                            </div>
                        </div>
                    </div>--%>
                </div>
            </section>
        </div>

        <div id="toast" class="toast" role="status" aria-live="polite"></div>
    </div>
</main>

<!-- ✅ 외부 JS 로드 (EL 충돌 없음) -->
<script defer src="${pageContext.request.contextPath}/static/js/parking-list.js"></script>

<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>
</body>
</html>