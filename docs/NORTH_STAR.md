# North Star

Orbit Zero succeeds when the player can understand enough to aim, release, watch
gravity bend the outcome, feel the rush of a dangerous near-miss, fail quickly,
and immediately want another attempt.

**aim/drag → release → gravity interaction → pickups/near-misses → score/multiplier
→ crash/escape → instant restart**

## Immutable feel priorities from the owner's v0.0.2 playtest

- Familiar, clean, satisfying drag/release.
- A trustworthy visible trajectory preview; limited visibility is allowed, lying is not.
- Gravity understood through play.
- Highly satisfying near-miss feedback.
- Extremely fast restart.
- An inward launch position for small-screen ergonomics.
- Protect the “one more launch” behavior.

The prototype is a behavioral reference, not production architecture. Its source
was not available to this implementation pass. Exact feel parity is unverified.

Android-first and single-player. Keep future iOS support possible. No multiplayer,
social systems, accounts, backend, analytics, ads, or monetization implementation.
Monetization remains undecided. Private collaborators and relationships are never
game content.

## A home between launches

The station gives run accomplishments a physical, persistent purpose:
Station → prepare/select ship → launch → gravity-arcade run → earn Stardust
→ return → improve the station/ships → launch again. Keep immediate retry
available; management is never a required interruption between attempts.

The station is a small, lovable 3D orbital diorama with visible building growth,
simple progression, and eventually gentle ambient life. Its 3D assets use a
low-poly arcade style: bold silhouettes, playful proportions, simplified geometry
and readable color accents at the isometric camera distance. Orbit Zero remains an
arcade gravity game first. Preserve all feel priorities above; avoid city-builder
complexity, many currencies, crafting chains, or heavy crew management.
Ship interiors and cabin decorating are retired. Hangar belongs to the 3D station
and focuses on the ships themselves: viewing, selection and unlocking.
See [the phased station plan](STATION_PLAN.md).
