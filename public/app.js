import { generateDemo, analyze, recommendHours, toCSV, parseCSV, FAIL } from './engine.js';
import { STR, pct } from './i18n.js';

const BOOK_COLORS = ['#1F4FC1', '#C26A00', '#009682'];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватный режим */ } },
};

const state = {
  lang: store.get('olshem.lang') === 'kz' ? 'kz' : 'ru',
  ds: null, an: null,
  hours: { total: null, maxChange: 0.35 },
  openTopic: null,
  uploadMsg: null,
};

const T = () => STR[state.lang];
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt1 = (x) => (Math.abs(x) < 0.05 ? '≈0' : (x > 0 ? '+' : '−') + Math.abs(x).toFixed(1));
const topicName = (id) => {
  const t = state.ds.topics.find((x) => x.id === id);
  return t ? (state.lang === 'kz' ? t.kz : t.ru) : id;
};
const bookColor = (id) => BOOK_COLORS[state.an.books.indexOf(id) % BOOK_COLORS.length];

function load(ds) {
  state.ds = ds;
  state.an = analyze(ds);
  state.hours.total = null;
  state.openTopic = null;
}

// ---------- каркас ----------
const ROUTES = ['overview', 'topics', 'books', 'hours', 'data', 'report'];
function route() {
  const r = location.hash.replace('#', '');
  return ROUTES.includes(r) ? r : 'overview';
}

function renderNav() {
  const r = route();
  $('#nav').innerHTML = ROUTES.map((k) => `<a href="#${k}" ${k === r ? 'aria-current="page"' : ''}>${esc(T().nav[k])}</a>`).join('');
  $('[data-t="tagline"]').textContent = T().tagline;
  $('#lang').textContent = T().lang;
  document.documentElement.lang = state.lang === 'kz' ? 'kk' : 'ru';
}

function header(title, lead) {
  const { ds, an } = state;
  const subject = state.lang === 'kz' ? ds.meta.subjectKz : ds.meta.subjectRu;
  return `
    <p class="context"><span class="subject">${esc(subject)}${ds.meta.year ? `, ${esc(ds.meta.year)}` : ''}</span>
      <span class="badge ${ds.meta.demo ? 'demo' : 'own'}">${esc(ds.meta.demo ? T().demoBadge : T().ownBadge)}</span></p>
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    <p class="counts">${esc(T().counts(an.n))}</p>`;
}

function render() {
  renderNav();
  const r = route();
  const view = { overview, topics, books, hours, data, report }[r];
  $('#main').innerHTML = view();
  bind[r]?.();
}

// ---------- обзор ----------
function hardTopics() {
  return state.an.topicStats.filter((t) => t.hard).sort((a, b) => a.mean - b.mean);
}

function rec() {
  return recommendHours(state.an, { total: state.hours.total ?? undefined, maxChange: state.hours.maxChange });
}

function bookStory() {
  const tb = state.an.textbooks;
  const byRaw = [...tb].sort((a, b) => b.raw - a.raw);
  const byAdj = [...tb].sort((a, b) => b.adj - a.adj);
  return { byRaw, byAdj, rawTop: byRaw[0], adjTop: byAdj[0], adjBottom: byAdj[byAdj.length - 1] };
}

function overview() {
  const t = T(), an = state.an;
  const hard = hardTopics();
  const findings = [];
  for (const h of hard.slice(0, 3)) {
    let s = t.fHard(topicName(h.id), h.mean, h.fail);
    if (h.root) s += ' ' + t.fRoot(topicName(h.id), topicName(h.root.topic), h.root.rr);
    findings.push({ text: s, href: `#topics`, topic: h.id });
  }
  if (an.books.length > 1) {
    const b = bookStory();
    findings.push({ text: b.rawTop.id !== b.adjTop.id ? t.fBook(b.rawTop.id, b.adjTop.id) : t.fBookSame(b.adjTop.id), href: '#books' });
  }
  const r = rec();
  const up = [...r.rows].sort((a, b) => b.delta - a.delta)[0];
  const down = [...r.rows].sort((a, b) => a.delta - b.delta)[0];
  if (up && down && up.delta > 0 && r.avgGain > 0.1) findings.push({ text: t.fHours(topicName(down.id), topicName(up.id), r.avgGain), href: '#hours' });

  return `
    ${header(t.ovTitle(hard.length), t.ovLead(an.overall, an.failOverall))}
    <section class="sheet">
      <h2>${esc(t.ovChart)}</h2>
      ${barChart()}
    </section>
    <section class="findings">
      <h2>${esc(t.findings)}</h2>
      <ol>${findings.map((f) => `<li><p>${esc(f.text)}</p><a href="${f.href}" ${f.topic ? `data-open="${f.topic}"` : ''}>${esc(t.open)}</a></li>`).join('')}</ol>
    </section>`;
}

function barChart() {
  const t = T(), an = state.an;
  return `<div class="bars" role="list">
    <div class="bars-threshold" style="--x:${FAIL}%"><span>${esc(t.threshold)}</span></div>
    ${an.topicStats.map((s, i) => `
      <div class="bar-row ${s.hard ? 'is-hard' : ''}" role="listitem">
        <span class="bar-label"><span class="num">${i + 1}</span>${esc(topicName(s.id))}</span>
        <span class="bar-track" data-tip="${esc(`${topicName(s.id)}: ${pct(s.mean)}. ${t.col.fail}: ${pct(s.fail * 100)}. ${t.col.mastered}: ${pct(s.mastered * 100)}`)}">
          <span class="bar" style="--w:${s.mean.toFixed(1)}%"></span>
          <span class="bar-val" style="--w:${s.mean.toFixed(1)}%">${pct(s.mean)}</span>
          ${s.hard ? `<span class="pen" style="--w:${s.mean.toFixed(1)}%"><svg viewBox="0 0 70 34" aria-hidden="true"><path d="M8 18c2-9 22-14 40-12 14 2 20 8 16 14-5 8-29 11-46 8C6 26 2 20 10 12"/></svg><em>${esc(state.lang === 'kz' ? `${pct(s.fail * 100)} үлгермеді` : `${pct(s.fail * 100)} не справились`)}</em></span>` : ''}
        </span>
      </div>`).join('')}
  </div>`;
}

// ---------- темы ----------
function topics() {
  const t = T(), an = state.an;
  return `
    ${header(t.tpTitle, t.tpLead)}
    <section class="sheet">
      <table class="table topics">
        <thead><tr><th>${t.col.topic}</th><th class="n">${t.col.mean}</th><th class="n">${t.col.fail}</th><th class="n hide-s">${t.col.mastered}</th><th class="n hide-s">${t.col.spread}</th><th class="n hide-s">${t.col.hours}</th></tr></thead>
        <tbody>
        ${an.topicStats.map((s, i) => `
          <tr class="row ${s.hard ? 'is-hard' : ''} ${state.openTopic === s.id ? 'is-open' : ''}" data-topic="${s.id}" tabindex="0" aria-expanded="${state.openTopic === s.id}">
            <td><span class="num">${i + 1}</span>${esc(topicName(s.id))}${s.hard ? ` <span class="flag">${t.hard}</span>` : ''}</td>
            <td class="n">${pct(s.mean)}</td><td class="n ${s.fail >= 0.2 ? 'bad' : ''}">${pct(s.fail * 100)}</td>
            <td class="n hide-s">${pct(s.mastered * 100)}</td><td class="n hide-s">${s.schoolSpread.toFixed(1)}</td><td class="n hide-s">${s.hoursMedian}</td>
          </tr>
          ${state.openTopic === s.id ? `<tr class="detail"><td colspan="6">${topicDetail(s)}</td></tr>` : ''}`).join('')}
        </tbody>
      </table>
    </section>`;
}

function topicDetail(s) {
  const t = T();
  const maxH = Math.max(...s.hist);
  const hist = s.hist.map((v, i) => {
    const h = (v / maxH) * 100;
    const fail = i * 10 < FAIL;
    return `<span class="hb ${fail ? 'fail' : ''}" style="--h:${h.toFixed(1)}%" data-tip="${i * 10}–${i * 10 + (i === 9 ? 10 : 9)}%: ${v} ${t.students}"></span>`;
  }).join('');
  const lo = Math.min(...s.schoolMeans.map((x) => x.mean)), hi = Math.max(...s.schoolMeans.map((x) => x.mean));
  const a = Math.floor((lo - 5) / 10) * 10, b = Math.ceil((hi + 5) / 10) * 10;
  const dots = s.schoolMeans.map((x, i) => {
    const bk = state.ds.rows.find((r) => r.school === x.school)?.textbook;
    return `<span class="dot" style="--x:${(((x.mean - a) / (b - a)) * 100).toFixed(1)}%;--y:${[50, 22, 78][i % 3]}%;--c:${bookColor(bk)}" data-tip="${esc(`${x.school} (${t.textbook} ${bk}): ${pct(x.mean)}`)}"></span>`;
  }).join('');
  const root = s.root
    ? t.rootText(topicName(s.root.topic), s.root.failGiven, s.root.failOtherwise)
    : t.noRoot;
  return `<div class="detail-grid">
    <div><h3>${t.distTitle}</h3><div class="hist">${hist}</div><div class="hist-axis"><span>0%</span><span>50%</span><span>100%</span></div></div>
    <div><h3>${t.schoolsTitle}</h3><div class="strip">${dots}</div><div class="hist-axis"><span>${a}%</span><span>${b}%</span></div>
      ${legendBooks()}
      <p>${esc(t.spreadText(s.schoolSpread))}</p></div>
    <div><h3>${t.rootTitle}</h3><p>${esc(root)}</p></div>
  </div>`;
}

function legendBooks() {
  return `<p class="legend">${state.an.books.map((b) => `<span><i style="--c:${bookColor(b)}"></i>${esc(T().textbook)} ${esc(b)}</span>`).join('')}</p>`;
}

// ---------- учебники ----------
function books() {
  const t = T(), an = state.an;
  if (an.books.length < 2) return `${header(t.bkTitle, t.bkLead)}<p class="empty">${state.lang === 'kz' ? 'Салыстыру үшін кемінде екі оқулық керек.' : 'Для сравнения нужно хотя бы два учебника.'}</p>`;
  const b = bookStory();
  const vals = an.textbooks.flatMap((x) => [x.raw, x.adjLo, x.adjHi]);
  const lo = Math.floor(Math.min(...vals) - 2), hi = Math.ceil(Math.max(...vals) + 2);
  const X = (v) => (((v - lo) / (hi - lo)) * 100).toFixed(2);
  const forest = b.byAdj.map((x) => `
    <div class="forest-row">
      <span class="forest-name" style="--c:${bookColor(x.id)}"><b>${esc(t.textbook)} ${esc(x.id)}</b><small>${esc(t.bkCard(x))}</small></span>
      <span class="forest-track">
        <span class="shift" style="--a:${X(Math.min(x.raw, x.adj))}%;--b:${X(Math.max(x.raw, x.adj))}%"></span>
        <span class="ci" style="--a:${X(x.adjLo)}%;--b:${X(x.adjHi)}%;--c:${bookColor(x.id)}"></span>
        <span class="mk raw" style="--x:${X(x.raw)}%" data-tip="${esc(`${t.bkRaw}: ${x.raw.toFixed(1)}%`)}"></span>
        <span class="mk adj" style="--x:${X(x.adj)}%;--c:${bookColor(x.id)}" data-tip="${esc(`${t.bkAdj}: ${x.adj.toFixed(1)}% (${x.adjLo.toFixed(1)}–${x.adjHi.toFixed(1)})`)}"></span>
      </span>
    </div>`).join('');
  const ticks = [];
  for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) ticks.push(`<span style="--x:${X(v)}%">${v}%</span>`);
  const maxAbs = Math.max(4, ...an.textbooks.flatMap((x) => Object.values(x.perTopic).map((p) => Math.abs(p.effect))));
  const cell = (p) => {
    const k = Math.min(1, Math.abs(p.effect) / maxAbs);
    const sure = p.lo > 0 || p.hi < 0;
    const col = p.effect >= 0 ? `rgba(31,79,193,${(0.08 + 0.6 * k).toFixed(2)})` : `rgba(194,65,12,${(0.08 + 0.55 * k).toFixed(2)})`;
    return `<td class="n heat ${k > 0.55 ? 'strong' : ''}" style="--bg:${col}" data-tip="${esc(`${fmt1(p.effect)} ${t.points} (${fmt1(p.lo)}…${fmt1(p.hi)})`)}">${fmt1(p.effect)}${sure ? '<i class="sure" aria-label="уверенно"></i>' : ''}</td>`;
  };
  const d = b.adjTop.adj - b.adjBottom.adj;
  return `
    ${header(t.bkTitle, t.bkLead)}
    <section class="sheet">
      <p class="verdict">${esc(t.bkVerdict(b.adjTop.id, b.adjBottom.id, d))}</p>
      <div class="forest">${forest}<div class="forest-axis">${ticks.join('')}</div></div>
      <p class="legend"><span><i class="o"></i>${esc(t.bkRaw)}</span><span><i></i>${esc(t.bkAdj)}</span><span><i class="ln"></i>${esc(t.bkCI)}</span></p>
    </section>
    <section class="sheet">
      <h2>${esc(t.heatTitle)}</h2>
      <p class="note">${esc(t.heatLead)}</p>
      <div class="scroll"><table class="table heatmap">
        <thead><tr><th>${t.col.topic}</th>${an.books.map((x) => `<th class="n">${esc(t.textbook)} ${esc(x)}</th>`).join('')}<th class="hide-s"></th></tr></thead>
        <tbody>${state.ds.topics.map((tp) => {
          const w = an.topicWinners[tp.id];
          return `<tr><td>${esc(topicName(tp.id))}</td>${an.textbooks.map((x) => x.perTopic[tp.id] ? cell(x.perTopic[tp.id]) : '<td></td>').join('')}
            <td class="hide-s win">${w && w.confident ? esc(t.winner(w.best)) : `<span class="muted">${esc(t.noWinner)}</span>`}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </section>`;
}

// ---------- часы ----------
function hours() {
  const t = T();
  const r = rec();
  const total = state.hours.total ?? r.totalNow;
  const all = r.rows.flatMap((x) => [x.current, x.recommended]);
  const minH = Math.max(0, Math.min(...all) - 2), maxH = Math.max(...all) + 2;
  const X = (v) => (((v - minH) / (maxH - minH)) * 100).toFixed(2);
  const rows = r.rows.map((x) => {
    const st = state.an.topicStats.find((s) => s.id === x.id);
    const per = (v) => v / x.current;
    const sens = x.sensitive ? t.hrSensYes(per(Math.max(0, x.slopeLo)), per(x.slopeHi)) : t.hrSensNo;
    const a = Math.min(x.current, x.recommended), b = Math.max(x.current, x.recommended);
    return `<tr class="${st.hard ? 'is-hard' : ''}">
      <td>${esc(topicName(x.id))}<small class="sens">${esc(t.hrSens)}: ${esc(sens)}</small></td>
      <td class="dumb-cell"><span class="dumb">
        <span class="seg ${x.delta > 0 ? 'up' : x.delta < 0 ? 'down' : ''}" style="--a:${X(a)}%;--b:${X(b)}%"></span>
        <span class="mk cur" style="--x:${X(x.current)}%" data-tip="${esc(`${t.hrNow}: ${x.current}`)}"></span>
        <span class="mk rec" style="--x:${X(x.recommended)}%" data-tip="${esc(`${t.hrRec}: ${x.recommended}`)}"></span>
      </span></td>
      <td class="n">${x.current}</td>
      <td class="n strong">${x.recommended}${x.delta ? ` <span class="${x.delta > 0 ? 'up' : 'down'}">${x.delta > 0 ? '+' : '−'}${Math.abs(x.delta)}</span>` : ''}</td>
      <td class="n hide-s" data-tip="${esc(`${fmt1(x.effectLo)}…${fmt1(x.effectHi)} ${t.points}`)}">${x.delta ? `${fmt1(x.effect)} ${t.points}` : '—'}</td>
    </tr>`;
  }).join('');
  return `
    ${header(t.hrTitle, t.hrLead)}
    <section class="sheet">
      <div class="controls">
        <label>${esc(t.hrTotal)} <output id="totalOut">${total}</output>
          <input type="range" id="total" min="${r.totalNow - 10}" max="${r.totalNow + 10}" value="${total}"></label>
        <label>${esc(t.hrMax)} <output id="maxOut">±${Math.round(state.hours.maxChange * 100)}%</output>
          <input type="range" id="maxc" min="0" max="60" step="5" value="${Math.round(state.hours.maxChange * 100)}"></label>
      </div>
      <p class="verdict">${esc(r.avgGain > 0.1 ? t.hrSummary(r.avgGain) : t.hrSummaryNeg)}</p>
      <div class="scroll"><table class="table hours-table">
        <thead><tr><th>${t.col.topic}</th><th class="dumb-head"><span class="legend"><span><i class="o"></i>${t.hrNow}</span><span><i></i>${t.hrRec}</span></span></th><th class="n">${t.hrNow}</th><th class="n">${t.hrRec}</th><th class="n hide-s">${t.hrEffect}</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td></td><td></td><td class="n">${r.totalNow}</td><td class="n strong">${r.totalRec}</td><td class="hide-s"></td></tr></tfoot>
      </table></div>
      <p class="note">${esc(t.hrNote)}</p>
    </section>`;
}

// ---------- данные ----------
function data() {
  const t = T();
  const msg = state.uploadMsg;
  return `
    ${header(t.dtTitle, t.dtLead)}
    <section class="sheet">
      <div class="actions">
        <label class="btn primary"><input type="file" id="file" accept=".csv,text/csv" hidden>${esc(t.dtUpload)}</label>
        <button class="btn" id="tpl" type="button">${esc(t.dtTemplate)}</button>
        ${state.ds.meta.demo ? '' : `<button class="btn" id="reset" type="button">${esc(t.dtReset)}</button>`}
      </div>
      ${msg ? `<div class="msg ${msg.ok ? 'ok' : 'bad'}" role="status">${msg.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>` : ''}
      <h2>${esc(t.dtCols)}</h2>
      <dl class="cols">${t.dtColsList.map(([k, v]) => `<dt><code>${k}</code></dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </section>
    <section class="sheet">
      <h2>${esc(t.method)}</h2>
      <ul class="method">${t.methodItems.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
    </section>`;
}

// ---------- заключение ----------
function report() {
  const t = T(), an = state.an;
  const hard = hardTopics();
  const b = an.books.length > 1 ? bookStory() : null;
  const r = rec();
  const roots = [...new Set(hard.filter((h) => h.root).map((h) => `«${topicName(h.root.topic)}»`))];
  const subject = state.lang === 'kz' ? state.ds.meta.subjectKz : state.ds.meta.subjectRu;
  const date = new Date().toLocaleDateString(state.lang === 'kz' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <div class="report">
      <div class="report-top"><p class="context">${esc(date)}</p><button class="btn" id="print" type="button">${esc(t.rpPrint)}</button></div>
      <h1>${esc(t.rpTitle)}</h1>
      <p>${esc(t.rpIntro(subject, an.n))}</p>
      <h2>${esc(t.rpHard)}</h2>
      ${hard.length ? `<ul>${hard.map((h) => `<li>${esc(t.fHard(topicName(h.id), h.mean, h.fail))}${h.root ? ' ' + esc(t.fRoot(topicName(h.id), topicName(h.root.topic), h.root.rr)) : ''}</li>`).join('')}</ul>` : `<p>—</p>`}
      ${b ? `<h2>${esc(t.rpBooks)}</h2>
      <p>${esc(b.rawTop.id !== b.adjTop.id ? t.fBook(b.rawTop.id, b.adjTop.id) : t.fBookSame(b.adjTop.id))} ${esc(t.bkVerdict(b.adjTop.id, b.adjBottom.id, b.adjTop.adj - b.adjBottom.adj))}</p>
      <table class="table"><thead><tr><th>${t.textbook}</th><th class="n">${t.bkRaw}</th><th class="n">${t.bkAdj}</th></tr></thead>
      <tbody>${b.byAdj.map((x) => `<tr><td>${esc(x.id)}</td><td class="n">${x.raw.toFixed(1)}%</td><td class="n strong">${x.adj.toFixed(1)}%</td></tr>`).join('')}</tbody></table>` : ''}
      <h2>${esc(t.rpHours)}</h2>
      <p>${esc(r.avgGain > 0.1 ? t.hrSummary(r.avgGain) : t.hrSummaryNeg)}</p>
      <table class="table"><thead><tr><th>${t.col.topic}</th><th class="n">${t.hrNow}</th><th class="n">${t.hrRec}</th><th class="n">${t.hrEffect}</th></tr></thead>
      <tbody>${r.rows.map((x) => `<tr><td>${esc(topicName(x.id))}</td><td class="n">${x.current}</td><td class="n strong">${x.recommended}</td><td class="n">${x.delta ? `${fmt1(x.effect)} ${t.points}` : '—'}</td></tr>`).join('')}</tbody></table>
      <h2>${esc(t.rpNext)}</h2>
      <ol>${t.rpNextItems(roots.join(', ')).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <p class="note">${esc(t.hrNote)}</p>
    </div>`;
}

// ---------- обработчики ----------
const bind = {
  overview() {
    document.querySelectorAll('[data-open]').forEach((a) => a.addEventListener('click', () => { state.openTopic = a.dataset.open; }));
  },
  topics() {
    document.querySelectorAll('tr[data-topic]').forEach((tr) => {
      const toggle = () => { state.openTopic = state.openTopic === tr.dataset.topic ? null : tr.dataset.topic; render(); $(`tr[data-topic="${tr.dataset.topic}"]`)?.focus(); };
      tr.addEventListener('click', toggle);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  },
  hours() {
    const total = $('#total'), maxc = $('#maxc');
    total.addEventListener('input', () => { state.hours.total = +total.value; rerenderKeepFocus('#total'); });
    maxc.addEventListener('input', () => { state.hours.maxChange = +maxc.value / 100; rerenderKeepFocus('#maxc'); });
  },
  data() {
    $('#file').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const text = await f.text();
      const res = parseCSV(text);
      const t = T();
      if (res.errors) {
        state.uploadMsg = { ok: false, lines: res.errors.map((er) => (er.code === 'missingCol' ? t.err.missingCol(er.col) : typeof t.err[er.code] === 'function' ? t.err[er.code](er.line) : t.err[er.code])) };
      } else {
        load(res.dataset);
        state.uploadMsg = { ok: true, lines: [t.dtLoaded(res.dataset.rows.length)] };
      }
      render();
    });
    $('#tpl').addEventListener('click', () => {
      const blob = new Blob(['﻿' + toCSV(generateDemo())], { type: 'text/csv;charset=utf-8' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'olshem-demo.csv' });
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#reset')?.addEventListener('click', () => { load(generateDemo()); state.uploadMsg = null; render(); });
  },
  report() {
    $('#print').addEventListener('click', () => window.print());
  },
};

function rerenderKeepFocus(sel) {
  render();
  $(sel)?.focus();
}

// ---------- подсказки ----------
const tip = $('#tip');
document.addEventListener('pointerover', (e) => {
  const el = e.target.closest('[data-tip]');
  if (!el) { tip.hidden = true; return; }
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
});
document.addEventListener('pointermove', (e) => {
  if (tip.hidden) return;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = e.clientX + 14, y = e.clientY - h - 10;
  if (x + w > innerWidth - 8) x = e.clientX - w - 14;
  if (y < 8) y = e.clientY + 18;
  tip.style.transform = `translate(${x}px, ${y}px)`;
});
document.addEventListener('pointerout', (e) => { if (!e.relatedTarget?.closest?.('[data-tip]')) tip.hidden = true; });

// ---------- старт ----------
$('#lang').addEventListener('click', () => {
  state.lang = state.lang === 'ru' ? 'kz' : 'ru';
  store.set('olshem.lang', state.lang);
  render();
});
addEventListener('hashchange', () => { render(); $('#main').focus({ preventScroll: true }); scrollTo(0, 0); });
load(generateDemo());
render();
