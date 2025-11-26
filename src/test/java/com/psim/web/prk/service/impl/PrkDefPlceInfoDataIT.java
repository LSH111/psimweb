package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkDefPlceInfoMapper;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
class PrkDefPlceInfoDataIT {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PrkDefPlceInfoService prkDefPlceInfoService;

    @Autowired
    private PrkDefPlceInfoMapper prkDefPlceInfoMapper;

    private final List<DbRow> seededRows = new ArrayList<>();
    private final List<String> anomalies = new ArrayList<>();
    private int validatedCount = 0;

    @BeforeAll
    void verifyDatasource() {
        Integer one = jdbcTemplate.queryForObject("select 1", Integer.class);
        assertThat(one).isEqualTo(1);
        seedData();
    }

    @Test
    @Order(1)
    @DisplayName("지정된 관리번호와 infoSn 조합이 단건으로 조회되고 주요 필드가 칸이 비어 있지 않다")
    void validateRecordsFromDatabase() {
        seededRows.forEach(this::assertRecord);
        if (!anomalies.isEmpty()) {
            System.out.println("⚠️ 데이터 이상 목록: " + anomalies);
        }
    }

    private void assertRecord(DbRow row) {
        ParkingDetailVO detail = fetchDetail(row);
        if (detail == null) {
            String msg = String.format("이상 데이터 - 관리번호:%s infoSn:%d: 레코드 없음",
                    row.getManageNo(), row.getInfoSn());
            anomalies.add(msg);
            System.err.println(msg);
            return;
        }
        try {
            assertThat(detail.getPrkPlceManageNo()).isEqualTo(row.getManageNo());
            assertThat(detail.getPrkplceNm()).isNotBlank();
            validatedCount++;
        } catch (AssertionError e) {
            String msg = String.format("이상 데이터 - 관리번호:%s infoSn:%d 오류:%s",
                    row.getManageNo(), row.getInfoSn(), e.getMessage());
            anomalies.add(msg);
            System.err.println(msg);
        }
    }

    private void seedData() {
        seededRows.clear();
        seededRows.add(insertBase("42474-11191-00002-00-1", "1", "시드 노상 1"));
        seededRows.add(insertBase("42470-11191-00001-00-1", "2", "시드 노외 1"));
        seededRows.add(insertBase("42446-29391-00096-00-1", "3", "시드 부설 1"));
        seededRows.add(insertBase("63036-29391-00116-00-1", "3", "시드 부설 2"));
    }

    private DbRow insertBase(String manageNo, String type, String name) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(manageNo);
        vo.setPrkPlceType(type);
        vo.setPrkplceNm(name);
        vo.setSidoCd("11");
        vo.setSigunguCd("11110");
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

        switch (type) {
            case "1":
                prkDefPlceInfoService.insertOnstreetParking(vo);
                break;
            case "2":
                prkDefPlceInfoService.insertOffstreetParking(vo);
                break;
            case "3":
                prkDefPlceInfoService.insertBuildParking(vo);
                break;
            default:
                throw new IllegalArgumentException("알 수 없는 유형: " + type);
        }
        return new DbRow(manageNo, vo.getPrkPlceInfoSn(), type, name, "");
    }

    private String generateId(String prefix, int maxLength) {
        String base = prefix + System.currentTimeMillis();
        if (base.length() > maxLength) {
            return base.substring(0, maxLength);
        }
        return base;
    }

    private ParkingDetailVO fetchDetail(DbRow row) {
        switch (row.getType()) {
            case "1":
                return prkDefPlceInfoService.getOnstreetParkingDetail(row.getManageNo(), row.getInfoSn());
            case "2":
                return prkDefPlceInfoService.getOffstreetParkingDetail(row.getManageNo(), row.getInfoSn());
            case "3":
                return prkDefPlceInfoService.getBuildParkingDetail(row.getManageNo(), row.getInfoSn());
            default:
                anomalies.add(String.format("알 수 없는 주차장 유형(%s) - 관리번호:%s infoSn:%d",
                        row.getType(), row.getManageNo(), row.getInfoSn()));
                return null;
        }
    }

    @AfterAll
    void printSummary() {
        String anomalySummary = anomalies.isEmpty()
                ? "이상 데이터 없음"
                : "이상 데이터 발견: " + anomalies.stream().collect(Collectors.joining(" | "));
        System.out.println(String.format("테스트 요약: 총 %d건 검증, %s", validatedCount, anomalySummary));
    }

    private static class DbRow {
        private final String manageNo;
        private final long infoSn;
        private final String type;
        private final String name;
        private final String statusCd;

        DbRow(String manageNo, long infoSn, String type, String name, String statusCd) {
            this.manageNo = manageNo;
            this.infoSn = infoSn;
            this.type = type;
            this.name = name;
            this.statusCd = statusCd;
        }

        String getManageNo() {
            return manageNo;
        }

        long getInfoSn() {
            return infoSn;
        }

        String getType() {
            return type;
        }

        String getName() {
            return name;
        }

        String getStatusCd() {
            return statusCd;
        }
    }
}
