/* 데이터 보관(초안). 브라우저 저장소(localStorage)에 두고, 같은 브라우저의 다른 탭에 바뀐 것을 알린다.
   앱스 스크립트판은 이 파일 대신 js/store-gas.js를 쓴다. 두 파일은 같은 이름의 함수를 내놓는다. */
(function () {
  HB.mode = 'local';
  const KEY = HB.config.storageKey;
  const listeners = [];

  const store = {
    state: null,

    init() {
      let s = null;
      try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
      // 처음 열면 '이후' 시점 예시(아카이브까지 다 찬 상태)로 시작한다
      store.state = (s && s.version === 1) ? s : HB.sample.build('after');
      store.save(true);
      window.addEventListener('storage', (e) => {
        if (e.key !== KEY || !e.newValue) return;
        try { store.state = JSON.parse(e.newValue); } catch (err) { return; }
        listeners.forEach((fn) => fn());
      });
    },

    // js/ops.js의 규칙대로 고치고 저장한 뒤 화면을 다시 그린다. 규칙에 걸리면 고치기 전에 오류를 던진다
    commit(op, args) {
      const result = HB.ops[op](store.state, args, HB.me(), HB.util.now());
      store.save();
      listeners.forEach((f) => f());
      return result;
    },

    save(quiet) {
      try {
        localStorage.setItem(KEY, JSON.stringify(store.state));
      } catch (e) {
        if (!quiet) HB.util.toast('브라우저 저장 공간이 찼어요. 그림을 줄이거나 예시 데이터를 처음으로 돌려 주세요.');
      }
    },

    reset(snapKey) {
      store.state = HB.sample.build(snapKey);
      store.save();
      listeners.forEach((f) => f());
    },

    subscribe(fn) { listeners.push(fn); },

    // 초안은 그림을 data URL로 바로 넣으므로 따로 받아 올 그림이 없다
    image() { return Promise.reject(new Error('초안에는 서버 그림이 없어요.')); },
  };

  // 지금 화면을 보는 사람. 초안은 초안 도구에서 고른다(처음엔 p01 장하린)
  let meId = null;
  HB.me = function () {
    if (meId === null) {
      try { meId = localStorage.getItem(HB.config.meKey); } catch (e) { meId = null; }
      if (meId === null) meId = 'p01';
    }
    return meId === 'guest' ? null : (store.state.people.find((p) => p.id === meId) || null);
  };
  HB.setMe = function (id) {
    meId = id || 'guest';
    try { localStorage.setItem(HB.config.meKey, meId); } catch (e) { /* 저장 못 해도 이번 화면에는 반영 */ }
    listeners.forEach((f) => f());
  };

  /* 운영진 화면(초안판). 앱스 스크립트판은 같은 이름의 함수를 서버 admin()으로 부른다(js/store-gas.js).
     초안판은 이메일과 코드를 이 브라우저 안에만 둔다. 메일은 보내지 않는다 */
  const secretPeople = () => store.state.people.map((p) => Object.assign({ email: '', code: '', mailedAt: null }, p));
  const done = (note) => {
    store.save();
    listeners.forEach((f) => f());
    return Promise.resolve({ people: secretPeople(), note: note || '', sheetUrl: '' });
  };
  const staff = () => {
    const me = HB.me();
    if (!me || me.role !== 'staff') HB.opError('운영진만 할 수 있어요.');
    return me;
  };
  const freshCode = () => {
    const used = {};
    store.state.people.forEach((p) => { if (p.code) used[p.code] = true; });
    let c;
    do { c = String(100000 + Math.floor(Math.random() * 900000)); } while (used[c]);
    return c;
  };
  const wrap = (fn) => (...a) => { try { return fn(...a); } catch (e) { return Promise.reject(e); } };
  const person = (id) => store.state.people.find((p) => p.id === id) || HB.opError('없는 사람이에요.');

  HB.admin = {
    people: wrap(() => { staff(); return done(); }),
    savePerson: wrap((input) => {
      const me = staff();
      const s = store.state;
      const p = HB.checkPerson(input, s.people, me);
      const old = p.id ? person(p.id) : null;
      if (old) {
        if (old.role !== p.role) HB.detachPerson(s, p.id, p.role);
        if ((old.email || '') !== p.email) old.mailedAt = null;
        Object.assign(old, p);
      } else {
        p.id = HB.util.uid('u');
        p.code = '';
        s.people.push(p);
      }
      return done();
    }),
    newCode: wrap((id) => {
      const me = staff();
      const p = person(id);
      if (p.id === me.id) HB.opError('내 코드는 시트에서 바꿔 주세요.');
      if (!p.email) HB.opError('이메일을 먼저 적어 주세요.');
      p.code = freshCode();
      p.mailedAt = null;
      return done(`${p.name} 선생님 코드를 새로 만들었어요.`);
    }),
    makeCodes: wrap(() => {
      staff();
      let n = 0;
      store.state.people.forEach((p) => { if (p.email && !p.code) { p.code = freshCode(); n++; } });
      return done(n ? `참여 코드 ${n}개를 만들었어요.` : '이메일이 있고 코드가 빈 사람이 없어요.');
    }),
    mailCodes: wrap(() => { staff(); return done('초안에서는 메일을 보내지 않아요.'); }),
    removePerson: wrap((id) => {
      const me = staff();
      const p = person(id);
      if (p.id === me.id) HB.opError('나는 지울 수 없어요.');
      HB.detachPerson(store.state, id, '');
      store.state.people = store.state.people.filter((x) => x.id !== id);
      return done(`${p.name} 선생님을 지웠어요. 쓴 글은 남아요.`);
    }),
    setReadonly: wrap((on) => {
      staff();
      store.state.settings = Object.assign({}, store.state.settings, { readonly: !!on });
      return done(on ? '글쓰기를 닫았어요. 운영진만 쓸 수 있어요.' : '글쓰기를 열었어요.');
    }),
    sample: wrap((mode) => {
      const me = staff();
      const s = store.state;
      if (mode === 'load') {
        const mine = s.people.filter((p) => p.email);
        store.state = HB.sample.build(s.snapshot || 'after');
        mine.forEach((p) => { if (!store.state.people.some((x) => x.id === p.id)) store.state.people.push(p); });
        return done('예시 데이터를 넣었어요. 직접 등록한 사람은 그대로예요.');
      }
      const ids = HB.sample.peopleIds();
      s.ideas = []; s.teams = []; s.logs = [];
      s.people = s.people.filter((p) => ids.indexOf(p.id) < 0 || p.email || p.id === me.id);
      return done('예시 데이터를 지웠어요. 이메일이 있는 사람은 남겼어요.');
    }),
  };

  HB.store = store;
})();
