package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.LoginMapper;
import com.psim.web.cmm.service.LoginAttemptPolicy;
import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.service.PasswordCryptoService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final LoginMapper loginMapper;
    private final PasswordCryptoService passwordCryptoService;
    private final LoginAttemptPolicy loginAttemptPolicy;

    /*@Override
    public CoUserVO login(String userId, String password) {
        // 1️⃣ 로그인 시도 횟수 체크
        int attempts = loginAttempts.getOrDefault(userId, 0);
        if (attempts >= MAX_ATTEMPTS) {
            throw new RuntimeException("로그인 시도 횟수 초과. 잠시 후 다시 시도해주세요.");
        }

        // 2️⃣ 사용자 존재 여부 확인
        CoUserVO user = loginMapper.findUserById(userId);
        if (user == null) {
            loginAttempts.put(userId, attempts + 1);
            return null;
        }

        // 3️⃣ 비밀번호 검증
        String hashedPassword = passwordCryptoService.hash(password, userId);

        if (user.getUserPw().equals(hashedPassword)) {
            // ✅ 로그인 성공 → 실패 횟수 초기화
            loginAttempts.remove(userId);
            return user;
        } else {
            // ❌ 로그인 실패 → 실패 횟수 증가
            loginAttempts.put(userId, attempts + 1);
            return null;
        }
    }*/
    @Override
    public CoUserVO login(String userId, String password) {
        // 1️⃣ 로그인 시도 횟수 체크
        if (loginAttemptPolicy.isLocked(userId)) {
            throw new RuntimeException("로그인 시도 횟수 초과. 잠시 후 다시 시도해주세요.");
        }

        // 2️⃣ 사용자 존재 여부 확인
        CoUserVO user = loginMapper.findUserById(userId);
        if (user == null) {
            loginAttemptPolicy.registerFailure(userId);
            return null;
        }

        // 3️⃣ 비밀번호 검증
        String hashedPassword = passwordCryptoService.hash(password, userId);

        if (user.getUserPw().equals(hashedPassword)) {
            // ✅ 로그인 성공 → 실패 횟수 초기화
            loginAttemptPolicy.reset(userId);
            return user;
        } else {
            // ❌ 로그인 실패 → 실패 횟수 증가
            loginAttemptPolicy.registerFailure(userId);
            return null;
        }
    }

    /**
     * 🔥 사용자가 접근 가능한 사업관리번호 목록 조회
     */
    @Override
    public List<String> selectUserBizList(String srvyId) {
        return loginMapper.selectUserBizList(srvyId);
    }
}
