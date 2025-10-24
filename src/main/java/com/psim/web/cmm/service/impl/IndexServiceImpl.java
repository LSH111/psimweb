package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.IndexMapper;
import com.psim.web.cmm.service.IndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class IndexServiceImpl implements IndexService {

    private final IndexMapper indexMapper;

    @Override
    public Map<String, Object> getParkingStatus() {
        return indexMapper.selectParkingStatus();
    }

    @Override
    public Map<String, Object> getUsageStatus() {
        return indexMapper.selectUsageStatus();
    }
}
