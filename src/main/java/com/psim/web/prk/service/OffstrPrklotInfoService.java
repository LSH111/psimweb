package com.psim.web.prk.service;

import com.psim.web.prk.vo.OffstrPrklotInfoVO;

import java.util.List;

public interface OffstrPrklotInfoService {
    List<OffstrPrklotInfoVO> getAllOffstrPrklotInfos();
    OffstrPrklotInfoVO getOffstrPrklotInfoById(Integer prkPlceInfoSn);
    void addOffstrPrklotInfo(OffstrPrklotInfoVO info);
    void editOffstrPrklotInfo(OffstrPrklotInfoVO info);
    void removeOffstrPrklotInfo(Integer prkPlceInfoSn);
}
