package com.psim.web.cmm.service;

/**
 * 로그인 시도 제한 정책 인터페이스.
 * 구현체는 실패 횟수 기록과 잠금/해제를 책임진다.
 */
public interface LoginAttemptPolicy {

    /**
     * 실패를 기록한다. 구현체는 내부적으로 실패 시간도 갱신한다.
     */
    void registerFailure(String userKey);

    /**
     * 성공적으로 인증되었을 때 실패 기록을 초기화한다.
     */
    void reset(String userKey);

    /**
     * 현재 잠금 상태인지 여부를 반환한다.
     */
    boolean isLocked(String userKey);

    /**
     * 현재까지의 실패 횟수를 반환한다.
     */
    int getFailureCount(String userKey);
}
