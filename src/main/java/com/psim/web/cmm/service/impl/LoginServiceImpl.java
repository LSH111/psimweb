package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.CoUserMapper;
import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final CoUserMapper coUserMapper;

    @Override
    public CoUserVO login(String userId, String password) {
        // 1. 사용자 아이디로 사용자 정보 조회
        CoUserVO user = coUserMapper.selectCoUserById(userId);

        // 2. 사용자 정보가 있고, 비밀번호가 일치하는지 확인
        // 주의: 실제 운영 환경에서는 반드시 비밀번호를 암호화하여 비교해야 합니다.
        if (user != null && user.getUserPw().equals(password)) {
            return user;
        }

        return null;
    }
}
