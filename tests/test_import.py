import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('importer', Path(__file__).parents[1] / 'scripts/import_source.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        self.root = self.base / 'repo'
        self.root.mkdir()
        self.zip = self.base / 'source.zip'

    def tearDown(self):
        self.tmp.cleanup()

    def package(self, files, hashes=None):
        manifest = {'format': 1, 'project': 'orbit-zero', 'files': hashes or {p: hashlib.sha256(v).hexdigest() for p, v in files.items()}}
        with zipfile.ZipFile(self.zip, 'w') as z:
            z.writestr(m.MANIFEST, json.dumps(manifest))
            for p, v in files.items():
                z.writestr(p, v)

    def test_import_repeatable_preserves_workflow(self):
        workflow = self.root / '.github/workflows/bootstrap.yml'
        workflow.parent.mkdir(parents=True)
        workflow.write_text('owner workflow')
        self.package({'web/game.js': b'game', 'README.md': b'readme'})
        m.import_zip(self.zip, self.root)
        m.import_zip(self.zip, self.root)
        self.assertEqual(workflow.read_text(), 'owner workflow')

    def test_rejects_traversal_workflows_git(self):
        for path in ['../escape', '/absolute', '.github/workflows/test.yml', '.git/config', 'web/../../escape', 'web\\escape', 'web//double', 'web/node_modules/a']:
            self.package({path: b'bad'})
            with self.assertRaises(ValueError):
                m.import_zip(self.zip, self.root)
            self.assertEqual(list(self.root.iterdir()), [])

    def test_hash_failure_writes_nothing(self):
        self.package({'web/game.js': b'bad'}, {'web/game.js': '0' * 64})
        with self.assertRaises(ValueError):
            m.import_zip(self.zip, self.root)
        self.assertEqual(list(self.root.iterdir()), [])

    def test_owned_updates_and_modified_conflict(self):
        self.package({'web/game.js': b'v1'})
        m.import_zip(self.zip, self.root)
        self.package({'web/game.js': b'v2'})
        m.import_zip(self.zip, self.root)
        (self.root / 'web/game.js').write_bytes(b'user edit')
        self.package({'web/game.js': b'v3'})
        with self.assertRaises(ValueError):
            m.import_zip(self.zip, self.root)
        self.assertEqual((self.root / 'web/game.js').read_bytes(), b'user edit')

    def test_rejects_unowned_collision_symlink(self):
        (self.root / 'web').mkdir()
        (self.root / 'web/game.js').write_text('existing')
        self.package({'web/game.js': b'new'})
        with self.assertRaises(ValueError):
            m.import_zip(self.zip, self.root)
        (self.root / 'web/game.js').unlink()
        (self.root / 'web/game.js').symlink_to(self.base / 'outside')
        with self.assertRaises(ValueError):
            m.import_zip(self.zip, self.root)


if __name__ == '__main__':
    unittest.main()
