package com.psim.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    // AuthFilter의 Whitelist 로직을 그대로 가져옴
    private static final Set<String> WHITELIST_EXACT = new HashSet<>(Arrays.asList(
            // 로그인 관련
            "/", "/login", "/logout",

            // 시스템
            "/error", "/health", "/favicon.ico",
            "/api/health",
            "/egovCrypto", "/egovCrypto/info",
            "/.well-known/appspecific/com.chrome.devtools.json"
    ));

    private static final String[] WHITELIST_PREFIX = {
            "/static/", "/resources/", "/webjars/", "/public/", "/assets/", "/css/", "/js/", "/img/",
            "/cmm/codes/",  // 공통코드 조회는 허용
            "/api/",        // 전체 API 허용
            "/.well-known/"
    };

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = requestURI;

        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        // 1. Whitelist 체크 (정적 리소스 및 허용된 경로 통과)
        if (isWhitelisted(path)) {
            return true;
        }

        // 2. 로그인 세션 체크
        HttpSession session = request.getSession(false);
        Object loginFlag = (session != null) ? session.getAttribute("LOGIN") : null;

        if (Boolean.TRUE.equals(loginFlag)) {
            return true; // 로그인 상태면 통과
        }

        // 3. 로그인이 필요한 경우
        // AJAX 요청인 경우 JSON 에러 응답
        if (isAjax(request)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"UNAUTHORIZED\",\"message\":\"로그인이 필요합니다.\"}");
        } else {
            // 일반 요청인 경우 로그인 페이지로 리다이렉트
            response.sendRedirect(contextPath + "/");
        }

        return false; // 접근 차단
    }

    private boolean isWhitelisted(String path) {
        // 정확히 일치하는 경로 확인
        if (WHITELIST_EXACT.contains(path)) {
            return true;
        }

        // 특정 접두사로 시작하는 경로 확인 (e.g., /static/, /css/)
        for (String prefix : WHITELIST_PREFIX) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private boolean isAjax(HttpServletRequest req) {
        String header = req.getHeader("X-Requested-With");
        return "XMLHttpRequest".equalsIgnoreCase(header);
    }
}