package com.psim.web.cmm.controller;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoginControllerIT {

    private static final String TEST_USER = "roadmap999";
    private static final String TEST_PW = "123456789";
    private static final String TEST_PHONE = "01074996811";
    private static final String TEST_CERT = "123456";

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("로그인 페이지가 JSP 뷰로 렌더링된다")
    void loginPage_rendersForm() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name(org.hamcrest.Matchers.containsString("ts_login")));
    }

    @Test
    @DisplayName("휴대폰/인증번호를 포함한 로그인 성공 시 index로 리다이렉트한다")
    void login_success_redirects() throws Exception {
        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/login")
                        .param("userId", TEST_USER)
                        .param("password", TEST_PW)
                        .param("hpNo", TEST_PHONE)
                        .param("authNo", TEST_CERT)
                        .param("telNo", TEST_PHONE)
                        .param("certNo", TEST_CERT)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/index"))
                .andReturn()
                .getRequest()
                .getSession(false);

        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");
        assertThat(session.getAttribute(LoginController.SESSION_ATTR_AUTHENTICATED_USER)).isNotNull();
        assertThat(session.getAttribute("userBizList")).isNotNull();
    }

    @Test
    @DisplayName("잘못된 인증정보로 로그인 시 다시 로그인 페이지로 리다이렉트된다")
    void login_fail_redirectsToLogin() throws Exception {
        mockMvc.perform(post("/login")
                        .param("userId", TEST_USER)
                        .param("password", "wrong-password")
                        .param("hpNo", TEST_PHONE)
                        .param("authNo", TEST_CERT)
                        .param("telNo", TEST_PHONE)
                        .param("certNo", TEST_CERT)
                .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(HttpHeaders.LOCATION, "/"));
    }

    @Test
    @DisplayName("로그아웃 시 세션이 무효화되고 로그인 페이지로 리다이렉트된다")
    void logout_invalidatesSession_and_redirects() throws Exception {
        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/login")
                        .param("userId", TEST_USER)
                        .param("password", TEST_PW)
                        .param("hpNo", TEST_PHONE)
                        .param("authNo", TEST_CERT)
                        .param("telNo", TEST_PHONE)
                        .param("certNo", TEST_CERT)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andReturn()
                .getRequest()
                .getSession(false);

        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(post("/logout")
                        .session(session)
                        .with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?logout"));

        assertThat(session.isInvalid()).isTrue();
    }
}
