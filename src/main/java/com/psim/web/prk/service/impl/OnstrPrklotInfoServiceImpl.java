package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.OnstrPrklotInfoMapper;
import com.psim.web.prk.service.OnstrPrklotInfoService;
import com.psim.web.prk.vo.OnstrPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OnstrPrklotInfoServiceImpl implements OnstrPrklotInfoService {

    @Autowired
    private OnstrPrklotInfoMapper onstrPrklotInfoMapper;

    @Override
    public List<OnstrPrklotInfoVO> getAllOnstrPrklotInfos() {
        return onstrPrklotInfoMapper.selectAllOnstrPrklotInfos();
    }

    @Override
    public OnstrPrklotInfoVO getOnstrPrklotInfoById(Integer prkPlceInfoSn) {
        return onstrPrklotInfoMapper.selectOnstrPrklotInfoById(prkPlceInfoSn);
    }

    @Override
    public void addOnstrPrklotInfo(OnstrPrklotInfoVO info) {
        onstrPrklotInfoMapper.insertOnstrPrklotInfo(info);
    }

    @Override
    public void editOnstrPrklotInfo(OnstrPrklotInfoVO info) {
        onstrPrklotInfoMapper.updateOnstrPrklotInfo(info);
    }

    @Override
    public void removeOnstrPrklotInfo(Integer prkPlceInfoSn) {
        onstrPrklotInfoMapper.deleteOnstrPrklotInfo(prkPlceInfoSn);
    }
}
