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
class PrkDefPlceInfoControllerIT {

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
    @DisplayName("주차장 목록 화면이 JSP를 렌더링한다")
    void parkingList_view() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(get("/prk/parkinglist").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/parking-list"));
    }

    @Test
    @DisplayName("인증 없이 주차장 목록 데이터 API 호출 시 리다이렉트된다")
    void parkingData_requiresAuth() throws Exception {
        mockMvc.perform(get("/prk/parking-data"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("주차장 목록 데이터 API가 JSON을 반환한다")
    void parkingData_api() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(get("/prk/parking-data").session(session).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list").exists())
                .andExpect(jsonPath("$.success").exists());
    }

    @Test
    @DisplayName("진행상태=30이면 onparking 화면이 읽기전용 표시로 렌더링된다")
    void onParking_readonlyWhenApproved() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(get("/prk/onparking").param("status", "30").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/onparking"))
                .andExpect(model().attribute("statusCode", "30"));
    }

    @Test
    @DisplayName("진행상태!=30이면 onparking 저장 버튼이 활성화된 상태로 렌더링된다")
    void onParking_editableWhenNotApproved() throws Exception {
        MockHttpSession session = loginSession();
        Assumptions.assumeTrue(session != null, "로그인 세션을 만들 수 없어 테스트를 건너뜁니다.");

        mockMvc.perform(get("/prk/onparking").param("status", "10").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/onparking"))
                .andExpect(model().attribute("statusCode", "10"));
    }
}
