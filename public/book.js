// Единый учебник информатики 10–11 ЕМН: оглавление, главы, сравнение учебников и тесты в формате ЕНТ.

const PUB = {
  alm: { ru: 'Алматыкітап', kz: 'Алматыкітап' },
  arm: { ru: 'Арман-ПВ', kz: 'Арман-ПВ' },
  ata: { ru: 'Атамұра', kz: 'Атамұра' },
};

export const ENT = {
  '01': { ru: 'Устройства компьютера', kz: 'Компьютер құрылғылары' },
  '02': { ru: 'Компьютерные сети. Информационная безопасность', kz: 'Компьютерлік желілер. Ақпараттық қауіпсіздік' },
  '03': { ru: 'Представление и измерение информации. Кодирование', kz: 'Ақпаратты ұсыну және өлшеу. Кодтау' },
  '04': { ru: 'Системы счисления', kz: 'Санау жүйелері' },
  '05': { ru: 'Логические основы компьютера', kz: 'Компьютердің логикалық негіздері' },
  '06': { ru: 'Компьютерное мышление', kz: 'Компьютерлік ойлау' },
  '07': { ru: 'Программирование на Python', kz: 'Python тілінде бағдарламалау' },
  '08': { ru: 'Аппаратное и программное обеспечение', kz: 'Аппараттық және бағдарламалық қамтамасыз ету' },
  '09': { ru: 'Реляционная база данных', kz: 'Реляциялық дерекқор' },
  '10': { ru: 'Разработка БД. Структурированные запросы', kz: 'Дерекқорды әзірлеу. Құрылымдық сұраулар' },
  '11': { ru: 'Современные тенденции ИТ. IT Startup. 3D', kz: 'АТ дамуының заманауи үрдістері. IT Startup. 3D' },
  '12': { ru: 'Создание и преобразование информационных объектов', kz: 'Ақпараттық объектілерді құру және түрлендіру' },
  '13': { ru: 'Веб-проектирование', kz: 'Веб-жобалау' },
};

const S = {
  ru: {
    title: 'Единый учебник информатики',
    sub: '10–11 класс, естественно-математическое направление',
    lead: 'Собран из трёх учебников — Алматыкітап, Арман-ПВ и Атамұра — по спецификации ЕНТ. По каждой теме: полное объяснение, что из какого учебника взято, чего не хватало и тест в формате ЕНТ.',
    grade: (g) => `${g} класс`,
    ent: 'Тема ЕНТ',
    tests: (n) => `${n} заданий`,
    best: (p) => `лучший результат ${p}%`,
    back: 'Все главы',
    contents: 'В главе',
    terms: 'Ключевые термины',
    cov: 'Как тема раскрыта в трёх учебниках',
    covLead: 'Число — сколько раз подтема упоминается, рядом — страницы. Прочерк — подтемы в учебнике нет.',
    onlyIn: (p) => `только ${p}`,
    none: 'нет ни в одном',
    added: 'Что добавлено при объединении',
    sources: 'Откуда взято',
    pages: 'с.',
    test: 'Проверь себя в формате ЕНТ',
    testLead: 'Уровни: A — базовый, B — средний, C — высокий. Задания с несколькими ответами и на соответствие дают до 2 баллов.',
    check: 'Проверить ответы',
    retry: 'Пройти ещё раз',
    result: (s, m) => `Результат: ${s} из ${m} баллов`,
    right: 'Верно', wrong: 'Неверно', partial: 'Частично',
    choose: 'выберите',
    multi: 'один или несколько ответов',
    match: 'установите соответствие',
    prev: 'Предыдущая глава', next: 'Следующая глава',
    summaryCov: 'Полнота учебников по всем главам',
    summaryCovLead: 'Доля подтем единого учебника, которые есть в каждом издательстве. Подтемы взяты из спецификации ЕНТ и всех трёх учебников.',
    loading: 'Загружаю главу…',
    noKz: '',
  },
  kz: {
    title: 'Бірыңғай информатика оқулығы',
    sub: '10–11 сынып, жаратылыстану-математикалық бағыт',
    lead: 'Үш оқулықтан — Алматыкітап, Арман-ПВ және Атамұра — ҰБТ спецификациясы бойынша құрастырылған. Әр тақырып бойынша: толық түсіндірме, қай оқулықтан не алынғаны, неге жетпегені және ҰБТ форматындағы тест.',
    grade: (g) => `${g}-сынып`,
    ent: 'ҰБТ тақырыбы',
    tests: (n) => `${n} тапсырма`,
    best: (p) => `ең жақсы нәтиже ${p}%`,
    back: 'Барлық тараулар',
    contents: 'Тарауда',
    terms: 'Негізгі терминдер',
    cov: 'Тақырып үш оқулықта қалай ашылған',
    covLead: 'Сан — тақырыпша қанша рет кездесетіні, қасында — беттер. Сызықша — оқулықта тақырыпша жоқ.',
    onlyIn: (p) => `тек ${p}`,
    none: 'ешбірінде жоқ',
    added: 'Біріктіру кезінде не қосылды',
    sources: 'Қайдан алынды',
    pages: 'б.',
    test: 'ҰБТ форматында өзіңді тексер',
    testLead: 'Деңгейлер: A — базалық, B — орта, C — жоғары. Бірнеше жауапты және сәйкестендіру тапсырмалары 2 ұпайға дейін береді.',
    check: 'Жауаптарды тексеру',
    retry: 'Қайта өту',
    result: (s, m) => `Нәтиже: ${m} ұпайдан ${s}`,
    right: 'Дұрыс', wrong: 'Қате', partial: 'Ішінара',
    choose: 'таңдаңыз',
    multi: 'бір немесе бірнеше жауап',
    match: 'сәйкестендіріңіз',
    prev: 'Алдыңғы тарау', next: 'Келесі тарау',
    summaryCov: 'Барлық тараулар бойынша оқулықтардың толықтығы',
    summaryCovLead: 'Бірыңғай оқулық тақырыпшаларының әр баспада бар үлесі. Тақырыпшалар ҰБТ спецификациясынан және үш оқулықтан алынған.',
    loading: 'Тарау жүктелуде…',
    noKz: 'Бұл тараудың қазақша нұсқасы әлі дайын емес, орысша көрсетілді.',
  },
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* без хранилища */ } },
};

// ---------- мини-markdown ----------
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}

export function md(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push(`<pre class="code"><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const body = rows.filter((r) => !/^\|[\s:|-]+\|$/.test(r));
      const [head, ...rest] = body;
      out.push(`<div class="scroll"><table class="table book-table"><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rest.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d+\. /.test(l);
      const items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) items.push(lines[i++].replace(/^(- |\d+\. )/, ''));
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (l.startsWith('> ')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('> ')) buf.push(lines[i++].slice(2));
      out.push(`<p class="callout">${inline(buf.join(' '))}</p>`);
      continue;
    }
    if (l.startsWith('### ')) { out.push(`<h4>${inline(l.slice(4))}</h4>`); i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(```|\||- |\d+\. |> |### )/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

// ---------- загрузка ----------
const cache = new Map();
async function getJSON(url) {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); }));
  return cache.get(url);
}
async function loadIndex(lang) {
  const ru = await getJSON('book/ru/index.json');
  if (lang !== 'kz') return ru;
  const kz = await getJSON('book/kz/index.json').catch(() => []);
  return ru.map((c) => kz.find((k) => k.id === c.id) || { ...c, fallback: true });
}
async function loadChapter(lang, id) {
  if (lang === 'kz') {
    try { return await getJSON(`book/kz/${id}.json`); } catch { /* нет перевода */ }
    const ru = await getJSON(`book/ru/${id}.json`);
    return { ...ru, fallback: true };
  }
  return getJSON(`book/ru/${id}.json`);
}

const bestKey = (id) => `olshem.book.best.${id}`;

// ---------- оглавление ----------
async function renderIndex(main, lang) {
  const t = S[lang];
  const idx = await loadIndex(lang);
  const covs = await Promise.all(idx.map((c) => getJSON(`book/ru/${c.id}.json`).then((x) => x.coverage).catch(() => null)));
  const tot = { alm: [0, 0], arm: [0, 0], ata: [0, 0] };
  for (const cv of covs) {
    if (!cv) continue;
    for (const r of cv.rows) for (const p of Object.keys(tot)) if (r[p]) { tot[p][1]++; if (r[p].n > 0) tot[p][0]++; }
  }
  const covBars = Object.entries(tot).filter(([, v]) => v[1]).map(([p, [a, b]]) => {
    const share = Math.round((a / b) * 100);
    return `<div class="cov-sum-row"><span>${esc(PUB[p][lang])}</span><span class="cov-sum-track"><span style="--w:${share}%"></span></span><b>${share}%</b></div>`;
  }).join('');
  const groups = [10, 11].map((g) => {
    const list = idx.filter((c) => c.grade === g);
    if (!list.length) return '';
    return `<section class="sheet"><h2>${esc(t.grade(g))}</h2><ol class="chapters">${list.map((c) => {
      const best = store.get(bestKey(c.id));
      const n = idx.indexOf(c) + 1;
      return `<li><a href="#book/${c.id}"><span class="ch-num">${n}</span><span class="ch-body"><b>${esc(c.title)}</b><small>${esc(c.summary)}</small>
        <span class="ch-meta">${c.ent.map((e) => `<span class="ent-tag">${esc(t.ent)} ${esc(e)}</span>`).join('')}<span>${esc(t.tests(c.tests))}</span>${best != null ? `<span class="best">${esc(t.best(best))}</span>` : ''}</span></span></a></li>`;
    }).join('')}</ol></section>`;
  }).join('');
  main.innerHTML = `
    <p class="context"><span class="subject">${esc(t.sub)}</span></p>
    <h1>${esc(t.title)}</h1>
    <p class="lead">${esc(t.lead)}</p>
    ${covBars ? `<section class="sheet"><h2>${esc(t.summaryCov)}</h2><p class="note">${esc(t.summaryCovLead)}</p><div class="cov-sum">${covBars}</div></section>` : ''}
    ${groups}`;
}

// ---------- глава ----------
function coverageTable(ch, lang) {
  const t = S[lang];
  const cv = ch.coverage;
  if (!cv) return '';
  const pubs = Object.keys(cv.books);
  const rows = cv.rows.map((r) => {
    const have = pubs.filter((p) => r[p] && r[p].n > 0);
    const flag = have.length === 1 ? `<span class="only">${esc(t.onlyIn(PUB[have[0]][lang]))}</span>` : have.length === 0 ? `<span class="only none">${esc(t.none)}</span>` : '';
    return `<tr><td>${esc(r.topic)} ${flag}</td>${pubs.map((p) => {
      const c = r[p];
      return c && c.n > 0 ? `<td class="cov-yes"><b>${c.n}</b> <small>${esc(t.pages)} ${c.pages.join(', ')}${c.pages.length >= 6 ? '…' : ''}</small></td>` : '<td class="cov-no">—</td>';
    }).join('')}</tr>`;
  }).join('');
  return `<section class="sheet" id="cov"><h2>${esc(t.cov)}</h2><p class="note">${esc(t.covLead)}</p>
    <div class="scroll"><table class="table cov-table"><thead><tr><th></th>${pubs.map((p) => `<th>${esc(PUB[p][lang])} ${cv.books[p].split('-')[0]}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function testView(ch, lang, state) {
  const t = S[lang];
  const items = ch.tests.map((q, i) => {
    const res = state.checked ? state.score.items[i] : null;
    const mark = res ? `<span class="q-mark ${res.got === res.max ? 'ok' : res.got > 0 ? 'part' : 'bad'}">${esc(res.got === res.max ? t.right : res.got > 0 ? t.partial : t.wrong)}</span>` : '';
    let body = '';
    if (q.type === 'match') {
      const rights = state.shuffled[i];
      body = `<div class="match">${q.pairs.map(([l], k) => {
        const sel = state.answers[i]?.[k] ?? '';
        const ok = state.checked ? (sel === q.pairs[k][1] ? 'ok' : 'bad') : '';
        return `<label class="match-row ${ok}"><span>${esc(l)}</span><select data-q="${i}" data-k="${k}" ${state.checked ? 'disabled' : ''}><option value="">— ${esc(t.choose)} —</option>${rights.map((r) => `<option ${r === sel ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select>${state.checked && ok === 'bad' ? `<small class="correct">→ ${esc(q.pairs[k][1])}</small>` : ''}</label>`;
      }).join('')}</div>`;
    } else {
      const type = q.type === 'multi' ? 'checkbox' : 'radio';
      body = `<div class="opts">${q.options.map((o, k) => {
        const on = (state.answers[i] || []).includes(k);
        const cls = state.checked ? (q.answer.includes(k) ? 'ok' : on ? 'bad' : '') : '';
        return `<label class="opt ${cls}"><input type="${type}" name="q${i}" value="${k}" data-q="${i}" ${on ? 'checked' : ''} ${state.checked ? 'disabled' : ''}><span class="opt-letter">${'ABCDEFGH'[k]}</span><span>${esc(o)}</span></label>`;
      }).join('')}</div>`;
    }
    const hint = q.type === 'multi' ? t.multi : q.type === 'match' ? t.match : '';
    return `<li class="q"><div class="q-head"><span class="lvl lvl-${q.level}">${q.level}</span>${hint ? `<small class="muted">${esc(hint)}</small>` : ''}${mark}</div>
      <p class="q-text">${esc(q.q)}</p>${body}${state.checked && q.explain ? `<p class="explain">${esc(q.explain)}</p>` : ''}</li>`;
  }).join('');
  const total = state.checked ? `<p class="verdict">${esc(t.result(state.score.got, state.score.max))}</p>` : '';
  return `<section class="sheet" id="test"><h2>${esc(t.test)}</h2><p class="note">${esc(t.testLead)}</p>
    <ol class="quiz">${items}</ol>${total}
    <div class="actions after">${state.checked ? `<button class="btn" id="qRetry" type="button">${esc(t.retry)}</button>` : `<button class="btn primary" id="qCheck" type="button">${esc(t.check)}</button>`}</div></section>`;
}

function grade(ch, answers) {
  const items = ch.tests.map((q, i) => {
    if (q.type === 'single') {
      const a = answers[i] || [];
      return { got: a.length === 1 && a[0] === q.answer[0] ? 1 : 0, max: 1 };
    }
    let errors = 0;
    if (q.type === 'multi') {
      const a = new Set(answers[i] || []);
      q.options.forEach((_, k) => { if (a.has(k) !== q.answer.includes(k)) errors++; });
    } else {
      q.pairs.forEach(([, r], k) => { if ((answers[i] || {})[k] !== r) errors++; });
    }
    return { got: errors === 0 ? 2 : errors === 1 ? 1 : 0, max: 2 };
  });
  return { items, got: items.reduce((s, x) => s + x.got, 0), max: items.reduce((s, x) => s + x.max, 0) };
}

const shuffle = (arr, seed) => {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function renderChapter(main, lang, id) {
  const t = S[lang];
  main.innerHTML = `<p class="note">${esc(t.loading)}</p>`;
  const [ch, idx] = await Promise.all([loadChapter(lang, id), loadIndex(lang)]);
  const pos = idx.findIndex((c) => c.id === id);
  const prev = idx[pos - 1], next = idx[pos + 1];
  const qs = { answers: {}, checked: false, score: null, shuffled: ch.tests.map((q, i) => shuffle(q.pairs.map((p) => p[1]), i + 7)) };

  const draw = () => {
    main.innerHTML = `
      <p class="context"><a href="#book">← ${esc(t.back)}</a><span class="subject">${esc(t.grade(ch.grade))}</span>
        ${ch.ent.map((e) => `<span class="ent-tag" title="${esc(ENT[e]?.[lang] || '')}">${esc(t.ent)} ${esc(e)}: ${esc(ENT[e]?.[lang] || '')}</span>`).join('')}</p>
      <h1>${pos + 1}. ${esc(ch.title)}</h1>
      <p class="lead">${esc(ch.summary)}</p>
      ${ch.fallback && t.noKz ? `<p class="callout">${esc(t.noKz)}</p>` : ''}
      <nav class="toc" aria-label="${esc(t.contents)}"><b>${esc(t.contents)}:</b> ${ch.sections.map((s, i) => `<a href="#book/${id}" data-jump="s${i}">${esc(s.h)}</a>`).join('')}<a href="#book/${id}" data-jump="test">${esc(t.test)}</a></nav>
      <article class="sheet book-text">${ch.sections.map((s, i) => `<section id="s${i}"><h2>${esc(s.h)}</h2>${md(s.md)}</section>`).join('')}</article>
      ${ch.terms.length ? `<section class="sheet"><h2>${esc(t.terms)}</h2><dl class="terms">${ch.terms.map((x) => `<dt>${esc(x.t)}</dt><dd>${esc(x.d)}</dd>`).join('')}</dl></section>` : ''}
      ${coverageTable(ch, lang)}
      ${ch.added.length ? `<section class="sheet"><h2>${esc(t.added)}</h2><ul class="method">${ch.added.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></section>` : ''}
      ${ch.sources.length ? `<section class="sheet"><h2>${esc(t.sources)}</h2><ul class="method">${ch.sources.map((s) => `<li><b>${esc(PUB[s.pub]?.[lang] || s.pub)}, ${esc(t.grade(s.grade))}</b>, ${esc(t.pages)} ${esc(s.pages)}: ${esc(s.note)}</li>`).join('')}</ul></section>` : ''}
      ${testView(ch, lang, qs)}
      <nav class="pager">${prev ? `<a class="btn" href="#book/${prev.id}">← ${esc(t.prev)}</a>` : '<span></span>'}${next ? `<a class="btn" href="#book/${next.id}">${esc(t.next)} →</a>` : ''}</nav>`;
    bindChapter();
  };

  const bindChapter = () => {
    main.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    main.querySelectorAll('input[data-q]').forEach((inp) => inp.addEventListener('change', () => {
      const i = +inp.dataset.q;
      qs.answers[i] = [...main.querySelectorAll(`input[name="q${i}"]:checked`)].map((x) => +x.value);
    }));
    main.querySelectorAll('select[data-q]').forEach((s) => s.addEventListener('change', () => {
      const i = +s.dataset.q;
      (qs.answers[i] ||= {})[+s.dataset.k] = s.value;
    }));
    main.querySelector('#qCheck')?.addEventListener('click', () => {
      qs.checked = true;
      qs.score = grade(ch, qs.answers);
      const pct = Math.round((qs.score.got / qs.score.max) * 100);
      const prevBest = store.get(bestKey(id));
      if (prevBest == null || pct > prevBest) store.set(bestKey(id), pct);
      const y = main.querySelector('#test').getBoundingClientRect().top + scrollY;
      draw();
      scrollTo({ top: y - 10 });
    });
    main.querySelector('#qRetry')?.addEventListener('click', () => {
      qs.checked = false; qs.answers = {}; qs.score = null;
      const y = main.querySelector('#test').getBoundingClientRect().top + scrollY;
      draw();
      scrollTo({ top: y - 10 });
    });
  };
  draw();
}

export async function renderBook(main, lang, sub) {
  try {
    if (sub) await renderChapter(main, lang, sub);
    else await renderIndex(main, lang);
  } catch (e) {
    main.innerHTML = `<p class="msg bad">${esc(lang === 'kz' ? 'Тарауды жүктеу мүмкін болмады.' : 'Не удалось загрузить главу.')}</p>`;
    console.error(e);
  }
}
