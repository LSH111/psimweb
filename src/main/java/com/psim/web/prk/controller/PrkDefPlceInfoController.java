package com.psim.web.prk.controller;

import com.psim.web.prk.vo.OnstreetParkingDetailVO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingListVO;

import java.util.ArrayList;

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

    // 🔥 노상주차장 상세 조회 API 추가
    @GetMapping("/onparking-detail")
    @ResponseBody
    public Map<String, Object> getOnstreetParkingDetail(@RequestParam String prkPlceManageNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 노상주차장 상세 조회 요청: " + prkPlceManageNo + " ===");

            OnstreetParkingDetailVO detail = prkDefPlceInfoService.getOnstreetParkingDetail(prkPlceManageNo);

            if (detail != null) {
                result.put("success", true);
                result.put("data", detail);
                System.out.println("✅ 노상주차장 상세 조회 성공");
            } else {
                result.put("success", false);
                result.put("message", "주차장 정보를 찾을 수 없습니다.");
                System.out.println("⚠️ 데이터 없음");
            }
        } catch (Exception e) {
            System.err.println("❌ 노상주차장 상세 조회 실패: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "조회 중 오류가 발생했습니다: " + e.getMessage());
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
