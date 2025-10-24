package com.psim.web.prk.mapper;

import com.psim.web.prk.vo.OnstreetParkingDetailVO;
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

    // 🔥 노상주차장 상세 조회 추가
    OnstreetParkingDetailVO selectOnstreetParkingDetail(String prkPlceManageNo);

    // 수정 기능 (UPDATE)
    void updateParkingStatus(Map<String, Object> params);
    void updateSelectedParking(Map<String, Object> params);
}