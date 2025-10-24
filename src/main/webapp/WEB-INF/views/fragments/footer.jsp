
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- 푸터 영역 -->
<footer class="main-footer app-footer" id="mainFooter">
    <div class="footer-content container">
        <div class="footer-info">
            <p>&copy; 2024 주차장 관리 시스템. All rights reserved.</p>
            <p>문의: support@parkingsystem.co.kr | Tel: 02-1234-5678</p>
        </div>
        <div class="footer-links">
            <a href="#" class="footer-link">개인정보처리방침</a>
            <a href="#" class="footer-link">이용약관</a>
            <a href="#" class="footer-link">도움말</a>
        </div>
    </div>
</footer>

<script src="${pageContext.request.contextPath}/static/js/main.js"></script>

<style>
    /* 푸터 공통 스타일 */
    .main-footer.app-footer {
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        flex-shrink: 0;
        min-height: 80px;
        display: flex;
        align-items: center;
        position: relative;
        z-index: 10;
    }

    .main-footer .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .main-footer .footer-info p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.5;
    }

    .main-footer .footer-links {
        display: flex;
        gap: 1.5rem;
    }

    .main-footer .footer-link {
        color: #6b7280;
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s;
    }

    .main-footer .footer-link:hover {
        color: #374151;
    }

    /* 반응형 디자인 */
    @media (max-width: 768px) {
        .main-footer .footer-content {
            flex-direction: column;
            text-align: center;
            padding: 1rem;
        }

        .main-footer .footer-links {
            justify-content: center;
        }
    }

    /* 다크테마 페이지용 오버라이드 */
    body.dark-theme .main-footer.app-footer {
        background: #1f2937;
        border-top-color: #374151;
    }

    body.dark-theme .main-footer .footer-info p,
    body.dark-theme .main-footer .footer-link {
        color: #9ca3af;
    }

    body.dark-theme .main-footer .footer-link:hover {
        color: #d1d5db;
    }
</style>