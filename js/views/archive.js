/* 아카이브: 공개한 작품 모음과 작품 한 편 보기(제작 의도, 사용법, 만든 과정, 만든 사람).
   주소: #/archive, #/archive/팀아이디
   운영이 끝나면 이 두 화면을 지딜 홈페이지에 붙인다. */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const V = HB.view;
  const esc = U.esc;

  const cover = (team) => UI.cover(team);

  function card(team) {
    const people = team.members.map((m) => S.person(m));
    return `<a class="arc-card" href="#/archive/${team.id}" style="--c:${S.pet(team.pet).color}">
      ${cover(team)}
      <div class="arc-card__body">
        <span class="eyebrow">${esc(team.name)}</span>
        <h3>${esc(team.work.title)}</h3>
        <p class="clamp-2">${esc(team.work.oneline)}</p>
        <div class="tags"><span class="tag tag--level">${esc(team.level)}</span>${UI.tags(team.tags)}</div>
        <div class="stack">${people.map((p) => UI.ava(p, 'ava--sm')).join('')}<span class="muted">${U.date(team.publishedAt)}</span></div>
      </div>
    </a>`;
  }

  function list() {
    const items = S.archive({ level: V.arcLevel, tag: V.arcTag, q: V.arcQ });
    const total = HB.store.state.teams.filter((t) => t.published).length;
    return `<section class="page-head">
        <div><h1>아카이브</h1><p class="muted">공개 작품 ${total}개</p></div>
        <input class="search" type="search" placeholder="작품 이름, 소개로 찾기" value="${esc(V.arcQ)}" data-keep="arc-q" data-input="arc-q" aria-label="작품 찾기">
      </section>
      <div class="filters">
        <div class="chips">${UI.chipBtn('arc-level', '', '모든 학교급', !V.arcLevel)}${C.schoolLevels.map((l) => UI.chipBtn('arc-level', l, esc(l), V.arcLevel === l)).join('')}</div>
        <div class="chips">${UI.chipBtn('arc-tag', '', '모든 태그', !V.arcTag)}${C.tags.map((t) => UI.chipBtn('arc-tag', t, esc(t), V.arcTag === t)).join('')}</div>
      </div>
      ${items.length ? `<div class="arc-grid">${items.map(card).join('')}</div>`
        : UI.empty(total ? '조건에 맞는 작품이 없어요.' : '아직 공개한 작품이 없어요. 팀이 작품 탭에서 공개하면 여기에 올라와요.')}`;
  }

  function detail(id) {
    const team = S.team(id);
    const back = '<a class="back" href="#/archive">← 아카이브</a>';
    if (!team) return back + UI.empty('없는 작품이에요.');
    if (!team.published) return back + UI.empty('아직 공개하지 않은 작품이에요.', `<a class="btn" href="#/team/${team.id}">팀 공간 보기</a>`);
    const w = team.work;
    const steps = String(w.howto || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const logs = S.teamLogs(team.id).slice().reverse();
    const people = team.members.map((m) => S.person(m));
    const facil = team.facil ? S.person(team.facil) : null;
    return `${back}
      <article class="work">
        <header class="work__hero" style="--c:${S.pet(team.pet).color}">
          ${cover(team)}
          <div class="work__head">
            <span class="eyebrow">${esc(team.name)} · ${U.date(team.publishedAt)} 공개</span>
            <h1>${esc(w.title)}</h1>
            <p class="work__one">${esc(w.oneline)}</p>
            <div class="tags"><span class="tag tag--level">${esc(team.level)}</span>${UI.tags(team.tags)}</div>
            <div class="btn-row">
              <a class="btn btn--primary" href="${esc(w.link)}" target="_blank" rel="noopener">작품 열기 ↗</a>
              ${w.source ? `<a class="btn" href="${esc(w.source)}" target="_blank" rel="noopener">코드·자료 ↗</a>` : ''}
              <button class="btn btn--ghost" data-act="copy-link">주소 복사</button>
            </div>
          </div>
        </header>

        <section class="work__sec">
          <h2>제작 의도</h2>
          <div class="intent intent--row">${C.intentFields.map((f) => `<div class="intent__item"><h3>${esc(f.label)}</h3><p>${U.text(team.intent[f.key])}</p></div>`).join('')}</div>
        </section>

        ${steps.length ? `<section class="work__sec"><h2>사용법</h2><ol class="howto">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>` : ''}

        <section class="work__sec">
          <h2>만든 과정 <span class="muted">${logs.length}</span></h2>
          <ol class="timeline">${logs.map((l) => `<li style="--k:${S.kind(l.kind).color}">
            <span class="timeline__when">${U.date(l.at)}</span>
            <div><p class="timeline__meta">${UI.kind(l.kind)}<span class="muted">${esc(S.person(l.by).name)}</span></p><p>${U.text(l.text)}</p>
            ${l.image ? UI.img(l.image, 'log__img') : ''}</div></li>`).join('')}</ol>
        </section>

        <section class="work__sec">
          <h2>만든 사람</h2>
          <ul class="people">${people.map((p) => `<li>${UI.who(p)}${team.roles[p.id] ? `<span class="tag">${esc(team.roles[p.id])}</span>` : ''}</li>`).join('')}
            ${facil ? `<li>${UI.who(facil)}<span class="tag">퍼실</span></li>` : ''}</ul>
        </section>

        ${team.notes.length ? `<section class="work__sec"><h2>받은 의견 <span class="muted">${team.notes.length}</span></h2>${UI.comments(team.notes)}</section>` : ''}
      </article>`;
  }

  HB.views.archive = (r) => (r.id ? detail(r.id) : list());

  HB.on({
    'arc-level': (el) => { V.arcLevel = el.dataset.v; HB.render(); },
    'arc-tag': (el) => { V.arcTag = el.dataset.v; HB.render(); },
    'copy-link': () => {
      const url = HB.shareUrl();
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(() => U.toast('주소를 복사했어요.'), () => U.toast(url));
    },
  });

  HB.onChange({
    'arc-q': (el) => { V.arcQ = el.value; HB.render(); },
  });
})();
