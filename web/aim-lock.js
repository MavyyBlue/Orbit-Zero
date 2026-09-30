// Existing filename is retained for package ownership compatibility.
// Screen-pixel movement dead zone only: no timer, settling or lock state.
export const DEFAULT_AIM_DEAD_ZONE = 2, MAX_AIM_DEAD_ZONE = 12;
export function normalizeAimDeadZone(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(MAX_AIM_DEAD_ZONE, Math.round(value))) : DEFAULT_AIM_DEAD_ZONE;
}
export class AimDeadZone {
  constructor(x, y) { this.anchor = { x, y }; }
  move(x, y, radius, hasAim) {
    const threshold = normalizeAimDeadZone(radius);
    if (hasAim && threshold > 0 && Math.hypot(x - this.anchor.x, y - this.anchor.y) <= threshold) return false;
    this.anchor = { x, y };
    return true;
  }
}
