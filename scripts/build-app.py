"""Build static, versioned ES modules. No application source is embedded here."""
from pathlib import Path
import os
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / '_site'
SOURCE = ROOT / 'app'
REVISION = os.environ.get('GITHUB_SHA', 'local')[:12]
OUTPUT = SITE / 'app'
ASSETS = OUTPUT / ('assets-' + REVISION)

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
ASSETS.mkdir(parents=True)
for source in SOURCE.rglob('*'):
    if not source.is_file():
        continue
    relative = source.relative_to(SOURCE)
    # Public entry points remain stable; executable sources are immutable per revision.
    target = (OUTPUT if str(relative) in {'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'LICENSE-lowlat'} else ASSETS) / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)

vendor = ROOT / 'vendor-src'
for name in ['enum.js', 'wasm/opus.js', 'wasm/opus.wasm']:
    target = ASSETS / 'stream' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(vendor / 'src' / name, target)
shutil.copyfile(vendor / 'LICENSE', OUTPUT / 'LICENSE')
(OUTPUT / 'package.json').write_text('{"type":"module"}\n')
page = OUTPUT / 'index.html'
page.write_text(page.read_text().replace('href="styles/app.css"', f'href="assets-{REVISION}/styles/app.css"').replace('src="main.js"', f'src="assets-{REVISION}/main.js"'))

for source in ASSETS.rglob('*.js'):
    subprocess.run(['node', '--input-type=module', '--check'], input=source.read_text(), text=True, check=True)
    for specifier in re.findall(r"(?:from\s+|import\s*)['\"]([^'\"]+)['\"]", source.read_text()):
        if specifier.startswith('.'):
            assert (source.parent / specifier).is_file(), f'Missing import: {source}: {specifier}'

# Preserve bookmarks while moving the application out of the diagnostic route.
for route in ['personal-test', 'client']:
    target = SITE / route
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    (target / 'index.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=../app/"><title>Parsec Safari</title><a href="../app/">Parsec Safari öffnen</a></html>')
root_page = SITE / 'index.html'
if root_page.exists():
    root_page.write_text(root_page.read_text().replace('<main>', '<main><p><a href="app/">Parsec Safari App öffnen</a></p>', 1))
print('App built: /app/; versioned modules and imports validated.')
