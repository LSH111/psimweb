package com.psim.web.prk.controller;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PrkUsageStatusControllerIT {

    private static final String TEST_USER = "roadmap999";
    private static final String TEST_PW = "123456789";
    private static final String TEST_PHONE = "01074996811";
    private static final String TEST_CERT = "123456";

    @Autowired
    MockMvc mockMvc;

    private MockHttpSession loginSession() throws Exception {
        MvcResult login = mockMvc.perform(post("/login")
                        .param("userId", TEST_USER)
                        .param("password", TEST_PW)
                        .param("hpNo", TEST_PHONE)
                        .param("authNo", TEST_CERT)
                        .param("telNo", TEST_PHONE)
                        .param("certNo", TEST_CERT)
                        .with(csrf()))
                .andReturn();
        return (MockHttpSession) login.getRequest().getSession(false);
    }

    @Test
    @DisplayName("이용실태 목록 화면이 렌더링된다")
    void usageStatusList_view() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(get("/prk/usage-status-list").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/usage-status-list"));
    }

    @Test
    @DisplayName("인증 없이 이용실태 목록 API 호출 시 리다이렉트된다")
    void usageStatusList_requiresAuth() throws Exception {
        mockMvc.perform(get("/prk/api/usage-status/list"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("이용실태 목록 API가 JSON을 반환한다")
    void usageStatusList_api() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(get("/prk/api/usage-status/list").session(session).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list").exists());
    }

    @Test
    @DisplayName("이용실태 저장 API가 성공/실패 여부를 반환한다")
    void usageStatusSave_api() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(post("/prk/api/usage-status/save")
                        .session(session)
                        .param("prkBizMngNo", "TEST-BIZ")
                        .param("vhcleNo", "11가1111")
                        .param("dyntDvCd", "D")
                        .param("lawCd", "01")
                        .param("examinDd", "20240101")
                        .param("examinTimelge", "1200")
                        .param("srvyId", TEST_USER)
                        .param("srvyTel", TEST_PHONE)
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").exists());
    }
}
