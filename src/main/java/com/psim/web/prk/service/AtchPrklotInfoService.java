package com.psim.web.prk.service;

import com.psim.web.prk.vo.AtchPrklotInfoVO;
import java.util.List;

public interface AtchPrklotInfoService {
    List<AtchPrklotInfoVO> getAllAtchPrklotInfos();
    AtchPrklotInfoVO getAtchPrklotInfoById(Integer prkPlceInfoSn);
    void addAtchPrklotInfo(AtchPrklotInfoVO info);
    void editAtchPrklotInfo(AtchPrklotInfoVO info);
    void removeAtchPrklotInfo(Integer prkPlceInfoSn);
}
