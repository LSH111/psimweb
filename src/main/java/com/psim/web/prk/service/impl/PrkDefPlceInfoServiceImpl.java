package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkDefPlceInfoMapper;
import com.psim.web.prk.service.PrkDefPlceInfoService;
import com.psim.web.prk.vo.PrkDefPlceInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrkDefPlceInfoServiceImpl implements PrkDefPlceInfoService {

    @Autowired
    private PrkDefPlceInfoMapper prkDefPlceInfoMapper;

    @Override
    public List<PrkDefPlceInfoVO> getAllPrkDefPlceInfos() {
        return prkDefPlceInfoMapper.selectAllPrkDefPlceInfos();
    }

    @Override
    public PrkDefPlceInfoVO getPrkDefPlceInfoById(Integer prkPlceInfoSn) {
        return prkDefPlceInfoMapper.selectPrkDefPlceInfoById(prkPlceInfoSn);
    }

    @Override
    public void addPrkDefPlceInfo(PrkDefPlceInfoVO info) {
        prkDefPlceInfoMapper.insertPrkDefPlceInfo(info);
    }

    @Override
    public void editPrkDefPlceInfo(PrkDefPlceInfoVO info) {
        prkDefPlceInfoMapper.updatePrkDefPlceInfo(info);
    }

    @Override
    public void removePrkDefPlceInfo(Integer prkPlceInfoSn) {
        prkDefPlceInfoMapper.deletePrkDefPlceInfo(prkPlceInfoSn);
    }
}
