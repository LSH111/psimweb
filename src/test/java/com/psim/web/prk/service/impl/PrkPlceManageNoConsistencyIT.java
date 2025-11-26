package com.psim.web.prk.service.impl;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
class PrkPlceManageNoConsistencyIT {

    @Autowired
    private PrkDefPlceInfoService service;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("관리번호가 각 테이블에 동일한 22자 문자열로 저장된다 - 노상/노외/부설")
    void manageNoConsistencyAcrossTables() {
        assertManageNoStoredEverywhere(insertWithManageNo("1", "39660-19199-00001-00-1"), "1");
        assertManageNoStoredEverywhere(insertWithManageNo("2", "39660-19199-00002-00-1"), "2");
        assertManageNoStoredEverywhere(insertWithManageNo("3", "39660-19199-00003-00-1"), "3");
    }

    private ParkingDetailVO insertWithManageNo(String type, String manageNo) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(manageNo);
        vo.setPrkPlceType(type);
        vo.setPrkplceNm("관리번호검증-" + type);
        vo.setSidoCd("11");
        vo.setSigunguCd("11110");
        vo.setEmdCd("120");
        vo.setLiCd("00");
        vo.setLdongCd("1111012000");
        vo.setZip("00000");
        vo.setDtadd("주소");
        vo.setRnmadr("도로명주소");
        vo.setPrkPlceLat("37.0");
        vo.setPrkPlceLon("127.0");
        vo.setBdnbr("1");
        vo.setLnmMnno("1");
        vo.setLnmSbno("0");
        vo.setMntnYn("N");
        vo.setPrkBizMngNo("BIZ-" + System.nanoTime());
        vo.setBizPerPrkMngNo("BP-" + System.nanoTime());
        vo.setOperMbyCd("1");
        vo.setUpdusrId("tester");
        vo.setUpdusrIpAddr("127.0.0.1");
        vo.setTotPrkCnt(1);
        vo.setDisabPrkCnt(0);
        vo.setCompactPrkCnt(0);
        vo.setEcoPrkCnt(0);
        vo.setPregnantPrkCnt(0);
        vo.setPrkOperMthdCd("01");
        vo.setSubordnOpertnCd("N");
        vo.setDyntDvCd("01");
        vo.setOwnCd("1");
        vo.setPrkplceSe("1");

        if ("1".equals(type)) {
            service.insertOnstreetParking(vo);
        } else if ("2".equals(type)) {
            service.insertOffstreetParking(vo);
        } else {
            service.insertBuildParking(vo);
        }
        return vo;
    }

    private void assertManageNoStoredEverywhere(ParkingDetailVO vo, String type) {
        String manageNo = vo.getPrkPlceManageNo();
        assertThat(manageNo).hasSize(22);
        assertThat(manageNo).endsWith("-00-1");

        Map<String, Object> def = jdbcTemplate.queryForMap(
                "select prk_plce_manage_no from cpk.tb_prk_def_plce_info where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                manageNo,
                vo.getPrkPlceInfoSn()
        );
        assertThat(def.get("prk_plce_manage_no")).isEqualTo(manageNo);

        String detailTable = "1".equals(type) ? "cpk.tb_onstr_prklot_info" :
                "2".equals(type) ? "cpk.tb_offstr_prklot_info" : "cpk.tb_atch_prklot_info";
        Map<String, Object> detail = jdbcTemplate.queryForMap(
                "select prk_plce_manage_no from " + detailTable + " where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                manageNo,
                vo.getPrkPlceInfoSn()
        );
        assertThat(detail.get("prk_plce_manage_no")).isEqualTo(manageNo);

        Map<String, Object> biz = jdbcTemplate.queryForMap(
                "select prk_plce_manage_no from cpk.tb_biz_per_prklot_info where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                manageNo,
                vo.getPrkPlceInfoSn()
        );
        assertThat(biz.get("prk_plce_manage_no")).isEqualTo(manageNo);
    }
}
