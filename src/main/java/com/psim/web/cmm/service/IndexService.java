package com.psim.web.cmm.service;

import java.util.Map;

public interface IndexService {

    /**
     * 주차장 현황 조회
     * @return Map<String, Object>
     */
    Map<String, Object> getParkingStatus();

    /**
     * 이용상태 현황 조회
     * @return Map<String, Object>
     */
    /*Map<String, Object> getUsageStatus();*/
}
