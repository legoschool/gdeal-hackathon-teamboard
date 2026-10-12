/* 미리 보기 서버. gas/Code.js를 가짜 시트 위에서 그대로 돌린다.
   처음에 예시 데이터를 넣고, 확인용 네 사람에게 이메일과 참여 코드를 준다(진짜 시트에는 넣지 않는다). */
importScripts('services.js', 'Code.js');

seedSample_('after');
(function giveCodes() {
  const codes = {
    p01: ['p01@example.com', '111111'],   // 장하린, 자리 바꾸는 날 팀
    p37: ['p37@example.com', '222222'],   // 우소희, 독서 스탬프 팀
    f01: ['f01@example.com', '333333'],   // 류지훈, 퍼실
    s01: ['staff@example.com', '999999'], // 운영진
  };
  const t = readTable_('people');
  t.rows.forEach((r) => {
    if (!codes[r.id]) return;
    r.email = codes[r.id][0];
    r.code = codes[r.id][1];
    t.sh.getRange(r._row, 1, 1, t.width).setValues([lineOf_(t, r, r._line)]);
  });
  bump_();
})();

const PUBLIC = ['boot', 'getState', 'poll', 'login', 'api', 'getImage', 'admin'];
onmessage = (e) => {
  const { id, fn, args } = e.data;
  try {
    if (PUBLIC.indexOf(fn) < 0) throw new Error('화면에서 부를 수 없는 함수: ' + fn);
    const value = self[fn].apply(null, args);
    postMessage({ id, ok: true, value: value === undefined ? null : value });
  } catch (err) {
    postMessage({ id, ok: false, error: String((err && err.stack) || err) });
  }
};
