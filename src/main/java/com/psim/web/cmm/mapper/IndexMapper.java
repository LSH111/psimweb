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
     * 이용상태 현황 조회
     * @return Map<String, Object>
     */
    /*Map<String, Object> selectUsageStatus();*/
}
