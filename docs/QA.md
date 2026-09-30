# QA and authority

Mavyy is owner and final product/feel authority. Yuki owns architecture/direction,
Akari implementation, Mio independent QA. Astra's bootstrap/full-game pass is a
candidate handoff. It does not certify itself or replace these roles.

Normal workflow: **Yuki → Akari → Mio → Mavyy phone acceptance → documentation sync**.
Repository contents, exact candidate SHA, test logs and CI evidence outrank chat
memory. A workflow file existing is not a passing run. A passing run is not a
physical-phone playtest or a store-ready release.

## Automated coverage

- 144 preview/live equivalence cases with every visible point compared.
- Seed repeatability, bounded drag speed/deadzone, swept collisions.
- Single pickup award, surviving near-miss award, gate/crash/escape/timeout.
- Reachable gravity solutions collecting all three obscured stars and gate for 48
  sampled Voyage worlds, plus planet-count sampling of 30 Endless sectors.
- Gravity-strength checks at near/mid/far distances and exit radius; DOM crash
  flow verifies the result waits for the impact beat and five hangar icons appear.
- Art path/budget checks, old-save decor migration, one-time purchase and equip
  rules, per-ship tint, an interior/shop/support DOM journey and no payment URL.
- Save corruption, version mismatch, sanitization, persistence failures and purchases.
- A lightweight DOM contract test completes a 12-sector voyage and exercises pause,
  settings, retry, achievements, pointer cancellation and background pause.
- ZIP validation, repeat import, workflow preservation, ownership conflicts, hash
  mismatch, symlink/traversal/workflow/Git path rejection.
- Real-browser smoke at 320×568, 360×640 and 412×915 runs locally and in CI; screenshots are
  artifacts, including home, support, interior and shop. This is distinct from
  the DOM contract test.

## Required phone acceptance

1. Install debug APK, reach menu, open help/settings/hangar and scroll to every button.
2. Drag from the ship on the real screen; verify comfortable launch position,
   aim direction, cancel behavior, multi-touch rejection, and prompt restart.
3. Compare visible prediction and live flight; try slow and fast launches.
4. Collect a pickup, survive a near miss, crash, escape, reach a gate and finish a voyage.
   Watch a crash effect complete before the result; confirm the wider gate feels fair.
5. Pause/resume and background/return during flight and between sectors. No unseen motion.
6. Check audible effects/music, haptic toggles, reduced motion, high contrast and button aiming.
7. End a run, change a cosmetic/setting, force-stop and reopen. Verify saved progress.
8. Install the next APK as an update without uninstalling; confirm signing and saves.
9. Test low-end performance/heat, tall/short screens, system insets and Android Back.
10. Judge actual v0.0.2 feel parity. Automated tests cannot certify “one more launch.”
11. Inspect five hangar icon shapes against the in-field ship, including locked styles.
12. Open every home/menu/hangar/settings/help control at 360px width; verify
    readable art, scroll access, text contrast and working Android Back.
13. Open each owned ship's interior. Tint its wall, place and re-place decor,
    then force-stop/reopen to verify the save without losing previous progress.
14. Check shop prices, one-time charges and insufficient-balance disabled states.
    No decor may alter the flight simulation.
15. Open Support. The transparent still art should appear; donation tiers must remain disabled with no external checkout.

Known outstanding work for this revision: independent audit, exact-SHA CI run,
phone/performance/device certification, store/release preparation. Read CURRENT_STATE
for what was actually executed locally.

## Workshop regression and acceptance

Automated coverage checks level/config persistence and independent clones, schema
corruption and bounds, library cap/update, gravity scaling, custom world bounds and
time limit, and exact preview/live state equivalence. Real-browser coverage edits
three sizes, places and drags with touch, tunes a selected planet, reloads stored
levels, confirms draft replacement/deletion, exercises instant respawn, completes
and loses a custom flight, and asserts normal progress never changes.

Phone acceptance: build several different-size arenas; move/delete objects; scroll
and collapse the fixed configuration panel; save/reopen multiple named levels and
update one without duplication. Verify custom background pause and Android Back,
instant-respawn aim reset, old progress after an update install, and normal
Voyage/Endless controls. Arbitrary handmade levels may be impossible; completion
checks are manual. Storage quota/failure and extreme zoom need device review.

## Five planet regression

Force tests compare signs, cutoff and near/far ratios, not just multipliers.
Orbiter tests cover no teleport, partial/full orbit, timed release, no recapture,
zero gravity and exact preview/live state through transitions and mixed forces.
All twelve fallback stage/count pairs reach the gate with all stars. A 192-world
Voyage/Endless audit spans eight seeds and twelve sectors. The existing tests
retain obscured stars/gate and a full UI Voyage.

Browser checks cover five picker summaries, type-specific controls, stored type
values, actual touch reclick closing/reopening, compatibility-click suppression,
and capture → pause → resume → release at three phone sizes. Physical acceptance
still needs all five types, high-speed Crusher collisions, gravity-zero obstacles,
old custom-level retuning and preview trust on the target Android WebView.
