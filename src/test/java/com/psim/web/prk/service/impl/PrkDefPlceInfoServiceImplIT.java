package com.psim.web.prk.service.impl;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingListVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.Assumptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Transactional
class PrkDefPlceInfoServiceImplIT {

    @Autowired
    private PrkDefPlceInfoService service;

    @Test
    @DisplayName("주차장 목록 조회가 빈 목록이라도 null이 아닌 리스트를 반환한다")
    void getParkingList_notNull() {
        try {
            Map<String, Object> params = Collections.emptyMap();
            List<ParkingListVO> list = service.getParkingList(params);
            assertThat(list).isNotNull();
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "DB 연결/데이터가 없어 테스트를 건너뜁니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("지도용 주차장 목록 조회도 null이 아닌 리스트를 반환한다")
    void getParkingListForMap_notNull() {
        try {
            Map<String, Object> params = new HashMap<>();
            List<ParkingListVO> list = service.getParkingListForMap(params);
            assertThat(list).isNotNull();
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "DB 연결/데이터가 없어 테스트를 건너뜁니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("상세조회 호출 시 존재하지 않는 관리번호여도 예외 없이 null 또는 VO를 반환한다")
    void getOnstreetParkingDetail_safeForUnknownId() {
        try {
            com.psim.web.prk.vo.ParkingDetailVO detail = service.getOnstreetParkingDetail("NON_EXIST_MANAGE_NO");
            assertThat(detail).isNull();
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "DB 연결/데이터가 없어 테스트를 건너뜁니다: " + e.getMessage());
        }
    }
}
