(function () {
  /**
   * Normalize the context path to a consistent format.
   * - empty string or "/" becomes ""
   * - trims trailing slash for other paths
   */
  function normalizeBasePath(basePath) {
    if (!basePath || basePath === '/') return '';
    return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  }

  /**
   * Detect the base path from a global variable or this script tag's src.
   */
  function detectDefaultBasePath() {
    const candidate = (typeof window !== 'undefined')
      ? (window.contextPath || window.CONTEXT_PATH || '')
      : '';

    if (candidate) {
      return normalizeBasePath(candidate);
    }

    const script = (typeof document !== 'undefined')
      ? (document.currentScript || document.querySelector('script[src*="/static/js/common/code-api.js"]'))
      : null;

    if (script) {
      const src = script.getAttribute('src') || '';
      const idx = src.indexOf('/static/js/common/code-api.js');
      if (idx > -1) {
        return normalizeBasePath(src.substring(0, idx));
      }
    }

    return '';
  }

  /**
   * Prefix the request path with the detected base path when needed.
   */
  function buildUrl(path, basePath) {
    if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
      return path;
    }

    const prefix = normalizeBasePath(basePath);
    if (prefix && path.startsWith('/')) {
      return `${prefix}${path}`;
    }
    return path;
  }

  const defaultBasePath = detectDefaultBasePath();
  if (typeof window !== 'undefined' && defaultBasePath && !window.contextPath) {
    window.contextPath = defaultBasePath;
  }

  // Prefix all fetch calls with the detected context path when needed.
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    const normalizedBase = defaultBasePath;
    const originalFetch = window.fetch.bind(window);

    function shouldPrefix(url) {
      if (!normalizedBase || typeof url !== 'string') return false;
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return false;
      if (!url.startsWith('/')) return false;
      if (url.startsWith(`${normalizedBase}/`)) return false;
      return true;
    }

    window.fetch = function(resource, options) {
      if (shouldPrefix(resource)) {
        resource = `${normalizedBase}${resource}`;
      }
      return originalFetch(resource, options);
    };
  }

  async function loadJson(path, basePath = defaultBasePath) {
    const targetUrl = buildUrl(path, basePath);

    // 세션 캐시 (페이지 이동 간 재사용) - TTL 10분
    const cacheKey = `codeapi:${targetUrl}`;
    try {
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const age = Date.now() - (cached.ts || 0);
        if (cached.data && age < 10 * 60 * 1000) { // 10분 유효
          return cached.data;
        }
      }
    } catch (e) {
      // 캐시 읽기 실패는 무시
    }

    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: json }));
    } catch (e) {
      // 저장 실패 무시 (용량 초과 등)
    }

    return json;
  }

  async function loadStatusList(basePath) {
    return loadJson('/cmm/codes/status', basePath);
  }

  async function loadParkingTypeList(basePath) {
    return loadJson('/cmm/codes/parking-type', basePath);
  }

  async function loadSidoList(basePath) {
    return loadJson('/cmm/codes/sido', basePath);
  }

  async function loadSigunguList(sidoCd, basePath) {
    return loadJson(`/cmm/codes/sigungu?sidoCd=${encodeURIComponent(sidoCd || '')}`, basePath);
  }

  async function loadEmdList(sigunguCd, basePath) {
    return loadJson(`/cmm/codes/emd?sigunguCd=${encodeURIComponent(sigunguCd || '')}`, basePath);
  }

  window.CodeApi = {
    loadStatusList,
    loadParkingTypeList,
    loadSidoList,
    loadSigunguList,
    loadEmdList
  };

  // 기존 전역 네임스페이스 호환
  window.CodeUtils = window.CodeApi;
})();
