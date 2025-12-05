(function () {
  // 컨텍스트 경로 추론 및 프리픽스
  const __CTX = (() => {
    if (window.contextPath) return window.contextPath.replace(/\/$/, '');
    const match = window.location.pathname.match(/^\/[^/]+/);
    return match ? match[0] : '';
  })();
  const withBase = (url) => {
    if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
    if (__CTX && url.startsWith('/')) return `${__CTX}${url}`;
    return url;
  };
  function getTabHost() {
    return {
      tabBar: window.$one ? $one('.tabs') : document.querySelector('.tabs'),
      panelsWrap: window.$one ? $one('.tab-panels') : document.querySelector('.tab-panels')
    };
  }

  function getOpenCountTop() {
    const { tabBar } = getTabHost();
    if (!tabBar) return 0;
    const all = Array.from(tabBar.querySelectorAll('.tab-btn'));
    return all.filter(b => b.id !== 'tabList').length;
  }

  function activateTop(tabId) {
    const { tabBar, panelsWrap } = getTabHost();
    if (!tabBar || !panelsWrap) return;

    Array.from(tabBar.querySelectorAll('.tab-btn')).forEach(btn => {
      const active = (btn.id === tabId);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    Array.from(panelsWrap.querySelectorAll('.tab-panel')).forEach(p => {
      const owner = tabBar.querySelector(`.tab-btn[aria-controls="${p.id}"]`);
      p.hidden = !(owner && owner.id === tabId);
    });

    const el = window.$id ? $id(tabId) : document.getElementById(tabId);
    el?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
    resizeDetail();
  }

  function ensureDetailTabTop(rec, options = {}) {
    const maxTabs = options.maxTabs || 8;
    const { tabBar, panelsWrap } = getTabHost();
    if (!tabBar || !panelsWrap) {
      window.toast && toast('상세 탭 영역이 없습니다(.tabs/.tab-panels).');
      return;
    }

    const infoSn = rec.prkPlceInfoSn || rec.infoSn;
    const key = `${rec.manageNo || 'NO_MANAGE'}__${infoSn || ''}`;
    const tabId = `tab-${key}`;
    const panelId = `panel-${key}`;

    if (document.getElementById(tabId) && document.getElementById(panelId)) {
      activateTop(tabId);
      return;
    }

    if (getOpenCountTop() >= maxTabs) {
      window.toast && toast(`상세 탭은 최대 ${maxTabs}개까지 열 수 있습니다.`);
      return;
    }

    const type = (rec.type || '').trim();
    const normalizeType = (t) => {
      if (t === '01' || t === '노상') return 'on';
      if (t === '02' || t === '노외') return 'off';
      if (t === '03' || t === '부설') return 'build';
      return null;
    };
    const typeKey = normalizeType(type);

    const pathMap = {
      on: withBase('/prk/onparking-detail'),
      off: withBase('/prk/offparking-detail'),
      build: withBase('/prk/buildparking-detail')
    };
    const path = pathMap[typeKey];

    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.id = tabId;
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-selected', 'false');
    btn.innerHTML = `${rec.nm} <span class="x" aria-hidden="true">✕</span>`;
    tabBar.appendChild(btn);

    const panel = document.createElement('section');
    panel.className = 'tab-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = true;
    panel.innerHTML = `
      <iframe class="detail-frame" title="상세: ${rec.nm}"
              style="width:100%;border:0;display:block;min-height:420px"
              loading="eager" allow="geolocation"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"></iframe>
      <div class="no-page muted" style="padding:12px;display:none">페이지가 없습니다.</div>
    `;
    panelsWrap.appendChild(panel);

    const iframe = panel.querySelector('iframe');
    const noPage = panel.querySelector('.no-page');

    if (!path) {
      iframe.remove();
      noPage.style.display = 'block';
      activateTop(tabId);
      return;
    }

    if (!rec.manageNo || !infoSn) {
      window.toast && toast('관리번호/정보일련번호가 없어 상세를 열 수 없습니다.');
      return;
    }

    if ((typeKey === 'on' || typeKey === 'build') && !infoSn) {
      window.toast && toast('상세를 열기 위한 prkPlceInfoSn이 없습니다.');
      return;
    }

    const sp = new URLSearchParams();
    if (rec.manageNo) sp.set('prkPlceManageNo', rec.manageNo);
    if (infoSn) sp.set('prkPlceInfoSn', infoSn);
    if (rec.status) sp.set('status', rec.status);
    if (rec.nm) sp.set('name', rec.nm);
    if (rec.sido) sp.set('sido', rec.sido);
    if (rec.sigungu) sp.set('sigungu', rec.sigungu);
    if (rec.emd) sp.set('emd', rec.emd);
    if (rec.addr) sp.set('addr', rec.addr);
    const url = `${path}?${sp.toString()}`;

    fetch(url, { method: 'HEAD' })
      .then(res => res.ok)
      .catch(() => false)
      .then(ok => {
        if (ok) {
          iframe.src = url;
          iframe.addEventListener('load', () => {
            resizeDetail();
          });
        } else {
          iframe.remove();
          noPage.style.display = 'block';
        }
      });

    activateTop(tabId);
  }

  function closeTop(btn) {
    if (!btn || btn.id === 'tabList') return;
    const panelId = btn.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    const wasActive = btn.classList.contains('active');
    btn.remove();
    panel?.remove();
    if (wasActive) {
      const { tabBar } = getTabHost();
      const all = Array.from(tabBar.querySelectorAll('.tab-btn'));
      const fallback = all[all.length - 1] || document.getElementById('tabList');
      fallback && activateTop(fallback.id);
    }
    if (getOpenCountTop() === 0) activateTop('tabList');
  }

  function resizeDetail() {
    const panelsWrap = window.$one ? $one('.tab-panels') : document.querySelector('.tab-panels');
    if (!panelsWrap) return;
    const activeIframe = panelsWrap.querySelector('.tab-panel:not([hidden]) iframe');
    if (!activeIframe) return;

    const top = activeIframe.getBoundingClientRect().top;
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const footerGap = 16;
    const min = Math.max(420, vh - top - footerGap);
    activeIframe.style.minHeight = min + 'px';
  }

  function initHybridBindings() {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      resizeDetail();
    };
    setVh();
    window.addEventListener('resize', setVh, { passive: true });

    if (window.cordova) {
      document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        const { tabBar } = getTabHost();
        const opened = Array.from(tabBar.querySelectorAll('.tab-btn')).filter(b => b.id !== 'tabList');
        if (opened.length) {
          closeTop(opened[opened.length - 1]);
        } else {
          activateTop('tabList');
        }
      }, false);
    }
  }

  window.Tabs = {
    getTabHost,
    getOpenCountTop,
    activateTop,
    ensureDetailTabTop,
    closeTop,
    resizeDetail,
    initHybridBindings
  };
})();
