package com.psim.web.cmm.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.Map;

@Mapper
public interface IndexMapper {

    /**
     * 주차장 현황 조회
     * @return Map<String, Object>
     */
    Map<String, Object> selectParkingStatus();

    /**
     * 주차상의용 현황 조회
     * @return Map<String, Object>
     */
    Map<String, Object> selectUsageStatus();

    /**
     * [Dashboard] 주차장 현황
     */
    Map<String, Object> getParkingStatusDashboard(Map<String, Object> params);

    /**
     * [Dashboard] 주차장 이용실태 현황
     */
    Map<String, Object> getUsageStatusDashboard(Map<String, Object> params);
}
