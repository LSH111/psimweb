package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoUserVO;

public interface LoginService {
    /**
     * 사용자 로그인 처리
     * @param userId 사용자 아이디
     * @param password 비밀번호
     * @return 로그인 성공 시 사용자 정보, 실패 시 null
     */
    CoUserVO login(String userId, String password);
}
