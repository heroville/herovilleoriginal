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
import type { GameConfig } from '../types/index.ts';

const gameConfig: GameConfig = {
  buildings: buildings as GameConfig['buildings'],
  blueprints: blueprints as GameConfig['blueprints'],
  weapons: weapons as unknown as GameConfig['weapons'],
  potions: potions as GameConfig['potions'],
  events: events as GameConfig['events'],
  heroClasses: heroClasses as GameConfig['heroClasses'],
};

export default gameConfig;
