package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.IndexService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = IndexController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class IndexDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IndexService indexService;

    @Test
    @DisplayName("주차장 현황 대시보드 API가 상태별 건수를 반환한다")
    void parkingDashboard_returnsCounts() throws Exception {
        Map<String, Object> parking = new HashMap<>();
        Map<String, Object> status = new HashMap<>();
        status.put("00", 1);
        status.put("10", 2);
        status.put("20", 3);
        status.put("30", 4);
        status.put("99", 5);
        parking.put("total", 15);
        parking.put("status", status);
        given(indexService.getParkingStatusDashboard(anyMap())).willReturn(parking);

        mockMvc.perform(get("/api/dashboard/parking-status")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(15))
                .andExpect(jsonPath("$.status.00").value(1))
                .andExpect(jsonPath("$.status.10").value(2))
                .andExpect(jsonPath("$.status.20").value(3))
                .andExpect(jsonPath("$.status.30").value(4))
                .andExpect(jsonPath("$.status.99").value(5));
    }

    @Test
    @DisplayName("이용실태 현황 대시보드 API가 불법/적법 건수를 반환한다")
    void usageDashboard_returnsCounts() throws Exception {
        Map<String, Object> usage = new HashMap<>();
        usage.put("total", 18);
        usage.put("illegal", 7);
        usage.put("legal", 11);
        given(indexService.getUsageStatusDashboard(anyMap())).willReturn(usage);

        mockMvc.perform(get("/api/dashboard/usage-status")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(18))
                .andExpect(jsonPath("$.illegal").value(7))
                .andExpect(jsonPath("$.legal").value(11));
    }
}
