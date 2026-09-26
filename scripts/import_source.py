"""Validate a complete source ZIP before overlaying owned files. Never writes workflows."""
import hashlib
import json
from pathlib import Path, PurePosixPath
import stat
import sys
import zipfile

MANIFEST = '.orbit-zero-package.json'
ROOT_FILES = {'README.md', '.gitignore', '.editorconfig', 'package.json', 'settings.gradle', 'build.gradle', 'gradle.properties'}
ROOT_DIRS = {'web', 'app', 'docs', 'tests', 'scripts', 'dev-signing'}


def allowed(name):
    p = PurePosixPath(name)
    return (name == str(p) and not p.is_absolute() and '\\' not in name
            and all(x not in ('', '.', '..', '.git', '.github', 'node_modules', 'build', '.gradle', '__pycache__') for x in p.parts)
            and (name in ROOT_FILES or (len(p.parts) > 1 and p.parts[0] in ROOT_DIRS)))


def import_zip(archive, root):
    root = Path(root).resolve()
    with zipfile.ZipFile(archive) as z:
        items = z.infolist()
        names = [i.filename for i in items]
        if len(items) > 500 or len(names) != len(set(names)):
            raise ValueError('Too many files or duplicate archive entries')
        if MANIFEST not in names or sum(i.file_size for i in items) > 20 * 1024 * 1024:
            raise ValueError('Missing manifest or archive too large')
        for i in items:
            if i.is_dir() or stat.S_ISLNK(i.external_attr >> 16) or i.flag_bits & 1:
                raise ValueError('Directories, symlinks, or encrypted files are forbidden')
            if i.filename != MANIFEST and not allowed(i.filename):
                raise ValueError('Forbidden path: ' + i.filename)
        manifest = json.loads(z.read(MANIFEST))
        if manifest.get('format') != 1 or manifest.get('project') != 'orbit-zero':
            raise ValueError('Wrong package format/project')
        hashes = manifest['files']
        if not isinstance(hashes, dict) or set(names) != set(hashes) | {MANIFEST}:
            raise ValueError('Manifest/archive mismatch')
        payload = {}
        for name, expected in hashes.items():
            data = z.read(name)
            if hashlib.sha256(data).hexdigest() != expected:
                raise ValueError('Hash mismatch: ' + name)
            destination = root / name
            if not destination.resolve().is_relative_to(root):
                raise ValueError('Path escapes checkout')
            for parent in [destination, *destination.parents]:
                if parent == root:
                    break
                if parent.is_symlink():
                    raise ValueError('Symlink destination')
            payload[name] = data
        old_path = root / MANIFEST
        if old_path.is_symlink():
            raise ValueError('Symlink manifest')
        old = json.loads(old_path.read_text()) if old_path.exists() else {'files': {}}
        if old_path.exists() and (old.get('format') != 1 or old.get('project') != 'orbit-zero'):
            raise ValueError('Unrecognized existing package ownership')
        removed = set(old['files']) - set(hashes)
        if removed:
            raise ValueError('Removed paths require explicit migration: ' + ', '.join(sorted(removed)))
        for name, data in payload.items():
            dest = root / name
            if not dest.exists():
                continue
            if not dest.is_file():
                raise ValueError('Destination is not a file: ' + name)
            current = dest.read_bytes()
            if current == data:
                continue
            if name in old['files']:
                if hashlib.sha256(current).hexdigest() != old['files'][name]:
                    raise ValueError('Modified source conflict: ' + name)
            elif name != 'README.md':
                raise ValueError('Unowned file conflict: ' + name)
        for name, data in payload.items():
            dest = root / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
        old_path.write_bytes(z.read(MANIFEST))
    print(f'Validated and imported {len(payload)} source files; workflows untouched.')


if __name__ == '__main__':
    import_zip(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.')
