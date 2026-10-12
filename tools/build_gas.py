# 앱스 스크립트판 만들기. teamboard 폴더에서 실행:
#   C:\Python314\python.exe tools\build_gas.py
#
# 만드는 것
#   gas/Code.js          서버. js/config.js + js/ops.js + js/sample-data.js + server/Code.js를 이 순서로 붙인다
#   gas/index.html       화면 한 장. CSS·JS·펫·아바타 그림(WebP data URL)을 모두 안에 넣는다
#   gas/appsscript.json  server/appsscript.json 복사
#   gas-preview/         구글에 올리기 전 이 컴퓨터에서 확인하는 판(가짜 시트, tools/gas-mock)
#
# 화면이나 서버를 고친 뒤에는 이 파일을 다시 돌리고 gas 폴더에서 clasp push 한다.
import base64
import io
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GAS = ROOT / 'gas'
PREVIEW = ROOT / 'gas-preview'

SERVER_PARTS = ['js/config.js', 'js/ops.js', 'js/sample-data.js', 'server/Code.js']
CLIENT_JS = [
    'js/config.js', 'js/util.js', 'js/ops.js', 'js/store-gas.js', 'js/select.js', 'js/actions.js', 'js/ui.js',
    'js/views/home.js', 'js/views/ideas.js', 'js/views/teams.js', 'js/views/team.js',
    'js/views/feed.js', 'js/archive-export.js', 'js/views/archive.js', 'js/views/guide.js', 'js/views/admin.js', 'js/app.js',
]
CSS = ['css/tokens.css', 'css/base.css', 'css/pages.css']


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def webp_data_url(path, height):
    im = Image.open(path).convert('RGBA')
    if im.height > height:
        im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=82, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def assets_script():
    items = {}
    for p in sorted((ROOT / 'assets' / 'pets').glob('*.png')):
        items['pets/' + p.name] = webp_data_url(p, 160)
    for p in sorted((ROOT / 'assets' / 'avatars').glob('*.png')):
        items['avatars/' + p.name] = webp_data_url(p, 144)
    lines = ',\n'.join(f'  {k!r}: {v!r}' for k, v in items.items())
    return 'var HB = typeof HB !== "undefined" ? HB : {};\nHB.assets = {\n' + lines + '\n};', len(items)


def script(code):
    return '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>'


# 앱스 스크립트는 화면을 내보낼 때 스크립트의 주석(//, /*)을 걷어 내는데, 백틱 문자열 안의
# 'https://', 'image/*'까지 주석으로 보고 잘라 먹는다(2026-10-05 배포에서 확인).
# 그래서 화면 스크립트는 base64 글자로 감싸 넣고 브라우저에서 풀어 차례로 실행한다.
# 일반 따옴표 문자열은 건드리지 않는다(펫 그림 base64에 '//'가 310번 있어도 멀쩡했다).
LOADER_JS = r"""(function () {
  var files = [
__FILES__
  ];
  var dec = new TextDecoder('utf-8');
  files.forEach(function (f) {
    var bin = atob(f[1]), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var el = document.createElement('script');
    el.textContent = dec.decode(bytes) + '\n/' + '/# sourceURL=' + f[0];
    document.body.appendChild(el);
  });
})();"""


def loader(files):
    items = ',\n'.join("    ['%s', '%s']" % (f, base64.b64encode(read(f).encode('utf-8')).decode()) for f in files)
    return script(LOADER_JS.replace('__FILES__', items))


# 스크립트 오류가 나면 빈 화면 대신 안내와 오류 문구를 띄운다(앱스 스크립트 화면은 콘솔을 보기 어렵다)
BOOT_GUARD = '''<script>
(function () {
  function show(msg) {
    var box = document.getElementById('bootError');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bootError';
      box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99;padding:12px 14px;border-radius:12px;background:#fff3f0;border:1px solid #e0a59a;color:#7a2a1d;font:13px/1.5 sans-serif;white-space:pre-wrap';
      box.textContent = '화면을 불러오지 못했어요. 새로고침해 주세요.\\n';
      (document.body || document.documentElement).appendChild(box);
    }
    box.textContent += msg + '\\n';
  }
  window.addEventListener('error', function (e) { show((e.message || '스크립트 오류') + (e.lineno ? ' (' + (e.filename || '').split('/').pop() + ' ' + e.lineno + ':' + e.colno + ')' : '')); });
  window.addEventListener('unhandledrejection', function (e) { show('처리 못 한 오류: ' + (e.reason && e.reason.message || e.reason)); });})();
</script>'''


def build_index():
    html = read('index.html')
    logo = 'data:image/svg+xml;base64,' + base64.b64encode((ROOT / 'assets' / 'gdeal.svg').read_bytes()).decode()
    html = html.replace('src="assets/gdeal.svg"', f'src="{logo}"')
    html = re.sub(r'\s*<link rel="icon"[^>]*>', '', html)
    html = re.sub(r'\s*<meta name="viewport"[^>]*>', '', html)   # 앱스 스크립트는 doGet의 addMetaTag로 넣는다
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  ' + BOOT_GUARD, 1)
    styles = '\n'.join(read(c) for c in CSS)
    style_block = '\n  <style>\n' + styles + '\n  </style>'
    html = re.sub(r'(\s*<link rel="stylesheet" href="css/[^"]+">)+', lambda m: style_block, html, count=1)
    html = re.sub(r'\s*<!--[^>]*순서대로[^>]*-->', '', html)
    assets, n = assets_script()
    bundle = [script(assets), loader(CLIENT_JS)]
    script_block = '\n' + '\n'.join(bundle)
    html = re.sub(r'(\s*<script src="js/[^"]+"></script>)+', lambda m: script_block, html, count=1)
    assert 'src="js/' not in html and 'href="css/' not in html, '빠진 파일이 있어요'
    return html, n


def main():
    GAS.mkdir(exist_ok=True)
    server = '\n\n'.join(f'/* ===== {p} ===== */\n' + read(p) for p in SERVER_PARTS)
    (GAS / 'Code.js').write_text(server, encoding='utf-8')
    html, n = build_index()
    (GAS / 'index.html').write_text(html, encoding='utf-8')
    shutil.copy(ROOT / 'server' / 'appsscript.json', GAS / 'appsscript.json')

    # 이 컴퓨터에서 보는 판: 같은 index.html에 가짜 google.script.run을 먼저 넣는다
    PREVIEW.mkdir(exist_ok=True)
    mock = ROOT / 'tools' / 'gas-mock'
    for f in ['services.js', 'worker.js', 'mock-run.js']:
        shutil.copy(mock / f, PREVIEW / f)
    shutil.copy(GAS / 'Code.js', PREVIEW / 'Code.js')
    preview = html.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <script src="mock-run.js"></script>', 1)
    preview = preview.replace('<body>', '<body><aside style="padding:10px 16px;background:#fff0bf;color:#443412;text-align:center;font:14px/1.5 sans-serif">예시 체험판 · 실제 행사 데이터와 연결되지 않으며 새로고침하면 초기화됩니다.</aside>', 1)
    (PREVIEW / 'index.html').write_text(preview, encoding='utf-8')

    size = (GAS / 'index.html').stat().st_size
    print(f'gas/index.html {size / 1024:.0f}KB (그림 {n}장), gas/Code.js {(GAS / "Code.js").stat().st_size / 1024:.0f}KB')


if __name__ == '__main__':
    main()
