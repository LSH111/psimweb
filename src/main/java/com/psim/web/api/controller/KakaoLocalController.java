package com.psim.web.api.controller;

import com.psim.web.api.service.KakaoLocalService;
import com.psim.web.api.vo.KakaoAddress2CoordResponse;
import com.psim.web.api.vo.KakaoCoord2AddressResponse;
import com.psim.web.api.vo.KakaoCoord2RegionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/kakao")
@RequiredArgsConstructor
public class KakaoLocalController {

    private final KakaoLocalService kakaoLocalService;

    /**
     * 좌표를 주소로 변환
     * GET /api/kakao/coord2address?longitude=127.423084&latitude=37.402056
     */
    @GetMapping("/coord2address")
    public ResponseEntity<Map<String, Object>> coord2Address(
            @RequestParam String longitude,
            @RequestParam String latitude) {

        Map<String, Object> result = new HashMap<>();

        try {
            KakaoCoord2AddressResponse response = kakaoLocalService.convertCoord2Address(longitude, latitude);

            if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
                KakaoCoord2AddressResponse.Document doc = response.getDocuments().get(0);

                result.put("success", true);
                result.put("data", doc);

                // 편의를 위해 주소 문자열도 포함
                if (doc.getAddress() != null) {
                    result.put("jibunAddress", doc.getAddress().getAddress_name());
                }
                if (doc.getRoad_address() != null) {
                    result.put("roadAddress", doc.getRoad_address().getAddress_name());
                    // 🔥 우편번호 추가
                    result.put("zoneNo", doc.getRoad_address().getZone_no());
                }

                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "주소를 찾을 수 없습니다.");
                return ResponseEntity.ok(result);
            }

        } catch (Exception e) {
            log.error("좌표->주소 변환 에러", e);
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 주소를 좌표로 변환
     * GET /api/kakao/address2coord?address=서울 마포구 연남동 123-45
     */
    @GetMapping("/address2coord")
    public ResponseEntity<Map<String, Object>> address2Coord(@RequestParam String address) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            KakaoAddress2CoordResponse response = kakaoLocalService.convertAddress2Coord(address);
            
            if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
                KakaoAddress2CoordResponse.Document doc = response.getDocuments().get(0);
                
                result.put("success", true);
                result.put("data", doc);
                result.put("longitude", doc.getX());
                result.put("latitude", doc.getY());
                
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "좌표를 찾을 수 없습니다.");
                return ResponseEntity.ok(result);
            }
            
        } catch (Exception e) {
            log.error("주소->좌표 변환 에러", e);
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 좌표를 행정구역으로 변환
     * GET /api/kakao/coord2region?longitude=127.423084&latitude=37.402056
     */
    @GetMapping("/coord2region")
    public ResponseEntity<Map<String, Object>> coord2Region(
            @RequestParam String longitude,
            @RequestParam String latitude) {

        Map<String, Object> result = new HashMap<>();

        try {
            KakaoCoord2RegionResponse response = kakaoLocalService.convertCoord2Region(longitude, latitude);

            if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
                // 법정동(B) 우선, 없으면 행정동(H) 사용
                KakaoCoord2RegionResponse.Document bDoc = response.getDocuments().stream()
                        .filter(d -> "B".equals(d.getRegion_type()))
                        .findFirst()
                        .orElse(null);

                KakaoCoord2RegionResponse.Document hDoc = response.getDocuments().stream()
                        .filter(d -> "H".equals(d.getRegion_type()))
                        .findFirst()
                        .orElse(null);

                KakaoCoord2RegionResponse.Document doc = bDoc != null ? bDoc : hDoc;

                if (doc != null) {
                    result.put("success", true);
                    result.put("data", doc);
                    result.put("sido", doc.getRegion_1depth_name());
                    result.put("sigungu", doc.getRegion_2depth_name());
                    result.put("emd", doc.getRegion_3depth_name());
                    result.put("ri", doc.getRegion_4depth_name());
                    result.put("code", doc.getCode());
                    result.put("regionType", doc.getRegion_type());

                    return ResponseEntity.ok(result);
                }
            }

            result.put("success", false);
            result.put("message", "행정구역을 찾을 수 없습니다.");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("좌표->행정구역 변환 에러", e);
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}
