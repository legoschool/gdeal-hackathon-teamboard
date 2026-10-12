/* 팀: 모든 팀의 자리와 진행, 팀 찾는 사람, 새 팀 만들기 */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const A = HB.actions;
  const V = HB.view;
  const esc = U.esc;

  function canCreate(me) {
    return me && me.role === 'participant' && !S.teamOf(me.id) && HB.store.state.teams.length < C.team.maxTeams;
  }

  function status(me) {
    if (!me) return `<div class="notice">팀에 들어가려면 먼저 참여해 주세요. <button class="link-btn" data-act="join">참여하기</button></div>`;
    const mine = S.teamOf(me.id);
    if (mine) return `<div class="notice notice--team" style="--c:${S.pet(mine.pet).color}">${UI.pet(mine.pet, 'pet--xs')}<span>${me.role === 'facil' ? '퍼실로 맡은 팀' : '우리 팀'}: <b>${esc(mine.name)}</b></span><a class="link-btn" href="#/team/${mine.id}">팀 공간</a></div>`;
    if (me.role !== 'participant') return '';
    const full = HB.store.state.teams.length >= C.team.maxTeams;
    return `<div class="notice">아직 팀이 없어요. 빈자리가 있는 팀에 들어가${full ? '세요.' : '거나 새 팀을 만드세요.'}</div>`;
  }

  function newTeamForm(me) {
    const used = S.usedPets();
    const ideaId = typeof V.newTeam === 'string' ? V.newTeam : '';
    const ideas = S.ideas({ sort: 'like' });
    const free = ideas.filter((i) => !S.ideaTeams(i.id).length);
    const firstFree = C.pets.find((p) => !used.includes(p.id));
    return `<form class="panel form-card" data-form="team-add">
      <header class="panel__head"><h2>새 팀 만들기</h2><button type="button" class="link-btn" data-act="team-form" data-v="0">닫기</button></header>
      <label class="field"><span class="field__label">팀 이름 <em>필수</em></span>
        <input name="name" maxlength="16" required data-keep="team-name"></label>
      <fieldset class="field"><legend class="field__label">팀 펫</legend>
        <div class="pet-pick">${C.pets.map((p) => {
          const taken = used.includes(p.id);
          const owner = taken ? HB.store.state.teams.find((t) => t.pet === p.id) : null;
          return `<label class="pet-pick__item${taken ? ' is-taken' : ''}" style="--c:${p.color}">
            <input type="radio" name="pet" value="${p.id}"${taken ? ' disabled' : ''}${firstFree && p.id === firstFree.id ? ' checked' : ''}>
            ${UI.pet(p.id)}<b>${esc(p.name)}</b>${owner ? `<small>${esc(owner.name)}</small>` : ''}</label>`;
        }).join('')}</div></fieldset>
      <label class="field"><span class="field__label">시작할 아이디어</span>
        <select name="ideaId"><option value="">나중에 정하기</option>
          ${free.map((i) => `<option value="${i.id}"${i.id === ideaId ? ' selected' : ''}>${esc(i.title)} (공감 ${i.likes.length})</option>`).join('')}
        </select></label>
      <p class="muted">퍼실 ${S.freeFacil() ? esc(S.freeFacil().name) + ' 선생님이' : '한 명이'} 함께해요.</p>
      <div class="form-actions"><button class="btn btn--primary">팀 만들기</button></div>
    </form>`;
  }

  function card(team, me) {
    const pet = S.pet(team.pet);
    const idea = team.ideaId ? S.idea(team.ideaId) : null;
    const left = S.seatsLeft(team);
    const canJoin = me && me.role === 'participant' && !S.teamOf(me.id) && left > 0;
    return `<article class="team-card" style="--c:${pet.color}">
      <a class="team-card__top" href="#/team/${team.id}">
        ${UI.pet(team.pet, 'pet--md')}
        <span class="team-card__name"><span class="eyebrow">팀 ${S.teamNo(team)}</span><b>${esc(team.name)}</b>
          <small>${idea ? esc(idea.title) : '아이디어 정하는 중'}</small></span>
        ${UI.lv(team)}
      </a>
      ${UI.party(team)}
      <footer class="team-card__foot">
        ${UI.stepBar(team)}
        <span class="muted">${left > 0 ? `빈자리 ${left}` : '자리 다 참'}</span>
        ${canJoin ? `<button class="btn btn--sm btn--primary" data-act="team-join" data-id="${team.id}">들어가기</button>` : `<a class="btn btn--sm" href="#/team/${team.id}">팀 공간</a>`}
      </footer>
    </article>`;
  }

  HB.views.teams = () => {
    const me = HB.me();
    const st = HB.store.state;
    const waiting = S.unassigned();
    const placed = st.people.filter((p) => p.role === 'participant').length - waiting.length;
    if (V.newTeam && !canCreate(me)) V.newTeam = false;
    return `<section class="page-head">
        <div><h1>팀</h1><p class="muted">${st.teams.length}팀 / 최대 ${C.team.maxTeams}팀 · 팀 있는 참가자 ${placed}명 · 팀 찾는 사람 ${waiting.length}명</p></div>
        ${canCreate(me) && !V.newTeam ? '<button class="btn btn--primary" data-act="team-form" data-v="1">새 팀 만들기</button>' : ''}
      </section>
      ${status(me)}
      ${V.newTeam ? newTeamForm(me) : ''}
      ${st.teams.length ? `<div class="team-grid">${st.teams.map((t) => card(t, me)).join('')}</div>` : UI.empty('아직 만들어진 팀이 없어요.')}
      <section class="panel">
        <header class="panel__head"><h2>팀 찾는 사람 ${waiting.length}</h2></header>
        ${waiting.length ? `<ul class="people">${waiting.map((p) => `<li>${UI.who(p)}</li>`).join('')}</ul>` : '<p class="muted">모든 참가자가 팀에 들어갔어요.</p>'}
      </section>`;
  };

  HB.on({
    'team-form': async (el) => { V.newTeam = el.dataset.v === '1'; HB.render(); },
    'team-join': async (el) => {
      const t = S.team(el.dataset.id);
      if (await A.joinTeam(el.dataset.id)) { U.toast(`${t.name} 팀에 들어갔어요.`); HB.go('#/team/' + t.id); }
    },
  });

  HB.onForm({
    'team-add': async (f, d) => {
      const id = await A.createTeam(d);
      if (!id) return;
      HB.clearDrafts('team-');
      V.newTeam = false;
      U.toast('팀을 만들었어요.');
      V.editing = 'plan';
      V.keepEdit = true;
      HB.go('#/team/' + id + '/plan');
    },
  });
})();
