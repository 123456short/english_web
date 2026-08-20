/* 个人中心：五个板块（已会 / 收藏 / 错误 / 手速 / 信息）+ hash 路由 */

(function () {
  const MENU = [
    { key: "known", label: "我的已会",
      icon: '<path d="M20 6 9 17l-5-5"></path>',
      title: "我的已会单词", desc: "这里展示您标记为“已会”的所有单词" },
    { key: "favs", label: "我的收藏",
      icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
      title: "我的收藏", desc: "这里展示您收藏的所有单词" },
    { key: "errors", label: "我的错误",
      icon: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
      title: "我的错误", desc: "打字练习中拼错的单词会自动记录在这里，多练几遍消灭它们" },
    { key: "speed", label: "我的手速",
      icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
      title: "我的手速", desc: "打字练习的速度与正确率记录，看看自己有没有进步" },
    { key: "info", label: "我的信息",
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      title: "我的信息", desc: "管理您的昵称与每日学习目标" }
  ];

  const menuList = $("#menuList");
  let activeKey = "known";

  function emptyHTML(icon, text) {
    return `<div class="empty-state">
      <div class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg></div>
      <span>${text}</span>
    </div>`;
  }

  function rowHTML(w, actionsHTML) {
    return `<div class="word-row">
      <span class="word-name">${w.id}</span>
      <span class="badge badge-${w.pos}">${POS_LABELS[w.pos]}</span>
      <span class="row-cn">${w.cn}</span>
      <div class="row-actions">${actionsHTML}</div>
    </div>`;
  }

  /* ---------- 侧栏菜单 ---------- */
  function renderMenu() {
    const counts = {
      known: Store.known.length,
      favs: Store.favs.length,
      errors: Object.keys(Store.errors).length,
      speed: Store.speeds.length,
      info: ""
    };
    menuList.innerHTML = MENU.map((m) => `
      <li><a data-key="${m.key}" class="${activeKey === m.key ? "active" : ""}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${m.icon}</svg>
        ${m.label}${counts[m.key] !== "" ? `<span class="count">${counts[m.key]}</span>` : ""}
      </a></li>
    `).join("");
  }

  /* ---------- 各板块 ---------- */
  function renderKnown() {
    const sec = $("#sec-known");
    if (!Store.known.length) {
      sec.innerHTML = emptyHTML('<path d="M20 6 9 17l-5-5"></path>', "暂无已会单词");
      sec.insertAdjacentHTML("beforeend", '<a class="btn btn-primary" href="index.html">去单词汇总标记</a>');
      return;
    }
    sec.innerHTML = Store.known.map((id) => {
      const w = findWord(id);
      if (!w) return "";
      return rowHTML(w, `
        <button class="btn btn-ghost" data-remove-known="${id}" style="padding:6px 14px">移除</button>
        <a class="btn btn-primary" href="typing.html" style="padding:6px 14px">练习</a>
      `);
    }).join("");
  }

  function renderFavs() {
    const sec = $("#sec-favs");
    if (!Store.favs.length) {
      sec.innerHTML = emptyHTML('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>', "暂无收藏单词");
      return;
    }
    sec.innerHTML = Store.favs.map((id) => {
      const w = findWord(id);
      if (!w) return "";
      return rowHTML(w, `<button class="btn btn-ghost" data-remove-fav="${id}" style="padding:6px 14px">取消收藏</button>`);
    }).join("");
  }

  function renderErrors() {
    const sec = $("#sec-errors");
    const entries = Object.entries(Store.errors).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      sec.innerHTML = emptyHTML('<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>', "太棒了，还没有错误记录");
      return;
    }
    sec.innerHTML = entries.map(([word, n]) => {
      const w = findWord(word) || { id: word, pos: "noun", cn: "" };
      return `<div class="word-row">
        <span class="word-name">${w.id}</span>
        <span class="row-cn">${w.cn || "（词库外单词）"}</span>
        <span class="badge badge-verb">错了 ${n} 次</span>
        <div class="row-actions">
          <a class="btn btn-primary" href="typing.html" style="padding:6px 14px">去消灭</a>
        </div>
      </div>`;
    }).join("");
  }

  /* ---------- 手速：统计 + SVG 折线图 ---------- */
  function renderSpeed() {
    const sec = $("#sec-speed");
    const list = Store.speeds;
    if (!list.length) {
      sec.innerHTML = emptyHTML('<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line>', "还没有练习记录，先去打字练习试试吧");
      return;
    }

    const recent = list.slice(-10);
    const avg = Math.round(list.reduce((s, r) => s + r.wpm, 0) / list.length);
    const best = Math.max(...list.map((r) => r.wpm));

    /* 折线图坐标计算 */
    const W = 640, H = 180, PAD = 24;
    const maxW = Math.max(...recent.map((r) => r.wpm)) * 1.15;
    const stepX = recent.length > 1 ? (W - PAD * 2) / (recent.length - 1) : 0;
    const pts = recent.map((r, i) => {
      const x = PAD + i * stepX;
      const y = H - PAD - (r.wpm / maxW) * (H - PAD * 2);
      return { x, y, r };
    });
    const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;

    sec.innerHTML = `
      <div class="speed-stats">
        <div class="stat-card"><div class="stat-icon" style="color:var(--tz-primary);background:var(--tz-primary-soft)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div><div><div class="stat-value">${avg}</div><div class="stat-label">平均 WPM</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="color:var(--tz-success);background:var(--tz-success-soft)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        </div><div><div class="stat-value">${best}</div><div class="stat-label">最佳 WPM</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="color:var(--tz-info);background:var(--tz-info-soft)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"></path></svg>
        </div><div><div class="stat-value">${list.length}</div><div class="stat-label">累计练习次数</div></div></div>
      </div>

      <div class="speed-chart-card">
        <p class="speed-chart-title">最近 ${recent.length} 次练习速度趋势</p>
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" preserveAspectRatio="none">
          <defs>
            <linearGradient id="tzLineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--tz-primary)" stop-opacity="0.28"></stop>
              <stop offset="100%" stop-color="var(--tz-primary)" stop-opacity="0.02"></stop>
            </linearGradient>
          </defs>
          <polygon points="${area}" fill="url(#tzLineFill)"></polygon>
          <polyline points="${line}" fill="none" stroke="var(--tz-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
          ${pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="var(--tz-card)" stroke="var(--tz-primary)" stroke-width="2"><title>${fmtDate(p.r.ts)} · ${p.r.wpm} WPM · 正确率 ${p.r.acc}%</title></circle>`).join("")}
        </svg>
      </div>

      <div class="speed-list">
        ${[...list].reverse().map((r) => `
          <div class="speed-row">
            <span class="date">${fmtDate(r.ts)}</span>
            <span class="wpm">${r.wpm} WPM</span>
            <span class="acc">正确率 ${r.acc}%</span>
            <span class="sentence">${r.sentence || ""}</span>
          </div>
        `).join("")}
      </div>`;
  }

  /* ---------- 我的信息 ---------- */
  let infoEditing = false;

  function renderInfo() {
    const sec = $("#sec-info");
    const p = Store.profile;

    const genderText = p.gender || "保密";
    const ageText = p.age ? `${p.age} 岁` : "未设置";
    const cityText = p.city || "未设置";
    const emailText = p.email || "未设置";
    const regText = p.registeredAt ? fmtDate(p.registeredAt) : "未知";

    sec.innerHTML = `
      <div class="profile-showcase">
        <div class="profile-card">
          <div class="profile-avatar">
            <span>${(p.name || "学").charAt(0)}</span>
          </div>
          <div class="profile-basic">
            <div class="profile-name">${p.name || "未命名学员"}</div>
            <div class="profile-sub">每天学习 ${p.goal || 20} 个单词</div>
          </div>
          <div class="profile-chip">ID · ${(p.name || "").slice(0, 3) || "NEW"}-${Math.abs(Math.floor((p.registeredAt || Date.now()) / 1000)) % 10000}</div>
          <button class="btn btn-ghost info-edit-btn" id="editInfoBtn" ${infoEditing ? "style='display:none'" : ""}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            修改
          </button>
        </div>

        <div class="info-grid" ${infoEditing ? "style='display:none'" : ""}>
          <div class="info-item">
            <div class="info-icon" style="color:var(--tz-primary);background:var(--tz-primary-soft)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div>
              <div class="info-label">邮箱</div>
              <div class="info-value">${emailText}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon" style="color:var(--tz-success);background:var(--tz-success-soft)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-1a8 8 0 0 1 16 0v1"></path></svg>
            </div>
            <div>
              <div class="info-label">性别</div>
              <div class="info-value">${genderText}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon" style="color:var(--tz-warning);background:var(--tz-warning-soft)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <div class="info-label">年龄</div>
              <div class="info-value">${ageText}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon" style="color:var(--tz-info);background:var(--tz-info-soft)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div>
              <div class="info-label">城市</div>
              <div class="info-value">${cityText}</div>
            </div>
          </div>
          <div class="info-item info-item-full">
            <div class="info-icon" style="color:var(--tz-info);background:var(--tz-info-soft)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div>
              <div class="info-label">注册时间</div>
              <div class="info-value">${regText}</div>
            </div>
          </div>
        </div>
      </div>

      <form class="info-form" id="infoForm" ${infoEditing ? "" : "style='display:none'"}>
        <div class="form-group">
          <label class="form-label" for="nameInput">昵称</label>
          <div class="avatar-preview">
            <span class="user-avatar" id="avatarPreview">${p.name.charAt(0)}</span>
            <input type="text" class="form-input" id="nameInput" value="${p.name}" maxlength="12" placeholder="输入昵称">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="emailInput">邮箱</label>
            <input type="email" class="form-input" id="emailInput" value="${p.email || ""}" placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label class="form-label" for="genderInput">性别</label>
            <select class="form-input" id="genderInput">
              <option ${genderText === "男" ? "selected" : ""}>男</option>
              <option ${genderText === "女" ? "selected" : ""}>女</option>
              <option ${genderText === "保密" ? "selected" : ""}>保密</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="ageInput">年龄</label>
            <input type="number" class="form-input" id="ageInput" value="${p.age || ""}" min="1" max="120" placeholder="例如 24">
          </div>
          <div class="form-group">
            <label class="form-label" for="cityInput">城市</label>
            <input type="text" class="form-input" id="cityInput" value="${p.city || ""}" maxlength="12" placeholder="例如 北京">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="goalInput">每日学习目标（个单词）</label>
          <input type="number" class="form-input" id="goalInput" value="${p.goal}" min="1" max="200" placeholder="20">
          <p class="form-hint">给自己定一个小目标，每天坚持完成</p>
        </div>
        <div class="form-actions" style="display:flex;gap:10px">
          <button type="submit" class="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            保存修改
          </button>
          <button type="button" class="btn btn-ghost" id="cancelEditBtn">取消</button>
        </div>
      </form>

      <div class="danger-zone">
        <div class="danger-title">重置数据</div>
        <div class="danger-desc">清空所有本地学习记录（已会、收藏、错误、手速），恢复初始示例数据。</div>
        <button class="btn btn-ghost" id="resetBtn" style="color:var(--tz-danger);border-color:var(--tz-danger)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
          重置全部数据
        </button>
      </div>`;

    const nameInput = $("#nameInput");
    nameInput.addEventListener("input", () => {
      $("#avatarPreview").textContent = (nameInput.value || "学").charAt(0);
    });

    $("#editInfoBtn")?.addEventListener("click", () => {
      infoEditing = true;
      renderInfo();
    });

    $("#cancelEditBtn")?.addEventListener("click", () => {
      infoEditing = false;
      renderInfo();
    });

    $("#infoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim() || "铁柱学员";
      const goal = Math.max(1, Math.min(200, parseInt($("#goalInput").value, 10) || 20));
      const email = $("#emailInput").value.trim();
      const gender = $("#genderInput").value;
      const age = Math.max(0, Math.min(120, parseInt($("#ageInput").value, 10) || 0));
      const city = $("#cityInput").value.trim();
      const patch = { name, goal, email, gender, age, city };
      if (!p.registeredAt) patch.registeredAt = Date.now();
      Store.updateProfile(patch);
      infoEditing = false;
      TZToast.show("保存成功", "success");
      renderInfo();
    });

    $("#resetBtn").addEventListener("click", () => {
      if (confirm("确定要清空所有学习记录并恢复初始数据吗？")) {
        Store.reset();
        TZToast.show("已重置全部数据", "success");
      }
    });
  }

  /* ---------- 切换与路由 ---------- */
  function setSection(key) {
    const item = MENU.find((m) => m.key === key) || MENU[0];
    activeKey = item.key;
    $("#panelTitle").innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
      ${item.title}`;
    $("#panelDesc").textContent = item.desc;

    $$(".panel-section").forEach((s) => s.classList.remove("active"));
    $(`#sec-${activeKey}`).classList.add("active");
    renderMenu();

    const renderMap = { known: renderKnown, favs: renderFavs, errors: renderErrors, speed: renderSpeed, info: renderInfo };
    renderMap[activeKey]();

    if (location.hash !== `#${activeKey}`) {
      history.replaceState(null, "", `#${activeKey}`);
    }
  }

  menuList.addEventListener("click", (e) => {
    const a = e.target.closest("[data-key]");
    if (a) setSection(a.dataset.key);
  });

  /* 已会 / 收藏列表操作 */
  document.addEventListener("click", (e) => {
    const rk = e.target.closest("[data-remove-known]");
    const rf = e.target.closest("[data-remove-fav]");
    if (rk) {
      Store.toggleKnown(rk.dataset.removeKnown);
      TZToast.show(`已移出已会列表`);
    } else if (rf) {
      Store.toggleFav(rf.dataset.removeFav);
      TZToast.show(`已取消收藏`);
    }
  });

  Store.onChange(() => {
    renderMenu();
    const renderMap = { known: renderKnown, favs: renderFavs, errors: renderErrors, speed: renderSpeed, info: renderInfo };
    renderMap[activeKey]();
  });

  window.addEventListener("hashchange", () => setSection(location.hash.slice(1) || "known"));
  setSection(location.hash.slice(1) || "known");
})();
