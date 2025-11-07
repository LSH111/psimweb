package com.psim.web.prk.mapper;

 import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface PrkDefPlceInfoMapper {

    // 조회 기능 (SELECT)
    List<ParkingListVO> selectParkingList(Map<String, Object> params);
    int selectParkingListCount(Map<String, Object> params);
    ParkingListVO selectParkingDetail(Map<String, Object> params);

    // 노상주차장 상세 조회 추가
    ParkingDetailVO selectOnstreetParkingDetail(String prkPlceManageNo);

    // 노상주차장 업데이트 메서드 추가
    void updatePrkDefPlceInfo(ParkingDetailVO parkingData);
    void updateOnstrPrklotInfo(ParkingDetailVO parkingData);
    void updateOnstrPrklotOperInfo(ParkingDetailVO parkingData);
    void updateBizPerPrklotPrgsSts(ParkingDetailVO parkingData);

    // 🔥 노외주차장 상세 조회 추가
    ParkingDetailVO selectOffstreetParkingDetail(String prkPlceManageNo);

    // 🔥 노외주차장 업데이트 메서드 추가
    void updateOffstrPrklotInfo(ParkingDetailVO parkingData);
    void updateOffstrPrklotOperInfo(ParkingDetailVO parkingData);

    // 🔥 부설주차장 상세 조회 추가
    ParkingDetailVO selectBuildParkingDetail(String prkPlceManageNo);

    // 🔥 부설주차장 업데이트 메서드 추가
    void updateAtchPrklotInfo(ParkingDetailVO parkingData);
    void updateAtchPrklotOperInfo(ParkingDetailVO parkingData);

    // ========== 🔥 INSERT 메서드 추가 ==========

    // 기본 주차장 정보 INSERT
    void insertPrkDefPlceInfo(ParkingDetailVO parkingData);

    // 사업별 주차장 정보 INSERT
    void insertBizPerPrklotInfo(ParkingDetailVO parkingData);

    // 노상주차장 INSERT
    void insertOnstrPrklotInfo(ParkingDetailVO parkingData);
    void insertOnstrPrklotOperInfo(ParkingDetailVO parkingData);

    // 노외주차장 INSERT
    void insertOffstrPrklotInfo(ParkingDetailVO parkingData);
    void insertOffstrPrklotOperInfo(ParkingDetailVO parkingData);

    // 부설주차장 INSERT
    void insertAtchPrklotInfo(ParkingDetailVO parkingData);
    void insertAtchPrklotOperInfo(ParkingDetailVO parkingData);

    // 수정 기능 (UPDATE)
    void updateParkingStatus(Map<String, Object> params);
    void updateSelectedParking(Map<String, Object> params);

    /**
     * 지도용 주차장 목록 조회 (좌표 포함)
     */
    List<ParkingListVO> selectParkingListForMap(Map<String, Object> params);
}