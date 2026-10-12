/**
 * 해커톤 팀 보드 서버(앱스 스크립트). 구글 시트가 데이터베이스다.
 * tools/build_gas.py가 js/config.js, js/ops.js, js/sample-data.js를 이 파일 앞에 붙여 gas/Code.js를 만든다.
 *
 * 웹 앱 설정: 실행 사용자 '나', 접근 '모든 사용자'. 그래서 주소를 아는 누구나 읽고,
 * 글쓰기는 사람 시트에 등록된 이메일과 6자리 참여 코드로 로그인한 사람만 한다.
 * 이메일과 참여 코드는 화면으로 보내지 않는다(publicFromModel_).
 *
 * 화면이 부르는 함수: boot, getState, poll, login, api, getImage, admin(운영진만)
 * 시트 메뉴 '해커톤': 시트 준비, 참여 코드 만들기, 참여 코드 메일 보내기, 예시 데이터 넣기·지우기, 새 행사로 비우기
 *
 * @OnlyCurrentDoc
 */

const CHUNK = 45000;          // 그림 한 칸에 넣는 글자 수(시트 한 칸 최대 50,000자)
const CACHE_PART = 30000;     // 캐시 한 칸에 넣는 글자 수(캐시 한 칸 최대 100KB, 한글은 3바이트)
const CACHE_SEC = 21600;      // 캐시 최대 6시간
const SETTINGS_SHEET = '설정';
const READONLY_LABEL = '글쓰기 닫기';

/* ================================================================ 웹 앱 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle(HB.config.event.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/** 처음 열 때. token이 있으면 그 사람으로 */
function boot(token) { return respond_(token, ''); }
function getState(token) { return respond_(token, ''); }

/** 15초마다 화면이 묻는 판 번호. 시트를 읽지 않는다 */
function poll() { return version_(); }

function login(email, code) {
  email = String(email || '').trim().toLowerCase();
  code = String(code || '').trim();
  if (!email || !/^[0-9]{6}$/.test(code)) return JSON.stringify({ error: '이메일과 6자리 코드를 확인해 주세요.' });
  const cache = CacheService.getScriptCache();
  const failKey = 'fail:' + Utilities.base64EncodeWebSafe(email).slice(0, 200);
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= 8) return JSON.stringify({ error: '여러 번 틀렸어요. 10분 뒤에 다시 해 주세요.' });
  const p = readTable_('people').rows.find((r) => String(r.email).trim().toLowerCase() === email);
  if (!p || !String(p.code).trim() || String(p.code).trim() !== code) {
    cache.put(failKey, String(fails + 1), 600);
    return JSON.stringify({ error: '이메일이나 참여 코드가 맞지 않아요.' });
  }
  cache.remove(failKey);
  return JSON.stringify({ token: p.id + '.' + sign_(p.id + '|' + String(p.code).trim()) });
}

/** 쓰기. op는 js/ops.js의 함수 이름. 잠금을 걸고 시트를 읽어 규칙대로 고친 뒤 바뀐 행만 쓴다 */
function api(op, args, token) {
  if (typeof op !== 'string' || !/^[a-zA-Z]+$/.test(op) || !Object.prototype.hasOwnProperty.call(HB.ops, op)) {
    return respond_(token, '"error":"알 수 없는 요청이에요."');
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return respond_(token, '"error":"사람이 많아요. 잠시 뒤 다시 눌러 주세요."');
  let error = '';
  try {
    const db = readAll_();
    const meRow = whoAmI_(token, db.people.rows);
    if (!meRow) return respond_(token, '"error":"다시 로그인해 주세요."');
    const state = assemble_(db);
    const me = state.people.find((p) => p.id === meRow.id);
    const before = flatten_(state);
    try {
      HB.ops[op](state, args || {}, me, Date.now());
    } catch (e) {
      if (e && e.isOp) error = e.message; else throw e;
    }
    if (!error) {
      storeImages_(state);
      writeDiff_(db, before, flatten_(state));
      cacheState_(publicFromModel_(state, bump_()));
    }
  } finally {
    lock.releaseLock();
  }
  return respond_(token, error ? '"error":' + JSON.stringify(error) : '');
}

/** 올린 그림 하나. 'img:아이디'의 아이디로 부른다 */
function getImage(id) {
  if (!/^g[a-z0-9]{8,32}$/.test(String(id || ''))) return '';
  const cache = CacheService.getScriptCache();
  const hit = cache.get('img:' + id);
  if (hit) return hit;
  const sh = sheet_('images');
  const last = sh.getLastRow();
  if (last < 2) return '';
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  const rows = [];
  ids.forEach((v, i) => { if (String(v[0]) === id) rows.push(i + 2); });
  if (!rows.length) return '';
  const block = sh.getRange(rows[0], 1, rows[rows.length - 1] - rows[0] + 1, 3).getValues()
    .filter((r) => String(r[0]) === id)
    .sort((a, b) => Number(a[1]) - Number(b[1]));
  const data = block.map((r) => String(r[2])).join('');
  if (data.length < 95000) cache.put('img:' + id, data, CACHE_SEC);
  return data;
}

/* ================================================================ 응답과 캐시 */

// 모두에게 같은 판(JSON 글자)에 이 사람 아이디와 주소를 붙인다
function respond_(token, extra) {
  const json = sharedState_();
  const me = token ? whoAmI_(token) : null;
  let out = '{"state":' + json + ',"meId":' + JSON.stringify(me ? me.id : null) + ',"url":' + JSON.stringify(url_());
  if (token && !me) out += ',"relogin":true';
  if (extra) out += ',' + extra;
  return out + '}';
}

function url_() {
  try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; }
}

function version_() {
  const cache = CacheService.getScriptCache();
  let v = cache.get('ver');
  if (!v) {
    v = PropertiesService.getScriptProperties().getProperty('ver') || '1';
    cache.put('ver', v, CACHE_SEC);
  }
  return Number(v);
}

function bump_() {
  const props = PropertiesService.getScriptProperties();
  const v = String(Math.max(Date.now(), Number(props.getProperty('ver') || 0) + 1));
  props.setProperty('ver', v);
  CacheService.getScriptCache().put('ver', v, CACHE_SEC);
  return Number(v);
}

function sharedState_() {
  const v = version_();
  const cache = CacheService.getScriptCache();
  const head = cache.get('st:' + v);
  if (head) {
    const keys = [];
    for (let i = 0; i < Number(head); i++) keys.push('st:' + v + ':' + i);
    const parts = cache.getAll(keys);
    if (keys.every((k) => parts[k] != null)) return keys.map((k) => parts[k]).join('');
  }
  return cacheState_(publicFromModel_(assemble_(readAll_()), v));
}

function cacheState_(pub) {
  const json = JSON.stringify(pub);
  const map = {};
  const n = Math.ceil(json.length / CACHE_PART);
  for (let i = 0; i < n; i++) map['st:' + pub.version + ':' + i] = json.slice(i * CACHE_PART, (i + 1) * CACHE_PART);
  try {
    const cache = CacheService.getScriptCache();
    cache.putAll(map, CACHE_SEC);
    cache.put('st:' + pub.version, String(n), CACHE_SEC);
  } catch (e) { /* 캐시가 차면 다음에 시트에서 다시 읽는다 */ }
  return json;
}

// 화면에 보내도 되는 것만. 이메일·참여 코드·코드 보낸 때는 뺀다
function publicFromModel_(state, version) {
  return {
    version: version,
    settings: state.settings,
    people: state.people.map((p) => ({ id: p.id, name: p.name, school: p.school, level: p.level, job: p.job, avatar: p.avatar || 'a20', role: p.role })),
    ideas: state.ideas,
    teams: state.teams,
    logs: state.logs,
  };
}

/* ================================================================ 로그인 */

function secret_() {
  const props = PropertiesService.getScriptProperties();
  let k = props.getProperty('secret');
  if (!k) { k = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('secret', k); }
  return k;
}

function sign_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret_())).replace(/=+$/, '');
}

// 표는 '사람아이디.서명'. 참여 코드를 바꾸면 그 사람의 예전 표는 바로 못 쓴다
function whoAmI_(token, people) {
  const m = /^([a-z][a-z0-9]{1,30})\.([A-Za-z0-9_-]+)$/.exec(String(token || ''));
  if (!m) return null;
  const p = (people || readTable_('people').rows).find((r) => r.id === m[1]);
  if (!p || !String(p.code).trim()) return null;
  return sign_(p.id + '|' + String(p.code).trim()) === m[2] ? p : null;
}

/* ================================================================ 시트 구조 */

// [화면 데이터 이름, 시트 열 이름, 바꾸는 방식]. 열 순서는 바꿔도 되고, 열 이름은 바꾸면 안 된다
function schema_() {
  const C = HB.config;
  const fields = (prefix, label, list) => list.map((f) => [prefix + '.' + f.key, label + ': ' + f.label]);
  return {
    people: { sheet: '사람', cols: [
      ['id', '아이디'], ['name', '이름'], ['school', '학교'], ['level', '학교급'], ['job', '맡은 일'], ['avatar', '아바타'],
      ['role', '역할', 'role'], ['email', '이메일'], ['code', '참여 코드'], ['mailedAt', '코드 보낸 때', 'time']] },
    ideas: { sheet: '아이디어', cols: [
      ['id', '아이디'], ['by', '올린 사람'], ['at', '올린 때', 'time'], ['level', '학교급'], ['tags', '태그', 'list'],
      ['title', '제목'], ['problem', '학교에서 겪는 일'], ['wish', '바라는 것'], ['likes', '공감', 'list']] },
    teams: { sheet: '팀', cols: [
      ['id', '아이디'], ['name', '팀 이름'], ['pet', '펫', 'pet'], ['ideaId', '아이디어'], ['facil', '퍼실'],
      ['level', '학교급'], ['tags', '태그', 'list'], ['createdAt', '만든 때', 'time'], ['members', '참가자', 'list']]
      .concat(fields('plan', '계획', C.planFields))
      .concat([['roles', '맡은 일', 'json'], ['steps', '일정', 'json']])
      .concat(fields('intent', '제작 의도', C.intentFields))
      .concat(fields('work', '작품', C.workFields))
      .concat([['work.cover', '작품: 대표 그림'], ['published', '공개', 'bool'], ['publishedAt', '공개한 때', 'time']]) },
    logs: { sheet: '기록', cols: [
      ['id', '아이디'], ['team', '팀'], ['by', '쓴 사람'], ['at', '쓴 때', 'time'], ['kind', '종류', 'kind'],
      ['text', '글'], ['link', '링크'], ['image', '그림'], ['cheers', '응원', 'list']] },
    comments: { sheet: '댓글', cols: [['id', '아이디'], ['target', '달린 곳'], ['by', '쓴 사람'], ['at', '쓴 때', 'time'], ['text', '글']] },
    notes: { sheet: '의견', cols: [['id', '아이디'], ['team', '팀'], ['by', '쓴 사람'], ['at', '쓴 때', 'time'], ['text', '글']] },
    images: { sheet: '그림', cols: [['id', '아이디'], ['part', '순서'], ['data', '데이터']] },
  };
}
const DATA_TABLES = ['ideas', 'teams', 'logs', 'comments', 'notes'];
const ROLE_NAMES = { participant: '참가자', facil: '퍼실', staff: '운영진' };

function toCell_(type, v) {
  if (type === 'time') return v ? new Date(v) : '';
  if (type === 'list') return (v || []).join(', ');
  if (type === 'json') return v ? JSON.stringify(v) : '';
  if (type === 'bool') return !!v;
  if (type === 'role') return ROLE_NAMES[v] || v || '';
  if (type === 'kind') { const k = HB.config.logKinds.find((x) => x.key === v); return k ? k.name : (v || ''); }
  if (type === 'pet') { const p = HB.config.pets.find((x) => x.id === v); return p ? p.name : (v || ''); }
  const s = v == null ? '' : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;   // 수식으로 읽히지 않게
}

function fromCell_(type, v) {
  if (type === 'time') return v instanceof Date ? v.getTime() : (v ? (new Date(v).getTime() || null) : null);
  if (type === 'list') return String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (type === 'json') { try { return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  if (type === 'bool') return v === true || String(v).toUpperCase() === 'TRUE';
  if (type === 'role') { const k = Object.keys(ROLE_NAMES).find((x) => ROLE_NAMES[x] === v || x === v); return k || 'participant'; }
  if (type === 'kind') { const k = HB.config.logKinds.find((x) => x.name === v || x.key === v); return k ? k.key : 'make'; }
  if (type === 'pet') { const p = HB.config.pets.find((x) => x.name === v || x.id === v); return p ? p.id : String(v || ''); }
  return v == null ? '' : String(v);
}

function sheet_(key) {
  const sc = schema_()[key];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sc.sheet);
  return sh && sh.getLastRow() > 0 ? sh : prepareSheet_(ss, key);
}

// 머리 줄의 열 이름으로 열을 찾는다. 운영진이 열을 옮기거나 메모 열을 더해도 된다
function readTable_(key) {
  const sc = schema_()[key];
  const sh = sheet_(key);
  const lastRow = sh.getLastRow();
  const width = Math.max(sh.getLastColumn(), 1);
  const values = lastRow ? sh.getRange(1, 1, lastRow, width).getValues() : [[]];
  const header = values[0].map((h) => String(h).trim());
  const colIdx = sc.cols.map((c) => header.indexOf(c[1]));
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    const line = values[r];
    if (colIdx[0] < 0 || !String(line[colIdx[0]]).trim()) continue;
    const o = { _row: r + 1, _line: line };
    sc.cols.forEach((c, i) => { o[c[0]] = fromCell_(c[2], colIdx[i] < 0 ? '' : line[colIdx[i]]); });
    rows.push(o);
  }
  return { key: key, sh: sh, colIdx: colIdx, width: width, rows: rows };
}

function lineOf_(table, obj, oldLine) {
  const sc = schema_()[table.key];
  const line = oldLine ? oldLine.slice() : new Array(table.width).fill('');
  sc.cols.forEach((c, i) => { if (table.colIdx[i] >= 0) line[table.colIdx[i]] = toCell_(c[2], obj[c[0]]); });
  return line;
}

function readSettings_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
  const out = { readonly: false };
  if (!sh || sh.getLastRow() < 1) return out;
  sh.getRange(1, 1, sh.getLastRow(), 2).getValues().forEach((r) => {
    if (String(r[0]).trim() === READONLY_LABEL) out.readonly = r[1] === true || String(r[1]).toUpperCase() === 'TRUE';
  });
  return out;
}

function readAll_() {
  const db = { settings: readSettings_() };
  ['people'].concat(DATA_TABLES).forEach((k) => { db[k] = readTable_(k); });
  return db;
}

/* ================================================================ 시트 행 ↔ 화면 데이터 */

function clean_(o) {
  const x = {};
  Object.keys(o).forEach((k) => { if (k !== '_row' && k !== '_line') x[k] = o[k]; });
  return x;
}

function nest_(row) {
  const out = {};
  Object.keys(row).forEach((k) => {
    const dot = k.indexOf('.');
    if (dot < 0) { out[k] = row[k]; return; }
    const head = k.slice(0, dot);
    out[head] = out[head] || {};
    out[head][k.slice(dot + 1)] = row[k];
  });
  return out;
}

function assemble_(db) {
  const byAt = (a, b) => (a.at || 0) - (b.at || 0);
  const ideas = db.ideas.rows.map((r) => Object.assign(clean_(r), { comments: [] }));
  const logs = db.logs.rows.map((r) => Object.assign(clean_(r), { comments: [] }));
  const teams = db.teams.rows.map((r) => {
    const t = nest_(clean_(r));
    t.plan = t.plan || {}; t.intent = t.intent || {}; t.work = t.work || {};
    t.roles = t.roles || {}; t.steps = t.steps || []; t.notes = [];
    if (!t.published) t.publishedAt = null;
    return t;
  });
  const ideaMap = {}, logMap = {}, teamMap = {};
  ideas.forEach((i) => { ideaMap[i.id] = i; });
  logs.forEach((l) => { logMap[l.id] = l; });
  teams.forEach((t) => { teamMap[t.id] = t; });
  db.comments.rows.map(clean_).sort(byAt).forEach((c) => {
    const host = ideaMap[c.target] || logMap[c.target];
    if (host) host.comments.push({ id: c.id, by: c.by, at: c.at, text: c.text });
  });
  db.notes.rows.map(clean_).sort(byAt).forEach((n) => {
    if (teamMap[n.team]) teamMap[n.team].notes.push({ id: n.id, by: n.by, at: n.at, text: n.text });
  });
  return {
    settings: db.settings,
    people: db.people.rows.map(clean_),
    ideas: ideas.sort(byAt),
    teams: teams.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
    logs: logs.sort(byAt),
  };
}

// 화면 데이터를 시트 행 모양으로. 쓰기 전후를 비교하는 데 쓴다
function flatten_(s) {
  const sc = schema_();
  const pickRow = (key, obj) => {
    const row = {};
    sc[key].cols.forEach((c) => {
      const path = c[0].split('.');
      row[c[0]] = path.length > 1 ? (obj[path[0]] || {})[path[1]] : obj[c[0]];
    });
    return row;
  };
  const comments = [];
  s.ideas.forEach((i) => i.comments.forEach((c) => comments.push({ id: c.id, target: i.id, by: c.by, at: c.at, text: c.text })));
  s.logs.forEach((l) => l.comments.forEach((c) => comments.push({ id: c.id, target: l.id, by: c.by, at: c.at, text: c.text })));
  const notes = [];
  s.teams.forEach((t) => t.notes.forEach((n) => notes.push({ id: n.id, team: t.id, by: n.by, at: n.at, text: n.text })));
  return {
    ideas: s.ideas.map((x) => pickRow('ideas', x)),
    teams: s.teams.map((x) => pickRow('teams', x)),
    logs: s.logs.map((x) => pickRow('logs', x)),
    comments: comments,
    notes: notes,
  };
}

// 바뀐 행만 고치고, 새 행은 아래에 붙이고, 없어진 행은 지운다
function writeDiff_(db, before, after) {
  DATA_TABLES.forEach((key) => {
    const table = db[key];
    const b = {}, a = {};
    before[key].forEach((r) => { b[r.id] = JSON.stringify(r); });
    after[key].forEach((r) => { a[r.id] = r; });
    const rowOf = {};
    table.rows.forEach((r) => { rowOf[r.id] = r; });

    const added = [];
    after[key].forEach((r) => {
      if (b[r.id] === JSON.stringify(r)) return;
      const old = rowOf[r.id];
      if (old) table.sh.getRange(old._row, 1, 1, table.width).setValues([lineOf_(table, r, old._line)]);
      else added.push(lineOf_(table, r));
    });
    Object.keys(b).filter((id) => !a[id] && rowOf[id]).map((id) => rowOf[id]._row)
      .sort((x, y) => y - x)
      .forEach((row) => table.sh.deleteRow(row));
    if (added.length) table.sh.getRange(table.sh.getLastRow() + 1, 1, added.length, table.width).setValues(added);
  });
}

// 새로 올린 그림(data URL)을 그림 시트에 잘라 넣고 'img:아이디'로 바꾼다
function storeImages_(state) {
  const save = (dataUrl) => {
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl) || dataUrl.length > 2000000) return '';
    const id = 'g' + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    const table = readTable_('images');
    const lines = [];
    for (let i = 0; i * CHUNK < dataUrl.length; i++) lines.push(lineOf_(table, { id: id, part: String(i), data: dataUrl.slice(i * CHUNK, (i + 1) * CHUNK) }));
    table.sh.getRange(table.sh.getLastRow() + 1, 1, lines.length, table.width).setValues(lines);
    return 'img:' + id;
  };
  state.logs.forEach((l) => { if (/^data:/.test(l.image || '')) l.image = save(l.image); });
  state.teams.forEach((t) => { if (/^data:/.test((t.work || {}).cover || '')) t.work.cover = save(t.work.cover); });
}

/* ================================================================ 시트 준비 */

function prepareSheet_(ss, key) {
  const sc = schema_()[key];
  let sh = ss.getSheetByName(sc.sheet);
  if (!sh) sh = ss.insertSheet(sc.sheet);
  const width = Math.max(sh.getLastColumn(), 1);
  const header = sh.getLastRow() ? sh.getRange(1, 1, 1, width).getValues()[0].map((h) => String(h).trim()) : [];
  const missing = sc.cols.filter((c) => header.indexOf(c[1]) < 0).map((c) => c[1]);
  if (missing.length) {
    const start = header.filter((h) => h).length + 1;
    sh.getRange(1, start, 1, missing.length).setValues([missing]);
  }
  sh.setFrozenRows(1);
  const full = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map((h) => String(h).trim());
  const rows = Math.max(sh.getMaxRows() - 1, 1);
  sc.cols.forEach((c) => {
    const col = full.indexOf(c[1]) + 1;
    if (col < 1) return;
    const range = sh.getRange(2, col, rows, 1);
    if (c[2] === 'time') range.setNumberFormat('yyyy-mm-dd hh:mm');
    // insertCheckboxes는 빈칸에 FALSE를 채워 마지막 행이 1,000행이 되므로 검증 규칙만 건다
    else if (c[2] === 'bool') range.setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
    else range.setNumberFormat('@');
  });
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#e4ead8');
  return sh;
}

function setupSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(schema_()).forEach((k) => prepareSheet_(ss, k));
  let st = ss.getSheetByName(SETTINGS_SHEET);
  if (!st) {
    st = ss.insertSheet(SETTINGS_SHEET);
    st.getRange(1, 1, 2, 2).setValues([['항목', '값'], [READONLY_LABEL, false]]);
    st.getRange(2, 2).insertCheckboxes();
    st.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#e4ead8');
  }
  // 새 스프레드시트의 빈 첫 시트는 지운다
  ss.getSheets().forEach((sh) => {
    if (/^(시트1|Sheet1)$/.test(sh.getName()) && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
}

// 한 표를 통째로 다시 쓴다(예시 넣기, 비우기)
function writeAll_(key, objs) {
  const table = readTable_(key);
  const last = table.sh.getLastRow();
  if (last > 1) table.sh.getRange(2, 1, last - 1, table.width).clearContent();
  if (objs.length) table.sh.getRange(2, 1, objs.length, table.width).setValues(objs.map((o) => lineOf_(table, o)));
}

// 예시 넣기. 이미 있는 사람(직접 등록한 운영진 등)은 그대로 두고 없는 예시 사람만 더한다
function seedSample_(snapKey) {
  setupSheets_();
  const s = HB.sample.build(snapKey || 'after');
  const existing = readTable_('people').rows.map(clean_);
  const have = {};
  existing.forEach((p) => { have[p.id] = true; });
  writeAll_('people', existing.concat(s.people.filter((p) => !have[p.id])));
  const flat = flatten_(s);
  DATA_TABLES.forEach((k) => writeAll_(k, flat[k]));
  writeAll_('images', []);
  bump_();
}

// 예시 지우기. 글은 모두 지우고, 사람은 이메일 없는 예시 사람만 지운다
function clearSample_() {
  const ids = {};
  HB.sample.peopleIds().forEach((id) => { ids[id] = true; });
  const keep = readTable_('people').rows.map(clean_).filter((p) => !ids[p.id] || String(p.email).trim());
  writeAll_('people', keep);
  clearEvent_();
}

function clearEvent_() {
  DATA_TABLES.concat(['images']).forEach((k) => writeAll_(k, []));
  bump_();
}

function newCode_(used) {
  let code;
  do { code = String(100000 + Math.floor(Math.random() * 900000)); } while (used[code]);
  used[code] = true;
  return code;
}

function usedCodes_(table) {
  const used = {};
  table.rows.forEach((r) => { if (String(r.code).trim()) used[String(r.code).trim()] = true; });
  return used;
}

function writePerson_(table, r) {
  table.sh.getRange(r._row, 1, 1, table.width).setValues([lineOf_(table, r, r._line)]);
}

// 이메일이 있고 코드가 빈 사람에게 코드를 붙인다. 만든 수를 돌려준다
function makeCodes_(table) {
  const used = usedCodes_(table);
  let n = 0;
  table.rows.forEach((r) => {
    if (!String(r.email).trim() || String(r.code).trim()) return;
    r.code = newCode_(used);
    writePerson_(table, r);
    n++;
  });
  return n;
}

function mailTargets_(table) {
  return table.rows.filter((r) => String(r.email).trim() && String(r.code).trim() && !r.mailedAt);
}

// 코드 메일 보내기. 보낼 수 없으면 까닭(글자)을, 보냈으면 보낸 수를 돌려준다
function mailCodes_(table) {
  const url = url_();
  const targets = mailTargets_(table);
  if (!targets.length) return '보낼 사람이 없어요. 이메일과 코드가 있고 \'코드 보낸 때\'가 빈 사람에게만 보내요.';
  if (!url) return '웹 앱을 먼저 배포해 주세요. 메일에 접속 주소가 들어가요.';
  const left = MailApp.getRemainingDailyQuota();
  if (left < targets.length) return `오늘 보낼 수 있는 메일이 ${left}통 남았어요. ${targets.length}명에게 보내려면 내일 다시 해 주세요.`;
  targets.forEach((r) => {
    MailApp.sendEmail({
      to: String(r.email).trim(),
      name: 'G-DEAL 해커톤',
      subject: `[${HB.config.event.title}] 참여 코드`,
      body: `${r.name} 선생님, 팀 보드 참여 코드는 ${String(r.code).trim()} 입니다.\n\n접속 주소: ${url}\n\n'참여하기'를 누르고 이 메일 주소와 코드를 넣으면 글을 쓸 수 있어요. 코드는 다른 사람과 나누지 마세요.`,
    });
    r.mailedAt = Date.now();
    writePerson_(table, r);
  });
  return targets.length;
}

/* ================================================================ 운영진 화면 */

// 운영진 화면이 부르는 함수. 이메일·참여 코드는 여기서만 운영진에게 보낸다
function admin(action, args, token) {
  args = args || {};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return respond_(token, '"error":"사람이 많아요. 잠시 뒤 다시 눌러 주세요."');
  let extra = '';
  try {
    const db = readAll_();
    const me = whoAmI_(token, db.people.rows);
    if (!me || me.role !== 'staff') return respond_(token, '"error":"운영진만 할 수 있어요."');
    let result;
    try {
      result = Object.prototype.hasOwnProperty.call(ADMIN_, action) ? ADMIN_[action](db, args, me) : '알 수 없는 요청이에요.';
    } catch (e) {
      if (e && e.isOp) result = e.message; else throw e;
    }
    if (typeof result === 'string') extra = '"error":' + JSON.stringify(result) + ',';
    else if (result && result.note) extra = '"note":' + JSON.stringify(result.note) + ',';
    const people = readTable_('people').rows.map((r) => ({
      id: r.id, name: r.name, school: r.school, level: r.level, job: r.job, avatar: r.avatar, role: r.role,
      email: r.email, code: r.code, mailedAt: r.mailedAt,
    }));
    extra += '"people":' + JSON.stringify(people) + ',"sheetUrl":' + JSON.stringify(SpreadsheetApp.getActiveSpreadsheet().getUrl());
  } finally {
    lock.releaseLock();
  }
  return respond_(token, extra);
}

// 사람 시트 줄을 바꿀 때 팀도 같이 정리한다(역할이 바뀌면 그 팀 자리에서 뺀다)
function detachInSheets_(db, pid, role) {
  const state = assemble_(db);
  const before = flatten_(state);
  HB.detachPerson(state, pid, role);
  writeDiff_(db, before, flatten_(state));
}

const ADMIN_ = {
  people: () => ({}),

  savePerson: (db, a, me) => {
    const table = db.people;
    const p = HB.checkPerson(a.person || {}, table.rows, me);
    const old = p.id ? table.rows.find((r) => r.id === p.id) : null;
    if (p.id && !old) return '없는 사람이에요.';
    if (old) {
      if (old.role !== p.role) detachInSheets_(db, p.id, p.role);
      if (String(old.email).trim().toLowerCase() !== p.email) { old.mailedAt = null; }
      ['name', 'school', 'level', 'job', 'avatar', 'role', 'email'].forEach((k) => { old[k] = p[k]; });
      writePerson_(table, old);
    } else {
      p.id = 'u' + Utilities.getUuid().replace(/-/g, '').slice(0, 9);
      p.code = '';
      table.sh.getRange(table.sh.getLastRow() + 1, 1, 1, table.width).setValues([lineOf_(table, p)]);
    }
    bump_();
    return {};
  },

  newCode: (db, a, me) => {
    const r = db.people.rows.find((x) => x.id === a.id);
    if (!r) return '없는 사람이에요.';
    if (r.id === me.id) return '내 코드는 시트에서 바꿔 주세요. 바꾸면 바로 로그아웃돼요.';
    if (!String(r.email).trim()) return '이메일을 먼저 적어 주세요.';
    r.code = newCode_(usedCodes_(db.people));
    r.mailedAt = null;
    writePerson_(db.people, r);
    bump_();
    return { note: `${r.name} 선생님 코드를 새로 만들었어요. 예전 코드로는 들어올 수 없어요.` };
  },

  makeCodes: (db) => {
    const n = makeCodes_(db.people);
    bump_();
    return { note: n ? `참여 코드 ${n}개를 만들었어요.` : '이메일이 있고 코드가 빈 사람이 없어요.' };
  },

  mailCodes: (db) => {
    const r = mailCodes_(db.people);
    if (typeof r === 'string') return r;
    bump_();
    return { note: `${r}명에게 참여 코드 메일을 보냈어요.` };
  },

  removePerson: (db, a, me) => {
    const r = db.people.rows.find((x) => x.id === a.id);
    if (!r) return '없는 사람이에요.';
    if (r.id === me.id) return '나는 지울 수 없어요.';
    detachInSheets_(db, r.id, '');
    db.people.sh.deleteRow(r._row);
    bump_();
    return { note: `${r.name} 선생님을 지웠어요. 쓴 글은 남아요.` };
  },

  setReadonly: (db, a) => {
    setupSheets_();
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
    const rows = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
    const i = rows.findIndex((r) => String(r[0]).trim() === READONLY_LABEL);
    if (i < 0) sh.getRange(sh.getLastRow() + 1, 1, 1, 2).setValues([[READONLY_LABEL, !!a.on]]);
    else sh.getRange(i + 1, 2).setValue(!!a.on);
    bump_();
    return { note: a.on ? '글쓰기를 닫았어요. 운영진만 쓸 수 있어요.' : '글쓰기를 열었어요.' };
  },

  sample: (db, a) => {
    if (a.mode === 'load') { seedSample_('after'); return { note: '예시 데이터를 넣었어요. 직접 등록한 사람은 그대로예요.' }; }
    if (a.mode === 'clear') { clearSample_(); return { note: '예시 데이터를 지웠어요. 이메일이 있는 사람은 남겼어요.' }; }
    return '알 수 없는 요청이에요.';
  },
};

/* ================================================================ 시트 메뉴 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('해커톤')
    .addItem('시트 준비', 'menuSetup')
    .addItem('참여 코드 만들기', 'menuCodes')
    .addItem('참여 코드 메일 보내기', 'menuMail')
    .addSeparator()
    .addItem('예시 데이터 넣기', 'menuSample')
    .addItem('예시 데이터 지우기', 'menuClearSample')
    .addItem('새 행사로 비우기', 'menuClear')
    .addToUi();
}

// 시트를 직접 고치면 화면도 다음 확인 때 새로 받는다
function onEdit() {
  try { bump_(); } catch (e) { /* 단순 트리거에서 막히면 다음 쓰기 때 반영된다 */ }
}

function menuSetup() {
  setupSheets_();
  bump_();
  SpreadsheetApp.getUi().alert('시트를 준비했어요. 사람 시트에 참가자·퍼실·운영진을 적고 \'참여 코드 만들기\'를 누르세요.');
}

function menuCodes() {
  const n = makeCodes_(readTable_('people'));
  bump_();
  SpreadsheetApp.getUi().alert(n ? `참여 코드 ${n}개를 만들었어요.` : '이메일이 있고 코드가 빈 사람이 없어요.');
}

function menuMail() {
  const ui = SpreadsheetApp.getUi();
  const table = readTable_('people');
  const n = mailTargets_(table).length;
  if (n && ui.alert(`${n}명에게 참여 코드 메일을 보낼까요? (오늘 남은 메일 ${MailApp.getRemainingDailyQuota()}통)`, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  const r = mailCodes_(table);
  bump_();
  ui.alert(typeof r === 'string' ? r : `${r}명에게 보냈어요.`);
}

function menuSample() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('예시 데이터를 넣을까요? 아이디어·팀·기록·댓글·의견·그림 시트의 지금 내용은 지워지고, 사람 시트에 이미 있는 사람은 그대로 남아요.', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  seedSample_('after');
  ui.alert('예시 데이터를 넣었어요(12월 30일 시점).');
}

function menuClearSample() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('예시 데이터를 지울까요? 아이디어·팀·기록·댓글·의견·그림이 모두 지워지고, 사람은 이메일 없는 예시 사람만 지워져요.', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  clearSample_();
  ui.alert('지웠어요.');
}

function menuClear() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('아이디어·팀·기록·댓글·의견·그림을 모두 지울까요? 사람 시트는 남아요. 지운 행은 되돌릴 수 없으니 먼저 파일 > 사본 만들기로 백업하세요.', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  clearEvent_();
  ui.alert('비웠어요.');
}
