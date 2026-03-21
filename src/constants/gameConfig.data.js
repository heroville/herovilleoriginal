/**
 * Game configuration: imports domain data from public/models/*.json.
 * Vite bundles JSON imports; no runtime fetch needed for this data.
 * Source of truth for all static game data — edit the JSON files to tune game balance.
 */
import buildings from '../../public/models/buildings.json';
import blueprints from '../../public/models/blueprints.json';
import weapons from '../../public/models/weapons.json';
import potions from '../../public/models/potions.json';
import events from '../../public/models/events.json';
import heroClasses from '../../public/models/heroClasses.json';

const gameConfig = {
  buildings,
  blueprints,
  weapons,
  potions,
  events,
  heroClasses,
};

export default gameConfig;
