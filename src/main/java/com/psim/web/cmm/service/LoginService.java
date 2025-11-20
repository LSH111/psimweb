package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoUserVO;

import java.util.List;
import java.util.Map;

public interface LoginService {
    /**
     * 사용자 로그인 처리
     * @param userId 사용자 아이디
     * @param password 비밀번호
     * @return 로그인 성공 시 사용자 정보, 실패 시 null
     */
    CoUserVO login(String userId, String password);

    /**
     * 확장된 로그인 시그니처 (추가 검증값 포함).
     * 기본 구현은 기존 login(id, pw) 호출.
     */
    default CoUserVO login(String userId, String password, String telNo, String certNo) {
        return login(userId, password);
    }

    /**
     * 🔥 사용자가 접근 가능한 사업관리번호 목록 조회
     */
    List<String> selectUserBizList(String srvyId);
}
