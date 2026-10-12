/* 미리 보기 화면 쪽. google.script.run을 흉내 내서 worker.js의 서버 함수를 부른다.
   진짜처럼 응답이 조금 늦게 오도록 250ms를 기다린다. */
(function () {
  const worker = new Worker('worker.js');
  const waiting = {};
  let seq = 0;
  worker.onmessage = (e) => {
    const w = waiting[e.data.id];
    delete waiting[e.data.id];
    setTimeout(() => {
      if (e.data.ok) { if (w.ok) w.ok(e.data.value); }
      else { console.error(e.data.error); if (w.fail) w.fail(new Error(e.data.error)); }
    }, 250);
  };
  function runner(ok, fail) {
    return new Proxy({}, {
      get(_, name) {
        if (name === 'withSuccessHandler') return (f) => runner(f, fail);
        if (name === 'withFailureHandler') return (f) => runner(ok, f);
        return (...args) => {
          const id = ++seq;
          waiting[id] = { ok, fail };
          worker.postMessage({ id, fn: name, args });
        };
      },
    });
  }
  window.google = {
    script: {
      run: runner(null, null),
      url: { getLocation: (cb) => cb({ hash: location.hash.replace(/^#/, ''), parameter: {}, parameters: {} }) },
      history: { replace() {}, push() {}, setChangeHandler() {} },
    },
  };
})();
