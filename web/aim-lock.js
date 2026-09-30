// Screen-pixel gesture filter only. Flight/preview physics remain authoritative.
export const AIM_SETTLE_MS = 350, AIM_STILL_PX = 2, AIM_UNLOCK_PX = 8;
export class AimLock {
  constructor(x, y, now) {
    this.anchor = this.latest = { x, y };
    this.since = now;
    this.locked = false;
  }
  settle(now, hasAim) {
    if (!this.locked && hasAim && now - this.since >= AIM_SETTLE_MS) {
      this.locked = true;
      this.anchor = { ...this.latest };
    }
    return this.locked;
  }
  move(x, y, now, hasAim) {
    this.settle(now, hasAim);
    const distance = Math.hypot(x - this.anchor.x, y - this.anchor.y);
    if (this.locked && distance <= AIM_UNLOCK_PX) return false;
    if (this.locked || distance > AIM_STILL_PX) {
      this.locked = false;
      this.anchor = { x, y };
      this.since = now;
    }
    this.latest = { x, y };
    return true;
  }
}
