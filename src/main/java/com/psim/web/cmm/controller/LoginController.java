package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;


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
        if (Boolean.TRUE.equals(loginFlag)) {
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
                        @RequestParam(value = "telNo", required = false) String telNo,
                        @RequestParam(value = "certNo", required = false) String certNo,
                        //HttpSession session,
                        HttpServletRequest request,
                        RedirectAttributes redirectAttributes) {

        System.out.println("🔐 로그인 시도");

        CoUserVO loginUser;
        try {
            loginUser = loginService.login(userId, password, telNo, certNo);
        } catch (Exception e) {
            System.err.println("❌ 로그인 처리 중 오류: " + e.getMessage());
            redirectAttributes.addFlashAttribute("finalErr", "인증 처리 중 오류가 발생했습니다.");
            return "redirect:/";
        }

        if (loginUser == null) {
            System.out.println("❌ 로그인 실패: 잘못된 인증 정보");
            redirectAttributes.addFlashAttribute("finalErr", "아이디 혹은 비밀번호가 잘못되었습니다.");
            return "redirect:/";
        }

        // 사용자 유형(5, 6)만 로그인 허용
        String userTyCode = loginUser.getUserTyCode();
        if (!"1".equals(userTyCode) && !"2".equals(userTyCode) && !"6".equals(userTyCode)) {
            System.out.println("❌ 로그인 실패: 허용되지 않은 사용자 유형 userTyCode=" + userTyCode);
            redirectAttributes.addFlashAttribute("finalErr", "로그인 권한이 없는 사용자 유형입니다. 담당자에게 문의하세요.");
            return "redirect:/";
        }

        // 1. 세션 고정 공격 방지를 위해 기존 세션을 무효화하고 새로운 세션을 생성합니다.
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession session = request.getSession(true);


        // 2. Spring Security와 수동으로 통합하기 위해 Authentication 객체를 생성하고 SecurityContext에 저장합니다.
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER")); // 기본 권한 부여
        Authentication authentication = new UsernamePasswordAuthenticationToken(loginUser, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. 새로운 세션에 인증 정보를 설정합니다.
        establishAuthenticatedSession(session, loginUser);

        // 🔥 사업관리번호 목록 조회 및 세션 저장 (강화된 로그)
        try {
            System.out.println("🔍 사업관리번호 목록 조회 시작: userId=" + loginUser.getUserId());

            List<String> userBizList;
            if ("1".equals(userTyCode) || "2".equals(userTyCode)) {
                userBizList = loginService.selectUserBizListByManager(loginUser.getUserId());
            } else {
                userBizList = loginService.selectUserBizList(loginUser.getUserId());
            }

            if (userBizList == null) {
                System.out.println("⚠️ 사업관리번호 목록이 null입니다. 빈 리스트로 초기화합니다.");
                userBizList = java.util.Collections.emptyList();
            }

            session.setAttribute("userBizList", userBizList);

            System.out.println("✅ 사업관리번호 목록 세션 저장 완료: " + userBizList.size() + "개");
            System.out.println("📋 사업번호 목록: " + userBizList);

        } catch (Exception e) {
            System.err.println("⚠️ 사업관리번호 조회 실패: " + e.getMessage());
            e.printStackTrace();
            // 실패해도 로그인은 진행 (빈 리스트로 처리)
            session.setAttribute("userBizList", java.util.Collections.emptyList());
        }

        System.out.println("✅ 로그인 성공: userId=" + userId);

        // 🔥 세션 설정 검증 로그 강화
        System.out.println("🔍 세션 설정 확인:");
        System.out.println("  - sessionId: (masked)");
        System.out.println("  - LOGIN: " + session.getAttribute(SESSION_ATTR_LOGIN_FLAG));
        System.out.println("  - userId: (masked)");
        System.out.println("  - loginUser: (masked)");
        System.out.println("  - userBizList size: " + (session.getAttribute("userBizList") == null ? 0 : ((java.util.List<?>) session.getAttribute("userBizList")).size())); // 🔥 추가

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
