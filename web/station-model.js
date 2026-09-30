// Cosmetic camera state only. No wallet, production, or run modifiers.
export const defaultStationCamera = () => ({ x: 0, z: 0, zoom: 1 });
const bound = (value, min, max, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
export const normalizeStationCamera = camera => ({ x: bound(camera?.x, -4, 4, 0), z: bound(camera?.z, -4, 4, 0), zoom: bound(camera?.zoom, .7, 1.8, 1) });
export const freshStation = () => ({ version: 1, camera: defaultStationCamera() });
export function normalizeStation(raw) {
  return raw?.version === 1 ? { version: 1, camera: normalizeStationCamera(raw.camera) } : freshStation();
}
