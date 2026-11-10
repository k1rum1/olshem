// Собирает главы единого учебника из book-src/<lang>/gNN.md в public/book/<lang>/gNN.json
// и оглавление public/book/<lang>/index.json. Покрытие тем учебниками — из book-src/cov/cov_gNN.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, '..', 'public', 'book');

export function parseChapter(text, id) {
  const lines = text.replace(/\r/g, '').split('\n');
  const ch = { id, title: '', grade: 10, ent: [], summary: '', sections: [], terms: [], added: [], sources: [], tests: [] };
  let mode = 'body';
  let sec = null;
  let test = null;
  const flushTest = () => { if (test) { ch.tests.push(test); test = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('# ') && !ch.title) { ch.title = line.slice(2).trim(); continue; }
    const meta = line.match(/^(grade|ent|summary):\s*(.*)$/);
    if (mode === 'body' && !sec && meta) {
      if (meta[1] === 'grade') ch.grade = +meta[2];
      else if (meta[1] === 'ent') ch.ent = meta[2].split(/[,\s]+/).filter(Boolean);
      else ch.summary = meta[2];
      continue;
    }
    if (line.startsWith('@')) { flushTest(); mode = line.slice(1).trim(); continue; }
    if (mode === 'body') {
      if (line.startsWith('## ')) { sec = { h: line.slice(3).trim(), md: '' }; ch.sections.push(sec); continue; }
      if (sec) sec.md += raw + '\n';
      continue;
    }
    if (mode === 'terms') {
      const m = line.match(/^- (.+?) :: (.+)$/);
      if (m) ch.terms.push({ t: m[1].trim(), d: m[2].trim() });
      continue;
    }
    if (mode === 'added') { if (line.startsWith('- ')) ch.added.push(line.slice(2).trim()); continue; }
    if (mode === 'sources') {
      const m = line.match(/^- (\w+) \| (\d+) \| ([^|]+) \| (.+)$/);
      if (m) ch.sources.push({ pub: m[1], grade: +m[2], pages: m[3].trim(), note: m[4].trim() });
      continue;
    }
    if (mode === 'tests') {
      const head = line.match(/^\? (single|multi|match) ([ABC])$/);
      if (head) { flushTest(); test = { type: head[1], level: head[2], q: '', options: [], answer: [], pairs: [], explain: '' }; continue; }
      if (!test || !line.trim()) continue;
      if (line.startsWith('+ ') || line.startsWith('- ')) {
        if (line.startsWith('+ ')) test.answer.push(test.options.length);
        test.options.push(line.slice(2).trim());
      } else if (line.startsWith('= ')) {
        const [l, r] = line.slice(2).split(' => ');
        test.pairs.push([l.trim(), (r || '').trim()]);
      } else if (line.startsWith('! ')) test.explain = line.slice(2).trim();
      else test.q += (test.q ? '\n' : '') + line.trim();
    }
  }
  flushTest();
  for (const s of ch.sections) s.md = s.md.trim();
  return ch;
}

export function validate(ch) {
  const errs = [];
  if (!ch.title) errs.push('нет заголовка');
  if (!ch.sections.length) errs.push('нет разделов');
  if (!ch.tests.length) errs.push('нет тестов');
  ch.tests.forEach((t, i) => {
    if (t.type === 'match' && t.pairs.length < 3) errs.push(`тест ${i + 1}: мало пар`);
    if (t.type !== 'match' && (t.options.length < 3 || !t.answer.length)) errs.push(`тест ${i + 1}: нет вариантов или ответа`);
    if (t.type === 'single' && t.answer.length !== 1) errs.push(`тест ${i + 1}: должен быть один ответ`);
    if (!t.q) errs.push(`тест ${i + 1}: нет вопроса`);
  });
  return errs;
}

function build() {
  let bad = 0;
  for (const lang of ['ru', 'kz']) {
    const dir = path.join(ROOT, lang);
    if (!fs.existsSync(dir)) continue;
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    const index = [];
    for (const f of fs.readdirSync(dir).filter((x) => /^g\d+\.md$/.test(x)).sort()) {
      const id = f.replace('.md', '');
      const ch = parseChapter(fs.readFileSync(path.join(dir, f), 'utf8'), id);
      const covFile = path.join(ROOT, 'cov', `cov_${id}.json`);
      if (fs.existsSync(covFile)) ch.coverage = JSON.parse(fs.readFileSync(covFile, 'utf8'));
      const errs = validate(ch);
      if (errs.length) { bad++; console.error(`${lang}/${id}:`, errs.join('; ')); }
      fs.writeFileSync(path.join(OUT, lang, `${id}.json`), JSON.stringify(ch));
      index.push({ id, title: ch.title, grade: ch.grade, ent: ch.ent, summary: ch.summary, tests: ch.tests.length });
    }
    fs.writeFileSync(path.join(OUT, lang, 'index.json'), JSON.stringify(index));
    console.log(`${lang}: ${index.length} глав`);
  }
  // Казахская версия должна совпадать с русской по структуре тестов.
  const kzDir = path.join(ROOT, 'kz');
  if (fs.existsSync(kzDir)) {
    for (const f of fs.readdirSync(kzDir).filter((x) => /^g\d+\.md$/.test(x))) {
      const id = f.replace('.md', '');
      const ru = parseChapter(fs.readFileSync(path.join(ROOT, 'ru', f), 'utf8'), id);
      const kz = parseChapter(fs.readFileSync(path.join(kzDir, f), 'utf8'), id);
      const sig = (c) => c.tests.map((t) => `${t.type}${t.level}:${t.options.length}:${t.answer.join(',')}:${t.pairs.length}`).join('|');
      const diffs = [];
      if (sig(ru) !== sig(kz)) diffs.push('тесты');
      if (ru.sections.length !== kz.sections.length) diffs.push(`разделы ${ru.sections.length}/${kz.sections.length}`);
      if (ru.terms.length !== kz.terms.length) diffs.push(`термины ${ru.terms.length}/${kz.terms.length}`);
      if (ru.grade !== kz.grade || ru.ent.join() !== kz.ent.join()) diffs.push('мета');
      if (diffs.length) { bad++; console.error(`kz/${id} расходится с ru:`, diffs.join(', ')); }
    }
  }
  if (bad) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
