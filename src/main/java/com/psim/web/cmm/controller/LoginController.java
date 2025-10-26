package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpSession;

@Controller
@RequiredArgsConstructor
public class LoginController {

    public static final String SESSION_ATTR_AUTHENTICATED_USER = "loginUser";
    private static final String SESSION_ATTR_LOGIN_FLAG = "LOGIN";
    private static final int DEFAULT_SESSION_TIMEOUT_SECONDS = 1800;

    private final LoginService loginService;

    @GetMapping("/")
    public String loginForm(HttpSession session) {
        // 이미 로그인되어 있으면 index로 이동
        Object loginFlag = session.getAttribute(SESSION_ATTR_LOGIN_FLAG);
        if (loginFlag != null && Boolean.TRUE.equals(loginFlag)) {
            return "redirect:/index";
        }
        return "/cmm/ts_login";
    }

    @GetMapping("/login")
    public String loginFormAlias(HttpSession session) {
        return loginForm(session);
    }

    @PostMapping("/login")
    public String login(@RequestParam("userId") String userId,
                        @RequestParam("password") String password,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {

        System.out.println("🔐 로그인 시도: userId=" + userId);

        CoUserVO loginUser;
        try {
            loginUser = loginService.login(userId, password);
        } catch (Exception e) {
            System.err.println("❌ 로그인 처리 중 오류: " + e.getMessage());
            redirectAttributes.addFlashAttribute("finalErr", "인증 처리 중 오류가 발생했습니다.");
            return "redirect:/";
        }

        if (loginUser == null) {
            System.out.println("❌ 로그인 실패: 잘못된 인증 정보");
            redirectAttributes.addFlashAttribute("finalErr", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "redirect:/";
        }

        // 세션 설정
        establishAuthenticatedSession(session, loginUser);
        System.out.println("✅ 로그인 성공: userId=" + userId);

        // 세션 설정 검증 로그 추가
        System.out.println("🔍 세션 설정 확인 - sessionId: " + session.getId()
                + ", LOGIN: " + session.getAttribute(SESSION_ATTR_LOGIN_FLAG)
                + ", userId: " + session.getAttribute("userId")
                + ", loginUser: " + session.getAttribute(SESSION_ATTR_AUTHENTICATED_USER));

        // 이전 페이지가 있으면 그곳으로, 없으면 index로
        String redirectUrl = (String) session.getAttribute("redirectAfterLogin");
        session.removeAttribute("redirectAfterLogin");

        if (redirectUrl != null && !redirectUrl.isEmpty()) {
            return "redirect:" + redirectUrl;
        }

        return "redirect:/index";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        System.out.println("🚪 로그아웃");
        session.invalidate();
        return "redirect:/";
    }

    private void establishAuthenticatedSession(HttpSession session, CoUserVO loginUser) {
        session.setAttribute(SESSION_ATTR_AUTHENTICATED_USER, loginUser);
        session.setAttribute(SESSION_ATTR_LOGIN_FLAG, Boolean.TRUE);

        // 🔥 userId를 별도로 세션에 저장 (PrkDefPlceInfoController에서 사용)
        session.setAttribute("userId", loginUser.getUserId());

        session.setMaxInactiveInterval(DEFAULT_SESSION_TIMEOUT_SECONDS);

        // 디버깅: 세션 저장 직후 확인
        System.out.println("✅ 세션 저장 완료:");
        System.out.println("  - " + SESSION_ATTR_LOGIN_FLAG + " = " + session.getAttribute(SESSION_ATTR_LOGIN_FLAG));
        System.out.println("  - userId = " + session.getAttribute("userId"));
        System.out.println("  - loginUser = " + loginUser.getUserId());
    }
}