package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.service.LoginAttemptPolicy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 간단한 인메모리 로그인 시도 제한 정책.
 * - 동시성 안전한 Map 사용
 * - 잠금 지속 시간 경과 시 자동 해제
 * 추후 Redis/DB 기반 구현으로 교체하기 쉽도록 분리됨.
 */
@Component
public class InMemoryLoginAttemptPolicy implements LoginAttemptPolicy {

    private final ConcurrentMap<String, Attempt> attempts = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final Duration lockDuration;
    private final Clock clock;

    public InMemoryLoginAttemptPolicy() {
        this(5, Duration.ofSeconds(900), Clock.systemUTC());
    }

    public InMemoryLoginAttemptPolicy(
            @Value("${security.login.max-attempts:5}") int maxAttempts,
            @Value("${security.login.lock-seconds:900}") long lockSeconds
    ) {
        this(maxAttempts, Duration.ofSeconds(lockSeconds), Clock.systemUTC());
    }

    // 테스트 및 주입용 보조 생성자
    public InMemoryLoginAttemptPolicy(int maxAttempts, Duration lockDuration, Clock clock) {
        this.maxAttempts = maxAttempts;
        this.lockDuration = lockDuration;
        this.clock = clock;
    }

    @Override
    public void registerFailure(String userKey) {
        if (userKey == null) {
            return;
        }
        Instant now = Instant.now(clock);
        attempts.compute(userKey, (k, attempt) -> {
            if (attempt == null) {
                return new Attempt(1, now);
            }
            return new Attempt(attempt.count + 1, now);
        });
    }

    @Override
    public void reset(String userKey) {
        attempts.remove(userKey);
    }

    @Override
    public boolean isLocked(String userKey) {
        Attempt attempt = attempts.get(userKey);
        if (attempt == null) {
            return false;
        }

        // 잠금 기간이 지났으면 기록 제거
        if (Duration.between(attempt.lastFailureAt, Instant.now(clock)).compareTo(lockDuration) > 0) {
            attempts.remove(userKey);
            return false;
        }

        return attempt.count >= maxAttempts;
    }

    @Override
    public int getFailureCount(String userKey) {
        Attempt attempt = attempts.get(userKey);
        return attempt == null ? 0 : attempt.count;
    }

    private static class Attempt {
        private final int count;
        private final Instant lastFailureAt;

        Attempt(int count, Instant lastFailureAt) {
            this.count = count;
            this.lastFailureAt = Objects.requireNonNull(lastFailureAt);
        }
    }
}
