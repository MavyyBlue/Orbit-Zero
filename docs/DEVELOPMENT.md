# Development

## Versions

Node 22; Python 3.10+; Java 17; Gradle 8.11.1; Android Gradle Plugin 8.9.2;
compile/target SDK 35; build tools 35.0.0; minimum Android 8 (API 26).
AndroidX WebKit 1.12.1. CI browser tooling is Playwright 1.62.1.

Install Gradle 8.11.1 explicitly; there is no fake or incomplete Gradle wrapper.
The workflow's setup-gradle action installs that exact distribution. A checked-in,
verified wrapper can be added later by an engineer with download access.

## Commands

- `npm run validate`: JavaScript syntax and Node tests. No npm install needed.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: safe-import tests.
- `npm run serve`: HTTP preview on port 8080; do not open ES modules via file://.
- `gradle --no-daemon :app:assembleDebug :app:lintDebug`: Android build/lint.
- Optional real-browser test: install `playwright@1.62.1` with `--no-save
  --package-lock=false --ignore-scripts`, run `npx playwright install chromium`,
  start the preview server, and run `node scripts/browser-smoke.mjs`.

Use `.editorconfig`, readable named functions, and meaningful behavioral tests.
There is no style-linter dependency. Never edit the trajectory algorithm separately
from live physics. Preserve save schema compatibility or provide a migration.

## Source ZIP updates

`python3 scripts/package_source.py /absolute/path/orbit-zero-source.zip` produces a
flat-root archive with a SHA-256 manifest. It omits workflows, caches, dependencies,
build artifacts, and itself-generated manifests. The importer rejects traversal,
symlinks, duplicates, unexpected paths, oversized payloads, hash mismatches, and
conflicts with unowned or independently changed source. It does not delete files.
A removed path needs an explicit reviewed migration. Existing README is the only
first-import overwrite exception; unrelated files and workflows are preserved.

The workflow records the imported archive hash in `.orbit-zero-import.sha256`, so
ordinary source commits do not re-import an old ZIP. Updating owned files from a
new archive is allowed only when their current bytes still match the prior manifest
or the new file. If source was edited directly, rebase/reconcile the package; do not
silently discard those edits.

## Signing and release

`dev-signing/orbit-zero-debug.keystore` is an intentionally public DEVELOPMENT key,
with the conventional `android` password and `androiddebugkey` alias. Preserve it
for update installs during testing. It is not a secret and offers no production
identity protection. It must never sign store releases. Release signing, application
ID ownership, current store target requirements, and distribution policy are pending.
No production credentials are included. Keep app data when testing update installs.

## Workflow evidence

The importer pushes a normal fast-forward source commit, then the validation job
checks out its exact SHA. It does not rely on a new workflow firing from the bot
push. Artifact names and evidence files contain that SHA. The run's original event
SHA can be the ZIP-upload commit; consult the candidate SHA in its summary.
No force push, workflow-scope workaround, or personal token is required.
