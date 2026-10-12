/* 과정: 모든 팀의 과정 기록을 시간 순으로. 팀과 종류로 거른다 */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const V = HB.view;
  const esc = U.esc;

  HB.views.feed = () => {
    const st = HB.store.state;
    const logs = S.feed({ team: V.feedTeam, kind: V.feedKind });
    const stuck = S.feed({ kind: 'stuck' }).filter((l) => !l.comments.length);
    return `<section class="page-head">
        <div><h1>과정</h1><p class="muted">${st.teams.length}팀 · 기록 ${st.logs.length}개${stuck.length ? ` · 댓글 없는 막힘 ${stuck.length}개` : ''}</p></div>
      </section>
      <div class="filters">
        <div class="chips chips--teams">${UI.chipBtn('feed-team', '', '모든 팀', !V.feedTeam)}${st.teams.map((t) =>
          `<button class="chip chip--team${V.feedTeam === t.id ? ' is-on' : ''}" style="--c:${S.pet(t.pet).color}" data-act="feed-team" data-v="${t.id}" aria-pressed="${V.feedTeam === t.id}">${UI.pet(t.pet, 'pet--xs')}${esc(t.name)}</button>`).join('')}</div>
        <div class="chips">${UI.chipBtn('feed-kind', '', '모든 종류', !V.feedKind)}${C.logKinds.map((k) =>
          `<button class="chip chip--kind${V.feedKind === k.key ? ' is-on' : ''}" style="--k:${k.color}" data-act="feed-kind" data-v="${k.key}" aria-pressed="${V.feedKind === k.key}">${esc(k.name)}</button>`).join('')}</div>
      </div>
      <div class="log-col">${logs.length ? logs.map((l) => UI.logCard(l, { showTeam: true })).join('') : UI.empty('조건에 맞는 기록이 없어요.')}</div>`;
  };

  HB.on({
    'feed-team': (el) => { V.feedTeam = el.dataset.v; HB.render(); },
    'feed-kind': (el) => { V.feedKind = el.dataset.v; HB.render(); },
  });
})();
