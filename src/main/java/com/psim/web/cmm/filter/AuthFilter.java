package com.psim.web.cmm.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class AuthFilter implements Filter {

    // 정확 매칭
    private static final java.util.Set<String> WHITELIST_EXACT = new java.util.HashSet<>(java.util.Arrays.asList(
            "/", "/login", "/logout",
            "/login/form",          // 폼 별칭(있는 경우)
            "/index",               // 인덱스(허용 의도 시)
            "/cmm/ts_login", "/cmm/index", // 뷰 직접 접근 유지 시
            "/error", "/health", "/favicon.ico"
    ));

    // 접두사
    private static final String[] WHITELIST_PREFIX = {
            "/static/", "/resources/", "/webjars/", "/public/", "/assets/",
            "/prk/",         // 주차장 화면(목록/상세를 공개로 허용 시)
            "/api/auth/"     // 공개 인증 API가 있다면
    };

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String ctx = request.getContextPath();
        String uri = request.getRequestURI();
        String path = uri.substring(ctx.length());
        int q = path.indexOf('?');
        if (q >= 0) path = path.substring(0, q);

        if (isWhitelisted(path)) {
            chain.doFilter(req, res);
            return;
        }

        HttpSession session = request.getSession(false);
        boolean loggedIn = (session != null) && Boolean.TRUE.equals(session.getAttribute("LOGIN"));
        if (loggedIn) {
            chain.doFilter(req, res);
            return;
        }

        if (isAjax(request)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 루프 방지: 로그인 뷰로 가는 요청이면 통과
        if (path.equals("/cmm/ts_login")) {
            chain.doFilter(req, res);
            return;
        }

        response.sendRedirect(ctx + "/cmm/ts_login");
    }

    @Override
    public void destroy() {

    }

    private boolean isWhitelisted(String path) {
        if (path == null || path.isEmpty()) return true;
        if (WHITELIST_EXACT.contains(path)) return true;
        for (String p : WHITELIST_PREFIX) {
            if (path.startsWith(p)) return true;
        }
        return false;
    }

    private boolean isAjax(HttpServletRequest req) {
        String xr = req.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equalsIgnoreCase(xr)) return true;
        String accept = req.getHeader("Accept");
        return accept != null && accept.contains("application/json");
    }
}
