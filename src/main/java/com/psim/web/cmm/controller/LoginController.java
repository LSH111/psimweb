package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.service.PasswordCryptoService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
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
    // private final PasswordCryptoService passwordCryptoService; // 미사용

    @GetMapping("/")
    public String loginForm() {
        return "/cmm/ts_login";
    }

    @PostMapping("/login")
    public String login(@RequestParam("userId") String userId,
                        @RequestParam("password") String password, // 평문 비밀번호(HTTPS 전제)
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {

        CoUserVO loginUser;
        try {
            loginUser = loginService.login(userId, password);
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("finalErr", "인증 처리 중 오류가 발생했습니다.");
            return "redirect:/";
        }

        if (loginUser == null) {
            redirectAttributes.addFlashAttribute("finalErr", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "redirect:/";
        }

        establishAuthenticatedSession(session, loginUser);
        return "redirect:/index";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    private void establishAuthenticatedSession(HttpSession session, CoUserVO loginUser) {
        session.setAttribute(SESSION_ATTR_AUTHENTICATED_USER, loginUser);
        session.setAttribute(SESSION_ATTR_LOGIN_FLAG, Boolean.TRUE); // AuthFilter 호환
        session.setMaxInactiveInterval(DEFAULT_SESSION_TIMEOUT_SECONDS);
    }
}