/* 앱스 스크립트 서비스 흉내(이 컴퓨터에서 확인할 때만). 웹 워커 안에서 돈다.
   시트는 메모리에만 있어서 새로고침하면 처음으로 돌아간다.
   진짜와 다르게 동작하면 확인이 틀어지므로, 진짜 쪽 규칙 몇 가지를 일부러 따라 한다.
   - setValues의 칸 수가 범위와 다르면 오류
   - 앞에 ' 를 붙인 글은 ' 를 떼고 저장
   - 캐시 한 칸이 100KB를 넘으면 오류 */
(function (g) {
  const blank = (v) => v === '' || v === null || v === undefined;

  function Range(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }); }
  Range.prototype.getValues = function () {
    const out = [];
    for (let i = 0; i < this.nr; i++) {
      const row = this.sheet.cells[this.r - 1 + i] || [];
      const line = [];
      for (let j = 0; j < this.nc; j++) {
        const v = row[this.c - 1 + j];
        line.push(blank(v) ? '' : v instanceof Date ? new Date(v.getTime()) : v);
      }
      out.push(line);
    }
    return out;
  };
  Range.prototype.setValues = function (vals) {
    if (vals.length !== this.nr || vals.some((l) => l.length !== this.nc)) {
      throw new Error(`setValues 크기가 달라요: 범위 ${this.nr}x${this.nc}, 값 ${vals.length}x${vals[0] && vals[0].length}`);
    }
    vals.forEach((line, i) => {
      const r = this.r - 1 + i;
      this.sheet.cells[r] = this.sheet.cells[r] || [];
      line.forEach((v, j) => {
        if (typeof v === 'string' && v.length > 50000) throw new Error('한 칸에 50,000자를 넘었어요');
        this.sheet.cells[r][this.c - 1 + j] = typeof v === 'string' && v[0] === "'" ? v.slice(1) : v;
      });
    });
    return this;
  };
  Range.prototype.setValue = function (v) { return this.setValues([[v]]); };
  Range.prototype.getValue = function () { return this.getValues()[0][0]; };
  Range.prototype.clearContent = function () { return this.setValues(Array.from({ length: this.nr }, () => new Array(this.nc).fill(''))); };
  Range.prototype.insertCheckboxes = function () { return this.setValues(Array.from({ length: this.nr }, () => new Array(this.nc).fill(false))); };
  ['setNumberFormat', 'setFontWeight', 'setBackground', 'setDataValidation'].forEach((m) => { Range.prototype[m] = function () { return this; }; });

  function Sheet(name) { this.name = name; this.cells = []; }
  Sheet.prototype.getName = function () { return this.name; };
  Sheet.prototype.getLastRow = function () {
    for (let r = this.cells.length - 1; r >= 0; r--) if ((this.cells[r] || []).some((v) => !blank(v))) return r + 1;
    return 0;
  };
  Sheet.prototype.getLastColumn = function () {
    let m = 0;
    this.cells.forEach((row) => { (row || []).forEach((v, c) => { if (!blank(v)) m = Math.max(m, c + 1); }); });
    return m;
  };
  Sheet.prototype.getMaxRows = function () { return Math.max(1000, this.cells.length); };
  Sheet.prototype.getRange = function (r, c, nr, nc) {
    if (typeof r !== 'number' || r < 1 || c < 1) throw new Error('getRange는 숫자 행·열만 흉내 내요');
    return new Range(this, r, c, nr || 1, nc || 1);
  };
  Sheet.prototype.setFrozenRows = function () { return this; };
  Sheet.prototype.deleteRow = function (r) { this.cells.splice(r - 1, 1); };

  const sheets = [new Sheet('시트1')];
  const ss = {
    getSheetByName: (n) => sheets.find((s) => s.name === n) || null,
    insertSheet: (n) => { const s = new Sheet(n); sheets.push(s); return s; },
    getSheets: () => sheets.slice(),
    deleteSheet: (s) => { sheets.splice(sheets.indexOf(s), 1); },
    getUrl: () => 'https://docs.google.com/spreadsheets/d/preview/edit',
  };
  g.SpreadsheetApp = {
    getActiveSpreadsheet: () => ss,
    newDataValidation: () => ({ requireCheckbox() { return this; }, build() { return {}; } }),
    getUi: () => { throw new Error('미리 보기에는 시트 메뉴가 없어요'); },
  };
  g.__sheets = sheets;

  const store = {};
  const bytes = (s) => new TextEncoder().encode(String(s)).length;
  const cache = {
    get: (k) => (store[k] && store[k].until > Date.now() ? store[k].v : null),
    put: (k, v, sec) => {
      if (bytes(v) > 100 * 1024) throw new Error('캐시 한 칸이 100KB를 넘었어요: ' + k);
      store[k] = { v: String(v), until: Date.now() + (sec || 600) * 1000 };
    },
    putAll: (map, sec) => Object.keys(map).forEach((k) => cache.put(k, map[k], sec)),
    getAll: (keys) => { const o = {}; keys.forEach((k) => { const v = cache.get(k); if (v !== null) o[k] = v; }); return o; },
    remove: (k) => { delete store[k]; },
  };
  g.CacheService = { getScriptCache: () => cache };

  const props = {};
  g.PropertiesService = { getScriptProperties: () => ({
    getProperty: (k) => (k in props ? props[k] : null),
    setProperty: (k, v) => { props[k] = String(v); },
    deleteProperty: (k) => { delete props[k]; },
  }) };

  g.LockService = { getScriptLock: () => ({ tryLock: () => true, waitLock: () => {}, releaseLock: () => {} }) };

  // 서명은 흉내만 낸다(안전하지 않음). 진짜는 HMAC-SHA256
  const toB64 = (bin) => btoa(bin).replace(/\+/g, '-').replace(/\//g, '_');
  g.Utilities = {
    getUuid: () => crypto.randomUUID(),
    computeHmacSha256Signature: (value, key) => {
      const s = key + '|' + value;
      const out = [];
      for (let i = 0; i < 32; i++) {
        let h = 2166136261 ^ i;
        for (let j = 0; j < s.length; j++) { h ^= s.charCodeAt(j); h = Math.imul(h, 16777619); }
        out.push(((h >>> 0) % 256) - 128);
      }
      return out;
    },
    base64EncodeWebSafe: (x) => {
      if (typeof x === 'string') return toB64(String.fromCharCode(...new TextEncoder().encode(x)));
      return toB64(String.fromCharCode(...x.map((b) => (b + 256) % 256)));
    },
  };

  g.ScriptApp = { getService: () => ({ getUrl: () => new URL('index.html', g.location.href).href }) };
  g.MailApp = { getRemainingDailyQuota: () => 100, sendEmail: (o) => console.log('메일(보내지 않음)', o.to) };
  g.HtmlService = {};
})(self);
