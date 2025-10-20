package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.OnstrPrklotOperInfoMapper;
import com.psim.web.prk.service.OnstrPrklotOperInfoService;
import com.psim.web.prk.vo.OnstrPrklotOperInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OnstrPrklotOperInfoServiceImpl implements OnstrPrklotOperInfoService {

    @Autowired
    private OnstrPrklotOperInfoMapper onstrPrklotOperInfoMapper;

    @Override
    public List<OnstrPrklotOperInfoVO> getAllOnstrPrklotOperInfos() {
        return onstrPrklotOperInfoMapper.selectAllOnstrPrklotOperInfos();
    }

    @Override
    public OnstrPrklotOperInfoVO getOnstrPrklotOperInfoById(Integer operInfoSn) {
        return onstrPrklotOperInfoMapper.selectOnstrPrklotOperInfoById(operInfoSn);
    }

    @Override
    public void addOnstrPrklotOperInfo(OnstrPrklotOperInfoVO info) {
        onstrPrklotOperInfoMapper.insertOnstrPrklotOperInfo(info);
    }

    @Override
    public void editOnstrPrklotOperInfo(OnstrPrklotOperInfoVO info) {
        onstrPrklotOperInfoMapper.updateOnstrPrklotOperInfo(info);
    }

    @Override
    public void removeOnstrPrklotOperInfo(Integer operInfoSn) {
        onstrPrklotOperInfoMapper.deleteOnstrPrklotOperInfo(operInfoSn);
    }
}
