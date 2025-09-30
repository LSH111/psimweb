package com.psim.web.prk.service;

import com.psim.web.prk.vo.OnstrPrklotOperInfoVO;
import java.util.List;

public interface OnstrPrklotOperInfoService {
    List<OnstrPrklotOperInfoVO> getAllOnstrPrklotOperInfos();
    OnstrPrklotOperInfoVO getOnstrPrklotOperInfoById(Integer operInfoSn);
    void addOnstrPrklotOperInfo(OnstrPrklotOperInfoVO info);
    void editOnstrPrklotOperInfo(OnstrPrklotOperInfoVO info);
    void removeOnstrPrklotOperInfo(Integer operInfoSn);
}
