/* 铁柱英语 · 打字射击游戏 */

(function () {
  const GameState = {
    IDLE: "idle",
    RUNNING: "running",
    PAUSED: "paused",
    OVER: "over"
  };

  const CONFIG = {
    spawnInterval: 1600,     // 单词生成间隔（毫秒）
    fallSpeedMin: 0.4,       // 下落最小速度 px/frame
    fallSpeedMax: 0.9,       // 下落最大速度
    shipMoveSpeed: 8,        // 飞船移动速度 px/frame
    bulletSpeed: 12          // 子弹速度 px/frame
  };

  /* ---------- 可调设置 ---------- */
  let speedMultiplier = 1;   // 下降速度倍率（实时生效）
  let gameDuration = 300;    // 游戏时长（秒），默认 5 分钟，开局生效

  /* ---------- 状态 ---------- */
  let state = GameState.IDLE;
  let score = 0;
  let hits = 0;
  let shots = 0;
  let timeLeft = gameDuration;
  let lastSpawn = 0;
  let lastFrame = 0;
  let rafId = null;

  const fallingWords = []; // { el, word, x, y, speed, id }
  const bullets = [];      // { el, x, y, targetId }  targetId 为 null 表示脱靶弹
  let nextId = 1;

  const keys = { left: false, right: false };
  let shipX = 0;

  /* ---------- DOM ---------- */
  const gameArea = $("#gameArea");
  const gameInput = $("#gameInput");
  const playerShip = $("#playerShip");
  const wordsLayer = $("#wordsLayer");
  const bulletsLayer = $("#bulletsLayer");
  const fxLayer = $("#fxLayer");
  const gameScore = $("#gameScore");
  const gameHits = $("#gameHits");
  const gameTime = $("#gameTime");
  const startOverlay = $("#gameStartOverlay");
  const pauseOverlay = $("#gamePauseOverlay");
  const overOverlay = $("#gameOverOverlay");
  const finalScore = $("#finalScore");
  const finalHits = $("#finalHits");
  const finalAcc = $("#finalAcc");
  const starsBg = $("#starsBg");

  /* ---------- 星空背景 ---------- */
  function createStars() {
    starsBg.innerHTML = "";
    const w = gameArea.clientWidth;
    const h = gameArea.clientHeight;
    const count = Math.floor((w * h) / 3000);
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "star";
      const size = Math.random() * 2 + 0.5;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 3 + "s";
      starsBg.appendChild(s);
    }
  }

  /* ---------- 工具 ---------- */
  const rand = (min, max) => Math.random() * (max - min) + min;

  function fmtTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function pickWord() {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    return w.id;
  }

  /* ---------- 重置 ---------- */
  function reset() {
    fallingWords.length = 0;
    bullets.length = 0;
    wordsLayer.innerHTML = "";
    bulletsLayer.innerHTML = "";
    fxLayer.innerHTML = "";
    score = 0;
    hits = 0;
    shots = 0;
    timeLeft = gameDuration;
    lastSpawn = 0;
    updateHUD();
  }

  function updateHUD() {
    gameScore.textContent = score;
    gameHits.textContent = hits;
    gameTime.textContent = fmtTime(timeLeft);
  }

  /* ---------- 单词生成 ---------- */
  function spawnWord() {
    const word = pickWord();
    const el = document.createElement("div");
    el.className = "falling-word";
    el.textContent = word;
    wordsLayer.appendChild(el);

    const wordW = el.offsetWidth;
    const areaW = gameArea.clientWidth;
    const x = rand(wordW + 10, areaW - wordW - 10);

    fallingWords.push({
      el,
      word,
      x,
      y: -30,
      speed: rand(CONFIG.fallSpeedMin, CONFIG.fallSpeedMax),
      id: nextId++
    });
  }

  /* ---------- 子弹发射 ---------- */
  function fireBullet(targetObj) {
    shots++;
    const shipRect = playerShip.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    const x = shipRect.left - areaRect.left + shipRect.width / 2;
    const y = shipRect.top - areaRect.top;

    const el = document.createElement("div");
    el.className = "bullet";
    el.style.left = (x - 2) + "px";
    el.style.top = y + "px";
    bulletsLayer.appendChild(el);

    bullets.push({ el, x, y, targetId: targetObj ? targetObj.id : null });
  }

  /* ---------- 命中处理 ---------- */
  function hitWord(w) {
    const wx = w.x + w.el.offsetWidth / 2;
    const wy = w.y + w.el.offsetHeight / 2;
    createExplosion(wx, wy, "+10");
    w.el.classList.add("hit");
    const idx = fallingWords.indexOf(w);
    if (idx >= 0) fallingWords.splice(idx, 1);
    score += 10;
    hits++;
    updateHUD();
    setTimeout(() => w.el.remove(), 300);
  }

  /* 脱靶抖动反馈 */
  function missFeedback() {
    gameInput.classList.remove("miss-shake");
    void gameInput.offsetWidth; // 重置动画
    gameInput.classList.add("miss-shake");
    setTimeout(() => gameInput.classList.remove("miss-shake"), 450);
  }

  /* ---------- 爆炸特效 ---------- */
  function createExplosion(x, y, text) {
    const fx = document.createElement("div");
    fx.className = "explosion";
    fx.style.left = x + "px";
    fx.style.top = y + "px";
    fx.innerHTML = `
      <div class="explosion-ring"></div>
      <div class="explosion-particle" style="--dx:-30px;--dy:-30px"></div>
      <div class="explosion-particle" style="--dx:30px;--dy:-30px"></div>
      <div class="explosion-particle" style="--dx:-30px;--dy:30px"></div>
      <div class="explosion-particle" style="--dx:30px;--dy:30px"></div>
      <div class="explosion-particle" style="--dx:0px;--dy:-40px"></div>
      <div class="explosion-particle" style="--dx:0px;--dy:40px"></div>
    `;
    fxLayer.appendChild(fx);
    setTimeout(() => fx.remove(), 600);

    if (text) {
      const pop = document.createElement("div");
      pop.className = "score-popup";
      pop.textContent = text;
      pop.style.left = x + "px";
      pop.style.top = y + "px";
      fxLayer.appendChild(pop);
      setTimeout(() => pop.remove(), 800);
    }
  }

  /* ---------- 游戏主循环 ---------- */
  function loop(timestamp) {
    if (state !== GameState.RUNNING) return;

    if (!lastFrame) lastFrame = timestamp;
    const dt = timestamp - lastFrame;
    lastFrame = timestamp;

    /* 倒计时（每帧约 16ms，累计到秒） */
    if (!loop._tickAcc) loop._tickAcc = 0;
    loop._tickAcc += dt;
    if (loop._tickAcc >= 1000) {
      loop._tickAcc -= 1000;
      timeLeft--;
      updateHUD();
      if (timeLeft <= 0) {
        endGame();
        return;
      }
    }

    /* 生成单词 */
    if (!lastSpawn) lastSpawn = timestamp;
    const interval = Math.max(700, CONFIG.spawnInterval - (gameDuration - timeLeft) * 2);
    if (timestamp - lastSpawn > interval) {
      spawnWord();
      lastSpawn = timestamp;
    }

    const areaH = gameArea.clientHeight;

    /* 更新下落单词（速度受倍率实时控制） */
    for (let i = fallingWords.length - 1; i >= 0; i--) {
      const w = fallingWords[i];
      w.y += w.speed * speedMultiplier * (dt / 16);
      w.el.style.top = w.y + "px";
      w.el.style.left = w.x + "px";

      if (w.y > areaH + 40) {
        w.el.remove();
        fallingWords.splice(i, 1);
      }
    }

    /* 更新子弹 */
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      const step = CONFIG.bulletSpeed * (dt / 16);

      if (b.targetId !== null) {
        /* 制导弹：追踪锁定的目标单词，必中 */
        const t = fallingWords.find((w) => w.id === b.targetId);
        if (t) {
          const tx = t.x + t.el.offsetWidth / 2;
          const ty = t.y + t.el.offsetHeight / 2;
          const dx = tx - b.x;
          const dy = ty - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= step) {
            hitWord(t);
            b.el.remove();
            bullets.splice(i, 1);
            continue;
          }
          b.x += (dx / dist) * step;
          b.y += (dy / dist) * step;
          b.el.style.left = (b.x - 2) + "px";
          b.el.style.top = b.y + "px";
          continue;
        }
        /* 目标已被摧毁：转为直飞脱靶弹 */
        b.targetId = null;
      }

      /* 脱靶弹：直线上飞，不会命中任何单词 */
      b.y -= step;
      b.el.style.top = b.y + "px";
      if (b.y < -20) {
        b.el.remove();
        bullets.splice(i, 1);
      }
    }

    /* 飞船移动 */
    const areaW = gameArea.clientWidth;
    const move = CONFIG.shipMoveSpeed * (dt / 16);
    if (keys.left) shipX -= move;
    if (keys.right) shipX += move;
    const shipW = playerShip.offsetWidth;
    shipX = Math.max(shipW / 2, Math.min(areaW - shipW / 2, shipX));
    playerShip.style.left = shipX + "px";

    rafId = requestAnimationFrame(loop);
  }

  /* ---------- 开始 / 暂停 / 结束 ---------- */
  function startGame() {
    reset();
    startOverlay.style.display = "none";
    overOverlay.style.display = "none";
    pauseOverlay.style.display = "none";
    gameInput.disabled = false;
    gameInput.value = "";
    shipX = gameArea.clientWidth / 2;
    playerShip.style.left = shipX + "px";
    state = GameState.RUNNING;
    lastFrame = 0;
    lastSpawn = 0;
    loop._tickAcc = 0;
    gameInput.focus();
    rafId = requestAnimationFrame(loop);
  }

  function pauseGame() {
    if (state !== GameState.RUNNING) return;
    state = GameState.PAUSED;
    pauseOverlay.style.display = "flex";
    cancelAnimationFrame(rafId);
  }

  function resumeGame() {
    if (state !== GameState.PAUSED) return;
    state = GameState.RUNNING;
    pauseOverlay.style.display = "none";
    lastFrame = 0;
    gameInput.focus();
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    state = GameState.OVER;
    cancelAnimationFrame(rafId);
    gameInput.disabled = true;
    gameInput.value = "";

    finalScore.textContent = score;
    finalHits.textContent = hits;
    const acc = shots > 0 ? Math.round((hits / shots) * 100) : 0;
    finalAcc.textContent = acc + "%";
    overOverlay.style.display = "flex";

    if (hits > 0) TZToast.show(`游戏结束！命中 ${hits} 个单词，得分 ${score}`, "success");
  }

  /* ---------- 输入事件 ---------- */
  gameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && state === GameState.RUNNING) {
      const val = gameInput.value.trim().toLowerCase();
      if (!val) return;

      /* 仅锁定与输入完全一致的单词（多个同名时取最靠下的） */
      let target = null;
      let maxY = -Infinity;
      for (const w of fallingWords) {
        if (w.word.toLowerCase() === val && w.y > maxY) {
          target = w;
          maxY = w.y;
        }
      }

      if (target) {
        fireBullet(target); // 制导弹，必中目标
      } else {
        fireBullet(null);   // 脱靶弹，不命中、不计命中数
        missFeedback();
      }
      gameInput.value = "";
    }
  });

  /* ---------- 键盘事件 ---------- */
  document.addEventListener("keydown", (e) => {
    if (state === GameState.RUNNING) {
      if (e.key === "ArrowLeft") { keys.left = true; e.preventDefault(); }
      if (e.key === "ArrowRight") { keys.right = true; e.preventDefault(); }
      if (e.key === "Escape") { pauseGame(); }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
  });

  /* ---------- 设置：下降速度（实时生效） ---------- */
  const speedChips = $$("#speedChips .setting-chip");
  speedChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      speedChips.forEach((c) => c.classList.toggle("active", c === chip));
      speedMultiplier = parseFloat(chip.dataset.speed);
    });
  });

  /* ---------- 设置：游戏时长（下一局生效） ---------- */
  const timeChips = $$("#timeChips .setting-chip");
  const customTimeInput = $("#customTimeInput");

  function isPlaying() {
    return state === GameState.RUNNING || state === GameState.PAUSED;
  }

  timeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      timeChips.forEach((c) => c.classList.toggle("active", c === chip));
      customTimeInput.value = "";
      const mins = parseInt(chip.dataset.min, 10);
      gameDuration = mins * 60;
      if (isPlaying()) {
        TZToast.show(`时长已设为 ${mins} 分钟，下一局生效`);
      } else {
        timeLeft = gameDuration;
        updateHUD();
      }
    });
  });

  customTimeInput.addEventListener("change", () => {
    const mins = parseInt(customTimeInput.value, 10);
    if (!mins || mins < 1) {
      customTimeInput.value = "";
      return;
    }
    const clamped = Math.min(30, mins);
    customTimeInput.value = clamped;
    gameDuration = clamped * 60;
    timeChips.forEach((c) => c.classList.remove("active"));
    if (isPlaying()) {
      TZToast.show(`时长已设为 ${clamped} 分钟，下一局生效`);
    } else {
      timeLeft = gameDuration;
      updateHUD();
    }
  });

  /* ---------- 按钮绑定 ---------- */
  $("#gameStartBtn").addEventListener("click", startGame);
  $("#gamePauseBtn").addEventListener("click", () => {
    if (state === GameState.RUNNING) pauseGame();
    else if (state === GameState.PAUSED) resumeGame();
  });
  $("#gameEndBtn").addEventListener("click", () => {
    if (state === GameState.RUNNING || state === GameState.PAUSED) endGame();
  });
  $("#gameResumeBtn").addEventListener("click", resumeGame);
  $("#gameRestartBtn").addEventListener("click", startGame);

  /* ---------- 模式切换 ---------- */
  const modeBtns = $$(".mode-btn");
  const practicePanel = $("#practicePanel");
  const gamePanel = $("#gamePanel");

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      modeBtns.forEach((b) => b.classList.toggle("active", b === btn));
      if (mode === "game") {
        practicePanel.style.display = "none";
        gamePanel.style.display = "block";
        createStars();
      } else {
        gamePanel.style.display = "none";
        practicePanel.style.display = "block";
        if (state === GameState.RUNNING) pauseGame();
      }
    });
  });

  /* ---------- 响应式 ---------- */
  window.addEventListener("resize", () => {
    if (starsBg.childElementCount === 0 || Math.abs(starsBg.childElementCount - (gameArea.clientWidth * gameArea.clientHeight / 3000)) > 5) {
      createStars();
    }
  });

  /* ---------- 初始化 ---------- */
  createStars();
})();
