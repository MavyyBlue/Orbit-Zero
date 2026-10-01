// Integrated areas of one outpost. Feature keys stay independent of geometry.
export const STATION_BUILDINGS = Object.freeze([
  { id: 'hangar', name: 'Hangar', short: 'Your fleet', x: 0, z: -.5, color: '#8ff4e0', feature: 'ships', description: 'Choose your ship, unlock a new silhouette, and prepare for the next launch.' },
  { id: 'engineering_bay', name: 'Engineering Bay', short: 'Future upgrades', x: 2.7, z: -1.8, color: '#c5a6ff', feature: 'planned', description: 'The attached service wing will house permanent upgrades. Engineering systems will arrive in a later phase; your flight physics are unchanged.' },
  { id: 'stardust_harvester', name: 'Stardust Harvester', short: 'Future production', x: -3.6, z: 3.4, color: '#ffe0a0', feature: 'planned', description: 'This collector installation will gather a little Stardust between runs. Production, storage and collection are not active yet.' },
  { id: 'astronaut_station', name: 'Astronaut Station', short: 'Future technicians', x: -4.1, z: -1, color: '#ff987d', feature: 'planned', description: 'The habitation and communications tower will be home to your technicians. Hiring and assignments will arrive after the economy is ready.' },
  { id: 'martian_garden', name: 'Martian Garden', short: 'Future growing plot', x: 4.1, z: 1, color: '#a6d781', feature: 'planned', description: 'A reserved greenhouse and garden plot for unusual Martian vegetation. The plants are decorative for now; growing, harvesting and garden automation will arrive in a later phase.' }
]);
export const stationBuilding = id => STATION_BUILDINGS.find(building => building.id === id);
