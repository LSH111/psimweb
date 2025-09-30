package com.psim.web.prk.service;

import com.psim.web.prk.vo.PrkSrvyBizInfoVO;
import java.util.List;

public interface PrkSrvyBizInfoService {
    List<PrkSrvyBizInfoVO> getAllPrkSrvyBizInfos();
    PrkSrvyBizInfoVO getPrkSrvyBizInfoById(Integer bizSurveySn);
    void addPrkSrvyBizInfo(PrkSrvyBizInfoVO info);
    void editPrkSrvyBizInfo(PrkSrvyBizInfoVO info);
    void removePrkSrvyBizInfo(Integer bizSurveySn);
}
