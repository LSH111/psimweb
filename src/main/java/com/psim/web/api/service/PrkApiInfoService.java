package com.psim.web.api.service;

import com.psim.web.api.vo.PrkApiInfoVO;
import java.util.List;

public interface PrkApiInfoService {
    List<PrkApiInfoVO> getAllPrkApiInfos();
    PrkApiInfoVO getPrkApiInfoById(Integer apiInfoSn);
    void addPrkApiInfo(PrkApiInfoVO info);
    void editPrkApiInfo(PrkApiInfoVO info);
    void removePrkApiInfo(Integer apiInfoSn);
}
