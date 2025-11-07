package com.psim.web.prk.service;

import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;

import java.util.List;
import java.util.Map;

public interface PrkDefPlceInfoService {

    // ========== 목록 조회 ==========
    /**
     * 주차장 목록 조회
     */
    List<ParkingListVO> getParkingList(Map<String, Object> params);

    /**
     * 지도용 주차장 목록 조회 (좌표 포함)
     */
    List<ParkingListVO> getParkingListForMap(Map<String, Object> params);

    // ========== 상세 조회 ==========
    /**
     * 노상주차장 상세 조회
     */
    ParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo);

    /**
     * 노외주차장 상세 조회
     */
    ParkingDetailVO getOffstreetParkingDetail(String prkPlceManageNo);

    /**
     * 부설주차장 상세 조회
     */
    ParkingDetailVO getBuildParkingDetail(String prkPlceManageNo);

    // ========== 신규 등록 (INSERT) ==========
    /**
     * DB 함수로 주차장 관리번호 생성
     */
    String generatePrkPlceManageNo();

    /**
     * 노상주차장 신규 등록
     */
    void insertOnstreetParking(ParkingDetailVO vo);

    /**
     * 노외주차장 신규 등록
     */
    void insertOffstreetParking(ParkingDetailVO vo);

    /**
     * 부설주차장 신규 등록
     */
    void insertBuildParking(ParkingDetailVO vo);

    // ========== 수정 (UPDATE) ==========
    /**
     * 노상주차장 수정
     */
    void updateOnstreetParking(ParkingDetailVO parkingData);

    /**
     * 노외주차장 수정
     */
    void updateOffstreetParking(ParkingDetailVO parkingData);

    /**
     * 부설주차장 수정
     */
    void updateBuildParking(ParkingDetailVO parkingData);

    // ========== 상태 변경 ==========
    /**
     * 선택된 주차장 상태를 승인 대기로 변경
     */
    int updateSelectedStatusToPending(List<String> manageNoList);
}