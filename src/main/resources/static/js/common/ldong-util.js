(function (global) {
  function normalizeCode(value, length) {
    if (value === undefined || value === null) return '';
    var digits = String(value).replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length > length) return digits.substring(0, length);
    if (digits.length < length) {
      return ('0000000000' + digits).slice(-length);
    }
    return digits;
  }

  /**
   * sigungu(5) + emd(3) + li(2 or '00') => 10자리 숫자
   */
  function generateLdongCd(sigunguCd, emdCd, liCd) {
    var s5 = normalizeCode(sigunguCd, 5);
    var e3 = normalizeCode(emdCd, 3);
    var l2 = normalizeCode(liCd, 2) || '00';
    var ld = s5 + e3 + l2;
    if (!/^\d{10}$/.test(ld)) {
      return null;
    }
    return ld;
  }

  function assertLdongCd(ldongCd) {
    return ldongCd != null && /^\d{10}$/.test(String(ldongCd));
  }

  global.LdongUtil = {
    generateLdongCd: generateLdongCd,
    assertLdongCd: assertLdongCd
  };
})(window);

