package com.psim.web.prk.service.impl;

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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
class PrkDefPlceInfoDataValidationIT {

    private static final Logger log = LoggerFactory.getLogger(PrkDefPlceInfoDataValidationIT.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("기존 데이터의 법정동코드/주요 코드가 XML 매핑 정의와 일치하는지 탐지한다")
    void detectInvalidExistingRows() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "select prk_plce_manage_no, prk_plce_info_sn, prk_plce_type, prkplce_nm, sido_cd, sigungu_cd, emd_cd, li_cd, ldong_cd, prk_plce_lat, prk_plce_lon " +
                        "from cpk.tb_prk_def_plce_info"
        );

        List<String> anomalies = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            String manageNo = str(row.get("prk_plce_manage_no"));
            Long infoSn = longVal(row.get("prk_plce_info_sn"));
            String type = str(row.get("prk_plce_type"));
            String sigungu = str(row.get("sigungu_cd"));
            String emd = str(row.get("emd_cd"));
            String li = str(row.get("li_cd"));
            String ldong = str(row.get("ldong_cd"));
            String name = str(row.get("prkplce_nm"));

            List<String> issues = new ArrayList<>();

            if (isBlank(manageNo) || infoSn == null) {
                issues.add("기본키 누락");
            }

            if (isBlank(sigungu) || isBlank(emd)) {
                issues.add("행정구역 코드 누락(sido/sigungu/emd)");
            }

            String expectedLdong = null;
            if (!isBlank(sigungu) && !isBlank(emd)) {
                expectedLdong = expectedLdongCd(sigungu, emd, li);
            }

            if (isBlank(ldong)) {
                issues.add("ldong_cd 없음");
            } else {
                if (!ldong.matches("\\d{10}")) {
                    issues.add("ldong_cd 형식 오류(10자리 숫자 아님): " + ldong);
                }
                if (expectedLdong != null && !expectedLdong.equals(ldong)) {
                    issues.add("ldong_cd 계산 불일치 (실제:" + ldong + ", 기대:" + expectedLdong + ")");
                }
            }

            if (isBlank(name)) {
                issues.add("prkplce_nm 누락");
            }
            if (isBlank(str(row.get("prk_plce_lat"))) || isBlank(str(row.get("prk_plce_lon")))) {
                issues.add("좌표 누락");
            }

            Optional<Map<String, Object>> detailOpt = fetchDetail(type, manageNo, infoSn);
            if (!detailOpt.isPresent()) {
                issues.add("상세 테이블에 레코드 없음");
            } else {
                Map<String, Object> detail = detailOpt.get();
                String prkplceSe = str(detail.get("prkplce_se"));
                String operMbyCd = str(detail.get("oper_mby_cd"));
                if (isBlank(prkplceSe)) {
                    issues.add("prkplce_se 누락");
                }
                if (isBlank(operMbyCd)) {
                    issues.add("oper_mby_cd 누락");
                }
            }

            if (!issues.isEmpty()) {
                String message = String.format("❌ 이상 데이터 - manageNo:%s infoSn:%s 오류:%s",
                        manageNo, infoSn, String.join(", ", issues));
                anomalies.add(message);
                log.error(message);
            } else {
                log.info("✅ ldongCd 검증 완료 - manageNo={}, infoSn={}, ldongCd={}", manageNo, infoSn, ldong);
            }
        }

        if (!anomalies.isEmpty()) {
            System.out.println("========== [PrkDefPlceInfoDataValidationIT] 이상 데이터 목록 ==========");
            for (String msg : anomalies) {
                System.out.println(msg);
            }
            System.out.println("========== [PrkDefPlceInfoDataValidationIT] 이상 데이터 끝 ==========");
        }
    }

    private Optional<Map<String, Object>> fetchDetail(String type, String manageNo, Long infoSn) {
        if (isBlank(type) || isBlank(manageNo) || infoSn == null) {
            return Optional.empty();
        }
        String table;
        if ("1".equals(type)) {
            table = "cpk.tb_onstr_prklot_info";
        } else if ("2".equals(type)) {
            table = "cpk.tb_offstr_prklot_info";
        } else if ("3".equals(type)) {
            table = "cpk.tb_atch_prklot_info";
        } else {
            return Optional.empty();
        }

        List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "select prkplce_se, oper_mby_cd from " + table + " where prk_plce_manage_no = ? and prk_plce_info_sn = ?",
                manageNo,
                infoSn
        );
        if (list.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(list.get(0));
    }

    private String expectedLdongCd(String sigungu, String emd, String li) {
        String sigunguPadded = pad(sigungu, 5);
        String emdPadded = pad(emd, 3);
        String liPadded = isBlank(li) ? "00" : pad(li, 2);
        if (sigunguPadded == null || emdPadded == null) {
            return null;
        }
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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String str(Object o) {
        return o == null ? null : o.toString();
    }

    private Long longVal(Object o) {
        if (o == null) return null;
        try {
            return Long.valueOf(o.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
