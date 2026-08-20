/* 每日一读：按日轮换 / 生词点击 / 翻译对照 / 朗读 */

(function () {
  const reading = READINGS[Math.floor(Date.now() / 86400000) % READINGS.length];
  const bodyEl = $("#rBody");
  const transEl = $("#rTrans");

  $("#rTitle").textContent = reading.title;
  $("#rTag").textContent = reading.tag;

  /* 建立 id -> 词 的索引（短语优先匹配） */
  const phrases = WORDS.filter((w) => w.pos === "phrase").sort((a, b) => b.id.length - a.id.length);
  const singles = new Map(WORDS.filter((w) => w.pos !== "phrase").map((w) => [w.id, w]));

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function markParagraph(text) {
    let html = esc(text);

    /* 1. 先替换短语，用占位符保护 */
    const phraseSlots = [];
    phrases.forEach((p, i) => {
      const re = new RegExp(`\\b${p.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      html = html.replace(re, () => {
        phraseSlots.push(p);
        return `\u0000${phraseSlots.length - 1}\u0000`;
      });
    });

    /* 2. 逐词处理普通单词 */
    html = html.replace(/[A-Za-z][A-Za-z'-]*/g, (raw) => {
      const w = singles.get(raw.toLowerCase());
      if (!w) return raw;
      return wordSpan(w, raw);
    });

    /* 3. 还原短语占位符 */
    html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => wordSpan(phraseSlots[i], phraseSlots[i].id));
    return html;
  }

  function wordSpan(w, display) {
    const known = Store.isKnown(w.id) ? " known" : "";
    return `<span class="w${known}" data-word="${w.id}">${display}</span>`;
  }

  function render() {
    bodyEl.innerHTML = reading.paragraphs.map((p) => `<p>${markParagraph(p)}</p>`).join("");
    transEl.innerHTML = reading.trans.map((t) => `<p>${t}</p>`).join("");
  }

  /* 点击生词 -> 弹窗 */
  bodyEl.addEventListener("click", (e) => {
    const span = e.target.closest("[data-word]");
    if (!span) return;
    const w = findWord(span.dataset.word);
    if (w) TZWordModal.open(w);
  });

  /* 翻译开关 */
  const transBtn = $("#transBtn");
  transBtn.addEventListener("click", () => {
    const show = transEl.classList.toggle("show");
    transBtn.innerHTML = show
      ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></svg><line x1="1" y1="1" x2="23" y2="23"></line> 隐藏翻译'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> 显示翻译';
  });

  /* 朗读（浏览器语音合成） */
  $("#speakBtn").addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      TZToast.show("当前浏览器不支持朗读功能");
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(reading.paragraphs.join(" "));
    u.lang = "en-US";
    u.rate = 0.92;
    speechSynthesis.speak(u);
    TZToast.show("开始朗读…");
  });

  Store.onChange(render);
  render();
})();
