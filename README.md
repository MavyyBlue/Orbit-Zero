# Orbit Zero

**Slingshot through gravity, chain impossible near-misses, and survive one more orbit.**

An original offline, single-player gravity-flight game for Android. This is the
**0.1.0 playable candidate**, not a certified launch release. The owner authorized
an expanded full-game implementation pass after the original Phase 0 request.
No Everthread or Local Yuki gameplay, code, progression, characters, or private
conversations were imported. Only the owner-uploaded ZIP ingestion approach is shared.

## Play

Pull back near the little ship, then release. The dotted arc covers the first 2.1 seconds
of flight using exactly the same fixed-step simulation. Curve around varied
gravitational planets to collect stars tucked beyond their direct sightlines and
reach the exit ring. Each surviving near miss raises
the current sector's multiplier. Crash, escape the field, or time out after 14
seconds and restart immediately. The gravitational pull now bends flights more
strongly across a wider region, and the exit ring is slightly wider. On impact,
a brief spark and tiny mushroom cloud play before the result screen.

- **Voyage:** twelve generated sectors and an ending; three planets in sectors 1–4,
  four in 5–8, five in 9–12.
- **Endless:** keep crossing sectors until the run ends; each sector has three to five planets.
- **Workshop:** touch level creator replacing Daily Orbit. Move/add planets and stars,
  position launch/exit, configure arena dimensions, gravity, speed, time limit and
  instant respawn. Save up to 30 levels locally with all settings; test them without
  changing normal records or stardust. See [Workshop guide](docs/WORKSHOP.md).
- **Hangar:** five small ship silhouettes with previews beside each name, unlocked with collected stars
  (banked as stardust after a run); four achievement badges.
- **Ship interiors:** five layered cosmetic rooms with personal wall color and
  stardust decor. Furnishings do not affect flight.
- **Support page:** Lyra and Yuki art, creator information, and a disabled
  donation control. No payment link or transaction is available yet.
- Sound, ambient music, haptics, reduced motion, high contrast, button/keyboard aiming.
- Local progress persists; an in-progress flight does not survive process death.

Lyra's visual collection supplies the new home/menu/hangar/settings/interior/shop
art. The shipped WebP images total about 5.1 MiB; the high-resolution originals
and 30 texture atlases stay outside the APK. Text and controls remain accessible
HTML. See [art source and optimization](docs/ART_SOURCE.md).

## Mobile installation

Install the separately delivered `bootstrap.yml` as `.github/workflows/bootstrap.yml`
through GitHub's web editor. Upload the separately delivered `orbit-zero-source.zip`
to the repository root on `main`. The workflow validates/expands the ZIP, commits
only owned source, then tests and builds the exact imported SHA in the same run.
Download the debug APK artifact only after the **validate** job succeeds.
See [mobile setup](docs/MOBILE_SETUP.md).

## Development

Node 22+, Python 3.10+, Java 17, Gradle 8.11.1, Android SDK 35.

```sh
npm run validate
python3 -m unittest discover -s tests -p 'test_*.py'
npm run serve
# Open http://localhost:8080
# With SDK/Gradle installed:
gradle --no-daemon :app:assembleDebug :app:lintDebug
```

No npm runtime dependencies. The Android shell uses AndroidX WebKit 1.12.1.
The intentionally public debug signing identity preserves test-install updates;
it must never sign a production release.

Start with [current state](docs/CURRENT_STATE.md), [architecture](docs/ARCHITECTURE.md),
[QA](docs/QA.md), and [development](docs/DEVELOPMENT.md).
