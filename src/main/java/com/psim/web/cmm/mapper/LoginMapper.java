package com.psim.web.cmm.mapper;

import com.psim.web.cmm.vo.CoUserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface LoginMapper {
    CoUserVO login(@Param("userId") String userId,
                   @Param("password") String password);

    CoUserVO findUserById(String userId);

    /**
     * 🔥 사용자가 접근 가능한 사업관리번호 목록 조회
     * @param srvyId 조사자 ID (user_id)
     * @return 사업관리번호 목록
     */
    List<String> selectUserBizList(@Param("srvyId") String srvyId);

    /**
     * 로그인 인증번호 SMS 발송 요청 기록
     * @param param destInfo, msg 등을 포함한 파라미터
     */
    void sendSms(Map<String, Object> param);

    /**
     * 휴대폰번호로 사용자 조회
     * @param phone 휴대폰 번호
     * @return 사용자 정보(username, phone) 맵
     */
    Map<String, Object> selectUserByPhone(@Param("phone") String phone);
}
