/* 铁柱英语 · 登录页逻辑 */
(function () {
  /* 已登录则直接跳到 redirect（或首页） */
  if (Store.isLoggedIn) {
    goBack();
    return;
  }

  const tabs = $$(".auth-tab");
  const loginForm = $("#loginForm");
  const registerForm = $("#registerForm");
  const switchLinks = $$(".auth-switch");

  tabs.forEach((t) => {
    t.addEventListener("click", () => setTab(t.dataset.tab));
  });
  switchLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setTab(a.dataset.go);
    });
  });

  function setTab(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    loginForm.classList.toggle("active", name === "login");
    registerForm.classList.toggle("active", name === "register");
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $("#loginUser").value;
    const password = $("#loginPass").value;
    const res = Store.login({ username, password });
    if (!res.ok) { TZToast.show(res.msg, "danger"); return; }
    TZToast.show(`欢迎回来，${username}`, "success");
    setTimeout(goBack, 400);
  });

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $("#regUser").value;
    const email = $("#regEmail").value;
    const password = $("#regPass").value;
    const password2 = $("#regPass2").value;
    if (password !== password2) { TZToast.show("两次密码输入不一致", "danger"); return; }
    const res = Store.register({ username, password, email });
    if (!res.ok) { TZToast.show(res.msg, "danger"); return; }
    TZToast.show(`注册成功，欢迎 ${username}`, "success");
    setTimeout(goBack, 500);
  });

  function goBack() {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    /* 默认用相对路径，兼容 GitHub Pages 子路径部署（如 /english_web/） */
    let target = "index.html";
    if (redirect) {
      try {
        const url = new URL(decodeURIComponent(redirect), location.href);
        /* 仅允许同源跳转，防外站重定向 */
        if (url.origin === location.origin) {
          target = url.pathname + url.search + url.hash;
        }
      } catch (e) {}
    }
    location.href = target;
  }
})();
