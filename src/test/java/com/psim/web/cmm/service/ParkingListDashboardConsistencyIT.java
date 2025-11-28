package com.psim.web.cmm.service;

import com.psim.web.cmm.service.IndexService;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ParkingListDashboardConsistencyIT {

    @Autowired
    private PrkDefPlceInfoService prkDefPlceInfoService;

    @Autowired
    private IndexService indexService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("주차장 목록과 현황 집계는 동일한 필터 조건으로 일치한다")
    void parkingListAndDashboardShareSameFilters() {
        Map<String, Object> filter = new HashMap<String, Object>();
        filter.put("sidoCd", "11");
        filter.put("sigunguCd", "11110");
        // 목록 쿼리는 기존 파라미터명을 함께 사용하므로 겸용 입력
        filter.put("sido", "11");
        filter.put("sigungu", "11110");

        Map<String, Object> beforeStatus = indexService.getParkingStatusDashboard(new HashMap<String, Object>(filter));
        Map<String, Object> beforeStatusMap = getStatusMap(beforeStatus);
        long beforeTotal = toLong(beforeStatus.get("total"));
        long beforeDraft = toLong(beforeStatusMap.get("00"));

        ParkingDetailVO inserted = insertSampleParking("1", "통합테스트 현황 일치", filter);
        jdbcTemplate.update("UPDATE cpk.tb_biz_per_prklot_info SET prgs_sts_cd = '00' WHERE prk_plce_manage_no = ? AND prk_plce_info_sn = ?",
                inserted.getPrkPlceManageNo(), inserted.getPrkPlceInfoSn());

        List<ParkingListVO> list = prkDefPlceInfoService.getParkingList(filter);
        boolean containsInserted = false;
        for (ParkingListVO item : list) {
            if (inserted.getPrkPlceManageNo().equals(item.getPrkPlceManageNo())
                    && inserted.getPrkPlceInfoSn() != null
                    && inserted.getPrkPlceInfoSn().equals(item.getPrkPlceInfoSn())) {
                containsInserted = true;
                break;
            }
        }
        assertThat(containsInserted).as("목록에 방금 추가한 관리번호가 포함되어야 합니다.").isTrue();

        Map<String, Object> afterStatus = indexService.getParkingStatusDashboard(new HashMap<String, Object>(filter));
        Map<String, Object> afterStatusMap = getStatusMap(afterStatus);
        long afterTotal = toLong(afterStatus.get("total"));
        long afterDraft = toLong(afterStatusMap.get("00"));

        assertThat(afterTotal).as("현황 총계가 1건 증가해야 합니다.").isEqualTo(beforeTotal + 1);
        assertThat(afterDraft).as("작성전 상태 건수가 1건 증가해야 합니다.").isEqualTo(beforeDraft + 1);
    }

    private ParkingDetailVO insertSampleParking(String type, String name, Map<String, Object> filter) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(generateId("AGG", 24));
        vo.setPrkPlceType(type);
        vo.setPrkplceNm(name);
        vo.setSidoCd(String.valueOf(filter.get("sidoCd")));
        vo.setSigunguCd(String.valueOf(filter.get("sigunguCd")));
        vo.setEmdCd("11110101");
        vo.setLdongCd("1111010100");
        vo.setZip("00000");
        vo.setDtadd("테스트 주소");
        vo.setRnmadr("테스트 도로명주소");
        vo.setPrkPlceLat("37.0");
        vo.setPrkPlceLon("127.0");
        vo.setBdnbr("1");
        vo.setLnmMnno("1");
        vo.setLnmSbno("0");
        vo.setMntnYn("N");
        vo.setLiCd("00000");
        vo.setPrkBizMngNo(generateId("BIZ", 14));
        vo.setBizPerPrkMngNo(generateId("BP", 18));
        vo.setOperMbyCd("1");
        vo.setUpdusrId("tester");
        vo.setUpdusrIpAddr("127.0.0.1");
        vo.setTotPrkCnt(0);
        vo.setDisabPrkCnt(0);
        vo.setCompactPrkCnt(0);
        vo.setEcoPrkCnt(0);
        vo.setPregnantPrkCnt(0);
        vo.setPrkOperMthdCd("1");
        vo.setSubordnOpertnCd("1");
        vo.setDyntDvCd("1");

        if ("1".equals(type)) {
            prkDefPlceInfoService.insertOnstreetParking(vo);
        } else if ("2".equals(type)) {
            prkDefPlceInfoService.insertOffstreetParking(vo);
        } else {
            prkDefPlceInfoService.insertBuildParking(vo);
        }
        return vo;
    }

    private Map<String, Object> getStatusMap(Map<String, Object> source) {
        if (source == null) {
            return new HashMap<String, Object>();
        }
        Object status = source.get("status");
        if (status instanceof Map) {
            return (Map<String, Object>) status;
        }
        return new HashMap<String, Object>();
    }

    private long toLong(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException ignored) {
                return 0L;
            }
        }
        return 0L;
    }

    private String generateId(String prefix, int maxLength) {
        String base = prefix + System.currentTimeMillis();
        if (base.length() > maxLength) {
            return base.substring(0, maxLength);
        }
        return base;
    }
}
