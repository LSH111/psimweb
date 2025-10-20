
package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoCodeService;
import com.psim.web.cmm.vo.CoCodeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/codes")
@RequiredArgsConstructor
public class CoCodeController {
    
    private final CoCodeService coCodeService;
    
    /**
     * 시도 목록 조회
     */
    @GetMapping("/sido")
    public Map<String, Object> getSidoList() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<CoCodeVO> sidoList = coCodeService.getCodeListByGroup("B0001");
            result.put("success", true);
            result.put("data", sidoList);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "시도 목록 조회 중 오류가 발생했습니다.");
        }
        return result;
    }
    
    /**
     * 시군구 목록 조회
     */
    @GetMapping("/sigungu")
    public Map<String, Object> getSigunguList(@RequestParam String sidoCd) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("groupCd", "B0002");
            params.put("upperCodeCd", sidoCd);
            
            List<CoCodeVO> sigunguList = coCodeService.getSubCodeList(params);
            result.put("success", true);
            result.put("data", sigunguList);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "시군구 목록 조회 중 오류가 발생했습니다.");
        }
        return result;
    }
}
