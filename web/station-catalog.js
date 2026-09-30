// Fixed plots for the foundation. Feature keys stay independent of scene geometry.
export const STATION_BUILDINGS = Object.freeze([
  { id: 'hangar', name: 'Hangar', short: 'Your fleet', x: -2.6, z: 2.4, color: '#8ff4e0', feature: 'ships', description: 'Choose your ship, unlock a new silhouette, and prepare for the next launch.' },
  { id: 'engineering_bay', name: 'Engineering Bay', short: 'Future upgrades', x: -2.6, z: -2.4, color: '#c5a6ff', feature: 'planned', description: 'A home for permanent upgrades. Engineering systems will arrive in a later phase; your flight physics are unchanged.' },
  { id: 'stardust_harvester', name: 'Stardust Harvester', short: 'Future production', x: 2.6, z: -2.4, color: '#ffe0a0', feature: 'planned', description: 'Future collectors will gather a little Stardust between runs. Production, storage and collection are not active yet.' },
  { id: 'astronaut_station', name: 'Astronaut Station', short: 'Future technicians', x: 2.6, z: 2.4, color: '#ff987d', feature: 'planned', description: 'Future technicians will tend your orbital operation. Hiring and assignments will arrive after the economy is ready.' }
]);
export const stationBuilding = id => STATION_BUILDINGS.find(building => building.id === id);
