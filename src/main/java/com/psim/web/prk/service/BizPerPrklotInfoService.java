package com.psim.web.prk.service;

import com.psim.web.prk.vo.BizPerPrklotInfoVO;
import java.util.List;

public interface BizPerPrklotInfoService {
    List<BizPerPrklotInfoVO> getAllBizPerPrklotInfos();
    BizPerPrklotInfoVO getBizPerPrklotInfoById(Integer bizInfoSn);
    void addBizPerPrklotInfo(BizPerPrklotInfoVO info);
    void editBizPerPrklotInfo(BizPerPrklotInfoVO info);
    void removeBizPerPrklotInfo(Integer bizInfoSn);
}
