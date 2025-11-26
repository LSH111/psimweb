package com.psim.web.prk.controller;

import com.psim.media.storage.PhotoStorage;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@ExtendWith(MockitoExtension.class)
class PrkDefPlceInfoControllerDetailTest {

    private static final String BUILD_MANAGE_NO = "39660-19199-00001-00-1";
    private static final String OFF_MANAGE_NO = "42470-11191-00001-00-1";
    private static final String ON_MANAGE_NO = "42474-11191-00002-00-1";

    @Mock
    private PrkDefPlceInfoService prkDefPlceInfoService;
    @Mock
    private AttchPicMngInfoService attchPicService;
    @Mock
    private PhotoStorage photoStorage;

    @InjectMocks
    private PrkDefPlceInfoController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
        viewResolver.setPrefix("/WEB-INF/views/");
        viewResolver.setSuffix(".jsp");

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setViewResolvers(viewResolver)
                .build();
    }

    @Test
    @DisplayName("노상 상세 조회는 필수 파라미터로 1건을 조회하고 parking 모델을 설정한다")
    void onstreetDetail_returnsModel() throws Exception {
        ParkingDetailVO sample = sampleDetail(ON_MANAGE_NO, 417L, "노상 테스트");
        when(prkDefPlceInfoService.getOnstreetParkingDetail(eq(ON_MANAGE_NO), eq(417L))).thenReturn(sample);

        mockMvc.perform(get("/prk/onparking-detail")
                        .param("prkPlceManageNo", ON_MANAGE_NO)
                        .param("prkPlceInfoSn", "417"))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/onparking"))
                .andExpect(model().attribute("parking", allOf(
                        hasProperty("prkPlceManageNo", equalTo(ON_MANAGE_NO)),
                        hasProperty("prkPlceInfoSn", equalTo(417)),
                        hasProperty("prkplceNm", equalTo("노상 테스트"))
                )));

        verify(prkDefPlceInfoService).getOnstreetParkingDetail(eq(ON_MANAGE_NO), eq(417L));
    }

    @Test
    @DisplayName("노외 상세 조회는 필수 파라미터로 1건을 조회하고 parking 모델을 설정한다")
    void offstreetDetail_returnsModel() throws Exception {
        ParkingDetailVO sample = sampleDetail(OFF_MANAGE_NO, 201L, "노외 테스트");
        when(prkDefPlceInfoService.getOffstreetParkingDetail(eq(OFF_MANAGE_NO), eq(201L))).thenReturn(sample);

        mockMvc.perform(get("/prk/offparking-detail")
                        .param("prkPlceManageNo", OFF_MANAGE_NO)
                        .param("prkPlceInfoSn", "201"))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/offparking"))
                .andExpect(model().attribute("parking", allOf(
                        hasProperty("prkPlceManageNo", equalTo(OFF_MANAGE_NO)),
                        hasProperty("prkPlceInfoSn", equalTo(201)),
                        hasProperty("prkplceNm", equalTo("노외 테스트"))
                )));

        verify(prkDefPlceInfoService).getOffstreetParkingDetail(eq(OFF_MANAGE_NO), eq(201L));
    }

    @Test
    @DisplayName("부설 상세 조회는 필수 파라미터로 1건을 조회하고 parking 모델을 설정한다")
    void buildDetail_returnsModel() throws Exception {
        ParkingDetailVO sample = sampleDetail(BUILD_MANAGE_NO, 101L, "부설 테스트");
        when(prkDefPlceInfoService.getBuildParkingDetail(eq(BUILD_MANAGE_NO), eq(101L))).thenReturn(sample);

        mockMvc.perform(get("/prk/buildparking-detail")
                        .param("prkPlceManageNo", BUILD_MANAGE_NO)
                        .param("prkPlceInfoSn", "101"))
                .andExpect(status().isOk())
                .andExpect(view().name("prk/buildparking"))
                .andExpect(model().attribute("parking", allOf(
                        hasProperty("prkPlceManageNo", equalTo(BUILD_MANAGE_NO)),
                        hasProperty("prkPlceInfoSn", equalTo(101)),
                        hasProperty("prkplceNm", equalTo("부설 테스트"))
                )));

        verify(prkDefPlceInfoService).getBuildParkingDetail(eq(BUILD_MANAGE_NO), eq(101L));
    }

    private ParkingDetailVO sampleDetail(String manageNo, long infoSn, String name) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(manageNo);
        vo.setPrkPlceInfoSn((int) infoSn);
        vo.setPrkplceNm(name);
        vo.setDtadd("서울시 테스트 주소");
        return vo;
    }
}
