package com.psim.web.prk.service;

import com.psim.web.prk.vo.OffstrPrklotOperInfoVO;
import java.util.List;

public interface OffstrPrklotOperInfoService {
    List<OffstrPrklotOperInfoVO> getAllOffstrPrklotOperInfos();
    OffstrPrklotOperInfoVO getOffstrPrklotOperInfoById(Integer operInfoSn);
    void addOffstrPrklotOperInfo(OffstrPrklotOperInfoVO info);
    void editOffstrPrklotOperInfo(OffstrPrklotOperInfoVO info);
    void removeOffstrPrklotOperInfo(Integer operInfoSn);
}
