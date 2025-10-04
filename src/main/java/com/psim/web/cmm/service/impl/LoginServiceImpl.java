package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.LoginMapper;
import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    @Autowired
    private LoginMapper loginMapper;

    @Override
    public CoUserVO login(String userId, String password) {
        return loginMapper.login(userId, password);
    }
}
