/* 운영: 운영진(역할 '운영진')에게만 보이는 화면. 탭 다섯 개.
   주소: #/admin(현황), #/admin/people, #/admin/teams, #/admin/posts, #/admin/settings
   팀·글 고치기는 js/ops.js의 admin* 규칙, 사람·코드·설정·예시는 HB.admin(초안: js/store.js, 앱스 스크립트: 서버 admin())
   어느 쪽이든 서버가 운영진인지 다시 확인한다. */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const A = HB.actions;
  const V = HB.view;
  const esc = U.esc;

  const TABS = [
    { key: '', name: '현황' },
    { key: 'people', name: '사람' },
    { key: 'teams', name: '팀' },
    { key: 'posts', name: '글' },
    { key: 'settings', name: '설정' },
  ];
  const ROLE = { participant: '참가자', facil: '퍼실', staff: '운영진' };
  const AVATARS = Array.from({ length: 20 }, (_, i) => 'a' + String(i + 1).padStart(2, '0'));

  V.adm = { people: null, loading: false, edit: null, showCodes: false, role: '', postKind: '', sheetUrl: '' };

  /* ---------- 사람 목록(이메일·코드 포함)은 운영진이 사람·설정 탭을 열 때만 받는다 ---------- */
  function load(force) {
    if (V.adm.loading || (V.adm.people && !force)) return;
    V.adm.loading = true;
    HB.admin.people().then((r) => {
      V.adm.loading = false;
      V.adm.people = r.people;
      if (r.sheetUrl) V.adm.sheetUrl = r.sheetUrl;
      HB.render();
    }, (e) => { V.adm.loading = false; U.toast(e.message); });
  }
  function take(promise) {
    return promise.then((r) => {
      V.adm.people = r.people;
      if (r.sheetUrl) V.adm.sheetUrl = r.sheetUrl;
      if (r.note) U.toast(r.note);
      HB.render();
      return true;
    }, (e) => { U.toast(e.message); return false; });
  }
  const loading = () => `<div class="empty">${UI.pet('koalbot', 'pet--sm')}<p>불러오는 중</p></div>`;

  /* ---------- 현황 ---------- */
  function overview() {
    const st = HB.store.state;
    const n = S.counts();
    const parts = st.people.filter((p) => p.role === 'participant');
    const facils = st.people.filter((p) => p.role === 'facil');
    const now = U.now();
    const quiet = C.team.quietDays * 86400000;
    const teams = st.teams.slice().sort((a, b) => S.level(a) - S.level(b) || S.lastActivity(a) - S.lastActivity(b));
    const waiting = S.unassigned();
    const open = st.teams.filter((t) => S.seatsLeft(t) > 0);
    const stuck = S.feed({ kind: 'stuck' }).filter((l) => !l.comments.length);
    return `<div class="adm-stats">
        <div><b>${parts.length}</b><span>참가자</span><small>팀 있음 ${parts.length - waiting.length}</small></div>
        <div><b>${facils.length}</b><span>퍼실</span><small>팀 없음 ${facils.filter((p) => !S.teamOf(p.id)).length}</small></div>
        <div><b>${n.teams}</b><span>팀</span><small>최대 ${C.team.maxTeams}</small></div>
        <div><b>${n.ideas}</b><span>아이디어</span><small>팀 없는 것 ${st.ideas.filter((i) => !S.ideaTeams(i.id).length).length}</small></div>
        <div><b>${n.logs}</b><span>과정 기록</span><small>막힘 ${S.feed({ kind: 'stuck' }).length}</small></div>
        <div><b>${n.published}</b><span>공개 작품</span><small>작품 올림 ${st.teams.filter((t) => S.workReady(t)).length}</small></div>
      </div>
      <section class="panel">
        <header class="panel__head"><h2>팀 진행</h2><span class="muted">진행이 느린 팀부터</span></header>
        ${teams.length ? `<div class="adm-list">${teams.map((t) => {
          const last = S.lastActivity(t);
          const next = S.nextStep(t);
          const f = t.facil ? S.person(t.facil) : null;
          return `<a class="adm-row adm-row--team" href="#/team/${t.id}" style="--c:${S.pet(t.pet).color}">
            <span class="adm-cell adm-cell--main">${UI.pet(t.pet, 'pet--xs')}<b>${esc(t.name)}</b></span>
            <span class="adm-cell">참가자 ${t.members.length}/${C.team.seats}</span>
            <span class="adm-cell">${f ? '퍼실 ' + esc(f.name) : '<em class="warn">퍼실 없음</em>'}</span>
            <span class="adm-cell">${UI.lv(t)}</span>
            <span class="adm-cell${now - last > quiet ? ' warn' : ''}">마지막 ${U.ago(last)}</span>
            <span class="adm-cell muted">${next ? '다음 ' + esc(next.name) : '모두 마침'}</span>
          </a>`;
        }).join('')}</div>` : '<p class="muted">아직 팀이 없어요.</p>'}
      </section>
      <div class="cols">
        <section class="panel">
          <header class="panel__head"><h2>팀 없는 참가자 ${waiting.length}</h2></header>
          ${waiting.length ? `<ul class="adm-list">${waiting.map((p) => `<li class="adm-row">
            <span class="adm-cell adm-cell--main">${UI.who(p)}</span>
            <select id="place-${p.id}" aria-label="${esc(p.name)} 넣을 팀">${open.map((t) => `<option value="${t.id}">${esc(t.name)} (빈자리 ${S.seatsLeft(t)})</option>`).join('')}</select>
            <button class="btn btn--sm" data-act="adm-place" data-pid="${p.id}"${open.length ? '' : ' disabled'}>넣기</button>
          </li>`).join('')}</ul>` : '<p class="muted">모든 참가자가 팀에 있어요.</p>'}
        </section>
        <section class="panel">
          <header class="panel__head"><h2>댓글 없는 막힘 ${stuck.length}</h2><a class="link-btn" href="#/feed">과정 보기</a></header>
          ${stuck.length ? `<ul class="mini-list">${stuck.slice(0, 6).map((l) => {
            const t = S.team(l.team);
            return `<li><a href="#/team/${t.id}/log">${UI.pet(t.pet, 'pet--xs')}<span><span class="mini-list__meta"><b>${esc(t.name)}</b><span class="muted">${U.ago(l.at)}</span></span><span class="clamp-2">${esc(l.text)}</span></span></a></li>`;
          }).join('')}</ul>` : '<p class="muted">없어요.</p>'}
        </section>
      </div>`;
  }

  /* ---------- 사람 ---------- */
  function personForm(p) {
    const isNew = !p.id;
    return `<form class="panel form-card" data-form="adm-person">
      <header class="panel__head"><h2>${isNew ? '사람 추가' : esc(p.name) + ' 고치기'}</h2><button type="button" class="link-btn" data-act="adm-edit" data-id="">닫기</button></header>
      <input type="hidden" name="id" value="${esc(p.id || '')}">
      <div class="adm-form">
        <label class="field"><span class="field__label">이름 <em>필수</em></span><input name="name" maxlength="20" required value="${esc(p.name || '')}"></label>
        <label class="field"><span class="field__label">역할</span><select name="role">${Object.keys(ROLE).map((k) => `<option value="${k}"${p.role === k ? ' selected' : ''}>${ROLE[k]}</option>`).join('')}</select></label>
        <label class="field"><span class="field__label">학교</span><input name="school" maxlength="30" value="${esc(p.school || '')}"></label>
        <label class="field"><span class="field__label">학교급</span><select name="level">${C.schoolLevels.map((l) => `<option${p.level === l ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
        <label class="field"><span class="field__label">맡은 일</span><input name="job" maxlength="20" value="${esc(p.job || '')}" placeholder="예: 5학년 담임"></label>
        <label class="field"><span class="field__label">이메일</span><input type="email" name="email" maxlength="100" value="${esc(p.email || '')}"><small class="field__hint">로그인할 때 쓰는 주소. 바꾸면 코드 메일을 다시 보내요</small></label>
      </div>
      <fieldset class="field"><legend class="field__label">아바타</legend>
        <div class="ava-pick">${AVATARS.map((a) => `<label><input type="radio" name="avatar" value="${a}"${(p.avatar || 'a01') === a ? ' checked' : ''}>${UI.ava({ name: a, avatar: a })}</label>`).join('')}</div></fieldset>
      <div class="form-actions"><button type="button" class="btn" data-act="adm-edit" data-id="">취소</button><button class="btn btn--primary">저장</button></div>
    </form>`;
  }

  function peopleTab(me) {
    load();
    if (!V.adm.people) return loading();
    const all = V.adm.people;
    const list = all.filter((p) => !V.adm.role || p.role === V.adm.role);
    const noCode = all.filter((p) => p.email && !p.code).length;
    const toMail = all.filter((p) => p.email && p.code && !p.mailedAt).length;
    const noEmail = all.filter((p) => !p.email).length;
    return `<div class="adm-bar">
        <button class="btn btn--primary btn--sm" data-act="adm-edit" data-id="new">사람 추가</button>
        <button class="btn btn--sm" data-act="adm-codes"${noCode ? '' : ' disabled'}>코드 만들기 ${noCode}</button>
        <button class="btn btn--sm" data-act="adm-mail" data-n="${toMail}"${toMail ? '' : ' disabled'}>코드 메일 보내기 ${toMail}</button>
        <button class="btn btn--sm btn--ghost" data-act="adm-showcodes">${V.adm.showCodes ? '코드 가리기' : '코드 보기'}</button>
        <button class="link-btn" data-act="adm-reload">새로 받기</button>
      </div>
      ${noEmail ? `<p class="muted">이메일이 없는 사람 ${noEmail}명은 로그인할 수 없어요.</p>` : ''}
      ${V.adm.edit ? personForm(V.adm.edit) : ''}
      <div class="chips">${UI.chipBtn('adm-role', '', `모두 ${all.length}`, !V.adm.role)}${Object.keys(ROLE).map((k) => UI.chipBtn('adm-role', k, `${ROLE[k]} ${all.filter((p) => p.role === k).length}`, V.adm.role === k)).join('')}</div>
      <div class="adm-list">${list.map((p) => {
        const t = S.teamOf(p.id);
        return `<div class="adm-row adm-row--person">
          <span class="adm-cell adm-cell--main">${UI.who(p)}</span>
          <span class="adm-cell"><span class="tag">${ROLE[p.role] || p.role}</span>${t ? ' ' + esc(t.name) : ''}</span>
          <span class="adm-cell adm-cell--mail">${p.email ? esc(p.email) : '<em class="warn">이메일 없음</em>'}</span>
          <span class="adm-cell adm-code">${p.code ? (V.adm.showCodes ? esc(p.code) : '●●●●●●') : '<span class="muted">코드 없음</span>'}</span>
          <span class="adm-cell muted">${p.mailedAt ? U.date(p.mailedAt) + ' 보냄' : ''}</span>
          <span class="adm-cell adm-cell--act">
            <button class="link-btn" data-act="adm-edit" data-id="${p.id}">고치기</button>
            ${p.email && p.id !== me.id ? `<button class="link-btn" data-act="adm-code" data-id="${p.id}">새 코드</button>` : ''}
            ${p.id !== me.id ? `<button class="link-btn link-btn--danger" data-act="adm-person-del" data-id="${p.id}">지우기</button>` : ''}
          </span>
        </div>`;
      }).join('')}</div>`;
  }

  /* ---------- 팀 ---------- */
  function teamsTab() {
    const st = HB.store.state;
    const waiting = S.unassigned();
    const facils = st.people.filter((p) => p.role === 'facil');
    if (!st.teams.length) return UI.empty('아직 팀이 없어요. 참가자가 팀 화면에서 만들어요.');
    return `<div class="adm-teams">${st.teams.map((t) => {
      const logs = S.teamLogs(t.id).length;
      return `<section class="panel adm-team" style="--c:${S.pet(t.pet).color}">
        <form class="adm-team__head" data-form="adm-team" data-id="${t.id}">
          ${UI.pet(t.pet, 'pet--sm')}
          <input name="name" maxlength="16" value="${esc(t.name)}" aria-label="팀 이름" required>
          <select name="pet" aria-label="펫">${C.pets.filter((p) => p.id === t.pet || !st.teams.some((x) => x.pet === p.id)).map((p) => `<option value="${p.id}"${p.id === t.pet ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
          <button class="btn btn--sm">저장</button>
        </form>
        <label class="adm-line"><span>퍼실</span><select data-change="adm-facil" data-id="${t.id}">
          <option value="">없음</option>${facils.map((f) => {
            const other = S.teamOf(f.id);
            return `<option value="${f.id}"${t.facil === f.id ? ' selected' : ''}>${esc(f.name)}${other && other.id !== t.id ? ' (' + esc(other.name) + ')' : ''}</option>`;
          }).join('')}</select></label>
        <div class="adm-line"><span>참가자 ${t.members.length}/${C.team.seats}</span>
          <span class="adm-members">${t.members.map((m) => `<span class="adm-member">${UI.ava(S.person(m), 'ava--xs')}${esc(S.person(m).name)}<button class="link-btn link-btn--quiet" data-act="adm-out" data-pid="${m}" aria-label="${esc(S.person(m).name)} 빼기">×</button></span>`).join('')}</span></div>
        <div class="adm-line"><span>넣기</span>
          <select id="in-${t.id}" aria-label="${esc(t.name)}에 넣을 참가자"${waiting.length ? '' : ' disabled'}>${waiting.map((p) => `<option value="${p.id}">${esc(p.name)} · ${esc(p.school)}</option>`).join('') || '<option>팀 없는 참가자가 없어요</option>'}</select>
          <button class="btn btn--sm" data-act="adm-in" data-id="${t.id}"${waiting.length ? '' : ' disabled'}>넣기</button></div>
        <footer class="adm-team__foot"><a class="link-btn" href="#/team/${t.id}">팀 공간</a><span class="muted">기록 ${logs} · 의견 ${t.notes.length}</span>
          <button class="link-btn link-btn--danger" data-act="adm-team-del" data-id="${t.id}">팀 지우기</button></footer>
      </section>`;
    }).join('')}</div>`;
  }

  /* ---------- 글 ---------- */
  function allPosts() {
    const st = HB.store.state;
    const out = [];
    st.ideas.forEach((i) => {
      out.push({ kind: 'idea', id: i.id, by: i.by, at: i.at, where: '아이디어', text: i.title + ' · ' + i.problem, href: '#/ideas/' + i.id });
      i.comments.forEach((c) => out.push({ kind: 'comment', id: c.id, by: c.by, at: c.at, where: '아이디어 「' + i.title + '」', text: c.text, href: '#/ideas/' + i.id }));
    });
    st.logs.forEach((l) => {
      const t = S.team(l.team);
      const tn = t ? t.name : '';
      out.push({ kind: 'log', id: l.id, by: l.by, at: l.at, where: tn + ' 과정', text: l.text, href: '#/team/' + l.team + '/log' });
      l.comments.forEach((c) => out.push({ kind: 'comment', id: c.id, by: c.by, at: c.at, where: tn + ' 과정 댓글', text: c.text, href: '#/team/' + l.team + '/log' }));
    });
    st.teams.forEach((t) => t.notes.forEach((n) => out.push({ kind: 'note', id: n.id, by: n.by, at: n.at, where: t.name + ' 의견', text: n.text, href: '#/team/' + t.id + '/notes' })));
    return out.sort((a, b) => b.at - a.at);
  }
  const KIND = { idea: '아이디어', log: '기록', comment: '댓글', note: '의견' };

  function postsTab() {
    const posts = allPosts();
    const list = posts.filter((p) => !V.adm.postKind || p.kind === V.adm.postKind);
    return `<div class="chips">${UI.chipBtn('adm-kind', '', `모두 ${posts.length}`, !V.adm.postKind)}${Object.keys(KIND).map((k) => UI.chipBtn('adm-kind', k, `${KIND[k]} ${posts.filter((p) => p.kind === k).length}`, V.adm.postKind === k)).join('')}</div>
      <p class="muted">지운 글은 되돌릴 수 없어요. 기록을 지우면 그 기록의 댓글도 같이 지워져요.</p>
      ${list.length ? `<div class="adm-list">${list.slice(0, 150).map((p) => `<div class="adm-row adm-row--post">
        <span class="adm-cell"><span class="tag">${KIND[p.kind]}</span></span>
        <span class="adm-cell adm-cell--main"><a href="${p.href}"><b>${esc(S.person(p.by).name)}</b> <span class="muted">${esc(p.where)} · ${U.ago(p.at)}</span></a><span class="clamp-2">${esc(p.text)}</span></span>
        <span class="adm-cell adm-cell--act"><button class="link-btn link-btn--danger" data-act="adm-del" data-kind="${p.kind}" data-id="${p.id}">지우기</button></span>
      </div>`).join('')}</div>` : UI.empty('글이 없어요.')}`;
  }

  /* ---------- 설정 ---------- */
  function settingsTab() {
    if (HB.mode === 'gas') load();
    const ro = !!(HB.store.state.settings && HB.store.state.settings.readonly);
    const url = HB.mode === 'gas' ? HB.store.url : location.href.split('#')[0];
    return `<section class="panel narrow">
        <header class="panel__head"><h2>글쓰기</h2><span class="tag${ro ? ' tag--warn' : ''}">${ro ? '닫힘' : '열림'}</span></header>
        <p class="muted">닫으면 운영진 말고는 아무도 글·공감·응원을 쓸 수 없어요. 행사가 끝나고 아카이브만 보여 줄 때 닫아요.</p>
        <div class="btn-row"><button class="btn${ro ? ' btn--primary' : ''}" data-act="adm-readonly">${ro ? '글쓰기 열기' : '글쓰기 닫기'}</button></div>
      </section>
      <section class="panel narrow">
        <header class="panel__head"><h2>작품집 내려받기</h2></header>
        <p class="muted">공개한 작품의 제작 의도·사용법·과정·의견과 사진을 한 파일로 모아요. HTML은 로그인 없이 열거나 홈페이지에 올릴 수 있고, JSON은 홈페이지로 자료를 옮길 때 써요. 개인 명단과 로그인 정보는 포함하지 않고 팀 이름으로 표시해요.</p>
        <div class="btn-row"><button class="btn btn--primary" data-act="adm-export" data-v="html">작품집 HTML</button><button class="btn" data-act="adm-export" data-v="json">자료 JSON</button></div>
      </section>
      <section class="panel narrow">
        <header class="panel__head"><h2>예시 데이터</h2></header>
        <p class="muted">예시 팀 10개, 아이디어 16개, 기록 49개가 들어가요(12월 30일 시점). 넣으면 지금 아이디어·팀·기록·댓글·의견은 지워지고, 직접 등록한 사람(이메일이 있는 사람)은 남아요. 실제로 쓰기 전에 '예시 지우기'를 눌러요.</p>
        <div class="btn-row"><button class="btn" data-act="adm-sample" data-v="load">예시 넣기</button><button class="btn" data-act="adm-sample" data-v="clear">예시 지우기</button></div>
      </section>
      <section class="panel narrow">
        <header class="panel__head"><h2>주소</h2></header>
        <p><b>모두에게 주는 주소</b></p>
        <p class="adm-url">${esc(url)}</p>
        <div class="btn-row"><button class="btn btn--sm" data-act="adm-copy" data-v="${esc(url)}">주소 복사</button>
          ${V.adm.sheetUrl ? `<a class="btn btn--sm" href="${esc(V.adm.sheetUrl)}" target="_blank" rel="noopener">운영 시트 열기 ↗</a>` : ''}</div>
        ${HB.mode === 'local' ? '<p class="muted">초안판이라 데이터가 이 브라우저 안에만 있어요.</p>' : ''}
      </section>`;
  }

  HB.views.admin = (r) => {
    const me = HB.me();
    if (!me || me.role !== 'staff') {
      return UI.empty('운영진만 볼 수 있어요.', me ? '' : '<button class="btn btn--primary" data-act="join">참여하기</button>');
    }
    const tab = TABS.some((t) => t.key === r.id) ? r.id : '';
    const body = { '': overview, people: peopleTab, teams: teamsTab, posts: postsTab, settings: settingsTab }[tab](me);
    return `<section class="page-head"><div><h1>운영</h1><p class="muted">운영진 ${esc(me.name)}</p></div></section>
      <nav class="tabs" aria-label="운영">${TABS.map((t) =>
        `<a href="#/admin${t.key ? '/' + t.key : ''}" class="${t.key === tab ? 'is-on' : ''}"${t.key === tab ? ' aria-current="page"' : ''}>${t.name}</a>`).join('')}</nav>
      <div class="tab-body">${body}</div>`;
  };

  HB.on({
    'adm-export': async (el) => {
      el.disabled = true;
      const label = el.textContent;
      el.textContent = '사진을 모으는 중…';
      try { const n = await HB.archiveExport.download(el.dataset.v); U.toast('공개 작품 ' + n + '개를 내려받았어요.'); }
      catch (e) { U.toast(e.message); }
      finally { el.disabled = false; el.textContent = label; }
    },
    'adm-reload': async () => load(true),
    'adm-showcodes': async () => { V.adm.showCodes = !V.adm.showCodes; HB.render(); },
    'adm-role': async (el) => { V.adm.role = el.dataset.v; HB.render(); },
    'adm-kind': async (el) => { V.adm.postKind = el.dataset.v; HB.render(); },
    'adm-edit': async (el) => {
      const id = el.dataset.id;
      V.adm.edit = !id ? null : id === 'new'
        ? { role: 'participant', level: C.schoolLevels[0], avatar: 'a01' }
        : Object.assign({}, (V.adm.people || []).find((p) => p.id === id));
      HB.render();
      window.scrollTo(0, 0);
    },
    'adm-codes': async () => take(HB.admin.makeCodes()),
    'adm-mail': async (el) => {
      if (!(await HB.confirm(`${el.dataset.n}명에게 참여 코드 메일을 보낼까요? 코드를 받은 적 없는 사람에게만 가요.`, '보내기'))) return;
      return take(HB.admin.mailCodes());
    },
    'adm-code': async (el) => {
      const p = V.adm.people.find((x) => x.id === el.dataset.id);
      if (!(await HB.confirm(`${p.name} 선생님 코드를 새로 만들까요? 예전 코드로는 더 들어올 수 없어요.`, '새로 만들기'))) return;
      return take(HB.admin.newCode(p.id));
    },
    'adm-person-del': async (el) => {
      const p = V.adm.people.find((x) => x.id === el.dataset.id);
      if (!(await HB.confirm(`${p.name} 선생님을 지울까요? 팀에서도 빠지고, 쓴 글은 남아요.`, '지우기'))) return;
      return take(HB.admin.removePerson(p.id));
    },
    'adm-place': async (el) => {
      const sel = document.getElementById('place-' + el.dataset.pid);
      if (sel && await A.admin('adminMove', { pid: el.dataset.pid, teamId: sel.value })) U.toast('팀에 넣었어요.');
    },
    'adm-in': async (el) => {
      const sel = document.getElementById('in-' + el.dataset.id);
      if (sel && await A.admin('adminMove', { pid: sel.value, teamId: el.dataset.id })) U.toast('팀에 넣었어요.');
    },
    'adm-out': async (el) => {
      const p = S.person(el.dataset.pid);
      if (!(await HB.confirm(`${p.name} 선생님을 팀에서 뺄까요? 맡은 일 칸이 비워져요.`, '빼기'))) return;
      if (await A.admin('adminMove', { pid: p.id, teamId: '' })) U.toast('팀에서 뺐어요.');
    },
    'adm-team-del': async (el) => {
      const t = S.team(el.dataset.id);
      const n = S.teamLogs(t.id).length;
      if (!(await HB.confirm(`${t.name} 팀을 지울까요? 과정 기록 ${n}개와 의견도 같이 지워지고 되돌릴 수 없어요.`, '팀 지우기'))) return;
      if (await A.admin('adminRemoveTeam', { teamId: t.id })) U.toast('팀을 지웠어요.');
    },
    'adm-del': async (el) => {
      if (!(await HB.confirm('이 글을 지울까요? 되돌릴 수 없어요.', '지우기'))) return;
      if (await A.admin('adminRemove', { kind: el.dataset.kind, id: el.dataset.id })) U.toast('지웠어요.');
    },
    'adm-readonly': async () => {
      const ro = !!(HB.store.state.settings && HB.store.state.settings.readonly);
      if (!ro && !(await HB.confirm('글쓰기를 닫을까요? 운영진 말고는 아무도 쓸 수 없어요.', '닫기'))) return;
      return take(HB.admin.setReadonly(!ro));
    },
    'adm-sample': async (el) => {
      const isLoad = el.dataset.v === 'load';
      const msg = isLoad
        ? '예시 데이터를 넣을까요? 지금 아이디어·팀·기록·댓글·의견이 지워져요. 이메일이 있는 사람은 남아요.'
        : '예시 데이터를 지울까요? 아이디어·팀·기록·댓글·의견이 모두 지워지고, 이메일 없는 예시 사람도 지워져요.';
      if (!(await HB.confirm(msg, isLoad ? '예시 넣기' : '예시 지우기'))) return;
      return take(HB.admin.sample(el.dataset.v));
    },
    'adm-copy': async (el) => {
      const url = el.dataset.v;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(() => U.toast('주소를 복사했어요.'), () => U.toast(url));
    },
  });

  HB.onChange({
    'adm-facil': async (el) => { if (await A.admin('adminSetFacil', { teamId: el.dataset.id, pid: el.value })) U.toast('퍼실을 바꿨어요.'); },
  });

  HB.onForm({
    'adm-person': async (f, d) => {
      return take(HB.admin.savePerson(d)).then((ok) => { if (ok) { V.adm.edit = null; HB.render(); U.toast('저장했어요.'); } });
    },
    'adm-team': async (f, d) => { if (await A.admin('adminEditTeam', { teamId: f.dataset.id, name: d.name, pet: d.pet })) U.toast('팀을 고쳤어요.'); },
  });
})();
