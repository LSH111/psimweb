package com.psim.web.file.service.impl;

import com.psim.media.storage.PhotoStorage;
import com.psim.web.cmm.vo.CoUserVO;
import com.psim.web.file.mapper.AttchPicMngInfoMapper;
import com.psim.web.file.service.AttchPicMngInfoService;
import com.psim.web.file.vo.AttchPicMngInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.nio.file.InvalidPathException;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttchPicMngInfoServiceImpl implements AttchPicMngInfoService {

    private static final Set<String> ALLOWED_EXTENSIONS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp")));
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024L; // 10MB
    private static final String DEFAULT_AUDIT_USER = "SYSTEM";
    private static final String DEFAULT_AUDIT_IP = "127.0.0.1";
    private static final String SESSION_LOGIN_USER = "loginUser";
    private final AttchPicMngInfoMapper mapper;
    private final PhotoStorage photoStorage;

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
            String prkPlceManageNo,
            Integer prkPlceInfoSn,
            String prkImgId,
            MultipartFile file
    ) {
        if (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty()) {
            throw new IllegalArgumentException("prkPlceManageNo가 없습니다. 파일을 저장할 수 없습니다.");
        }
        if (prkPlceInfoSn == null) {
            throw new IllegalArgumentException("prkPlceInfoSn이 없습니다. 파일을 저장할 수 없습니다.");
        }
        validateFile(file);
        String safePrkImgId = sanitizeIdentifier(prkImgId);

        try {
            PhotoStorage.SaveResult saved = photoStorage.save(safePrkImgId, file);
            String extension = getFileExtension(file.getOriginalFilename());
            LocalDateTime now = LocalDateTime.now();
            AuditMetadata audit = resolveAuditMetadata();

            AttchPicMngInfoVO vo = new AttchPicMngInfoVO();
            vo.setPrkPlceManageNo(prkPlceManageNo);
            vo.setPrkPlceInfoSn(prkPlceInfoSn);
            vo.setPrkImgId(safePrkImgId);
            vo.setSeqNo(getNextSeqNo(prkPlceInfoSn, prkImgId));
            vo.setRealFileNm(file.getOriginalFilename());
            vo.setFileNm(saved.savedFileName());
            vo.setFilePath(saved.relativePath());
            vo.setExtNm(extension);
            vo.setRegDt(now);
            vo.setUpdtDt(now);
            vo.setRgstId(audit.getUserId());
            vo.setRgstIpAddr(audit.getIpAddr());
            vo.setUpdusrId(audit.getUserId());
            vo.setUpdusrIpAddr(audit.getIpAddr());

            mapper.insertAttchPicMngInfo(vo);

            log.info("✅ 파일 저장 완료: {}", saved.savedFileName());
            return vo;

        } catch (Exception e) {
            log.error("❌ 파일 저장 실패", e);
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    @Transactional
    public List<AttchPicMngInfoVO> uploadAndSaveFiles(
            String prkPlceManageNo,
            Integer prkPlceInfoSn,
            String prkImgId,
            List<MultipartFile> files
    ) {
        if (prkPlceInfoSn == null) {
            throw new IllegalArgumentException("prkPlceInfoSn이 없습니다. 파일을 저장할 수 없습니다.");
        }
        if (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty()) {
            throw new IllegalArgumentException("prkPlceManageNo가 없습니다. 파일을 저장할 수 없습니다.");
        }
        List<AttchPicMngInfoVO> result = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return result;
        }
        String safePrkImgId = sanitizeIdentifier(prkImgId);

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                result.add(uploadAndSaveFile(prkPlceManageNo, prkPlceInfoSn, safePrkImgId, file));
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
                prkPlceInfoSn, prkImgId, seqNo, null
        );

        for (AttchPicMngInfoVO file : files) {
            photoStorage.delete(file.getFilePath(), file.getFileNm());
        }

        mapper.deleteAttchPicMngInfo(prkPlceInfoSn, prkImgId, seqNo);

        log.info("✅ 파일 삭제 완료: {} 건", files.size());
    }

    @Override
    public List<AttchPicMngInfoVO> getAttchPicMngInfoList(
            Integer prkPlceInfoSn,
            String prkImgId,
            String prkPlceManageNo
    ) {
        String safePrkImgId = sanitizeIdentifier(prkImgId);
        log.info("📂 파일 목록 조회 서비스 호출 - prkPlceInfoSn={}, prkImgId={}, prkPlceManageNo={}", prkPlceInfoSn, safePrkImgId, prkPlceManageNo);
        return mapper.selectAttchPicMngInfoList(prkPlceInfoSn, safePrkImgId, null, prkPlceManageNo);
    }

    @Override
    @Transactional
    public AttchPicMngInfoVO uploadAndSaveFileForUsage(
            String prkPlceManageNo,
            String cmplSn,
            String prkImgId,
            MultipartFile file
    ) {
        if (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty()) {
            throw new IllegalArgumentException("prkPlceManageNo가 없습니다. 파일을 저장할 수 없습니다.");
        }
        validateFile(file);
        String safePrkImgId = sanitizeIdentifier(prkImgId);
        Integer infoSn = parseInfoSn(cmplSn);

        try {
            PhotoStorage.SaveResult saved = photoStorage.save(safePrkImgId, file);
            String extension = getFileExtension(file.getOriginalFilename());
            LocalDateTime now = LocalDateTime.now();
            AuditMetadata audit = resolveAuditMetadata();

            AttchPicMngInfoVO vo = new AttchPicMngInfoVO();
            vo.setPrkPlceManageNo(prkPlceManageNo);
            vo.setPrkPlceInfoSn(infoSn);
            vo.setPrkImgId(safePrkImgId);
            vo.setSeqNo(getNextSeqNoForUsage(infoSn, prkImgId));
            vo.setRealFileNm(file.getOriginalFilename());
            vo.setFileNm(saved.savedFileName());
            vo.setFilePath(saved.relativePath());
            vo.setExtNm(extension);
            vo.setRegDt(now);
            vo.setUpdtDt(now);
            vo.setRgstId(audit.getUserId());
            vo.setRgstIpAddr(audit.getIpAddr());
            vo.setUpdusrId(audit.getUserId());
            vo.setUpdusrIpAddr(audit.getIpAddr());

            mapper.insertAttchPicMngInfo(vo);

            log.info("✅ 이용실태 파일 저장 완료 - cmplSn: {}, 파일: {}", cmplSn, saved.savedFileName());
            return vo;

        } catch (Exception e) {
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
            String prkPlceManageNo,
            String cmplSn,
            String prkImgId,
            List<MultipartFile> files) {

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("파일 목록이 비어있습니다.");
        }
        if (prkPlceManageNo == null || prkPlceManageNo.trim().isEmpty()) {
            throw new IllegalArgumentException("prkPlceManageNo가 없습니다. 파일을 저장할 수 없습니다.");
        }

        List<AttchPicMngInfoVO> results = new ArrayList<>();
        Integer infoSn = parseInfoSn(cmplSn);
        int seqNo = getNextSeqNoForUsage(infoSn, prkImgId);
        String safePrkImgId = sanitizeIdentifier(prkImgId);
        AuditMetadata audit = resolveAuditMetadata();
        String effectiveUserId = audit.getUserId();
        String effectiveUserIp = audit.getIpAddr();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            try {
                validateFile(file);
                log.info("📸 파일 저장 시작: cmplSn={}, seqNo={}, fileName={}",
                        cmplSn, seqNo, file.getOriginalFilename());

                // 파일 저장 (기존 saveFile 메서드 사용)
                PhotoStorage.SaveResult saved = photoStorage.save(safePrkImgId, file);
                String relativePath = saved.relativePath();

                // DB 저장
                AttchPicMngInfoVO vo = new AttchPicMngInfoVO();
                vo.setPrkPlceManageNo(prkPlceManageNo);
                vo.setPrkPlceInfoSn(infoSn);
                vo.setPrkImgId(safePrkImgId);
                vo.setSeqNo(seqNo);

                String originalFileName = file.getOriginalFilename();
                String extension = getFileExtension(originalFileName);

                vo.setExtNm(extension);
                vo.setFilePath(relativePath);
                vo.setFileNm(saved.savedFileName());
                vo.setRealFileNm(originalFileName);
                LocalDateTime now = LocalDateTime.now();
                vo.setRegDt(now);
                vo.setUpdtDt(now);
                vo.setRgstId(effectiveUserId);
                vo.setRgstIpAddr(effectiveUserIp);
                vo.setUpdusrId(effectiveUserId);
                vo.setUpdusrIpAddr(effectiveUserIp);

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
        Integer infoSn = parseInfoSn(cmplSn);
        return mapper.selectAttchPicMngInfoListByCmplSn(infoSn, prkImgId, null);
    }

    @Override
    @Transactional
    public void deleteAttchPicMngInfoForUsage(
            String cmplSn,
            String prkImgId,
            Integer seqNo
    ) {
        Integer infoSn = parseInfoSn(cmplSn);
        List<AttchPicMngInfoVO> files = mapper.selectAttchPicMngInfoListByCmplSn(infoSn, prkImgId, null);

        for (AttchPicMngInfoVO file : files) {
            if (seqNo == null || file.getSeqNo().equals(seqNo)) {
                photoStorage.delete(file.getFilePath(), file.getFileNm());
            }
        }

        mapper.deleteAttchPicMngInfo(infoSn, prkImgId, seqNo);

        log.info("✅ 이용실태 파일 삭제 완료: {} 건", files.size());
    }

    @Override
    public List<AttchPicMngInfoVO> getAttchPicMngInfoListByCmplSn(
            String cmplSn,
            String prkImgId,
            String prkPlceManageNo
    ) {
        Integer infoSn = parseInfoSn(cmplSn);
        return mapper.selectAttchPicMngInfoListByCmplSn(infoSn, prkImgId, prkPlceManageNo);
    }

    // ========== Private Helper Methods ==========

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
    private Integer getNextSeqNoForUsage(Integer prkPlceInfoSn, String prkImgId) {
        Integer maxSeqNo = mapper.selectMaxSeqNoForUsage(prkPlceInfoSn, prkImgId);
        return (maxSeqNo == null) ? 1 : maxSeqNo + 1;
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

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("허용된 파일 크기를 초과했습니다.");
        }
        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않은 파일 형식입니다.");
        }
    }

    private String sanitizeIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("잘못된 파일 그룹 식별자입니다.");
        }
        String trimmed = identifier.trim();
        if (trimmed.contains("..") || trimmed.contains("/") || trimmed.contains("\\")) {
            throw new InvalidPathException(trimmed, "경로 이동 문자는 허용되지 않습니다.");
        }
        return trimmed;
    }

    private Integer parseInfoSn(String cmplSn) {
        try {
            return Integer.parseInt(cmplSn);
        } catch (Exception e) {
            throw new IllegalArgumentException("cmplSn을 숫자로 변환할 수 없습니다: " + cmplSn);
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

            // 필드명 정규화 (소문자 키만 있는 경우 대비)
            if (!photoInfo.containsKey("fileName") && photoInfo.containsKey("filename")) {
                photoInfo.put("fileName", photoInfo.get("filename"));
            }
            if (!photoInfo.containsKey("filePath") && photoInfo.containsKey("filepath")) {
                photoInfo.put("filePath", photoInfo.get("filepath"));
            }
            if (!photoInfo.containsKey("realFileNm") && photoInfo.containsKey("real_file_nm")) {
                photoInfo.put("realFileNm", photoInfo.get("real_file_nm"));
            }

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

            Integer infoSn = parseInfoSn(cmplSn);
            Map<String, Object> photoInfo = mapper.selectPhotoFileForUsage(infoSn, prkImgId, seqNo);

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

    private AuditMetadata resolveAuditMetadata() {
        String userId = DEFAULT_AUDIT_USER;
        String ipAddr = DEFAULT_AUDIT_IP;

        try {
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
            if (requestAttributes instanceof ServletRequestAttributes) {
                HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
                if (request != null) {
                    String remoteAddr = request.getRemoteAddr();
                    String resolvedIp = normalizeValue(remoteAddr); // reuse trim logic, allows null safe
                    if (resolvedIp != null) {
                        ipAddr = resolvedIp;
                    }
                    HttpSession session = request.getSession(false);
                    if (session != null) {
                        CoUserVO loginUser = null;
                        try {
                            loginUser = (CoUserVO) session.getAttribute(SESSION_LOGIN_USER);
                        } catch (ClassCastException castEx) {
                            log.warn("Unexpected loginUser type in session", castEx);
                        }
                        if (loginUser != null) {
                            String candidateId = normalizeValue(loginUser.getUserId());
                            if (candidateId != null) {
                                userId = candidateId;
                            }
                        }

                        if (DEFAULT_AUDIT_USER.equals(userId)) {
                            Object sessionUserId = session.getAttribute("userId");
                            String candidateId = (sessionUserId instanceof String)
                                    ? normalizeValue((String) sessionUserId)
                                    : null;
                            if (candidateId != null) {
                                userId = candidateId;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Failed to resolve audit metadata", e);
        }

        if (DEFAULT_AUDIT_USER.equals(userId)) {
            String securityUserId = resolveUserIdFromSecurityContext();
            if (securityUserId != null) {
                userId = securityUserId;
            }
        }

        return new AuditMetadata(userId, ipAddr);
    }

    private String resolveUserIdFromSecurityContext() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            Object principal = authentication.getPrincipal();
            if (principal instanceof CoUserVO) {
                return normalizeValue(((CoUserVO) principal).getUserId());
            }
            if (principal instanceof UserDetails) {
                return normalizeValue(((UserDetails) principal).getUsername());
            }
            if (principal instanceof String) {
                String candidate = (String) principal;
                if (!"anonymousUser".equalsIgnoreCase(candidate)) {
                    return normalizeValue(candidate);
                }
            }
        } catch (Exception e) {
            log.debug("Failed to resolve userId from SecurityContext", e);
        }
        return null;
    }

    private String normalizeValue(String candidate) {
        if (candidate == null) {
            return null;
        }
        String trimmed = candidate.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static final class AuditMetadata {
        private final String userId;
        private final String ipAddr;

        private AuditMetadata(String userId, String ipAddr) {
            this.userId = userId;
            this.ipAddr = ipAddr;
        }

        public String getUserId() {
            return userId;
        }

        public String getIpAddr() {
            return ipAddr;
        }
    }
}
