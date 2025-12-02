package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.service.PasswordCryptoService;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class PasswordCryptoServiceImpl implements PasswordCryptoService {

    @Override
    public String hash(String plainPassword, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            // 솔트 + 비밀번호 결합
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] digest = md.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            // Base64 인코딩으로 변경
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 해시 생성 실패", e);
        }
    }

    @Override
    public boolean matches(String plainPassword, String salt, String expectedHashHex) {
        String calc = hash(plainPassword, salt);
        return constantTimeEquals(calc, expectedHashHex);
    }

    // 타이밍 공격 방어용 비교
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int res = 0;
        for (int i = 0; i < a.length(); i++) {
            res |= a.charAt(i) ^ b.charAt(i);
        }
        return res == 0;
    }
}
