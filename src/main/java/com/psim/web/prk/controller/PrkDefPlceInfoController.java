package com.psim.web.prk.controller;

import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/prk")
@RequiredArgsConstructor
public class PrkDefPlceInfoController {

    private final PrkDefPlceInfoService prkDefPlceInfoService;

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

    /**
     * 노상주차장 상세 조회
     */
    @GetMapping("/onparking-detail")
    @ResponseBody
    public Map<String, Object> getOnstreetParkingDetail(@RequestParam String prkPlceManageNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 노상주차장 상세 조회 요청: " + prkPlceManageNo + " ===");

            ParkingDetailVO detail = prkDefPlceInfoService.getOnstreetParkingDetail(prkPlceManageNo);

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

    /**
     * 노상주차장 정보 업데이트
     */
    @PostMapping("/onparking-update")
    public ResponseEntity<Map<String, Object>> updateOnstreetParking(
            @RequestBody ParkingDetailVO parkingData,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("💾 노상주차장 업데이트 요청 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            // 필수 값 검증
            if (parkingData.getPrkPlceManageNo() == null || parkingData.getPrkPlceManageNo().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "주차장 관리번호는 필수입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 🔥 개발 중에는 임시로 하드코딩된 사용자 정보 사용
            String userId = "SYSTEM";
            String clientIp = "127.0.0.1";

            // 🔥 실제 운영 환경에서는 아래 주석을 해제하고 위 2줄은 삭제
                /*
                HttpSession session = request.getSession(false);
                String userId = null;
                if (session != null) {
                    Object userObj = session.getAttribute("userId");
                    if (userObj != null) {
                        userId = userObj.toString();
                    }
                }

                if (userId == null || userId.trim().isEmpty()) {
                    response.put("success", false);
                    response.put("message", "로그인이 필요합니다.");
                    return ResponseEntity.status(401).body(response);
                }

                String clientIp = getClientIp(request);
                */

            // VO에 설정
            parkingData.setUpdusrId(userId);
            parkingData.setUpdusrIpAddr(clientIp);

            log.info("📝 업데이트 정보 - 사용자: {}, IP: {}", userId, clientIp);

            // 업데이트 실행
            prkDefPlceInfoService.updateOnstreetParking(parkingData);

            response.put("success", true);
            response.put("message", "주차장 정보가 성공적으로 저장되었습니다.");
            log.info("✅ 노상주차장 업데이트 성공 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 노상주차장 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "데이터 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 🔥 노외주차장 상세 조회
     */
    @GetMapping("/offparking-detail")
    @ResponseBody
    public Map<String, Object> getOffstreetParkingDetail(@RequestParam String prkPlceManageNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 노외주차장 상세 조회 요청: " + prkPlceManageNo + " ===");

            ParkingDetailVO detail = prkDefPlceInfoService.getOffstreetParkingDetail(prkPlceManageNo);

            if (detail != null) {
                result.put("success", true);
                result.put("data", detail);
                System.out.println("✅ 노외주차장 상세 조회 성공");
            } else {
                result.put("success", false);
                result.put("message", "주차장 정보를 찾을 수 없습니다.");
                System.out.println("⚠️ 데이터 없음");
            }
        } catch (Exception e) {
            System.err.println("❌ 노외주차장 상세 조회 실패: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    /**
     * 🔥 노외주차장 정보 업데이트
     */
    @PostMapping("/offparking-update")
    public ResponseEntity<Map<String, Object>> updateOffstreetParking(
            @RequestBody ParkingDetailVO parkingData,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("💾 노외주차장 업데이트 요청 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            // 필수 값 검증
            if (parkingData.getPrkPlceManageNo() == null || parkingData.getPrkPlceManageNo().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "주차장 관리번호는 필수입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 🔥 개발 중에는 임시로 하드코딩된 사용자 정보 사용
            String userId = "SYSTEM";
            String clientIp = "127.0.0.1";

            // VO에 설정
            parkingData.setUpdusrId(userId);
            parkingData.setUpdusrIpAddr(clientIp);

            log.info("📝 업데이트 정보 - 사용자: {}, IP: {}", userId, clientIp);

            // 업데이트 실행
            prkDefPlceInfoService.updateOffstreetParking(parkingData);

            response.put("success", true);
            response.put("message", "주차장 정보가 성공적으로 저장되었습니다.");
            log.info("✅ 노외주차장 업데이트 성공 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 노외주차장 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "데이터 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 🔥 부설주차장 상세 조회
     */
    @GetMapping("/buildparking-detail")
    @ResponseBody
    public Map<String, Object> getBuildParkingDetail(@RequestParam String prkPlceManageNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("=== 부설주차장 상세 조회 요청: " + prkPlceManageNo + " ===");

            ParkingDetailVO detail = prkDefPlceInfoService.getBuildParkingDetail(prkPlceManageNo);

            if (detail != null) {
                result.put("success", true);
                result.put("data", detail);
                System.out.println("✅ 부설주차장 상세 조회 성공");
            } else {
                result.put("success", false);
                result.put("message", "주차장 정보를 찾을 수 없습니다.");
                System.out.println("⚠️ 데이터 없음");
            }
        } catch (Exception e) {
            System.err.println("❌ 부설주차장 상세 조회 실패: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    /**
     * 🔥 부설주차장 정보 업데이트
     */
    @PostMapping("/buildparking-update")
    public ResponseEntity<Map<String, Object>> updateBuildParking(
            @RequestBody ParkingDetailVO parkingData,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("💾 부설주차장 업데이트 요청 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            // 필수 값 검증
            if (parkingData.getPrkPlceManageNo() == null || parkingData.getPrkPlceManageNo().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "주차장 관리번호는 필수입니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 🔥 개발 중에는 임시로 하드코딩된 사용자 정보 사용
            String userId = "SYSTEM";
            String clientIp = "127.0.0.1";

            // VO에 설정
            parkingData.setUpdusrId(userId);
            parkingData.setUpdusrIpAddr(clientIp);

            log.info("📝 업데이트 정보 - 사용자: {}, IP: {}", userId, clientIp);

            // 업데이트 실행
            prkDefPlceInfoService.updateBuildParking(parkingData);

            response.put("success", true);
            response.put("message", "주차장 정보가 성공적으로 저장되었습니다.");
            log.info("✅ 부설주차장 업데이트 성공 - prkPlceManageNo: {}", parkingData.getPrkPlceManageNo());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 부설주차장 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "데이터 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }


    /**
     * 클라이언트 실제 IP 주소 추출 (프록시 고려)
     * IPv6가 반환되면 IPv4로 변환 시도
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // X-Forwarded-For에 여러 IP가 있는 경우 첫 번째 IP 사용
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        // 🔥 IPv6 localhost를 IPv4로 변환
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }

        // 🔥 IPv6 형식이면 앞부분만 추출 (간단한 변환)
        if (ip != null && ip.contains(":") && !ip.contains(".")) {
            // IPv6를 IPv4 매핑으로 변환 시도
            // 실제 환경에서는 더 정교한 처리 필요할 수 있음
            log.warn("⚠️ IPv6 주소 감지: {} - 127.0.0.1로 대체", ip);
            ip = "127.0.0.1";
        }

        return ip;
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
