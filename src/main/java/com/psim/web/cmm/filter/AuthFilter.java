package com.psim.web.cmm.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class AuthFilter implements Filter {

    // 정확 매칭
    private static final Set<String> WHITELIST_EXACT = new HashSet<>(Arrays.asList(
            // 로그인 관련
            "/", "/login", "/logout",

            // 시스템
            "/error", "/health", "/favicon.ico",
            "/api/health",  // 추가
            "/egovCrypto", "/egovCrypto/info",
            "/.well-known/appspecific/com.chrome.devtools.json"
    ));

    // 접두사
    private static final String[] WHITELIST_PREFIX = {
            "/static/", "/resources/", "/webjars/", "/public/", "/assets/",
            "/cmm/codes/",  // 공통코드 조회는 허용
            "/api/",   // 전체 API 허용 (또는 /api/health/ 만)
            "/.well-known/"
    };

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        String path = httpReq.getRequestURI();
        String contextPath = httpReq.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        // 1. Whitelist 체크
        if (isWhitelisted(path)) {
            chain.doFilter(req, res);
            return;
        }

        // 2. 로그인 세션 체크
        HttpSession session = httpReq.getSession(false);
        Object loginFlag = (session != null) ? session.getAttribute("LOGIN") : null;

        // 디버깅을 위한 로그 추가
        if (session != null) {
            System.out.println("🔍 AuthFilter DEBUG - path: " + path
                    + ", sessionId: " + session.getId()
                    + ", LOGIN: " + loginFlag
                    + ", loginUser: " + session.getAttribute("loginUser"));
        }

        if (loginFlag != null && Boolean.TRUE.equals(loginFlag)) {
            // 로그인 상태 OK
            chain.doFilter(req, res);
            return;
        }

        // 3. 로그인 필요
        System.out.println("🔒 AuthFilter: 인증 필요 - " + path);

        if (isAjax(httpReq)) {
            httpRes.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpRes.setContentType("application/json;charset=UTF-8");
            httpRes.getWriter().write("{\"error\":\"UNAUTHORIZED\",\"message\":\"로그인이 필요합니다.\"}");
        } else {
            // 로그인 페이지로 리다이렉트 (무한 루프 방지)
            if (!path.equals("/") && !path.equals("/login")) {
                httpReq.getSession().setAttribute("redirectAfterLogin", path);
            }
            httpRes.sendRedirect(contextPath + "/");
        }
    }

    private boolean isWhitelisted(String path) {
        // 정확 매칭
        if (WHITELIST_EXACT.contains(path)) {
            return true;
        }

        // 접두사 매칭
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

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("✅ AuthFilter 초기화");
    }

    @Override
    public void destroy() {
        System.out.println("❌ AuthFilter 종료");
    }
}
