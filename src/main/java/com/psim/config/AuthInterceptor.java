package com.psim.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String requestURI = request.getRequestURI();
        String contextPath = request.getContextPath();

        // 로그인 관련 경로는 인터셉트하지 않음
        if (requestURI.equals("/") || requestURI.equals("/login")) {
            return true; // 통과
        }

        // 세션 체크
        HttpSession session = request.getSession();
        Object user = session.getAttribute("loginUser");

        if (user == null) {
            response.sendRedirect(contextPath + "/login");
            return false;
        }

        return true;
    }

    private boolean isWhitelisted(String uri, String contextPath) {
        String path = uri.substring(contextPath.length());

        return path.equals("/login") ||
               path.startsWith("/static/") ||
               path.startsWith("/css/") ||
               path.startsWith("/js/") ||
               path.startsWith("/img/");
    }
}
