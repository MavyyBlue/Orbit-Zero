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
- Reachable solutions for 48 sampled generated sectors, not an exhaustive proof.
- Save corruption, version mismatch, sanitization, persistence failures and purchases.
- A lightweight DOM contract test completes a 12-sector voyage and exercises pause,
  settings, retry, achievements, pointer cancellation and background pause.
- ZIP validation, repeat import, workflow preservation, ownership conflicts, hash
  mismatch, symlink/traversal/workflow/Git path rejection.
- Real-browser smoke at 360×640 and 412×915 is authored for CI; screenshots are
  artifacts. This is distinct from the DOM contract test.

## Required phone acceptance

1. Install debug APK, reach menu, open help/settings/hangar and scroll to every button.
2. Drag from the probe on the real screen; verify comfortable launch position,
   aim direction, cancel behavior, multi-touch rejection, and prompt restart.
3. Compare visible prediction and live flight; try slow and fast launches.
4. Collect a pickup, survive a near miss, crash, escape, reach a gate and finish a voyage.
5. Pause/resume and background/return during flight and between sectors. No unseen motion.
6. Check audible effects/music, haptic toggles, reduced motion, high contrast and button aiming.
7. End a run, change a cosmetic/setting, force-stop and reopen. Verify saved progress.
8. Install the next APK as an update without uninstalling; confirm signing and saves.
9. Test low-end performance/heat, tall/short screens, system insets and Android Back.
10. Judge actual v0.0.2 feel parity. Automated tests cannot certify “one more launch.”

Known outstanding work: independent audit, real-browser run, Android build/lint,
phone/performance/device certification, store/release preparation. Read CURRENT_STATE
for what was actually executed locally.
