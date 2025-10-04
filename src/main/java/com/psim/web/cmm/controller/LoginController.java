package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.vo.CoUserVO;
import javax.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class LoginController {

    public static final String LOGIN_USER_SESSION_KEY = "loginUser";
    private static final int SESSION_TIMEOUT_SECONDS = 1800; // 30 minutes

    private final LoginService loginService;

    @GetMapping("/")
    public String loginForm() {
        return "/cmm/ts_login";
    }

    @PostMapping("/login")
    public String login(@RequestParam("userId") String userId,
                        @RequestParam("password") String password,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {

        CoUserVO loginUser = loginService.login(userId, password);

        if (loginUser == null) {
            // 로그인 실패
            redirectAttributes.addFlashAttribute("error", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "redirect:/";
        }

        // 로그인 성공 시 세션에 사용자 정보 저장
        session.setAttribute(LOGIN_USER_SESSION_KEY, loginUser);
        session.setMaxInactiveInterval(SESSION_TIMEOUT_SECONDS);

        return "redirect:/index";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // 세션 무효화
        return "redirect:/"; // 로그인 페이지로 리다이렉트
    }
}