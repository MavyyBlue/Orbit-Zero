"""Verify a delivered ZIP and repeat-import it into a copy of an exact baseline."""
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile
import zipfile
from import_source import import_zip, MANIFEST


def verify(archive, baseline):
    archive, baseline = Path(archive).resolve(), Path(baseline).resolve()
    old = json.loads((baseline / MANIFEST).read_text())
    for name, expected in old['files'].items():
        if hashlib.sha256((baseline / name).read_bytes()).hexdigest() != expected:
            raise ValueError('Baseline is modified: ' + name)
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:
            raise ValueError('Archive CRC failure')
        manifest = json.loads(z.read(MANIFEST))
        if set(old['files']) - set(manifest['files']):
            raise ValueError('Package drops existing owned files')
        if any(name.startswith('.github/') for name in z.namelist()):
            raise ValueError('Workflow path embedded')
        for name, expected in manifest['files'].items():
            if hashlib.sha256(z.read(name)).hexdigest() != expected:
                raise ValueError('Manifest mismatch: ' + name)
        payload = {name: z.read(name) for name in manifest['files']}
    protected = ['.github/workflows/bootstrap.yml', 'dev-signing/orbit-zero-debug.keystore',
                 'app/build.gradle', 'app/src/main/AndroidManifest.xml',
                 'app/src/main/java/com/orbitzero/game/MainActivity.java',
                 'web/aim-lock.js', 'web/simulation.js', 'web/planet-rules.js',
                 'web/workshop.js', 'web/workshop-ui.js', 'web/decor.js']
    with tempfile.TemporaryDirectory(prefix='orbit-import-') as tmp:
        root = Path(tmp) / 'repository'
        shutil.copytree(baseline, root)
        import_zip(archive, root)
        first = {name: hashlib.sha256((root / name).read_bytes()).hexdigest()
                 for name in manifest['files']}
        import_zip(archive, root)
        for name, data in payload.items():
            if (root / name).read_bytes() != data:
                raise ValueError('Imported payload mismatch: ' + name)
            if hashlib.sha256((root / name).read_bytes()).hexdigest() != first[name]:
                raise ValueError('Repeat import changed a file: ' + name)
        for name in protected:
            if (root / name).read_bytes() != (baseline / name).read_bytes():
                raise ValueError('Protected baseline changed: ' + name)
    result = {'files': len(payload), 'bytes': archive.stat().st_size,
              'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
              'crc': 'pass', 'manifest': 'pass', 'clean_import': 'pass',
              'repeat_import': 'pass', 'protected_baseline': 'pass', 'workflows': 'excluded'}
    print(json.dumps(result, indent=2))
    return result


if __name__ == '__main__':
    verify(sys.argv[1], sys.argv[2])
