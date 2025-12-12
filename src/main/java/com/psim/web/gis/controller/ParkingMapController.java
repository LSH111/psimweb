package com.psim.web.gis.controller;

import com.psim.web.cmm.vo.CoUserVO;
import com.psim.web.gis.service.ParkingMapService;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/gis")
@RequiredArgsConstructor
public class ParkingMapController {

    private final ParkingMapService parkingMapService;

    @GetMapping("/parking-map-data")
    public Map<String, Object> getParkingMapData(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "name") String keywordType,
            @RequestParam(required = false) String prkPlceType,
            @RequestParam(required = false) String prgsStsCd,
            @RequestParam(required = false) String sidoCd,
            @RequestParam(required = false) String sigunguCd,
            HttpSession session
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> params = new HashMap<>();
            putIfPresent(params, "keyword", keyword);
            putIfPresent(params, "keywordType", keywordType);
            putIfPresent(params, "prkPlceType", prkPlceType);
            putIfPresent(params, "prgsStsCd", prgsStsCd);
            putIfPresent(params, "sidoCd", sidoCd);
            putIfPresent(params, "sigunguCd", sigunguCd);

            CoUserVO loginUser = (CoUserVO) session.getAttribute("loginUser");
            if (loginUser == null || loginUser.getUserId() == null || loginUser.getUserId().trim().isEmpty()) {
                String msg = "로그인 정보가 없습니다. 다시 로그인해 주세요.";
                log.warn("⚠️ {}", msg);
                response.put("success", false);
                response.put("message", msg);
                response.put("list", Collections.emptyList());
                response.put("filteredCount", 0);
                response.put("totalCount", 0);
                return response;
            }
            String loginUserId = loginUser.getUserId().trim();
            String userTyCode = loginUser.getUserTyCode();
            // 🔐 조사원(userTyCode=6)만 로그인 계정으로 제한
            if ("6".equals(userTyCode)) {
                params.put("loginUserId", loginUserId);
            }

            @SuppressWarnings("unchecked")
            List<String> userBizList = (List<String>) session.getAttribute("userBizList");
            if (userBizList != null && !userBizList.isEmpty()) {
                params.put("userBizList", userBizList);
            }

            log.info("🔍 GIS 지도 데이터 조회 params={}", params);
            List<ParkingListVO> list = parkingMapService.findParkingForMap(params);
            int filteredCount = parkingMapService.countParkingForMap(params);
            int totalCount = parkingMapService.countAllParkingForMap();

            response.put("success", true);
            response.put("list", list);
            response.put("filteredCount", filteredCount);
            response.put("totalCount", totalCount);
        } catch (Exception e) {
            log.error("❌ GIS 지도 데이터 조회 실패", e);
            response.put("success", false);
            response.put("message", "지도 데이터를 불러올 수 없습니다.");

            response.put("list", java.util.Collections.emptyList());
            response.put("filteredCount", 0);
            response.put("totalCount", 0);
        }
        return response;
    }

    private void putIfPresent(Map<String, Object> map, String key, String value) {
        if (value == null) return;
        String trimmed = value.trim();
        if (!trimmed.isEmpty()) {
            map.put(key, trimmed);
        }
    }
}
