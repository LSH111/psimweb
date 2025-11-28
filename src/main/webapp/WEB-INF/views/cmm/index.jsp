<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>주차장 관리 시스템</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/base.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/layout.css">
    <script>
        window.SESSION_FILTER = {
            sidoCd: '${sessionSidoCd}',
            sigunguCd: '${sessionSigunguCd}',
            prkBizMngNo: '${sessionPrkBizMngNo}',
            isAdmin: ${isAdmin ? 'true' : 'false'}
        };
    </script>
    <style>
        .dashboard-page h2 {
            margin-bottom: 12px;
        }

        .filter-bar {
            display: flex;
            gap: 12px;
            align-items: center;
            margin: 12px 0 16px;
            flex-wrap: wrap;
        }

        .filter-group label {
            font-weight: 600;
            margin-right: 8px;
        }

        .filter-group select {
            min-width: 160px;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid #dcdfe6;
            background: #fff;
        }

        .filter-group button {
            padding: 8px 14px;
            border: none;
            border-radius: 6px;
            background: #2563eb;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
        }

        .filter-group button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .dashboard-section {
            margin-bottom: 28px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
        }

        .section-total {
            font-size: 14px;
            color: #374151;
            font-weight: 700;
        }

        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px;
        }

        .stat-card {
            border: 1px solid #eef1f6;
            border-radius: 10px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            color: #111827;
            background: #f9fafb;
        }

        .stat-label {
            font-weight: 700;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 800;
        }

        .stat-note {
            font-size: 12px;
            color: #6b7280;
        }

        .card--status-00 {
            background: #f5f5f5;
            border-color: #e4e4e7;
        }

        .card--status-10 {
            background: #bbdefb;
            border-color: #90caf9;
        }

        .card--status-20 {
            background: #ffe0b2;
            border-color: #ffcc80;
        }

        .card--status-30 {
            background: #e8f5e9;
            border-color: #aedfae;
        }

        .card--status-99 {
            background: #ffebee;
            border-color: #f5c2c7;
        }

        .card--status-00:hover {
            background: #ededed;
        }

        .card--status-10:hover {
            background: #a6c8f5;
        }

        .card--status-20:hover {
            background: #ffd59a;
        }

        .card--status-30:hover {
            background: #d9f0dc;
        }

        .card--status-99:hover {
            background: #ffd6db;
        }

        .card--illegal {
            background: #fef2f2;
            border-color: #ef4444;
        }

        .card--legal {
            background: #eff6ff;
            border-color: #3b82f6;
        }

        .dash-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .dash-card-icon__svg {
            width: 20px;
            height: 20px;
        }
    </style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
    <symbol id="icon-status-draft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
        <path d="M15 3v4h4"/>
        <path d="M9 12h6"/>
        <path d="M9 16h4"/>
    </symbol>
    <symbol id="icon-status-progress" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="6"/>
        <line x1="15.5" y1="15.5" x2="20" y2="20"/>
        <line x1="11" y1="8" x2="11" y2="11"/>
        <line x1="11" y1="11" x2="13" y2="13"/>
    </symbol>
    <symbol id="icon-status-pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="7"/>
        <line x1="12" y1="12" x2="12" y2="8"/>
        <line x1="12" y1="12" x2="15" y2="13.5"/>
    </symbol>
    <symbol id="icon-status-approved" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="7"/>
        <path d="M9 12l2 2 4-4"/>
    </symbol>
    <symbol id="icon-status-rejected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="7"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
    </symbol>
    <symbol id="icon-usage-illegal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l9 16H3l9-16z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none"/>
    </symbol>
    <symbol id="icon-usage-legal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l7 4v6c0 3.7-2.6 6.5-7 8-4.4-1.5-7-4.3-7-8V7l7-4z"/>
        <path d="M9 12l2 2 4-4"/>
    </symbol>
</svg>
<jsp:include page="/WEB-INF/views/fragments/header.jsp"/>
<main class="main container dashboard-page">
    <h2>현황</h2>

    <section class="dashboard-section">
        <div class="section-header">
            <div class="section-title">주차장 현황</div>
            <div class="section-total" id="parking-total">총 0건</div>
        </div>
        <div class="filter-bar">
            <div class="filter-group">
                <label for="parkingSido">시도 선택</label>
                <select id="parkingSido">
                    <option value="">전체</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="parkingSigungu">시군구 선택</label>
                <select id="parkingSigungu" disabled>
                    <option value="">전체</option>
                </select>
            </div>
            <div class="filter-group">
                <button type="button" id="parkingSearchBtn">조회</button>
            </div>
        </div>
        <div class="card-grid">
            <div class="stat-card card--status-00">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-status-draft"></use></svg>
                    </span>
                    <span class="stat-label">작성전</span>
                </div>
                <div class="stat-value" id="parking-draft">0</div>
                <%--<div class="stat-note">코드 00</div>--%>
            </div>
            <div class="stat-card card--status-10">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-status-progress"></use></svg>
                    </span>
                    <span class="stat-label">조사중</span>
                </div>
                <div class="stat-value" id="parking-in-survey">0</div>
                <%--<div class="stat-note">코드 10</div>--%>
            </div>
            <div class="stat-card card--status-20">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-status-pending"></use></svg>
                    </span>
                    <span class="stat-label">승인대기</span>
                </div>
                <div class="stat-value" id="parking-pending">0</div>
                <%--<div class="stat-note">코드 20</div>--%>
            </div>
            <div class="stat-card card--status-30">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-status-approved"></use></svg>
                    </span>
                    <span class="stat-label">승인</span>
                </div>
                <div class="stat-value" id="parking-approved">0</div>
                <%--<div class="stat-note">코드 30</div>--%>
            </div>
            <div class="stat-card card--status-99">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-status-rejected"></use></svg>
                    </span>
                    <span class="stat-label">반려</span>
                </div>
                <div class="stat-value" id="parking-rejected">0</div>
                <%--<div class="stat-note">코드 99</div>--%>
            </div>
        </div>
    </section>

    <section class="dashboard-section">
        <div class="section-header">
            <div class="section-title">주차장 이용실태 현황</div>
            <div class="section-total" id="usage-total">총 0건</div>
        </div>
        <div class="filter-bar">
            <div class="filter-group">
                <label for="usageSido">시도 선택</label>
                <select id="usageSido">
                    <option value="">전체</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="usageSigungu">시군구 선택</label>
                <select id="usageSigungu" disabled>
                    <option value="">전체</option>
                </select>
            </div>
            <div class="filter-group">
                <button type="button" id="usageSearchBtn">조회</button>
            </div>
        </div>
        <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="stat-card card--illegal">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-usage-illegal"></use></svg>
                    </span>
                    <span class="stat-label">불법</span>
                </div>
                <div class="stat-value" id="usage-illegal">0</div>
                <div class="stat-note">이용실태 불법 건수</div>
            </div>
            <div class="stat-card card--legal">
                <div class="dash-card-header">
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg class="dash-card-icon__svg"><use xlink:href="#icon-usage-legal"></use></svg>
                    </span>
                    <span class="stat-label">적법</span>
                </div>
                <div class="stat-value" id="usage-legal">0</div>
                <div class="stat-note">이용실태 적법 건수</div>
            </div>
        </div>
    </section>
</main>

<script src="${pageContext.request.contextPath}/static/js/page/index.js"></script>
<script>
    (function () {
        var btn = document.querySelector('.nav-toggle');
        var nav = document.querySelector('header nav');
        if (btn && nav) {
            btn.addEventListener('click', function () {
                var opened = nav.classList.toggle('open');
                btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
            });
        }
    })();
</script>
</body>
</html>
