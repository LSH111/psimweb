package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.AtchPrklotInfoMapper;
import com.psim.web.prk.service.AtchPrklotInfoService;
import com.psim.web.prk.vo.AtchPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AtchPrklotInfoServiceImpl implements AtchPrklotInfoService {

    @Autowired
    private AtchPrklotInfoMapper atchPrklotInfoMapper;

    @Override
    public List<AtchPrklotInfoVO> getAllAtchPrklotInfos() {
        return atchPrklotInfoMapper.selectAllAtchPrklotInfos();
    }

    @Override
    public AtchPrklotInfoVO getAtchPrklotInfoById(Integer prkPlceInfoSn) {
        return atchPrklotInfoMapper.selectAtchPrklotInfoById(prkPlceInfoSn);
    }

    @Override
    public void addAtchPrklotInfo(AtchPrklotInfoVO info) {
        atchPrklotInfoMapper.insertAtchPrklotInfo(info);
    }

    @Override
    public void editAtchPrklotInfo(AtchPrklotInfoVO info) {
        atchPrklotInfoMapper.updateAtchPrklotInfo(info);
    }

    @Override
    public void removeAtchPrklotInfo(Integer prkPlceInfoSn) {
        atchPrklotInfoMapper.deleteAtchPrklotInfo(prkPlceInfoSn);
    }
}
