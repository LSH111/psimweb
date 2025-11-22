package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.IndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class IndexController {

    private final IndexService indexService;

    @GetMapping("/index")
    public String index() {
        return "/cmm/index";
    }

    @GetMapping("/api/dashboard/parking-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getParkingStatusDashboard(
            @RequestParam(required = false) String sidoCd,
            @RequestParam(required = false) String sigunguCd) {
        Map<String, Object> params = new HashMap<>();
        params.put("sidoCd", sidoCd);
        params.put("sigunguCd", sigunguCd);
        Map<String, Object> status = indexService.getParkingStatusDashboard(params);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/api/dashboard/usage-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getUsageStatusDashboard(
            @RequestParam(required = false) String sidoCd,
            @RequestParam(required = false) String sigunguCd) {
        Map<String, Object> params = new HashMap<>();
        params.put("sidoCd", sidoCd);
        params.put("sigunguCd", sigunguCd);
        Map<String, Object> status = indexService.getUsageStatusDashboard(params);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/gis/parkingmap")
    public String parkingmap() {
        return "/gis/parkingmap";
    }
}
