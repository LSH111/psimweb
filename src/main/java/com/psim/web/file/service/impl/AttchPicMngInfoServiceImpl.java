
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
            // 파일 저장
            String savedFileName = saveFile(file, prkImgId);
            
            // DB 저장
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
            
            log.info("파일 저장 완료: {}", savedFileName);
            return vo;
            
        } catch (IOException e) {
            log.error("파일 저장 실패", e);
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
        // 파일 정보 조회
        List<AttchPicMngInfoVO> files = mapper.selectAttchPicMngInfoList(
            prkPlceInfoSn, prkImgId, seqNo
        );
        
        // 물리적 파일 삭제
        for (AttchPicMngInfoVO file : files) {
            deletePhysicalFile(file);
        }
        
        // DB 삭제
        mapper.deleteAttchPicMngInfo(prkPlceInfoSn, prkImgId, seqNo);
        
        log.info("파일 삭제 완료: {} 건", files.size());
    }
    
    @Override
    public List<AttchPicMngInfoVO> getAttchPicMngInfoList(
        Integer prkPlceInfoSn, 
        String prkImgId
    ) {
        return mapper.selectAttchPicMngInfoList(prkPlceInfoSn, prkImgId, null);
    }
    
    // ========== Private Helper Methods ==========
    
    /**
     * 파일 저장
     */
    private String saveFile(MultipartFile file, String prkImgId) throws IOException {
        // 날짜별 디렉토리 생성
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String targetDir = uploadBasePath + File.separator + prkImgId + File.separator + dateDir;
        
        Path dirPath = Paths.get(targetDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        
        // 파일명 생성 (UUID + 확장자)
        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);
        String savedFileName = UUID.randomUUID().toString() + "." + extension;
        
        // 파일 저장
        Path filePath = dirPath.resolve(savedFileName);
        file.transferTo(filePath.toFile());
        
        return savedFileName;
    }
    
    /**
     * 다음 순번 조회
     */
    private Integer getNextSeqNo(Integer prkPlceInfoSn, String prkImgId) {
        Integer maxSeqNo = mapper.selectMaxSeqNo(prkPlceInfoSn, prkImgId);
        return (maxSeqNo == null) ? 1 : maxSeqNo + 1;
    }
    
    /**
     * 상대 경로 반환
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
                log.info("물리적 파일 삭제: {}", fullPath);
            }
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", file.getFileNm(), e);
        }
    }
}
