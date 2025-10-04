<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <jsp:include page="/WEB-INF/views/fragments/_head.jspf"/>
    <title>로그인</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/ts_login.css"/>
</head>
<body>
<jsp:include page="/WEB-INF/views/fragments/_header.jspf"/>

<main class="main container" role="main" aria-labelledby="title">
    <div class="card">
        <div class="header">
            <div class="logo" aria-hidden="true">TS</div>
            <div>
                <h1 id="title">로그인</h1>
                <p class="sub">아이디 → 비밀번호 → (SMS)인증 → 로그인</p>
            </div>
        </div>

        <div class="banner">
            <strong>테스트:</strong> <code>아이디 demo</code>, <code>비번 demo1234</code>, <code>OTP 123456</code>
        </div>

        <form id="loginForm" method="POST" action="<c:url value='/login'/>">
            <!-- 1) 아이디 (오른쪽에 다음 버튼) -->
            <section id="secId" class="step" aria-labelledby="step1-title">
                <h2 id="step1-title" class="sr-only">아이디 입력</h2>
                <div class="field">
                    <label for="loginId">아이디</label>
                    <div class="control inline-actions">
                        <input id="loginId" class="input" type="text" autocomplete="username"
                               placeholder="아이디를 입력하세요" minlength="4" maxlength="32"
                               pattern="[A-Za-z0-9._\\-]{4,32}" required />
                        <button id="nextIdBtn" class="btn" type="button">다음</button>
                    </div>
                    <span class="hint">영문/숫자/.-_ 4~32자</span>
                </div>
                <div id="idErr" class="error hide" aria-live="polite"></div>
            </section>

            <!-- 2) 비밀번호 (아이디 아래에 펼침, 여기서는 검증하지 않음) -->
            <section id="secPw" class="step hide" aria-labelledby="step2-title">
                <h2 id="step2-title" class="sr-only">비밀번호 입력</h2>
                <div class="field">
                    <label for="password">비밀번호</label>
                    <div class="control inline-actions">
                        <input id="password" class="input" type="password" autocomplete="current-password"
                               minlength="8" placeholder="••••••••" required />
                        <button class="link" type="button" id="togglePw" aria-label="비밀번호 표시 전환">표시</button>
                        <button id="nextPwBtn" class="btn" type="button">다음</button>
                    </div>
                    <span class="hint">최소 8자 이상</span>
                </div>
                <div id="pwErr" class="error hide" aria-live="polite"></div>
            </section>

            <!-- 3) 휴대폰 & OTP (비밀번호 아래에 펼침, OTP는 반드시 검증) -->
            <section id="secPhone" class="step hide" aria-labelledby="step3-title">
                <h2 id="step3-title" class="sr-only">휴대폰 번호 입력</h2>

                <div class="field">
                    <label for="phone">인증 받을 휴대폰 번호</label>
                    <div class="control inline-actions">
                        <input id="phone" class="input mono" type="text" inputmode="numeric" maxlength="11"
                               placeholder="숫자만 입력 (예: 01012345678)" required />
                        <button id="sendOtpBtn" class="btn" type="button">인증코드 전송</button>
                    </div>
                    <span class="hint">숫자만 입력하세요. (하이픈은 서버 표시용 처리 권장)</span>
                </div>

                <div id="otpBox" class="field hide" aria-live="polite">
                    <label for="otp">인증코드 (6자리)</label>
                    <div class="otp-grid">
                        <div class="control">
                            <input id="otp" class="input mono" type="text" inputmode="numeric"
                                   pattern="\\d{6}" maxlength="6" placeholder="______" aria-describedby="otpHint"/>
                        </div>
                        <button id="resendBtn" class="link" type="button" disabled>재전송(60)</button>
                    </div>
                    <span id="otpHint" class="hint">유효시간 <span id="timer" class="mono">02:00</span></span>
                </div>

                <div id="otpErr" class="error hide" aria-live="polite"></div>
                <div id="otpOk" class="ok hide" aria-live="polite">인증코드 확인 완료.</div>
            </section>

            <!-- 4) 최종 로그인 (OTP 성공해야 활성화) -->
            <section id="secFinal" class="step hide" aria-labelledby="step4-title">
                <h2 id="step4-title" class="sr-only">최종 로그인</h2>
                <div id="finalErr" class="error hide" aria-live="polite"></div>
                <div class="row" style="justify-content:flex-end; margin-top:12px;">
                    <button id="finalLoginBtn" class="btn" type="button" disabled>로그인</button>
                </div>
            </section>
        </form>
    </div>
</main>

<jsp:include page="/WEB-INF/views/fragments/_footer.jspf"/>

<script>
    const $ = (s)=>document.querySelector(s);
    const delay = (ms)=>new Promise(r=>setTimeout(r,ms));

    // 섹션/요소
    const secPw = $('#secPw');
    const secPhone = $('#secPhone');
    const secFinal = $('#secFinal');

    const loginId = $('#loginId');
    const nextIdBtn = $('#nextIdBtn');
    const idErr = $('#idErr');

    const pw = $('#password');
    const togglePw = $('#togglePw');
    const nextPwBtn = $('#nextPwBtn');
    const pwErr = $('#pwErr');

    const phone = $('#phone');
    const sendOtpBtn = $('#sendOtpBtn');
    const otpBox = $('#otpBox');
    const otp = $('#otp');
    const resendBtn = $('#resendBtn');
    const timerEl = $('#timer');
    const otpErr = $('#otpErr');
    const otpOk = $('#otpOk');

    const finalLoginBtn = $('#finalLoginBtn');
    const finalErr = $('#finalErr');

    // 상태
    let otpSent = false;
    let otpVerified = false;
    let lastSendTs = 0;
    let otpExpireAt = 0;
    let countdown = null;

    // 데모 자격증명
    const TEST_ID = 'demo';
    const TEST_PW = 'demo1234';
    const TEST_OTP = '123456';

    // 메세지 유틸
    function show(el, msg){ if(!el) return; el.textContent = msg ?? el.textContent; el.classList.remove('hide'); }
    function hide(el){ if(!el) return; el.classList.add('hide'); el.textContent = ''; }

    // 1) 다음(아이디) — 검증 없이 아래 섹션 펼치기
    nextIdBtn.addEventListener('click', ()=>{
        hide(idErr);
        secPw.classList.remove('hide');   // ▼ 비밀번호 영역 펼침
        pw.focus();
    });

    // 2) 비밀번호 표시 토글
    togglePw.addEventListener('click', ()=>{
        const isPw = pw.type === 'password';
        pw.type = isPw ? 'text' : 'password';
        togglePw.textContent = isPw ? '숨김' : '표시';
        pw.focus();
    });

    // 3) 다음(비밀번호) — 검증 없이 아래 섹션 펼치기
    nextPwBtn.addEventListener('click', ()=>{
        hide(pwErr);
        secPhone.classList.remove('hide'); // ▼ 휴대폰/OTP 영역 펼침
        phone.focus();
    });

    // 전화번호 숫자만
    phone.addEventListener('input', ()=>{
        phone.value = phone.value.replace(/\\D/g,'').slice(0,11);
    });

    // 타이머
    function startTimer(sec){
        otpExpireAt = Date.now() + sec*1000;
        if(countdown) clearInterval(countdown);
        updateTimer();
        countdown = setInterval(updateTimer, 250);
    }
    function updateTimer(){
        const remain = Math.max(0, Math.floor((otpExpireAt - Date.now())/1000));
        const mm = String(Math.floor(remain/60)).padStart(2,'0');
        const ss = String(remain%60).padStart(2,'0');
        if(timerEl) timerEl.textContent = mm + ':' + ss;
        if(remain===0){
            clearInterval(countdown);
            resendBtn.disabled = false;
            otpVerified = false;
            finalLoginBtn.disabled = true;
            show(otpErr, '인증코드 유효시간이 만료되었습니다. 재전송하세요.');
            hide(otpOk);
        }
    }

    // OTP 전송 (전화번호는 최소 자리수만 확인)
    sendOtpBtn.addEventListener('click', async ()=>{
        hide(otpErr); hide(otpOk);
        const now = Date.now();
        if(!phone.value || phone.value.length < 10){
            return show(otpErr, '휴대폰 번호(숫자만)를 정확히 입력하세요.');
        }
        if(now - lastSendTs < 30000){
            const left = Math.ceil((30000 - (now-lastSendTs))/1000);
            return show(otpErr, `잠시 후 다시 시도하세요. (${left}s)`);
        }
        await delay(150); // demo
        lastSendTs = now;
        otpSent = true;
        otpVerified = false;
        finalLoginBtn.disabled = true;
        otpBox.classList.remove('hide');
        resendBtn.disabled = true;
        otp.value = '';
        startTimer(120);
        otp.focus();
        show(otpOk, '인증코드를 전송했습니다. (테스트: 123456)');
    });

    // 재전송
    resendBtn.addEventListener('click', ()=> sendOtpBtn.click());

    // OTP 입력 & 검증(필수)
    otp.addEventListener('input', async ()=>{
        hide(otpErr); hide(otpOk);
        otp.value = otp.value.replace(/\\D/g,'').slice(0,6);
        if(otp.value.length === 6){
            await delay(120);
            if(otp.value === TEST_OTP){
                otpVerified = true;
                if(countdown) clearInterval(countdown);
                resendBtn.disabled = false;
                show(otpOk, '인증코드 확인 완료.');
                secFinal.classList.remove('hide');  // ▼ 최종 로그인 영역 펼침
                finalLoginBtn.disabled = false;     // OTP 성공 시에만 활성화
            } else {
                otpVerified = false;
                show(otpErr, '인증코드가 올바르지 않습니다. (테스트: 123456)');
                finalLoginBtn.disabled = true;
            }
        } else {
            otpVerified = false;
            finalLoginBtn.disabled = true;
        }
    });

    // 최종 로그인: 여기서만 아이디/비밀번호 검증 수행
    finalLoginBtn.addEventListener('click', ()=>{
        hide(finalErr); hide(idErr); hide(pwErr);

        // 필수 입력 간단 체크
        if(!loginId.value){ show(idErr, '아이디를 입력하세요.'); loginId.focus(); return; }
        if(!pw.value){ show(pwErr, '비밀번호를 입력하세요.'); pw.focus(); return; }
        if(!otpVerified){ show(finalErr, '인증코드를 먼저 확인하세요.'); return; }

        // 모두 통과 시 폼 전송
        finalLoginBtn.disabled = true;
        finalLoginBtn.textContent = '로그인 중…';
        loginForm.submit();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const finalErrEl = $('#finalErr');
        // 서버에서 전달된 에러 메시지가 있으면 화면에 표시합니다.
        if (finalErrEl && finalErrEl.textContent.trim()) {
            secPw.classList.remove('hide');
            secPhone.classList.remove('hide');
            secFinal.classList.remove('hide');
            finalErrEl.classList.remove('hide');
        }
    });
</script>
</body>
</html>