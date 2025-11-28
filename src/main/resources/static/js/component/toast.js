(function () {
  function toast(msg) {
    const t = window.$id ? $id('toast') : document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  window.toast = toast;
  window.Toast = { toast };
})();
