package com.psim.web.api.service.impl;

import com.psim.web.api.mapper.PrkApiInfoMapper;
import com.psim.web.api.service.PrkApiInfoService;
import com.psim.web.api.vo.PrkApiInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrkApiInfoServiceImpl implements PrkApiInfoService {

    @Autowired
    private PrkApiInfoMapper prkApiInfoMapper;

    @Override
    public List<PrkApiInfoVO> getAllPrkApiInfos() {
        return prkApiInfoMapper.selectAllPrkApiInfos();
    }

    @Override
    public PrkApiInfoVO getPrkApiInfoById(Integer apiInfoSn) {
        return prkApiInfoMapper.selectPrkApiInfoById(apiInfoSn);
    }

    @Override
    public void addPrkApiInfo(PrkApiInfoVO info) {
        prkApiInfoMapper.insertPrkApiInfo(info);
    }

    @Override
    public void editPrkApiInfo(PrkApiInfoVO info) {
        prkApiInfoMapper.updatePrkApiInfo(info);
    }

    @Override
    public void removePrkApiInfo(Integer apiInfoSn) {
        prkApiInfoMapper.deletePrkApiInfo(apiInfoSn);
    }
}
