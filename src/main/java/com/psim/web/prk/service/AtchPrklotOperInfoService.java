package com.psim.web.prk.service;

import com.psim.web.prk.vo.AtchPrklotOperInfoVO;

import java.util.List;

public interface AtchPrklotOperInfoService {
    List<AtchPrklotOperInfoVO> getAllAtchPrklotOperInfos();
    AtchPrklotOperInfoVO getAtchPrklotOperInfoById(Integer operInfoSn);
    void addAtchPrklotOperInfo(AtchPrklotOperInfoVO info);
    void editAtchPrklotOperInfo(AtchPrklotOperInfoVO info);
    void removeAtchPrklotOperInfo(Integer operInfoSn);
}
