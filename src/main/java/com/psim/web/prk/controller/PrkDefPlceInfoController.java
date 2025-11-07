package com.psim.web.prk.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
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
    private final AttchPicMngInfoService attchPicService; // 🔥 추가

    /*@GetMapping("/parkinglist")
    public String parkingList() {
        return "prk/parking-list";
    }*/
    @GetMapping("/parkinglist")
    public String parkingList(
            @RequestParam(value = "openDetail", required = false) String openDetailId,
            @RequestParam(value = "type", required = false) String parkingType,
            Model model) {

        // 🔥 상세보기 파라미터가 있으면 모델에 추가
        if (openDetailId != null && !openDetailId.isEmpty()) {
            model.addAttribute("openDetailId", openDetailId);
            model.addAttribute("parkingType", parkingType);
            log.info("🔍 상세보기 요청: ID={}, Type={}", openDetailId, parkingType);
        }

        return "prk/parking-list";
    }

    // AJAX로 주차장 목록 데이터 조회 (페이징 제거)
    @GetMapping("/parking-data")
    @ResponseBody
    public Map<String, Object> getParkingData(@RequestParam Map<String, Object> params, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        // 🔥 세션에서 userBizList 가져와서 params에 추가
        List<String> userBizList = (List<String>) session.getAttribute("userBizList");
        if (userBizList != null && !userBizList.isEmpty()) {
            params.put("userBizList", userBizList);
        }
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
     * 🔥 노상주차장 정보 업데이트 (파일 업로드 포함)
     */
    @PostMapping("/onparking-update")
    public ResponseEntity<Map<String, Object>> updateOnstreetParking(
            @RequestPart("parkingData") String parkingDataJson, // ✅ JSON 문자열로 받기
            @RequestPart(value = "mainPhoto", required = false) MultipartFile mainPhoto,
            @RequestPart(value = "signPhoto", required = false) MultipartFile signPhoto,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔄 노상주차장 업데이트 시작");

            // ✅ JSON 문자열을 객체로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            ParkingDetailVO parkingData = objectMapper.readValue(parkingDataJson, ParkingDetailVO.class);

            log.info("📝 주차장 관리번호: {}", parkingData.getPrkPlceManageNo());

            // 주차장 정보 저장
            prkDefPlceInfoService.updateOnstreetParking(parkingData);

            Integer prkPlceInfoSn = parkingData.getPrkPlceInfoSn();

            // 🔥 현장 사진 저장
            if (mainPhoto != null && !mainPhoto.isEmpty()) {
                log.info("📸 현장 사진 저장 시작: {}", mainPhoto.getOriginalFilename());
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "ON_MAIN", mainPhoto);
            }

            // 🔥 표지판 사진 저장
            if (signPhoto != null && !signPhoto.isEmpty()) {
                log.info("📸 표지판 사진 저장 시작: {}", signPhoto.getOriginalFilename());
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "ON_SIGN", signPhoto);
            }

            response.put("success", true);
            response.put("message", "저장되었습니다.");

            log.info("✅ 노상주차장 업데이트 완료");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 노상주차장 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
     * 🔥 노외주차장 정보 업데이트 (파일 업로드 포함)
     */
    @PostMapping("/offparking-update")
    public ResponseEntity<Map<String, Object>> updateOffstreetParking(
            @RequestBody ParkingDetailVO parkingData,
            @RequestParam(value = "mainPhoto", required = false) MultipartFile mainPhoto,
            @RequestParam(value = "signPhoto", required = false) MultipartFile signPhoto,
            @RequestParam(value = "ticketPhoto", required = false) MultipartFile ticketPhoto,
            @RequestParam(value = "barrierPhoto", required = false) MultipartFile barrierPhoto,
            @RequestParam(value = "exitAlarmPhoto", required = false) MultipartFile exitAlarmPhoto,
            @RequestParam(value = "entrancePhoto", required = false) MultipartFile entrancePhoto,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔄 노외주차장 업데이트 시작: {}", parkingData.getPrkPlceManageNo());

            // 주차장 정보 저장
            prkDefPlceInfoService.updateOffstreetParking(parkingData);

            Integer prkPlceInfoSn = parkingData.getPrkPlceInfoSn();

            // 🔥 각 사진 저장
            if (mainPhoto != null && !mainPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_MAIN", mainPhoto);
            }
            if (signPhoto != null && !signPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_SIGN", signPhoto);
            }
            if (ticketPhoto != null && !ticketPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_TICKET", ticketPhoto);
            }
            if (barrierPhoto != null && !barrierPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_BARRIER", barrierPhoto);
            }
            if (exitAlarmPhoto != null && !exitAlarmPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_EXIT_ALARM", exitAlarmPhoto);
            }
            if (entrancePhoto != null && !entrancePhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_ENTRANCE", entrancePhoto);
            }

            response.put("success", true);
            response.put("message", "저장되었습니다.");

            log.info("✅ 노외주차장 업데이트 완료");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 노외주차장 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
     * 🔥 부설주차장 정보 업데이트 (파일 업로드 포함)
     */
    @PostMapping("/buildparking-update")
    public ResponseEntity<Map<String, Object>> updateBuildParking(
            @RequestBody ParkingDetailVO parkingData,
            @RequestParam(value = "mainPhoto", required = false) MultipartFile mainPhoto,
            @RequestParam(value = "signPhoto", required = false) MultipartFile signPhoto,
            @RequestParam(value = "ticketPhoto", required = false) MultipartFile ticketPhoto,
            @RequestParam(value = "barrierPhoto", required = false) MultipartFile barrierPhoto,
            @RequestParam(value = "exitAlarmPhoto", required = false) MultipartFile exitAlarmPhoto,
            @RequestParam(value = "entrancePhoto", required = false) MultipartFile entrancePhoto,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔄 부설주차장 업데이트 시작: {}", parkingData.getPrkPlceManageNo());

            // 주차장 정보 저장
            prkDefPlceInfoService.updateBuildParking(parkingData);

            Integer prkPlceInfoSn = parkingData.getPrkPlceInfoSn();

            // 🔥 각 사진 저장
            if (mainPhoto != null && !mainPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_MAIN", mainPhoto);
            }
            if (signPhoto != null && !signPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_SIGN", signPhoto);
            }
            if (ticketPhoto != null && !ticketPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_TICKET", ticketPhoto);
            }
            if (barrierPhoto != null && !barrierPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_BARRIER", barrierPhoto);
            }
            if (exitAlarmPhoto != null && !exitAlarmPhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_EXIT_ALARM", exitAlarmPhoto);
            }
            if (entrancePhoto != null && !entrancePhoto.isEmpty()) {
                attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_ENTRANCE", entrancePhoto);
            }

            response.put("success", true);
            response.put("message", "저장되었습니다.");

            log.info("✅ 부설주차장 업데이트 완료");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 부설주차장 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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

    /**
     * 🔥 주차장 저장 (신규/수정 통합)
     */
    @PostMapping("/parking-save")
    public ResponseEntity<Map<String, Object>> saveParking(
            @RequestBody ParkingDetailVO parkingData,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 신규/수정 판별
            boolean isNew = parkingData.getPrkPlceManageNo() == null
                    || parkingData.getPrkPlceManageNo().trim().isEmpty();

            log.info("💾 주차장 {} - 유형: {}",
                    isNew ? "신규 등록" : "수정",
                    parkingData.getPrkPlceType());

            // 🔥 사용자 정보 설정 (개발용 임시)
            String userId = "SYSTEM";
            String clientIp = "127.0.0.1";

            // 🔥 실제 운영 환경에서는 세션에서 가져오기
            /*
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(response);
            }

            String userId = session.getAttribute("userId").toString();
            String prkBizMngNo = session.getAttribute("prkBizMngNo").toString(); // 사업번호
            parkingData.setPrkBizMngNo(prkBizMngNo);
            String clientIp = getClientIp(request);
            */

            parkingData.setUpdusrId(userId);
            parkingData.setUpdusrIpAddr(clientIp);

            // 🔥 신규 등록인 경우 사업번호 설정 필요
            if (isNew && (parkingData.getPrkBizMngNo() == null || parkingData.getPrkBizMngNo().isEmpty())) {
                // 임시로 하드코딩 (실제는 세션에서)
                parkingData.setPrkBizMngNo("BIZ2025001");
            }

            // 저장 실행
            String prkPlceManageNo = prkDefPlceInfoService.saveParking(parkingData);

            response.put("success", true);
            response.put("message", isNew ? "주차장이 등록되었습니다." : "주차장 정보가 수정되었습니다.");
            response.put("prkPlceManageNo", prkPlceManageNo);
            response.put("isNew", isNew);

            log.info("✅ 주차장 저장 완료 - {}", prkPlceManageNo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 주차장 저장 실패", e);
            response.put("success", false);
            response.put("message", "저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 🔥 지도용 주차장 데이터 조회 (좌표 포함 + 시도/시군구 필터링)
     */
    @GetMapping("/parking-map-data")
    @ResponseBody
    public Map<String, Object> getParkingMapData(
            @RequestParam(required = false) String sidoCd,
            @RequestParam(required = false) String sigunguCd,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            log.info("🔍 지도용 주차장 데이터 조회 - sidoCd: {}, sigunguCd: {}", sidoCd, sigunguCd);

            // 🔥 세션에서 userBizList 가져오기
            @SuppressWarnings("unchecked")
            List<String> userBizList = (List<String>) session.getAttribute("userBizList");

            Map<String, Object> params = new HashMap<>();
            if (userBizList != null && !userBizList.isEmpty()) {
                params.put("userBizList", userBizList);
            }

            // 🔥 시도/시군구 파라미터 추가
            if (sidoCd != null && !sidoCd.isEmpty()) {
                params.put("sidoCd", sidoCd);
                log.info("✅ 시도 필터 적용: {}", sidoCd);
            }
            if (sigunguCd != null && !sigunguCd.isEmpty()) {
                params.put("sigunguCd", sigunguCd);
                log.info("✅ 시군구 필터 적용: {}", sigunguCd);
            }

            // 좌표가 있는 주차장만 조회
            List<ParkingListVO> list = prkDefPlceInfoService.getParkingListForMap(params);

            result.put("success", true);
            result.put("list", list);
            result.put("totalCount", list.size());

            log.info("✅ 지도용 주차장 데이터 조회 완료: {}개", list.size());

        } catch (Exception e) {
            log.error("❌ 지도용 주차장 데이터 조회 오류", e);
            result.put("success", false);
            result.put("message", "데이터 조회 중 오류가 발생했습니다.");
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
