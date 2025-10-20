package com.psim.web.api.service.impl;

import com.psim.web.api.mapper.PrkApiKeyInfoMapper;
import com.psim.web.api.service.PrkApiKeyInfoService;
import com.psim.web.api.vo.PrkApiKeyInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrkApiKeyInfoServiceImpl implements PrkApiKeyInfoService {

    @Autowired
    private PrkApiKeyInfoMapper prkApiKeyInfoMapper;

    @Override
    public List<PrkApiKeyInfoVO> getAllPrkApiKeyInfos() {
        return prkApiKeyInfoMapper.selectAllPrkApiKeyInfos();
    }

    @Override
    public PrkApiKeyInfoVO getPrkApiKeyInfoById(Integer apiKeySn) {
        return prkApiKeyInfoMapper.selectPrkApiKeyInfoById(apiKeySn);
    }

    @Override
    public void addPrkApiKeyInfo(PrkApiKeyInfoVO info) {
        prkApiKeyInfoMapper.insertPrkApiKeyInfo(info);
    }

    @Override
    public void editPrkApiKeyInfo(PrkApiKeyInfoVO info) {
        prkApiKeyInfoMapper.updatePrkApiKeyInfo(info);
    }

    @Override
    public void removePrkApiKeyInfo(Integer apiKeySn) {
        prkApiKeyInfoMapper.deletePrkApiKeyInfo(apiKeySn);
    }
}
