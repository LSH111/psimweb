package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.IndexService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class IndexController {

    private final IndexService indexService;

    @GetMapping("/index")
    public String index(HttpSession session, Model model) {
        SessionFilter filter = resolveSessionFilter(session);
        model.addAttribute("sessionSidoCd", filter.sidoCd);
        model.addAttribute("sessionSigunguCd", filter.sigunguCd);
        model.addAttribute("sessionPrkBizMngNo", filter.prkBizMngNo);
        model.addAttribute("isAdmin", filter.admin);
        return "/cmm/index";
    }

    @GetMapping("/api/dashboard/parking-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getParkingStatusDashboard(
            @RequestParam(required = false) String sidoCd,
            @RequestParam(required = false) String sigunguCd,
            HttpSession session) {
        SessionFilter filter = resolveSessionFilter(session);
        Map<String, Object> params = new HashMap<>();

        if (filter.admin) {
            // 관리자: 요청값이 없으면 세션값으로 기본 적용
            params.put("sidoCd", (sidoCd == null || sidoCd.isEmpty()) ? filter.sidoCd : sidoCd);
            params.put("sigunguCd", (sigunguCd == null || sigunguCd.isEmpty()) ? filter.sigunguCd : sigunguCd);
        } else {
            // 일반 사용자: 세션값 강제
            params.put("sidoCd", filter.sidoCd);
            params.put("sigunguCd", filter.sigunguCd);
        }
        params.put("prkBizMngNo", filter.prkBizMngNo);

        // 목록 쿼리와 동일한 파라미터 키를 함께 전달하여 공통 WHERE 블록을 재사용
        params.put("sido", params.get("sidoCd"));
        params.put("sigungu", params.get("sigunguCd"));

        Map<String, Object> status = indexService.getParkingStatusDashboard(params);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/api/dashboard/usage-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUsageStatusDashboard(
            @RequestParam(required = false) String sidoCd,
            @RequestParam(required = false) String sigunguCd,
            HttpSession session) {
        SessionFilter filter = resolveSessionFilter(session);
        Map<String, Object> params = new HashMap<>();

        if (filter.admin) {
            params.put("sidoCd", (sidoCd == null || sidoCd.isEmpty()) ? filter.sidoCd : sidoCd);
            params.put("sigunguCd", (sigunguCd == null || sigunguCd.isEmpty()) ? filter.sigunguCd : sigunguCd);
        } else {
            params.put("sidoCd", filter.sidoCd);
            params.put("sigunguCd", filter.sigunguCd);
        }
        params.put("prkBizMngNo", filter.prkBizMngNo);

        Map<String, Object> status = indexService.getUsageStatusDashboard(params);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/gis/parkingmap")
    public String parkingmap() {
        return "/gis/parkingmap";
    }

    private SessionFilter resolveSessionFilter(HttpSession session) {
        SessionFilter filter = new SessionFilter();
        Object adminFlag = session != null ? session.getAttribute("isAdmin") : null;
        CoUserVO loginUser = session != null ? (CoUserVO) session.getAttribute("loginUser") : null;
        filter.admin = Boolean.TRUE.equals(adminFlag) || (loginUser != null && "admin".equalsIgnoreCase(loginUser.getUserId()));

        if (session != null) {
            Object biz = session.getAttribute("prk_biz_mng_no");
            if (biz != null) filter.prkBizMngNo = biz.toString();
            Object sido = session.getAttribute("sido_cd");
            if (sido != null) filter.sidoCd = sido.toString();
            Object sigungu = session.getAttribute("sigungu_cd");
            if (sigungu != null) filter.sigunguCd = sigungu.toString();

            // userBizList 사용 시 첫 값 활용
            if (filter.prkBizMngNo == null) {
                Object list = session.getAttribute("userBizList");
                if (list instanceof java.util.List && !((java.util.List<?>) list).isEmpty()) {
                    filter.prkBizMngNo = ((java.util.List<?>) list).get(0).toString();
                }
            }
        }

        if (loginUser != null) {
            if (filter.sidoCd == null) filter.sidoCd = loginUser.getSidoCd();
            if (filter.sigunguCd == null) filter.sigunguCd = loginUser.getSigunguCd();
        }
        return filter;
    }

    private static class SessionFilter {
        String sidoCd;
        String sigunguCd;
        String prkBizMngNo;
        boolean admin;
    }
}
