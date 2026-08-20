/* 铁柱英语 · 主题切换：跟随系统偏好 + 手动切换 + localStorage 记忆 */

(function () {
  const KEY = "tz_theme";

  function initialTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme, animate) {
    if (animate) {
      document.documentElement.classList.add("theme-anim");
      setTimeout(() => document.documentElement.classList.remove("theme-anim"), 400);
    }
    document.documentElement.setAttribute("data-theme", theme);
  }

  apply(initialTheme(), false);

  window.TZTheme = {
    toggle() {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      apply(next, true);
      return next;
    },
    get current() {
      return document.documentElement.getAttribute("data-theme");
    }
  };
})();
