# Station Foundation source candidate — 2026-09-30

Local source ZIP: `orbit-zero-source.zip` (updated October 1 with the unified reference-led outpost). The complete package
includes Foundation, the station plan, interior retirement, and prior source.
It contains source, not an APK. No remote commit, upload or deployment was made.

To use the established mobile workflow, upload this candidate as repository-root
`orbit-zero-source.zip`, retaining the existing bootstrap. Validate the exact
imported source SHA through CI and update-install the resulting debug APK without
uninstalling. Old interior-package delivery notes below are historical.

Local evidence: syntax, 56 Node cases, five Python importer cases and Chromium
journeys at three phone sizes passed. Package CRC, manifest, clean/repeated import,
and protected-source preservation are checked with `scripts/verify_package.py`.
Three.js r170 and its MIT license ship locally. Android build/lint and physical
WebView/device checks are outstanding; no store-ready or phone acceptance is claimed.

Review the connected outpost Foundation before expanding Hangar integration. Economy, Engineering,
technicians and Garden remain deliberately inactive. See STATION_PLAN.md and QA.md.

---

# Historical interior delivery — superseded

The owner retired ship interiors in favor of the 3D orbital station. Do not use
this old interior-package delivery as the next release instruction. Current local
changes remove the active room UI while retaining saved data; no updated ZIP/APK
or remote repository change is claimed. See STATION_PLAN.md and CURRENT_STATE.md.

# Bundled interior delivery — 2026-09-30

Replace repository-root `orbit-zero-source.zip` only. Keep the existing bootstrap
YML. All workflow files are excluded from this complete replacement source ZIP.
No repository writes were made by the coding session.

Verified baseline: `b5a2139337b0aa0d10de4ca1efc27eea52727410`, successful
Actions #15 (36755407244). Its logs confirm exact imported-SHA validation.
Mavyy accepted the adjustable dead zone; its previous pending-upload wording is
synced. This interior update has no imported SHA until the owner uploads it.

Local execution: syntax checks, 52 Node cases, five Python importer cases,
archive CRC/manifest hashes, clean and repeated imports against the baseline,
and protected gameplay/Workshop/prices/signing/bootstrap byte comparison.
`scripts/verify_package.py ZIP BASELINE` repeats the archive/import checks.

New local real-browser validation was blocked by sandbox socket restrictions.
The requested 320×568, 360×640 and 412×915 real Chromium suite is included and
wired into the existing bootstrap, but remains pending execution in CI.
Android build/lint could not run locally without Gradle/SDK. Those checks,
the candidate exact-SHA run, update-install and physical-phone acceptance
remain pending. Baseline CI does not validate this new package.

See `INTERIORS.md` for controls and migration, `CURRENT_STATE.md` for scope,
and `QA.md` for required phone acceptance. The ZIP contains source, not a new APK.
