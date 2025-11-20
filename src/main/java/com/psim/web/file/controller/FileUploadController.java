package com.psim.web.file.controller;

import com.psim.media.storage.PhotoStorage;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final PhotoStorage photoStorage;

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

    /**
     * 🔥 이미지 파일 조회 (미리보기용)
     * @param cmplSn 단속일련번호
     * @param prkImgId 이미지 구분 ID
     * @param seqNo 순번
     * @return 이미지 파일
     */
    @GetMapping("/preview")
    @ResponseBody
    public ResponseEntity<Resource> previewImage(
            @RequestParam(value = "cmplSn", required = false) String cmplSn,
            @RequestParam("prkImgId") String prkImgId,
            @RequestParam("seqNo") Integer seqNo
    ) {
        try {
            log.info("🖼️ 이미지 미리보기 요청: cmplSn={}, prkImgId={}, seqNo={}", cmplSn, prkImgId, seqNo);

            // 파일 정보 조회
            List<AttchPicMngInfoVO> fileList = attchPicService.getAttchPicMngInfoListByCmplSn(cmplSn, prkImgId);
            
            AttchPicMngInfoVO fileInfo = fileList.stream()
                    .filter(f -> f.getSeqNo().equals(seqNo))
                    .findFirst()
                    .orElse(null);

            if (fileInfo == null) {
                log.warn("⚠️ 파일 정보를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }

            // 실제 파일 경로
            Resource resource = photoStorage.loadAsResource(fileInfo.getFilePath(), fileInfo.getFileNm());
            if (resource == null) {
                log.warn("⚠️ 파일을 읽을 수 없습니다: {}/{}", fileInfo.getFilePath(), fileInfo.getFileNm());
                return ResponseEntity.notFound().build();
            }

            // Content-Type 설정
            String contentType = "image/" + fileInfo.getExtNm();
            if (fileInfo.getExtNm().equalsIgnoreCase("jpg")) {
                contentType = "image/jpeg";
            }

            log.info("✅ 이미지 제공 성공: {}", fileInfo.getFileNm());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileInfo.getRealFileNm() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("❌ 이미지 미리보기 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
