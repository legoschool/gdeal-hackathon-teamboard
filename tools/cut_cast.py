# 몬스터 원정대의 그림 묶음(cast/pets.png, cast/avatars.png)을 한 장씩 잘라 assets/에 넣는다.
# 실행: C:\Python314\python.exe tools\cut_cast.py  (teamboard 폴더에서)
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
SRC = HERE.parent.parent / '2026. 해커톤 커뮤회원 사전 웹앱' / 'public' / 'assets' / 'cast'

PETS = ['koalbot', 'antro', 'monggeul', 'digibugi', 'pickling',
        'droni', 'owllab', 'hongaengi', 'maninyang', 'h2o']


def main_run(counts, gap=6):
    """빈 줄이 gap개 넘게 이어져 나뉜 덩어리 가운데 가장 큰 것의 시작·끝.
    옆 칸에서 넘어온 날개 끝 같은 조각을 버린다."""
    runs, start, empty = [], None, 0
    for i, c in enumerate(counts + [0] * (gap + 1)):
        if c:
            if start is None:
                start = i
            empty = 0
        elif start is not None:
            empty += 1
            if empty > gap:
                end = i - empty + 1
                runs.append((sum(counts[start:end]), start, end))
                start, empty = None, 0
    _, a, b = max(runs)
    return a, b


def keep_main(tile):
    alpha = tile.getchannel('A').point(lambda a: 255 if a > 40 else 0)
    w, h = tile.size
    px = alpha.load()
    x0, x1 = main_run([sum(1 for y in range(h) if px[x, y]) for x in range(w)])
    y0, y1 = main_run([sum(1 for x in range(x0, x1) if px[x, y]) for y in range(h)])
    return tile.crop((x0, y0, x1, y1))


def cut(sheet, cols, rows, names, out_dir, height):
    img = Image.open(SRC / sheet).convert('RGBA')
    cw, ch = img.width / cols, img.height / rows
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, name in enumerate(names):
        x, y = i % cols, i // cols
        tile = img.crop((round(x * cw), round(y * ch), round((x + 1) * cw), round((y + 1) * ch)))
        if not tile.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox():
            continue
        tile = keep_main(tile)
        scale = height / tile.height
        tile = tile.resize((max(1, round(tile.width * scale)), height), Image.LANCZOS)
        tile.save(out_dir / f'{name}.png', optimize=True)
        print(name, tile.size)


cut('pets.png', 5, 2, PETS, HERE / 'assets' / 'pets', 200)
cut('avatars.png', 4, 5, [f'a{i:02d}' for i in range(1, 21)], HERE / 'assets' / 'avatars', 180)
