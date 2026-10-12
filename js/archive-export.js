/* 공개 작품집. 운영 데이터와 분리된 HTML/JSON으로 내려받는다. */
(function () {
  const str = (v) => String(v == null ? '' : v);
  const esc = (v) => str(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const url = (v) => {
    try { const u = new URL(str(v)); return /^https?:$/.test(u.protocol) ? u.href : ''; }
    catch (e) { return ''; }
  };
  const inlineImage = (v) => /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(str(v)) ? v : '';
  const text = (v) => esc(v).replace(/\n/g, '<br>');
  const fields = (obj, list) => Object.fromEntries(list.map((f) => [f.key, str((obj || {})[f.key])]));
  function build(state, images, now) {
    const C = HB.config;
    return {
      format: 'gdeal-public-archive', version: 1,
      title: C.event.title, dateLabel: C.event.dateLabel || '', exportedAt: new Date(now || Date.now()).toISOString(),
      works: state.teams.filter((t) => t.published).map((t) => ({
        id: t.id, team: str(t.name), level: str(t.level), tags: (t.tags || []).map(str), publishedAt: t.publishedAt,
        intent: fields(t.intent, C.intentFields),
        work: Object.assign(fields(t.work, C.workFields), {
          link: url(t.work.link), source: url(t.work.source),
          cover: inlineImage((images || {})[t.work.cover] || t.work.cover),
        }),
        process: state.logs.filter((l) => l.team === t.id).slice().sort((a, b) => a.at - b.at).map((l) => ({
          at: l.at, kind: (C.logKinds.find((k) => k.key === l.kind) || { name: '기록' }).name,
          text: str(l.text), link: url(l.link), image: inlineImage((images || {})[l.image] || l.image),
        })),
        feedback: (t.notes || []).map((n) => ({ at: n.at, text: str(n.text) })),
      })),
    };
  }
  const image = (src, alt) => src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : '';
  const link = (href, label) => href ? `<a class="button" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
  const date = (v) => Number.isFinite(Number(v)) && v ? new Date(Number(v)).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '';
  function html(data) {
    const works = data.works.map((t, i) => `<article id="work-${i}">
      <header><p class="eyebrow">${esc(t.team)} · ${esc(t.level)} · ${esc(date(t.publishedAt))}</p>
      <h2>${esc(t.work.title)}</h2><p class="intro">${text(t.work.oneline)}</p>
      <p>${t.tags.map((v) => `<span class="tag">${esc(v)}</span>`).join(' ')}</p>
      ${image(t.work.cover, t.work.title + ' 대표 그림')}
      <p class="buttons">${link(t.work.link, '작품 열기')}${link(t.work.source, '코드·자료')}</p></header>
      <section><h3>제작 의도</h3>${HB.config.intentFields.map((f) => `<h4>${esc(f.label)}</h4><p>${text(t.intent[f.key])}</p>`).join('')}</section>
      ${t.work.howto ? `<section><h3>사용법</h3><ol>${t.work.howto.split('\n').filter((s) => s.trim()).map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>` : ''}
      <section><h3>만든 과정 · ${t.process.length}</h3>${t.process.map((l) => `<div class="record"><p class="eyebrow">${esc(date(l.at))} · ${esc(l.kind)}</p><p>${text(l.text)}</p>${image(l.image, '제작 과정 사진')}${link(l.link, '관련 자료')}</div>`).join('') || '<p>아직 기록이 없습니다.</p>'}</section>
      ${t.feedback.length ? `<section><h3>받은 의견</h3>${t.feedback.map((n) => `<blockquote>${text(n.text)}</blockquote>`).join('')}</section>` : ''}
      <p><a href="#top">작품 목록으로 ↑</a></p></article>`).join('');
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${esc(data.title)} 작품집</title><style>
      *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:#20392a;background:#f5f8ed;font:16px/1.75 system-ui,"Malgun Gothic",sans-serif}main{max-width:960px;margin:auto;padding:48px 20px}h1{font-size:clamp(28px,5vw,44px);line-height:1.25}h2{font-size:30px;line-height:1.35}h3{margin-top:0}h4{margin-bottom:4px}p{overflow-wrap:anywhere}a{color:#215c39}article{background:white;border:1px solid #cee0d0;border-radius:20px;padding:32px;margin:32px 0;scroll-margin-top:20px}section{border-top:1px solid #e5ece3;margin-top:24px;padding-top:24px}img{max-width:100%;max-height:620px;object-fit:contain;border-radius:12px}.eyebrow{font-size:14px;color:#4c6e55}.intro{font-size:20px}.tag{border-radius:20px;background:#e6f1de;padding:4px 12px;font-size:14px}.buttons{display:flex;gap:12px;flex-wrap:wrap}.button{display:inline-block;border:1px solid #66ae7d;border-radius:8px;padding:8px 14px;text-decoration:none}.record{border-left:3px solid #66ae7d;padding-left:20px;margin:24px 0}blockquote{background:#f3f7ed;margin:12px 0;padding:16px;border-radius:8px}nav ul{padding-left:24px}nav li{margin:8px 0}@media(max-width:600px){main{padding:24px 12px}article{padding:20px}h2{font-size:25px}}@media print{body{background:white}article{break-before:page;border:0}a{color:inherit}nav,.buttons{display:none}}
      </style></head><body><main id="top"><header><p class="eyebrow">G-DEAL · 교실에서 시작한 아이디어</p><h1>${esc(data.title)} 작품집</h1><p>공개 작품 ${data.works.length}개${data.dateLabel ? ' · ' + esc(data.dateLabel) : ''}</p></header>
      <nav aria-label="작품 목록"><ul>${data.works.map((t, i) => `<li><a href="#work-${i}">${esc(t.work.title)} · ${esc(t.team)}</a></li>`).join('')}</ul></nav>
      ${works}<footer>팀 단위로 기록한 공개 작품집 · ${esc(data.exportedAt.slice(0, 10))} 내려받음</footer></main></body></html>`;
  }
  async function prepare() {
    if (!HB.me() || HB.me().role !== 'staff') throw new Error('운영진만 작품집을 내려받을 수 있어요.');
    if (HB.store.pending) throw new Error('저장이 끝난 뒤 내려받아 주세요.');
    const state = JSON.parse(JSON.stringify(HB.store.state));
    const published = new Set(state.teams.filter((t) => t.published).map((t) => t.id));
    if (!published.size) throw new Error('먼저 작품을 아카이브에 공개해 주세요.');
    const refs = new Set(state.teams.filter((t) => published.has(t.id)).map((t) => t.work.cover).concat(state.logs.filter((l) => published.has(l.team)).map((l) => l.image)).filter(Boolean));
    const images = {};
    for (const ref of refs) {
      if (inlineImage(ref)) images[ref] = ref;
      else if (str(ref).startsWith('img:')) images[ref] = inlineImage(await HB.store.image(ref.slice(4)));
      if (!images[ref]) throw new Error('작품 사진을 받지 못했어요. 다시 시도해 주세요.');
    }
    return build(state, images);
  }
  async function download(format) {
    const data = await prepare();
    const isHtml = format === 'html';
    const blob = new Blob([isHtml ? html(data) : JSON.stringify(data, null, 2)], { type: isHtml ? 'text/html;charset=utf-8' : 'application/json;charset=utf-8' });
    const href = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = href; a.download = 'gdeal-archive-' + data.exportedAt.slice(0, 10) + (isHtml ? '.html' : '.json');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 60000);
    return data.works.length;
  }
  HB.archiveExport = { build, html, prepare, download };
})();
