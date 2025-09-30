package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoAuthTargetMapper;
import com.psim.web.cmm.service.CoAuthTargetService;
import com.psim.web.cmm.vo.CoAuthTargetVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoAuthTargetServiceImpl implements CoAuthTargetService {

    @Autowired
    private CoAuthTargetMapper coAuthTargetMapper;

    @Override
    public List<CoAuthTargetVO> getAllCoAuthTargets() {
        return coAuthTargetMapper.selectAllCoAuthTargets();
    }

    @Override
    public CoAuthTargetVO getCoAuthTargetById(String authCd, String userCd) {
        return coAuthTargetMapper.selectCoAuthTargetById(authCd, userCd);
    }

    @Override
    public void addCoAuthTarget(CoAuthTargetVO authTarget) {
        coAuthTargetMapper.insertCoAuthTarget(authTarget);
    }

    @Override
    public void editCoAuthTarget(CoAuthTargetVO authTarget) {
        coAuthTargetMapper.updateCoAuthTarget(authTarget);
    }

    @Override
    public void removeCoAuthTarget(String authCd, String userCd) {
        coAuthTargetMapper.deleteCoAuthTarget(authCd, userCd);
    }
}
