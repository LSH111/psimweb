package com.psim.web.file.service;

import com.psim.web.file.vo.AttchPicMngInfoVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

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
     * 파일 업로드 및 정보 저장 (주차장용)
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
     * 파일 업로드 및 정보 저장 (주차장용 - 복수)
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

    List<AttchPicMngInfoVO> getAttchPicMngInfoList(
            Integer prkPlceInfoSn,
            String prkImgId
    );

    /**
     * 파일 업로드 및 정보 저장 (이용실태용)
     * @param cmplSn 실태조사일련번호
     * @param prkImgId 이미지 구분 ID
     * @param file 업로드 파일
     * @return 저장된 파일 정보
     */
    AttchPicMngInfoVO uploadAndSaveFileForUsage(
            String cmplSn,
            String prkImgId,
            MultipartFile file
    );

    /**
     * 파일 업로드 및 정보 저장 (이용실태용 - 복수)
     * @param cmplSn 실태조사일련번호
     * @param prkImgId 이미지 구분 ID
     * @param files 업로드 파일 목록
     * @param userId 등록자 ID
     * @param userIp 등록자 IP
     * @return 저장된 파일 정보 목록
     */
    List<AttchPicMngInfoVO> uploadAndSaveFilesForUsage(
            String cmplSn,
            String prkImgId,
            List<MultipartFile> files,
            String userId,
            String userIp
    ) throws RuntimeException;

    List<AttchPicMngInfoVO> getAttchPicMngInfoListForUsage(
            String cmplSn,
            String prkImgId
    );

    /**
     * 특정 이미지 삭제
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
     * 이용실태 이미지 삭제
     * @param cmplSn 실태조사일련번호
     * @param prkImgId 이미지 구분 ID
     * @param seqNo 순번
     */
    void deleteAttchPicMngInfoForUsage(String cmplSn, String prkImgId, Integer seqNo);

    /**
     * 🔥 이용실태 파일 목록 조회 (cmplSn 기준)
     */
    List<AttchPicMngInfoVO> getAttchPicMngInfoListByCmplSn(String cmplSn, String prkImgId);

    /**
     * 주차장 정보 일련번호로 사진 목록 조회
     */
    List<Map<String, Object>> getPhotosByPrkPlceInfoSn(Integer prkPlceInfoSn);

    /**
     * 사진 파일 데이터 조회 (주차장용)
     * @param prkPlceInfoSn 주차장 정보 일련번호
     * @param prkImgId 이미지 ID
     * @param seqNo 순번
     */
    Map<String, Object> getPhotoFile(Integer prkPlceInfoSn, String prkImgId, Integer seqNo);

    /**
     * 사진 파일 데이터 조회 (이용실태용)
     * @param cmplSn 실태조사일련번호
     * @param prkImgId 이미지 ID
     * @param seqNo 순번
     */
    Map<String, Object> getPhotoFileForUsage(String cmplSn, String prkImgId, Integer seqNo);
}