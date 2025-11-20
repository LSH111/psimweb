(function () {
  async function loadJson(path, basePath = '') {
    const res = await fetch(basePath + path);
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
