/* 铁柱英语 · 共享顶栏渲染（含导航 / 主题切换 / 移动端抽屉） */

(function () {
  const icons = {
    words: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path></svg>',
    typing: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8h2M10 8h2M14 8h2M6 12h2M10 12h2M14 12h2M18 12h2M6 16h2M10 16h2M14 16h2"></path></svg>',
    reading: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    profile: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
  };

  const NAV = [
    { href: "index.html", key: "words", label: "单词汇总" },
    { href: "typing.html", key: "typing", label: "打字练习" },
    { href: "reading.html", key: "reading", label: "每日一读" },
    { href: "profile.html", key: "profile", label: "个人中心" }
  ];

  function renderHeader() {
    const page = document.body.dataset.page;

    /* 登录页不显示顶栏（它有自己的 auth card） */
    if (page === "login") return;

    /* 登录守卫：未登录 -> 跳登录页 */
    if (window.Store && !Store.isLoggedIn) {
      const back = encodeURIComponent(location.pathname + location.search + location.hash);
      location.href = `login.html?redirect=${back}`;
      return;
    }

    const acc = (window.Store && Store.getAccountInfo()) || null;
    const name = acc ? acc.displayName : "学";
    const initial = name.charAt(0);

    const navLinks = NAV.map((n) =>
      `<a href="${n.href}" class="${page === n.key ? "active" : ""}">${icons[n.key]}${n.label}</a>`
    ).join("");

    document.body.insertAdjacentHTML("afterbegin", `
      <header class="header">
        <div class="header-inner">
          <a href="index.html" class="logo">
            <span class="logo-icon">A+</span>
            <span>铁柱英语</span>
          </a>
          <nav class="nav">${navLinks}</nav>
          <div class="header-actions">
            <button class="theme-toggle" id="themeToggle" title="切换深色 / 浅色" aria-label="切换深色浅色主题">
              <svg class="icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
              <svg class="icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
            <div class="user-dropdown" id="userDropdown">
              <button class="user-status" id="userBtn">
                <span class="user-avatar">${initial}</span>
                <span>${name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="user-menu" id="userMenu">
                <a href="profile.html">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-1a8 8 0 0 1 16 0v1"></path></svg>
                  个人中心
                </a>
                <button type="button" id="logoutBtn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  退出登录
                </button>
              </div>
            </div>
            <button class="menu-toggle" id="menuToggle" aria-label="打开菜单">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <div class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-mask" data-close></div>
        <div class="mobile-nav-panel">
          <a href="index.html" class="logo">
            <span class="logo-icon">A+</span>
            <span>铁柱英语</span>
          </a>
          ${NAV.map((n) => `
            <a href="${n.href}" class="${page === n.key ? "active" : ""}">${icons[n.key]}${n.label}</a>
          `).join("")}
          <button type="button" class="mobile-logout" id="mobileLogoutBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            退出登录
          </button>
        </div>
      </div>
    `);

    $("#themeToggle").addEventListener("click", () => {
      const t = window.TZTheme.toggle();
      window.TZToast && TZToast.show(t === "dark" ? "已切换到深色模式" : "已切换到浅色模式");
    });

    $("#menuToggle").addEventListener("click", () => {
      $("#mobileNav").classList.add("open");
    });

    $("#mobileNav").addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) $("#mobileNav").classList.remove("open");
    });

    const userBtn = $("#userBtn");
    const userMenu = $("#userMenu");
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("open");
    });
    document.addEventListener("click", () => userMenu.classList.remove("open"));

    function doLogout() {
      if (Store.isLoggedIn) {
        Store.logout();
        TZToast.show("已退出登录", "info");
      }
      location.href = "login.html";
    }
    $("#logoutBtn").addEventListener("click", doLogout);
    $("#mobileLogoutBtn")?.addEventListener("click", doLogout);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeader);
  } else {
    renderHeader();
  }
})();
