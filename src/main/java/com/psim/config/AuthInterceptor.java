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
        String requestURI = request.getRequestURI();
        String contextPath = request.getContextPath();

        // 로그인 관련 경로는 인터셉트하지 않음
        if (requestURI.equals(contextPath + "/") || requestURI.equals(contextPath + "/login")) {
            return true; // 통과
        }

        // 세션 체크 - AuthFilter와 동일한 키 사용
        HttpSession session = request.getSession(false);
        Object loginFlag = (session != null) ? session.getAttribute("LOGIN") : null;

        if (Boolean.TRUE.equals(loginFlag)) {
            return true;
        }

        // ✅ /login이 아니라 /로 리다이렉트
        response.sendRedirect(contextPath + "/");
        return false;
    }
}
