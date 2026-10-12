/* 팀 공간: 팀 머리(펫, 사람, 여섯 단계)와 탭 다섯 개(계획, 과정, 제작 의도, 작품, 의견).
   주소: #/team/아이디/탭  (탭: plan | log | intent | work | notes, 없으면 log)
   고치기는 그 팀 사람만, 보기와 응원·댓글·의견은 모두가 한다. */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const A = HB.actions;
  const V = HB.view;
  const esc = U.esc;

  const TABS = [
    { key: 'plan', name: '계획' },
    { key: 'log', name: '과정' },
    { key: 'intent', name: '제작 의도' },
    { key: 'work', name: '작품' },
    { key: 'notes', name: '의견' },
  ];

  const blank = (s) => (String(s || '').trim() ? U.text(s) : '<span class="muted">아직 안 적었어요.</span>');

  function head(team, me, edit) {
    const pet = S.pet(team.pet);
    const idea = team.ideaId ? S.idea(team.ideaId) : null;
    const steps = S.teamSteps(team);
    const next = steps.find((s) => !s.done);
    const isMember = me && team.members.includes(me.id);
    const canJoin = me && me.role === 'participant' && !S.teamOf(me.id) && S.seatsLeft(team) > 0;
    return `<section class="team-hero" style="--c:${pet.color}">
      <div class="team-hero__pet">${UI.pet(team.pet)}${UI.lv(team)}</div>
      <div class="team-hero__main">
        <span class="eyebrow">팀 ${S.teamNo(team)} · ${esc(pet.name)}</span>
        <h1>${esc(team.name)}</h1>
        <p class="team-hero__idea">${idea ? `아이디어 <a href="#/ideas/${idea.id}">${esc(idea.title)}</a>` : '<span class="muted">아이디어 정하는 중</span>'}</p>
        ${UI.party(team)}
        <div class="team-hero__btns">
          ${canJoin ? `<button class="btn btn--sm btn--primary" data-act="team-join" data-id="${team.id}">들어가기</button>` : ''}
          ${team.published ? `<a class="btn btn--sm" href="#/archive/${team.id}">아카이브에서 보기</a>` : ''}
          ${isMember ? `<button class="link-btn link-btn--quiet" data-act="team-leave" data-id="${team.id}">팀에서 나가기</button>` : ''}
        </div>
      </div>
      <div class="team-hero__steps">
        <ol class="steps">${steps.map((s) => `<li class="${s.done ? 'on' : ''}"><i></i><b>${esc(s.name)}</b><small>${esc(s.now)}</small></li>`).join('')}</ol>
        <p class="next">${next ? `다음 단계 <b>${esc(next.name)}</b> · ${esc(next.need)}` : '여섯 단계를 모두 마쳤어요.'}</p>
      </div>
    </section>`;
  }

  function tabs(team, tab) {
    const logN = S.teamLogs(team.id).length;
    const count = { log: logN, notes: team.notes.length };
    return `<nav class="tabs" aria-label="팀 공간">${TABS.map((t) =>
      `<a href="#/team/${team.id}/${t.key}" class="${t.key === tab ? 'is-on' : ''}"${t.key === tab ? ' aria-current="page"' : ''}>${t.name}${count[t.key] ? ` <span>${count[t.key]}</span>` : ''}</a>`).join('')}</nav>`;
  }

  /* ---------- 계획 ---------- */
  function planTab(team, edit) {
    const editing = edit && V.editing === 'plan';
    const main = editing
      ? `<form class="panel form-card" data-form="plan-save" data-id="${team.id}">
          <header class="panel__head"><h2>계획 고치기</h2></header>
          ${C.planFields.map((f) => UI.field(f, team.plan[f.key], { keep: 'plan-' + team.id + '-' })).join('')}
          <fieldset class="field"><legend class="field__label">맡은 일</legend>
            <div class="roles-edit">${team.members.map((m) => `<label>${UI.ava(S.person(m), 'ava--sm')}<span>${esc(S.person(m).name)}</span>
              <input name="role_${m}" maxlength="20" value="${esc(team.roles[m] || '')}" data-keep="plan-${team.id}-role_${m}"></label>`).join('')}</div></fieldset>
          <div class="form-actions"><button type="button" class="btn" data-act="edit" data-v="">취소</button><button class="btn btn--primary">저장</button></div>
        </form>`
      : `<section class="panel">
          <header class="panel__head"><h2>계획</h2>${edit ? '<button class="btn btn--sm" data-act="edit" data-v="plan">고치기</button>' : ''}</header>
          <dl class="plan">${C.planFields.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${blank(team.plan[f.key])}</dd></div>`).join('')}</dl>
          <h3 class="sub">맡은 일</h3>
          <ul class="roles">${team.members.map((m) => `<li>${UI.ava(S.person(m), 'ava--sm')}<b>${esc(S.person(m).name)}</b><span>${team.roles[m] ? esc(team.roles[m]) : '<span class="muted">-</span>'}</span></li>`).join('')}</ul>
        </section>`;

    const done = team.steps.filter((s) => s.done).length;
    const side = `<section class="panel">
      <header class="panel__head"><h2>일정</h2><span class="muted">${done}/${team.steps.length}</span></header>
      ${team.steps.length ? `<ul class="todo">${team.steps.map((s) => `<li class="${s.done ? 'is-done' : ''}">
        ${edit ? `<button class="todo__box" data-act="step-toggle" data-id="${s.id}" aria-pressed="${s.done}" aria-label="${esc(s.text)} ${s.done ? '끝냄' : '안 끝냄'}"></button>` : `<span class="todo__box" aria-hidden="true"></span>`}
        <span class="todo__text">${esc(s.text)}</span><small>${esc(s.due)}</small>
        ${edit ? `<button class="link-btn link-btn--quiet" data-act="step-del" data-id="${s.id}" aria-label="${esc(s.text)} 지우기">×</button>` : ''}</li>`).join('')}</ul>`
        : '<p class="muted">아직 일정이 없어요.</p>'}
      ${edit ? `<form class="inline-form" data-form="step-add" data-id="${team.id}">
        <input name="text" maxlength="30" placeholder="할 일" required data-keep="step-${team.id}-text">
        <input name="due" maxlength="10" placeholder="기한" class="w-short" data-keep="step-${team.id}-due">
        <button class="btn btn--sm">더하기</button></form>` : ''}
    </section>`;
    return `<div class="split">${main}<div>${side}${ideaBox(team)}</div></div>`;
  }

  function ideaBox(team) {
    const idea = team.ideaId ? S.idea(team.ideaId) : null;
    if (!idea) return '';
    return `<section class="panel panel--soft">
      <header class="panel__head"><h2>가져온 아이디어</h2><a class="link-btn" href="#/ideas/${idea.id}">보기</a></header>
      <p><b>${esc(idea.title)}</b></p><p class="muted clamp-3">${esc(idea.problem)}</p>
      <p class="muted">${esc(S.person(idea.by).name)} · 공감 ${idea.likes.length}</p>
    </section>`;
  }

  /* ---------- 과정 ---------- */
  function logTab(team, edit) {
    const logs = S.teamLogs(team.id);
    const composer = edit ? `<form class="panel composer" data-form="log-add" data-id="${team.id}">
        <div class="chips" role="radiogroup" aria-label="종류">${C.logKinds.map((k) =>
          `<button type="button" role="radio" class="chip chip--kind${V.logKind === k.key ? ' is-on' : ''}" style="--k:${k.color}" data-act="log-kind" data-v="${k.key}" aria-checked="${V.logKind === k.key}">${esc(k.name)}</button>`).join('')}</div>
        <textarea name="text" rows="3" maxlength="800" placeholder="한 일, 막힌 곳, 바꾼 것" required data-keep="log-${team.id}-text"></textarea>
        <div class="composer__row">
          <input name="link" type="url" placeholder="링크 https://" data-keep="log-${team.id}-link">
          <label class="btn btn--sm file-btn">그림<input type="file" accept="image/*" data-change="log-image"></label>
          <span class="composer__preview" id="logPreview">${V.logImage ? `<img src="${V.logImage}" alt=""><button type="button" class="link-btn link-btn--quiet" data-act="log-image-clear">빼기</button>` : ''}</span>
          <button class="btn btn--primary">올리기</button>
        </div>
      </form>` : '';
    return `<div class="split"><div class="log-col">${composer}
      ${logs.length ? logs.map((l) => UI.logCard(l)).join('') : UI.empty('아직 기록이 없어요.')}</div>
      <div>${stepsBox(team)}${othersStuck(team)}</div></div>`;
  }

  function stepsBox(team) {
    if (!team.steps.length) return '';
    return `<section class="panel">
      <header class="panel__head"><h2>일정</h2><a class="link-btn" href="#/team/${team.id}/plan">계획 보기</a></header>
      <ul class="todo">${team.steps.map((s) => `<li class="${s.done ? 'is-done' : ''}"><span class="todo__box" aria-hidden="true"></span>
        <span class="todo__text">${esc(s.text)}</span><small>${esc(s.due)}</small></li>`).join('')}</ul>
    </section>`;
  }

  // 다른 팀이 막혔는데 아직 댓글이 없는 기록
  function othersStuck(team) {
    const list = S.feed({ kind: 'stuck' }).filter((l) => l.team !== team.id && !l.comments.length).slice(0, 3);
    if (!list.length) return '';
    return `<section class="panel panel--soft">
      <header class="panel__head"><h2>댓글 없는 다른 팀 막힘</h2></header>
      <ul class="mini-list">${list.map((l) => {
        const t = S.team(l.team);
        return `<li><a href="#/team/${t.id}/log">${UI.pet(t.pet, 'pet--xs')}
          <span><span class="mini-list__meta"><b>${esc(t.name)}</b><span class="muted">${U.ago(l.at)}</span></span>
          <span class="clamp-2">${esc(l.text)}</span></span></a></li>`;
      }).join('')}</ul>
    </section>`;
  }

  /* ---------- 제작 의도 ---------- */
  function intentTab(team, edit) {
    if (edit && V.editing === 'intent') {
      return `<form class="panel form-card narrow" data-form="intent-save" data-id="${team.id}">
        <header class="panel__head"><h2>제작 의도 고치기</h2></header>
        ${C.intentFields.map((f) => UI.field(f, team.intent[f.key], { keep: 'intent-' + team.id + '-' })).join('')}
        <div class="form-actions"><button type="button" class="btn" data-act="edit" data-v="">취소</button><button class="btn btn--primary">저장</button></div>
      </form>`;
    }
    return `<section class="panel narrow">
      <header class="panel__head"><h2>제작 의도</h2>${edit ? '<button class="btn btn--sm" data-act="edit" data-v="intent">고치기</button>' : ''}</header>
      <div class="intent">${C.intentFields.map((f) => `<div class="intent__item"><h3>${esc(f.label)}</h3><p>${blank(team.intent[f.key])}</p></div>`).join('')}</div>
    </section>`;
  }

  /* ---------- 작품 ---------- */
  const cover = (team, cls) => UI.cover(team, cls);

  function workTab(team, edit) {
    const w = team.work || {};
    if (edit && V.editing === 'work') {
      const cv = V.workCover === null ? (w.cover || '') : V.workCover;
      return `<form class="panel form-card narrow" data-form="work-save" data-id="${team.id}">
        <header class="panel__head"><h2>작품 고치기</h2></header>
        ${C.workFields.map((f) => UI.field(f, w[f.key], { keep: 'work-' + team.id + '-' })).join('')}
        <div class="field"><span class="field__label">대표 그림</span><small class="field__hint">없으면 팀 펫이 들어가요. 학생 얼굴이 나온 그림은 올리지 않아요.</small>
          <div class="composer__row"><label class="btn btn--sm file-btn">그림 고르기<input type="file" accept="image/*" data-change="work-cover"></label>
          <span class="composer__preview" id="coverPreview">${cv ? `${UI.img(cv)}<button type="button" class="link-btn link-btn--quiet" data-act="work-cover-clear">빼기</button>` : ''}</span></div></div>
        <div class="form-actions"><button type="button" class="btn" data-act="edit" data-v="">취소</button><button class="btn btn--primary">저장</button></div>
      </form>`;
    }
    const has = S.workReady(team);
    const steps = String(w.howto || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const view = has ? `<section class="panel work-card">
        ${cover(team)}
        <div class="work-card__body">
          <header class="panel__head"><h2>${esc(w.title)}</h2>${edit ? '<button class="btn btn--sm" data-act="edit" data-v="work">고치기</button>' : ''}</header>
          <p class="work-card__one">${esc(w.oneline)}</p>
          <div class="btn-row"><a class="btn btn--primary" href="${esc(w.link)}" target="_blank" rel="noopener">작품 열기 ↗</a>
            ${w.source ? `<a class="btn" href="${esc(w.source)}" target="_blank" rel="noopener">코드·자료 ↗</a>` : ''}</div>
          ${steps.length ? `<h3 class="sub">사용법</h3><ol class="howto">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
        </div>
      </section>`
      : `<section class="panel">${UI.empty('아직 작품을 올리지 않았어요.', edit ? '<button class="btn btn--primary" data-act="edit" data-v="work">작품 올리기</button>' : '')}</section>`;

    const checks = [['작품 이름·소개·링크', S.workReady(team)], ['제작 의도 세 칸', S.intentReady(team)]];
    const pub = edit ? `<section class="panel publish${team.published ? ' is-on' : ''}">
        <header class="panel__head"><h2>아카이브 공개</h2></header>
        <ul class="checks">${checks.map(([n, ok]) => `<li class="${ok ? 'ok' : ''}">${esc(n)}</li>`).join('')}</ul>
        ${team.published
          ? `<p>${U.date(team.publishedAt)}에 공개했어요.</p><div class="btn-row"><a class="btn btn--sm" href="#/archive/${team.id}">아카이브에서 보기</a><button class="btn btn--sm" data-act="publish" data-v="0">공개 취소</button></div>`
          : `<button class="btn btn--primary" data-act="publish" data-v="1"${S.publishReady(team) ? '' : ' disabled'}>아카이브에 공개</button>`}
      </section>` : (team.published ? `<p class="center"><a class="btn" href="#/archive/${team.id}">아카이브에서 보기</a></p>` : '');
    return `<div class="split split--work">${view}<div>${pub}</div></div>`;
  }

  /* ---------- 의견 ---------- */
  function notesTab(team, me) {
    const notes = team.notes.slice().sort((a, b) => b.at - a.at);
    return `<section class="panel narrow">
      <header class="panel__head"><h2>의견 ${notes.length}</h2></header>
      ${me ? `<form class="inline-form" data-form="note-add" data-id="${team.id}">
        <input name="text" maxlength="300" placeholder="${esc(team.name)} 팀에 의견 남기기" required data-keep="note-${team.id}"><button class="btn btn--sm">올리기</button></form>` : ''}
      ${UI.comments(notes) || '<p class="muted">아직 의견이 없어요.</p>'}
    </section>`;
  }

  HB.views.team = (r) => {
    const team = S.team(r.id);
    if (!team) return `<a class="back" href="#/teams">← 팀</a>` + UI.empty('없는 팀이에요.');
    const me = HB.me();
    const edit = S.canEdit(team, me);
    const tab = TABS.some((t) => t.key === r.sub) ? r.sub : 'log';
    const body = { plan: planTab, log: logTab, intent: intentTab, work: workTab, notes: notesTab }[tab](team, tab === 'notes' ? me : edit);
    return `<a class="back" href="#/teams">← 팀</a>${head(team, me, edit)}${tabs(team, tab)}<div class="tab-body">${body}</div>`;
  };

  const teamFromRoute = () => S.team(HB.route().id);

  HB.on({
    'edit': async (el) => { V.editing = el.dataset.v; V.workCover = null; HB.render(); },
    'team-leave': async (el) => {
      const t = S.team(el.dataset.id);
      if (!(await HB.confirm(`${t.name} 팀에서 나갈까요? 맡은 일 칸이 비워져요.`, '나가기'))) return;
      if (await A.leaveTeam(t.id)) { U.toast('팀에서 나왔어요.'); HB.go('#/teams'); }
    },
    'step-toggle': async (el) => { const t = teamFromRoute(); if (t) await A.toggleStep(t.id, el.dataset.id); },
    'step-del': async (el) => { const t = teamFromRoute(); if (t) await A.removeStep(t.id, el.dataset.id); },
    'log-kind': async (el) => { V.logKind = el.dataset.v; HB.render(); },
    'log-image-clear': async () => { V.logImage = ''; HB.render(); },
    'log-del': async (el) => { if (await HB.confirm('이 기록을 지울까요?', '지우기')) await A.removeLog(el.dataset.id); },
    'cheer': async (el) => { await A.toggleCheer(el.dataset.id); },
    'comment-open': async (el) => {
      V.commentOpen[el.dataset.id] = !V.commentOpen[el.dataset.id];
      HB.render();
      const input = document.querySelector(`[data-form="log-comment"][data-id="${el.dataset.id}"] input`);
      if (input) input.focus();
    },
    'work-cover-clear': async () => { V.workCover = ''; HB.render(); },
    'publish': async (el) => {
      const t = teamFromRoute(); if (!t) return;
      if (await A.setPublished(t.id, el.dataset.v === '1')) U.toast(el.dataset.v === '1' ? '아카이브에 공개했어요.' : '공개를 취소했어요.');
    },
  });

  HB.onChange({
    'log-image': async (el) => {
      try { V.logImage = await U.shrinkImage(el.files[0]); HB.render(); } catch (e) { U.toast(e.message); }
    },
    'work-cover': async (el) => {
      try { V.workCover = await U.shrinkImage(el.files[0], 1200); HB.render(); } catch (e) { U.toast(e.message); }
    },
  });

  HB.onForm({
    'plan-save': async (f, d) => { if (await A.savePlan(f.dataset.id, d)) { HB.clearDrafts('plan-'); V.editing = ''; HB.render(); U.toast('계획을 저장했어요.'); } },
    'step-add': async (f, d) => { if (await A.addStep(f.dataset.id, d.text, d.due)) HB.clearDrafts('step-'); },
    'intent-save': async (f, d) => { if (await A.saveIntent(f.dataset.id, d)) { HB.clearDrafts('intent-'); V.editing = ''; HB.render(); U.toast('제작 의도를 저장했어요.'); } },
    'work-save': async (f, d) => {
      if (V.workCover !== null) d.cover = V.workCover;
      if (await A.saveWork(f.dataset.id, d)) { HB.clearDrafts('work-'); V.editing = ''; V.workCover = null; HB.render(); U.toast('작품을 저장했어요.'); }
    },
    'log-add': async (f, d) => {
      d.kind = V.logKind; d.image = V.logImage;
      if (await A.addLog(f.dataset.id, d)) { HB.clearDrafts('log-'); V.logImage = ''; HB.render(); U.toast('기록을 올렸어요.'); }
    },
    'log-comment': async (f, d) => { if (await A.commentLog(f.dataset.id, d.text)) { V.commentOpen[f.dataset.id] = false; HB.render(); } },
    'note-add': async (f, d) => { if (await A.addNote(f.dataset.id, d.text)) { HB.clearDrafts('note-'); U.toast('의견을 남겼어요.'); } },
  });
})();
