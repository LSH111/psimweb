package com.psim.web.prk.service;

import com.psim.web.prk.vo.PrkDefPlceInfoVO;

import java.util.List;

public interface PrkDefPlceInfoService {
    List<PrkDefPlceInfoVO> getAllPrkDefPlceInfos();
    PrkDefPlceInfoVO getPrkDefPlceInfoById(Integer prkPlceInfoSn);
    void addPrkDefPlceInfo(PrkDefPlceInfoVO info);
    void editPrkDefPlceInfo(PrkDefPlceInfoVO info);
    void removePrkDefPlceInfo(Integer prkPlceInfoSn);
}
