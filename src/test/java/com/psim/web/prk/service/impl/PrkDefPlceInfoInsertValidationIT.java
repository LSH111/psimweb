package com.psim.web.prk.service.impl;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
class PrkDefPlceInfoInsertValidationIT {

    private static final Logger log = LoggerFactory.getLogger(PrkDefPlceInfoInsertValidationIT.class);

    @Autowired
    private PrkDefPlceInfoService prkDefPlceInfoService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("노상 신규 저장 시 XML 매핑 필드가 DB에 정상적으로 들어간다")
    void validateOnstreetInsertMappings() {
        ParkingDetailVO vo = baseVo("1", "VAL-ON-" + System.currentTimeMillis());
        prkDefPlceInfoService.insertOnstreetParking(vo);

        assertThat(vo.getPrkPlceInfoSn()).as("일련번호가 채워져야 합니다").isNotNull();

        String expectedLdong = expectedLdongCd(vo.getSigunguCd(), vo.getEmdCd(), vo.getLiCd());

        Map<String, Object> def = fetchDef(vo);
        Map<String, Object> on = fetchDetail(vo, "1");

        log.info("✅ 노상 INSERT 검증 - manageNo={}, infoSn={}", vo.getPrkPlceManageNo(), vo.getPrkPlceInfoSn());
        assertBasicFields(vo, def, expectedLdong);
        assertThat(on.get("prkplce_se")).as("prkplce_se").isEqualTo(vo.getOwnCd());
        assertThat(on.get("oper_mby_cd")).as("oper_mby_cd").isEqualTo(vo.getOperMbyCd());
    }

    @Test
    @DisplayName("노외 신규 저장 시 XML 매핑 필드가 DB에 정상적으로 들어간다")
    void validateOffstreetInsertMappings() {
        ParkingDetailVO vo = baseVo("2", "VAL-OFF-" + System.currentTimeMillis());
        prkDefPlceInfoService.insertOffstreetParking(vo);

        assertThat(vo.getPrkPlceInfoSn()).as("일련번호가 채워져야 합니다").isNotNull();

        String expectedLdong = expectedLdongCd(vo.getSigunguCd(), vo.getEmdCd(), vo.getLiCd());

        Map<String, Object> def = fetchDef(vo);
        Map<String, Object> off = fetchDetail(vo, "2");

        log.info("✅ 노외 INSERT 검증 - manageNo={}, infoSn={}", vo.getPrkPlceManageNo(), vo.getPrkPlceInfoSn());
        assertBasicFields(vo, def, expectedLdong);
        assertThat(off.get("prkplce_se")).as("prkplce_se").isEqualTo(vo.getOwnCd());
        assertThat(off.get("oper_mby_cd")).as("oper_mby_cd").isEqualTo(vo.getOperMbyCd());
    }

    @Test
    @DisplayName("부설 신규 저장 시 XML 매핑 필드가 DB에 정상적으로 들어간다")
    void validateBuildInsertMappings() {
        ParkingDetailVO vo = baseVo("3", "VAL-BLD-" + System.currentTimeMillis());
        prkDefPlceInfoService.insertBuildParking(vo);

        assertThat(vo.getPrkPlceInfoSn()).as("일련번호가 채워져야 합니다").isNotNull();

        String expectedLdong = expectedLdongCd(vo.getSigunguCd(), vo.getEmdCd(), vo.getLiCd());

        Map<String, Object> def = fetchDef(vo);
        Map<String, Object> build = fetchDetail(vo, "3");

        log.info("✅ 부설 INSERT 검증 - manageNo={}, infoSn={}", vo.getPrkPlceManageNo(), vo.getPrkPlceInfoSn());
        assertBasicFields(vo, def, expectedLdong);
        assertThat(build.get("prkplce_se")).as("prkplce_se").isEqualTo(vo.getOwnCd());
        assertThat(build.get("oper_mby_cd")).as("oper_mby_cd").isEqualTo(vo.getOperMbyCd());
    }

    private ParkingDetailVO baseVo(String type, String manageNo) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(manageNo);
        vo.setPrkPlceType(type);
        vo.setPrkplceNm("검증-" + type);
        vo.setSidoCd("11");
        vo.setSigunguCd("11110");
        vo.setEmdCd("120");
        vo.setLiCd("00");
        vo.setLdongCd(expectedLdongCd(vo.getSigunguCd(), vo.getEmdCd(), vo.getLiCd()));
        vo.setZip("00000");
        vo.setDtadd("검증용 주소");
        vo.setRnmadr("검증용 도로명주소");
        vo.setPrkPlceLat("37.000001");
        vo.setPrkPlceLon("127.000001");
        vo.setBdnbr("1");
        vo.setLnmMnno("1");
        vo.setLnmSbno("0");
        vo.setMntnYn("N");
        vo.setOwnCd("1");
        vo.setPrkplceSe("1");
        vo.setPrkBizMngNo("BIZ-" + System.currentTimeMillis());
        vo.setBizPerPrkMngNo("BP-" + System.nanoTime());
        vo.setOperMbyCd("1");
        vo.setUpdusrId("validator");
        vo.setUpdusrIpAddr("127.0.0.1");
        vo.setTotPrkCnt(10);
        vo.setDisabPrkCnt(1);
        vo.setCompactPrkCnt(1);
        vo.setEcoPrkCnt(1);
        vo.setPregnantPrkCnt(1);
        vo.setPrkOperMthdCd("01");
        vo.setSubordnOpertnCd("N");
        vo.setDyntDvCd("01");
        vo.setWkFeeAplyCd("Y");
        vo.setNtFeeAplyCd("Y");
        return vo;
    }

    private Map<String, Object> fetchDef(ParkingDetailVO vo) {
        return jdbcTemplate.queryForMap(
                "select prk_plce_manage_no, prk_plce_info_sn, prk_plce_type, prkplce_nm, sido_cd, sigungu_cd, emd_cd, li_cd, ldong_cd, zip, dtadd, roadaddr " +
                        "from cpk.tb_prk_def_plce_info where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                vo.getPrkPlceManageNo(),
                vo.getPrkPlceInfoSn()
        );
    }

    private Map<String, Object> fetchDetail(ParkingDetailVO vo, String type) {
        String table;
        if ("1".equals(type)) {
            table = "cpk.tb_onstr_prklot_info";
        } else if ("2".equals(type)) {
            table = "cpk.tb_offstr_prklot_info";
        } else {
            table = "cpk.tb_atch_prklot_info";
        }
        return jdbcTemplate.queryForMap(
                "select prkplce_se, oper_mby_cd from " + table + " where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                vo.getPrkPlceManageNo(),
                vo.getPrkPlceInfoSn()
        );
    }

    private void assertBasicFields(ParkingDetailVO vo, Map<String, Object> def, String expectedLdong) {
        assertThat(str(def.get("prk_plce_type"))).as("prk_plce_type").isEqualTo(vo.getPrkPlceType());
        assertThat(str(def.get("prkplce_nm"))).as("prkplce_nm").isEqualTo(vo.getPrkplceNm());
        assertThat(str(def.get("sido_cd"))).as("sido_cd").isEqualTo(vo.getSidoCd());
        assertThat(str(def.get("sigungu_cd"))).as("sigungu_cd").isEqualTo(vo.getSigunguCd());
        assertThat(str(def.get("emd_cd"))).as("emd_cd").isEqualTo(vo.getEmdCd());
        assertThat(str(def.get("li_cd"))).as("li_cd").isEqualTo(vo.getLiCd());
        assertThat(str(def.get("ldong_cd"))).as("ldong_cd").isEqualTo(expectedLdong);
        assertThat(str(def.get("zip"))).as("zip").isEqualTo(vo.getZip());
        assertThat(str(def.get("dtadd"))).as("dtadd").isEqualTo(vo.getDtadd());
        assertThat(str(def.get("roadaddr"))).as("roadaddr").isEqualTo(vo.getRnmadr());
    }

    private String expectedLdongCd(String sigungu, String emd, String li) {
        String sigunguPadded = pad(sigungu, 5);
        String emdPadded = pad(emd, 3);
        String liPadded = li == null || li.trim().isEmpty() ? "00" : pad(li, 2);
        return sigunguPadded + emdPadded + liPadded;
    }

    private String pad(String value, int length) {
        if (value == null) return null;
        String digits = value.replaceAll("\\D", "");
        if (digits.length() > length) return digits.substring(0, length);
        if (digits.length() < length) {
            StringBuilder sb = new StringBuilder();
            for (int i = digits.length(); i < length; i++) {
                sb.append('0');
            }
            sb.append(digits);
            return sb.toString();
        }
        return digits;
    }

    private String str(Object o) {
        return o == null ? null : o.toString();
    }
}
