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
  <main class="main container">
    <div class="card">
      <!-- 실제 배포 시, 서버가 data-phone="01012345678" 같이 '숫자만' 값을 채워 넣어주세요 -->
  <main id="app" class="card" role="main" aria-labelledby="title" data-phone="01012345678">
    <div class="header">
      <div class="logo" aria-hidden="true">TS</div>
      <div>
        <h1 id="title">로그인</h1>
        <p class="sub">1차: 아이디/비밀번호 → 2차: SMS</p>
      </div>
    </div>

    <div class="banner">
      <strong>테스트:</strong> <code>아이디 demo</code>, <code>비번 demo1234</code> → 코드 전송 후 <code>OTP 123456</code>
    </div>

    <form id="loginForm" novalidate>
      <!-- 1차: 아이디/비밀번호 -->
      <div class="field">
        <label for="loginId">아이디</label>
        <div class="control">
          <input id="loginId" class="input" type="text" autocomplete="username"
                 placeholder="아이디를 입력하세요" minlength="4" maxlength="32"
                 pattern="[A-Za-z0-9._-]{4,32}" required />
        </div>
        <span class="hint">영문/숫자/.-_ 4~32자</span>
      </div>
      <div class="field">
        <label for="password">비밀번호</label>
        <div class="control">
          <input id="password" class="input" type="password" autocomplete="current-password"
                 minlength="8" placeholder="••••••••" required />
          <button class="link" type="button" id="togglePw" aria-label="비밀번호 표시 전환">표시</button>
        </div>
      </div>
      <div class="row">
        <label class="hint"><input type="checkbox" id="remember" /> 자동 로그인</label>
        <a class="link" href="#" onclick="alert('비밀번호 초기화 안내 화면으로 이동');return false;">비밀번호 찾기</a>
      </div>

      <div id="errorBox" class="error" aria-live="polite"></div>
      <div id="okBox" class="ok" aria-live="polite"></div>

      <button id="pwVerifyBtn" class="btn" type="button">로그인</button>

      <!-- 2차: SMS 인증 (전화번호는 표시만, 입력 불가) -->
      <section id="otpSection" class="hide" aria-label="2차 인증(SMS)">
        <hr style="border:none; border-top:1px solid var(--border); margin:8px 0 12px" />
        <div class="field">
          <label>인증 대상 휴대폰</label>
          <div class="control" aria-describedby="phoneHint">
            <input id="phoneMasked" class="input mono" type="text" value="" readonly />
          </div>
          <div class="row">
            <span id="phoneHint" class="hint">계정에 등록된 번호로만 발송됩니다.</span>
            <button id="sendOtpBtn" class="link" type="button">인증코드 전송</button>
          </div>
        </div>

        <div id="otpBox" class="field hide" aria-live="polite">
          <label for="otp">인증코드 (6자리)</label>
          <div class="otp-grid">
            <div class="control">
              <input id="otp" class="input mono" type="text" inputmode="numeric" pattern="\\d{6}" maxlength="6"
                     placeholder="______" aria-describedby="otpHint"/>
            </div>
            <button id="resendBtn" class="link" type="button" disabled>재전송(60)</button>
          </div>
          <span id="otpHint" class="hint">유효시간 <span id="timer" class="mono">02:00</span></span>
        </div>

        <button id="finalLoginBtn" class="btn" type="button" disabled>인증완료</button>
      </section>
    </form>
  </main>

  <script>
    // ===== 상수/요소 =====
    const $ = (s)=>document.querySelector(s);
    const app = $('#app');

    const loginId = $('#loginId');
    const pw = $('#password');
    const togglePw = $('#togglePw');
    const remember = $('#remember');
    const pwVerifyBtn = $('#pwVerifyBtn');

    const phoneMasked = $('#phoneMasked');
    const sendOtpBtn = $('#sendOtpBtn');
    const otpSection = $('#otpSection');
    const otpBox = $('#otpBox');
    const otp = $('#otp');
    const resendBtn = $('#resendBtn');
    const timerEl = $('#timer');
    const err = $('#errorBox');
    const ok = $('#okBox');
    const finalLoginBtn = $('#finalLoginBtn');

    // 서버가 내려주는 '기입력된 휴대폰 번호' (숫자만). 테스트 기본값: 01012345678
    const phoneRawFromServer = (app.dataset.phone || '').replace(/\D/g,'') || '01012345678';

    // 테스트 계정
    const TEST_ID = 'demo';
    const TEST_PW = 'demo1234';
    const TEST_OTP = '123456';

    let pwVerified = false;
    let otpVerified = false;
    let lastSendTs = 0;
    let otpExpireAt = null;
    let countdown = null;

    function showError(m){ err.textContent = m || ''; ok.textContent=''; }
    function showOk(m){ ok.textContent = m || ''; err.textContent=''; }
    function clearMsg(){ showError(''); showOk(''); }
    function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

    function formatPhoneMask(raw){
      const d = raw.replace(/\D/g,'');
      if(d.length < 10) return d; // 최소 10자리 가정
      // 010-****-끝4자리
      const head = d.slice(0,3);
      const tail = d.slice(-4);
      return `${head}-****-${tail}`;
    }

    // 초기 마스킹 표시
    phoneMasked.value = formatPhoneMask(phoneRawFromServer);

    // 비번 표시 토글
    togglePw.addEventListener('click', ()=>{
      const isPw = pw.type === 'password';
      pw.type = isPw ? 'text' : 'password';
      togglePw.textContent = isPw ? '숨김' : '표시';
      pw.focus();
    });

    // 1차 인증
    pwVerifyBtn.addEventListener('click', async ()=>{
      clearMsg();
      if(!loginId.value || !loginId.checkValidity()){
        return showError('아이디를 확인해주세요. (영문/숫자/.-_ 4~32자)');
      }
      if(!pw.value || pw.value.length < 8){
        return showError('비밀번호는 최소 8자 이상이어야 합니다.');
      }

      pwVerifyBtn.disabled = true; pwVerifyBtn.textContent = '확인 중…';
      await delay(300);

      if(loginId.value === TEST_ID && pw.value === TEST_PW){
        pwVerified = true;
      } else {
        // TODO: 실제 서버 1차 인증
        // const r = await fetch('/api/auth/login', {...})
        // if(!r.ok) { showError('아이디 또는 비밀번호가 올바르지 않습니다.'); ...; return; }
        showError('아이디 또는 비밀번호가 올바르지 않습니다. (테스트: demo/demo1234)');
        pwVerifyBtn.disabled = false; pwVerifyBtn.textContent = '1차 확인';
        return;
      }

      showOk('1차 인증 성공. 등록된 번호로 2차 인증을 진행하세요.');
      otpSection.classList.remove('hide');
      pwVerifyBtn.disabled = false; pwVerifyBtn.textContent = '1차 확인';
      // 포커스 이동
      sendOtpBtn.focus();
    });

    // 타이머
    function startTimer(sec){
      otpExpireAt = Date.now() + sec*1000;
      updateTimer();
      if(countdown) clearInterval(countdown);
      countdown = setInterval(updateTimer, 250);
    }
    function updateTimer(){
      const remain = Math.max(0, Math.floor((otpExpireAt - Date.now())/1000));
      const mm = String(Math.floor(remain/60)).padStart(2,'0');
      const ss = String(remain%60).padStart(2,'0');
      timerEl.textContent = `${mm}:${ss}`;
      if(remain===0){
        clearInterval(countdown);
        resendBtn.disabled = false;
        showError('인증코드 유효시간이 만료되었습니다. 재전송해주세요.');
        otpVerified = false;
        finalLoginBtn.disabled = true;
      }
    }

    // 인증코드 전송 (등록 번호로만)
    sendOtpBtn.addEventListener('click', async ()=>{
      clearMsg();
      if(!pwVerified){ return showError('먼저 1차(아이디/비밀번호) 인증을 완료해주세요.'); }

      const now = Date.now();
      if(now - lastSendTs < 30000){
        const left = Math.ceil((30000 - (now-lastSendTs))/1000);
        return showError(`잠시 후 다시 시도하세요. (${left}s)`);
      }

      // TODO: 실제 환경: 서버가 계정에 등록된 번호로 발송
      // await fetch('/api/2fa/sms/send', { method:'POST', headers:{'Content-Type':'application/json'},
      //   body: JSON.stringify({ loginId: loginId.value /* phone은 서버에서 조회 */ }) });

      await delay(300); // demo
      lastSendTs = now;
      otpBox.classList.remove('hide');
      resendBtn.disabled = true;
      startTimer(120); // 2분
      otp.value = '';
      otp.focus();
      showOk(`인증코드를 ${phoneMasked.value} 로 전송했습니다. (테스트: 123456)`);
    });

    resendBtn.addEventListener('click', ()=> sendOtpBtn.click());

    // 코드 검증
    otp.addEventListener('input', async ()=>{
      clearMsg();
      otp.value = otp.value.replace(/\D/g,'').slice(0,6);
      if(otp.value.length === 6){
        await delay(200);

        if(otp.value === TEST_OTP){
          otpVerified = true;
        } else {
          // TODO: 실제 서버 검증
          // const r = await fetch('/api/2fa/sms/verify', { ... loginId, code ... })
          showError('인증코드가 올바르지 않습니다. (테스트: 123456)');
          otpVerified = false; finalLoginBtn.disabled = true; return;
        }

        showOk('2차 인증 완료. 최종 로그인을 진행하세요.');
        if(countdown) clearInterval(countdown);
        finalLoginBtn.disabled = !(pwVerified && otpVerified);
      } else {
        otpVerified = false;
        finalLoginBtn.disabled = true;
      }
    });

    // 최종 로그인
    finalLoginBtn.addEventListener('click', async ()=>{
      clearMsg();
      if(!(pwVerified && otpVerified)){ return showError('1차/2차 인증이 완료되지 않았습니다.'); }

      finalLoginBtn.disabled = true; finalLoginBtn.textContent = '로그인 중…';
      await delay(400);

      alert('로그인 성공! (테스트 모드)\n아이디: ' + loginId.value + '\n발송번호: ' + phoneMasked.value);
      finalLoginBtn.disabled = false; finalLoginBtn.textContent = '최종 로그인';

      // TODO: 실제 환경: /api/2fa/complete 호출 후 리다이렉트
      // const resp = await fetch('/api/2fa/complete', {...})
      // location.href = (await resp.json()).redirect || '/';
    });
  </script>
    </div>
  </main>
  <jsp:include page="/WEB-INF/views/fragments/_footer.jspf"/>
</body>
</html>
