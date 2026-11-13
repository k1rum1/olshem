import { test } from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { readXlsx } from '../public/xlsx.js';
import { parseTable, analyze } from '../public/engine.js';

// Собираем настоящий .xlsx вручную: zip из XML-файлов, сжатых deflate.
function zip(files) {
  const enc = new TextEncoder();
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const nameB = enc.encode(name), raw = enc.encode(text), data = zlib.deflateRawSync(raw);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nameB.length, 26);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nameB.length, 28); ch.writeUInt32LE(offset, 42);
    locals.push(lh, nameB, data);
    centrals.push(ch, nameB);
    offset += 30 + nameB.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(centrals.length / 2, 8); end.writeUInt16LE(centrals.length / 2, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

function makeXlsx(rows) {
  const strings = [];
  const sid = (s) => { let i = strings.indexOf(s); if (i < 0) { strings.push(s); i = strings.length - 1; } return i; };
  const col = (i) => String.fromCharCode(65 + i);
  const sheetRows = rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => typeof v === 'number'
    ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>`
    : `<c r="${col(ci)}${ri + 1}" t="s"><v>${sid(v)}</v></c>`).join('')}</row>`).join('');
  return zip({
    'xl/workbook.xml': '<workbook xmlns:r="r"><sheets><sheet name="СОР" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/sharedStrings.xml': `<sst>${strings.map((s) => `<si><t>${s.replace(/&/g, '&amp;')}</t></si>`).join('')}</sst>`,
    'xl/worksheets/sheet1.xml': `<worksheet><sheetData>${sheetRows}</sheetData></worksheet>`,
  });
}

test('Excel: читает лист, проценты-доли и казахские заголовки', async () => {
  const rows = [['Мектеп', 'Оқулық', 'Оқушы', 'Тақырып', 'Сағат', 'Балл']];
  for (let i = 0; i < 80; i++) rows.push([`СШ №${i % 8}`, i % 2 ? 'А' : 'С', `u${i}`, i % 3 ? 'Алгебраические дроби' : 'Одночлены', 10 + (i % 4), (35 + (i % 60)) / 100]);
  const table = await readXlsx(makeXlsx(rows));
  assert.equal(table.length, 81);
  assert.equal(table[1][0], 'СШ №0');
  const res = parseTable(table);
  assert.ok(res.dataset, JSON.stringify(res.errors));
  assert.equal(res.dataset.rows[0].score, 35);
  assert.equal(res.dataset.topics.find((t) => t.ru === 'Одночлены').kz, 'Бірмүшелер');
  assert.doesNotThrow(() => analyze(res.dataset));
});

test('Excel: не zip — понятная ошибка', async () => {
  await assert.rejects(readXlsx(Buffer.from('hello world, definitely not a zip file at all')));
});
