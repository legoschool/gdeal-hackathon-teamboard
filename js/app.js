/* 주소에 맞는 화면을 고르고 다시 그린다. 버튼·폼을 처리 함수에 잇고, 확인 창과 초안 도구를 그린다. */
(function () {
  const C = HB.config;
  const S = HB.select;
  const UI = HB.ui;
  const U = HB.util;
  const V = HB.view;
  const esc = U.esc;

  // #/팀/아이디/탭 → { name, id, sub }
  HB.route = () => {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const name = parts[0] && HB.views[parts[0]] ? parts[0] : 'home';
    return { name, id: parts[1] || '', sub: parts[2] || '' };
  };

  /* ---------- 다시 그려도 쓰던 글이 남게(data-keep) ---------- */
  HB.drafts = {};
  function capture() {
    document.querySelectorAll('[data-keep]').forEach((el) => { HB.drafts[el.dataset.keep] = el.value; });
    const a = document.activeElement;
    if (a && a.dataset && a.dataset.keep) {
      let s = null, e = null;
      try { s = a.selectionStart; e = a.selectionEnd; } catch (err) { /* 선택 범위가 없는 칸 */ }
      return { key: a.dataset.keep, s, e };
    }
    return null;
  }
  function restore(active) {
    const seen = {};
    document.querySelectorAll('[data-keep]').forEach((el) => {
      const k = el.dataset.keep;
      seen[k] = true;
      if (k in HB.drafts) el.value = HB.drafts[k];
    });
    Object.keys(HB.drafts).forEach((k) => { if (!seen[k]) delete HB.drafts[k]; });
    if (active) {
      const el = [...document.querySelectorAll('[data-keep]')].find((x) => x.dataset.keep === active.key);
      if (el) {
        el.focus({ preventScroll: true });
        try { if (active.s !== null) el.setSelectionRange(active.s, active.e); } catch (err) { /* 무시 */ }
      }
    }
  }
  // 올리기에 성공한 뒤 입력칸을 비운다
  HB.clearDrafts = (prefix) => {
    Object.keys(HB.drafts).forEach((k) => { if (k.startsWith(prefix)) delete HB.drafts[k]; });
    document.querySelectorAll('[data-keep]').forEach((el) => { if (el.dataset.keep.startsWith(prefix)) el.value = ''; });
  };

  /* ---------- 위쪽 막대와 아래 메뉴 ---------- */
  const ICON = {
    home: '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>',
    ideas: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    teams: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5"/>',
    feed: '<path d="M4 6h16M4 12h10M4 18h13"/>',
    archive: '<path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4"/>',
    guide: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/>',
    admin: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  };
  const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

  function dday() {
    const day = Date.parse(C.event.day + 'T00:00');
    const now = U.now();
    if (now < day) return 'D-' + Math.ceil((day - now) / 86400000);
    if (now < day + 86400000) return '오늘';
    return '끝남';
  }

  function header(r) {
    const me = HB.me();
    const team = me ? S.teamOf(me.id) : null;
    const active = (n) => r.name === n.route || (r.name === 'team' && n.route === 'teams');
    const nav = C.nav.filter((n) => !n.staff || (me && me.role === 'staff'));
    const links = (withIcon) => nav.map((n) =>
      `<a href="#/${n.route === 'home' ? '' : n.route}" class="${active(n) ? 'is-on' : ''}"${active(n) ? ' aria-current="page"' : ''}>${withIcon ? icon(n.route) : ''}<span>${esc(n.name)}</span></a>`).join('');
    document.getElementById('nav').innerHTML = links(false);
    document.getElementById('bottomNav').innerHTML = links(true);
    // 행사 날짜(config event.dateLabel)가 빈칸이면 D-day 칩을 비워 숨긴다
    document.getElementById('dayChip').innerHTML = C.event.dateLabel ? `<b>${dday()}</b> ${esc(C.event.dateLabel.split(' ').slice(0, 2).join(' '))}` : '';
    const role = me ? ({ facil: '퍼실', staff: '운영진' }[me.role] || '') : '';
    document.getElementById('meBox').innerHTML = me
      ? `<button class="me" data-act="me" title="${HB.mode === 'local' ? '보는 사람 바꾸기' : '로그아웃'}">${UI.ava(me, 'ava--sm')}<span><b>${esc(me.name)}</b><small>${team ? esc(team.name) : role || '팀 없음'}${team && role ? ' · ' + role : ''}</small></span></button>`
      : '<button class="btn btn--sm btn--primary" data-act="join">참여하기</button>';
  }

  /* ---------- 그리기 ---------- */
  HB.render = () => {
    const r = HB.route();
    if (!HB.store.state) {
      document.getElementById('view').innerHTML = `<div class="empty">${UI.pet('koalbot', 'pet--sm')}<p>불러오는 중</p></div>`;
      return;
    }
    const active = capture();
    header(r);
    document.getElementById('view').innerHTML = HB.views[r.name](r);
    restore(active);
    loadImages();
    drawDraft();
    lockForms();
    document.title = (r.name === 'home' ? '' : (C.nav.find((n) => n.route === r.name) || { name: '팀' }).name + ' · ') + C.event.title;
  };

  /* ---------- 확인 창 ---------- */
  HB.confirm = (msg, okLabel = '확인') => new Promise((resolve) => {
    const root = document.getElementById('modal');
    const before = document.activeElement;
    root.innerHTML = `<div class="modal"><div class="modal__box" role="alertdialog" aria-modal="true" aria-labelledby="modalMsg">
      <p id="modalMsg">${esc(msg)}</p>
      <div class="form-actions"><button class="btn" data-m="0">취소</button><button class="btn btn--primary" data-m="1">${esc(okLabel)}</button></div></div></div>`;
    const done = (v) => {
      root.innerHTML = '';
      document.removeEventListener('keydown', onKey);
      if (before && before.focus) before.focus({ preventScroll: true });
      resolve(v);
    };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    document.addEventListener('keydown', onKey);
    root.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => done(b.dataset.m === '1'); });
    root.querySelector('.modal').onclick = (e) => { if (e.target.classList.contains('modal')) done(false); };
    root.querySelector('[data-m="1"]').focus();
  });

  /* ---------- 올린 그림 받아 오기(앱스 스크립트판) ---------- */
  const imgCache = {};
  function loadImages() {
    document.querySelectorAll('img[data-img]:not([src])').forEach((el) => {
      const id = el.dataset.img;
      if (!imgCache[id]) imgCache[id] = HB.store.image(id);
      imgCache[id].then((src) => { el.src = src; }, () => { el.alt = '그림을 불러오지 못했어요'; });
    });
  }

  HB.shareUrl = () => (HB.mode === 'local' ? location.href : HB.store.url + location.hash);

  /* ---------- 참여하기(로그인) ---------- */
  HB.askLogin = () => {
    if (HB.mode === 'local') { U.toast('초안 도구에서 보는 사람을 고르세요.'); V.draftOpen = true; drawDraft(); return; }
    openLogin();
  };
  function closeLogin() {
    document.getElementById('modal').innerHTML = '';
    document.removeEventListener('keydown', escLogin);
  }
  function escLogin(e) { if (e.key === 'Escape') closeLogin(); }
  function openLogin() {
    const root = document.getElementById('modal');
    root.innerHTML = `<div class="modal"><form class="modal__box form-card" data-form="login" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
      <h2 id="loginTitle">참여하기</h2>
      <label class="field"><span class="field__label">신청한 이메일</span><input type="email" name="email" autocomplete="email" required></label>
      <label class="field"><span class="field__label">참여 코드 6자리</span><input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required></label>
      <p class="field__hint" id="loginMsg">참여 코드는 운영진이 메일로 보내요.</p>
      <div class="form-actions"><button type="button" class="btn" data-act="login-close">닫기</button><button class="btn btn--primary">들어가기</button></div>
    </form></div>`;
    root.querySelector('.modal').onclick = (e) => { if (e.target.classList.contains('modal')) closeLogin(); };
    document.addEventListener('keydown', escLogin);
    root.querySelector('input').focus();
  }
  HB.onForm({
    'login': (f, d) => {
      const msg = document.getElementById('loginMsg');
      const btn = f.querySelector('.btn--primary');
      btn.disabled = true;
      msg.textContent = '확인하는 중';
      return HB.login(d.email, d.code).then(() => {
        closeLogin();
        U.toast(`${HB.me().name} 선생님, 들어왔어요.`);
      }, (err) => {
        btn.disabled = false;
        msg.textContent = err.message;
        msg.classList.add('is-error');
      });
    },
  });

  /* ---------- 초안 도구(운영판에서는 그리지 않는다) ---------- */
  function drawDraft() {
    const el = document.getElementById('draft');
    if (HB.mode !== 'local') { el.innerHTML = ''; return; }
    const st = HB.store.state;
    const me = HB.me();
    const opt = (p, label) => `<option value="${p.id}"${me && me.id === p.id ? ' selected' : ''}>${esc(label)}</option>`;
    const withTeam = st.people.filter((p) => p.role === 'participant' && S.teamOf(p.id));
    el.innerHTML = `<button class="draft__btn" data-act="draft-toggle" aria-expanded="${!!V.draftOpen}">초안 도구</button>
      ${V.draftOpen ? `<div class="draft__panel">
        <header><b>초안 도구</b><button class="link-btn link-btn--quiet" data-act="draft-toggle" aria-label="닫기">×</button></header>
        <label class="field"><span class="field__label">보는 사람</span>
          <select data-change="draft-me">
            <option value="guest"${me ? '' : ' selected'}>로그인 안 함</option>
            <optgroup label="팀 있는 참가자">${withTeam.map((p) => opt(p, `${p.name} · ${S.teamOf(p.id).name}`)).join('')}</optgroup>
            <optgroup label="팀 없는 참가자">${S.unassigned().map((p) => opt(p, `${p.name} · ${p.school}`)).join('')}</optgroup>
            <optgroup label="퍼실">${st.people.filter((p) => p.role === 'facil').map((p) => opt(p, `${p.name}${S.teamOf(p.id) ? ' · ' + S.teamOf(p.id).name : ' · 팀 없음'}`)).join('')}</optgroup>
            <optgroup label="운영진">${st.people.filter((p) => p.role === 'staff').map((p) => opt(p, p.name)).join('')}</optgroup>
          </select></label>
        <div class="field"><span class="field__label">시점</span>
          <div class="chips">${C.snapshots.map((s) => UI.chipBtn('draft-snap', s.key, esc(s.name), st.snapshot === s.key)).join('')}</div>
          <small class="field__hint">시점을 바꾸면 예시 데이터를 그 날짜까지로 새로 만들어요. 고친 내용은 사라져요.</small></div>
        <button class="btn btn--sm" data-act="draft-reset">예시 데이터 처음으로</button>
      </div>` : ''}`;
  }

  HB.on({
    'join': () => HB.askLogin(),
    'login-close': () => closeLogin(),
    'me': async () => {
      if (HB.mode === 'local') { V.draftOpen = true; drawDraft(); const s = document.querySelector('[data-change="draft-me"]'); if (s) s.focus(); return; }
      if (await HB.confirm('로그아웃할까요?', '로그아웃')) HB.logout();
    },
    'draft-toggle': () => { V.draftOpen = !V.draftOpen; drawDraft(); },
    'draft-snap': async (el) => {
      if (!(await HB.confirm('예시 데이터를 이 시점으로 새로 만들까요? 지금까지 고친 내용은 사라져요.', '새로 만들기'))) return;
      HB.store.reset(el.dataset.v);
    },
    'draft-reset': async () => {
      if (!(await HB.confirm('예시 데이터를 처음으로 되돌릴까요? 지금까지 고친 내용은 사라져요.', '되돌리기'))) return;
      HB.store.reset(HB.store.state.snapshot);
    },
  });
  HB.onChange({ 'draft-me': (el) => { HB.setMe(el.value); } });

  /* ---------- 버튼·폼 연결 ---------- */
  const busyForms = new Set();
  const busyClicks = new Set();
  const formKey = (f) => f.dataset.form + ':' + (f.dataset.id || '');
  function lockForms() {
    document.querySelectorAll('form[data-form]').forEach((f) => {
      if (!busyForms.has(formKey(f))) return;
      f.setAttribute('aria-busy', 'true');
      f.querySelectorAll('input, textarea, select, button').forEach((el) => {
        if (!el.disabled) { el.dataset.saving = '1'; el.disabled = true; }
      });
    });
  }
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = HB.handlers.click[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    const key = el.dataset.act + ':' + (el.dataset.id || el.dataset.pid || '');
    if (busyClicks.has(key)) return;
    busyClicks.add(key);
    try { await fn(el, e); }
    catch (err) { U.toast(err.message || '처리하지 못했어요. 다시 시도해 주세요.'); }
    finally { busyClicks.delete(key); }
  });
  document.addEventListener('submit', async (e) => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    const fn = HB.handlers.form[f.dataset.form], key = formKey(f);
    if (!fn || busyForms.has(key)) return;
    const values = U.formData(f);
    busyForms.add(key); lockForms();
    try { await fn(f, values); }
    catch (err) { U.toast(err.message || '저장하지 못했어요. 입력을 확인해 주세요.'); }
    finally {
      busyForms.delete(key);
      document.querySelectorAll('form[data-form]').forEach((form) => {
        if (formKey(form) !== key) return;
        form.removeAttribute('aria-busy');
        form.querySelectorAll('[data-saving]').forEach((el) => { delete el.dataset.saving; el.disabled = false; });
      });
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (!el) return;
    const fn = HB.handlers.change[el.dataset.change];
    if (fn) fn(el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const fn = HB.handlers.change[el.dataset.input];
    if (fn) fn(el, e);
  });

  window.addEventListener('hashchange', () => {
    if (V.keepEdit) V.keepEdit = false; else V.editing = '';
    V.workCover = null;
    HB.render();
    window.scrollTo(0, 0);
    // 앱스 스크립트판: 바깥 주소창에도 #/팀/... 을 맞춰 둔다(주소를 그대로 나눌 수 있게)
    if (HB.mode === 'gas' && window.google && google.script && google.script.history) google.script.history.replace(null, {}, location.hash.slice(1));
  });

  HB.store.subscribe(() => HB.render());
  HB.render();
  Promise.resolve(HB.store.init()).then(() => HB.render(), (e) => {
    document.getElementById('view').innerHTML = `<div class="empty"><p>불러오지 못했어요. 새로고침해 주세요.</p><p class="muted">${esc(e && e.message || '')}</p></div>`;
  });
})();
