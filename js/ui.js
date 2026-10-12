/* 여러 화면이 같이 쓰는 조각: 펫, 아바타, 단계 막대, 과정 기록 카드, 입력 칸 */
(function () {
  const C = HB.config;
  const S = HB.select;
  const U = HB.util;
  const esc = U.esc;
  const UI = {};

  // 화면에만 쓰는 상태(거르기, 열린 칸). 새로고침하면 처음으로 돌아간다
  HB.view = {
    ideaSort: 'new', ideaFilter: 'all', ideaTag: '', ideaForm: false,
    feedTeam: '', feedKind: '',
    arcLevel: '', arcTag: '', arcQ: '',
    editing: '',            // 'plan' | 'intent' | 'work' 중 지금 고치는 칸
    commentOpen: {},        // 기록 아이디 → 댓글 입력칸 열림
    logKind: 'make', logImage: '', workCover: null,
    newTeam: false,
  };

  UI.pet = (petId, cls = '') => {
    const p = S.pet(petId);
    return `<img class="pet ${cls}" src="${HB.asset('pets/' + p.id + '.png')}" alt="${esc(p.name)}" draggable="false">`;
  };

  // 얼굴만 보이는 동그란 아바타
  UI.ava = (person, cls = '') =>
    `<span class="ava ${cls}" title="${esc(person.name)}"><img src="${HB.asset('avatars/' + person.avatar + '.png')}" alt="" draggable="false"></span>`;

  // 서 있는 전신 아바타(팀 자리)
  UI.body = (person, cls = '') =>
    `<img class="body ${cls}" src="${HB.asset('avatars/' + person.avatar + '.png')}" alt="${esc(person.name)}" title="${esc(person.name)}" draggable="false">`;

  UI.who = (person, cls = '') => `
    <span class="who ${cls}">${UI.ava(person)}
      <span><b>${esc(person.name)}</b><small>${esc(person.school)}${person.job ? ' · ' + esc(person.job) : ''}</small></span>
    </span>`;

  // 올린 그림. 앱스 스크립트판은 'img:아이디'로 저장하고 화면이 그린 뒤 따로 받아 온다(js/app.js loadImages)
  UI.img = (src, cls = '') => /^img:/.test(src)
    ? `<img class="${cls}" data-img="${esc(src.slice(4))}" alt="">`
    : `<img class="${cls}" src="${esc(src)}" alt="">`;

  // 작품 대표 그림. 없으면 팀 펫
  UI.cover = (team, cls = '') => {
    const img = team.work && team.work.cover;
    return `<div class="cover ${cls}" style="--c:${S.pet(team.pet).color}">${img ? UI.img(img) : UI.pet(team.pet)}</div>`;
  };

  UI.lv = (team) => `<span class="lv" style="--c:${S.pet(team.pet).color}">Lv.${S.level(team)}</span>`;

  UI.stepBar = (team) => {
    const steps = S.teamSteps(team);
    return `<span class="stepbar" style="--c:${S.pet(team.pet).color}" aria-label="진행 ${steps.filter((s) => s.done).length}/${steps.length}">
      ${steps.map((s) => `<i class="${s.done ? 'on' : ''}" title="${esc(s.name)}"></i>`).join('')}</span>`;
  };

  UI.kind = (k) => {
    const x = S.kind(k);
    return `<span class="kind" style="--k:${x.color}">${esc(x.name)}</span>`;
  };

  UI.teamTag = (team) => team
    ? `<a class="team-tag" href="#/team/${team.id}" style="--c:${S.pet(team.pet).color}">${UI.pet(team.pet, 'pet--xs')}<b>${esc(team.name)}</b></a>`
    : '';

  UI.tags = (tags) => (tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');

  UI.empty = (msg, extra = '') => `<div class="empty">${UI.pet('h2o', 'pet--sm')}<p>${msg}</p>${extra}</div>`;

  UI.field = (f, value, opts = {}) => {
    const v = value == null ? '' : value;
    // opts.keep: 다시 그려도 쓰던 글이 남게 하는 이름 앞부분(js/app.js의 drafts)
    const attrs = `name="${f.key}" id="f_${f.key}"${f.max ? ` maxlength="${f.max}"` : ''}${opts.required && f.required ? ' required' : ''}${opts.keep ? ` data-keep="${opts.keep}${f.key}"` : ''}`;
    const input = f.rows > 1
      ? `<textarea ${attrs} rows="${f.rows}">${esc(v)}</textarea>`
      : `<input ${attrs} type="${f.type === 'url' ? 'url' : 'text'}" value="${esc(v)}"${f.type === 'url' ? ' placeholder="https://"' : ''}>`;
    return `<label class="field" for="f_${f.key}">
      <span class="field__label">${esc(f.label)}${f.required ? ' <em>필수</em>' : ''}</span>
      ${f.hint ? `<small class="field__hint">${esc(f.hint)}</small>` : ''}${input}</label>`;
  };

  UI.comments = (list) => list.length ? `<ul class="comments">${list.map((c) => {
    const p = S.person(c.by);
    const t = S.teamOf(c.by);
    return `<li>${UI.ava(p, 'ava--xs')}<div><p><b>${esc(p.name)}</b>${t ? `<span class="muted"> · ${esc(t.name)}</span>` : ''}<span class="muted"> · ${U.ago(c.at)}</span></p><p>${U.text(c.text)}</p></div></li>`;
  }).join('')}</ul>` : '';

  // 과정 기록 카드. showTeam이면 위에 팀 이름을 붙인다(전체 과정 화면)
  UI.logCard = (log, { showTeam = false } = {}) => {
    const me = HB.me();
    const by = S.person(log.by);
    const team = S.team(log.team);
    const cheered = me && log.cheers.includes(me.id);
    const canDel = me && (log.by === me.id || me.role === 'staff');
    const open = HB.view.commentOpen[log.id];
    return `<article class="log" id="log-${log.id}">
      ${showTeam ? `<div class="log__team">${UI.teamTag(team)}</div>` : ''}
      <header class="log__head">${UI.ava(by)}
        <div class="log__who"><b>${esc(by.name)}</b>${UI.kind(log.kind)}<span class="muted">${U.ago(log.at)}</span></div>
        ${canDel ? `<button class="link-btn link-btn--quiet" data-act="log-del" data-id="${log.id}">지우기</button>` : ''}
      </header>
      <p class="log__text">${U.text(log.text)}</p>
      ${log.image ? UI.img(log.image, 'log__img') : ''}
      ${log.link ? `<a class="log__link" href="${esc(log.link)}" target="_blank" rel="noopener">링크 열기 ↗</a>` : ''}
      <footer class="log__foot">
        <button class="cheer${cheered ? ' is-on' : ''}" data-act="cheer" data-id="${log.id}" aria-pressed="${cheered ? 'true' : 'false'}">응원 <b>${log.cheers.length}</b></button>
        <button class="link-btn" data-act="comment-open" data-id="${log.id}">댓글${log.comments.length ? ' ' + log.comments.length : ''}</button>
      </footer>
      ${UI.comments(log.comments)}
      ${open ? `<form class="inline-form" data-form="log-comment" data-id="${log.id}">
        <input name="text" maxlength="300" placeholder="댓글" autocomplete="off" required><button class="btn btn--sm">올리기</button></form>` : ''}
    </article>`;
  };

  // 팀 자리: 참가자 전신 + 빈자리 + 퍼실
  UI.party = (team) => {
    const seats = [];
    team.members.forEach((m) => seats.push(`<span class="seat">${UI.body(S.person(m))}<small>${esc(S.person(m).name)}</small></span>`));
    for (let i = team.members.length; i < C.team.seats; i++) seats.push('<span class="seat seat--empty"><i></i><small>빈자리</small></span>');
    const f = team.facil ? S.person(team.facil) : null;
    return `<div class="party">${seats.join('')}${f ? `<span class="seat seat--facil">${UI.body(f)}<small>${esc(f.name)} <em>퍼실</em></small></span>` : ''}</div>`;
  };

  UI.chipBtn = (act, value, label, on, extra = '') =>
    `<button class="chip${on ? ' is-on' : ''}" data-act="${act}" data-v="${esc(value)}" aria-pressed="${on ? 'true' : 'false'}"${extra}>${label}</button>`;

  HB.ui = UI;

  // 화면 파일이 자기 버튼·폼 처리 함수를 여기에 등록한다(js/app.js가 연결)
  HB.views = {};
  HB.handlers = { click: {}, form: {}, change: {} };
  HB.on = (map) => Object.assign(HB.handlers.click, map);
  HB.onForm = (map) => Object.assign(HB.handlers.form, map);
  HB.onChange = (map) => Object.assign(HB.handlers.change, map);
  HB.go = (hash) => { if (location.hash === hash) HB.render(); else location.hash = hash; };
})();
