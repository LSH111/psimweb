package com.psim.web.prk.service;

import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * 지도용 주차장 목록 건수 조회 (필터 반영)
     */
    int countParkingListForMap(Map<String, Object> params);

    /**
     * 좌표가 있는 전체 주차장 건수
     */
    int countParkingListForMapAll();

    // ========== 상세 조회 ==========
    /**
     * 노상주차장 상세 조회
     */
    ParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo, Long prkPlceInfoSn);

    /**
     * 노외주차장 상세 조회
     */
    ParkingDetailVO getOffstreetParkingDetail(String prkPlceManageNo, Long prkPlceInfoSn);

    /**
     * 부설주차장 상세 조회
     */
    ParkingDetailVO getBuildParkingDetail(String prkPlceManageNo, Long prkPlceInfoSn);

    // ========== 신규 등록 (INSERT) ==========
    /**
     * DB 함수로 주차장 관리번호 생성
     * @param zipCode 우편번호
     * @param prkplceSe 관리주체(소유주체): 공영(1), 민영(2), 기타(9)
     * @param operMbyCd 운영주체: 직영(1), 위탁(2), 기타(9)
     * @param prkPlceType 주차장유형: 노상(1), 노외(2), 부설(3), 기타(9)
     * @return 생성된 주차장 관리번호
     */
    String generatePrkPlceManageNo(String zipCode, String prkplceSe, String operMbyCd, String prkPlceType);

    /**
     * 노상주차장 신규 등록
     */
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            timeout = 30,
            rollbackFor = Exception.class
    )
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
    int updateSelectedStatusToPending(List<Map<String, Object>> parkingList);
}
