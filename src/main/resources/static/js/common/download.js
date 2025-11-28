(function () {
  function downloadCSV(csvString, fileName) {
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;"
    });

    if ('download' in document.createElement('a')) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return;
    }

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
      return;
    }

    try {
      const dataUrl = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvString);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      if (window.toast) {
        toast('이 브라우저에서는 CSV 다운로드를 지원하지 않습니다.');
      }
    }
  }

  window.Download = {
    downloadCSV
  };
})();
