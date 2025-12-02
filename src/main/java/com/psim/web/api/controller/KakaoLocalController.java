package com.psim.web.api.controller;

import com.psim.integration.geocoding.GeocodingClient;
import com.psim.integration.geocoding.GeocodingException;
import com.psim.integration.geocoding.model.GeoAddress;
import com.psim.integration.geocoding.model.GeoCoordinate;
import com.psim.integration.geocoding.model.GeoRegion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/kakao")
@RequiredArgsConstructor
public class KakaoLocalController {

    private final GeocodingClient geocodingClient;

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
            GeoAddress address = geocodingClient.reverseGeocode(longitude, latitude)
                    .orElse(null);

            if (address == null) {
                result.put("success", false);
                result.put("message", "주소를 찾을 수 없습니다.");
                return ResponseEntity.ok(result);
            }

            result.put("success", true);
            result.put("data", address);
            result.put("jibunAddress", address.getJibunAddress());
            result.put("roadAddress", address.getRoadAddress());
            result.put("zoneNo", address.getZoneNo());
            return ResponseEntity.ok(result);

        } catch (GeocodingException ge) {
            log.error("좌표->주소 변환 에러", ge);
            result.put("success", false);
            result.put("message", ge.getMessage());
            return ResponseEntity.status(500).body(result);
        } catch (RuntimeException re) {
            log.error("좌표->주소 변환 중 알 수 없는 오류", re);
            result.put("success", false);
            result.put("message", "주소 변환 중 오류가 발생했습니다.");
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
            GeoCoordinate coordinate = geocodingClient.geocodeAddress(address)
                    .orElse(null);

            if (coordinate == null) {
                result.put("success", false);
                result.put("message", "좌표를 찾을 수 없습니다.");
                return ResponseEntity.ok(result);
            }

            result.put("success", true);
            result.put("data", coordinate);
            result.put("longitude", coordinate.getLongitude());
            result.put("latitude", coordinate.getLatitude());
            return ResponseEntity.ok(result);

        } catch (GeocodingException ge) {
            log.error("주소->좌표 변환 에러", ge);
            result.put("success", false);
            result.put("message", ge.getMessage());
            return ResponseEntity.status(500).body(result);
        } catch (RuntimeException re) {
            log.error("주소->좌표 변환 중 알 수 없는 오류", re);
            result.put("success", false);
            result.put("message", "좌표 변환 중 오류가 발생했습니다.");
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
            GeoRegion region = geocodingClient.findRegion(longitude, latitude)
                    .orElse(null);

            if (region != null) {
                result.put("success", true);
                result.put("data", region);
                result.put("sido", region.getSido());
                result.put("sigungu", region.getSigungu());
                result.put("emd", region.getEmd());
                result.put("ri", region.getRi());
                result.put("code", region.getCode());
                result.put("regionType", region.getRegionType());

                return ResponseEntity.ok(result);
            }

            result.put("success", false);
            result.put("message", "행정구역을 찾을 수 없습니다.");
            return ResponseEntity.ok(result);

        } catch (GeocodingException ge) {
            log.error("좌표->행정구역 변환 에러", ge);
            result.put("success", false);
            result.put("message", ge.getMessage());
            return ResponseEntity.status(500).body(result);
        } catch (RuntimeException re) {
            log.error("좌표->행정구역 변환 중 알 수 없는 오류", re);
            result.put("success", false);
            result.put("message", "행정구역 변환 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
}
