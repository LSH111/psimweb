<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <title>로그인</title>
    <link rel="icon" href="${pageContext.request.contextPath}/static/favicon.ico"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/pages/ts_login.css"/>
    <!-- KRDS Design System -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/token/krds_tokens.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/common/common.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/component/component.css"/>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/krds/component/output.css"/>
</head>
<body class="krds-body">
<main class="main container krds-container" role="main" aria-labelledby="title">
    <div class="card krds-card">
        <div class="header krds-header">
            <div class="logo" aria-hidden="true">TS</div>
            <div>
                <h1 id="title" class="krds-title">로그인</h1>
                <p class="sub">아이디 → 비밀번호 → (SMS)인증 → 로그인</p>
            </div>
        </div>
<form id="loginForm" method="POST" action="<c:url value='/login'/>" class="krds-form">
            <!-- 1) 아이디 (오른쪽에 다음 버튼) -->
            <section id="secId" class="step krds-form__section" aria-labelledby="step1-title">
                <h2 id="step1-title" class="sr-only">아이디 입력</h2>
                <div class="field krds-form__item">
                    <label for="loginId" class="form-label">아이디</label>
                    <div class="control inline-actions">
                        <input id="loginId" name="userId" class="input form-input" type="text" autocomplete="username"
                               placeholder="아이디를 입력하세요" minlength="4" maxlength="32"
                               pattern="[A-Za-z0-9._\\-]{4,32}" required />
                        <button id="nextIdBtn" class="btn btn-primary" type="button">다음</button>
                    </div>
                    <span class="hint">영문/숫자/.-_ 4~32자</span>
                </div>
                <div id="idErr" class="error hide" aria-live="polite"></div>
            </section>

            <!-- 2) 비밀번호 (아이디 아래에 펼침, 여기서는 검증하지 않음) -->
            <section id="secPw" class="step hide krds-form__section" aria-labelledby="step2-title">
                <h2 id="step2-title" class="sr-only">비밀번호 입력</h2>
                <div class="field krds-form__item">
                    <label for="password" class="form-label">비밀번호</label>
                    <div class="control inline-actions">
                        <input id="password" name="password" class="input form-input" type="password" autocomplete="current-password"
                               minlength="8" placeholder="••••••••" required />
                        <button class="link" type="button" id="togglePw" aria-label="비밀번호 표시 전환">표시</button>
                        <button id="nextPwBtn" class="btn btn-secondary" type="button">다음</button>
                    </div>
                    <span class="hint">최소 8자 이상</span>
                </div>
                <div id="pwErr" class="error hide" aria-live="polite"></div>
            </section>

            <!-- 3) 휴대폰 & OTP (비밀번호 아래에 펼침, OTP는 반드시 검증) -->
            <section id="secPhone" class="step hide krds-form__section" aria-labelledby="step3-title">
                <h2 id="step3-title" class="sr-only">휴대폰 번호 입력</h2>

                <div class="field krds-form__item">
                    <label for="phone" class="form-label">인증 받을 휴대폰 번호</label>
                    <div class="control inline-actions">
                        <input id="phone" class="input form-input mono" type="text" inputmode="numeric" maxlength="11"
                               placeholder="숫자만 입력 (예: 01012345678)" required />
                        <button id="sendOtpBtn" class="btn btn-primary" type="button">인증코드 전송</button>
                    </div>
                    <span class="hint">숫자만 입력하세요. (하이픈은 서버 표시용 처리 권장)</span>
                </div>

                <div id="otpBox" class="field hide krds-form__item" aria-live="polite">
                    <label for="otp" class="form-label">인증코드 (6자리)</label>
                    <div class="otp-grid">
                        <div class="control">
                            <input id="otp" class="input form-input mono" type="text" inputmode="numeric"
                                   pattern="\\d{6}" maxlength="6" placeholder="______" aria-describedby="otpHint"/>
                        </div>
                        <div class="control inline-actions">
                            <button id="otpConfirmBtn" class="btn btn-primary" type="button" disabled>확인</button>
                            <button id="resendBtn" class="btn btn-secondary" type="button" disabled>재전송(60)</button>
                        </div>
                    </div>
                    <span id="otpHint" class="hint">유효시간 <span id="timer" class="mono">02:00</span></span>
                </div>

                <div id="otpErr" class="error hide" aria-live="polite"></div>
                <div id="otpOk" class="ok hide" aria-live="polite">인증코드 확인 완료.</div>
            </section>

            <!-- 4) 최종 로그인 (OTP 성공해야 활성화) -->
            <section id="secFinal" class="step hide krds-form__section" aria-labelledby="step4-title">
                <h2 id="step4-title" class="sr-only">최종 로그인</h2>
                <div id="finalErr" class="error hide" aria-live="polite"><c:out value="${finalErr}"/></div>
                <div class="row" style="justify-content:flex-end; margin-top:12px;">
                    <button id="finalLoginBtn" class="btn btn-primary btn-lg" type="button" disabled>로그인</button>
                </div>
            </section>
            <input type="hidden" id="otpVerifiedFlag" name="otpVerifiedFlag" value="N"/>
        </form>
    </div>
</main>

<jsp:include page="/WEB-INF/views/fragments/footer.jsp"/>

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
    const otpConfirmBtn = $('#otpConfirmBtn');
    const resendBtn = $('#resendBtn');
    const timerEl = $('#timer');
    const otpErr = $('#otpErr');
    const otpOk = $('#otpOk');

    const finalLoginBtn = $('#finalLoginBtn');
    const finalErr = $('#finalErr');
    const otpVerifiedFlag = $('#otpVerifiedFlag');

    // 상태
    let otpSent = false;
    let otpVerified = false;
    let lastSendTs = 0;
    let otpExpireAt = 0;
    let countdown = null;

    // 메세지 유틸
    function show(el, msg){ if(!el) return; el.textContent = msg ?? el.textContent; el.classList.remove('hide'); }
    function hide(el){ if(!el) return; el.classList.add('hide'); el.textContent = ''; }

    const ERROR_MSG = {
        'ERROR-001': '인증 정보가 올바르지 않습니다. 다시 시도해 주세요.',
        'ERROR-002': '인증 가능 시간이 지났거나 요청이 잘못되었습니다. 재전송 후 다시 시도해 주세요.'
    };

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
            otpConfirmBtn.disabled = true;
            otpVerified = false;
            otpVerifiedFlag.value = 'N';
            finalLoginBtn.disabled = true;
            show(otpErr, '인증코드 유효시간이 만료되었습니다. 재전송하세요.');
            hide(otpOk);
        }
    }

    // 공통: fetch wrapper
    const postForm = (url, dataObj) => {
        const body = new URLSearchParams();
        Object.entries(dataObj).forEach(([k,v]) => body.append(k, v ?? ''));
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            credentials: 'same-origin',
            body
        }).then(res => res.text());
    };

    // OTP 전송
    sendOtpBtn.addEventListener('click', async ()=>{
        hide(otpErr); hide(otpOk);
        const now = Date.now();
        const tel = phone.value.trim();
        if(!tel || tel.length < 10){
            return show(otpErr, '휴대폰 번호(숫자만)를 정확히 입력하세요.');
        }
        if(now - lastSendTs < 5000){
            const left = Math.ceil((5000 - (now-lastSendTs))/1000);
            return show(otpErr, `잠시 후 다시 시도하세요. (${left}s)`);
        }
        lastSendTs = now;
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = '전송 중...';
        try {
            const resp = (await postForm('login/callCertify', {'login[phone]': tel})).trim();
            sendOtpBtn.textContent = '인증코드 전송';
            sendOtpBtn.disabled = false;

            if(resp.startsWith('ERROR')) {
                const msg = ERROR_MSG[resp] || '인증번호 요청에 실패했습니다.';
                return show(otpErr, msg);
            }
            // 정상: 숫자 코드 (테스트 환경에서 화면에 표시)
            otpSent = true;
            otpVerified = false;
            otpVerifiedFlag.value = 'N';
            finalLoginBtn.disabled = true;
            otpBox.classList.remove('hide');
            resendBtn.disabled = true;
            otpConfirmBtn.disabled = true;
            otp.value = '';
            startTimer(180); // 3분
            otp.focus();
            const respDigits = (resp || '').replace(/[^0-9]/g, '');
            const codeToShow = respDigits.length >= 4 ? respDigits : (resp || '코드 수신 실패');
            show(otpOk, `인증코드를 전송했습니다. (테스트용 코드: ${codeToShow}) 도착한 코드를 입력하세요.`);
            // 테스트용 코드 노출 (운영 전 실제 발송 미구축 시)
            const testCodeEl = document.getElementById('testCode');
            if (testCodeEl) {
                testCodeEl.textContent = codeToShow;
                testCodeEl.classList.remove('hide');
            }
            console.log('TEST CODE:', resp);
        } catch (e) {
            sendOtpBtn.textContent = '인증코드 전송';
            sendOtpBtn.disabled = false;
            show(otpErr, '네트워크 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
        }
    });

    // 재전송
    resendBtn.addEventListener('click', ()=> sendOtpBtn.click());

    // OTP 입력 시 버튼 활성/비활성
    otp.addEventListener('input', ()=>{
        hide(otpErr); hide(otpOk);
        otp.value = otp.value.replace(/\\D/g,'').slice(0,6);
        otpConfirmBtn.disabled = otp.value.length !== 6;
        otpVerified = false;
        otpVerifiedFlag.value = 'N';
        finalLoginBtn.disabled = true;
    });

    // OTP 확인
    otpConfirmBtn.addEventListener('click', async ()=>{
        hide(otpErr); hide(otpOk);
        const tel = phone.value.trim();
        const code = otp.value.trim();
        if(code.length !== 6){
            return show(otpErr, '인증코드 6자리를 모두 입력하세요.');
        }
        otpConfirmBtn.disabled = true;
        otpConfirmBtn.textContent = '확인 중...';
        try {
            const resp = (await postForm('login/checkCertify', {
                'login[tel]': tel,
                'login[certify]': code
            })).trim();
            otpConfirmBtn.textContent = '확인';
            otpConfirmBtn.disabled = false;

            if(resp === '' || resp.toUpperCase() === 'OK') {
                otpVerified = true;
                otpVerifiedFlag.value = 'Y';
                if(countdown) clearInterval(countdown);
                resendBtn.disabled = false;
                show(otpOk, '인증코드 확인 완료.');
                secFinal.classList.remove('hide');  // ▼ 최종 로그인 영역 펼침
                finalLoginBtn.disabled = false;     // OTP 성공 시에만 활성화
                hide(otpErr);
                return;
            }
            if(resp.startsWith('ERROR')) {
                const msg = ERROR_MSG[resp] || '인증코드가 올바르지 않거나 만료되었습니다.';
                otpVerified = false;
                otpVerifiedFlag.value = 'N';
                finalLoginBtn.disabled = true;
                return show(otpErr, msg);
            }
            // 알 수 없는 응답
            otpVerified = false;
            otpVerifiedFlag.value = 'N';
            finalLoginBtn.disabled = true;
            show(otpErr, '인증 처리에 실패했습니다. 다시 시도해 주세요.');
        } catch (e) {
            otpConfirmBtn.textContent = '확인';
            otpConfirmBtn.disabled = false;
            otpVerified = false;
            otpVerifiedFlag.value = 'N';
            finalLoginBtn.disabled = true;
            show(otpErr, '네트워크 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
        }
    });

    // 최종 로그인: 여기서만 아이디/비밀번호 검증 수행
    finalLoginBtn.addEventListener('click', ()=>{
        hide(finalErr); hide(idErr); hide(pwErr);

        if(!loginId.value){ show(idErr, '아이디를 입력하세요.'); loginId.focus(); return; }
        if(!pw.value){ show(pwErr, '비밀번호를 입력하세요.'); pw.focus(); return; }
        if(otpVerifiedFlag.value !== 'Y'){ show(finalErr, '휴대폰 인증을 완료해 주세요.'); return; }

        finalLoginBtn.disabled = true;
        finalLoginBtn.textContent = '로그인 중…';
        loginForm.submit();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const finalErrEl = $('#finalErr');
        if (finalErrEl && finalErrEl.textContent.trim()) {
            secPw.classList.remove('hide');
            secPhone.classList.remove('hide');
            secFinal.classList.remove('hide');
            finalErrEl.classList.remove('hide');
        }
    });
</script>
<script src="${pageContext.request.contextPath}/static/js/krds/ui-script.js"></script>
</body>
</html>
