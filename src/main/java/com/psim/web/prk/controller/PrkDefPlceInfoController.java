package com.psim.web.prk.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingListVO;

import java.util.ArrayList;
import java.util.HashMap;

@Controller
@RequestMapping("/prk")
public class PrkDefPlceInfoController {

    private final PrkDefPlceInfoService prkDefPlceInfoService;

    public PrkDefPlceInfoController(PrkDefPlceInfoService prkDefPlceInfoService) {
        this.prkDefPlceInfoService = prkDefPlceInfoService;
    }

    @GetMapping("/parkinglist")
    public String parkingList() {
        return "prk/parking-list";
    }

    // AJAX로 주차장 목록 데이터 조회 (페이징 제거)
    @GetMapping("/parking-data")
    @ResponseBody
    public Map<String, Object> getParkingData(@RequestParam Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 페이징 관련 파라미터 제거
            // offset, limit 파라미터를 전달하지 않음
            
            List<ParkingListVO> list = prkDefPlceInfoService.getParkingList(params);
            int totalCount = list.size(); // 전체 목록의 크기가 총 개수
            
            result.put("list", list);
            result.put("totalCount", totalCount);
            result.put("success", true);
            
        } catch (Exception e) {
            e.printStackTrace(); // 디버깅을 위해 추가
            result.put("success", false);
            result.put("message", "데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
            result.put("list", new ArrayList<>());
            result.put("totalCount", 0);
        }
        
        return result;
    }

    @GetMapping("/onparking")
    public String onParking() {
        return "prk/onparking";
    }
    
    @GetMapping("/offparking")
    public String offParking() {
        return "prk/offparking";
    }
    
    @GetMapping("/buildparking")
    public String buildParking() {
        return "prk/buildparking";
    }
}
