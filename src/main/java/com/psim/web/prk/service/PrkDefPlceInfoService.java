package com.psim.web.prk.service;

import com.psim.web.prk.vo.ParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;

import java.util.List;
import java.util.Map;

public interface PrkDefPlceInfoService {
    
    // 조회 기능 (SELECT)
    List<ParkingListVO> getParkingList(Map<String, Object> params);
    int getParkingListCount(Map<String, Object> params);
    ParkingListVO getParkingDetail(String manageNo, Integer infoSn);

    // 노상주차장 상세 조회 추가
    ParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo);

    // 노상주차장 업데이트 추가
    void updateOnstreetParking(ParkingDetailVO parkingData);

    //  노외주차장 상세 조회 추가
    ParkingDetailVO getOffstreetParkingDetail(String prkPlceManageNo);

    //  노외주차장 업데이트 추가
    void updateOffstreetParking(ParkingDetailVO parkingData);

    // 🔥 부설주차장 상세 조회 추가
    ParkingDetailVO getBuildParkingDetail(String prkPlceManageNo);

    // 🔥 부설주차장 업데이트 추가
    void updateBuildParking(ParkingDetailVO parkingData);

    // 수정 기능 (UPDATE) - 전송 버튼으로 일괄 업데이트
    void updateParkingStatus(List<String> manageNos, String newStatus);
    void updateSelectedParkings(List<ParkingListVO> parkingList);
}
