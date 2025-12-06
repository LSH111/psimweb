// 상태 뱃지/텍스트 등을 위한 포맷 유틸
(function () {
  const statusTextMap = {
    '00': '작성전',
    '10': '조사중',
    '20': '승인대기',
    '30': '승인',
    '99': '반려'
  };

  function normalizeStatusCode(codeOrName) {
    const val = (codeOrName || '').toString().trim();
    if (statusTextMap[val]) return val;
    // 역매핑: 이름이 들어온 경우 코드 반환
    const found = Object.entries(statusTextMap).find(([, name]) => name === val);
    return found ? found[0] : val;
  }

  function getStatusText(statusCodeOrName) {
    const code = normalizeStatusCode(statusCodeOrName);
    return statusTextMap[code] || statusCodeOrName || '-';
  }

  function badgeStatus(statusCodeOrName) {
    const code = normalizeStatusCode(statusCodeOrName);
    const text = getStatusText(code);
    if (code === '30') return '<span class="badge status appr">' + text + '</span>';
    if (code === '20') return '<span class="badge status pend">' + text + '</span>';
    if (code === '99') return '<span class="badge status reject">' + text + '</span>';
    if (code === '10') return '<span class="badge">' + text + '</span>';
    if (code === '00') return '<span class="badge">' + text + '</span>';
    return '<span class="badge">' + (text ?? '') + '</span>';
  }

  function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  window.FormatUtils = {
    badgeStatus,
    getStatusText,
    getCurrentDateString
  };
})();
