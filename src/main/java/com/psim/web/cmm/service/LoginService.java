package com.psim.web.cmm.service;

import com.psim.web.cmm.vo.CoUserVO;
import org.springframework.ui.ModelMap;

import java.util.List;

public interface LoginService {
    /**
     * 사용자 로그인 처리
     *
     * @param userId   사용자 아이디
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

    /**
     * 🔥 지방자치단체 담당자(lcgv_mgr_id) 기준 사업목록 조회
     */
    List<String> selectUserBizListByManager(String managerId);

    /**
     * 휴대폰 인증번호 발송 요청
     *
     * @param modelMap login[phone] 등을 포함한 모델맵
     * @return 인증코드(성공) 또는 ERROR-xxx
     */
    String callCertify(ModelMap modelMap) throws Exception;

    /**
     * 휴대폰 인증번호 검증
     *
     * @param modelMap login[tel], login[certify] 등을 포함한 모델맵
     * @return ""/OK(성공) 또는 ERROR-xxx
     */
    String checkCertify(ModelMap modelMap) throws Exception;
}
