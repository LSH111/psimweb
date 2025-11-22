package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkDefPlceInfoMapper;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrkDefPlceInfoServiceImplMockTest {

    @Mock
    private PrkDefPlceInfoMapper mapper;

    @InjectMocks
    private PrkDefPlceInfoServiceImpl service;

    private ParkingDetailVO sampleDetail() {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo("MG-0001");
        vo.setPrkplceNm("테스트주차장");
        vo.setZip("12345");
        vo.setOperMbyCd("1");
        vo.setPrkPlceType("1"); // 노상
        vo.setPrkPlceLat("37.1");
        vo.setPrkPlceLon("127.1");
        vo.setLdongCd("11110");
        vo.setPrkBizMngNo("BIZ-1");
        vo.setBizPerPrkMngNo("BP-1");
        return vo;
    }

    @Test
    @DisplayName("신규 노상주차장 등록 시 mapper 호출 흐름에 따라 prkPlceInfoSn을 설정한다")
    void insertOnstreetParking_success() {
        ParkingDetailVO vo = sampleDetail();
        when(mapper.generateParkingInfoSn(vo.getPrkPlceManageNo())).thenReturn(10);

        service.insertOnstreetParking(vo);

        assertThat(vo.getPrkPlceInfoSn()).isEqualTo(10);
        verify(mapper).generateParkingInfoSn(vo.getPrkPlceManageNo());
        verify(mapper).insertPrkDefPlceInfo(vo);
        verify(mapper).insertBizPerPrklotInfo(vo);
        verify(mapper).insertOnstrPrklotInfo(vo);
        verify(mapper).insertOnstrPrklotOperInfo(vo);
    }

    @Test
    @DisplayName("주차장 수정 시 update mapper들이 호출된다")
    void updateOnstreetParking_callsUpdateMappers() {
        ParkingDetailVO vo = sampleDetail();

        service.updateOnstreetParking(vo);

        verify(mapper).updatePrkDefPlceInfo(vo);
        verify(mapper).updateOnstrPrklotInfo(vo);
        verify(mapper).updateOnstrPrklotOperInfo(vo);
        verify(mapper).updateBizPerPrklotPrgsSts(vo);
    }

    @Test
    @DisplayName("주차장 목록 조회는 mapper 결과를 그대로 반환한다")
    void getParkingList_returnsMapperList() {
        Map<String, Object> params = new HashMap<>();
        List<ParkingListVO> expected = Arrays.asList(new ParkingListVO(), new ParkingListVO());
        when(mapper.selectParkingList(params)).thenReturn(expected);

        List<ParkingListVO> result = service.getParkingList(params);

        assertThat(result).isSameAs(expected);
    }

    @Test
    @DisplayName("상세 조회는 mapper 결과를 그대로 반환한다")
    void getOnstreetParkingDetail_returnsMapperValue() {
        ParkingDetailVO detail = sampleDetail();
        when(mapper.selectOnstreetParkingDetail("MG-0001", 1L)).thenReturn(detail);

        ParkingDetailVO result = service.getOnstreetParkingDetail("MG-0001", 1L);

        assertThat(result).isSameAs(detail);
        verify(mapper).selectOnstreetParkingDetail(eq("MG-0001"), eq(1L));
    }
}
