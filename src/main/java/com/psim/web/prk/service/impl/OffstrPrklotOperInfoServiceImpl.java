package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.OffstrPrklotOperInfoMapper;
import com.psim.web.prk.service.OffstrPrklotOperInfoService;
import com.psim.web.prk.vo.OffstrPrklotOperInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OffstrPrklotOperInfoServiceImpl implements OffstrPrklotOperInfoService {

    @Autowired
    private OffstrPrklotOperInfoMapper offstrPrklotOperInfoMapper;

    @Override
    public List<OffstrPrklotOperInfoVO> getAllOffstrPrklotOperInfos() {
        return offstrPrklotOperInfoMapper.selectAllOffstrPrklotOperInfos();
    }

    @Override
    public OffstrPrklotOperInfoVO getOffstrPrklotOperInfoById(Integer operInfoSn) {
        return offstrPrklotOperInfoMapper.selectOffstrPrklotOperInfoById(operInfoSn);
    }

    @Override
    public void addOffstrPrklotOperInfo(OffstrPrklotOperInfoVO info) {
        offstrPrklotOperInfoMapper.insertOffstrPrklotOperInfo(info);
    }

    @Override
    public void editOffstrPrklotOperInfo(OffstrPrklotOperInfoVO info) {
        offstrPrklotOperInfoMapper.updateOffstrPrklotOperInfo(info);
    }

    @Override
    public void removeOffstrPrklotOperInfo(Integer operInfoSn) {
        offstrPrklotOperInfoMapper.deleteOffstrPrklotOperInfo(operInfoSn);
    }
}
