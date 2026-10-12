/* ===== js/config.js ===== */
/* 행사 내용과 화면에 나오는 칸. 글자만 바꾸려면 이 파일만 고친다.
   고친 뒤에는 초안 도구의 '예시 데이터 처음으로'를 눌러야 저장된 예시에 반영된다.
   앱스 스크립트판은 서버도 이 파일을 쓴다(시트 열 이름이 여기 칸 이름에서 나온다). */
var HB = typeof HB !== 'undefined' ? HB : {};

HB.config = {
  event: {
    title: 'G-DEAL 교사 해커톤',
    host: '제3회 한마당',
    dateLabel: '',                   // 예: '12월 19일(토) 13:00~17:00'. 빈칸이면 화면에 날짜·시간과 D-day를 보이지 않는다
    place: '',                       // 빈칸이면 보이지 않는다
    day: '2026-12-19',               // 화면에는 안 보인다. 홈 '진행 단계'에서 지금 칸(사전·당일·이후)을 고르는 데만 쓴다
  },

  // 홈 화면 단계판. when이 빈칸이면 날짜 줄을 보이지 않는다
  phases: [
    { key: 'before', name: '사전', when: '', does: ['아이디어 모으기', '팀 만들기', '계획 공유'] },
    { key: 'day',    name: '당일', when: '', does: ['만들기', '과정 기록', '전체 발표'] },
    { key: 'after',  name: '이후', when: '', does: ['학교에 적용', '결과 공유회', '아카이브 공개'] },
  ],

  team: {
    maxTeams: 10,
    seats: 4,           // 참가자 자리. 퍼실 1명은 따로
    minToForm: 3,       // '팀 결성' 단계가 켜지는 참가자 수
    minLogs: 3,         // '과정 기록' 단계가 켜지는 기록 수
    quietDays: 3,       // 운영 화면에서 이 날수 넘게 기록이 없으면 빨갛게 표시
  },

  // 팀 펫. 그림은 assets/pets/아이디.png (몬스터 원정대 그림을 잘라 씀)
  pets: [
    { id: 'koalbot',   name: '코알봇',   color: '#3fb6dc' },
    { id: 'antro',     name: '앤트로',   color: '#f08a3c' },
    { id: 'monggeul',  name: '몽글이',   color: '#a58be6' },
    { id: 'digibugi',  name: '디기부기', color: '#3a88cb' },
    { id: 'pickling',  name: '피클링',   color: '#6cbf3f' },
    { id: 'droni',     name: '드로니',   color: '#e0a815' },
    { id: 'owllab',    name: '아울랩',   color: '#4f9a69' },
    { id: 'hongaengi', name: '홍앵이',   color: '#ee5d6c' },
    { id: 'maninyang', name: '매니냥',   color: '#d39a4a' },
    { id: 'h2o',       name: '또롱이',   color: '#35bccf' },
  ],

  // 팀 진행 단계. 조건 계산은 js/select.js의 teamSteps
  steps: [
    { key: 'formed', name: '팀 결성',      need: '참가자 3명' },
    { key: 'plan',   name: '계획 공유',    need: '계획 네 칸' },
    { key: 'log',    name: '과정 기록',    need: '기록 3개' },
    { key: 'intent', name: '제작 의도',    need: '의도 세 칸' },
    { key: 'work',   name: '작품 공유',    need: '이름·소개·링크' },
    { key: 'open',   name: '아카이브 공개', need: '공개 누르기' },
  ],

  // 과정 기록 종류
  logKinds: [
    { key: 'meet',  name: '회의',    color: '#3a88cb' },
    { key: 'make',  name: '만들기',  color: '#277849' },
    { key: 'stuck', name: '막힘',    color: '#e0533f' },
    { key: 'test',  name: '써 보기', color: '#8b6fd6' },
    { key: 'fix',   name: '고침',    color: '#c48a12' },
    { key: 'apply', name: '적용',    color: '#1d8a8a' },
  ],

  ideaFields: [
    { key: 'title',   label: '제목',              rows: 1, required: true, max: 40 },
    { key: 'problem', label: '학교에서 겪는 일',  rows: 3, required: true, hint: '언제, 누가, 무엇 때문에 불편한지' },
    { key: 'wish',    label: '이렇게 되면 좋겠다', rows: 2, required: true },
  ],

  planFields: [
    { key: 'problem',  label: '해결할 문제', rows: 3, hint: '학교에서 실제로 겪는 장면으로' },
    { key: 'users',    label: '쓰는 사람',   rows: 1, hint: '예: 6학년 담임 5명' },
    { key: 'solution', label: '만들 것',     rows: 3, hint: '화면 하나, 버튼 하나 수준으로' },
    { key: 'tools',    label: '쓸 도구',     rows: 1, hint: '예: 구글 시트, 앱스 스크립트' },
  ],

  intentFields: [
    { key: 'scene',  label: '시작된 장면', rows: 3, hint: '이 도구가 필요하다고 느낀 날 있었던 일' },
    { key: 'who',    label: '누가 쓰나',   rows: 2, hint: '누가, 언제, 어디서' },
    { key: 'change', label: '바라는 변화', rows: 3, hint: '쓰기 전과 뒤에 달라지는 것. 숫자가 있으면 숫자로' },
  ],

  workFields: [
    { key: 'title',   label: '작품 이름',       rows: 1, required: true, max: 30 },
    { key: 'oneline', label: '한 줄 소개',      rows: 1, required: true, max: 60 },
    { key: 'link',    label: '작품 링크',       rows: 1, required: true, type: 'url' },
    { key: 'source',  label: '코드·자료 링크',  rows: 1, type: 'url' },
    { key: 'howto',   label: '사용법',          rows: 4, hint: '한 줄에 한 단계' },
  ],

  schoolLevels: ['초등', '중등', '고등', '특수'],
  tags: ['수업', '평가', '학급 운영', '업무', '소통', '안전'],

  nav: [
    { route: 'home',    name: '홈' },
    { route: 'ideas',   name: '아이디어' },
    { route: 'teams',   name: '팀' },
    { route: 'feed',    name: '과정' },
    { route: 'archive', name: '아카이브' },
    { route: 'guide',   name: '사용법' },
    { route: 'admin',   name: '운영', staff: true },   // 운영진에게만 보인다
  ],

  // 초안 도구의 시점. 예시 데이터를 이 시각까지 있었던 일로 자른다
  snapshots: [
    { key: 'before', name: '사전 (11월 20일)', at: '2026-11-20T18:00' },
    { key: 'day',    name: '당일 (12월 19일)', at: '2026-12-19T16:30' },
    { key: 'after',  name: '이후 (12월 30일)', at: '2026-12-30T10:00' },
  ],

  storageKey: 'gdeal-hackathon-board-v1',
  meKey: 'gdeal-hackathon-board-me',
};


/* ===== js/ops.js ===== */
/* 쓰기 규칙. 브라우저(초안·운영판 화면)와 앱스 스크립트 서버가 이 파일 하나를 같이 쓴다.
   HB.ops.이름(state, args, me, now)는 먼저 모두 검사하고, 통과하면 state를 고친다.
   검사에 걸리면 고치기 전에 HB.opError(문구)를 던진다. 화면은 그 문구를 알림으로 띄우고,
   서버는 그 문구를 돌려준다. 그래서 같은 규칙이 두 곳에서 다르게 돌 일이 없다. */
var HB = typeof HB !== 'undefined' ? HB : {};

(function () {
  const C = HB.config;
  const O = {};

  const fail = (msg) => { const e = new Error(msg); e.isOp = true; throw e; };
  HB.opError = fail;

  const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  const isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s || '').trim());
  const okId = (id) => /^[a-z][a-z0-9]{3,30}$/.test(String(id || ''));
  const find = (list, id) => list.find((x) => x.id === id) || null;

  const teamOf = (s, pid) => s.teams.find((t) => t.members.indexOf(pid) >= 0 || t.facil === pid) || null;
  const canEdit = (team, me) => !!(me && team && (team.members.indexOf(me.id) >= 0 || team.facil === me.id || me.role === 'staff'));
  const filledAll = (obj, fields) => fields.every((f) => String((obj || {})[f.key] || '').trim());
  const publishReady = (t) => filledAll(t.work, C.workFields.filter((f) => f.required)) && filledAll(t.intent, C.intentFields);

  // 모든 쓰기 앞에서 하는 검사
  function base(s, me) {
    if (!me) fail('참여한 사람만 쓸 수 있어요.');
    if (s.settings && s.settings.readonly && me.role !== 'staff') fail('지금은 운영진이 글쓰기를 닫아 두었어요.');
  }
  function newId(list, id) {
    if (!okId(id) || find(list, id)) fail('잠시 뒤 다시 눌러 주세요.');
    return id;
  }
  function editableTeam(s, me, teamId) {
    const t = find(s.teams, teamId);
    if (!t) fail('없는 팀이에요.');
    if (!canEdit(t, me)) fail('이 팀 사람만 고칠 수 있어요.');
    return t;
  }
  const toggle = (arr, id) => { const k = arr.indexOf(id); if (k >= 0) arr.splice(k, 1); else arr.push(id); };

  /* ---------- 아이디어 ---------- */
  O.addIdea = (s, a, me, now) => {
    base(s, me);
    const title = str(a.title, 40), problem = str(a.problem, 1000), wish = str(a.wish, 600);
    if (!title || !problem || !wish) fail('제목, 겪는 일, 바라는 것을 모두 적어 주세요.');
    const id = newId(s.ideas, a.id);
    const level = C.schoolLevels.indexOf(a.level) >= 0 ? a.level : (me.level || C.schoolLevels[0]);
    const tags = [].concat(a.tags || []).filter((t) => C.tags.indexOf(t) >= 0);
    s.ideas.push({ id, by: me.id, at: now, level, tags, title, problem, wish, likes: [], comments: [] });
    return id;
  };

  O.toggleLike = (s, a, me) => {
    base(s, me);
    const i = find(s.ideas, a.ideaId);
    if (!i) fail('없는 아이디어예요.');
    toggle(i.likes, me.id);
  };

  O.commentIdea = (s, a, me, now) => {
    base(s, me);
    const i = find(s.ideas, a.ideaId);
    const text = str(a.text, 300);
    if (!i) fail('없는 아이디어예요.');
    if (!text) fail('댓글을 적어 주세요.');
    if (!okId(a.id) || i.comments.some((c) => c.id === a.id)) fail('잠시 뒤 다시 눌러 주세요.');
    i.comments.push({ id: a.id, by: me.id, at: now, text });
  };

  /* ---------- 팀 ---------- */
  O.createTeam = (s, a, me, now) => {
    base(s, me);
    if (me.role !== 'participant') fail('팀은 참가자가 만들어요.');
    if (teamOf(s, me.id)) fail('이미 팀이 있어요.');
    if (s.teams.length >= C.team.maxTeams) fail(`팀은 ${C.team.maxTeams}개까지예요.`);
    const name = str(a.name, 16);
    if (!name) fail('팀 이름을 적어 주세요.');
    if (!C.pets.some((p) => p.id === a.pet) || s.teams.some((t) => t.pet === a.pet)) fail('다른 팀이 고르지 않은 펫을 골라 주세요.');
    const idea = a.ideaId ? find(s.ideas, a.ideaId) : null;
    const id = newId(s.teams, a.id);
    const facil = s.people.find((p) => p.role === 'facil' && !s.teams.some((t) => t.facil === p.id));
    s.teams.push({
      id, name, pet: a.pet, ideaId: idea ? idea.id : '', facil: facil ? facil.id : '',
      level: idea ? idea.level : (me.level || ''), tags: idea ? idea.tags.slice() : [],
      createdAt: now, members: [me.id],
      plan: {}, roles: {}, steps: [], intent: {}, work: {}, published: false, publishedAt: null, notes: [],
    });
    return id;
  };

  O.joinTeam = (s, a, me) => {
    base(s, me);
    const t = find(s.teams, a.teamId);
    if (me.role !== 'participant') fail('퍼실은 운영진이 팀을 정해요.');
    if (teamOf(s, me.id)) fail('이미 팀이 있어요. 먼저 지금 팀에서 나와 주세요.');
    if (!t || t.members.length >= C.team.seats) fail('빈자리가 없어요.');
    t.members.push(me.id);
  };

  O.leaveTeam = (s, a, me) => {
    base(s, me);
    const t = find(s.teams, a.teamId);
    if (!t || t.members.indexOf(me.id) < 0) fail('이 팀 참가자가 아니에요.');
    t.members = t.members.filter((m) => m !== me.id);
    delete t.roles[me.id];
    // 참가자가 아무도 없고 기록도 없으면 팀을 지운다
    if (!t.members.length && !s.logs.some((l) => l.team === t.id) &&
        !t.published && !t.notes.length && !t.steps.length &&
        ![t.plan, t.intent, t.work].some((obj) => Object.values(obj || {}).some(Boolean))) s.teams = s.teams.filter((x) => x.id !== t.id);
  };

  O.takeIdea = (s, a, me) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    const idea = find(s.ideas, a.ideaId);
    if (!idea) fail('없는 아이디어예요.');
    t.ideaId = idea.id;
    t.tags = idea.tags.slice();
    t.level = idea.level;
  };

  /* ---------- 계획·의도·작품 ---------- */
  O.savePlan = (s, a, me) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    const plan = a.plan || {}, roles = a.roles || {};
    C.planFields.forEach((f) => { t.plan[f.key] = str(plan[f.key], 1000); });
    t.members.forEach((m) => { t.roles[m] = str(roles[m], 20); });
  };

  O.addStep = (s, a, me) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    const text = str(a.text, 30);
    if (!text) fail('할 일을 적어 주세요.');
    if (!okId(a.id) || t.steps.some((x) => x.id === a.id)) fail('잠시 뒤 다시 눌러 주세요.');
    if (t.steps.length >= 20) fail('일정은 20개까지예요.');
    t.steps.push({ id: a.id, text, due: str(a.due, 10), done: false });
  };

  O.toggleStep = (s, a, me) => {
    base(s, me);
    const st = editableTeam(s, me, a.teamId).steps.find((x) => x.id === a.stepId);
    if (!st) fail('없는 일정이에요.');
    st.done = !st.done;
  };

  O.removeStep = (s, a, me) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    t.steps = t.steps.filter((x) => x.id !== a.stepId);
  };

  O.saveIntent = (s, a, me) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    const d = a.intent || {};
    C.intentFields.forEach((f) => { t.intent[f.key] = str(d[f.key], 1000); });
    if (t.published && !publishReady(t)) { t.published = false; t.publishedAt = null; }
  };

  // cover: undefined면 그대로, ''면 빼기, 'data:image/...'면 새 그림
  O.saveWork = (s, a, me) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    const d = a.work || {};
    const bad = C.workFields.find((f) => f.type === 'url' && d[f.key] && !isUrl(d[f.key]));
    if (bad) fail(`${bad.label} 칸은 https://로 시작하는 주소로 적어 주세요.`);
    if (a.cover !== undefined && a.cover !== '' && !/^data:image\/(jpeg|png|webp);base64,/.test(a.cover) && !/^img:/.test(a.cover)) fail('그림을 다시 골라 주세요.');
    C.workFields.forEach((f) => { t.work[f.key] = str(d[f.key], f.rows > 1 ? 1000 : 300); });
    if (a.cover !== undefined) t.work.cover = a.cover;
    if (t.published && !publishReady(t)) { t.published = false; t.publishedAt = null; }
  };

  O.setPublished = (s, a, me, now) => {
    base(s, me);
    const t = editableTeam(s, me, a.teamId);
    if (a.on && !publishReady(t)) fail('작품 이름·소개·링크와 제작 의도 세 칸을 먼저 채워 주세요.');
    t.published = !!a.on;
    t.publishedAt = a.on ? now : null;
  };

  /* ---------- 과정 기록 ---------- */
  O.addLog = (s, a, me, now) => {
    base(s, me);
    editableTeam(s, me, a.teamId);
    const text = str(a.text, 800), link = str(a.link, 300);
    if (!text) fail('무슨 일이 있었는지 적어 주세요.');
    if (link && !isUrl(link)) fail('링크는 https://로 시작하는 주소로 적어 주세요.');
    if (a.image && !/^data:image\/(jpeg|png|webp);base64,/.test(a.image)) fail('그림을 다시 골라 주세요.');
    const kind = C.logKinds.some((k) => k.key === a.kind) ? a.kind : 'make';
    const id = newId(s.logs, a.id);
    s.logs.push({ id, team: a.teamId, by: me.id, at: now, kind, text, link, image: a.image || '', cheers: [], comments: [] });
    return id;
  };

  O.removeLog = (s, a, me) => {
    base(s, me);
    const log = find(s.logs, a.logId);
    if (!log || (log.by !== me.id && me.role !== 'staff')) fail('쓴 사람만 지울 수 있어요.');
    s.logs = s.logs.filter((l) => l.id !== a.logId);
  };

  O.toggleCheer = (s, a, me) => {
    base(s, me);
    const l = find(s.logs, a.logId);
    if (!l) fail('없는 기록이에요.');
    toggle(l.cheers, me.id);
  };

  O.commentLog = (s, a, me, now) => {
    base(s, me);
    const l = find(s.logs, a.logId);
    const text = str(a.text, 300);
    if (!l) fail('없는 기록이에요.');
    if (!text) fail('댓글을 적어 주세요.');
    if (!okId(a.id) || l.comments.some((c) => c.id === a.id)) fail('잠시 뒤 다시 눌러 주세요.');
    l.comments.push({ id: a.id, by: me.id, at: now, text });
  };

  /* ---------- 다른 팀 의견 ---------- */
  O.addNote = (s, a, me, now) => {
    base(s, me);
    const t = find(s.teams, a.teamId);
    const text = str(a.text, 300);
    if (!t) fail('없는 팀이에요.');
    if (!text) fail('의견을 적어 주세요.');
    if (!okId(a.id) || t.notes.some((n) => n.id === a.id)) fail('잠시 뒤 다시 눌러 주세요.');
    t.notes.push({ id: a.id, by: me.id, at: now, text });
  };

  /* ---------- 운영진 ---------- */
  const staffOnly = (me) => { if (!me || me.role !== 'staff') fail('운영진만 할 수 있어요.'); };

  // 참가자를 다른 팀으로 옮기거나(teamId) 팀에서 뺀다(teamId 빈칸). 자리 수는 운영진이 넘길 수 있다
  O.adminMove = (s, a, me) => {
    staffOnly(me);
    const p = s.people.find((x) => x.id === a.pid);
    if (!p || p.role !== 'participant') fail('참가자를 골라 주세요.');
    const target = a.teamId ? find(s.teams, a.teamId) : null;
    if (a.teamId && !target) fail('없는 팀이에요.');
    s.teams.forEach((t) => {
      if (t.members.indexOf(p.id) >= 0) { t.members = t.members.filter((m) => m !== p.id); delete t.roles[p.id]; }
    });
    if (target) target.members.push(p.id);
  };

  O.adminSetFacil = (s, a, me) => {
    staffOnly(me);
    const t = find(s.teams, a.teamId);
    if (!t) fail('없는 팀이에요.');
    if (a.pid) {
      const p = s.people.find((x) => x.id === a.pid);
      if (!p || p.role !== 'facil') fail('퍼실을 골라 주세요.');
      s.teams.forEach((x) => { if (x.facil === a.pid) x.facil = ''; });
    }
    t.facil = a.pid || '';
  };

  O.adminEditTeam = (s, a, me) => {
    staffOnly(me);
    const t = find(s.teams, a.teamId);
    const name = str(a.name, 16);
    if (!t) fail('없는 팀이에요.');
    if (!name) fail('팀 이름을 적어 주세요.');
    if (!C.pets.some((p) => p.id === a.pet) || s.teams.some((x) => x.id !== t.id && x.pet === a.pet)) fail('다른 팀이 고르지 않은 펫을 골라 주세요.');
    t.name = name;
    t.pet = a.pet;
  };

  // 팀과 그 팀 기록을 함께 지운다
  O.adminRemoveTeam = (s, a, me) => {
    staffOnly(me);
    if (!find(s.teams, a.teamId)) fail('없는 팀이에요.');
    s.teams = s.teams.filter((t) => t.id !== a.teamId);
    s.logs = s.logs.filter((l) => l.team !== a.teamId);
  };

  // kind: idea | log | comment | note
  O.adminRemove = (s, a, me) => {
    staffOnly(me);
    if (a.kind === 'idea') {
      s.ideas = s.ideas.filter((i) => i.id !== a.id);
      s.teams.forEach((t) => { if (t.ideaId === a.id) t.ideaId = ''; });
    } else if (a.kind === 'log') {
      s.logs = s.logs.filter((l) => l.id !== a.id);
    } else if (a.kind === 'comment') {
      s.ideas.concat(s.logs).forEach((x) => { x.comments = x.comments.filter((c) => c.id !== a.id); });
    } else if (a.kind === 'note') {
      s.teams.forEach((t) => { t.notes = t.notes.filter((n) => n.id !== a.id); });
    } else fail('알 수 없는 글이에요.');
  };

  // 운영진 화면의 사람 칸 검사. 초안과 서버가 같이 쓴다
  HB.checkPerson = (p, people, me) => {
    const name = str(p.name, 20);
    if (!name) fail('이름을 적어 주세요.');
    const role = ['participant', 'facil', 'staff'].indexOf(p.role) >= 0 ? p.role : 'participant';
    const email = str(p.email, 100).toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('이메일 모양을 확인해 주세요.');
    if (email && people.some((x) => x.id !== p.id && String(x.email || '').trim().toLowerCase() === email)) fail('같은 이메일이 이미 있어요.');
    if (p.id && me && p.id === me.id && role !== 'staff') fail('내 역할은 바꿀 수 없어요.');
    return {
      id: p.id || '', name, school: str(p.school, 30),
      level: C.schoolLevels.indexOf(p.level) >= 0 ? p.level : C.schoolLevels[0],
      job: str(p.job, 20), avatar: /^a(0[1-9]|1\d|20)$/.test(p.avatar) ? p.avatar : 'a01', role, email,
    };
  };

  // 역할이 바뀌거나 사람을 지울 때 팀에서 정리한다. role: 새 역할(지울 때는 빈칸)
  HB.detachPerson = (s, pid, role) => {
    s.teams.forEach((t) => {
      if (role !== 'participant' && t.members.indexOf(pid) >= 0) { t.members = t.members.filter((m) => m !== pid); delete t.roles[pid]; }
      if (role !== 'facil' && t.facil === pid) t.facil = '';
    });
  };

  HB.ops = O;
})();


/* ===== js/sample-data.js ===== */
/* 예시 데이터. 사람과 학교는 지어낸 것이다.
   모든 글에 날짜가 있어서, 초안 도구에서 고른 시점까지 있었던 일만 남긴다(build 함수).
   앱스 스크립트판에서는 서버만 이 파일을 쓴다(운영 화면의 '예시 넣기'). */
var HB = typeof HB !== 'undefined' ? HB : {};
(function () {
  const T = (md) => Date.parse('2026-' + md.replace(' ', 'T'));   // '11-10 19:20' → 2026-11-10 19:20

  // 아이디|이름|학교|학교급|맡은 일|아바타
  const PEOPLE = `
p01|장하린|가람초|초등|5학년 담임|a03
p02|김도윤|가람초|초등|6학년 담임|a05
p03|이서아|늘봄초|초등|4학년 담임|a08
p04|박준호|늘봄초|초등|5학년 담임|a04
p05|최유나|한빛중|중등|국어|a01
p06|정민재|한빛중|중등|수학|a02
p07|강지우|다온중|중등|과학|a09
p08|조은솔|누리중|중등|영어|a10
p09|윤태경|새봄초|특수|특수학급|a06
p10|임수빈|솔내중|특수|특수학급|a11
p11|한가을|이음학교|특수|특수학교|a12
p12|오재민|새봄초|초등|2학년 담임|a07
p13|서다은|하늘초|초등|교무|a14
p14|신우진|하늘초|초등|3학년 담임|a13
p15|권나연|별빛초|초등|1학년 담임|a17
p16|황보람|별빛초|초등|6학년 담임|a15
p17|안시후|솔내고|고등|사회|a16
p18|송예린|바다중|중등|국어|a18
p19|전하준|솔내고|고등|정보|a19
p20|홍채원|다온중|중등|도덕|a03
p21|고은비|누리중|중등|과학|a01
p22|문지호|한빛중|중등|과학|a04
p23|양서윤|바다중|중등|과학|a08
p24|손하율|누리중|중등|기술·가정|a05
p25|배지안|푸른숲초|초등|4학년 부장|a12
p26|백승현|푸른숲초|초등|4학년 담임|a02
p27|허윤아|푸른숲초|초등|4학년 담임|a10
p28|유건우|푸른숲초|초등|교무부장|a16
p29|남궁별|가람초|초등|2학년 담임|a18
p30|심도현|가람초|초등|1학년 담임|a13
p31|노하은|늘봄초|초등|3학년 담임|a17
p32|정수아|늘봄초|초등|영어 전담|a14
p33|곽태민|하늘초|초등|5학년 담임|a07
p34|성나래|다온중|중등|1학년 담임|a09
p35|차민서|별빛초|초등|상담|a11
p36|주원재|하늘초|초등|6학년 담임|a15
p37|우소희|새봄초|초등|3학년 담임|a06
p38|구현우|새봄초|초등|4학년 담임|a19
p39|민채윤|별빛초|초등|5학년 담임|a20
p40|진서준|별빛초|초등|6학년 담임|a04
f01|류지훈|코알교|초등|퍼실|a05
f02|나윤서|코알교|중등|퍼실|a01
f03|탁성민|코알교|특수|퍼실|a07
f04|변다인|코알교|초등|퍼실|a03
f05|왕보현|코알교|고등|퍼실|a16
f06|길예준|코알교|중등|퍼실|a13
f07|마수정|코알교|초등|퍼실|a12
f08|위재원|코알교|초등|퍼실|a02
f09|표하늘|코알교|초등|퍼실|a10
f10|염지성|코알교|초등|퍼실|a09
s01|운영진|G-DEAL|초등|운영|a20`;

  // 아이디어: [아이디, 올린 사람, 날짜, 학교급, 태그, 제목, 학교에서 겪는 일, 이렇게 되면 좋겠다, 공감 수, 댓글]
  const IDEAS = [
    ['i01', 'p01', '10-21 21:10', '초등', ['학급 운영'], '자리 바꾸기 조건 넣기',
      '한 달에 한 번 자리를 바꾸는데 시력, 지난달 짝, 따로 앉혀야 하는 학생까지 따지면 30분이 넘게 걸린다. 뽑기로 하면 같은 짝이 또 나와서 다시 뽑는다.',
      '조건을 체크하고 버튼을 누르면 자리표가 나오고, 칠판 화면에 바로 띄우면 좋겠다.', 14,
      [['p12', '10-23 08:40', '저희 반도 매달 똑같아요. 지난 짝은 3번까지만 피해도 충분할 것 같아요.'],
       ['f01', '10-25 20:15', '조건 개수를 먼저 정해 두면 만들기가 훨씬 쉬워요.']]],
    ['i02', 'p05', '10-22 19:30', '중등', ['평가'], '수행평가 날짜 겹침 미리 보기',
      '2학년 수행평가가 11월 둘째 주에 다섯 과목 몰렸다. 교과마다 따로 정해서 학생 말을 듣고서야 알았다.',
      '학년 교사가 각자 날짜를 넣으면 한 주에 몇 과목이 몰렸는지 바로 보였으면 한다.', 11,
      [['p17', '10-24 22:05', '고등학교는 더 심해요. 지필평가 직전 2주에 몰려요.']]],
    ['i03', 'p09', '10-23 17:45', '특수', ['수업', '학급 운영'], '그림으로 보는 하루 일과',
      '특수학급 학생 중 글을 읽기 어려운 학생이 다음 시간에 뭘 하는지 몰라 불안해한다. 매일 아침 그림 카드를 손으로 붙인다.',
      '시간표를 넣으면 그림 일과표가 만들어지고, 지금 하는 활동이 크게 보였으면 좋겠다.', 9,
      [['p15', '10-26 07:50', '통합학급 시간도 같이 보이면 좋겠어요.']]],
    ['i04', 'p13', '10-24 16:20', '초등', ['업무'], '교외체험학습 서류 챙기기',
      '교외체험학습 신청서와 보고서를 반마다 종이로 받는데, 보고서를 안 낸 학생을 찾으려면 학기 말에 서랍을 다 뒤진다.',
      '누가 신청했고 누가 보고서를 냈는지 한 표로 보였으면 좋겠다.', 7, []],
    ['i05', 'p19', '10-25 20:40', '고등', ['수업'], '수업 중 이름 없이 질문하기',
      '수업 끝에 "질문 있나요?" 하면 아무도 손을 안 든다. 끝나고 복도에서 따로 묻는 학생이 있다.',
      '자리에서 휴대폰으로 질문을 올리고, 같은 질문에 "나도"를 누를 수 있으면 좋겠다.', 16,
      [['p20', '10-27 21:30', '이름이 없으면 장난 글은 어떻게 막을지 궁금해요.'],
       ['p19', '10-28 07:15', '교사가 바로 숨길 수 있는 버튼을 생각하고 있어요.']]],
    ['i06', 'p21', '10-27 18:10', '중등', ['수업', '안전'], '과학실 시약 남은 양 확인',
      '실험 전날 시약장을 열어 보면 묽은 염산이 거의 없다. 누가 언제 썼는지 적은 종이가 없다.',
      '시약병에 QR을 붙여 쓸 때마다 찍으면 남은 양이 기록되면 좋겠다.', 6, []],
    ['i07', 'p25', '10-28 19:55', '초등', ['업무', '소통'], '학년 협의 내용 정리',
      '학년 협의회 메모를 각자 적다 보니 "그래서 누가 하기로 했지?"를 다음 주에 다시 묻는다.',
      '메모를 붙여 넣으면 정한 것, 할 일, 담당이 표로 나왔으면 좋겠다.', 10, []],
    ['i08', 'p30', '10-29 21:00', '초등', ['소통', '업무'], '주간 학습 안내 만들기',
      '금요일마다 주간 학습 안내를 만드는데 시간표, 준비물, 행사를 파일 세 개에서 옮겨 적는다. 한 시간 걸린다.',
      '시간표와 준비물을 한 번 넣어 두면 가정 안내문 모양으로 나왔으면 좋겠다.', 12, []],
    ['i09', 'p35', '10-30 20:25', '초등', ['소통'], '학부모 상담 시간 잡기',
      '학부모 상담 주간에 시간 조율 문자를 반마다 30통 넘게 주고받는다. 같은 시간에 두 가정이 오기도 한다.',
      '교사가 빈 시간을 열어 두면 보호자가 골라 가고, 겹치지 않았으면 한다.', 13,
      [['p31', '11-01 09:10', '저도 1학기에 문자 40통 넘게 보냈어요.']]],
    ['i10', 'p38', '11-02 20:50', '초등', ['수업', '학급 운영'], '학급 독서 기록',
      '독서 기록장을 학기 말에 걷어 보면 쓰다 만 학생이 절반이다. 중간에 확인하기 어렵다.',
      '책 제목과 한 줄을 남기면 스탬프가 찍히고, 반 전체가 몇 권 읽었는지 보였으면 한다.', 8, []],
    ['i11', 'p33', '11-01 18:35', '초등', ['업무'], '특별실 예약표',
      '과학실과 컴퓨터실 예약을 교무실 앞 종이에 적는데, 지운 칸 때문에 두 반이 같은 시간에 온 날이 있다.',
      '특별실 예약을 온라인으로 하고, 이미 찬 시간은 못 넣게 했으면 한다.', 5,
      [['p22', '11-03 07:40', '중학교 과학실도 같은 일이 있어요.']]],
    ['i12', 'p26', '11-04 21:15', '초등', ['학급 운영'], '학급 회의 안건 모으기',
      '학급 회의 시간에 안건이 없어 5분 만에 끝난다. 평소에 학생들이 말한 건 회의 날이 되면 잊어버린다.',
      '학생이 평소에 안건을 올려 두고 회의 날 모아 볼 수 있으면 좋겠다.', 4, []],
    ['i13', 'p17', '11-05 22:30', '고등', ['평가', '수업'], '모둠 활동에서 각자 한 일 남기기',
      '모둠 활동 뒤 누가 무엇을 했는지 물으면 학생들 말이 엇갈린다. 결과물만 보고는 알 수 없다.',
      '활동 중에 각자 한 일을 짧게 남기는 칸이 있으면 좋겠다.', 7, []],
    ['i14', 'p03', '11-06 19:05', '초등', ['안전'], '체험학습 버스 인원 확인',
      '현장체험학습 날 버스에 탈 때마다 인원을 세는데, 반마다 세는 방식이 달라 출발이 10분씩 늦는다.',
      '번호 카드를 찍으면 버스별 인원이 맞는지 바로 보였으면 한다.', 3,
      [['p04', '11-07 08:20', '저희는 반장이 세는데도 자주 틀려요.']]],
    ['i15', 'p24', '11-08 17:50', '중등', ['업무'], '기자재 대여 기록',
      '노트북 카트와 3D 프린터 대여를 구두로 해서, 누가 가져갔는지 찾느라 메신저를 돌린다.',
      '빌릴 때 QR을 찍으면 누가 언제 가져갔는지 남았으면 한다.', 2, []],
    ['i16', 'p37', '11-18 20:10', '초등', ['학급 운영'], '쉬는 시간 놀이 순서판',
      '쉬는 시간 공 놀이 순서 때문에 거의 매일 다툼이 생긴다. 순서를 기억하는 학생이 없다.',
      '요일별로 돌아가는 순서판을 교실 화면에 띄워 두면 좋겠다.', 6, []],
  ];

  /* 팀: 기록 [날짜, 쓴 사람, 종류, 글, 댓글[[사람, 날짜, 글]]]
         의견 [사람, 날짜, 글]
         일정 [할 일, 기한, 끝낸 날 또는 null] */
  const TEAMS = [
    {
      id: 't01', name: '자리 바꾸는 날', pet: 'koalbot', idea: 'i01', facil: 'f01', created: '11-03 20:00',
      members: [['p01', '11-03 20:00'], ['p02', '11-03 21:10'], ['p03', '11-04 19:30'], ['p04', '11-05 08:10']],
      planAt: '11-08 21:30',
      plan: {
        problem: '한 달에 한 번 자리를 바꿀 때 시력, 지난 짝, 따로 앉힐 학생 조건을 손으로 맞추느라 담임 한 명이 30분 넘게 쓴다.',
        users: '5·6학년 담임 4명(반마다 24~28명)',
        solution: '구글 시트에 학생 번호와 조건을 넣고 버튼을 누르면 지난 3번의 짝과 겹치지 않는 자리표를 만든다. 결과는 칠판 화면용 큰 표로 띄운다.',
        tools: '구글 시트, 앱스 스크립트',
      },
      roles: { p01: '자리 계산 코드', p02: '칠판 화면', p03: '조건 칸 정하기', p04: '반에서 써 보기' },
      steps: [['조건 칸 정하기', '11월 15일', '11-10 21:00'], ['자리 계산 만들기', '12월 5일', '11-24 22:00'], ['칠판 화면', '12월 19일', '12-19 15:20'], ['네 반에서 써 보기', '1월 9일', null]],
      logs: [
        ['11-10 21:00', 'p03', 'meet', '조건을 몇 개까지 넣을지 정했다. 시력(앞자리 필요), 지난 3번 짝 피하기, 따로 앉혀야 하는 학생, 이렇게 세 가지만 넣기로 했다. 키는 빼자는 의견이 많았다.', []],
        ['11-24 22:00', 'p01', 'make', '번호와 조건을 시트에 넣으면 자리를 섞는 함수를 만들었다. 1,000번 섞어서 조건을 다 맞춘 첫 배치를 고른다. 28명 기준 1초 안에 나온다.', []],
        ['12-02 20:40', 'p01', 'stuck', '따로 앉혀야 하는 학생이 세 쌍을 넘으면 조건을 다 맞추는 배치가 안 나올 때가 있다. 끝까지 못 찾으면 화면에 뭐라고 알려 줄지 모르겠다.',
          [['f01', '12-02 21:30', '"조건을 다 맞추는 자리가 없어요. 지난 짝 조건을 2번으로 줄여 볼까요?"처럼 어느 조건을 풀지 고르게 하면 어떨까요?'],
           ['p22', '12-03 07:50', '저희도 비슷한 걸 겪었어요. 실패 횟수를 세다가 멈추고 안내를 띄웠어요.']]],
        ['12-19 14:10', 'p02', 'make', '칠판 화면용 표를 만들었다. 교탁 쪽에서 보는 방향으로 위아래를 뒤집는 버튼을 넣었다.', []],
        ['12-19 15:20', 'p04', 'test', '다른 팀 선생님 3명이 자기 반 번호로 돌려 봤다. 짝 이름이 화면에 크게 나오는 게 부담스럽다는 의견이 있어 번호만 보이는 보기를 더했다.', []],
        ['12-23 09:20', 'p04', 'apply', '우리 반 26명으로 처음 썼다. 자리 정하는 데 5분 걸렸고, 같은 짝이 또 나왔다는 말은 없었다.', []],
      ],
      intentAt: '12-19 15:40',
      intent: {
        scene: '11월 자리 바꾸는 날, 뽑기로 정한 자리에 지난달 짝이 또 붙어서 세 번을 다시 뽑았다. 그사이 1교시가 15분 줄었다.',
        who: '자리를 바꾸는 날 아침, 담임이 교실 컴퓨터에서 연다. 학생 이름 대신 번호만 넣는다.',
        change: '자리 정하는 시간을 30분에서 5분으로 줄이고, 지난 3번 안에 같은 짝이 다시 나오지 않게 한다.',
      },
      workAt: '12-19 15:50',
      work: {
        title: '자리 바꾸기 도우미', oneline: '조건 세 가지를 맞춘 자리표를 버튼 한 번에 만들어 칠판에 띄운다',
        link: 'https://example.com/seat', source: 'https://example.com/seat-code',
        howto: '시트 사본을 만든다\n학생 번호와 앞자리 필요 여부를 적는다\n따로 앉힐 번호 쌍을 적는다\n\'자리 만들기\'를 누른다\n\'칠판 화면\'으로 띄운다',
      },
      publishedAt: '12-22 20:00',
      notes: [
        ['p28', '11-18 19:40', '조건을 세 가지로 줄인 게 좋네요. 키 조건을 뺀 이유가 궁금해요.'],
        ['p09', '12-19 16:05', '번호만 보이는 보기 좋아요. 특수학급 학생 자리를 담임이 미리 고정할 수 있으면 좋겠어요.'],
        ['f05', '12-19 16:10', '칠판 화면 뒤집기 버튼이 실제 교실을 생각한 기능이라 좋았어요.'],
      ],
    },
    {
      id: 't02', name: '수행평가 달력', pet: 'antro', idea: 'i02', facil: 'f02', created: '11-04 19:00',
      members: [['p05', '11-04 19:00'], ['p06', '11-04 19:20'], ['p07', '11-05 21:00'], ['p08', '11-06 18:30']],
      planAt: '11-09 22:00',
      plan: {
        problem: '교과마다 수행평가 날짜를 따로 정해서 한 주에 4~5과목이 몰려도 미리 알 수 없다.',
        users: '한 학년을 가르치는 교과 교사 8~10명',
        solution: '날짜·과목·반을 넣는 시트와, 주마다 몇 과목이 몰렸는지 색으로 보여 주는 달력 화면. 한 주에 3과목 이상이면 빨간색.',
        tools: '구글 시트, 앱스 스크립트, 구글 캘린더',
      },
      roles: { p05: '달력 화면', p06: '입력 시트', p07: '알림 규칙', p08: '학년 협의 안내' },
      steps: [['입력 칸 정하기', '11월 16일', '11-12 21:00'], ['달력 화면', '12월 10일', '12-08 22:30'], ['캘린더로 내보내기', '12월 19일', null], ['학년 협의 때 써 보기', '2월 말', null]],
      logs: [
        ['11-12 21:00', 'p08', 'meet', '반마다 날짜가 다를 때 어떻게 넣을지 이야기했다. 과목 단위로 넣되 반별 날짜를 따로 적을 수 있게 하기로 했다.', []],
        ['11-26 20:15', 'p06', 'make', '입력 시트를 만들었다. 과목, 반, 날짜, 평가 이름 네 칸이다. 드롭다운으로 과목 이름이 제각각 들어가는 걸 막았다.', []],
        ['12-08 22:30', 'p05', 'make', '주별 달력을 만들었다. 한 칸에 과목 수가 숫자로 뜨고 3 이상이면 빨갛게 바뀐다.', []],
        ['12-19 14:30', 'p07', 'stuck', '구글 캘린더로 내보내려니 학교 계정 권한 창이 떠서 막혔다. 당일에는 내보내기를 빼기로 했다.',
          [['p19', '12-19 14:45', '권한 창은 처음 한 번만 뜨는 거라 학교 정보 담당 선생님께 물어보면 풀릴 수도 있어요.']]],
        ['12-19 15:30', 'p08', 'test', '옆 팀 중등 선생님 두 분이 자기 학교 2학기 일정을 넣어 봤다. 11월 둘째 주가 빨갛게 떴다.', []],
      ],
      intentAt: '12-19 15:45',
      intent: {
        scene: '11월 둘째 주 2학년 교실에서 "이번 주에 수행평가가 다섯 개예요"라는 말을 듣고 교무실에 와서 세어 보니 정말 다섯 과목이었다.',
        who: '학기 초 학년 협의회에서 교과 교사들이 각자 날짜를 넣고, 날짜를 바꿀 때마다 고친다.',
        change: '한 주에 3과목 넘게 몰리는 주를 협의회 자리에서 미리 찾아 옮긴다.',
      },
      workAt: '12-19 15:55',
      work: {
        title: '수행평가 겹침 달력', oneline: '교과별 수행평가 날짜를 모아 한 주에 몇 과목이 몰렸는지 색으로 보여 준다',
        link: 'https://example.com/assess', source: '',
        howto: '학년 시트 사본을 만든다\n과목, 반, 날짜, 평가 이름을 한 줄씩 넣는다\n\'달력 보기\'를 누른다\n빨간 주를 눌러 몰린 과목을 확인한다',
      },
      publishedAt: '12-24 10:30',
      notes: [
        ['p13', '12-19 16:12', '학년 협의회 자료로 바로 쓸 수 있겠어요. 초등은 단원평가 날짜로 써 보고 싶어요.'],
        ['f06', '12-19 16:20', '반별 날짜가 다를 때 달력 칸이 길어지는데, 반 이름을 접어 두는 기능이 있으면 좋겠어요.'],
      ],
    },
    {
      id: 't03', name: '몽글몽글', pet: 'monggeul', idea: 'i03', facil: 'f03', created: '11-05 18:00',
      members: [['p09', '11-05 18:00'], ['p10', '11-05 18:40'], ['p11', '11-06 20:00'], ['p12', '11-07 07:50']],
      planAt: '11-10 21:00',
      plan: {
        problem: '글을 읽기 어려운 학생이 다음 활동을 몰라 불안해하고, 교사는 매일 아침 그림 카드를 손으로 붙인다.',
        users: '특수학급 교사 3명과 학생 11명, 통합학급 담임',
        solution: '요일별 시간표를 고르면 그림 카드가 차례로 놓인 일과표가 나온다. 지금 활동은 크게, 끝난 활동은 흐리게 보인다. 태블릿에 띄워 둔다.',
        tools: '구글 슬라이드, 앱스 스크립트, 공개 그림 카드',
      },
      roles: { p09: '그림 카드 정리', p10: '일과표 화면', p11: '학교에서 써 보기', p12: '통합학급 시간 연결' },
      steps: [['카드 32장 고르기', '11월 30일', '11-28 21:00'], ['일과표 화면', '12월 19일', '12-19 14:40'], ['교실 사진 카드', '12월 19일', '12-19 15:30']],
      logs: [
        ['11-14 20:30', 'p09', 'meet', '그림 카드를 어디서 가져올지 정했다. 저작권 걱정이 없도록 팀에서 직접 그린 카드와 공개 그림 카드만 쓰기로 했다.', []],
        ['11-28 21:00', 'p11', 'make', '활동 카드 32장을 정리했다. 급식, 화장실, 쉬는 시간처럼 매일 나오는 카드부터 만들었다.', []],
        ['12-19 14:40', 'p10', 'make', '시간표를 넣으면 카드가 줄지어 나오는 화면을 만들었다. 지금 시각에 맞춰 카드 하나가 커진다.', []],
        ['12-19 15:05', 'p12', 'test', '통합학급 담임 입장에서 써 봤다. 다음 활동이 "통합학급 국어"면 그 교실 사진이 나오면 좋겠다는 의견을 냈다.', []],
        ['12-19 15:30', 'p10', 'fix', '교실 사진을 카드로 올릴 수 있게 바꿨다. 학생 얼굴이 나온 사진은 쓰지 말라는 안내를 넣었다.', []],
      ],
      intentAt: '12-19 15:40',
      intent: {
        scene: '아침마다 그림 카드 열두 장을 벨크로로 붙이는 데 10분이 걸린다. 시간표가 바뀐 날 카드를 못 바꿔서 학생이 체육복을 입고 음악실에 간 날이 있었다.',
        who: '특수학급 교사가 아침에 태블릿으로 열어 교실 앞에 세워 둔다. 학생은 화면만 본다.',
        change: '아침 카드 붙이기 10분을 없애고, 시간표가 바뀐 날도 학생이 같은 화면에서 바뀐 활동을 본다.',
      },
      workAt: '12-19 15:50',
      work: {
        title: '그림 일과표', oneline: '시간표를 고르면 그림 카드 일과표가 나오고 지금 활동이 크게 보인다',
        link: 'https://example.com/picture-day', source: 'https://example.com/picture-day-cards',
        howto: '요일 시간표에서 활동 카드를 고른다\n\'일과표 만들기\'를 누른다\n태블릿을 교실 앞에 세워 둔다\n바뀐 날은 카드 하나만 바꾼다',
      },
      publishedAt: '12-26 21:00',
      notes: [
        ['p15', '12-19 16:08', '1학년 입학 초기에도 쓸 수 있을 것 같아요. 3월 첫 주에 아이들이 제일 많이 묻는 게 "다음 뭐 해요?"였어요.'],
        ['p26', '12-19 16:15', '교실 사진 카드 좋네요. 특별실 사진도 넣을 수 있으면 좋겠어요.'],
      ],
    },
    {
      id: 't04', name: '체험학습 서류함', pet: 'digibugi', idea: 'i04', facil: 'f04', created: '11-06 17:30',
      members: [['p13', '11-06 17:30'], ['p14', '11-06 18:00'], ['p15', '11-07 20:00'], ['p16', '11-08 09:00']],
      planAt: '11-12 20:30',
      plan: {
        problem: '교외체험학습 보고서 미제출을 학기 말에야 알게 되고, 담임마다 종이 서류를 따로 관리한다.',
        users: '담임 교사와 교무 담당',
        solution: '신청일, 기간, 보고서 제출 여부를 넣는 표와, 기간이 끝나고 7일이 지나도 보고서가 없으면 노란색으로 표시하는 화면. 보호자에게 보낼 안내 문구를 복사할 수 있다.',
        tools: '구글 시트, 조건부 서식, 앱스 스크립트',
      },
      roles: { p13: '교무 쪽 화면', p14: '알림 규칙', p15: '저학년 확인 방식', p16: '신청 목록 시트' },
      steps: [['서류 칸 정하기', '11월 20일', '11-13 21:00'], ['신청 목록 시트', '12월 5일', '11-27 20:00'], ['늦은 보고서 표시', '12월 19일', '12-19 14:50'], ['안내 문구 고치기', '1월', null]],
      logs: [
        ['11-13 21:00', 'p13', 'meet', '학생 이름을 시트에 넣어도 되는지부터 이야기했다. 학교 계정 드라이브 안에서만 쓰고, 번호와 성만 넣기로 했다.', []],
        ['11-27 20:00', 'p16', 'make', '신청 목록 시트와 제출 확인 칸을 만들었다.', []],
        ['12-19 14:50', 'p14', 'make', '기간이 끝나고 7일이 지난 미제출 줄을 노란색으로 바꾸는 규칙을 넣었다.', []],
        ['12-19 15:15', 'p15', 'stuck', '1학년은 보호자가 보고서를 대신 써서 내는 경우가 많아서, 제출을 누가 확인했는지 남겨야 한다는 이야기가 나왔다.', []],
        ['12-19 15:35', 'p15', 'fix', '확인한 사람과 날짜 칸을 더했다.', []],
      ],
      intentAt: '12-19 15:45',
      intent: {
        scene: '7월 방학식 날, 보고서를 안 낸 학생을 찾으려고 서랍에서 신청서 23장을 꺼내 하나씩 맞춰 봤다.',
        who: '담임이 신청서를 받을 때마다 한 줄 넣고, 교무 담당이 한 달에 한 번 전체를 본다.',
        change: '보고서 미제출을 학기 말이 아니라 기간이 끝난 다음 주에 안다.',
      },
      workAt: '12-19 15:58',
      work: {
        title: '체험학습 서류함', oneline: '신청과 보고서 제출을 한 표에 모으고, 늦은 보고서를 노란색으로 알려 준다',
        link: 'https://example.com/field-trip', source: '',
        howto: '시트 사본을 만든다\n신청서를 받으면 한 줄 넣는다\n보고서를 받으면 제출 칸에 표시한다\n노란 줄은 안내 문구를 복사해 보낸다',
      },
      publishedAt: null,
      notes: [
        ['f01', '12-19 16:18', '보호자 안내 문구를 반마다 고칠 수 있게 하면 좋겠어요.'],
        ['p05', '12-19 16:22', '중학교도 서류 관리 방식이 같아요. 사본 받아 보고 싶어요.'],
      ],
    },
    {
      id: 't05', name: '질문 상자', pet: 'pickling', idea: 'i05', facil: 'f05', created: '11-04 21:00',
      members: [['p17', '11-04 21:30'], ['p18', '11-05 19:00'], ['p19', '11-04 21:00'], ['p20', '11-06 22:00']],
      planAt: '11-11 21:40',
      plan: {
        problem: '수업 끝에 질문을 받으면 아무도 손을 들지 않고, 끝나고 복도에서 따로 묻는 학생이 있다.',
        users: '중고등 교과 교사와 한 반 학생 25~30명',
        solution: '수업마다 여는 질문 보드. 학생은 이름 없이 질문을 올리고 "나도"를 누른다. 교사 화면에는 "나도"가 많은 순서로 보인다.',
        tools: '앱스 스크립트 웹 앱, 구글 시트',
      },
      roles: { p17: '장난 글 막기', p18: '수업에서 써 보기', p19: '보드 만들기', p20: '교사 화면' },
      steps: [['질문 올리기', '12월 5일', '12-03 21:00'], ['교사 화면', '12월 19일', '12-19 14:30'], ['적게 보기', '12월 19일', '12-19 15:25']],
      logs: [
        ['11-15 20:00', 'p17', 'meet', '이름이 없으면 장난 글이 올라올 수 있다는 걱정이 나왔다. 교사가 바로 숨길 수 있는 버튼을 넣기로 했다.', []],
        ['12-03 21:00', 'p19', 'make', '질문 올리기와 "나도" 버튼을 만들었다. 같은 기기에서는 "나도"를 한 번만 누르게 했다.', []],
        ['12-19 14:55', 'p18', 'test', '옆 팀 선생님 9명에게 학생 역할을 부탁해 질문을 받았다. 4분 동안 질문 14개, "나도" 31번이 들어왔다.', []],
        ['12-19 15:25', 'p20', 'fix', '질문이 많으면 화면이 길어져서 "나도" 3개 이상만 보는 버튼을 넣었다.', []],
      ],
      intentAt: '12-19 15:40',
      intent: {
        scene: '2학기 사회 시간에 "질문 있나요?"라고 세 번 물었는데 아무도 손을 들지 않았다. 종이 치고 복도에서 학생 둘이 같은 내용을 따로 물었다.',
        who: '수업 마지막 5분에 교사가 질문 보드를 열고 칠판에 QR을 띄운다. 학생은 자기 휴대폰으로 올린다.',
        change: '수업 중에 나오지 않던 질문을 그 시간 안에 받는다. 당일 시험에서는 4분에 14개가 들어왔다.',
      },
      workAt: '12-19 15:50',
      work: {
        title: '익명 질문 보드', oneline: '학생이 이름 없이 질문을 올리고 "나도"를 눌러 많이 궁금한 질문부터 보인다',
        link: 'https://example.com/question-box', source: 'https://example.com/question-box-code',
        howto: '\'새 보드\'를 누른다\n칠판에 QR을 띄운다\n학생이 질문을 올리고 "나도"를 누른다\n교사 화면에서 "나도"가 많은 질문부터 답한다\n장난 글은 \'숨기기\'를 누른다',
      },
      publishedAt: '12-22 21:30',
      notes: [
        ['p11', '12-19 16:06', '특수학교에서도 말로 질문하기 어려운 학생에게 쓸 수 있을 것 같아요. 글 대신 그림 버튼이 있으면 좋겠어요.'],
        ['p02', '12-19 16:14', '초등 고학년도 써 보고 싶어요. 휴대폰이 없는 학생은 반 태블릿으로 하면 될까요?'],
      ],
    },
    {
      id: 't06', name: '과학실 재고', pet: 'droni', idea: 'i06', facil: 'f06', created: '11-07 19:00',
      members: [['p21', '11-07 19:00'], ['p22', '11-07 19:30'], ['p23', '11-08 20:00'], ['p24', '11-09 18:00']],
      planAt: '11-13 22:10',
      plan: {
        problem: '실험 전날 시약장을 열어 보면 필요한 시약이 모자라고, 누가 언제 썼는지 기록이 없다.',
        users: '과학 교사 4명, 과학실 1곳',
        solution: '시약과 기구마다 QR 스티커를 붙인다. 찍으면 사용 기록 양식이 열리고, 남은 양이 기준보다 적으면 목록 맨 위에 빨간색으로 뜬다.',
        tools: '구글 폼, 구글 시트, QR 만들기',
      },
      roles: { p21: '시약 목록', p22: '기록 양식', p23: '재고판', p24: 'QR 출력과 붙이기' },
      steps: [['목록 만들기', '11월 30일', '11-25 21:00'], ['QR 40장 출력', '12월 5일', '12-01 20:30'], ['재고판', '12월 19일', '12-19 15:30'], ['과학실에 붙이기', '12월 말', '12-28 16:00']],
      logs: [
        ['11-18 20:20', 'p22', 'meet', '시약과 기구를 한 시트에 둘지 나눌지 정했다. 하나로 두고 종류 칸을 두기로 했다.', []],
        ['12-01 20:30', 'p21', 'make', '시약 28종, 기구 12종 목록을 만들고 QR 40장을 뽑았다.', []],
        ['12-19 14:35', 'p23', 'stuck', '기구는 개수로, 시약은 mL로 세서 남은 양을 한 칸에서 계산할 수 없다.',
          [['p06', '12-19 14:50', '단위 칸을 따로 두고 기준량도 단위별로 넣으면 어떨까요? 저희 입력 시트도 그렇게 풀었어요.'],
           ['f06', '12-19 14:58', '기준량을 "한 학기 실험 2번 할 양"처럼 정하면 설명하기 쉬울 것 같아요.']]],
        ['12-19 15:30', 'p24', 'fix', '단위 칸과 단위별 기준량 칸을 더했다. 모자란 줄은 맨 위로 올라온다.', []],
        ['12-28 16:00', 'p21', 'apply', '누리중 과학실 시약장 두 칸에 QR을 붙였다. 일주일 동안 사용 기록 17건이 쌓였다.', []],
      ],
      intentAt: '12-19 15:42',
      intent: {
        scene: '산·염기 실험 전날 시약장을 열었더니 묽은 염산이 50mL밖에 없었다. 누가 언제 썼는지 기록이 없어 그날 실험을 시연으로 바꿨다.',
        who: '과학 교사가 시약이나 기구를 꺼낼 때 병에 붙은 QR을 휴대폰으로 찍는다.',
        change: '남은 양이 기준 아래로 내려가면 그 주에 안다. 당일에 QR 40장으로 시약 28종과 기구 12종을 등록했다.',
      },
      workAt: '12-19 15:52',
      work: {
        title: '과학실 QR 재고판', oneline: '시약병과 기구에 붙인 QR을 찍어 쓴 양을 남기고, 모자란 것부터 보여 준다',
        link: 'https://example.com/lab-stock', source: 'https://example.com/lab-stock-sheet',
        howto: '재고 시트 사본을 만든다\n\'QR 만들기\'로 스티커를 출력해 붙인다\n쓸 때마다 QR을 찍고 쓴 양을 적는다\n재고판에서 빨간 줄부터 주문한다',
      },
      publishedAt: '12-28 17:00',
      notes: [
        ['p19', '12-19 16:09', '정보 시간 기자재 대여에도 그대로 쓸 수 있겠어요.'],
        ['p13', '12-19 16:16', '초등 과학실은 실무사님이 관리하시는데, 실무사님 화면도 따로 있으면 좋겠어요.'],
      ],
    },
    {
      id: 't07', name: '협의록 한 장', pet: 'owllab', idea: 'i07', facil: 'f07', created: '11-08 20:00',
      members: [['p25', '11-08 20:00'], ['p26', '11-08 20:10'], ['p27', '11-08 20:30'], ['p28', '11-09 08:30']],
      planAt: '11-13 21:00',
      plan: {
        problem: '학년 협의회 메모를 각자 적다 보니 누가 무엇을 하기로 했는지 다음 주에 다시 묻는다.',
        users: '4학년 담임 4명과 교무부장',
        solution: '협의 메모를 붙여 넣으면 정한 것, 할 일, 담당, 기한 네 칸 표로 정리해 학년 공유 문서에 붙인다. 정리는 학교에서 허용한 생성형 AI로 하고, 교사가 확인한 뒤에 붙인다.',
        tools: '구글 문서, 앱스 스크립트, 생성형 AI',
      },
      roles: { p25: '정리 화면', p26: '지난 메모로 시험', p27: '빈 담당 표시', p28: '이름 가리기' },
      steps: [['이름 가리기', '12월 10일', '12-05 22:00'], ['네 칸 표 정리', '12월 19일', '12-19 14:20'], ['빈 담당 표시', '12월 19일', '12-19 15:30']],
      logs: [
        ['11-16 21:00', 'p27', 'meet', '메모에 학생 이름이 섞이면 AI에 그대로 보내면 안 된다는 이야기가 나왔다. 보내기 전에 이름을 가리는 단계를 먼저 넣기로 했다.', []],
        ['12-05 22:00', 'p28', 'make', '학년 학생 명단과 겹치는 단어를 ○○으로 바꾸는 기능을 만들었다.', []],
        ['12-19 14:20', 'p25', 'make', '정리 결과를 네 칸 표로 받는 화면을 만들었다.', []],
        ['12-19 15:00', 'p26', 'test', '4학년 지난 협의 메모 3개로 돌려 봤다. 담당이 비어 있는 할 일이 2개 나왔다.', []],
        ['12-19 15:30', 'p27', 'fix', '담당이 빈 칸은 노란색으로 표시하고 "담당 정하기"를 누르게 했다.', []],
      ],
      intentAt: '12-19 15:45',
      intent: {
        scene: '학년 협의회 다음 주에 "체험학습 버스는 누가 알아보기로 했죠?"라는 말로 회의가 다시 시작됐다. 메모는 네 명이 다 했는데 담당은 아무도 적지 않았다.',
        who: '협의회가 끝나고 학년 부장이 메모를 붙여 넣는다. 정리된 표는 네 명이 다 보는 학년 문서에 붙는다.',
        change: '회의가 끝난 그날 "정한 것, 할 일, 담당, 기한" 표가 학년 문서에 올라간다. 시험에서는 지난 메모 3개에서 담당이 빠진 할 일 2개를 찾았다.',
      },
      workAt: '12-19 15:55',
      work: {
        title: '협의록 한 장', oneline: '협의 메모를 붙여 넣으면 정한 것·할 일·담당·기한 표로 정리한다',
        link: 'https://example.com/meeting-note', source: '',
        howto: '메모를 붙여 넣는다\n\'이름 가리기\'로 학생 이름을 가린다\n\'정리하기\'를 누른다\n표를 확인하고 고친다\n\'학년 문서에 붙이기\'를 누른다',
      },
      publishedAt: '12-27 11:00',
      notes: [
        ['p08', '12-19 16:11', '중학교 교과협의회에도 쓰고 싶어요. 교과 이름도 가려야 하는지 궁금해요.'],
        ['f03', '12-19 16:19', '이름 가리는 단계를 먼저 둔 게 좋았어요. 결과 화면에 "가린 단어 3개"처럼 개수가 보이면 안심될 것 같아요.'],
      ],
    },
    {
      id: 't08', name: '알림장 메이트', pet: 'hongaengi', idea: 'i08', facil: 'f08', created: '11-05 20:00',
      members: [['p30', '11-05 20:00'], ['p29', '11-06 19:10'], ['p31', '11-07 21:20'], ['p32', '11-22 09:00']],
      planAt: '11-14 20:40',
      plan: {
        problem: '금요일마다 주간 학습 안내를 만들며 시간표, 준비물, 행사를 파일 세 개에서 옮겨 적는다. 한 시간 걸린다.',
        users: '1~3학년 담임과 영어 전담',
        solution: '요일별 시간표와 준비물을 한 번 넣어 두고, 그 주에 바뀐 것만 고치면 가정 안내문 모양의 한 장이 나온다.',
        tools: '구글 시트, 구글 문서, 앱스 스크립트',
      },
      roles: { p29: '기본 시간표', p30: '안내문 양식', p31: '문서 만들기', p32: '전담 시간' },
      steps: [['기본 양식 정하기', '11월 20일', '11-17 21:00'], ['기본 시간표 시트', '12월 5일', '11-30 20:00'], ['안내문 만들기', '12월 19일', '12-19 14:40'], ['학년에 나눠 주기', '2월', null]],
      logs: [
        ['11-17 21:00', 'p30', 'meet', '학교마다 안내문 양식이 달라서, 칸 이름만 맞추면 되는 기본 양식 하나로 시작하기로 했다.', []],
        ['11-30 20:00', 'p29', 'make', '요일별 기본 시간표 시트를 만들었다.', []],
        ['12-19 14:40', 'p31', 'make', '바뀐 시간만 고치면 안내문 문서가 새로 만들어지게 했다.', []],
        ['12-19 15:10', 'p32', 'stuck', '영어 전담은 반마다 시간이 달라서 전담 시간을 따로 넣는 칸이 필요하다.',
          [['p04', '12-19 15:20', '저희 학교도 전담 시간이 반마다 달라요. 반 번호로 묶으면 어떨까요?']]],
        ['12-19 15:40', 'p32', 'fix', '전담 시간 칸을 반별로 나눴다.', []],
      ],
      intentAt: '12-19 15:48',
      intent: {
        scene: '금요일 오후 4시 반, 주간 학습 안내 한 장을 만들려고 시간표 파일, 준비물 메모, 학교 행사 공문을 번갈아 열었다. 다 만들고 보니 5시 반이었다.',
        who: '담임이 금요일에 시트를 열어 그 주에 바뀐 칸만 고친다.',
        change: '주간 안내 만드는 시간을 1시간에서 15분 안으로 줄인다.',
      },
      workAt: '12-19 15:58',
      work: {
        title: '주간 안내 한 장', oneline: '기본 시간표와 준비물을 넣어 두면 바뀐 칸만 고쳐 주간 학습 안내를 만든다',
        link: 'https://example.com/weekly', source: '',
        howto: '기본 시간표를 한 번 넣는다\n금요일에 바뀐 칸만 고친다\n\'안내문 만들기\'를 누른다\n문서를 확인하고 보낸다',
      },
      publishedAt: null,
      notes: [
        ['p18', '12-19 16:13', '중학교 가정통신문에도 응용할 수 있겠어요.'],
      ],
    },
    {
      id: 't09', name: '상담 주간', pet: 'maninyang', idea: 'i09', facil: 'f09', created: '11-08 18:00',
      members: [['p33', '11-08 18:00'], ['p35', '11-08 18:20'], ['p34', '11-09 21:00'], ['p36', '11-21 19:00']],
      planAt: '11-15 21:00',
      plan: {
        problem: '상담 주간마다 보호자와 시간 조율 문자를 반마다 30통 넘게 주고받고, 겹치는 시간도 생긴다.',
        users: '담임 교사와 보호자, 상담 교사',
        solution: '교사가 상담할 수 있는 시간을 열면 보호자가 링크에서 하나를 고른다. 이미 고른 시간은 사라진다. 보호자는 자녀 번호와 성만 적는다.',
        tools: '구글 시트, 앱스 스크립트 웹 앱',
      },
      roles: { p33: '시간 열기 화면', p34: '동시 시험', p35: '보호자 안내', p36: '보호자 화면' },
      steps: [['받을 정보 정하기', '11월 25일', '11-19 21:00'], ['시간 열기 화면', '12월 10일', '12-04 21:30'], ['보호자 화면', '12월 19일', '12-19 14:30'], ['겹침 막기', '12월 19일', '12-19 15:35']],
      logs: [
        ['11-19 21:00', 'p35', 'meet', '보호자 이름을 받을지 이야기했다. 자녀 번호와 보호자 성만 받기로 했다.', []],
        ['12-04 21:30', 'p33', 'make', '상담 시간 칸을 여는 화면을 만들었다. 20분 단위다.', []],
        ['12-19 14:30', 'p36', 'make', '보호자 화면을 만들었다. 고른 시간은 바로 다른 사람 화면에서 사라진다.', []],
        ['12-19 15:00', 'p34', 'test', '옆 팀 선생님 6명이 동시에 같은 시간을 눌렀더니 두 명이 같은 칸에 들어갔다.',
          [['p19', '12-19 15:08', '앱스 스크립트면 LockService로 저장할 때 한 번에 한 명만 쓰게 할 수 있어요.'],
           ['f09', '12-19 15:12', '잠금 넣고 같은 방식으로 다시 시험해 봐요.']]],
        ['12-19 15:35', 'p33', 'fix', '저장할 때 잠금을 걸어 한 칸에 한 명만 들어가게 했다. 6명 동시 시험에서 겹침 0건.', []],
      ],
      intentAt: '12-19 15:46',
      intent: {
        scene: '1학기 상담 주간에 우리 반 26가정과 시간을 맞추느라 문자를 41통 주고받았다. 같은 시간에 두 분이 오신 날도 있었다.',
        who: '상담 주간 2주 전에 담임이 시간을 열고 링크를 보낸다. 보호자는 휴대폰으로 고른다.',
        change: '시간 조율 문자를 없애고, 한 칸에 한 가정만 들어간다.',
      },
      workAt: '12-19 15:57',
      work: {
        title: '상담 시간 고르기', oneline: '교사가 연 상담 시간을 보호자가 링크에서 골라 가고, 고른 칸은 바로 닫힌다',
        link: 'https://example.com/counsel', source: 'https://example.com/counsel-code',
        howto: '상담할 수 있는 날과 시간을 연다\n보호자에게 링크를 보낸다\n보호자가 자녀 번호와 성을 적고 시간을 고른다\n교사 화면에서 확정된 시간을 본다',
      },
      publishedAt: '12-29 20:00',
      notes: [
        ['p15', '12-19 16:17', '저학년 보호자는 링크를 어려워하실 수 있어서 안내 그림이 한 장 있으면 좋겠어요.'],
        ['p07', '12-19 16:21', '중학교는 교과 상담도 있어서, 교사 여러 명의 시간을 한 링크에 모으면 좋겠어요.'],
      ],
    },
    {
      id: 't10', name: '독서 스탬프', pet: 'h2o', idea: 'i10', facil: 'f10', created: '11-25 20:00',
      members: [['p38', '11-25 20:00'], ['p37', '11-25 20:30'], ['p39', '11-26 19:00'], ['p40', '11-27 21:00']],
      planAt: '12-01 21:00',
      plan: {
        problem: '독서 기록장을 학기 말에 걷어 보면 쓰다 만 학생이 절반이고, 중간에 누가 멈췄는지 알 수 없다.',
        users: '3~6학년 담임과 학생',
        solution: '학생이 책 제목과 한 줄 느낌을 남기면 스탬프가 찍힌다. 교사 화면에는 2주 넘게 기록이 없는 학생이 따로 보인다.',
        tools: '구글 시트, 앱스 스크립트 웹 앱',
      },
      roles: { p37: '학생 역할 시험', p38: '들어오는 방식', p39: '스탬프판', p40: '교사 화면' },
      steps: [['들어오는 방식 정하기', '12월 5일', '12-03 21:00'], ['스탬프판', '12월 19일', '12-12 21:30'], ['교사 화면', '12월 19일', null]],
      logs: [
        ['12-03 21:00', 'p38', 'meet', '학생 계정이 없는 반도 있어서 번호와 반 코드로 들어오게 하기로 했다.', []],
        ['12-12 21:30', 'p39', 'make', '기록 화면과 스탬프판을 만들었다.', []],
        ['12-19 15:00', 'p37', 'test', '다른 팀 선생님 5명이 학생 역할로 써 봤다. 한 줄 느낌 칸이 비어도 저장되는 문제를 찾았다.', []],
        ['12-19 15:25', 'p40', 'fix', '한 줄 느낌을 5자 이상 써야 저장되게 했다.', []],
      ],
      intentAt: '12-19 15:50',
      intent: {
        scene: '6월에 독서 기록장을 걷어 보니 28명 중 13명이 4월에 멈춰 있었다. 그동안 아무도 몰랐다.',
        who: '학생이 아침 독서 뒤 반 태블릿으로 남긴다. 담임은 일주일에 한 번 교사 화면을 본다.',
        change: '2주 넘게 기록이 없는 학생을 학기 말이 아니라 그 주에 안다.',
      },
      workAt: '12-19 15:59',
      work: {
        title: '독서 스탬프판', oneline: '책 제목과 한 줄을 남기면 스탬프가 찍히고, 멈춘 학생을 교사에게 보여 준다',
        link: 'https://example.com/reading', source: '',
        howto: '반 코드를 만든다\n학생이 번호와 반 코드로 들어온다\n책 제목과 한 줄을 남긴다\n교사 화면에서 멈춘 학생을 본다',
      },
      publishedAt: null,
      notes: [
        ['p12', '12-19 16:24', '스탬프 그림을 학생이 고를 수 있으면 더 자주 쓸 것 같아요.'],
      ],
    },
  ];

  // 간단한 고정 난수(새로 만들 때마다 같은 결과)
  function rng(seed) {
    let s = seed;
    return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  }

  function pickSome(pool, n, rand, skip) {
    const out = [];
    const list = pool.filter((x) => !(skip || []).includes(x));
    while (out.length < n && list.length) out.push(list.splice(Math.floor(rand() * list.length), 1)[0]);
    return out;
  }

  // 고른 시점까지 있었던 일로 상태를 만든다
  function build(snapKey) {
    const snap = HB.config.snapshots.find((s) => s.key === snapKey) || HB.config.snapshots[1];
    const now = Date.parse(snap.at);
    const rand = rng(7);
    const seen = (t) => t && T(t) <= now;

    const people = PEOPLE.trim().split('\n').map((line) => {
      const [id, name, school, level, job, avatar] = line.split('|');
      const role = id[0] === 'f' ? 'facil' : id[0] === 's' ? 'staff' : 'participant';
      return { id, name, school, level, job, avatar, role };
    });
    const pids = people.filter((p) => p.role !== 'staff').map((p) => p.id);

    const ideas = IDEAS.filter((r) => seen(r[2])).map((r) => {
      const [id, by, at, level, tags, title, problem, wish, likeN, comments] = r;
      // 공감 수는 시점에 따라 줄인다(사전에는 절반쯤)
      const k = now < T('11-25 00:00') ? 0.55 : now < T('12-20 00:00') ? 0.85 : 1;
      return {
        id, by, at: T(at), level, tags, title, problem, wish,
        likes: pickSome(pids, Math.round(likeN * k), rand, [by]),
        comments: comments.filter((c) => seen(c[1])).map((c, i) => ({ id: id + 'c' + i, by: c[0], at: T(c[1]), text: c[2] })),
      };
    });

    const teams = [];
    const logs = [];
    TEAMS.filter((t) => seen(t.created)).forEach((t, n) => {
      const idea = IDEAS.find((r) => r[0] === t.idea);
      const members = t.members.filter((m) => seen(m[1])).map((m) => m[0]);
      const team = {
        id: t.id, name: t.name, pet: t.pet, ideaId: t.idea, facil: t.facil,
        level: idea ? idea[3] : '초등', tags: idea ? idea[4].slice() : [],
        createdAt: T(t.created), members,
        plan: seen(t.planAt) ? Object.assign({}, t.plan) : {},
        roles: seen(t.planAt) ? Object.fromEntries(Object.entries(t.roles).filter(([k]) => members.includes(k))) : {},
        steps: seen(t.planAt) ? t.steps.map((s, i) => ({ id: t.id + 's' + i, text: s[0], due: s[1], done: seen(s[2]) })) : [],
        intent: seen(t.intentAt) ? Object.assign({}, t.intent) : {},
        work: seen(t.workAt) ? Object.assign({ cover: '' }, t.work) : {},
        published: seen(t.publishedAt),
        publishedAt: seen(t.publishedAt) ? T(t.publishedAt) : null,
        notes: t.notes.filter((x) => seen(x[1])).map((x, i) => ({ id: t.id + 'n' + i, by: x[0], at: T(x[1]), text: x[2] })),
      };
      teams.push(team);
      t.logs.filter((l) => seen(l[0])).forEach((l, i) => {
        const others = pids.filter((p) => !members.includes(p));
        logs.push({
          id: t.id + 'l' + i, team: t.id, by: l[1], at: T(l[0]), kind: l[2], text: l[3], link: '', image: '',
          cheers: pickSome(others, Math.floor(rand() * 9), rand),
          comments: l[4].filter((c) => seen(c[1])).map((c, j) => ({ id: t.id + 'l' + i + 'c' + j, by: c[0], at: T(c[1]), text: c[2] })),
        });
      });
    });

    return {
      version: 1,
      snapshot: snap.key,
      clock: now,
      clockSetAt: Date.now(),
      people, ideas, teams, logs,
    };
  }

  // 예시 사람 아이디(예시 지우기 때 이메일 없는 예시 사람만 지운다)
  const peopleIds = () => PEOPLE.trim().split(/\r?\n/).map((l) => l.split('|')[0]);

  HB.sample = { build, peopleIds };
})();


/* ===== server/Code.js ===== */
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
