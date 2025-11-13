package com.psim.web.file.service.impl;

import com.psim.web.file.mapper.AttchPicMngInfoMapper;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttchPicMngInfoServiceImpl implements AttchPicMngInfoService {

    private final AttchPicMngInfoMapper mapper;

    @Value("${file.upload.path:/upload/parking}")
    private String uploadBasePath;

    @Override
    @Transactional
    public void addAttchPicMngInfo(AttchPicMngInfoVO info) {
        mapper.insertAttchPicMngInfo(info);
    }

    @Override
    @Transactional
    public void editAttchPicMngInfo(AttchPicMngInfoVO info) {
        mapper.updateAttchPicMngInfo(info);
    }

    @Override
    @Transactional
    public AttchPicMngInfoVO uploadAndSaveFile(
            Integer prkPlceInfoSn,
            String prkImgId,
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        try {
            String savedFileName = saveFile(file, prkImgId);

            AttchPicMngInfoVO vo = new AttchPicMngInfoVO();
            vo.setPrkPlceInfoSn(prkPlceInfoSn);
            vo.setPrkImgId(prkImgId);
            vo.setSeqNo(getNextSeqNo(prkPlceInfoSn, prkImgId));
            vo.setRealFileNm(file.getOriginalFilename());
            vo.setFileNm(savedFileName);
            vo.setFilePath(getRelativePath(prkImgId));
            vo.setExtNm(getFileExtension(file.getOriginalFilename()));
            vo.setRegDt(LocalDateTime.now());

            mapper.insertAttchPicMngInfo(vo);

            log.info("✅ 파일 저장 완료: {}", savedFileName);
            return vo;

        } catch (IOException e) {
            log.error("❌ 파일 저장 실패", e);
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public List<AttchPicMngInfoVO> uploadAndSaveFiles(
            Integer prkPlceInfoSn,
            String prkImgId,
            List<MultipartFile> files
    ) {
        List<AttchPicMngInfoVO> result = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return result;
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                result.add(uploadAndSaveFile(prkPlceInfoSn, prkImgId, file));
            }
        }

        return result;
    }

    @Override
    @Transactional
    public void deleteAttchPicMngInfo(
            Integer prkPlceInfoSn,
            String prkImgId,
            Integer seqNo
    ) {
        List<AttchPicMngInfoVO> files = mapper.selectAttchPicMngInfoList(
                prkPlceInfoSn, prkImgId, seqNo
        );

        for (AttchPicMngInfoVO file : files) {
            deletePhysicalFile(file);
        }

        mapper.deleteAttchPicMngInfo(prkPlceInfoSn, prkImgId, seqNo);

        log.info("✅ 파일 삭제 완료: {} 건", files.size());
    }

    @Override
    public List<AttchPicMngInfoVO> getAttchPicMngInfoList(
            Integer prkPlceInfoSn,
            String prkImgId
    ) {
        return mapper.selectAttchPicMngInfoList(prkPlceInfoSn, prkImgId, null);
    }

    @Override
    @Transactional
    public AttchPicMngInfoVO uploadAndSaveFileForUsage(
            String cmplSn,
            String prkImgId,
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        try {
            String savedFileName = saveFile(file, prkImgId);

            AttchPicMngInfoVO vo = new AttchPicMngInfoVO();
            vo.setCmplSn(cmplSn);
            vo.setPrkImgId(prkImgId);
            vo.setAttachType("USAGE");
            vo.setSeqNo(getNextSeqNoForUsage(cmplSn, prkImgId));
            vo.setRealFileNm(file.getOriginalFilename());
            vo.setFileNm(savedFileName);
            vo.setFilePath(getRelativePath(prkImgId));
            vo.setExtNm(getFileExtension(file.getOriginalFilename()));
            vo.setRegDt(LocalDateTime.now());
            vo.setRgstId("SYSTEM");
            vo.setRgstIpAddr("127.0.0.1");

            mapper.insertAttchPicMngInfo(vo);

            log.info("✅ 이용실태 파일 저장 완료 - cmplSn: {}, 파일: {}", cmplSn, savedFileName);
            return vo;

        } catch (IOException e) {
            log.error("❌ 파일 저장 실패", e);
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 🔥 복수 파일 업로드 (이용실태용)
     */
    @Transactional
    @Override
    public List<AttchPicMngInfoVO> uploadAndSaveFilesForUsage(
            String cmplSn,
            String prkImgId,
            List<MultipartFile> files,
            String userId,
            String userIp) {

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("파일 목록이 비어있습니다.");
        }

        List<AttchPicMngInfoVO> results = new ArrayList<>();
        int seqNo = getNextSeqNoForUsage(cmplSn, prkImgId);

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            try {
                log.info("📸 파일 저장 시작: cmplSn={}, seqNo={}, fileName={}",
                        cmplSn, seqNo, file.getOriginalFilename());

                // 파일 저장 (기존 saveFile 메서드 사용)
                String savedFileName = saveFile(file, prkImgId);
                String relativePath = getRelativePath(prkImgId);

                // DB 저장
                AttchPicMngInfoVO vo = new AttchPicMngInfoVO();
                vo.setCmplSn(cmplSn);
                vo.setPrkImgId(prkImgId);
                vo.setSeqNo(seqNo);
                vo.setAttachType("USAGE");

                String originalFileName = file.getOriginalFilename();
                String extension = getFileExtension(originalFileName);

                vo.setExtNm(extension);
                vo.setFilePath(relativePath);
                vo.setFileNm(savedFileName);
                vo.setRealFileNm(originalFileName);
                vo.setRgstId(userId);
                vo.setRgstIpAddr(userIp);
                vo.setRegDt(LocalDateTime.now());

                mapper.insertAttchPicMngInfo(vo);

                results.add(vo);
                seqNo++;

                log.info("✅ 파일 저장 완료: {}", vo.getFileNm());

            } catch (Exception e) {
                log.error("❌ 파일 저장 실패: {}", file.getOriginalFilename(), e);
                try {
                    throw new Exception("파일 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
                } catch (Exception ex) {
                    throw new RuntimeException(ex);
                }
            }
        }
        return results;
    }

    @Override
    public List<AttchPicMngInfoVO> getAttchPicMngInfoListForUsage(
            String cmplSn,
            String prkImgId
    ) {
        return mapper.selectAttchPicMngInfoListByCmplSn(cmplSn, prkImgId);
    }

    @Override
    @Transactional
    public void deleteAttchPicMngInfoForUsage(
            String cmplSn,
            String prkImgId,
            Integer seqNo
    ) {
        List<AttchPicMngInfoVO> files = mapper.selectAttchPicMngInfoListByCmplSn(cmplSn, prkImgId);

        for (AttchPicMngInfoVO file : files) {
            if (seqNo == null || file.getSeqNo().equals(seqNo)) {
                deletePhysicalFile(file);
            }
        }

        mapper.deleteAttchPicMngInfo(null, prkImgId, seqNo);

        log.info("✅ 이용실태 파일 삭제 완료: {} 건", files.size());
    }

    @Override
    public List<AttchPicMngInfoVO> getAttchPicMngInfoListByCmplSn(
            String cmplSn,
            String prkImgId
    ) {
        return mapper.selectAttchPicMngInfoListByCmplSn(cmplSn, prkImgId);
    }

    // ========== Private Helper Methods ==========

    /**
     * 파일 저장
     */
    private String saveFile(MultipartFile file, String prkImgId) throws IOException {
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String targetDir = uploadBasePath + File.separator + prkImgId + File.separator + dateDir;

        Path dirPath = Paths.get(targetDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
            log.info("📁 디렉토리 생성: {}", targetDir);
        }

        // 디렉토리 쓰기 권한 확인
        if (!Files.isWritable(dirPath)) {
            throw new IOException("디렉토리 쓰기 권한 없음: " + targetDir);
        }

        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);
        String savedFileName = UUID.randomUUID() + "." + extension;

        Path filePath = dirPath.resolve(savedFileName);
        file.transferTo(filePath.toFile());

        log.info("💾 파일 저장: {} -> {}", originalFileName, savedFileName);
        return savedFileName;
    }

    /**
     * 다음 시퀀스 번호 조회 (주차장용)
     */
    private Integer getNextSeqNo(Integer prkPlceInfoSn, String prkImgId) {
        Integer maxSeqNo = mapper.selectMaxSeqNo(prkPlceInfoSn, prkImgId);
        return (maxSeqNo == null) ? 1 : maxSeqNo + 1;
    }

    /**
     * 🔥 다음 시퀀스 번호 조회 (이용실태용) - 수정
     */
    private Integer getNextSeqNoForUsage(String cmplSn, String prkImgId) {
        Integer maxSeqNo = mapper.selectMaxSeqNoForUsage(cmplSn, prkImgId);
        return (maxSeqNo == null) ? 1 : maxSeqNo + 1;
    }

    /**
     * 상대 경로 생성
     */
    private String getRelativePath(String prkImgId) {
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return prkImgId + "/" + dateDir;
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 물리적 파일 삭제
     */
    private void deletePhysicalFile(AttchPicMngInfoVO file) {
        try {
            String fullPath = uploadBasePath + File.separator +
                    file.getFilePath() + File.separator + file.getFileNm();
            Path path = Paths.get(fullPath);

            if (Files.exists(path)) {
                Files.delete(path);
                log.info("🗑️ 물리적 파일 삭제: {}", fullPath);
            }
        } catch (IOException e) {
            log.warn("⚠️ 파일 삭제 실패: {}", file.getFileNm(), e);
        }
    }
    /**
     * 🔥 주차장 정보 일련번호로 사진 목록 조회
     */
    @Override
    public List<Map<String, Object>> getPhotosByPrkPlceInfoSn(Integer prkPlceInfoSn) {
        try {
            log.info("📸 사진 목록 조회 - prkPlceInfoSn: {}", prkPlceInfoSn);
            List<Map<String, Object>> photos = mapper.selectPhotosByPrkPlceInfoSn(prkPlceInfoSn);
            log.info("✅ 사진 {}개 조회 완료", photos.size());
            return photos;
        } catch (Exception e) {
            log.error("❌ 사진 목록 조회 실패", e);
            return new ArrayList<>();
        }
    }

    /**
     * 🔥 사진 파일 데이터 조회 (주차장용)
     */
    @Override
    public Map<String, Object> getPhotoFile(Integer prkPlceInfoSn, String prkImgId, Integer seqNo) {
        try {
            log.info("📷 사진 파일 조회 (주차장) - prkPlceInfoSn: {}, prkImgId: {}, seqNo: {}",
                    prkPlceInfoSn, prkImgId, seqNo);

            Map<String, Object> photoInfo = mapper.selectPhotoFile(prkPlceInfoSn, prkImgId, seqNo);

            if (photoInfo == null) {
                log.warn("⚠️ 사진을 찾을 수 없음: prkPlceInfoSn={}, prkImgId={}, seqNo={}",
                        prkPlceInfoSn, prkImgId, seqNo);
                return null;
            }

            // Content-Type 결정
            String extNm = (String) photoInfo.get("extNm");
            String contentType = determineContentType(extNm);
            photoInfo.put("contentType", contentType);

            log.info("✅ 사진 파일 조회 완료 - 파일명: {}", photoInfo.get("fileName"));
            return photoInfo;

        } catch (Exception e) {
            log.error("❌ 사진 파일 조회 실패", e);
            return null;
        }
    }

    /**
     * 🔥 사진 파일 데이터 조회 (이용실태용)
     */
    @Override
    public Map<String, Object> getPhotoFileForUsage(String cmplSn, String prkImgId, Integer seqNo) {
        try {
            log.info("📷 사진 파일 조회 (이용실태) - cmplSn: {}, prkImgId: {}, seqNo: {}",
                    cmplSn, prkImgId, seqNo);

            Map<String, Object> photoInfo = mapper.selectPhotoFileForUsage(cmplSn, prkImgId, seqNo);

            if (photoInfo == null) {
                log.warn("⚠️ 사진을 찾을 수 없음: cmplSn={}, prkImgId={}, seqNo={}",
                        cmplSn, prkImgId, seqNo);
                return null;
            }

            // Content-Type 결정
            String extNm = (String) photoInfo.get("extNm");
            String contentType = determineContentType(extNm);
            photoInfo.put("contentType", contentType);

            log.info("✅ 사진 파일 조회 완료 - 파일명: {}", photoInfo.get("fileName"));
            return photoInfo;

        } catch (Exception e) {
            log.error("❌ 사진 파일 조회 실패", e);
            return null;
        }
    }

    /**
     * Content-Type 결정 헬퍼 메서드
     */
    private String determineContentType(String extNm) {
        if (extNm == null) {
            return "application/octet-stream";
        }

        switch (extNm.toLowerCase()) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "bmp":
                return "image/bmp";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
}