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

    @Override
    public Map<String, Object> getParkingStatusDashboard(Map<String, Object> params) {
        Map<String, Object> raw = indexMapper.getParkingStatusDashboard(params);
        if (raw == null) {
            return java.util.Collections.emptyMap();
        }

        long draft = toLong(raw.get("draft"));
        long inSurvey = toLong(raw.get("inSurvey"));
        long pending = toLong(raw.get("pending"));
        long approved = toLong(raw.get("approved"));
        long rejected = toLong(raw.get("rejected"));

        Map<String, Object> status = new java.util.LinkedHashMap<>();
        status.put("00", draft);
        status.put("10", inSurvey);
        status.put("20", pending);
        status.put("30", approved);
        status.put("99", rejected);

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("total", draft + inSurvey + pending + approved + rejected);
        response.put("status", status);
        return response;
    }

    @Override
    public Map<String, Object> getUsageStatusDashboard(Map<String, Object> params) {
        Map<String, Object> raw = indexMapper.getUsageStatusDashboard(params);
        if (raw == null) {
            return java.util.Collections.emptyMap();
        }

        long illegal = toLong(raw.get("illegalCount"));
        long legal = toLong(raw.get("legalCount"));

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("total", illegal + legal);
        response.put("illegal", illegal);
        response.put("legal", legal);
        return response;
    }

    private long toLong(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException ignored) {
                return 0L;
            }
        }
        return 0L;
    }
}
