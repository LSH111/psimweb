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
class PrkDefPlceInfoInsertIT {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PrkDefPlceInfoService prkDefPlceInfoService;

    @Test
    @DisplayName("노상 주차장 INSERT 시 DB에 1건이 저장된다")
    void insertOnstreet() {
        String manageNo = "99999-11191-00001-00-1";
        ParkingDetailVO toInsert = buildInsertCandidate(manageNo, "1", "노상 테스트");

        prkDefPlceInfoService.insertOnstreetParking(toInsert);
        assertThat(toInsert.getPrkPlceInfoSn()).as("생성된 일련번호가 설정되어야 합니다.").isNotNull();
        long insertedSn = toInsert.getPrkPlceInfoSn();
        assertCountAndType(manageNo, insertedSn, "1", toInsert);
    }

    @Test
    @DisplayName("노외 주차장 INSERT 시 DB에 1건이 저장된다")
    void insertOffstreet() {
        String manageNo = "99999-11291-00002-00-1";
        ParkingDetailVO toInsert = buildInsertCandidate(manageNo, "2", "노외 테스트");

        prkDefPlceInfoService.insertOffstreetParking(toInsert);
        assertThat(toInsert.getPrkPlceInfoSn()).as("생성된 일련번호가 설정되어야 합니다.").isNotNull();
        long insertedSn = toInsert.getPrkPlceInfoSn();
        assertCountAndType(manageNo, insertedSn, "2", toInsert);
    }

    @Test
    @DisplayName("부설 주차장 INSERT 시 DB에 1건이 저장된다")
    void insertBuild() {
        String manageNo = "99999-29391-00003-00-1";
        ParkingDetailVO toInsert = buildInsertCandidate(manageNo, "3", "부설 테스트");

        prkDefPlceInfoService.insertBuildParking(toInsert);
        assertThat(toInsert.getPrkPlceInfoSn()).as("생성된 일련번호가 설정되어야 합니다.").isNotNull();
        long insertedSn = toInsert.getPrkPlceInfoSn();
        assertCountAndType(manageNo, insertedSn, "3", toInsert);
    }

    private ParkingDetailVO buildInsertCandidate(String manageNo, String type, String name) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(manageNo);
        vo.setPrkPlceType(type);
        vo.setPrkplceNm(name);
        vo.setSidoCd("11");
        vo.setSigunguCd("11110");
        vo.setEmdCd("101");
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
        vo.setLiCd("00");
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
        return vo;
    }

    private String generateId(String prefix, int maxLength) {
        String base = prefix + System.currentTimeMillis();
        if (base.length() > maxLength) {
            return base.substring(0, maxLength);
        }
        return base;
    }

    private void assertCountAndType(String manageNo, long infoSn, String expectedType, ParkingDetailVO expected) {
        Long count = jdbcTemplate.queryForObject(
                "select count(*) from cpk.tb_prk_def_plce_info where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                Long.class,
                manageNo,
                infoSn
        );
        assertThat(count)
                .as("관리번호 %s / 일련번호 %s 조합으로 INSERT된 행이 없습니다.", manageNo, infoSn)
                .isEqualTo(1L);

        String type = jdbcTemplate.queryForObject(
                "select prk_plce_type from cpk.tb_prk_def_plce_info where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                String.class,
                manageNo,
                infoSn
        );
        assertThat(type)
                .as("저장된 prk_plce_type 이 기대값과 다릅니다. 기대: %s, 실제: %s", expectedType, type)
                .isEqualTo(expectedType);

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select ldong_cd, sido_cd, sigungu_cd, emd_cd from cpk.tb_prk_def_plce_info where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                manageNo,
                infoSn
        );
        assertThat(row.get("sido_cd")).isEqualTo(expected.getSidoCd());
        assertThat(row.get("sigungu_cd")).isEqualTo(expected.getSigunguCd());
        assertThat(row.get("emd_cd")).isEqualTo(expected.getEmdCd());
        assertThat(row.get("ldong_cd")).isEqualTo(expected.getLdongCd());
        assertThat(String.valueOf(row.get("ldong_cd"))).hasSize(10);
    }
}
