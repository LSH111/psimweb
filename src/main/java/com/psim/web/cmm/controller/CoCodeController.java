
package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeGroupVO;
import com.psim.web.cmm.vo.CoCodeVO;
import com.psim.web.cmm.vo.CoLdongVO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeVO;

import java.util.ArrayList;

@Controller
@RequestMapping("/cmm/codes")  // 이 라인을 추가해야 합니다
public class CoCodeController {

    @Autowired
    private CoCodeService coCodeService;

    /**
     * 시도 목록 조회
     */
    @GetMapping("/sido")
    @ResponseBody
    public Map<String, Object> getSidoList() {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 시도 목록 조회 시작 ===");

            List<CoCodeVO> sidoList = coCodeService.getCodeListByGroup("B0001");
            System.out.println("조회된 시도 목록 개수: " + (sidoList != null ? sidoList.size() : 0));

            if (sidoList != null && !sidoList.isEmpty()) {
                for (CoCodeVO item : sidoList) {
                    System.out.println("시도: " + item.getCodeCd() + " - " + item.getCodeNm());
                }
            }

            result.put("success", true);
            result.put("data", sidoList);
            System.out.println("=== 시도 목록 조회 성공 ===");

        } catch (Exception e) {
            System.err.println("=== 시도 목록 조회 중 오류 ===");
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "시도 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    /**
     * 시군구 목록 조회 (시도 코드에 따른)
     */
    @GetMapping("/sigungu")
    @ResponseBody
    public Map<String, Object> getSigunguList(@RequestParam String sidoCd) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 시군구 목록 조회 시작, 시도코드: " + sidoCd + " ===");

            Map<String, Object> params = new HashMap<>();
            params.put("groupCd", "B0002");  // 시군구 그룹코드
            params.put("upperCodeCd", sidoCd);  // 시도코드

            List<CoCodeVO> sigunguList = coCodeService.getSubCodeList(params);
            System.out.println("조회된 시군구 목록 개수: " + (sigunguList != null ? sigunguList.size() : 0));

            if (sigunguList != null && !sigunguList.isEmpty()) {
                for (CoCodeVO item : sigunguList) {
                    System.out.println("시군구: " + item.getCodeCd() + " - " + item.getCodeNm());
                }
            }

            result.put("success", true);
            result.put("data", sigunguList);

        } catch (Exception e) {
            System.err.println("=== 시군구 목록 조회 중 오류 ===");
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "시군구 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    /**
     * 읍면동 목록 조회 (시군구 코드에 따른)
     */
    @GetMapping("/emd")
    @ResponseBody
    public Map<String, Object> getEmdList(@RequestParam String sigunguCd) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 읍면동 목록 조회 시작, 시군구코드: " + sigunguCd + " ===");

            List<CoLdongVO> emdList = coCodeService.getLdongList(sigunguCd);
            System.out.println("조회된 읍면동 목록 개수: " + (emdList != null ? emdList.size() : 0));

            if (emdList != null && !emdList.isEmpty()) {
                for (CoLdongVO item : emdList) {
                    System.out.println("읍면동: " + item.getEmdCd() + " - " + item.getLgalEmdNm());
                }
            }

            result.put("success", true);
            result.put("data", emdList);

        } catch (Exception e) {
            System.err.println("=== 읍면동 목록 조회 중 오류 ===");
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "읍면동 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    /**
     * 주차형태 목록 조회
     */
    @GetMapping("/parking-type")
    @ResponseBody
    public Map<String, Object> getParkingTypeList() {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("success", true);
            result.put("data", coCodeService.getCodeListByGroup("P_PRKPLCE_SE"));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "주차형태 목록 조회 실패: " + e.getMessage());
        }
        return result;
    }

    /**
     * 진행상태 목록 조회
     */
    @GetMapping("/status")
    @ResponseBody
    public Map<String, Object> getStatusList() {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("success", true);
            result.put("data", coCodeService.getCodeListByGroup("PRK_013"));
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "진행상태 목록 조회 실패: " + e.getMessage());
        }
        return result;
    }

    /**
     * 동적 코드 그룹 목록 조회 (코드 그룹 테이블 기반)
     */
    @GetMapping("/dynamic-groups")
    @ResponseBody
    public Map<String, Object> getDynamicCodeGroups() {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 동적 코드 그룹 목록 조회 시작 ===");

            // 1. 코드 그룹 목록 조회
            List<CoCodeGroupVO> codeGroups = coCodeService.getCodeGroupList();

            if (codeGroups != null && !codeGroups.isEmpty()) {
                Map<String, Object> groupsData = new HashMap<>();

                // 2. 각 group_cd별로 코드 목록 조회
                for (CoCodeGroupVO group : codeGroups) {
                    String groupCd = group.getGroupCd();
                    String groupNm = group.getGroupNm();

                    System.out.println("코드 그룹 조회: " + groupCd + " (" + groupNm + ")");

                    List<CoCodeVO> codeList = coCodeService.getCodeListByGroup(groupCd);

                    Map<String, Object> groupInfo = new HashMap<>();
                    groupInfo.put("groupCode", groupCd);
                    groupInfo.put("groupName", groupNm);
                    groupInfo.put("codes", codeList);

                    groupsData.put(groupCd, groupInfo);
                }

                result.put("success", true);
                result.put("groups", groupsData);
                System.out.println("=== 동적 코드 그룹 목록 조회 완료, 그룹 수: " + groupsData.size() + " ===");
            } else {
                result.put("success", false);
                result.put("message", "조회된 코드 그룹이 없습니다.");
            }

        } catch (Exception e) {
            System.err.println("=== 동적 코드 그룹 목록 조회 중 오류 ===");
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "코드 그룹 목록 조회 실패: " + e.getMessage());
        }
        return result;
    }
}
