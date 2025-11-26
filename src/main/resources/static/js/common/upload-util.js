/**
 * 파일 업로드 UI 리셋 및 오류 처리 공통 함수
 */
(function (global) {
  function clearUploadProgressUI() {
    // 진행률 전용 컨테이너만 정리 (업로드 완료 리스트는 유지)
    var $progress = document.querySelectorAll('#uploadProgressContainer, #uploadProgress, .upload-progress, .file-progress');
    $progress.forEach(function (el) {
      el.innerHTML = '';
      el.style.display = 'none';
    });
  }

  function appendUploadedFiles(listSelector, files) {
    var list = document.querySelector(listSelector || '#uploadedFileList');
    if (!list || !files) return;
    Array.from(files).forEach(function (file) {
      var li = document.createElement('li');
      li.className = 'uploaded-file';
      li.textContent = file.name || file.filename || '파일';
      list.appendChild(li);
    });
  }

  function handleAjaxError(xhr, fallbackMessage) {
    var msg = fallbackMessage || '저장/업로드 중 오류가 발생했습니다.';
    if (xhr && xhr.responseText) {
      try {
        var json = JSON.parse(xhr.responseText);
        if (json && json.message) {
          msg = json.message;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    alert(msg);
  }

  // 공통 파일 리스트 렌더러 (realFileNm 우선)
  function renderUploadedList(photos, listSelector) {
    var list = document.querySelector(listSelector || '#uploadedFileList');
    if (!list) return;
    list.innerHTML = '';
    (photos || []).forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'uploaded-file';
      li.dataset.seqNo = p.seqNo || p.seq_no || '';
      var name = p.realFileNm || p.real_file_nm || p.fileNm || p.file_nm || p.fileName;
      li.textContent = name || '파일';
      list.appendChild(li);
    });
  }

  global.clearUploadProgressUI = clearUploadProgressUI;
  global.appendUploadedFiles = appendUploadedFiles;
  global.handleAjaxError = handleAjaxError;
  global.renderUploadedList = renderUploadedList;
})(window);
