(function () {
  function renderPager(totalPages, currentPage, onChange) {
    const pager = window.$id ? $id('pager') : document.getElementById('pager');
    if (!pager) return;

    pager.innerHTML = '';
    const makeBtn = (txt, page, disabled, active) => {
      const b = document.createElement('button');
      b.className = 'page-btn' + (active ? ' active' : '');
      b.textContent = txt;
      b.disabled = !!disabled;
      b.addEventListener('click', async () => {
        onChange && onChange(page);
      });
      return b;
    };
    pager.appendChild(makeBtn('«', 1, currentPage === 1, false));
    pager.appendChild(makeBtn('‹', Math.max(1, currentPage - 1), currentPage === 1, false));
    const span = 3;
    const from = Math.max(1, currentPage - span);
    const to = Math.min(totalPages, currentPage + span);
    for (let p = from; p <= to; p++) pager.appendChild(makeBtn(String(p), p, false, p === currentPage));
    pager.appendChild(makeBtn('›', Math.min(totalPages, currentPage + 1), currentPage === totalPages, false));
    pager.appendChild(makeBtn('»', totalPages, currentPage === totalPages, false));
  }

  window.renderPager = renderPager;
  window.Pager = { renderPager };
})();
