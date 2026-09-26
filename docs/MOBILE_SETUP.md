# Mobile-only setup

You need GitHub in your phone browser and the two delivered files. No PC or personal
access token is required. The owner installs the workflow; the workflow writes
ordinary source only and never attempts to create or modify workflow files.

## 1. Install the workflow once

Open `MavyyBlue/Orbit-Zero` in your phone browser. If editing is hidden, use the
browser's Desktop site option. On `main`, choose Add file → Create new file. Name it
**`.github/workflows/bootstrap.yml`** and paste the entire delivered `bootstrap.yml`.
Commit it. Alternatively use Actions → New workflow → set up a workflow yourself.
If that exact file exists, review/replace only it; preserve unrelated workflows.
UI labels can vary. The first run may say “Waiting for source ZIP”; no APK exists yet.

## 2. Upload the source ZIP

At the repository ROOT on `main`, choose Add file → Upload files. Select
**`orbit-zero-source.zip`**, then commit. Do not unzip it on your phone, rename it,
or place it in a folder. The archive has flat-root source and an integrity manifest;
it intentionally contains no `.github` files.

## 3. Get the APK

Open Actions → **Orbit Zero - Import, Test and APK** → latest run. The source job
validates/expands the ZIP and commits owned source. The validate job checks that
exact SHA, runs tests/browser smoke, then builds and lints Android.

After BOTH jobs succeed, download **`orbit-zero-debug-<SHA>`** under Artifacts.
Extract that artifact on your phone, then open **`app-debug.apk`** (possibly under
`app/build/outputs/apk/debug/` inside the artifact). Android may ask to allow app
installation from your browser/files app. This is a debug build, not a store release.

The artifact includes `source-sha.txt` and `apk-sha256.txt` in `build/evidence/`.
The summary records the imported SHA; the run's trigger SHA may be the preceding
ZIP-upload commit. Keep the run URL and imported SHA for Yuki and Mio. Phone-sized
screenshots and lint reports are in the separate validation artifact.

## If blocked

- Actions disabled: enable it for this repository.
- Push permission denied: the import job requests `contents: write`, but owner/org
  policy may forbid it. Allow that source push or use your normal reviewed branch/PR
  process. The workflow does not bypass protection or need workflow write permission.
- Main changed or is protected: push fails safely. Reconcile through owner review;
  never force-push. Rerun on current main after resolution.
- Existing file conflict: give the failing path/log to the engineer to reconcile.
  Unrelated code and independent edits are not silently replaced.
- Build/test failure: share its failing log or run URL. A green source job alone
  is not a passing APK build.
- No automatic run: Actions → this workflow → Run workflow on main.
- Install signature conflict with an older unrelated APK: preserve any needed data;
  compare signing identities before uninstalling anything.

Later updates use the same ZIP filename. Keep the public development signing key
unchanged. No workflow edit is needed for ordinary source changes. The stored ZIP
hash prevents re-importing an unchanged archive over direct source edits.

## Phone acceptance

Try drag/launch, pickups, near misses, gate, crash/retry, button aiming and menus.
Pause/background/resume. Change settings, finish a run, force-stop and reopen to
check saved progress. Judge launch comfort, preview trust, feedback and restart
against v0.0.2. Report phone acceptance separately from CI success.
