/* 打字练习：逐字校对 / WPM 统计 / 错词自动记录 */

(function () {
  const sentenceEl = $("#sentence");
  const inputEl = $("#typingInput");
  const cnEl = $("#sentenceCn");
  const resultEl = $("#typingResult");
  const hintText = $("#hintText");

  let current = null;
  let startTime = null;
  let finished = false;
  let wrongCount = 0;

  function pick() {
    return TYPING_SENTENCES[Math.floor(Math.random() * TYPING_SENTENCES.length)];
  }

  function newRound() {
    current = pick();
    finished = false;
    startTime = null;
    wrongCount = 0;
    resultEl.classList.remove("show");
    cnEl.textContent = current.cn;
    hintText.style.display = "";
    inputEl.value = "";
    inputEl.disabled = false;
    renderSentence(0);
  }

  function renderSentence(typedCount) {
    sentenceEl.innerHTML = Array.from(current.text).map((ch, i) => {
      let cls = "pending";
      if (i < typedCount) cls = inputEl.value[i] === ch ? "correct" : "wrong";
      if (i === typedCount) cls += " current";
      const esc = ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch;
      return `<span class="ch ${cls}">${esc === " " ? "&nbsp;" : esc}</span>`;
    }).join("");
  }

  function finish() {
    finished = true;
    inputEl.disabled = true;

    const typed = inputEl.value;
    const secs = startTime ? (Date.now() - startTime) / 1000 : 0;
    const minutes = secs / 60;
    const totalLen = current.text.length;

    /* 以整个句子字母总数为分母：未打的字母也算错误 */
    let correct = 0;
    const wordErrorMap = {};
    const wordsInSentence = current.text.split(/\s+/);
    let idx = 0;
    wordsInSentence.forEach((wd) => {
      const start = idx, end = idx + wd.length;
      let wordWrong = false;
      for (let i = start; i < end; i++) {
        const expected = current.text[i];
        const t = typed[i];
        const isWrong = t === undefined ? true : t !== expected;
        if (!isWrong) correct++;
        else if (/[a-zA-Z]/.test(expected)) wordWrong = true;
      }
      if (wordWrong) {
        const key = wd.replace(/[^a-zA-Z' -]/g, "").toLowerCase();
        if (key) wordErrorMap[key] = (wordErrorMap[key] || 0) + 1;
      }
      idx = end + 1;
    });

    wrongCount = totalLen - correct;
    const wpm = Math.max(0, Math.round(correct / 5 / minutes) || 0);
    const acc = totalLen > 0 ? Math.round((correct / totalLen) * 100) : 0;

    $("#rWpm").textContent = wpm;
    $("#rAcc").textContent = acc + "%";
    $("#rTime").textContent = secs.toFixed(1) + "s";
    $("#rErr").textContent = wrongCount;

    /* 将错误单词累计进"我的错误" */
    Object.entries(wordErrorMap).forEach(([w, n]) => {
      for (let k = 0; k < n; k++) Store.addError(w);
    });

    Store.addSpeed({ wpm, acc, ts: Date.now(), sentence: current.text });

    hintText.style.display = "none";
    resultEl.classList.add("show");
    inputEl.disabled = false;

    if (acc === 100) TZToast.show("全对！太棒了", "success");
    else if (wrongCount > 0) TZToast.show(`错 ${wrongCount} 个字母，已记入 ${Object.keys(wordErrorMap).length} 个错误单词`, "danger");
  }

  inputEl.addEventListener("input", () => {
    if (finished) return;
    if (!startTime && inputEl.value.length > 0) startTime = Date.now();

    if (inputEl.value.length >= current.text.length) {
      renderSentence(current.text.length);
      finish();
      return;
    }
    renderSentence(inputEl.value.length);
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && inputEl.value.length > 0 && !finished) {
      inputEl.value = current.text.slice(0, Math.max(inputEl.value.length, 0));
      finish();
    }
  });

  $("#nextBtn").addEventListener("click", () => {
    newRound();
    inputEl.focus();
  });

  $("#againBtn").addEventListener("click", () => {
    newRound();
    inputEl.focus();
  });

  newRound();
})();
