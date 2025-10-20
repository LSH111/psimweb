package com.psim.web.cmm.service;

public interface PasswordCryptoService {
    /**
     * 평문 비밀번호를 SHA-256 기반으로 해시(솔트 포함)하여 16진 문자열로 반환
     */
    String hash(String plainPassword, String salt);

    /**
     * 평문 비밀번호가 저장된 해시와 일치하는지 검증
     */
    boolean matches(String plainPassword, String salt, String expectedHashHex);
}
