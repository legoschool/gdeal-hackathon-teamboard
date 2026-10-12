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
