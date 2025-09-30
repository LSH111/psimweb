package com.psim.web.prk.service.impl;

import com.psim.web.prk.mapper.PrkSrvyBizInfoMapper;
import com.psim.web.prk.service.PrkSrvyBizInfoService;
import com.psim.web.prk.vo.PrkSrvyBizInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrkSrvyBizInfoServiceImpl implements PrkSrvyBizInfoService {

    @Autowired
    private PrkSrvyBizInfoMapper prkSrvyBizInfoMapper;

    @Override
    public List<PrkSrvyBizInfoVO> getAllPrkSrvyBizInfos() {
        return prkSrvyBizInfoMapper.selectAllPrkSrvyBizInfos();
    }

    @Override
    public PrkSrvyBizInfoVO getPrkSrvyBizInfoById(Integer bizSurveySn) {
        return prkSrvyBizInfoMapper.selectPrkSrvyBizInfoById(bizSurveySn);
    }

    @Override
    public void addPrkSrvyBizInfo(PrkSrvyBizInfoVO info) {
        prkSrvyBizInfoMapper.insertPrkSrvyBizInfo(info);
    }

    @Override
    public void editPrkSrvyBizInfo(PrkSrvyBizInfoVO info) {
        prkSrvyBizInfoMapper.updatePrkSrvyBizInfo(info);
    }

    @Override
    public void removePrkSrvyBizInfo(Integer bizSurveySn) {
        prkSrvyBizInfoMapper.deletePrkSrvyBizInfo(bizSurveySn);
    }
}
