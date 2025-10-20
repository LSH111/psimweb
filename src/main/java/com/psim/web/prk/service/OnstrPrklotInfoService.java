package com.psim.web.prk.service;

import com.psim.web.prk.vo.OnstrPrklotInfoVO;

import java.util.List;

public interface OnstrPrklotInfoService {
    List<OnstrPrklotInfoVO> getAllOnstrPrklotInfos();
    OnstrPrklotInfoVO getOnstrPrklotInfoById(Integer prkPlceInfoSn);
    void addOnstrPrklotInfo(OnstrPrklotInfoVO info);
    void editOnstrPrklotInfo(OnstrPrklotInfoVO info);
    void removeOnstrPrklotInfo(Integer prkPlceInfoSn);
}
