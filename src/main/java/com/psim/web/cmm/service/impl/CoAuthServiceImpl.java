package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoAuthMapper;
import com.psim.web.cmm.service.CoAuthService;
import com.psim.web.cmm.vo.CoAuthVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CoAuthServiceImpl implements CoAuthService {

    @Autowired
    private CoAuthMapper coAuthMapper;

    @Override
    public List<CoAuthVO> getAllCoAuths() {
        return coAuthMapper.selectAllCoAuths();
    }

    @Override
    public CoAuthVO getCoAuthById(String authCd) {
        return coAuthMapper.selectCoAuthById(authCd);
    }

    @Override
    public void addCoAuth(CoAuthVO auth) {
        coAuthMapper.insertCoAuth(auth);
    }

    @Override
    public void editCoAuth(CoAuthVO auth) {
        coAuthMapper.updateCoAuth(auth);
    }

    @Override
    public void removeCoAuth(String authCd) {
        coAuthMapper.deleteCoAuth(authCd);
    }
}
