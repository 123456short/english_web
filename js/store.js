/* 铁柱英语 · 数据层：localStorage 持久化 + 订阅通知 */

const Store = (() => {
  const KEY = "tz_english_db_v1";
  const listeners = [];

  /* 首次访问的种子数据，保证各板块开箱即有内容可交互 */
  function seed() {
    const now = Date.now();
    const day = 86400000;
    return {
      profile: {
        name: "王龙翔",
        goal: 20,
        email: "wanglongxiang@example.com",
        gender: "男",
        age: 24,
        city: "北京",
        registeredAt: now - day * 12
      },
      known: ["achieve", "curious", "improve", "remember", "understand", "balance", "benefit", "knowledge"],
      favs: ["opportunity", "recommend", "look forward to", "challenge", "efficient"],
      errors: { "environment": 3, "circumstance": 2, "gradually": 4, "appreciate": 1, "familiar": 2 },
      speeds: [
        { wpm: 28, acc: 92, ts: now - day * 9, sentence: "Practice makes perfect." },
        { wpm: 33, acc: 94, ts: now - day * 8, sentence: "Rome was not built in a day." },
        { wpm: 31, acc: 90, ts: now - day * 6, sentence: "Actions speak louder than words." },
        { wpm: 38, acc: 95, ts: now - day * 4, sentence: "Knowledge is the best investment." },
        { wpm: 41, acc: 93, ts: now - day * 2, sentence: "Learn something new every day." }
      ]
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        const fresh = seed();
        localStorage.setItem(KEY, JSON.stringify(fresh));
        return fresh;
      }
      const db = JSON.parse(raw);
      const seeded = seed();
      /* 深合并 profile，兼容新增字段（email/gender/age/city/registeredAt） */
      const oldProfile = db.profile || {};
      const merged = {
        profile: Object.assign({}, seeded.profile, oldProfile),
        known: db.known || seeded.known,
        favs: db.favs || seeded.favs,
        errors: db.errors || seeded.errors,
        speeds: db.speeds || seeded.speeds
      };
      /* 如有迁移（profile 缺少新增字段），写回 localStorage */
      if (
        oldProfile.email === undefined ||
        oldProfile.gender === undefined ||
        oldProfile.age === undefined ||
        oldProfile.city === undefined ||
        oldProfile.registeredAt === undefined
      ) {
        localStorage.setItem(KEY, JSON.stringify(merged));
      }
      return merged;
    } catch (e) {
      return seed();
    }
  }

  let db = load();

  function save(changedKey) {
    localStorage.setItem(KEY, JSON.stringify(db));
    listeners.forEach((fn) => fn(changedKey));
  }

  return {
    /* 订阅数据变化 */
    onChange(fn) { listeners.push(fn); },

    get profile() { return db.profile; },
    get known() { return db.known; },
    get favs() { return db.favs; },
    get errors() { return db.errors; },
    get speeds() { return db.speeds; },

    isKnown(id) { return db.known.includes(id); },
    isFav(id) { return db.favs.includes(id); },

    toggleKnown(id) {
      const i = db.known.indexOf(id);
      if (i >= 0) db.known.splice(i, 1);
      else db.known.push(id);
      save("known");
      return i < 0;
    },

    toggleFav(id) {
      const i = db.favs.indexOf(id);
      if (i >= 0) db.favs.splice(i, 1);
      else db.favs.push(id);
      save("favs");
      return i < 0;
    },

    addError(word) {
      db.errors[word] = (db.errors[word] || 0) + 1;
      save("errors");
    },

    addSpeed(record) {
      db.speeds.push(record);
      if (db.speeds.length > 30) db.speeds.shift();
      save("speeds");
    },

    updateProfile(patch) {
      db.profile = Object.assign(db.profile, patch);
      save("profile");
    },

    reset() {
      db = seed();
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
