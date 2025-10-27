package com.psim.web.prk.service;

import com.psim.web.prk.vo.OnstreetParkingDetailVO;
import com.psim.web.prk.vo.ParkingListVO;

import java.util.List;
import java.util.Map;

public interface PrkDefPlceInfoService {
    
    // 조회 기능 (SELECT)
    List<ParkingListVO> getParkingList(Map<String, Object> params);
    int getParkingListCount(Map<String, Object> params);
    ParkingListVO getParkingDetail(String manageNo, Integer infoSn);

    // 노상주차장 상세 조회 추가
    OnstreetParkingDetailVO getOnstreetParkingDetail(String prkPlceManageNo);

    // 노상주차장 업데이트 추가
    void updateOnstreetParking(OnstreetParkingDetailVO parkingData);
    // 수정 기능 (UPDATE) - 전송 버튼으로 일괄 업데이트
    void updateParkingStatus(List<String> manageNos, String newStatus);
    void updateSelectedParkings(List<ParkingListVO> parkingList);
}
