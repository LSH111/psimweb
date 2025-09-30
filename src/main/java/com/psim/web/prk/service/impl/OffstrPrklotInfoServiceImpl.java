package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.OffstrPrklotInfoMapper;
import com.psim.web.prk.service.OffstrPrklotInfoService;
import com.psim.web.prk.vo.OffstrPrklotInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OffstrPrklotInfoServiceImpl implements OffstrPrklotInfoService {

    @Autowired
    private OffstrPrklotInfoMapper offstrPrklotInfoMapper;

    @Override
    public List<OffstrPrklotInfoVO> getAllOffstrPrklotInfos() {
        return offstrPrklotInfoMapper.selectAllOffstrPrklotInfos();
    }

    @Override
    public OffstrPrklotInfoVO getOffstrPrklotInfoById(Integer prkPlceInfoSn) {
        return offstrPrklotInfoMapper.selectOffstrPrklotInfoById(prkPlceInfoSn);
    }

    @Override
    public void addOffstrPrklotInfo(OffstrPrklotInfoVO info) {
        offstrPrklotInfoMapper.insertOffstrPrklotInfo(info);
    }

    @Override
    public void editOffstrPrklotInfo(OffstrPrklotInfoVO info) {
        offstrPrklotInfoMapper.updateOffstrPrklotInfo(info);
    }

    @Override
    public void removeOffstrPrklotInfo(Integer prkPlceInfoSn) {
        offstrPrklotInfoMapper.deleteOffstrPrklotInfo(prkPlceInfoSn);
    }
}
