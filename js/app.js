/* 铁柱英语 · 通用 UI：Toast 轻提示 + 单词操作模态弹窗 */

window.TZToast = (() => {
  let container = null;

  function ensure() {
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function show(msg, type = "info") {
    const box = ensure();
    while (box.children.length >= 3) box.firstChild.remove();

    const icon =
      type === "success"
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"></path></svg>'
        : type === "danger"
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>';

    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `${icon}<span>${msg}</span>`;
    box.appendChild(el);

    setTimeout(() => {
      el.classList.add("leaving");
      el.addEventListener("animationend", () => el.remove());
    }, 2200);
  }

  return { show };
})();

/* 单词详情弹窗：释义 + 一键收藏 / 标记已会 */
window.TZWordModal = (() => {
  function close() {
    const m = $("#tz-word-modal");
    if (m) m.remove();
  }

  function open(word) {
    close();
    const known = Store.isKnown(word.id);
    const fav = Store.isFav(word.id);
    const posLabel = (window.POS_LABELS && POS_LABELS[word.pos]) || word.pos;

    const mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.id = "tz-word-modal";
    mask.innerHTML = `
      <div class="modal" role="dialog" aria-label="单词详情">
        <div class="modal-word">${word.id}<span class="badge badge-${word.pos}">${posLabel}</span></div>
        <p class="modal-cn">${word.cn}</p>
        <p class="modal-en">${word.en}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-act="fav">${fav ? "取消收藏" : "收藏"}</button>
          <button class="btn btn-primary" data-act="known">${known ? "取消已会" : "标记已会"}</button>
        </div>
      </div>`;

    document.body.appendChild(mask);

    mask.addEventListener("click", (e) => {
      if (e.target === mask) close();
      const act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "fav") {
        const on = Store.toggleFav(word.id);
        TZToast.show(on ? `已收藏「${word.id}」` : `已取消收藏「${word.id}」`, on ? "success" : "info");
        open(word); // 刷新按钮态
      } else if (act.dataset.act === "known") {
        const on = Store.toggleKnown(word.id);
        TZToast.show(on ? `「${word.id}」已标记为已会` : `已移出已会列表`, on ? "success" : "info");
        open(word);
      }
    });

    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
  }

  return { open, close };
})();
