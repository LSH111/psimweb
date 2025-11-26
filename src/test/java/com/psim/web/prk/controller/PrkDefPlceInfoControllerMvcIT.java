package com.psim.web.prk.controller;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles("test")
class PrkDefPlceInfoControllerMvcIT {

    private static final Map<String, String> ENDPOINTS_BY_TYPE = new java.util.HashMap<String, String>() {{
        put("1", "/prk/onparking-detail");
        put("2", "/prk/offparking-detail");
        put("3", "/prk/buildparking-detail");
    }};
    private static final Map<String, String> VIEWS_BY_TYPE = new java.util.HashMap<String, String>() {{
        put("1", "prk/onparking");
        put("2", "prk/offparking");
        put("3", "prk/buildparking");
    }};

    private static final List<String> TARGET_MANAGE_NOS = new ArrayList<String>() {{
        add("42474-11191-00002-00-1"); // 노상
        add("42470-11191-00001-00-1"); // 노외
        add("42446-29391-00096-00-1"); // 부설
        add("63036-29391-00116-00-1"); // 부설
    }};

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PrkDefPlceInfoService prkDefPlceInfoService;

    private final List<RecordTarget> targets = new ArrayList<>();

    @BeforeAll
    void loadTargets() {
        for (String manageNo : TARGET_MANAGE_NOS) {
            List<RecordTarget> rows = jdbcTemplate.query(
                    "select prk_plce_manage_no, prk_plce_info_sn, prk_plce_type " +
                            "from cpk.tb_prk_def_plce_info " +
                            "where prk_plce_manage_no = ? " +
                            "order by prk_plce_info_sn desc",
                    (rs, i) -> new RecordTarget(
                            rs.getString("prk_plce_manage_no"),
                            rs.getLong("prk_plce_info_sn"),
                            rs.getString("prk_plce_type")
                    ),
                    manageNo
            );
            if (rows.isEmpty()) {
                RecordTarget seeded = insertSeed(manageNo, resolveType(manageNo));
                targets.add(seeded);
                continue;
            }

            RecordTarget matched = null;
            for (RecordTarget row : rows) {
                ParkingDetailVO detail = fetchDetail(row);
                if (detail != null) {
                    matched = row;
                    break;
                }
            }

            if (matched == null) {
                RecordTarget seeded = insertSeed(manageNo, resolveType(manageNo));
                targets.add(seeded);
            } else {
                targets.add(matched);
            }
        }
    }

    @Test
    @WithMockUser(username = "test", roles = {"USER"})
    @DisplayName("상세 페이지는 관리번호와 infoSn으로 데이터를 렌더링한다")
    void detailPagesRenderWithData() throws Exception {
        RecordTarget target = targets.stream()
                .filter(t -> "2".equals(t.getType()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("노외 주차장 테스트 대상이 없습니다."));

        mockMvc.perform(get(ENDPOINTS_BY_TYPE.get(target.getType()))
                        .param("prkPlceManageNo", target.getManageNo())
                        .param("prkPlceInfoSn", String.valueOf(target.getInfoSn())))
                .andExpect(status().isOk())
                .andExpect(view().name(VIEWS_BY_TYPE.get(target.getType())))
                .andExpect(model().attributeExists("parking", "statusCode"));
    }

    private ParkingDetailVO fetchDetail(RecordTarget target) {
        switch (target.getType()) {
            case "1":
                return prkDefPlceInfoService.getOnstreetParkingDetail(target.getManageNo(), target.getInfoSn());
            case "2":
                return prkDefPlceInfoService.getOffstreetParkingDetail(target.getManageNo(), target.getInfoSn());
            case "3":
                return prkDefPlceInfoService.getBuildParkingDetail(target.getManageNo(), target.getInfoSn());
            default:
                throw new IllegalArgumentException("알 수 없는 주차장 유형: " + target.getType());
        }
    }

    private RecordTarget insertSeed(String manageNo, String type) {
        ParkingDetailVO vo = new ParkingDetailVO();
        vo.setPrkPlceManageNo(manageNo);
        vo.setPrkPlceType(type);
        vo.setPrkplceNm("통합테스트 Seed");
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

        if ("1".equals(type)) {
            prkDefPlceInfoService.insertOnstreetParking(vo);
        } else if ("2".equals(type)) {
            prkDefPlceInfoService.insertOffstreetParking(vo);
        } else {
            prkDefPlceInfoService.insertBuildParking(vo);
        }
        return new RecordTarget(manageNo, vo.getPrkPlceInfoSn(), type);
    }

    private String resolveType(String manageNo) {
        if (manageNo.startsWith("42474")) {
            return "1";
        }
        if (manageNo.startsWith("42470")) {
            return "2";
        }
        return "3";
    }

    private String generateId(String prefix, int maxLength) {
        String base = prefix + System.currentTimeMillis();
        if (base.length() > maxLength) {
            return base.substring(0, maxLength);
        }
        return base;
    }

    private static class RecordTarget {
        private final String manageNo;
        private final long infoSn;
        private final String type;

        RecordTarget(String manageNo, long infoSn, String type) {
            this.manageNo = manageNo;
            this.infoSn = infoSn;
            this.type = type;
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
    }
}
