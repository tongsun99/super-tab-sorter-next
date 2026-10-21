#!/usr/bin/env python3
"""Create store and corresponding-source archives. GPL-3.0, tongsun99, 2026-10-21."""
import hashlib
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'src'
DIST = ROOT / 'dist'


def main():
    manifest = json.loads((SRC / 'manifest.json').read_text())
    version = manifest['version']
    for name in ['LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES']:
        shutil.copyfile(ROOT / name, SRC / name)
    if not (SRC / 'vendor/psl.js').exists():
        raise SystemExit('Missing corresponding source: src/vendor/psl.js')
    # Use the same, single GPL text for development and distribution.
    DIST.mkdir(exist_ok=True)
    store = DIST / f'super-tab-sorter-next-v{version}.zip'
    source = DIST / f'super-tab-sorter-next-v{version}-source.zip'
    src_files = sorted(p for p in SRC.rglob('*') if p.is_file() and not p.name.startswith('.'))
    with zipfile.ZipFile(store, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in src_files:
            archive.write(path, path.relative_to(SRC))
    with zipfile.ZipFile(source, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in src_files:
            archive.write(path, path.relative_to(ROOT))
        for name in ['README.md', 'LICENSE', 'NOTICE', 'THIRD_PARTY_NOTICES', 'PRIVACY.md', 'package_for_web_store.sh', '.gitignore', 'CLAUDE.md']:
            archive.write(ROOT / name, name)
        for folder in ['scripts', 'tests', 'docs']:
            for path in sorted((ROOT / folder).rglob('*')):
                if path.is_file() and '__pycache__' not in path.parts:
                    archive.write(path, path.relative_to(ROOT))
    with zipfile.ZipFile(store) as archive:
        assert 'manifest.json' in archive.namelist()
        assert not any(name.startswith('src/') for name in archive.namelist())
    checksums = ''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in [store, source])
    (DIST / 'SHA256SUMS').write_text(checksums)
    for path in [store, source]:
        print(f'{path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()
