
package com.psim.web.file.controller;

import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * 파일 업로드 통합 컨트롤러
 * 노상/노외/부설주차장 및 이용현황 파일 업로드 처리
 */
@Slf4j
@Controller
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileUploadController {

    private final AttchPicMngInfoService attchPicService;

    /**
     * 🔥 단일 파일 업로드
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID (예: "ON_MAIN", "OFF_SIGN")
     * @param file 업로드 파일
     * @return 업로드 결과
     */
    @PostMapping("/upload")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("prkPlceInfoSn") Integer prkPlceInfoSn,
            @RequestParam("prkImgId") String prkImgId,
            @RequestParam("file") MultipartFile file
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📤 파일 업로드 시작: prkPlceInfoSn={}, prkImgId={}, fileName={}",
                    prkPlceInfoSn, prkImgId, file.getOriginalFilename());

            if (file == null || file.isEmpty()) {
                result.put("success", false);
                result.put("message", "파일이 비어있습니다.");
                return ResponseEntity.badRequest().body(result);
            }

            // 파일 저장
            AttchPicMngInfoVO savedFile = attchPicService.uploadAndSaveFile(
                    prkPlceInfoSn,
                    prkImgId,
                    file
            );

            result.put("success", true);
            result.put("message", "파일 업로드 성공");
            result.put("data", savedFile);

            log.info("✅ 파일 업로드 완료: {}", savedFile.getFileNm());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ 파일 업로드 실패", e);
            result.put("success", false);
            result.put("message", "파일 업로드 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /**
     * 🔥 복수 파일 업로드 (이용현황용)
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID (예: "USG_MULTI")
     * @param files 업로드 파일 목록
     * @return 업로드 결과
     */
    @PostMapping("/upload-multiple")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> uploadMultipleFiles(
            @RequestParam("prkPlceInfoSn") Integer prkPlceInfoSn,
            @RequestParam("prkImgId") String prkImgId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📤 복수 파일 업로드 시작: prkPlceInfoSn={}, prkImgId={}, 파일수={}",
                    prkPlceInfoSn, prkImgId, files.size());

            if (files == null || files.isEmpty()) {
                result.put("success", false);
                result.put("message", "파일이 비어있습니다.");
                return ResponseEntity.badRequest().body(result);
            }

            // 파일 목록 저장
            List<AttchPicMngInfoVO> savedFiles = attchPicService.uploadAndSaveFiles(
                    prkPlceInfoSn,
                    prkImgId,
                    files
            );

            result.put("success", true);
            result.put("message", savedFiles.size() + "개 파일 업로드 성공");
            result.put("data", savedFiles);

            log.info("✅ 복수 파일 업로드 완료: {}개", savedFiles.size());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ 복수 파일 업로드 실패", e);
            result.put("success", false);
            result.put("message", "파일 업로드 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /**
     * 🔥 파일 목록 조회
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID (선택)
     * @return 파일 목록
     */
    @GetMapping("/list")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFileList(
            @RequestParam("prkPlceInfoSn") Integer prkPlceInfoSn,
            @RequestParam(value = "prkImgId", required = false) String prkImgId
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("📂 파일 목록 조회: prkPlceInfoSn={}, prkImgId={}", prkPlceInfoSn, prkImgId);

            List<AttchPicMngInfoVO> fileList = attchPicService.getAttchPicMngInfoList(
                    prkPlceInfoSn,
                    prkImgId
            );

            result.put("success", true);
            result.put("data", fileList);
            result.put("count", fileList != null ? fileList.size() : 0);

            log.info("✅ 파일 목록 조회 완료: {}개", fileList != null ? fileList.size() : 0);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ 파일 목록 조회 실패", e);
            result.put("success", false);
            result.put("message", "파일 목록 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /**
     * 🔥 파일 삭제
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID
     * @param seqNo 순번 (선택, null이면 해당 ID의 모든 파일 삭제)
     * @return 삭제 결과
     */
    @DeleteMapping("/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteFile(
            @RequestParam("prkPlceInfoSn") Integer prkPlceInfoSn,
            @RequestParam("prkImgId") String prkImgId,
            @RequestParam(value = "seqNo", required = false) Integer seqNo
    ) {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("🗑️ 파일 삭제: prkPlceInfoSn={}, prkImgId={}, seqNo={}",
                    prkPlceInfoSn, prkImgId, seqNo);

            attchPicService.deleteAttchPicMngInfo(prkPlceInfoSn, prkImgId, seqNo);

            result.put("success", true);
            result.put("message", "파일 삭제 완료");

            log.info("✅ 파일 삭제 완료");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ 파일 삭제 실패", e);
            result.put("success", false);
            result.put("message", "파일 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
}