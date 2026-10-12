/* 데이터에서 값을 계산한다(읽기만 한다). 팀 단계 조건, 정렬, 거르기가 여기 있다. */
(function () {
  const C = HB.config;
  const st = () => HB.store.state;
  const S = {};

  S.person = (id) => st().people.find((p) => p.id === id)
    || { id, name: '나간 사람', avatar: 'a20', school: '', job: '', role: 'participant', level: '' };
  S.team = (id) => st().teams.find((t) => t.id === id) || null;
  S.idea = (id) => st().ideas.find((i) => i.id === id) || null;
  S.pet = (id) => C.pets.find((p) => p.id === id) || C.pets[0];
  S.kind = (k) => C.logKinds.find((x) => x.key === k) || C.logKinds[0];

  S.teamNo = (team) => String(st().teams.indexOf(team) + 1).padStart(2, '0');
  S.teamOf = (pid) => (pid ? st().teams.find((t) => t.members.includes(pid) || t.facil === pid) || null : null);

  // 팀 공간을 고칠 수 있는 사람: 그 팀 참가자, 그 팀 퍼실, 운영진
  S.canEdit = (team, me) => !!(me && team && (team.members.includes(me.id) || team.facil === me.id || me.role === 'staff'));
  S.seatsLeft = (team) => C.team.seats - team.members.length;

  // 행사 날짜 기준 지금 단계
  S.phase = () => {
    const day = Date.parse(C.event.day + 'T00:00');
    const now = HB.util.now();
    if (now < day) return 'before';
    if (now < day + 86400000) return 'day';
    return 'after';
  };

  S.filled = (obj, fields) => fields.filter((f) => String((obj || {})[f.key] || '').trim()).length;
  S.workReady = (team) => C.workFields.filter((f) => f.required).every((f) => String((team.work || {})[f.key] || '').trim());
  S.intentReady = (team) => S.filled(team.intent, C.intentFields) === C.intentFields.length;
  S.publishReady = (team) => S.workReady(team) && S.intentReady(team);

  S.teamLogs = (teamId) => st().logs.filter((l) => l.team === teamId).sort((a, b) => b.at - a.at);

  // 팀 진행 단계. done과 지금 상태(now)를 함께 돌려준다
  S.teamSteps = (team) => {
    const logN = st().logs.filter((l) => l.team === team.id).length;
    const planN = S.filled(team.plan, C.planFields);
    const intentN = S.filled(team.intent, C.intentFields);
    const workN = C.workFields.filter((f) => f.required && String((team.work || {})[f.key] || '').trim()).length;
    const workAll = C.workFields.filter((f) => f.required).length;
    const info = {
      formed: [team.members.length >= C.team.minToForm, `참가자 ${team.members.length}명`],
      plan:   [planN === C.planFields.length, `${planN}/${C.planFields.length}칸`],
      log:    [logN >= C.team.minLogs, `기록 ${logN}개`],
      intent: [intentN === C.intentFields.length, `${intentN}/${C.intentFields.length}칸`],
      work:   [workN === workAll, `${workN}/${workAll}칸`],
      open:   [!!team.published, team.published ? '공개함' : '아직'],
    };
    return C.steps.map((s) => Object.assign({}, s, { done: info[s.key][0], now: info[s.key][1] }));
  };
  S.level = (team) => S.teamSteps(team).filter((s) => s.done).length;
  S.nextStep = (team) => S.teamSteps(team).find((s) => !s.done) || null;

  S.lastActivity = (team) => {
    const l = S.teamLogs(team.id)[0];
    return l ? l.at : team.createdAt;
  };

  S.ideaTeams = (ideaId) => st().teams.filter((t) => t.ideaId === ideaId);

  // 아이디어 목록. sort: new | like, filter: all | open | taken, tag: '' 또는 태그
  S.ideas = ({ sort = 'new', filter = 'all', tag = '' } = {}) => {
    let list = st().ideas.slice();
    if (tag) list = list.filter((i) => i.tags.includes(tag));
    if (filter === 'open') list = list.filter((i) => !S.ideaTeams(i.id).length);
    if (filter === 'taken') list = list.filter((i) => S.ideaTeams(i.id).length);
    list.sort(sort === 'like' ? (a, b) => b.likes.length - a.likes.length || b.at - a.at : (a, b) => b.at - a.at);
    return list;
  };

  // 전체 과정. team: '' 또는 팀 아이디, kind: '' 또는 종류
  S.feed = ({ team = '', kind = '' } = {}) => st().logs
    .filter((l) => (!team || l.team === team) && (!kind || l.kind === kind) && S.team(l.team))
    .sort((a, b) => b.at - a.at);

  S.unassigned = () => st().people.filter((p) => p.role === 'participant' && !S.teamOf(p.id));
  S.freeFacil = () => st().people.find((p) => p.role === 'facil' && !st().teams.some((t) => t.facil === p.id)) || null;
  S.usedPets = () => st().teams.map((t) => t.pet);

  // 아카이브. level·tag·q로 거른다
  S.archive = ({ level = '', tag = '', q = '' } = {}) => {
    const words = q.trim().toLowerCase();
    return st().teams
      .filter((t) => t.published)
      .filter((t) => !level || t.level === level)
      .filter((t) => !tag || (t.tags || []).includes(tag))
      .filter((t) => !words || [t.name, t.work.title, t.work.oneline, t.intent.scene].join(' ').toLowerCase().includes(words))
      .sort((a, b) => b.publishedAt - a.publishedAt);
  };

  S.counts = () => ({
    ideas: st().ideas.length,
    teams: st().teams.length,
    logs: st().logs.length,
    published: st().teams.filter((t) => t.published).length,
    participants: st().people.filter((p) => p.role === 'participant').length,
  });

  HB.select = S;
})();
