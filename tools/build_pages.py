"""Build the GitHub Pages landing page and isolated browser demo."""
from pathlib import Path
import shutil
from build_gas import main as build_gas
ROOT = Path(__file__).resolve().parent.parent

def main():
    build_gas()
    target = ROOT / '_site'
    target.mkdir(exist_ok=True)
    shutil.copyfile(ROOT / 'site/index.html', target / 'index.html')
    (target / '.nojekyll').write_text('', encoding='utf-8')
    demo = target / 'demo'
    demo.mkdir(exist_ok=True)
    for name in ['index.html', 'Code.js', 'worker.js', 'services.js', 'mock-run.js']:
        shutil.copyfile(ROOT / 'gas-preview' / name, demo / name)
    print('Built _site: landing page and isolated demo')

if __name__ == '__main__':
    main()
