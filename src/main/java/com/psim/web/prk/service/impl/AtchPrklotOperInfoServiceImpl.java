package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.AtchPrklotOperInfoMapper;
import com.psim.web.prk.service.AtchPrklotOperInfoService;
import com.psim.web.prk.vo.AtchPrklotOperInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AtchPrklotOperInfoServiceImpl implements AtchPrklotOperInfoService {

    @Autowired
    private AtchPrklotOperInfoMapper atchPrklotOperInfoMapper;

    @Override
    public List<AtchPrklotOperInfoVO> getAllAtchPrklotOperInfos() {
        return atchPrklotOperInfoMapper.selectAllAtchPrklotOperInfos();
    }

    @Override
    public AtchPrklotOperInfoVO getAtchPrklotOperInfoById(Integer operInfoSn) {
        return atchPrklotOperInfoMapper.selectAtchPrklotOperInfoById(operInfoSn);
    }

    @Override
    public void addAtchPrklotOperInfo(AtchPrklotOperInfoVO info) {
        atchPrklotOperInfoMapper.insertAtchPrklotOperInfo(info);
    }

    @Override
    public void editAtchPrklotOperInfo(AtchPrklotOperInfoVO info) {
        atchPrklotOperInfoMapper.updateAtchPrklotOperInfo(info);
    }

    @Override
    public void removeAtchPrklotOperInfo(Integer operInfoSn) {
        atchPrklotOperInfoMapper.deleteAtchPrklotOperInfo(operInfoSn);
    }
}
