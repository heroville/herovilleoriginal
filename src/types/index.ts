/**
 * Core data model type definitions for HeroVille.
 * These are consumed by JSDoc @type annotations (// @ts-check) in .js files
 * and can be imported directly in future .ts/.tsx files.
 */

// ─── Economy ───────────────────────────────────────────────────────────────

export interface EconomyState {
  resources: number;
  maxResources: number;
  gold: number;
  maxGold: number;
  incr: number;
  damageMulti: number;
  goldMulti: number;
}

// ─── Hero ──────────────────────────────────────────────────────────────────

export interface HeroClass {
  id: number;
  name: string;
}

export interface HeroJob {
  id: number;
  name: string;
  limit: number;
  current: number;
}

export interface Potion {
  id: number;
  name: string;
  count: number;
  active: boolean;
}

export interface Weapon {
  id: number;
  name: string;
  damage: number;
  cost: number;
  count: number;
  working: number;
  maxCount: number;
  durability: number;
  maxDurability: number;
  enabled: boolean;
  heroClass?: HeroClass[];
}

export interface HeroEquip {
  weapon: Weapon;
  potions: Potion[];
}

export interface Hero {
  id: number;
  name: string;
  currHealth: number;
  health: number;
  level: number;
  experience: number;
  next: number;
  equip: HeroEquip;
  location: string;
  progress: string;
  dungeon: number;
  clearCount: number;
  working: boolean;
  job: HeroJob;
  academy: HeroClass;
  party: boolean;
}

// ─── Building ─────────────────────────────────────────────────────────────

export interface Building {
  id: number;
  name: string;
  count: number;
  cost: number;
  enabled: boolean;
  description: string;
  multiplier: number;
  tier?: number;
}

// ─── Dungeon / Monster ────────────────────────────────────────────────────

export interface Monster {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  value: number;
  loot: number;
  xp: number;
}

export interface Dungeon {
  id: number;
  name: string;
  level: number;
  enabled: boolean;
  boss: string;
  bossID?: number;
  length: number;
  encounterRate: number;
}

// ─── Upgrade ──────────────────────────────────────────────────────────────

export interface Upgrade {
  id: number;
  name: string;
  price: number;
  enabled: boolean;
  purchased: boolean;
}

// ─── Game Stats ───────────────────────────────────────────────────────────

export interface GameStats {
  weaponsBought: number;
  clicks: number;
}

// ─── Game State (flat) ────────────────────────────────────────────────────

export interface GameState extends EconomyState {
  heroList: Hero[];
  heroClass: HeroClass[];
  jobs: HeroJob[];
  buildings: Building[];
  dungeons: Dungeon[];
  bosses: Monster[];
  monsters: Monster[];
  weapons: Weapon[];
  potions: Potion[];
  upgrades: Upgrade[];
  gameStats: GameStats;
  gameLoop: number;
  tutorialStepIndex: number;
  tutorialCompleted: boolean;
  gameLog: string[];
  randomE: string | null;
  randomEventTimer: number;
  events: string[];
  panelNumber: number;
  heroName?: { first: string[]; title: string[] };
  monsterList?: unknown[];
  dungeonNames?: unknown[];
  sorting?: Record<string, string>;
  hFilterString?: Record<string, string>;
  showHeroTable?: { enabled: boolean };
  heroTable?: boolean;
  successCount?: { amount: number };
  lossCount?: { amount: number };
  tempClass?: HeroClass | null;
  tempHero?: number | null;
}

// ─── Redux Store Shape ────────────────────────────────────────────────────

export interface RootState {
  economy: EconomyState & { incr: number; damageMulti: number; goldMulti: number };
  heroes: { heroList: Hero[]; heroClass: HeroClass[]; jobs: HeroJob[] };
  production: { weapons: Weapon[]; potions: Potion[]; upgrades: Upgrade[]; blueprints: unknown[] };
  town: { buildings: Building[]; dungeons: Dungeon[]; bosses: Monster[] };
  combat: { battles: unknown[]; monsters: Monster[] };
  gameStats: GameStats;
  tutorial: { tutorialStepIndex: number; tutorialCompleted: boolean; gameLog: string[] };
  ui: { panelNumber: number; activeTab: string; darkMode: boolean };
}
