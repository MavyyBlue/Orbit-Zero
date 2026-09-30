// Lightweight host: 3D code is imported only when the station is opened.
export class StationHub {
  constructor(viewport, { getCamera, getReduced, onCamera, onBuilding, onStatus }) {
    this.viewport = viewport; this.options = { getCamera, getReduced, onCamera, onBuilding, onStatus };
    this.generation = 0; this.view = null; this.opened = false;
  }
  async open() {
    this.opened = true; const generation = ++this.generation; this.status('loading');
    try {
      const { StationView } = await import('./station-view.js');
      if (!this.opened || generation !== this.generation) return;
      this.view = new StationView(this.viewport, { camera: this.options.getCamera(), reduced: this.options.getReduced(), onCamera: this.options.onCamera, onBuilding: this.options.onBuilding, onStatus: value => this.status(value) });
    } catch {
      if (this.opened && generation === this.generation) this.status('fallback');
    }
  }
  status(value) {
    this.viewport.dataset.renderer = value;
    this.options.onStatus(value);
  }
  suspend() { this.view?.suspend(); }
  reset() { this.view?.reset(); }
  zoom(factor) { this.view?.zoom(factor); }
  close() { if (!this.opened) return; this.opened = false; this.generation++; this.view?.destroy(); this.view = null; }
}
