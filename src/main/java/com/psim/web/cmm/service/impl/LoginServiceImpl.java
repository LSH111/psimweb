package com.psim.web.cmm.service.impl;

import com.psim.web.cmm.mapper.LoginMapper;
import com.psim.web.cmm.service.LoginAttemptPolicy;
import com.psim.web.cmm.service.LoginService;
import com.psim.web.cmm.service.PasswordCryptoService;
import com.psim.web.cmm.vo.CoUserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.ui.ModelMap;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginServiceImpl implements LoginService {

    private final LoginMapper loginMapper;
    private final PasswordCryptoService passwordCryptoService;
    private final LoginAttemptPolicy loginAttemptPolicy;
    // 인증번호/발송시각 저장소
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    /*@Override
    public CoUserVO login(String userId, String password) {
        // 1️⃣ 로그인 시도 횟수 체크
        int attempts = loginAttempts.getOrDefault(userId, 0);
        if (attempts >= MAX_ATTEMPTS) {
            throw new RuntimeException("로그인 시도 횟수 초과. 잠시 후 다시 시도해주세요.");
        }

        // 2️⃣ 사용자 존재 여부 확인
        CoUserVO user = loginMapper.findUserById(userId);
        if (user == null) {
            loginAttempts.put(userId, attempts + 1);
            return null;
        }

        // 3️⃣ 비밀번호 검증
        String hashedPassword = passwordCryptoService.hash(password, userId);

        if (user.getUserPw().equals(hashedPassword)) {
            // ✅ 로그인 성공 → 실패 횟수 초기화
            loginAttempts.remove(userId);
            return user;
        } else {
            // ❌ 로그인 실패 → 실패 횟수 증가
            loginAttempts.put(userId, attempts + 1);
            return null;
        }
    }*/
    @Override
    public CoUserVO login(String userId, String password) {
        // 1️⃣ 로그인 시도 횟수 체크
        if (loginAttemptPolicy.isLocked(userId)) {
            throw new RuntimeException("로그인 시도 횟수 초과. 잠시 후 다시 시도해주세요.");
        }

        // 2️⃣ 사용자 존재 여부 확인
        CoUserVO user = loginMapper.findUserById(userId);
        if (user == null) {
            loginAttemptPolicy.registerFailure(userId);
            return null;
        }

        // 3️⃣ 비밀번호 검증
        String hashedPassword = passwordCryptoService.hash(password, userId);

        if (user.getUserPw().equals(hashedPassword)) {
            // ✅ 로그인 성공 → 실패 횟수 초기화
            loginAttemptPolicy.reset(userId);
            return user;
        } else {
            // ❌ 로그인 실패 → 실패 횟수 증가
            loginAttemptPolicy.registerFailure(userId);
            return null;
        }
    }

    /**
     * 🔥 사용자가 접근 가능한 사업관리번호 목록 조회
     */
    @Override
    public List<String> selectUserBizList(String srvyId) {
        return loginMapper.selectUserBizList(srvyId);
    }

    @Override
    public List<String> selectUserBizListByManager(String managerId) {
        return loginMapper.selectUserBizListByLcgMgr(managerId);
    }


    // 인증번호생성
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private String str(Object o) {
        return o == null ? "" : o.toString().trim();
    }

    private String normalizePhone(Object phone) {
        return str(phone).replaceAll("[^0-9]", "");
    }

    public String callCertify(ModelMap modelMap) throws Exception {
        Map<String, Object> param = (Map<String, Object>) modelMap.get("login");
        if (param == null) {
            return "ERROR-001";
        }

        String rawPhone = str(param.get("phone"));
        String usertel = normalizePhone(rawPhone); // login[phone]
        if (usertel.isEmpty()) {
            return "ERROR-001";
        }

        // 2. 사용자 확인 (없어도 발송은 진행, 사용자명만 기본값으로)
        ModelMap checkTelLogin = (ModelMap) modelMap.get("checkTelLogin");
        if (checkTelLogin == null) {
            Map<String, Object> found = loginMapper.selectUserByPhone(usertel);
            if (found != null) {
                checkTelLogin = new ModelMap(found);
                modelMap.addAttribute("checkTelLogin", checkTelLogin);
            }
        }
        log.info("📱 callCertify phone={}, userFound={}", usertel, checkTelLogin != null);

        // 정상 인증 요청
        String code = generateVerificationCode();

        // 코드 저장(정규화 번호 + 원본 번호 모두)
        verificationCodes.put(usertel, code);
        verificationCodes.put(usertel + "T", String.valueOf(System.currentTimeMillis()));
        if (!rawPhone.equals(usertel)) {
            verificationCodes.put(rawPhone, code);
            verificationCodes.put(rawPhone + "T", String.valueOf(System.currentTimeMillis()));
        }

        String username = checkTelLogin != null ? str(checkTelLogin.get("username")) : "";
        if (username.isEmpty()) username = "사용자";
        param.put("destInfo", username + "^" + usertel);
        param.put("msg", "[한국교통안전공단] 본인확인을 위해 인증번호 [" + code + "]를 입력해주세요.");

        // 실제 발송 (현재 운영 발송 미구축 시 테스트 모드로 로그만 남김)
        try {
            log.info("📨 sendSms (TEST MODE) destInfo={}, msg={}", param.get("destInfo"), param.get("msg"));
            // 실제 발송 가능 시 아래 주석 해제
            loginMapper.sendSms(param);
            log.info("📨 sendSms called for phone={}, destInfo={}", usertel, param.get("destInfo"));
        } catch (Exception e) {
            log.error("❌ sendSms failed", e);
            return "ERROR-002";
        }
        // 테스트용: 생성된 코드도 함께 반환(운영 전 발송 미구축 환경에서만 사용)
        log.info("🔐 [TEST MODE] verification code for {} is {}", usertel, code);

        // 프론트는 ERROR-xxx가 아니면 성공으로 처리
        return code;

    }

    //휴대폰 인증코드 비교한다.
    public String checkCertify(ModelMap modelMap) throws Exception {
        Map<String, Object> param = (Map<String, Object>) modelMap.get("login");
        if (param == null) {
            return "ERROR-002";
        }

        String telRaw = str(param.get("tel"));
        String usertel = normalizePhone(telRaw);      // login[tel]
        String certifty = str(param.get("certify"));  // login[certify]

        // 코드 조회: 정규화 번호 우선, 없으면 원본 번호
        String correctCode = verificationCodes.get(usertel);
        String ts = verificationCodes.get(usertel + "T");
        if (correctCode == null || ts == null) {
            correctCode = verificationCodes.get(telRaw);
            ts = verificationCodes.get(telRaw + "T");
        }

        if (correctCode == null || ts == null) {
            return "ERROR-002";
        }

        long startTime = Long.parseLong(ts);
        long elapsed = System.currentTimeMillis() - startTime;
        // 3분 초과 시 만료
        if (elapsed > 3 * 60 * 1000) {
            return "ERROR-002";
        }

        if (!correctCode.equals(certifty)) {
            return "ERROR-001";
        }

        // 성공: 빈 문자열 또는 OK 반환
        return "";
    }
}
