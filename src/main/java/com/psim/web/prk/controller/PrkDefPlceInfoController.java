package com.psim.web.prk.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import com.psim.web.cmm.vo.CoUserVO;
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
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("🔍 노상주차장 상세 조회 요청");
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("📋 요청 파라미터: prkPlceManageNo={}", prkPlceManageNo);

            // 🔥 파라미터 검증 추가
            if (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty()) {
                log.error("❌ 주차장 관리번호가 비어있습니다.");
                result.put("success", false);
                result.put("message", "주차장 관리번호가 필요합니다.");
                return result;
            }

            log.info("🔄 Service 호출 시작");
            ParkingDetailVO detail = prkDefPlceInfoService.getOnstreetParkingDetail(prkPlceManageNo);
            log.info("✅ Service 호출 완료");

            if (detail != null) {
                log.info("✅ 데이터 조회 성공");
                log.info("📦 조회된 데이터 요약:");
                log.info("   - prkPlceManageNo: {}", detail.getPrkPlceManageNo());
                log.info("   - prkplceNm: {}", detail.getPrkplceNm());
                log.info("   - sidoCd: {}", detail.getSidoCd());
                log.info("   - sigunguCd: {}", detail.getSigunguCd());
                log.info("   - emdCd: {}", detail.getEmdCd());

                result.put("success", true);
                result.put("data", detail);
            } else {
                log.warn("⚠️ 조회된 데이터가 없습니다: {}", prkPlceManageNo);
                result.put("success", false);
                result.put("message", "주차장 정보를 찾을 수 없습니다.");
            }

            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        } catch (Exception e) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("❌❌❌ 노상주차장 상세 조회 실패");
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("예외 타입: {}", e.getClass().getName());
            log.error("예외 메시지: {}", e.getMessage());
            log.error("상세 스택:", e);

            // 🔥 원인 추적
            Throwable cause = e.getCause();
            while (cause != null) {
                log.error("  └─ Caused by: {} - {}", cause.getClass().getName(), cause.getMessage());
                cause = cause.getCause();
            }

            result.put("success", false);
            result.put("message", "조회 중 오류가 발생했습니다: " + e.getMessage());

            // 🔥 개발 환경에서만 상세 에러 반환
            if (log.isDebugEnabled()) {
                result.put("error", e.getClass().getName());
                result.put("stackTrace", e.getStackTrace()[0].toString());
            }
        }

        return result;
    }

    /**
     * 🔥 노상주차장 정보 저장/수정 (파일 업로드 포함) - 수정
     */
    @PostMapping("/onparking-update")
    public ResponseEntity<Map<String, Object>> updateOnstreetParking(
            @RequestPart("parkingData") String parkingDataJson,
            @RequestPart(value = "mainPhoto", required = false) MultipartFile mainPhoto,
            @RequestPart(value = "signPhoto", required = false) MultipartFile signPhoto,
            HttpServletRequest request,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔵 노상주차장 저장 요청 시작");
            log.info("📄 parkingData JSON: {}", parkingDataJson);
            log.info("📸 mainPhoto: {}", mainPhoto != null ? mainPhoto.getOriginalFilename() : "없음");
            log.info("📸 signPhoto: {}", signPhoto != null ? signPhoto.getOriginalFilename() : "없음");

            // 🔥 세션에서 로그인 사용자 정보 확인
            CoUserVO loginUser = (CoUserVO) session.getAttribute("loginUser");
            if (loginUser == null) {
                log.error("❌ 로그인 정보가 없습니다.");
                response.put("success", false);
                response.put("message", "로그인 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            @SuppressWarnings("unchecked")
            List<String> userBizList = (List<String>) session.getAttribute("userBizList");
            if (userBizList == null || userBizList.isEmpty()) {
                log.error("❌ 사업관리번호 정보가 없습니다.");
                response.put("success", false);
                response.put("message", "사업관리번호 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            ParkingDetailVO parkingData = objectMapper.readValue(parkingDataJson, ParkingDetailVO.class);

            String prkPlceManageNo = parkingData.getPrkPlceManageNo();
            boolean isNewRecord = (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty());

            // 🔥 사용자 정보 설정
            String userId = loginUser.getUserId();
            String clientIp = getClientIp(request);
            parkingData.setUpdusrId(userId);
            parkingData.setUpdusrIpAddr(clientIp);

            if (isNewRecord) {
                log.info("🆕 노상주차장 신규 등록 시작");

                String zipCode = parkingData.getZip();
                String operMbyCd = parkingData.getOperMbyCd();

                if (zipCode == null || zipCode.trim().isEmpty()) {
                    log.error("❌ 우편번호(zipCode)가 비어있습니다.");
                    throw new IllegalArgumentException("우편번호는 필수 항목입니다.");
                }

                if (operMbyCd == null || operMbyCd.trim().isEmpty()) {
                    log.warn("⚠️ 운영주체(operMbyCd)가 비어있어 기본값(1:직영)으로 설정합니다.");
                    operMbyCd = "1";
                }

                String prkplceSe = "1";
                String prkPlceType = "1";

                log.info("📝 관리번호 생성 파라미터 - zipCode: {}, prkplceSe: {}, operMbyCd: {}, prkPlceType: {}",
                        zipCode, prkplceSe, operMbyCd, prkPlceType);

                String newManageNo = prkDefPlceInfoService.generatePrkPlceManageNo(
                        zipCode, prkplceSe, operMbyCd, prkPlceType
                );

                if (newManageNo == null || newManageNo.trim().isEmpty()) {
                    log.error("❌ DB 함수에서 null 또는 빈 관리번호가 반환되었습니다.");
                    throw new RuntimeException("주차장 관리번호 생성에 실패했습니다. DB 함수를 확인하세요.");
                }

                parkingData.setPrkPlceManageNo(newManageNo);
                log.info("✅ 생성된 주차장관리번호: {}", newManageNo);

                String bizPerPrkMngNo = "BP" + System.currentTimeMillis();
                parkingData.setBizPerPrkMngNo(bizPerPrkMngNo);
                log.info("✅ 사업별주차관리번호: {}", bizPerPrkMngNo);

                String prkBizMngNo = userBizList.get(0);
                parkingData.setPrkBizMngNo(prkBizMngNo);
                log.info("✅ 사업관리번호: {}", prkBizMngNo);

                String ldongCd = parkingData.getEmdCd();
                parkingData.setLdongCd(ldongCd);

                log.info("✅ 사용자정보 설정 완료 - userId: {}, IP: {}", userId, clientIp);
            } else {
                log.info("🔄 노상주차장 수정 시작 - 관리번호: {}", prkPlceManageNo);
                log.info("✅ 사용자정보 설정 완료 - userId: {}, IP: {}", userId, clientIp);
            }

            // 🔥 핵심 수정: DB 저장을 한 번에 처리하고 즉시 SN 확보
            Integer prkPlceInfoSn = null;

            if (isNewRecord) {
                // 신규 등록 - INSERT 후 바로 VO에서 SN 가져오기
                log.info("🔄 신규 등록 DB INSERT 실행");
                prkDefPlceInfoService.insertOnstreetParking(parkingData);
                prkPlceInfoSn = parkingData.getPrkPlceInfoSn();
                log.info("✅ DB INSERT 완료 - prkPlceInfoSn: {}", prkPlceInfoSn);

            } else {
                // 수정 모드 - 기존 데이터에서 SN 조회 후 UPDATE
                log.info("🔍 기존 prkPlceInfoSn 조회 - 관리번호: {}", prkPlceManageNo);
                ParkingDetailVO existingData = prkDefPlceInfoService.getOnstreetParkingDetail(prkPlceManageNo);

                if (existingData != null) {
                    prkPlceInfoSn = existingData.getPrkPlceInfoSn();
                    parkingData.setPrkPlceInfoSn(prkPlceInfoSn);
                    log.info("✅ 기존 prkPlceInfoSn 획득: {}", prkPlceInfoSn);
                } else {
                    log.error("❌ 기존 데이터를 찾을 수 없습니다: {}", prkPlceManageNo);

                    // 🔥 수정: 더 자세한 에러 정보 제공
                    response.put("success", false);
                    response.put("message", "수정할 주차장 정보를 찾을 수 없습니다. 주차장 관리번호: " + prkPlceManageNo);
                    response.put("errorCode", "DATA_NOT_FOUND");
                    response.put("prkPlceManageNo", prkPlceManageNo);

                    log.error("💡 가능한 원인:");
                    log.error("   1. 잘못된 주차장 관리번호");
                    log.error("   2. 해당 사업에 속하지 않는 주차장");
                    log.error("   3. 이미 삭제된 데이터");

                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }

                log.info("🔄 DB UPDATE 실행");
                prkDefPlceInfoService.updateOnstreetParking(parkingData);
                log.info("✅ DB UPDATE 완료");
            }

            // 🔥 파일 업로드 (prkPlceInfoSn 확보 후 - 별도 예외 처리)
            if (prkPlceInfoSn != null && prkPlceInfoSn > 0) {
                try {
                    if (mainPhoto != null && !mainPhoto.isEmpty()) {
                        log.info("📸 현장 사진 저장 시작: {}", mainPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "ON_MAIN", mainPhoto);
                        log.info("✅ 현장 사진 저장 완료");
                    }

                    if (signPhoto != null && !signPhoto.isEmpty()) {
                        log.info("📸 표지판 사진 저장 시작: {}", signPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "ON_SIGN", signPhoto);
                        log.info("✅ 표지판 사진 저장 완료");
                    }
                } catch (Exception fileException) {
                    log.error("⚠️ 파일 저장 실패 (DB는 성공): {}", fileException.getMessage());
                    // 파일 저장 실패는 경고만 표시 - 전체 작업은 성공으로 간주
                }
            } else {
                log.warn("⚠️ prkPlceInfoSn이 유효하지 않아 파일 저장을 건너뜁니다: {}", prkPlceInfoSn);
            }

            response.put("success", true);
            response.put("message", isNewRecord ? "신규 등록되었습니다." : "수정되었습니다.");
            response.put("prkPlceManageNo", parkingData.getPrkPlceManageNo());

            log.info("✅✅✅ 노상주차장 저장 완료");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("❌ 입력값 검증 실패: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("❌❌❌ 노상주차장 저장 실패", e);
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
     * 🔥 노외주차장 정보 저장/수정 (파일 업로드 포함)
     */
    @PostMapping("/offparking-update")
    public ResponseEntity<Map<String, Object>> updateOffstreetParking(
            @RequestPart("parkingData") String parkingDataJson,
            @RequestPart(value = "mainPhoto", required = false) MultipartFile mainPhoto,
            @RequestPart(value = "signPhoto", required = false) MultipartFile signPhoto,
            @RequestPart(value = "ticketPhoto", required = false) MultipartFile ticketPhoto,
            @RequestPart(value = "barrierPhoto", required = false) MultipartFile barrierPhoto,
            @RequestPart(value = "exitAlarmPhoto", required = false) MultipartFile exitAlarmPhoto,
            @RequestPart(value = "entrancePhoto", required = false) MultipartFile entrancePhoto,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ParkingDetailVO parkingData = objectMapper.readValue(parkingDataJson, ParkingDetailVO.class);

            String prkPlceManageNo = parkingData.getPrkPlceManageNo();
            boolean isNewRecord = (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty());

            if (isNewRecord) {
                log.info("🆕 노외주차장 신규 등록");

                // 1. 주차장 관리번호 생성 (4개 파라미터 전달)
                String zipCode = parkingData.getZip() != null ? parkingData.getZip() : "";
                String prkplceSe = "1"; // 관리주체(소유주체) - 공영=1, 민영=2, 기타=9
                String operMbyCd = parkingData.getOperMbyCd() != null ? parkingData.getOperMbyCd() : "1"; // 운영주체 - 직영=1, 위탁=2, 기타=9
                String prkPlceType = "2"; // 주차장유형 - 노외=2

                String newManageNo = prkDefPlceInfoService.generatePrkPlceManageNo(
                        zipCode, prkplceSe, operMbyCd, prkPlceType
                );
                parkingData.setPrkPlceManageNo(newManageNo);
                log.info("✅ 생성된 주차장관리번호: {}", newManageNo);

                // 2. 사업별주차관리번호 생성
                String bizPerPrkMngNo = "BP" + System.currentTimeMillis();
                parkingData.setBizPerPrkMngNo(bizPerPrkMngNo);
                log.info("✅ 사업별주차관리번호: {}", bizPerPrkMngNo);

                // 3. 사업관리번호 설정
                HttpSession session = request.getSession(false);
                String prkBizMngNo = (session != null && session.getAttribute("prkBizMngNo") != null)
                        ? session.getAttribute("prkBizMngNo").toString()
                        : "BIZ2025001";
                parkingData.setPrkBizMngNo(prkBizMngNo);
                log.info("✅ 사업관리번호: {}", prkBizMngNo);

                // 4. 사용자 정보
                String userId = (session != null && session.getAttribute("userId") != null)
                        ? session.getAttribute("userId").toString()
                        : "SYSTEM";
                String clientIp = getClientIp(request);

                parkingData.setUpdusrId(userId);
                parkingData.setUpdusrIpAddr(clientIp);

                // 5. 행정구역 코드 (읍면동)
                String ldongCd = parkingData.getEmdCd();
                parkingData.setLdongCd(ldongCd);

                // INSERT 실행
                prkDefPlceInfoService.insertOffstreetParking(parkingData);
                log.info("✅ DB INSERT 완료");

            } else {
                log.info("🔄 노외주차장 수정: {}", prkPlceManageNo);
                prkDefPlceInfoService.updateOffstreetParking(parkingData);
            }

            Integer prkPlceInfoSn = parkingData.getPrkPlceInfoSn();

            // 파일 저장
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
            response.put("message", isNewRecord ? "신규 등록되었습니다." : "수정되었습니다.");
            response.put("prkPlceManageNo", parkingData.getPrkPlceManageNo());

            log.info("✅ 노외주차장 저장 완료");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ 노외주차장 저장 실패", e);
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
     * 🔥 부설주차장 정보 저장/수정 (파일 업로드 포함)
     */
    @PostMapping("/buildparking-update")
    public ResponseEntity<Map<String, Object>> updateBuildParking(
            @RequestPart("parkingData") String parkingDataJson,
            @RequestPart(value = "mainPhoto", required = false) MultipartFile mainPhoto,
            @RequestPart(value = "signPhoto", required = false) MultipartFile signPhoto,
            @RequestPart(value = "ticketPhoto", required = false) MultipartFile ticketPhoto,
            @RequestPart(value = "barrierPhoto", required = false) MultipartFile barrierPhoto,
            @RequestPart(value = "exitAlarmPhoto", required = false) MultipartFile exitAlarmPhoto,
            @RequestPart(value = "entrancePhoto", required = false) MultipartFile entrancePhoto,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔵 부설주차장 저장 요청 시작");
            log.info("📄 parkingData JSON: {}", parkingDataJson);

            ObjectMapper objectMapper = new ObjectMapper();
            ParkingDetailVO parkingData = objectMapper.readValue(parkingDataJson, ParkingDetailVO.class);

            String prkPlceManageNo = parkingData.getPrkPlceManageNo();
            boolean isNewRecord = (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty());

            if (isNewRecord) {
                log.info("🆕 부설주차장 신규 등록 시작");

                // 1. 주차장 관리번호 생성 (4개 파라미터 전달)
                String zipCode = parkingData.getZip() != null ? parkingData.getZip() : "";
                String prkplceSe = "1"; // 관리주체(소유주체) - 공영=1, 민영=2, 기타=9
                String operMbyCd = parkingData.getOperMbyCd() != null ? parkingData.getOperMbyCd() : "1"; // 운영주체 - 직영=1, 위탁=2, 기타=9
                String prkPlceType = "3"; // 주차장유형 - 부설=3

                String newManageNo = prkDefPlceInfoService.generatePrkPlceManageNo(
                        zipCode, prkplceSe, operMbyCd, prkPlceType
                );
                parkingData.setPrkPlceManageNo(newManageNo);
                log.info("✅ 생성된 주차장관리번호: {}", newManageNo);

                // 2. 사업별주차관리번호 생성
                String bizPerPrkMngNo = "BP" + System.currentTimeMillis();
                parkingData.setBizPerPrkMngNo(bizPerPrkMngNo);
                log.info("✅ 사업별주차관리번호: {}", bizPerPrkMngNo);

                // 3. 사업관리번호 설정
                HttpSession session = request.getSession(false);
                String prkBizMngNo = (session != null && session.getAttribute("prkBizMngNo") != null)
                        ? session.getAttribute("prkBizMngNo").toString()
                        : "BIZ2025001";
                parkingData.setPrkBizMngNo(prkBizMngNo);
                log.info("✅ 사업관리번호: {}", prkBizMngNo);

                // 4. 사용자 정보
                String userId = (session != null && session.getAttribute("userId") != null)
                        ? session.getAttribute("userId").toString()
                        : "SYSTEM";
                String clientIp = getClientIp(request);

                parkingData.setUpdusrId(userId);
                parkingData.setUpdusrIpAddr(clientIp);

                // 5. 행정구역 코드 (읍면동)
                String ldongCd = parkingData.getEmdCd();
                parkingData.setLdongCd(ldongCd);

                // INSERT 실행
                prkDefPlceInfoService.insertBuildParking(parkingData);
                log.info("✅ DB INSERT 완료");

            } else {
                log.info("🔄 부설주차장 수정 시작 - 관리번호: {}", prkPlceManageNo);

                HttpSession session = request.getSession(false);
                String userId = (session != null && session.getAttribute("userId") != null)
                        ? session.getAttribute("userId").toString()
                        : "SYSTEM";
                String clientIp = getClientIp(request);

                parkingData.setUpdusrId(userId);
                parkingData.setUpdusrIpAddr(clientIp);

                // UPDATE 실행
                prkDefPlceInfoService.updateBuildParking(parkingData);
                log.info("✅ DB UPDATE 완료");
            }

            // 🔥 파일 저장 (prkPlceInfoSn 필수)
            Integer prkPlceInfoSn = parkingData.getPrkPlceInfoSn();

            if (prkPlceInfoSn == null) {
                log.warn("⚠️ prkPlceInfoSn이 null - 파일 저장 건너뜀");
            } else {
                // 각 사진 저장
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
            }

            response.put("success", true);
            response.put("message", isNewRecord ? "신규 등록되었습니다." : "수정되었습니다.");
            response.put("prkPlceManageNo", parkingData.getPrkPlceManageNo());

            log.info("✅✅✅ 부설주차장 저장 완료");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌❌❌ 부설주차장 저장 실패", e);
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
    /*@PostMapping("/parking-save")
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
            *//*
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
            *//*

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
    }*/

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

    /**
     * 🔥 선택된 주차장 상태를 승인 대기로 업데이트
     */
    @PostMapping("/api/parking/update-status-pending")
    @ResponseBody
    public Map<String, Object> updateStatusToPending(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            @SuppressWarnings("unchecked")
            List<String> manageNoList = (List<String>) request.get("manageNoList");

            if (manageNoList == null || manageNoList.isEmpty()) {
                response.put("success", false);
                response.put("message", "선택된 주차장이 없습니다.");
                return response;
            }

            log.info("🔄 선택된 {}개 주차장 상태를 승인 대기로 변경", manageNoList.size());

            int updatedCount = prkDefPlceInfoService.updateSelectedStatusToPending(manageNoList);

            response.put("success", true);
            response.put("message", updatedCount + "개의 주차장 상태가 승인 대기로 변경되었습니다.");
            response.put("updatedCount", updatedCount);

            log.info("✅ 상태 업데이트 완료: {}건", updatedCount);

        } catch (Exception e) {
            log.error("❌ 상태 업데이트 실패", e);
            response.put("success", false);
            response.put("message", "상태 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }

        return response;
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
