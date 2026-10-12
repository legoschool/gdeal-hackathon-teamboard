/* 아이디어: 모두가 올리고 공감·댓글을 단다. 팀은 아이디어를 골라 시작한다.
   주소: #/ideas, #/ideas/new(올리기 칸 열림), #/ideas/아이디 */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const A = HB.actions;
  const V = HB.view;
  const esc = U.esc;

  function teamAction(idea, me) {
    const teams = S.ideaTeams(idea.id);
    if (teams.length) return teams.map((t) => UI.teamTag(t)).join('');
    if (!me) return '';
    const mine = S.teamOf(me.id);
    if (!mine && me.role === 'participant') return `<button class="btn btn--sm" data-act="team-from-idea" data-id="${idea.id}">이 아이디어로 팀 만들기</button>`;
    if (mine && !mine.ideaId && S.canEdit(mine, me)) return `<button class="btn btn--sm" data-act="idea-take" data-id="${idea.id}">우리 팀이 가져가기</button>`;
    return '<span class="muted">가져간 팀 없음</span>';
  }

  function card(idea, me, full) {
    const by = S.person(idea.by);
    const liked = me && idea.likes.includes(me.id);
    return `<article class="idea${full ? ' idea--full' : ''}">
      <header class="idea__head">${UI.who(by)}<span class="muted">${U.ago(idea.at)}</span></header>
      <h3>${full ? esc(idea.title) : `<a href="#/ideas/${idea.id}">${esc(idea.title)}</a>`}</h3>
      <p class="idea__problem${full ? '' : ' clamp-3'}">${U.text(idea.problem)}</p>
      <p class="idea__wish"><b>바라는 것</b>${U.text(idea.wish)}</p>
      <div class="tags"><span class="tag tag--level">${esc(idea.level)}</span>${UI.tags(idea.tags)}</div>
      <footer class="idea__foot">
        <button class="like${liked ? ' is-on' : ''}" data-act="like" data-id="${idea.id}" aria-pressed="${liked ? 'true' : 'false'}">공감 <b>${idea.likes.length}</b></button>
        ${full ? '' : `<a class="link-btn" href="#/ideas/${idea.id}">댓글${idea.comments.length ? ' ' + idea.comments.length : ''}</a>`}
        <span class="idea__teams">${teamAction(idea, me)}</span>
      </footer>
    </article>`;
  }

  function form(me) {
    if (!me) return `<div class="notice">아이디어는 참여한 사람이 올려요. <button class="link-btn" data-act="join">참여하기</button></div>`;
    return `<form class="panel form-card" data-form="idea-add">
      <header class="panel__head"><h2>아이디어 올리기</h2><button type="button" class="link-btn" data-act="idea-form" data-v="0">닫기</button></header>
      ${C.ideaFields.map((f) => UI.field(f, '', { required: true, keep: 'idea-' })).join('')}
      <div class="field-row">
        <label class="field"><span class="field__label">학교급</span>
          <select name="level">${C.schoolLevels.map((l) => `<option${l === me.level ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
        <fieldset class="field"><legend class="field__label">태그</legend>
          <div class="check-chips">${C.tags.map((t) => `<label class="check-chip"><input type="checkbox" name="tags" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('')}</div></fieldset>
      </div>
      <div class="form-actions"><button class="btn btn--primary">올리기</button></div>
    </form>`;
  }

  function list() {
    const me = HB.me();
    const ideas = S.ideas({ sort: V.ideaSort, filter: V.ideaFilter, tag: V.ideaTag });
    const all = HB.store.state.ideas;
    const taken = all.filter((i) => S.ideaTeams(i.id).length).length;
    return `<section class="page-head">
        <div><h1>아이디어</h1><p class="muted">${all.length}개 · 팀이 가져간 것 ${taken}개</p></div>
        ${V.ideaForm ? '' : '<button class="btn btn--primary" data-act="idea-form" data-v="1">아이디어 올리기</button>'}
      </section>
      ${V.ideaForm ? form(me) : ''}
      <div class="filters">
        <div class="chips">${UI.chipBtn('idea-sort', 'new', '최신순', V.ideaSort === 'new')}${UI.chipBtn('idea-sort', 'like', '공감순', V.ideaSort === 'like')}</div>
        <div class="chips">${UI.chipBtn('idea-filter', 'all', '전체', V.ideaFilter === 'all')}${UI.chipBtn('idea-filter', 'open', '팀 없는 것', V.ideaFilter === 'open')}${UI.chipBtn('idea-filter', 'taken', '팀이 가져간 것', V.ideaFilter === 'taken')}</div>
        <div class="chips">${UI.chipBtn('idea-tag', '', '모든 태그', !V.ideaTag)}${C.tags.map((t) => UI.chipBtn('idea-tag', t, esc(t), V.ideaTag === t)).join('')}</div>
      </div>
      ${ideas.length ? `<div class="idea-grid">${ideas.map((i) => card(i, me)).join('')}</div>` : UI.empty('조건에 맞는 아이디어가 없어요.')}`;
  }

  function detail(id) {
    const idea = S.idea(id);
    if (!idea) return `<a class="back" href="#/ideas">← 아이디어</a>` + UI.empty('없는 아이디어예요.');
    const me = HB.me();
    return `<a class="back" href="#/ideas">← 아이디어</a>
      <div class="detail-wrap">
        ${card(idea, me, true)}
        <section class="panel">
          <header class="panel__head"><h2>댓글 ${idea.comments.length}</h2></header>
          ${UI.comments(idea.comments) || '<p class="muted">아직 댓글이 없어요.</p>'}
          ${me ? `<form class="inline-form" data-form="idea-comment" data-id="${idea.id}">
            <input name="text" maxlength="300" placeholder="댓글" autocomplete="off" required data-keep="idea-comment-${idea.id}"><button class="btn btn--sm">올리기</button></form>` : ''}
        </section>
      </div>`;
  }

  HB.views.ideas = (r) => {
    if (r.id === 'new') { V.ideaForm = true; return list(); }
    if (r.id) return detail(r.id);
    return list();
  };

  HB.on({
    'idea-form': async (el) => { V.ideaForm = el.dataset.v === '1'; if (!V.ideaForm && location.hash === '#/ideas/new') HB.go('#/ideas'); else HB.render(); },
    'idea-sort': async (el) => { V.ideaSort = el.dataset.v; HB.render(); },
    'idea-filter': async (el) => { V.ideaFilter = el.dataset.v; HB.render(); },
    'idea-tag': async (el) => { V.ideaTag = el.dataset.v; HB.render(); },
    'like': async (el) => { await A.toggleLike(el.dataset.id); },
    'team-from-idea': async (el) => { V.newTeam = el.dataset.id; HB.go('#/teams'); },
    'idea-take': async (el) => {
      const me = HB.me();
      const t = me && S.teamOf(me.id);
      if (t && await A.takeIdea(t.id, el.dataset.id)) U.toast('우리 팀 아이디어로 정했어요.');
    },
  });

  HB.onForm({
    'idea-add': async (f, d) => {
      const id = await A.addIdea(d);
      if (!id) return;
      HB.clearDrafts('idea-');
      V.ideaForm = false;
      V.ideaSort = 'new'; V.ideaFilter = 'all'; V.ideaTag = '';
      U.toast('아이디어를 올렸어요.');
      HB.go('#/ideas');
    },
    'idea-comment': async (f, d) => { if (await A.commentIdea(f.dataset.id, d.text)) HB.clearDrafts('idea-comment-'); },
  });
})();
