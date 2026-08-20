/* 单词汇总页：搜索 / 词性筛选 / 收藏 / 标记已会 */

(function () {
  const grid = $("#wordGrid");
  const searchInput = $("#searchInput");
  const chipsBox = $("#filterChips");
  const statsRow = $("#statsRow");

  let keyword = "";
  let posFilter = "all";

  /* ---------- 统计 ---------- */
  function renderStats() {
    const items = [
      { label: "词库总词数", value: WORDS.length, color: "var(--tz-primary)", bg: "var(--tz-primary-soft)",
        icon: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path>' },
      { label: "已会单词", value: Store.known.length, color: "var(--tz-success)", bg: "var(--tz-success-soft)",
        icon: '<path d="M20 6 9 17l-5-5"></path>' },
      { label: "我的收藏", value: Store.favs.length, color: "var(--tz-danger)", bg: "var(--tz-danger-soft)",
        icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>' },
      { label: "易错单词", value: Object.keys(Store.errors).length, color: "var(--tz-warning)", bg: "var(--tz-warning-soft)",
        icon: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' }
    ];
    statsRow.innerHTML = items.map((it) => `
      <div class="stat-card">
        <div class="stat-icon" style="color:${it.color};background:${it.bg}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${it.icon}</svg>
        </div>
        <div>
          <div class="stat-value">${it.value}</div>
          <div class="stat-label">${it.label}</div>
        </div>
      </div>
    `).join("");
  }

  /* ---------- 筛选 chips ---------- */
  function renderChips() {
    const poses = ["all", ...new Set(WORDS.map((w) => w.pos))];
    const labels = { all: "全部", ...POS_LABELS };
    chipsBox.innerHTML = poses.map((p) =>
      `<button class="chip ${posFilter === p ? "active" : ""}" data-pos="${p}">${labels[p] || p}</button>`
    ).join("");
  }

  /* ---------- 单词卡片 ---------- */
  function cardHTML(w, i) {
    const known = Store.isKnown(w.id);
    const fav = Store.isFav(w.id);
    return `
      <div class="word-card ${known ? "known" : ""}" data-word="${w.id}" style="animation-delay:${Math.min(i, 20) * 0.03}s">
        <div class="word-card-top">
          <span class="word-name">${w.id}</span>
          <div class="word-card-actions">
            <button class="icon-btn ${fav ? "fav-on" : ""}" data-fav="${w.id}" title="收藏" aria-label="收藏 ${w.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <button class="icon-btn ${known ? "known-on" : ""}" data-known="${w.id}" title="标记已会" aria-label="标记 ${w.id} 为已会">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${known ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4 12 14.01l-3-3"></path></svg>
            </button>
          </div>
        </div>
        <div><span class="badge badge-${w.pos}">${POS_LABELS[w.pos]}</span></div>
        <div class="word-cn">${w.cn}</div>
        <p class="word-en">${w.en}</p>
      </div>`;
  }

  function render() {
    const kw = keyword.trim().toLowerCase();
    const list = WORDS.filter((w) => {
      const okPos = posFilter === "all" || w.pos === posFilter;
      const okKw = !kw || w.id.includes(kw) || w.cn.toLowerCase().includes(kw);
      return okPos && okKw;
    });

    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="empty-state" style="grid-column:1/-1">
           <div class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
           <span>没有找到匹配的单词</span>
         </div>`;
    renderStats();
  }

  /* 仅更新单个卡片的状态，避免整页重渲染导致闪烁 */
  function updateCardState(id) {
    const card = grid.querySelector(`.word-card[data-word="${id}"]`);
    if (!card) return;
    const known = Store.isKnown(id);
    const fav = Store.isFav(id);
    card.classList.toggle("known", known);
    const favBtn = card.querySelector(`[data-fav="${id}"]`);
    const knownBtn = card.querySelector(`[data-known="${id}"]`);
    if (favBtn) {
      favBtn.classList.toggle("fav-on", fav);
      const svg = favBtn.querySelector("svg");
      if (svg) svg.setAttribute("fill", fav ? "currentColor" : "none");
    }
    if (knownBtn) {
      knownBtn.classList.toggle("known-on", known);
      const svg = knownBtn.querySelector("svg");
      if (svg) svg.setAttribute("fill", known ? "currentColor" : "none");
    }
    renderStats();
  }

  /* ---------- 事件 ---------- */
  searchInput.addEventListener("input", (e) => {
    keyword = e.target.value;
    render();
  });

  chipsBox.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-pos]");
    if (!chip) return;
    posFilter = chip.dataset.pos;
    renderChips();
    render();
  });

  grid.addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]");
    const knownBtn = e.target.closest("[data-known]");
    if (favBtn) {
      const id = favBtn.dataset.fav;
      const on = Store.toggleFav(id);
      TZToast.show(on ? `已收藏「${id}」` : `已取消收藏「${id}」`, on ? "success" : "info");
      updateCardState(id);
    } else if (knownBtn) {
      const id = knownBtn.dataset.known;
      const on = Store.toggleKnown(id);
      TZToast.show(on ? `「${id}」已标记为已会` : `已移出已会列表`, on ? "success" : "info");
      updateCardState(id);
    }
  });

  Store.onChange((changedKey) => {
    if (changedKey === "known" || changedKey === "favs") {
      renderStats();
    }
  });
  renderChips();
  render();
})();
