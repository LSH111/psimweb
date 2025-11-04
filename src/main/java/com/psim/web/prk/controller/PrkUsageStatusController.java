package com.psim.web.prk.controller;

import com.psim.web.cmm.vo.CoUserVO;
import com.psim.web.prk.service.PrkUsageStatusService;
import com.psim.web.prk.vo.PrkUsageStatusVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 주차이용실태관리 Controller
 */
@Slf4j
@Controller
@RequestMapping("/prk")
@RequiredArgsConstructor
public class PrkUsageStatusController {
    
    private final PrkUsageStatusService usageStatusService;

    /**
     * 주차이용실태 목록 화면
     */
    @GetMapping("/usage-status-list")
    public String usageStatusList(HttpSession session, Model model) {
        // 세션에서 사용자 정보 가져오기
        CoUserVO loginUser = (CoUserVO) session.getAttribute("loginUser");
        @SuppressWarnings("unchecked")
        List<String> userBizList = (List<String>) session.getAttribute("userBizList");

        if (loginUser != null) {
            // 사업관리번호 (첫 번째 것 사용)
            String prkBizMngNo = (userBizList != null && !userBizList.isEmpty())
                    ? userBizList.get(0)
                    : null;

            // 모델에 세션 정보 추가
            model.addAttribute("prkBizMngNo", prkBizMngNo);
            model.addAttribute("sigunguCd", loginUser.getSigunguCd());
            model.addAttribute("sidoCd", loginUser.getSidoCd());
            // 🔥 조사원 정보 추가 (사용자명과 연락처)
            model.addAttribute("userName", loginUser.getUserNm());
            model.addAttribute("userTel", loginUser.getMbtlnum());

            log.info("사용자 정보 - prkBizMngNo: {}, sigunguCd: {}, sidoCd: {}, userName: {}, userTel: {}",
                    prkBizMngNo, loginUser.getSigunguCd(), loginUser.getSidoCd(), loginUser.getUserNm(), loginUser.getMbtlnum());
        } else {
            log.warn("세션에 로그인 사용자 정보가 없습니다.");
        }

        return "prk/usage-status-list";
    }

    /**
     * 주차이용실태 목록 조회 API
     */
    @GetMapping("/api/usage-status/list")
    @ResponseBody
    public Map<String, Object> getUsageStatusList(PrkUsageStatusVO vo) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 🔥 검색 조건 로깅
            log.info("🔍 목록 조회 요청 - prkBizMngNo: {}, searchVehicleNo: {}, searchLawCd: {}",
                    vo.getPrkBizMngNo(), vo.getSearchVehicleNo(), vo.getSearchLawCd());

            List<PrkUsageStatusVO> list = usageStatusService.getUsageStatusList(vo);

            // 🔥 조회 결과 로깅
            log.info("✅ 목록 조회 결과: {}건", list != null ? list.size() : 0);
            if (list != null && !list.isEmpty()) {
                log.info("📋 첫 번째 데이터: {}", list.get(0));
            }

            result.put("success", true);
            result.put("list", list);
            result.put("totalCount", list != null ? list.size() : 0);
            result.put("page", vo.getPage());
            result.put("pageSize", vo.getPageSize());

        } catch (Exception e) {
            log.error("❌ 주차이용실태 목록 조회 오류", e);
            result.put("success", false);
            result.put("message", "목록 조회 중 오류가 발생했습니다.");
        }

        return result;
    }

    /**
     * 주차이용실태 상세 조회 API
     */
    @GetMapping("/api/usage-status/detail")
    @ResponseBody
    public Map<String, Object> getUsageStatusDetail(PrkUsageStatusVO vo) {
        Map<String, Object> result = new HashMap<>();
    
        try {
            PrkUsageStatusVO data = usageStatusService.getUsageStatusDetail(vo);
        
            result.put("success", true);
            result.put("data", data);
        
        } catch (Exception e) {
            log.error("주차이용실태 상세 조회 오류", e);
            result.put("success", false);
            result.put("message", "상세 조회 중 오류가 발생했습니다.");
        }
    
        return result;
    }

    /**
     * 주차이용실태 저장 API
     */
    @PostMapping("/api/usage-status/save")
    @ResponseBody
    public Map<String, Object> saveUsageStatus(@RequestBody PrkUsageStatusVO vo,
                                               HttpServletRequest request,
                                               HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 🔥 세션에서 로그인 사용자 정보 가져오기
            CoUserVO loginUser = (CoUserVO) session.getAttribute("loginUser");

            if (loginUser == null) {
                result.put("success", false);
                result.put("message", "로그인 정보가 없습니다. 다시 로그인해주세요.");
                return result;
            }

            // 🔥 세션에서 사업관리번호 목록 가져오기
            @SuppressWarnings("unchecked")
            List<String> userBizList = (List<String>) session.getAttribute("userBizList");

            if (userBizList != null && !userBizList.isEmpty()) {
                // 첫 번째 사업관리번호 사용
                String prkBizMngNo = userBizList.get(0);
                vo.setPrkBizMngNo(prkBizMngNo);
                log.info("세션에서 가져온 사업관리번호: {}", prkBizMngNo);
            } else {
                result.put("success", false);
                result.put("message", "사업관리번호 정보가 없습니다. 다시 로그인해주세요.");
                return result;
            }

            // 🔥 등록자/수정자 ID 설정
            vo.setRgstId(loginUser.getUserId());
            vo.setUpdusrId(loginUser.getUserId());

            // IP 주소 설정
            String ipAddress = request.getRemoteAddr();
            vo.setRgstIpAddr(ipAddress);
            vo.setUpdusrIpAddr(ipAddress);

            log.info("저장 데이터 - prkBizMngNo: {}, rgstId: {}, rgstIpAddr: {}",
                    vo.getPrkBizMngNo(), vo.getRgstId(), vo.getRgstIpAddr());

            int cnt = 0;
            if (vo.getCmplSn() != null && !vo.getCmplSn().isEmpty()) {
                // 수정
                cnt = usageStatusService.updateUsageStatus(vo);
            } else {
                // 등록
                cnt = usageStatusService.insertUsageStatus(vo);
            }

            result.put("success", cnt > 0);
            result.put("message", cnt > 0 ? "저장되었습니다." : "저장에 실패했습니다.");

        } catch (Exception e) {
            log.error("주차이용실태 저장 오류", e);
            result.put("success", false);
            result.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
        }

        return result;
    }

    /**
     * 주차이용실태 삭제 API
     */
    @DeleteMapping("/api/usage-status/delete")
    @ResponseBody
    public Map<String, Object> deleteUsageStatus(PrkUsageStatusVO vo) {
        Map<String, Object> result = new HashMap<>();
    
        try {
            int cnt = usageStatusService.deleteUsageStatus(vo);
        
            result.put("success", cnt > 0);
            result.put("message", cnt > 0 ? "삭제되었습니다." : "삭제에 실패했습니다.");
        
        } catch (Exception e) {
            log.error("주차이용실태 삭제 오류", e);
            result.put("success", false);
            result.put("message", "삭제 중 오류가 발생했습니다.");
        }
    
        return result;
    }
}
