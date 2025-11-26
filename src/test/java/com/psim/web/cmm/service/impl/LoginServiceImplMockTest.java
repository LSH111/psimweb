package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.LoginMapper;
import com.psim.web.cmm.service.LoginAttemptPolicy;
import com.psim.web.cmm.service.PasswordCryptoService;
import com.psim.web.cmm.vo.CoUserVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginServiceImplMockTest {

    @Mock
    private LoginMapper loginMapper;

    @Mock
    private PasswordCryptoService passwordCryptoService;

    private LoginAttemptPolicy loginAttemptPolicy;
    private LoginServiceImpl loginService;

    @BeforeEach
    void setUp() {
        loginAttemptPolicy = new InMemoryLoginAttemptPolicy(2, Duration.ofMillis(500), Clock.systemUTC());
        loginService = new LoginServiceImpl(loginMapper, passwordCryptoService, loginAttemptPolicy);
    }

    @Test
    @DisplayName("최대 실패 횟수를 초과하면 잠금 예외가 발생한다")
    void lockedAfterMaxAttempts() {
        CoUserVO user = new CoUserVO();
        user.setUserPw("hashed");
        when(loginMapper.findUserById("user")).thenReturn(user);
        when(passwordCryptoService.hash("wrong", "user")).thenReturn("bad");

        assertThat(loginAttemptPolicy.getFailureCount("user")).isZero();
        assertThat(loginService.login("user", "wrong")).isNull();
        assertThat(loginAttemptPolicy.getFailureCount("user")).isEqualTo(1);
        loginService.login("user", "wrong");
        assertThat(loginAttemptPolicy.isLocked("user")).isTrue();
        assertThrows(RuntimeException.class, () -> loginService.login("user", "wrong"));
    }

    @Test
    @DisplayName("잠금 시간이 지나면 다시 로그인 가능하다")
    void unlocksAfterCooldown() throws InterruptedException {
        CoUserVO user = new CoUserVO();
        user.setUserPw("hashed");
        when(loginMapper.findUserById("user")).thenReturn(user);
        when(passwordCryptoService.hash("wrong", "user")).thenReturn("bad");
        when(passwordCryptoService.hash("right", "user")).thenReturn("hashed");

        loginService.login("user", "wrong"); // 실패 1회
        loginService.login("user", "wrong"); // 실패 2회 -> 잠금
        assertThrows(RuntimeException.class, () -> loginService.login("user", "wrong"));

        Thread.sleep(600); // lockDuration 500ms 경과

        CoUserVO success = loginService.login("user", "right");
        assertThat(success).isNotNull();
        assertThat(loginAttemptPolicy.isLocked("user")).isFalse();
    }
}
