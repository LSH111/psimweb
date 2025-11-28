package com.psim.web.cmm.service;

import java.util.Map;

public interface IndexService {

    /**
     * 주차장 현황 조회
     * @return Map<String, Object>
     */
    Map<String, Object> getParkingStatus();

    /**
     * 주차상의용 현황 조회
     * @return Map<String, Object>
     */
    Map<String, Object> getUsageStatus();

    /**
     * [Dashboard] 주차장 현황 조회
     * @param params
     * @return Map<String, Object>
     */
    Map<String, Object> getParkingStatusDashboard(Map<String, Object> params);

    /**
     * [Dashboard] 주차장 이용실태 현황 조회
     * @param params
     * @return Map<String, Object>
     */
    Map<String, Object> getUsageStatusDashboard(Map<String, Object> params);
}
