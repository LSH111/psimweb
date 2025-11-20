package com.psim.web.prk.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psim.media.storage.PhotoStorage;
import com.psim.web.cmm.vo.CoUserVO;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
    private final PhotoStorage photoStorage;

    /*@GetMapping("/parkinglist")
    public String parkingList() {
        return "prk/parking-list";
    }*/
    @GetMapping("/parkinglist")
    public String parkingList(
            @RequestParam(value = "openDetail", required = false) String openDetailId,
            @RequestParam(value = "type", required = false) String parkingType,
            Model model) {

        // 🔥 null pointer check
        if (openDetailId == null || parkingType == null) {
            log.warn("⚠️ openDetailId or parkingType is null");
            return "prk/parking-list";
        }

        try {
            // 🔥 상세보기 파라미터가 있으면 모델에 추가
            if (openDetailId != null && !openDetailId.isEmpty()) {
                model.addAttribute("openDetailId", openDetailId);
                model.addAttribute("parkingType", parkingType);
                log.info("🔍 상세보기 요청: ID={}, Type={}", openDetailId, parkingType);
            }

            return "prk/parking-list";
        } catch (Exception e) {
            log.error("❌ parkingList() error: {}", e.getMessage());
            e.printStackTrace();
            return "error";
        }
    }

    // AJAX로 주차장 목록 데이터 조회 (페이징 제거)
    @GetMapping("/parking-data")
    @ResponseBody
    public Map<String, Object> getParkingData(@RequestParam Map<String, Object> params, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        log.info("🔍 주차장 데이터 조회 시작 - params: {}", params);

        // 🔥 세션에서 userBizList 가져와서 params에 추가 
        List<String> userBizList = (List<String>) session.getAttribute("userBizList");
        if (userBizList != null && !userBizList.isEmpty()) {
            params.put("userBizList", userBizList);
            log.info("✅ userBizList 추가: {}", userBizList);
        } else {
            log.warn("⚠️ userBizList가 비어있습니다");
        }

        try {
            log.info("🔄 서비스 호출 시작");
            List<ParkingListVO> list = prkDefPlceInfoService.getParkingList(params);
            int totalCount = list.size();

            result.put("list", list);
            result.put("totalCount", totalCount);
            result.put("success", true);

            log.info("✅ 데이터 조회 완료 - 총 {}건", totalCount);

        } catch (Exception e) {
            log.error("❌ 데이터 조회 실패", e);
            // 🔥 상세 스택트레이스 로깅
            log.error("예외 타입: {}", e.getClass().getName());
            log.error("예외 메시지: {}", e.getMessage());

            // 🔥 원인 추적
            Throwable cause = e.getCause();
            while (cause != null) {
                log.error("  └─ Caused by: {} - {}", cause.getClass().getName(), cause.getMessage());
                cause = cause.getCause();
            }

            result.put("success", false);
            result.put("message", "데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
            result.put("list", new ArrayList<>());
            result.put("totalCount", 0);
        }

        return result;
    }

    /**
     * 🔥 [신규 추가] 노상주차장 상세 조회
     */
    @GetMapping("/onparking-detail")
    @ResponseBody
    public Map<String, Object> getOnstreetParkingDetail(@RequestParam String prkPlceManageNo) {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("=== 노상주차장 상세 조회 요청: {} ===", prkPlceManageNo);

            ParkingDetailVO detail = prkDefPlceInfoService.getOnstreetParkingDetail(prkPlceManageNo);

            if (detail != null) {
                result.put("success", true);
                result.put("data", detail);
                log.info("✅ 노상주차장 상세 조회 성공");
            } else {
                result.put("success", false);
                result.put("message", "주차장 정보를 찾을 수 없습니다.");
                log.warn("⚠️ 데이터 없음: {}", prkPlceManageNo);
            }
        } catch (Exception e) {
            log.error("❌ 노상주차장 상세 조회 실패", e);
            result.put("success", false);
            result.put("message", "조회 중 오류가 발생했습니다: " + e.getMessage());
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
            HttpServletRequest request,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔵 노외주차장 저장 요청 시작");
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
                log.info("🆕 노외주차장 신규 등록 시작");

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

                String prkplceSe = parkingData.getPrkplceSe();  // 관리주체(소유주체)
                String prkPlceType = "2"; // 주차장유형 - 노외

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

                //String ldongCd = parkingData.getEmdCd();
                //parkingData.setLdongCd(ldongCd);

                log.info("✅ 사용자정보 설정 완료 - userId: {}, IP: {}", userId, clientIp);
            } else {
                log.info("🔄 노외주차장 수정 시작 - 관리번호: {}", prkPlceManageNo);
                log.info("✅ 사용자정보 설정 완료 - userId: {}, IP: {}", userId, clientIp);
            }

            // 🔥 핵심: DB 저장을 한 번에 처리하고 즉시 SN 확보
            Integer prkPlceInfoSn = null;

            if (isNewRecord) {
                // 신규 등록 - INSERT 후 바로 VO에서 SN 가져오기
                log.info("🔄 신규 등록 DB INSERT 실행");
                prkDefPlceInfoService.insertOffstreetParking(parkingData);
                prkPlceInfoSn = parkingData.getPrkPlceInfoSn();
                log.info("✅ DB INSERT 완료 - prkPlceInfoSn: {}", prkPlceInfoSn);

            } else {
                // 수정 모드 - 기존 데이터에서 SN 조회 후 UPDATE
                log.info("🔍 기존 prkPlceInfoSn 조회 - 관리번호: {}", prkPlceManageNo);
                ParkingDetailVO existingData = prkDefPlceInfoService.getOffstreetParkingDetail(prkPlceManageNo);
                log.info("existingData.prkPlceInfoSn = {}", existingData != null ? existingData.getPrkPlceInfoSn() : null);
                if (existingData != null) {
                    prkPlceInfoSn = existingData.getPrkPlceInfoSn();
                    parkingData.setPrkPlceInfoSn(prkPlceInfoSn);
                    log.info("✅ 기존 prkPlceInfoSn 획득: {}", prkPlceInfoSn);
                } else {
                    log.error("❌ 기존 데이터를 찾을 수 없습니다: {}", prkPlceManageNo);

                    response.put("success", false);
                    response.put("message", "수정할 주차장 정보를 찾을 수 없습니다. 주차장 관리번호: " + prkPlceManageNo);
                    response.put("errorCode", "DATA_NOT_FOUND");
                    response.put("prkPlceManageNo", prkPlceManageNo);

                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }

                log.info("🔄 DB UPDATE 실행");
                prkDefPlceInfoService.updateOffstreetParking(parkingData);
                log.info("✅ DB UPDATE 완료");
            }

            // 🔥 파일 업로드 (prkPlceInfoSn 확보 후 - 별도 예외 처리)
            if (prkPlceInfoSn != null && prkPlceInfoSn > 0) {
                try {
                    if (mainPhoto != null && !mainPhoto.isEmpty()) {
                        log.info("📸 현장 사진 저장 시작: {}", mainPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_MAIN", mainPhoto);
                        log.info("✅ 현장 사진 저장 완료");
                    }

                    if (signPhoto != null && !signPhoto.isEmpty()) {
                        log.info("📸 표지판 사진 저장 시작: {}", signPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_SIGN", signPhoto);
                        log.info("✅ 표지판 사진 저장 완료");
                    }

                    if (ticketPhoto != null && !ticketPhoto.isEmpty()) {
                        log.info("📸 발권기 사진 저장 시작: {}", ticketPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_TICKET", ticketPhoto);
                        log.info("✅ 발권기 사진 저장 완료");
                    }

                    if (barrierPhoto != null && !barrierPhoto.isEmpty()) {
                        log.info("📸 차단기 사진 저장 시작: {}", barrierPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_BARRIER", barrierPhoto);
                        log.info("✅ 차단기 사진 저장 완료");
                    }

                    if (exitAlarmPhoto != null && !exitAlarmPhoto.isEmpty()) {
                        log.info("📸 출차알람 사진 저장 시작: {}", exitAlarmPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_EXIT_ALARM", exitAlarmPhoto);
                        log.info("✅ 출차알람 사진 저장 완료");
                    }

                    if (entrancePhoto != null && !entrancePhoto.isEmpty()) {
                        log.info("📸 입구 사진 저장 시작: {}", entrancePhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "OFF_ENTRANCE", entrancePhoto);
                        log.info("✅ 입구 사진 저장 완료");
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

            log.info("✅✅✅ 노외주차장 저장 완료");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("❌ 입력값 검증 실패: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("❌❌❌ 노외주차장 저장 실패", e);
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
            HttpServletRequest request,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🔵 부설주차장 저장 요청 시작");
            log.info("📄 parkingData JSON: {}", parkingDataJson);

            // 🔥 로그인 사용자 / 사업관리번호 검증 (on/offparking 과 동일 패턴)
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
                log.info("🆕 부설주차장 신규 등록 시작");

                // 1. 우편번호/운영주체 검증
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

                // 2. 관리번호 생성 파라미터
                String prkplceSe = parkingData.getPrkplceSe();  // 관리주체(소유주체) - 공영=1, 민영=2, 기타=9
                String prkPlceType = "3"; // 주차장유형 - 부설=3

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

                // 3. 사업별주차관리번호
                String bizPerPrkMngNo = "BP" + System.currentTimeMillis();
                parkingData.setBizPerPrkMngNo(bizPerPrkMngNo);
                log.info("✅ 사업별주차관리번호: {}", bizPerPrkMngNo);

                // 4. 사업관리번호 (세션에서 1건 사용)
                String prkBizMngNo = userBizList.get(0);
                parkingData.setPrkBizMngNo(prkBizMngNo);
                log.info("✅ 사업관리번호: {}", prkBizMngNo);

                // 5. 행정구역 코드 (읍면동 → ldongCd)
                //String ldongCd = parkingData.getEmdCd();
                //parkingData.setLdongCd(ldongCd);

                log.info("✅ 사용자정보 설정 완료 - userId: {}, IP: {}", userId, clientIp);
            } else {
                log.info("🔄 부설주차장 수정 시작 - 관리번호: {}", prkPlceManageNo);
                log.info("✅ 사용자정보 설정 완료 - userId: {}, IP: {}", userId, clientIp);
            }

            // 🔥 핵심: DB 저장을 한 번에 처리하고 prkPlceInfoSn 확보
            Integer prkPlceInfoSn = null;

            if (isNewRecord) {
                // 신규 등록 - INSERT 후 VO 에서 SN 확인
                log.info("🔄 신규 등록 DB INSERT 실행");
                prkDefPlceInfoService.insertBuildParking(parkingData);
                prkPlceInfoSn = parkingData.getPrkPlceInfoSn();
                log.info("✅ DB INSERT 완료 - prkPlceInfoSn: {}", prkPlceInfoSn);

            } else {
                // 수정 모드 - 기존 상세에서 SN 조회 후 UPDATE
                log.info("🔍 기존 prkPlceInfoSn 조회 - 관리번호: {}", prkPlceManageNo);
                ParkingDetailVO existingData = prkDefPlceInfoService.getBuildParkingDetail(prkPlceManageNo);

                if (existingData != null) {
                    prkPlceInfoSn = existingData.getPrkPlceInfoSn();
                    parkingData.setPrkPlceInfoSn(prkPlceInfoSn);
                    log.info("✅ 기존 prkPlceInfoSn 획득: {}", prkPlceInfoSn);
                } else {
                    log.error("❌ 기존 데이터를 찾을 수 없습니다: {}", prkPlceManageNo);

                    response.put("success", false);
                    response.put("message", "수정할 주차장 정보를 찾을 수 없습니다. 주차장 관리번호: " + prkPlceManageNo);
                    response.put("errorCode", "DATA_NOT_FOUND");
                    response.put("prkPlceManageNo", prkPlceManageNo);

                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }

                log.info("🔄 DB UPDATE 실행");
                prkDefPlceInfoService.updateBuildParking(parkingData);
                log.info("✅ DB UPDATE 완료");
            }

            // 🔥 파일 저장 (prkPlceInfoSn 기준)
            if (prkPlceInfoSn != null && prkPlceInfoSn > 0) {
                try {
                    if (mainPhoto != null && !mainPhoto.isEmpty()) {
                        log.info("📸 현장 사진 저장 시작: {}", mainPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_MAIN", mainPhoto);
                        log.info("✅ 현장 사진 저장 완료");
                    }
                    if (signPhoto != null && !signPhoto.isEmpty()) {
                        log.info("📸 표지판 사진 저장 시작: {}", signPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_SIGN", signPhoto);
                        log.info("✅ 표지판 사진 저장 완료");
                    }
                    if (ticketPhoto != null && !ticketPhoto.isEmpty()) {
                        log.info("📸 발권기 사진 저장 시작: {}", ticketPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_TICKET", ticketPhoto);
                        log.info("✅ 발권기 사진 저장 완료");
                    }
                    if (barrierPhoto != null && !barrierPhoto.isEmpty()) {
                        log.info("📸 차단기 사진 저장 시작: {}", barrierPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_BARRIER", barrierPhoto);
                        log.info("✅ 차단기 사진 저장 완료");
                    }
                    if (exitAlarmPhoto != null && !exitAlarmPhoto.isEmpty()) {
                        log.info("📸 출차알람 사진 저장 시작: {}", exitAlarmPhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_EXIT_ALARM", exitAlarmPhoto);
                        log.info("✅ 출차알람 사진 저장 완료");
                    }
                    if (entrancePhoto != null && !entrancePhoto.isEmpty()) {
                        log.info("📸 입구 사진 저장 시작: {}", entrancePhoto.getOriginalFilename());
                        attchPicService.uploadAndSaveFile(prkPlceInfoSn, "BLD_ENTRANCE", entrancePhoto);
                        log.info("✅ 입구 사진 저장 완료");
                    }
                } catch (Exception fileException) {
                    log.error("⚠️ 파일 저장 실패 (DB는 성공): {}", fileException.getMessage());
                    // 파일 저장 실패는 경고만 - 전체 저장은 성공 처리
                }
            } else {
                log.warn("⚠️ prkPlceInfoSn이 유효하지 않아 파일 저장을 건너뜁니다: {}", prkPlceInfoSn);
            }

            response.put("success", true);
            response.put("message", isNewRecord ? "신규 등록되었습니다." : "수정되었습니다.");
            response.put("prkPlceManageNo", parkingData.getPrkPlceManageNo());

            log.info("✅✅✅ 부설주차장 저장 완료");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("❌ 입력값 검증 실패: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

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
            List<Map<String, Object>> parkingList = (List<Map<String, Object>>) request.get("parkingList");

            if (parkingList == null || parkingList.isEmpty()) {
                response.put("success", false);
                response.put("message", "선택된 주차장이 없습니다.");
                return response;
            }

            log.info("🔄 선택된 {}개 주차장 상태를 승인 대기로 변경", parkingList.size());

            int updatedCount = prkDefPlceInfoService.updateSelectedStatusToPending(parkingList);

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

    /**
     * 🔥 주차장 사진 정보 조회
     */
    @GetMapping("/parking-photos")
    @ResponseBody
    public Map<String, Object> getParkingPhotos(@RequestParam Integer prkPlceInfoSn) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📸 주차장 사진 정보 조회 - prkPlceInfoSn: {}", prkPlceInfoSn);

            List<Map<String, Object>> photos = attchPicService.getPhotosByPrkPlceInfoSn(prkPlceInfoSn);

            result.put("success", true);
            result.put("photos", photos);

            log.info("✅ 사진 정보 조회 완료: {}개", photos.size());

        } catch (Exception e) {
            log.error("❌ 사진 정보 조회 실패", e);
            result.put("success", false);
            result.put("message", "사진 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }

        return result;
    }

    /**
     * 🔥 주차장 이미지 파일 다운로드/표시 (복합키 사용)
     */
    @GetMapping("/photo")
    public ResponseEntity<Resource> getPhoto(
            @RequestParam Integer prkPlceInfoSn,
            @RequestParam String prkImgId,
            @RequestParam Integer seqNo) {
        try {
            log.info("📷 이미지 요청 - prkPlceInfoSn: {}, prkImgId: {}, seqNo: {}",
                    prkPlceInfoSn, prkImgId, seqNo);

            Map<String, Object> photoInfo = attchPicService.getPhotoFile(prkPlceInfoSn, prkImgId, seqNo);

            log.warn("📷 이미지 요청 성공 ", photoInfo);

            if (photoInfo == null) {
                log.warn("⚠️ 이미지를 찾을 수 없음");
                return ResponseEntity.notFound().build();
            }

            // 🔥 파일 경로에서 실제 파일 읽기
            String relativePath = (String) photoInfo.get("filepath");
            String storedFileName = (String) photoInfo.get("filename");
            Resource resource = photoStorage.loadAsResource(relativePath, storedFileName);

            if (resource == null) {
                log.warn("⚠️ 파일을 읽을 수 없습니다: {}/{}", relativePath, storedFileName);
                return ResponseEntity.notFound().build();
            }

            String contentType = (String) photoInfo.get("contentType");
            String displayFileName = (String) photoInfo.get("fileName");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("inline", displayFileName);

            log.info("✅ 이미지 반환 완료");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (Exception e) {
            log.error("❌ 이미지 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 🔥 이용실태 이미지 파일 다운로드/표시 (복합키 사용)
     */
    @GetMapping("/photo/usage")
    public ResponseEntity<Resource> getPhotoForUsage(
            @RequestParam String cmplSn,
            @RequestParam String prkImgId,
            @RequestParam Integer seqNo) {
        try {
            log.info("📷 이용실태 이미지 요청 - cmplSn: {}, prkImgId: {}, seqNo: {}",
                    cmplSn, prkImgId, seqNo);

            Map<String, Object> photoInfo = attchPicService.getPhotoFileForUsage(cmplSn, prkImgId, seqNo);

            if (photoInfo == null) {
                log.warn("⚠️ 이미지를 찾을 수 없음");
                return ResponseEntity.notFound().build();
            }

            // 🔥 파일 경로에서 실제 파일 읽기
            String relativePath = (String) photoInfo.get("filePath");
            String fileName = (String) photoInfo.get("fileName");
            Resource resource = photoStorage.loadAsResource(relativePath, fileName);

            if (resource == null) {
                log.warn("⚠️ 파일을 읽을 수 없습니다: {}/{}", relativePath, fileName);
                return ResponseEntity.notFound().build();
            }

            String contentType = (String) photoInfo.get("contentType");
            String displayFileName = (String) photoInfo.get("fileName");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("inline", displayFileName);

            log.info("✅ 이용실태 이미지 반환 완료");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (Exception e) {
            log.error("❌ 이용실태 이미지 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
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
