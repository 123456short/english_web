/* 铁柱英语 · 数据层
   - 账号存储：全局 localStorage key = tz_english_users_v1（所有账号，跨用户共享的注册表）
   - 会话存储：sessionStorage key = tz_english_session（当前登录 userId，刷新保持）
   - 用户数据：localStorage key = tz_english_db_${userId}_v1（每个用户独立一份）
*/

const Store = (() => {
  const USERS_KEY = "tz_english_users_v1";
  const SESSION_KEY = "tz_english_session";
  const USER_DATA_PREFIX = "tz_english_db_";
  const USER_DATA_SUFFIX = "_v1";
  const listeners = [];

  function userDataKey(userId) {
    return `${USER_DATA_PREFIX}${userId}${USER_DATA_SUFFIX}`;
  }

  /* ---------- 账号系统（全局共享注册表） ---------- */
  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function hash(pwd) {
    /* 简单哈希（非加密级，但足够避免明文存密码；单浏览器场景够用） */
    let h = 2166136261;
    for (let i = 0; i < pwd.length; i++) {
      h ^= pwd.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36) + "_" + pwd.length;
  }
  function genUserId() {
    return "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- 首次访问的种子数据，保证各板块开箱即有内容可交互 ---------- */
  function seed(profileOverride) {
    const now = Date.now();
    const day = 86400000;
    const baseProfile = {
      name: profileOverride?.name || "新学员",
      goal: 20,
      email: profileOverride?.email || "",
      gender: profileOverride?.gender || "保密",
      age: profileOverride?.age || 0,
      city: profileOverride?.city || "",
      registeredAt: profileOverride?.registeredAt || now
    };
    return {
      profile: baseProfile,
      known: [],
      favs: [],
      errors: {},
      speeds: []
    };
  }

  function loadUserDb(userId, profileForSeed) {
    const key = userDataKey(userId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const fresh = seed(profileForSeed);
        localStorage.setItem(key, JSON.stringify(fresh));
        return fresh;
      }
      const db = JSON.parse(raw);
      const seeded = seed(profileForSeed);
      const oldProfile = db.profile || {};
      const merged = {
        profile: Object.assign({}, seeded.profile, oldProfile),
        known: db.known || seeded.known,
        favs: db.favs || seeded.favs,
        errors: db.errors || seeded.errors,
        speeds: db.speeds || seeded.speeds
      };
      if (
        oldProfile.email === undefined ||
        oldProfile.gender === undefined ||
        oldProfile.age === undefined ||
        oldProfile.city === undefined ||
        oldProfile.registeredAt === undefined
      ) {
        localStorage.setItem(key, JSON.stringify(merged));
      }
      return merged;
    } catch (e) {
      return seed(profileForSeed);
    }
  }

  /* ---------- 会话：当前登录用户 ---------- */
  let currentUserId = null;
  let db = null;

  function readSession() {
    try { return sessionStorage.getItem(SESSION_KEY); }
    catch (e) { return null; }
  }
  function writeSession(userId) {
    try { sessionStorage.setItem(SESSION_KEY, userId); } catch (e) {}
  }
  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function activateUser(userId, profileForSeed) {
    currentUserId = userId;
    db = loadUserDb(userId, profileForSeed);
    listeners.forEach((fn) => fn("session"));
  }

  function bootstrap() {
    const uid = readSession();
    if (uid) {
      activateUser(uid);
    }
  }
  bootstrap();

  function save(changedKey) {
    if (!currentUserId) return;
    localStorage.setItem(userDataKey(currentUserId), JSON.stringify(db));
    listeners.forEach((fn) => fn(changedKey));
  }

  return {
    /* 订阅数据变化 */
    onChange(fn) { listeners.push(fn); },

    /* ---------- 会话 / 登录 / 注册 ---------- */
    get currentUserId() { return currentUserId; },
    get isLoggedIn() { return !!currentUserId; },

    requireLogin(redirectIfFail) {
      if (this.isLoggedIn) return true;
      if (redirectIfFail) {
        const back = encodeURIComponent(location.pathname + location.search + location.hash);
        location.href = `login.html?redirect=${back}`;
      }
      return false;
    },

    register({ username, password, email }) {
      username = (username || "").trim();
      password = (password || "");
      email = (email || "").trim();
      if (username.length < 2) return { ok: false, msg: "用户名至少 2 位" };
      if (password.length < 4) return { ok: false, msg: "密码至少 4 位" };
      const users = loadUsers();
      if (users[username.toLowerCase()]) return { ok: false, msg: "用户名已存在" };
      const userId = genUserId();
      const now = Date.now();
      const user = {
        id: userId,
        username: username.toLowerCase(),
        displayName: username,
        email,
        passwordHash: hash(password),
        createdAt: now
      };
      users[user.username] = user;
      saveUsers(users);
      /* 写入该用户的数据文件，用注册信息做 profile 种子 */
      activateUser(userId, { name: user.displayName, email: user.email, registeredAt: now });
      writeSession(userId);
      return { ok: true, userId };
    },

    login({ username, password }) {
      username = (username || "").trim().toLowerCase();
      password = (password || "");
      const users = loadUsers();
      const u = users[username];
      if (!u) return { ok: false, msg: "用户名不存在" };
      if (u.passwordHash !== hash(password)) return { ok: false, msg: "密码错误" };
      activateUser(u.id, { name: u.displayName, email: u.email, registeredAt: u.createdAt });
      writeSession(u.id);
      return { ok: true, userId: u.id };
    },

    logout() {
      currentUserId = null;
      db = null;
      clearSession();
      listeners.forEach((fn) => fn("session"));
    },

    /* 当前登录账号元信息（用于顶部显示用户名、登出等） */
    getAccountInfo() {
      if (!currentUserId) return null;
      const users = loadUsers();
      for (const key in users) {
        if (users[key].id === currentUserId) {
          return {
            id: users[key].id,
            username: users[key].username,
            displayName: users[key].displayName,
            email: users[key].email,
            createdAt: users[key].createdAt
          };
        }
      }
      return null;
    },

    /* ---------- 业务数据（基于当前登录用户） ---------- */
    get profile() {
      if (!db) return seed().profile;
      return db.profile;
    },
    get known() { return db ? db.known : []; },
    get favs() { return db ? db.favs : []; },
    get errors() { return db ? db.errors : {}; },
    get speeds() { return db ? db.speeds : []; },

    isKnown(id) { return db ? db.known.includes(id) : false; },
    isFav(id) { return db ? db.favs.includes(id) : false; },

    toggleKnown(id) {
      if (!db) return false;
      const i = db.known.indexOf(id);
      if (i >= 0) db.known.splice(i, 1);
      else db.known.push(id);
      save("known");
      return i < 0;
    },

    toggleFav(id) {
      if (!db) return false;
      const i = db.favs.indexOf(id);
      if (i >= 0) db.favs.splice(i, 1);
      else db.favs.push(id);
      save("favs");
      return i < 0;
    },

    addError(word) {
      if (!db) return;
      db.errors[word] = (db.errors[word] || 0) + 1;
      save("errors");
    },

    addSpeed(record) {
      if (!db) return;
      db.speeds.push(record);
      if (db.speeds.length > 30) db.speeds.shift();
      save("speeds");
    },

    updateProfile(patch) {
      if (!db) return;
      db.profile = Object.assign(db.profile, patch);
      save("profile");
    },

    reset() {
      if (!currentUserId) return;
      db = seed(db.profile);
      save("all");
    }
  };
})();

/* 通用工具 */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function fmtDate(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function findWord(id) {
  return WORDS.find((w) => w.id === id);
}
