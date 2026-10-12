/* 홈: 행사 표지, 큰 버튼 두 개, 팀 진행판, 최근 과정, 공감 많은 아이디어, 참여 순서 */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const esc = U.esc;

  function hero(me, myTeam) {
    const phase = S.phase();
    const order = C.phases.map((p) => p.key);
    const now = order.indexOf(phase);
    const n = S.counts();
    const when = [C.event.dateLabel, C.event.place].filter(Boolean).map(esc).join('<br>');
    const party = myTeam
      ? UI.body(me, 'hero__me') + UI.pet(myTeam.pet, 'hero__pet')
      : UI.pet('koalbot', 'hero__pet') + UI.pet('monggeul', 'hero__pet') + UI.pet('droni', 'hero__pet');
    return `<section class="hero">
      <div class="hero__text">
        <span class="eyebrow">${esc(C.event.host)}</span>
        <h1><b class="hero__brand">G-DEAL</b><em>교사 해커톤</em></h1>
        ${when ? `<p class="hero__when">${when}</p>` : ''}
        <div class="hero__party" aria-hidden="true">${party}</div>
      </div>
      <div class="screen">
        <div class="screen__top"><span>진행 단계</span><b>지금 ${esc(C.phases[now].name)}</b></div>
        <ol class="phases">${C.phases.map((p, i) => `
          <li class="${i < now ? 'is-done' : i === now ? 'is-now' : ''}">
            <b>${esc(p.name)}</b>${p.when ? `<small>${esc(p.when)}</small>` : ''}
            <ul>${p.does.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
          </li>`).join('')}
        </ol>
        <dl class="screen__stats">
          <div><dt>아이디어</dt><dd>${n.ideas}</dd></div>
          <div><dt>팀</dt><dd>${n.teams}</dd></div>
          <div><dt>과정 기록</dt><dd>${n.logs}</dd></div>
          <div><dt>공개 작품</dt><dd>${n.published}</dd></div>
        </dl>
      </div>
    </section>`;
  }

  function actions(me, myTeam) {
    let a, b;
    if (!me) {
      a = ['<button class="big big--green" data-act="join">', '참여하기', '</button>'];
      b = ['<a class="big big--gold" href="#/archive">', '아카이브 보기', '</a>'];
    } else if (myTeam) {
      a = [`<a class="big big--green" href="#/team/${myTeam.id}">`, `우리 팀 공간${UI.pet(myTeam.pet, 'big__pet')}`, '</a>'];
      b = [`<a class="big big--gold" href="#/team/${myTeam.id}/log">`, '과정 기록하기', '</a>'];
    } else {
      a = ['<a class="big big--green" href="#/ideas/new">', '아이디어 올리기', '</a>'];
      b = ['<a class="big big--gold" href="#/teams">', '팀 찾기', '</a>'];
    }
    return `<nav class="big-actions">${a[0]}<strong>${a[1]}</strong>${a[2]}${b[0]}<strong>${b[1]}</strong>${b[2]}</nav>
      <p class="home-guide"><a class="link-btn" href="#/guide">처음이면 사용법 보기 →</a></p>`;
  }

  function board() {
    const teams = HB.store.state.teams;
    if (!teams.length) return '';
    return `<section class="panel">
      <header class="panel__head"><h2>팀 진행판</h2><a class="link-btn" href="#/teams">팀 전체</a></header>
      <div class="tracks">
        <div class="tracks__legend" aria-hidden="true"><span></span><span class="track__nodes">${C.steps.map((s) => `<small>${esc(s.name)}</small>`).join('')}</span><span></span></div>
        ${teams.map((t) => {
          const steps = S.teamSteps(t);
          const lv = steps.filter((s) => s.done).length;
          return `<a class="track" href="#/team/${t.id}" style="--c:${S.pet(t.pet).color};--lv:${lv}">
            <span class="track__team">${UI.pet(t.pet, 'pet--xs')}<b>${esc(t.name)}</b></span>
            <span class="track__nodes">${steps.map((s) => `<i class="${s.done ? 'on' : ''}" title="${esc(s.name)}"></i>`).join('')}
              <span class="track__runner">${UI.pet(t.pet)}</span></span>
            <span class="track__lv">Lv.${lv}</span>
          </a>`;
        }).join('')}
      </div>
    </section>`;
  }

  function recent() {
    const logs = S.feed().slice(0, 4);
    return `<section class="panel">
      <header class="panel__head"><h2>최근 과정</h2><a class="link-btn" href="#/feed">전체 보기</a></header>
      ${logs.length ? `<ul class="mini-list">${logs.map((l) => {
        const t = S.team(l.team);
        return `<li><a href="#/team/${t.id}/log">
          ${UI.pet(t.pet, 'pet--xs')}
          <span><span class="mini-list__meta"><b>${esc(t.name)}</b>${UI.kind(l.kind)}<span class="muted">${U.ago(l.at)}</span></span>
          <span class="clamp-2">${esc(l.text)}</span></span></a></li>`;
      }).join('')}</ul>` : UI.empty('아직 올라온 과정이 없어요.')}
    </section>`;
  }

  function topIdeas() {
    const ideas = S.ideas({ sort: 'like' }).slice(0, 4);
    return `<section class="panel">
      <header class="panel__head"><h2>공감 많은 아이디어</h2><a class="link-btn" href="#/ideas">전체 보기</a></header>
      ${ideas.length ? `<ul class="mini-list">${ideas.map((i) => {
        const teams = S.ideaTeams(i.id);
        return `<li><a href="#/ideas/${i.id}">
          <span class="mini-list__count">${i.likes.length}</span>
          <span><span class="mini-list__meta"><b>${esc(i.title)}</b>${teams.map((t) => `<span class="muted">${esc(t.name)}</span>`).join('')}</span>
          <span class="clamp-2">${esc(i.problem)}</span></span></a></li>`;
      }).join('')}</ul>` : UI.empty('아직 올라온 아이디어가 없어요.')}
    </section>`;
  }

  function howTo() {
    return `<details class="disclosure">
      <summary><b>참여 순서</b><span>팀 진행판 여섯 칸이 켜지는 조건</span></summary>
      <ol class="howto-steps">${C.steps.map((s, i) => `<li><span>${i + 1}</span><b>${esc(s.name)}</b><small>${esc(s.need)}</small></li>`).join('')}</ol>
      <p class="home-guide"><a class="link-btn" href="#/guide">사용법 전체 보기 →</a></p>
    </details>`;
  }

  HB.views.home = () => {
    const me = HB.me();
    const myTeam = me ? S.teamOf(me.id) : null;
    return hero(me, myTeam) + actions(me, myTeam) + board()
      + `<div class="cols">${recent()}${topIdeas()}</div>` + howTo();
  };
})();
