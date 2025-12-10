(function () {
    /**
     * Context Path 정규화 함수
     * - 빈 문자열이나 '/'는 ''로 변환
     * - 끝에 '/'가 있으면 제거
     */
    function normalizeBasePath(basePath) {
        if (!basePath || basePath === '/') return '';
        return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    }

    /**
     * 기본 경로(Context Path) 감지 함수
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
     * URL 경로 생성 함수
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

    // fetch 함수 래핑 (Context Path 자동 적용)
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

        window.fetch = function (resource, options) {
            if (shouldPrefix(resource)) {
                resource = `${normalizedBase}${resource}`;
            }
            return originalFetch(resource, options);
        };
    }

    /**
     * JSON 데이터 로드 및 캐싱 함수
     * - sessionStorage를 사용하여 데이터를 브라우저에 임시 저장합니다.
     * - 유효 기간(TTL)은 10분으로 설정되어 있습니다.
     */
    async function loadJson(path, basePath = defaultBasePath) {
        const targetUrl = buildUrl(path, basePath);

        // 1. 캐시 확인 (페이지 이동 간 재사용) - TTL 10분
        const cacheKey = `codeapi:${targetUrl}`;
        try {
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                const age = Date.now() - (cached.ts || 0);
                // 10분(10 * 60 * 1000ms) 이내의 데이터면 바로 반환
                if (cached.data && age < 10 * 60 * 1000) {
                    return cached.data;
                }
            }
        } catch (e) {
            // 캐시 읽기 실패는 무시하고 서버 요청 진행
        }

        // 2. 서버 요청
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // 3. 응답 결과 캐시 저장
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ts: Date.now(), data: json}));
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

    // 🔥 [추가된 부분] 전체 동적 코드 그룹 조회 함수
    async function getDynamicGroups(basePath = defaultBasePath) {
        // loadJson 함수 내부에서 캐싱(sessionStorage)을 처리하므로
        // 이 함수를 호출하면 자동으로 캐시된 데이터를 사용하게 됩니다.
        return loadJson('/cmm/codes/dynamic-groups', basePath);
    }

    // 외부에서 사용할 수 있도록 함수 노출
    window.CodeApi = {
        loadStatusList,
        loadParkingTypeList,
        loadSidoList,
        loadSigunguList,
        loadEmdList,
        getDynamicGroups // 여기에 함수 등록
    };

    // 기존 전역 네임스페이스 호환
    window.CodeUtils = window.CodeApi;
})();