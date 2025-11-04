
package com.psim.web.file.service;

import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface AttchPicMngInfoService {
    
    /**
     * 첨부 사진 정보 저장 (단일 파일)
     * @param info 사진 정보 VO
     */
    void addAttchPicMngInfo(AttchPicMngInfoVO info);
    
    /**
     * 첨부 사진 정보 수정
     * @param info 사진 정보 VO
     */
    void editAttchPicMngInfo(AttchPicMngInfoVO info);
    
    /**
     * 🔥 파일 업로드 및 정보 저장 (단일)
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID (예: "ON_MAIN")
     * @param file 업로드 파일
     * @return 저장된 파일 정보
     */
    AttchPicMngInfoVO uploadAndSaveFile(
        Integer prkPlceInfoSn, 
        String prkImgId, 
        MultipartFile file
    );
    
    /**
     * 🔥 파일 업로드 및 정보 저장 (복수)
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID
     * @param files 업로드 파일 목록
     * @return 저장된 파일 정보 목록
     */
    List<AttchPicMngInfoVO> uploadAndSaveFiles(
        Integer prkPlceInfoSn, 
        String prkImgId, 
        List<MultipartFile> files
    );
    
    /**
     * 🔥 특정 이미지 삭제
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID
     * @param seqNo 순번 (null이면 해당 ID의 모든 이미지 삭제)
     */
    void deleteAttchPicMngInfo(
        Integer prkPlceInfoSn, 
        String prkImgId, 
        Integer seqNo
    );
    
    /**
     * 🔥 주차장별 이미지 목록 조회
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 구분 ID (null이면 전체)
     * @return 이미지 정보 목록
     */
    List<AttchPicMngInfoVO> getAttchPicMngInfoList(
        Integer prkPlceInfoSn, 
        String prkImgId
    );
}
