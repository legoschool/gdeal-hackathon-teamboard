/* 운영 저장소: 서버가 저장을 확인한 뒤 화면을 갱신한다. 요청은 순서대로 보낸다. */
(function () {
  HB.mode = 'gas';
  const TOKEN_KEY = 'gdeal-hackathon-token';
  const listeners = [];
  let token = '', queue = Promise.resolve(), epoch = 0, polling = false;
  try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}
  const call = (fn, ...args) => new Promise((resolve, reject) => {
    google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[fn](...args);
  });
  const parse = (r) => typeof r === 'string' ? JSON.parse(r) : r;
  const notify = () => listeners.forEach((f) => f());
  const syncing = () => { const el = document.getElementById('sync'); if (el) el.hidden = !store.pending; };
  function enqueue(task) {
    store.pending++;
    epoch++;
    syncing();
    const requestToken = token;
    const next = queue.then(() => task(requestToken));
    queue = next.catch(() => {});
    return next.finally(() => { store.pending--; syncing(); });
  }
  const store = {
    state: null, meId: null, version: 0, url: '', pending: 0,
    take(res) {
      const data = parse(res);
      if (!data.state) throw new Error('데이터를 받지 못했어요. 다시 시도해 주세요.');
      if (data.relogin) store.forget();
      if (store.state && Number(data.state.version) < store.version) return;
      store.state = data.state;
      store.version = Number(data.state.version);
      store.meId = data.meId || null;
      if (data.url) store.url = data.url;
      notify();
    },
    async init() {
      if (google.script.url) await new Promise((r) => google.script.url.getLocation((loc) => {
        if (loc.hash && !location.hash) location.hash = loc.hash;
        r();
      }));
      store.take(await call('boot', token));
      setInterval(store.poll, 15000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) store.poll(); });
      window.addEventListener('beforeunload', (e) => {
        if (store.pending) { e.preventDefault(); e.returnValue = ''; }
      });
    },
    async poll() {
      if (document.hidden || store.pending || polling) return;
      polling = true;
      const started = epoch;
      try {
        const v = await call('poll');
        if (v !== store.version && !store.pending && started === epoch) {
          const data = await call('getState', token);
          if (!store.pending && started === epoch) store.take(data);
        }
      } catch (e) { /* 다음 확인 때 다시 시도 */ }
      finally { polling = false; }
    },
    commit(op, args) {
      // 입력은 호출 순간 복사한다. 이미지 선택이나 입력칸 변경으로 요청이 바뀌지 않는다.
      const input = JSON.parse(JSON.stringify(args || {}));
      return enqueue(async (auth) => {
        const copy = JSON.parse(JSON.stringify(store.state));
        const result = HB.ops[op](copy, input, HB.me(), Date.now());
        let data;
        try { data = parse(await call('api', op, input, auth)); }
        catch (e) {
          // 요청이 저장됐지만 응답만 끊겼을 수도 있으므로 자동으로 다시 쓰지 않는다.
          try { store.take(await call('getState', auth)); } catch (ignored) {}
          throw new Error('저장 결과를 확인하지 못했어요. 입력은 남겨 두었어요. 목록을 확인한 뒤 다시 시도해 주세요.');
        }
        store.take(data);
        if (data.error) throw new Error(data.error);
        return result;
      });
    },
    image(id) { return call('getImage', id).then((src) => src || Promise.reject(new Error('그림을 받지 못했어요.'))); },
    forget() {
      token = ''; epoch++; store.meId = null;
      if (HB.view && HB.view.adm) Object.assign(HB.view.adm, { people: null, edit: null, showCodes: false });
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    },
    subscribe(fn) { listeners.push(fn); },
  };
  HB.me = () => store.state && store.meId ? store.state.people.find((p) => p.id === store.meId) || null : null;
  HB.setMe = () => {};
  HB.login = async (email, code) => {
    if (store.pending) throw new Error('저장이 끝난 뒤 로그인해 주세요.');
    const res = parse(await call('login', String(email || '').trim(), String(code || '').trim()));
    if (res.error) throw new Error(res.error);
    token = res.token; epoch++;
    try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
    store.take(await call('getState', token));
  };
  const adminCall = (action, args) => enqueue(async (auth) => {
    const d = parse(await call('admin', action, args || {}, auth));
    store.take(d);
    if (d.error) throw new Error(d.error);
    return { people: d.people || [], note: d.note || '', sheetUrl: d.sheetUrl || '' };
  });
  HB.admin = {
    people: () => adminCall('people'),
    savePerson: (person) => adminCall('savePerson', { person }),
    newCode: (id) => adminCall('newCode', { id }),
    makeCodes: () => adminCall('makeCodes'),
    mailCodes: () => adminCall('mailCodes'),
    removePerson: (id) => adminCall('removePerson', { id }),
    setReadonly: (on) => adminCall('setReadonly', { on: !!on }),
    sample: (mode) => adminCall('sample', { mode }),
  };
  HB.logout = () => {
    if (store.pending) { HB.util.toast('저장이 끝난 뒤 로그아웃해 주세요.'); return; }
    store.forget(); notify();
  };
  HB.store = store;
})();
