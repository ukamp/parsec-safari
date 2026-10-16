"""Compatibility entry point used by the existing Pages workflow."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
subprocess.run([sys.executable, str(root / 'scripts/build-app.py')], check=True)
subprocess.run(['node', str(root / 'scripts/test.mjs')], cwd=root, check=True)
