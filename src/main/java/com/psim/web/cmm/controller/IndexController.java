package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.IndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class IndexController {

    private final IndexService indexService;

    @GetMapping("/index")
    public String index(Model model) {
        // 주차장 현황 데이터 조회
        Map<String, Object> parkingStatus = indexService.getParkingStatus();
        model.addAttribute("parkingStatus", parkingStatus);

        // 이용상태 현황 데이터 조회
        Map<String, Object> usageStatus = indexService.getUsageStatus();
        model.addAttribute("usageStatus", usageStatus);

        return "/cmm/index";
    }

    @GetMapping("/gis/parkingmap")
    public String parkingmap() {
        return "/gis/parkingmap";
    }
}
