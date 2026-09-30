// Pointer gesture arbitration is separate from flight's accepted drag controls.
export class StationGesture {
  constructor({ onPan, onZoom, onTap }) {
    this.callbacks = { onPan, onZoom, onTap }; this.cancel();
  }
  cancel() { this.pointers = new Map(); this.start = null; this.moved = false; this.multi = false; this.pinch = null; }
  pair() {
    const [a, b] = [...this.pointers.values()];
    return a && b ? { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null;
  }
  down(id, x, y) {
    this.pointers.set(id, { x, y });
    if (this.pointers.size === 1) { this.start = { x, y }; this.moved = false; this.multi = false; }
    else { this.multi = true; this.pinch = this.pair(); }
  }
  move(id, x, y) {
    const previous = this.pointers.get(id); if (!previous) return;
    this.pointers.set(id, { x, y });
    if (this.pointers.size > 1) {
      const next = this.pair();
      if (next && this.pinch?.distance > 0) {
        this.callbacks.onZoom(next.distance / this.pinch.distance, next.x, next.y);
        this.callbacks.onPan(next.x - this.pinch.x, next.y - this.pinch.y);
      }
      this.pinch = next; return;
    }
    if (Math.hypot(x - this.start.x, y - this.start.y) > 7) this.moved = true;
    if (this.moved || this.multi) this.callbacks.onPan(x - previous.x, y - previous.y);
  }
  up(id, x, y, cancelled = false) {
    if (!this.pointers.has(id)) return;
    const tap = !cancelled && !this.multi && !this.moved && Math.hypot(x - this.start.x, y - this.start.y) <= 7;
    this.pointers.delete(id); this.pinch = this.pair();
    if (tap) this.callbacks.onTap(x, y);
    if (!this.pointers.size) this.cancel();
  }
}
