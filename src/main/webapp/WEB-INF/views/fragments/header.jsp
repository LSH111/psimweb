<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<style>
    /* GNB two-level menu */
    nav .gnb { list-style:none; margin:0; padding:0; display:flex; gap: 20px; }
    nav .gnb > li { position:relative; }
    nav .gnb > li > a { display:inline-block; padding:8px 6px; font-weight:600; color:#111; text-decoration:none; }
    nav .gnb .sub { list-style:none; margin:0; padding:8px 0; position:absolute; top:100%; left:0; min-width:160px; border:1px solid #ddd; background:#fff; border-radius:6px; box-shadow:0 6px 18px rgba(0,0,0,.06); display:none; z-index:50; }
    nav .gnb .sub > li > a { display:block; padding:8px 12px; color:#111; text-decoration:none; white-space:nowrap; }
    nav .gnb .sub > li > a:hover { background:#f5f7fb; }
    nav .gnb > li:hover > .sub, nav .gnb > li:focus-within > .sub { display:block; }
    /* accessibility */
    nav .gnb > li > a:focus { outline:2px solid #2563eb; outline-offset:2px; }

    /* ---- Light theme: all-white surfaces ---- */
    html, body { background:#fff; color:#111; }
    header { background:#fff; }
    header h1 { color:#111 !important; }

    /* Top-level menu on light header */
    nav .gnb > li > a { color:#111 !important; }
    nav .gnb > li > a:hover, nav .gnb > li > a:focus { color:#2563eb; }

    /* Dropdown stays readable on light panel */
    nav .gnb .sub { background:#fff; border-color:#2d2d2d; z-index: 1000; }
    nav .gnb .sub > li > a { color:#111; }
    nav .gnb .sub > li > a:hover { background:#f1f5f9; }

    /* Ensure header sits above content */
    header, nav { position: relative; z-index: 10; }

    /* ===== Responsive tweaks ===== */
    @media (max-width: 1024px) {
        .wrap { padding: 0 16px; }
        nav .gnb { gap: 14px; }
    }
    @media (max-width: 768px) {
        /* Stack dashboard cards */
        .dashboard { flex-direction: column; }
        .status-card { width: 100%; }
        /* Mobile nav: collapse into vertical menu */
        .nav-toggle { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; }
        nav .gnb { display:none; flex-direction: column; gap: 0; border:1px solid #e5e7eb; border-radius:8px; padding:8px 0; background:#fff; position: relative; }
        nav.open .gnb { display:flex; }
        nav .gnb > li > a { padding:12px 14px; }
        nav .gnb .sub { position: static; display:block; box-shadow:none; border:none; padding:0; }
        nav .gnb .sub > li > a { padding:10px 24px; }
    }
</style>
<header class="site-header">
    <h1>주차장 관리 시스템</h1>
    <!--<button type="button" class="nav-toggle" aria-controls="main-gnb" aria-expanded="false" aria-label="메뉴 열기">☰</button>-->
    <nav id="main-gnb">
        <ul class="gnb">
            <li class="has-sub">
                <a href="#">주차장</a>
                <ul class="sub">
                    <li><a href="<c:url value='/prk/parkinglist'/>">주차장실태조사</a></li>
                    <li><a href="#">이용실태조사</a></li>
                </ul>
            </li>
            <li class="has-sub">
                <a href="#">지도</a>
                <ul class="sub">
                    <li><a href="<c:url value='/gis/parkingmap'/>">주차장지도</a></li>
                </ul>
            </li>
        </ul>
    </nav>
</header>