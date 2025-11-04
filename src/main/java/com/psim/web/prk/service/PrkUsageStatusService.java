package com.psim.web.prk.service;

import com.psim.web.prk.vo.PrkUsageStatusVO;
import java.util.List;

public interface PrkUsageStatusService {
    public List<PrkUsageStatusVO> getUsageStatusList(PrkUsageStatusVO prkUsageStatusVO);
    public PrkUsageStatusVO getUsageStatusDetail(PrkUsageStatusVO prkUsageStatusVO);
    public int insertUsageStatus(PrkUsageStatusVO prkUsageStatusVO);
    public int updateUsageStatus(PrkUsageStatusVO prkUsageStatusVO);
    public int deleteUsageStatus(PrkUsageStatusVO prkUsageStatusVO);
}
