// 상태 뱃지/텍스트 등을 위한 포맷 유틸
(function () {
  function badgeStatus(status) {
    if (status === 'APPROVED' || status === '승인') return '<span class="badge status appr">승인</span>';
    if (status === 'PENDING' || status === '진행중') return '<span class="badge status pend">진행중</span>';
    if (status === 'REJECTED' || status === '반려') return '<span class="badge status reject">반려</span>';
    if (status === 'TEMP' || status === '임시저장') return '<span class="badge">임시저장</span>';
    return '<span class="badge">' + (status ?? '') + '</span>';
  }

  const statusMap = {
    '01': '승인',
    '02': '진행중',
    '03': '반려',
    '04': '임시저장'
  };

  function getStatusText(statusCode) {
    return statusMap[statusCode] || statusCode || '-';
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
