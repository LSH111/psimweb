<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<link rel="icon" href="${pageContext.request.contextPath}/static/favicon.ico"/>
<link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/grid.css"/>
<script>
    // 전역 컨텍스트 경로 노출
    (function () {
        const serverCtx = ('${pageContext.request.contextPath}' || '').replace(/\/$/, '');
        const locMatch = window.location.pathname.match(/^\/[^/]+/);
        const locCtx = locMatch ? locMatch[0] : '';
        // 접속 경로와 서버 컨텍스트가 다르면 접속 경로 우선, 둘 다 비면 /spis 로 강제
        const resolved = (locCtx && locCtx !== '/' && locCtx !== serverCtx) ? locCtx : (serverCtx || '/spis');
        window.contextPath = window.contextPath || resolved;
    })();
</script>
<!-- 공통 유틸 JS (페이지별 중복 로드 방지) -->
<script src="${pageContext.request.contextPath}/static/js/common/dom-utils.js" defer></script>
<script src="${pageContext.request.contextPath}/static/js/common/format-utils.js" defer></script>
<script src="${pageContext.request.contextPath}/static/js/common/code-api.js" defer></script>
<script src="${pageContext.request.contextPath}/static/js/common/ldong-util.js" defer></script>
<script src="${pageContext.request.contextPath}/static/js/common/upload-util.js" defer></script>
<style>
    /* GNB two-level menu */
    nav .gnb {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 20px;
    }

    nav .gnb > li {
        position: relative;
    }

    nav .gnb > li > a {
        display: inline-block;
        padding: 8px 6px;
        font-weight: 600;
        color: #111;
        text-decoration: none;
    }

    nav .gnb .sub {
        list-style: none;
        margin: 0;
        padding: 8px 0;
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 160px;
        border: 1px solid #e2e8f0;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, .06);
        display: none;
        z-index: 150;
    }

    nav .gnb .sub > li > a {
        display: block;
        padding: 8px 12px;
        color: #111;
        text-decoration: none;
        white-space: nowrap;
    }

    nav .gnb .sub > li > a:hover {
        background: #f5f7fb;
    }

    nav .gnb > li:hover > .sub, nav .gnb > li:focus-within > .sub {
        display: block;
    }

    /* accessibility */
    nav .gnb > li > a:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }

    /* ---- Light theme: all-white surfaces ---- */
    html, body {
        background: #fff;
        color: #111;
    }

    /* 헤더를 최상위 레이어로 고정 */
    .site-header {
        background: #fff;
        position: relative;
        z-index: 200 !important;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 30px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .site-header h1 {
        color: #111 !important;
        margin: 0;
        font-size: 1.5rem;
    }

    .site-header nav {
        flex: 1;
    }

    /* Top-level menu */
    nav .gnb > li > a {
        color: #111 !important;
    }

    nav .gnb > li > a:hover, nav .gnb > li > a:focus {
        color: #2563eb;
    }

    /* Dropdown */
    nav .gnb .sub {
        background: #fff;
        border-color: #e2e8f0;
    }

    nav .gnb .sub > li > a {
        color: #111;
    }

    nav .gnb .sub > li > a:hover {
        background: #f1f5f9;
    }

    /* ===== Responsive tweaks ===== */
    @media (max-width: 1024px) {
        .wrap {
            padding: 0 16px;
        }

        nav .gnb {
            gap: 14px;
        }
    }

    /* 🔥 667px 이하 - 메뉴 항상 표시 */
    @media (max-width: 667px) {
        .site-header {
            padding: 8px 12px;
            gap: 16px;
        }

        .site-header h1 {
            font-size: 1.1rem !important;
        }

        nav .gnb {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
        }

        nav .gnb > li > a {
            padding: 5px 8px !important;
            font-size: 13px !important;
        }

        /* 드롭다운이 화면 밖으로 나가지 않도록 */
        nav .gnb .sub {
            left: auto;
            right: 0;
        }
    }

    /* 🔥 668px ~ 768px - 중간 크기 */
    @media (min-width: 668px) and (max-width: 768px) {
        .site-header {
            padding: 10px 16px;
            gap: 20px;
        }

        .site-header h1 {
            font-size: 1.3rem !important;
        }

        nav .gnb {
            display: flex !important;
            gap: 12px !important;
        }

        nav .gnb > li > a {
            padding: 6px 10px !important;
            font-size: 14px !important;
        }
    }

    /* Logout button */
    .session-actions {
        margin-left: auto;
    }

    .logout-form {
        margin: 0;
    }

    .logout-btn {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        color: #111;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .logout-btn:hover,
    .logout-btn:focus {
        background: #e2e8f0;
        color: #0f172a;
        outline: none;
    }
</style>
<header class="site-header">
    <h1>
        <a href="<c:url value='/index'/>" class="app-title" aria-label="주차장 관리 시스템 홈으로 이동">
            주차장 관리 시스템
        </a>
    </h1>
    <nav id="main-gnb">
        <ul class="gnb">
            <li class="has-sub">
                <a href="#" aria-haspopup="true" aria-expanded="false">주차장</a>
                <ul class="sub">
                    <li><a href="<c:url value='/prk/parkinglist'/>">주차장실태조사</a></li>
                    <li><a href="<c:url value='/prk/usage-status-list'/>">이용실태조사</a></li>
                </ul>
            </li>
            <li class="has-sub">
                <a href="#" aria-haspopup="true" aria-expanded="false">지도</a>
                <ul class="sub">
                    <li><a href="<c:url value='/gis/parkingmap'/>">주차장지도</a></li>
                    <li><a href="<c:url value='/gis/parkingmap_alt'/>">주차장지도(대안)</a></li>
                </ul>
            </li>
        </ul>
    </nav>
    <c:if test="${not empty sessionScope.loginUser}">
        <div class="session-actions">
            <form class="logout-form" action="<c:url value='/logout'/>" method="post">
                <button type="submit" class="logout-btn">로그아웃</button>
            </form>
        </div>
    </c:if>
</header>
