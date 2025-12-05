package com.psim.web.gis.service;

import com.psim.web.prk.vo.ParkingListVO;

import java.util.List;
import java.util.Map;

public interface ParkingMapService {
    List<ParkingListVO> findParkingForMap(Map<String, Object> params);

    int countParkingForMap(Map<String, Object> params);

    int countAllParkingForMap();
}
