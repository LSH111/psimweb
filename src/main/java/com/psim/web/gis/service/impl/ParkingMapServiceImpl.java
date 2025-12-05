package com.psim.web.gis.service.impl;

import com.psim.web.gis.service.ParkingMapService;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.ParkingListVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParkingMapServiceImpl implements ParkingMapService {

    private final PrkDefPlceInfoService prkDefPlceInfoService;

    @Override
    public List<ParkingListVO> findParkingForMap(Map<String, Object> params) {
        Map<String, Object> safeParams = new HashMap<>();
        if (params != null) {
            safeParams.putAll(params);
        }
        return prkDefPlceInfoService.getParkingListForMap(safeParams);
    }

    @Override
    public int countParkingForMap(Map<String, Object> params) {
        Map<String, Object> safeParams = new HashMap<>();
        if (params != null) {
            safeParams.putAll(params);
        }
        return prkDefPlceInfoService.countParkingListForMap(safeParams);
    }

    @Override
    public int countAllParkingForMap() {
        return prkDefPlceInfoService.countParkingListForMapAll();
    }
}
