/* 화면이 부르는 쓰기 동작. 규칙은 js/ops.js에 있고, 여기서는 폼 값을 정리해 넘긴다.
   HB.store.commit이 초안에서는 브라우저 저장소에, 앱스 스크립트판에서는 서버에 쓴다.
   성공하면 true나 새 아이디를, 실패하면 알림을 띄우고 false를 돌려준다. */
(function () {
  const C = HB.config;
  const U = HB.util;
  const A = {};

  async function run(op, args) {
    if (!HB.me()) { HB.askLogin(); return false; }
    try {
      const r = await HB.store.commit(op, args);
      return r === undefined ? true : r;
    } catch (e) {
      U.toast(e.message || '저장하지 못했어요. 다시 시도해 주세요.');
      return false;
    }
  }
  const pick = (d, fields) => Object.fromEntries(fields.map((f) => [f.key, d[f.key] || '']));

  A.addIdea = (d) => run('addIdea', { id: U.uid('i'), title: d.title, problem: d.problem, wish: d.wish, level: d.level, tags: [].concat(d.tags || []) });
  A.toggleLike = (ideaId) => run('toggleLike', { ideaId });
  A.commentIdea = (ideaId, text) => run('commentIdea', { ideaId, id: U.uid('c'), text });

  A.createTeam = (d) => run('createTeam', { id: U.uid('t'), name: d.name, pet: d.pet, ideaId: d.ideaId || '' });
  A.joinTeam = (teamId) => run('joinTeam', { teamId });
  A.leaveTeam = (teamId) => run('leaveTeam', { teamId });
  A.takeIdea = (teamId, ideaId) => run('takeIdea', { teamId, ideaId });

  A.savePlan = (teamId, d) => {
    const roles = {};
    Object.keys(d).forEach((k) => { if (k.indexOf('role_') === 0) roles[k.slice(5)] = d[k]; });
    return run('savePlan', { teamId, plan: pick(d, C.planFields), roles });
  };
  A.addStep = (teamId, text, due) => run('addStep', { teamId, id: U.uid('s'), text, due });
  A.toggleStep = (teamId, stepId) => run('toggleStep', { teamId, stepId });
  A.removeStep = (teamId, stepId) => run('removeStep', { teamId, stepId });
  A.saveIntent = (teamId, d) => run('saveIntent', { teamId, intent: pick(d, C.intentFields) });
  A.saveWork = (teamId, d) => run('saveWork', { teamId, work: pick(d, C.workFields), cover: d.cover });
  A.setPublished = (teamId, on) => run('setPublished', { teamId, on: !!on });

  A.addLog = (teamId, d) => run('addLog', { teamId, id: U.uid('l'), kind: d.kind, text: d.text, link: d.link || '', image: d.image || '' });
  A.removeLog = (logId) => run('removeLog', { logId });
  A.toggleCheer = (logId) => run('toggleCheer', { logId });
  A.commentLog = (logId, text) => run('commentLog', { logId, id: U.uid('c'), text });

  A.addNote = (teamId, text) => run('addNote', { teamId, id: U.uid('n'), text });

  // 운영진: adminMove, adminSetFacil, adminEditTeam, adminRemoveTeam, adminRemove (js/ops.js)
  A.admin = (op, args) => run(op, args);

  HB.actions = A;
})();
