# Five planet mechanics

| Type | Picker summary | Behavior | Specific Workshop values |
| --- | --- | --- | --- |
| Drifter | Little Nudge | Weak, tapered finite field for small corrections | Nudge reach |
| Slingshot | Curved Pull | Broad curved attraction with a stronger close lens | Curve strength |
| Orbiter | Orbit Lock | Captures into a short controlled arc, then boosts tangentially | Capture reach, orbit strength, lock duration, release boost |
| Crusher | Violent Yank | Steep, capped pull inside a tight field | Yank reach, core tightness |
| Repulsor | Push Away | Bounded linear outward push that combines with other fields | Push reach, repulsion |

Every type also has gravity multiplier and body radius. Zero gravity disables
forces/capture, while collision remains active. Colors, labels and field cues
identify mechanics; orbit lock/release has an explicit cue. Only Slingshot and
passive Orbiter attraction extend without a hard cutoff.

Orbiter capture changes velocity but never teleports the ship. A radial/tangential
controller bends it around a ring for the configured duration; its incoming
angular direction determines clockwise/counterclockwise travel. Release adds
tangent speed. The same planet captures at most once per launch. Other planets
can still pull, push or crash the ship during a lock. A longer/stronger lock can
complete a full turn. Pausing stops the timer. This is an arcade rule, not an
N-body solver or an invulnerability shield.

## Journey / Voyage progression

- 1–3: Drifter and Slingshot; three planets, familiar aiming first.
- 4–5: Repulsor enters; counter-steer with push/pull.
- 6–8: Orbiter enters; four planets and timed capture/release.
- 9–12: Crusher enters; five planets with advanced combinations.

Generation verifies a sampled winning route through all three stars and the exit
using the authoritative simulation. Advanced exits can lie on an upper orbital
arc rather than the original fixed top strip. If random layout search fails, a
verified stage/body-count template supplies the route. Every fallback combination
is covered by tests. Solvability is not a claim that every launch succeeds or that
the learning curve is already phone-certified. Handmade Workshop layouts need
their own playtest; changing a mechanic can change a saved level's solution.

Prediction calls exactly the same fixed-step advance, including capture, expiry,
release and combined fields. It still displays only the first 2.1 seconds.
