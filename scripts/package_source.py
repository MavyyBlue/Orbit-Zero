"""Create the flat, allowlisted source package, never embedding workflows or junk."""
import hashlib
import json
from pathlib import Path
import sys
import zipfile
from import_source import allowed, MANIFEST

root = Path(__file__).resolve().parents[1]
output = Path(sys.argv[1]).resolve()
files = {}
for path in sorted(root.rglob('*')):
    if path.is_file() and not path.is_symlink():
        name = path.relative_to(root).as_posix()
        if allowed(name) and path != output and not name.endswith(('.pyc', '.log')):
            files[name] = path.read_bytes()
manifest = {'format': 1, 'project': 'orbit-zero', 'version': '0.1.0', 'files': {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}}
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name, data in {**files, MANIFEST: (json.dumps(manifest, indent=2) + '\n').encode()}.items():
        info = zipfile.ZipInfo(name, date_time=(2026, 9, 26, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, data)
print(f'{output.name}: {len(files)} source files, SHA-256 {hashlib.sha256(output.read_bytes()).hexdigest()}')
