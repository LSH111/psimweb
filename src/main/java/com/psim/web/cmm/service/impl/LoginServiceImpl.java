package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.LoginMapper;
import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.service.PasswordCryptoService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    @Autowired
    private LoginMapper loginMapper;

    @Autowired
    private PasswordCryptoService passwordCryptoService;

    @Override
    public CoUserVO login(String userId, String password) {
        // 사용자 존재 여부 확인
        CoUserVO user = loginMapper.findUserById(userId);
        if (user == null) {
            return null;
        }

        // 비밀번호 해시 후 비교
        String hashedPassword = passwordCryptoService.hash(password, userId);
        
        if (user.getUserPw().equals(hashedPassword)) {
            return user;
        } else {
            return null;
        }
    }
}
