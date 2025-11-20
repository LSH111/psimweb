(function () {
  function showConfirmModal({ title, message, confirmText = '확인', cancelText = '취소', onConfirm, onCancel }) {
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
            <h3 style="margin: 0 0 16px 0; font-size: 1.25rem; color: #1e293b;">${title || ''}</h3>
            <p style="margin: 0 0 24px 0; color: #64748b;">
                ${message || ''}
            </p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" id="btnConfirmCancel" style="
                    padding: 10px 24px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    background: white;
                    color: #64748b;
                    cursor: pointer;
                    font-weight: 600;
                ">${cancelText}</button>
                <button type="button" id="btnConfirmOk" style="
                    padding: 10px 24px;
                    border: none;
                    border-radius: 6px;
                    background: #3b82f6;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                ">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const cleanup = () => {
      modal.remove();
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        onCancel && onCancel();
      }
    });

    modal.querySelector('#btnConfirmCancel')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
      onCancel && onCancel();
    });

    modal.querySelector('#btnConfirmOk')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
      onConfirm && onConfirm();
    });
  }

  window.showConfirmModal = showConfirmModal;
  window.Modal = { showConfirmModal };
})();
