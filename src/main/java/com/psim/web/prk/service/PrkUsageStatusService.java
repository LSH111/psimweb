package com.psim.web.prk.service;

import com.psim.web.prk.vo.PrkUsageStatusVO;
import java.util.List;

public interface PrkUsageStatusService {
    List<PrkUsageStatusVO> getUsageStatusList(PrkUsageStatusVO prkUsageStatusVO);
    PrkUsageStatusVO getUsageStatusDetail(PrkUsageStatusVO prkUsageStatusVO);
    int insertUsageStatus(PrkUsageStatusVO prkUsageStatusVO);
    int updateUsageStatus(PrkUsageStatusVO prkUsageStatusVO);
    int deleteUsageStatus(PrkUsageStatusVO prkUsageStatusVO);
}
