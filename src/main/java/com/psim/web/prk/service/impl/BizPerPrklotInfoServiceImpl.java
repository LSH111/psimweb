package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.BizPerPrklotInfoMapper;
import com.psim.web.prk.service.BizPerPrklotInfoService;
import com.psim.web.prk.vo.BizPerPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BizPerPrklotInfoServiceImpl implements BizPerPrklotInfoService {

    @Autowired
    private BizPerPrklotInfoMapper bizPerPrklotInfoMapper;

    @Override
    public List<BizPerPrklotInfoVO> getAllBizPerPrklotInfos() {
        return bizPerPrklotInfoMapper.selectAllBizPerPrklotInfos();
    }

    @Override
    public BizPerPrklotInfoVO getBizPerPrklotInfoById(Integer bizInfoSn) {
        return bizPerPrklotInfoMapper.selectBizPerPrklotInfoById(bizInfoSn);
    }

    @Override
    public void addBizPerPrklotInfo(BizPerPrklotInfoVO info) {
        bizPerPrklotInfoMapper.insertBizPerPrklotInfo(info);
    }

    @Override
    public void editBizPerPrklotInfo(BizPerPrklotInfoVO info) {
        bizPerPrklotInfoMapper.updateBizPerPrklotInfo(info);
    }

    @Override
    public void removeBizPerPrklotInfo(Integer bizInfoSn) {
        bizPerPrklotInfoMapper.deleteBizPerPrklotInfo(bizInfoSn);
    }
}
