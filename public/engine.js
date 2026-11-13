// Аналитический движок «Өлшем». Чистый JS без зависимостей и без нейросетей:
// работает и в браузере (данные школ не покидают компьютер), и в Node для тестов.

export const FAIL = 40;      // ниже 40% за СОР — тема не освоена
export const MASTERED = 85;  // от 85% — освоена уверенно

// ---------- случайные числа с зерном (демо всегда одинаковое) ----------
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.normal = () => {
    const u = Math.max(next(), 1e-12), v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return next;
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
const sd = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};
const quantile = (sorted, q) => {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
};
const median = (a) => quantile([...a].sort((x, y) => x - y), 0.5);

// ---------- демо-данные: Алгебра, 7 класс, Жамбылская область ----------
export const DEMO_TOPICS = [
  { id: 'T1', ru: 'Степень с натуральным показателем', kz: 'Натурал көрсеткішті дәреже', plan: 10 },
  { id: 'T2', ru: 'Одночлены', kz: 'Бірмүшелер', plan: 9 },
  { id: 'T3', ru: 'Многочлены', kz: 'Көпмүшелер', plan: 12 },
  { id: 'T4', ru: 'Формулы сокращённого умножения', kz: 'Қысқаша көбейту формулалары', plan: 12 },
  { id: 'T5', ru: 'Разложение многочлена на множители', kz: 'Көпмүшені көбейткіштерге жіктеу', plan: 11 },
  { id: 'T6', ru: 'Алгебраические дроби', kz: 'Алгебралық бөлшектер', plan: 12 },
  { id: 'T7', ru: 'Функция. Линейная функция', kz: 'Функция. Сызықтық функция', plan: 12 },
  { id: 'T8', ru: 'Системы линейных уравнений', kz: 'Сызықтық теңдеулер жүйесі', plan: 13 },
  { id: 'T9', ru: 'Элементы статистики', kz: 'Статистика элементтері', plan: 9 },
];

export function generateDemo(seed = 2026) {
  const r = rng(seed);
  // Скрытая «правда», которую аналитика должна найти сама.
  const base = { T1: 74, T2: 76, T3: 66, T4: 61, T5: 48, T6: 45, T7: 63, T8: 56, T9: 73 };
  const hoursGain = { T1: 3, T2: 2, T3: 10, T4: 12, T5: 24, T6: 26, T7: 12, T8: 16, T9: 2 };
  const prereq = { T4: 'T3', T5: 'T4', T6: 'T5', T8: 'T7' };
  const book = {
    'А': { T5: 2, T7: -7 },
    'Ә': { T4: 3, T5: 6, T6: 8 },
    'Б': { T1: -2, T2: -2, T3: -2, T4: -2, T5: -3, T6: -6, T7: -1, T8: -5, T9: -1 },
  };
  const districts = [['г. Тараз', 8], ['Байзакский р-н', 4], ['Жамбылский р-н', 4], ['Кордайский р-н', 4], ['Шуский р-н', 4]];
  const nums = [3, 7, 12, 14, 19, 26, 33, 41, 5, 9, 17, 22, 2, 11, 28, 30, 4, 8, 15, 21, 6, 13, 24, 35];

  const schools = [];
  let k = 0;
  for (const [district, n] of districts) {
    for (let i = 0; i < n; i++) {
      const urban = district === 'г. Тараз';
      const num = nums[k++];
      schools.push({ name: num === 7 ? 'Гимназия №7' : `СШ №${num}`, district, strength: r.normal() * 5 + (urban ? 6 : 0) });
    }
  }
  // Сильные городские школы чаще выбирают учебник Б — ловушка для «сырых» средних.
  const ranked = [...schools].sort((a, b) => b.strength - a.strength);
  ranked.forEach((s, i) => { s.textbook = i < 8 ? (i === 6 ? 'А' : 'Б') : (i % 2 ? 'А' : 'Ә'); });
  ranked[13].textbook = 'Б';
  ranked[2].textbook = 'Ә';

  const rows = [];
  let sid = 0;
  for (const s of schools) {
    const hours = {};
    for (const t of DEMO_TOPICS) hours[t.id] = Math.max(5, Math.round(t.plan + r.normal() * 2.4));
    for (const cls of ['7А', '7Б']) {
      const size = 18 + Math.floor(r() * 10);
      for (let j = 0; j < size; j++) {
        const student = `S${String(++sid).padStart(4, '0')}`;
        const baseline = Math.round(clamp(62 + s.strength + r.normal() * 12, 20, 99));
        const resid = {};
        for (const t of DEMO_TOPICS) {
          const p = prereq[t.id];
          const own = r.normal() * 10;
          resid[t.id] = own + (p ? 0.6 * resid[p] : 0);
          const score = base[t.id]
            + 0.75 * (baseline - 62)
            + 0.3 * s.strength
            + ((book[s.textbook] || {})[t.id] || 0)
            + hoursGain[t.id] * Math.log(hours[t.id] / t.plan)
            + resid[t.id];
          rows.push({
            district: s.district, school: s.name, cls, textbook: s.textbook, student, baseline,
            topic: t.id, hours: hours[t.id], score: Math.round(clamp(score, 0, 100)),
          });
        }
      }
    }
  }
  return {
    meta: { subjectRu: 'Алгебра, 7 класс', subjectKz: 'Алгебра, 7-сынып', year: '2025–2026', demo: true },
    topics: DEMO_TOPICS.map(({ id, ru, kz }) => ({ id, ru, kz })),
    rows,
  };
}

// ---------- CSV ----------
export const CSV_COLUMNS = ['district', 'school', 'class', 'textbook', 'student', 'baseline', 'topic', 'hours', 'score'];

export function toCSV(ds) {
  const name = Object.fromEntries(ds.topics.map((t) => [t.id, t.ru]));
  const esc = (v) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const lines = [CSV_COLUMNS.join(';')];
  for (const x of ds.rows) {
    lines.push([x.district, x.school, x.cls, x.textbook, x.student, x.baseline, name[x.topic] || x.topic, x.hours, x.score].map(esc).join(';'));
  }
  return lines.join('\n');
}

function splitCSV(text, delim) {
  const out = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((v) => v.trim() !== '')) out.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== '')) out.push(row);
  return out;
}

const ALIASES = {
  district: ['district', 'район', 'аудан'],
  school: ['school', 'школа', 'мектеп'],
  class: ['class', 'класс', 'сынып'],
  textbook: ['textbook', 'учебник', 'оқулық'],
  student: ['student', 'ученик', 'оқушы', 'id'],
  baseline: ['baseline', 'входной', 'бастапқы', 'итог прошлого года'],
  topic: ['topic', 'тема', 'тақырып'],
  hours: ['hours', 'часы', 'сағат'],
  score: ['score', 'балл', 'результат', 'нәтиже', '%'],
};

// Возвращает { dataset } или { errors: [{code, line?, col?}] } — тексты ошибок переводит интерфейс.
export function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0] || '';
  const delim = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? ';' : ',';
  return parseTable(splitCSV(text, delim));
}

// Общий разбор таблицы (из CSV или Excel): первая строка — заголовки.
export function parseTable(table) {
  table = table.map((r) => r.map((v) => (v == null ? '' : String(v))));
  if (table.length < 2) return { errors: [{ code: 'empty' }] };
  const head = table[0].map((h) => h.trim().toLowerCase());
  const idx = {};
  for (const [key, names] of Object.entries(ALIASES)) {
    const i = head.findIndex((h) => names.includes(h));
    if (i >= 0) idx[key] = i;
  }
  const required = ['school', 'textbook', 'student', 'topic', 'hours', 'score'];
  const missing = required.filter((c) => idx[c] === undefined);
  if (missing.length) return { errors: missing.map((col) => ({ code: 'missingCol', col })) };

  const errors = [];
  const topicIds = new Map();
  const topics = [];
  const rows = [];
  const num = (v) => (String(v).trim() === '' ? NaN : Number(String(v).replace(',', '.').replace('%', '').trim()));
  // Excel хранит проценты долями (75% = 0.75): если все значения ≤ 1, переводим в проценты.
  const scaleOf = (k) => {
    if (idx[k] === undefined) return 1;
    const vals = table.slice(1).map((r) => num(r[idx[k]] ?? '')).filter(Number.isFinite);
    return vals.length && vals.every((v) => v >= 0 && v <= 1) ? 100 : 1;
  };
  const sScale = scaleOf('score'), bScale = scaleOf('baseline');
  for (let li = 1; li < table.length; li++) {
    const c = table[li];
    const get = (k) => (idx[k] === undefined ? '' : (c[idx[k]] ?? '').trim());
    const score = num(get('score')) * sScale, hours = num(get('hours'));
    const baselineRaw = get('baseline');
    const baseline = baselineRaw === '' ? NaN : num(baselineRaw) * bScale;
    if (!Number.isFinite(score) || score < 0 || score > 100) { errors.push({ code: 'badScore', line: li + 1 }); continue; }
    if (!Number.isFinite(hours) || hours <= 0) { errors.push({ code: 'badHours', line: li + 1 }); continue; }
    const tname = get('topic');
    if (!tname) { errors.push({ code: 'noTopic', line: li + 1 }); continue; }
    if (!topicIds.has(tname)) {
      const id = `T${topicIds.size + 1}`;
      topicIds.set(tname, id);
      const known = DEMO_TOPICS.find((t) => [t.ru, t.kz].some((n) => n.toLowerCase() === tname.toLowerCase()));
      topics.push({ id, ru: known ? known.ru : tname, kz: known ? known.kz : tname });
    }
    rows.push({
      district: get('district') || '—', school: get('school'), cls: get('class') || '—',
      textbook: get('textbook'), student: `${get('school')}|${get('student')}`,
      baseline, topic: topicIds.get(tname), hours, score,
    });
    if (errors.length > 20) break;
  }
  if (errors.length) return { errors: errors.slice(0, 20) };
  // Нет входного балла — берём средний результат ученика по всем темам как оценку уровня.
  const byStudent = new Map();
  for (const x of rows) {
    if (!byStudent.has(x.student)) byStudent.set(x.student, []);
    byStudent.get(x.student).push(x.score);
  }
  for (const x of rows) if (!Number.isFinite(x.baseline)) x.baseline = Math.round(mean(byStudent.get(x.student)));
  if (new Set(rows.map((x) => x.textbook)).size < 1) return { errors: [{ code: 'empty' }] };
  return { dataset: { meta: { subjectRu: 'Загруженные данные', subjectKz: 'Жүктелген деректер', demo: false }, topics, rows } };
}

// ---------- линейная алгебра для маленьких матриц ----------
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-9) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

// ---------- главный анализ ----------
export function analyze(ds, { bootstrap = 300, seed = 7 } = {}) {
  const topics = ds.topics;
  const books = [...new Set(ds.rows.map((x) => x.textbook))].sort();
  const schools = [...new Set(ds.rows.map((x) => x.school))];
  const students = new Set(ds.rows.map((x) => x.student));
  const blMean = mean(ds.rows.map((x) => x.baseline));
  const byTopic = Object.fromEntries(topics.map((t) => [t.id, []]));
  for (const x of ds.rows) byTopic[x.topic]?.push(x);

  // 1. Усвоение тем
  const topicStats = topics.map((t) => {
    const rs = byTopic[t.id];
    const sc = rs.map((x) => x.score);
    const m = mean(sc), s = sd(sc);
    const perSchool = {};
    for (const x of rs) (perSchool[x.school] ||= []).push(x.score);
    const schoolMeans = Object.entries(perSchool).map(([school, a]) => ({ school, mean: mean(a), n: a.length }));
    const hist = Array(10).fill(0);
    for (const v of sc) hist[Math.min(9, Math.floor(v / 10))]++;
    return {
      id: t.id, n: sc.length, mean: m, median: median(sc), sd: s,
      ci: 1.96 * s / Math.sqrt(sc.length),
      fail: sc.filter((v) => v < FAIL).length / sc.length,
      mastered: sc.filter((v) => v >= MASTERED).length / sc.length,
      schoolSpread: sd(schoolMeans.map((x) => x.mean)),
      schoolMeans: schoolMeans.sort((a, b) => a.mean - b.mean),
      hist,
      bands: [
        sc.filter((v) => v < FAIL).length, sc.filter((v) => v >= FAIL && v < 65).length,
        sc.filter((v) => v >= 65 && v < MASTERED).length, sc.filter((v) => v >= MASTERED).length,
      ].map((k) => k / sc.length),
      hoursMedian: median(rs.map((x) => x.hours)),
    };
  });
  const overall = mean(topicStats.map((t) => t.mean));
  const failOverall = mean(topicStats.map((t) => t.fail));
  for (const t of topicStats) {
    // «Сложная тема»: заметно ниже средней по программе или каждый четвёртый не справился.
    t.hard = t.mean < overall - 6 || t.fail >= 0.25;
  }

  // 2. Корни проблем: провал какой ранней темы сильнее всего предсказывает провал этой.
  const scoreOf = new Map();
  for (const x of ds.rows) scoreOf.set(`${x.student}|${x.topic}`, x.score);
  const order = topics.map((t) => t.id);
  for (const t of topicStats) {
    const i = order.indexOf(t.id);
    let best = null;
    if (t.fail < 0.08) { t.root = null; continue; }
    for (const p of order.slice(0, i)) {
      let a = 0, an = 0, b = 0, bn = 0;
      for (const st of students) {
        const sp = scoreOf.get(`${st}|${p}`), stt = scoreOf.get(`${st}|${t.id}`);
        if (sp === undefined || stt === undefined) continue;
        if (sp < FAIL) { an++; if (stt < FAIL) a++; } else { bn++; if (stt < FAIL) b++; }
      }
      if (an < 15 || bn < 15 || a < 8) continue;
      const pf = a / an, pp = b / bn;
      const rr = pf / Math.max(pp, 0.005);
      if (!best || rr > best.rr) best = { topic: p, rr, failGiven: pf, failOtherwise: pp, n: an };
    }
    t.root = best && best.rr >= 1.8 ? best : null;
  }

  // 3–4. Модель на тему: балл = b0 + b1·(входной уровень) + b2·ln(часы) + эффект учебника.
  // Учебник выбирает школа, поэтому неопределённость считаем бутстрепом по школам.
  const ref = books[0];
  const dim = 3 + books.length - 1;
  const feat = (x) => {
    const f = [1, x.baseline - blMean, Math.log(x.hours)];
    for (const b of books.slice(1)) f.push(x.textbook === b ? 1 : 0);
    return f;
  };
  // Достаточные статистики по школам: XtX и Xty на каждую тему.
  const suff = {};
  const schoolBook = {};
  for (const x of ds.rows) {
    schoolBook[x.school] = x.textbook;
    const key = `${x.topic}|${x.school}`;
    const s = (suff[key] ||= { A: Array.from({ length: dim }, () => Array(dim).fill(0)), b: Array(dim).fill(0), lh: 0, n: 0 });
    const f = feat(x);
    for (let i = 0; i < dim; i++) {
      s.b[i] += f[i] * x.score;
      for (let j = 0; j < dim; j++) s.A[i][j] += f[i] * f[j];
    }
    s.lh += f[2]; s.n++;
  }
  const fit = (topic, schoolList) => {
    const A = Array.from({ length: dim }, () => Array(dim).fill(0));
    const b = Array(dim).fill(0);
    let lh = 0, n = 0;
    for (const sc of schoolList) {
      const s = suff[`${topic}|${sc}`];
      if (!s) continue;
      for (let i = 0; i < dim; i++) {
        b[i] += s.b[i];
        for (let j = 0; j < dim; j++) A[i][j] += s.A[i][j];
      }
      lh += s.lh; n += s.n;
    }
    for (let i = 1; i < dim; i++) A[i][i] += 1e-6; // гребневая страховка от вырожденности
    const beta = solve(A, b);
    if (!beta) return null;
    const avgLh = lh / n;
    const adj = {};
    books.forEach((bk, k) => { adj[bk] = beta[0] + beta[2] * avgLh + (k === 0 ? 0 : beta[2 + k]); });
    return { beta, adj, slope: beta[2], baselineSlope: beta[1] };
  };

  const r = rng(seed);
  const byBook = {};
  for (const sc of schools) (byBook[schoolBook[sc]] ||= []).push(sc);
  const resample = () => {
    const out = [];
    for (const bk of books) {
      const list = byBook[bk];
      for (let i = 0; i < list.length; i++) out.push(list[Math.floor(r() * list.length)]);
    }
    return out;
  };
  const boots = Array.from({ length: bootstrap }, resample);

  const model = {};
  for (const t of topics) {
    const point = fit(t.id, schools);
    if (!point) continue;
    const bs = boots.map((s) => fit(t.id, s)).filter(Boolean);
    const slopeQ = bs.map((m) => m.slope).sort((a, b) => a - b);
    const adjQ = {};
    for (const bk of books) adjQ[bk] = bs.map((m) => m.adj[bk]).sort((a, b) => a - b);
    model[t.id] = { ...point, slopeLo: quantile(slopeQ, 0.05), slopeHi: quantile(slopeQ, 0.95), bs, adjQ };
  }

  // Школы: насколько результат выше или ниже ожидаемого при таком уровне учеников,
  // часах и учебнике. Это вклад самой школы — у кого стоит перенимать опыт.
  const schoolInfo = {};
  for (const x of ds.rows) {
    const m = model[x.topic];
    if (!m) continue;
    const f = feat(x);
    const pred = f.reduce((s, v, i) => s + v * m.beta[i], 0);
    const si = (schoolInfo[x.school] ||= { school: x.school, district: x.district, textbook: x.textbook, students: new Set(), topics: {} });
    si.students.add(x.student);
    const tp = (si.topics[x.topic] ||= { sum: 0, pred: 0, res: [], hours: x.hours });
    tp.sum += x.score; tp.pred += pred; tp.res.push(x.score - pred);
  }
  const schoolStats = Object.values(schoolInfo).map((si) => {
    const perTopic = {};
    const all = [];
    for (const [id, tp] of Object.entries(si.topics)) {
      const n = tp.res.length;
      const va = mean(tp.res);
      perTopic[id] = { mean: tp.sum / n, expected: tp.pred / n, va, se: sd(tp.res) / Math.sqrt(n), n, hours: tp.hours };
      all.push(...tp.res);
    }
    const va = mean(all);
    return {
      school: si.school, district: si.district, textbook: si.textbook, students: si.students.size,
      mean: mean(Object.values(perTopic).map((p) => p.mean)), va, se: sd(all) / Math.sqrt(all.length), perTopic,
    };
  }).sort((a, b) => b.va - a.va);
  // Для каждой темы — школа-образец: лучший вклад при достаточной уверенности.
  const mentors = {};
  for (const t of topics) {
    const cand = schoolStats.map((s) => ({ school: s.school, ...s.perTopic[t.id] })).filter((p) => Number.isFinite(p.va) && p.n >= 15);
    cand.sort((a, b) => b.va - a.va);
    if (cand[0] && cand[0].va - 1.96 * cand[0].se > 0) mentors[t.id] = cand[0];
  }

  // Учебники: сырое среднее против скорректированного на уровень учеников и часы.
  const textbooks = books.map((bk) => {
    const rs = ds.rows.filter((x) => x.textbook === bk);
    const perTopic = {};
    for (const t of topics) {
      const m = model[t.id];
      if (!m) continue;
      const rawT = rs.filter((x) => x.topic === t.id).map((x) => x.score);
      const avgAdj = mean(books.map((b) => m.adj[b]));
      const diffs = m.bs.map((bm) => bm.adj[bk] - mean(books.map((b) => bm.adj[b]))).sort((a, b) => a - b);
      perTopic[t.id] = {
        raw: mean(rawT), adj: m.adj[bk], effect: m.adj[bk] - avgAdj,
        lo: quantile(diffs, 0.05), hi: quantile(diffs, 0.95),
      };
    }
    const allAdj = [];
    for (let i = 0; i < bootstrap; i++) {
      const vals = topics.map((t) => model[t.id]?.bs[i]?.adj[bk]).filter(Number.isFinite);
      if (vals.length) allAdj.push(mean(vals));
    }
    allAdj.sort((a, b) => a - b);
    return {
      id: bk,
      schools: byBook[bk].length,
      students: new Set(rs.map((x) => x.student)).size,
      raw: mean(rs.map((x) => x.score)),
      baseline: mean(rs.filter((x) => x.topic === topics[0].id).map((x) => x.baseline)),
      adj: mean(Object.values(perTopic).map((p) => p.adj)),
      adjLo: quantile(allAdj, 0.05), adjHi: quantile(allAdj, 0.95),
      perTopic,
    };
  });
  // Победитель по каждой теме — только если разница уверенная.
  const topicWinners = {};
  for (const t of topics) {
    const cand = textbooks.map((b) => ({ id: b.id, ...b.perTopic[t.id] })).filter((x) => Number.isFinite(x.effect));
    cand.sort((a, b) => b.effect - a.effect);
    const [best, second] = cand;
    if (!best || !second) continue;
    const m = model[t.id];
    const gaps = m.bs.map((bm) => bm.adj[best.id] - bm.adj[second.id]);
    const sure = gaps.filter((g) => g > 0).length / gaps.length;
    topicWinners[t.id] = { best: best.id, gap: best.adj - second.adj, sure, confident: sure >= 0.9 };
  }

  return {
    n: { rows: ds.rows.length, students: students.size, schools: schools.length, topics: topics.length, books: books.length },
    overall, failOverall, topicStats, textbooks, topicWinners, model, books, ref, schoolStats, mentors,
    districts: [...new Set(ds.rows.map((x) => x.district))],
    blMean,
  };
}

// ---------- 5. Перераспределение часов ----------
// Жадно переносим по часу туда, где следующий час даёт больше прироста усвоения
// (с весом на долю не справившихся), в пределах ±maxChange от текущего плана.
export function recommendHours(an, { total, maxChange = 0.35, minHours = 4, equity = 1.5 } = {}) {
  const ts = an.topicStats.filter((t) => an.model[t.id]);
  const cur = Object.fromEntries(ts.map((t) => [t.id, Math.round(t.hoursMedian)]));
  const curTotal = Object.values(cur).reduce((s, x) => s + x, 0);
  total = Math.round(total ?? curTotal);
  const slope = (id) => Math.max(0, an.model[id].slopeLo > 0 ? an.model[id].slope : an.model[id].slope * 0.5);
  const weight = Object.fromEntries(ts.map((t) => [t.id, 1 + equity * t.fail]));
  const lo = (id) => Math.max(minHours, Math.ceil(cur[id] * (1 - maxChange)));
  const hi = (id) => Math.floor(cur[id] * (1 + maxChange));
  const gain = (id, h) => weight[id] * slope(id) * Math.log((h + 1) / h); // +1 час
  const loss = (id, h) => weight[id] * slope(id) * Math.log(h / (h - 1)); // −1 час
  const h = { ...cur };
  const sum = () => Object.values(h).reduce((s, x) => s + x, 0);
  const ids = ts.map((t) => t.id);
  const pickAdd = () => ids.filter((id) => h[id] < hi(id)).sort((a, b) => gain(b, h[b]) - gain(a, h[a]))[0];
  const pickCut = () => ids.filter((id) => h[id] > lo(id)).sort((a, b) => loss(a, h[a]) - loss(b, h[b]))[0];
  let guard = 500;
  while (sum() < total && guard--) { const id = pickAdd(); if (!id) break; h[id]++; }
  while (sum() > total && guard--) { const id = pickCut(); if (!id) break; h[id]--; }
  while (guard-- > 0) {
    const a = pickAdd(), c = pickCut();
    if (!a || !c || a === c) break;
    if (gain(a, h[a]) - loss(c, h[c]) <= 0.05) break;
    h[a]++; h[c]--;
  }
  const rows = ts.map((t) => {
    const m = an.model[t.id];
    const d = Math.log(h[t.id] / cur[t.id]);
    return {
      id: t.id, current: cur[t.id], recommended: h[t.id], delta: h[t.id] - cur[t.id],
      effect: m.slope * d, effectLo: Math.min(m.slopeLo * d, m.slopeHi * d), effectHi: Math.max(m.slopeLo * d, m.slopeHi * d),
      slope: m.slope, slopeLo: m.slopeLo, slopeHi: m.slopeHi,
      sensitive: m.slopeLo > 0,
      mean: t.mean, fail: t.fail,
    };
  });
  const totalNow = rows.reduce((s, x) => s + x.current, 0);
  const totalRec = rows.reduce((s, x) => s + x.recommended, 0);
  const avgGain = mean(rows.map((x) => x.effect));
  return { rows, totalNow, totalRec, avgGain };
}

// ---------- 6. Что будет, если школы перейдут на другой учебник ----------
// Разница эффектов учебников из модели, по каждой теме, для учеников школ с учебником `from`.
export function simulateSwitch(an, from, to) {
  if (from === to) return null;
  const tf = an.textbooks.find((b) => b.id === from), tt = an.textbooks.find((b) => b.id === to);
  if (!tf || !tt) return null;
  const perTopic = an.topicStats.map((t) => {
    const a = tf.perTopic[t.id], b = tt.perTopic[t.id];
    if (!a || !b) return null;
    const m = an.model[t.id];
    const diffs = m.bs.map((bm) => bm.adj[to] - bm.adj[from]).sort((x, y) => x - y);
    return { id: t.id, gain: b.adj - a.adj, lo: quantile(diffs, 0.05), hi: quantile(diffs, 0.95) };
  }).filter(Boolean);
  const schools = an.schoolStats.filter((s) => s.textbook === from);
  return {
    from, to, perTopic,
    gain: mean(perTopic.map((p) => p.gain)),
    schools: schools.length,
    students: schools.reduce((s, x) => s + x.students, 0),
    sure: perTopic.filter((p) => p.lo > 0).length,
    worse: perTopic.filter((p) => p.hi < 0).length,
  };
}
