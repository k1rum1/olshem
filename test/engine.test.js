import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateDemo, analyze, recommendHours, toCSV, parseCSV } from '../public/engine.js';

const ds = generateDemo();
const an = analyze(ds);

test('находит заложенные сложные темы', () => {
  const hard = an.topicStats.filter((t) => t.hard).map((t) => t.id);
  assert.ok(hard.includes('T5') && hard.includes('T6'));
  assert.ok(!hard.includes('T1') && !hard.includes('T2'));
});

test('находит корень проблемы: дроби растут из разложения на множители', () => {
  const t6 = an.topicStats.find((t) => t.id === 'T6');
  assert.equal(t6.root.topic, 'T5');
  assert.ok(t6.root.rr > 2);
});

test('поправка на уровень учеников меняет лидера среди учебников', () => {
  const raw = [...an.textbooks].sort((a, b) => b.raw - a.raw)[0].id;
  const adj = [...an.textbooks].sort((a, b) => b.adj - a.adj)[0].id;
  assert.equal(raw, 'Б');
  assert.equal(adj, 'Ә');
  assert.ok(an.topicWinners.T6.best === 'Ә' && an.topicWinners.T6.confident);
});

test('модель восстанавливает эффект часов: сложные темы чувствительнее', () => {
  assert.ok(an.model.T6.slope > 15 && an.model.T6.slopeLo > 0);
  assert.ok(Math.abs(an.model.T2.slope) < 6);
});

test('перераспределение часов сохраняет сумму и уважает ограничения', () => {
  const r = recommendHours(an, { maxChange: 0.35 });
  assert.equal(r.totalRec, r.totalNow);
  for (const x of r.rows) {
    assert.ok(x.recommended >= 4);
    assert.ok(Math.abs(x.delta) <= Math.ceil(x.current * 0.35));
  }
  const up = r.rows.filter((x) => x.delta > 0).map((x) => x.id);
  assert.ok(up.includes('T6') && up.includes('T5'));
  assert.ok(r.avgGain > 0);
});

test('изменение общего числа часов и нулевой лимит', () => {
  assert.equal(recommendHours(an, { total: 96 }).totalRec, 96);
  const frozen = recommendHours(an, { maxChange: 0 });
  assert.ok(frozen.rows.every((x) => x.delta === 0));
});

test('CSV: выгрузка и загрузка дают тот же анализ', () => {
  const back = parseCSV(toCSV(ds));
  assert.ok(back.dataset);
  assert.equal(back.dataset.rows.length, ds.rows.length);
  const an2 = analyze(back.dataset);
  assert.ok(Math.abs(an2.overall - an.overall) < 1e-9);
});

test('CSV: понятные ошибки', () => {
  assert.equal(parseCSV('').errors[0].code, 'empty');
  assert.equal(parseCSV('school;topic\nА;Б').errors[0].code, 'missingCol');
  const bad = parseCSV('школа,учебник,ученик,тема,часы,балл\nСШ 1,А,1,Дроби,10,140');
  assert.deepEqual(bad.errors[0], { code: 'badScore', line: 2 });
});

test('CSV: русские заголовки, запятая и пропущенный входной балл', () => {
  const csv = 'школа,учебник,ученик,тема,часы,балл\n' +
    Array.from({ length: 60 }, (_, i) => `СШ ${i % 6},${i % 2 ? 'А' : 'Б'},${i},Дроби,${10 + (i % 3)},${40 + (i % 50)}`).join('\n');
  const res = parseCSV(csv);
  assert.ok(res.dataset);
  assert.ok(res.dataset.rows.every((r) => Number.isFinite(r.baseline)));
  assert.doesNotThrow(() => recommendHours(analyze(res.dataset)));
});
