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
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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
