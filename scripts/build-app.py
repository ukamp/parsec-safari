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
OUTPUT = SITE
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

# Keep the original browser capability test available at its own route.
compatibility = SITE / 'compatibility'
compatibility.mkdir()
(compatibility / 'index.html').write_text((ROOT / 'index.html').read_text().replace('<main>', '<main><p><a href="../">Parsec Safari App</a></p>', 1))
(SITE / '.nojekyll').touch()

# Preserve old bookmarks and Home Screen launch URLs, including route hashes.
for route in ['app', 'personal-test', 'client']:
    target = SITE / route
    target.mkdir()
    (target / 'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Parsec Safari</title><script>const target=new URL("../",location.href);target.search=location.search;target.hash=location.hash;location.replace(target.href);</script><noscript><meta http-equiv="refresh" content="0;url=../"></noscript><p>Parsec Safari has moved: <a href="../">Open the app</a></p></html>')

# Retain the installed app identity and its former manifest URL.
import json
legacy_manifest = json.loads((SOURCE / 'manifest.webmanifest').read_text())
legacy_manifest.update(id='./', start_url='../', scope='../')
for icon in legacy_manifest['icons']:
    icon['src'] = '../' + icon['src']
(SITE / 'app' / 'manifest.webmanifest').write_text(json.dumps(legacy_manifest, indent=2))
print('App built at site root; legacy redirects and compatibility test prepared.')
