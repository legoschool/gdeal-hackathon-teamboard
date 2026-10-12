/* 이스케이프, 시간 표시, 아이디 만들기, 알림, 그림 줄이기 */
(function () {
  const U = {};

  U.esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // 줄바꿈을 살린 본문
  U.text = (s) => U.esc(s).replace(/\n/g, '<br>');

  U.uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // 지금 시각. 초안에서는 고른 시점(state.clock)에서 흐른 시간만큼 더한다
  U.now = () => {
    const s = HB.store && HB.store.state;
    if (!s || !s.clock) return Date.now();
    return s.clock + (Date.now() - (s.clockSetAt || Date.now()));
  };

  U.ago = (t) => {
    const d = (U.now() - t) / 1000;
    if (d < -60) return U.date(t);   // 예시 데이터처럼 앞날 날짜
    if (d < 60) return '방금';
    if (d < 3600) return Math.floor(d / 60) + '분 전';
    if (d < 86400) return Math.floor(d / 3600) + '시간 전';
    if (d < 86400 * 7) return Math.floor(d / 86400) + '일 전';
    return U.date(t);
  };

  U.date = (t) => {
    const d = new Date(t);
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  };

  U.dateTime = (t) => {
    const d = new Date(t);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return U.date(t) + ' ' + hh + ':' + mm;
  };

  U.toast = (msg) => {
    const root = document.getElementById('toast');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => el.classList.add('is-out'), 2200);
    setTimeout(() => el.remove(), 2600);
  };

  U.isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s || '').trim());

  // 펫·아바타 그림 주소. 앱스 스크립트판은 그림을 HB.assets에 data URL로 싣는다(tools/build_gas.py)
  HB.asset = (path) => (HB.assets && HB.assets[path]) || 'assets/' + path;

  // 그림 파일을 긴 변 900px JPEG로 줄여 data URL로 돌려준다(초안은 브라우저 저장소에 넣으므로)
  U.shrinkImage = (file, max = 900) => new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('그림 파일만 올릴 수 있어요.')); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const g = c.getContext('2d');
      g.fillStyle = '#fff';
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('그림을 읽지 못했어요.')); };
    img.src = url;
  });

  // 폼 값을 객체로
  U.formData = (form) => {
    const out = {};
    new FormData(form).forEach((v, k) => {
      if (k in out) out[k] = [].concat(out[k], v);
      else out[k] = typeof v === 'string' ? v.trim() : v;
    });
    return out;
  };

  HB.util = U;
})();
