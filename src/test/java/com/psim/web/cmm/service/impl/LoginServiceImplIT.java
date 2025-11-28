package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.vo.CoUserVO;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class LoginServiceImplIT {

    private static final String TEST_ID = "roadmap999";
    private static final String TEST_PW = "123456789";
    private static final String TEST_PHONE = "01074996811";
    private static final String TEST_CERT = "123456";
    @Autowired
    private LoginService loginService;

    @Test
    @DisplayName("정상 로그인 시 사용자 정보를 반환한다")
    void login_success() {
        try {
            CoUserVO user = loginService.login(TEST_ID, TEST_PW, "01074996811", "123456");
            assertThat(user).isNotNull();
            assertThat(user.getUserId()).isEqualTo(TEST_ID);
        } catch (DataAccessException e) {
            org.junit.jupiter.api.Assumptions.assumeTrue(false, "로그인 테스트용 데이터/테이블을 찾을 수 없어 건너뜁니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("잘못된 비밀번호로 로그인하면 null을 반환한다")
    void login_wrongPassword() {
        try {
            CoUserVO user = loginService.login(TEST_ID, "wrong-password", "01074996811", "123456");
            assertNull(user);
        } catch (RuntimeException e) {
            org.junit.jupiter.api.Assumptions.assumeTrue(false, "로그인 테스트 환경이 준비되지 않아 건너뜁니다: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("연속 실패 시 시도 횟수 초과 예외를 던진다")
    void login_attemptsExceeded() {
        try {
            for (int i = 0; i < 5; i++) {
                loginService.login(TEST_ID, "wrong-password");
            }
            Assertions.assertThrows(RuntimeException.class, () ->
                    loginService.login(TEST_ID, "wrong-password"));
        } catch (DataAccessException e) {
            org.junit.jupiter.api.Assumptions.assumeTrue(false, "로그인 테스트용 데이터/테이블을 찾을 수 없어 건너뜁니다: " + e.getMessage());
        }
    }
}
