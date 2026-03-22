/**
 * Core data model type definitions for HeroVille.
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
  enabled?: boolean;
  description?: string;
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
  damage?: number;
  minDamage: number;
  maxDamage: number;
  cost: number;
  count: number;
  working: number;
  maxCount: number;
  durability: number;
  maxDurability?: number;
  enabled: boolean;
  heroClass?: HeroClass[] | number[];
  image?: string;
  sellPrice?: number;
  prodTime?: number;
  progress?: string;
  broken?: boolean;
}

export interface HeroEquip {
  weapon: Weapon;
  potions: Potion[];
  gold: number;
  scrap: number;
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
  autoAdventure?: boolean;
  /** Active status effects on this hero (optional; absent = no effects). */
  statusEffects?: StatusEffect[];
}

// ─── Building ─────────────────────────────────────────────────────────────

export interface Building {
  id: number;
  name: string;
  count: number;
  cost: number;
  enabled: boolean;
  description?: string;
  multiplier: number;
  tier?: number;
}

// ─── Blueprint ────────────────────────────────────────────────────────────

export interface Blueprint {
  id: number;
  name: string;
  cost: number;
  enabled: boolean;
  buildingID: number;
  description?: string;
  progress?: string;
  working?: number;
}

// ─── Status Effects ───────────────────────────────────────────────────────

export type StatusEffectType = 'stun' | 'poison' | 'armorBreak' | 'burn';

export interface StatusEffect {
  type: StatusEffectType;
  /** Turns remaining before the effect expires. */
  duration: number;
  /** Poison/burn: percent of max HP dealt as damage per turn (0–100). armorBreak: % damage multiplier increase (0–1). stun: unused. */
  magnitude: number;
  /** ID of the hero or monster that applied the effect, for tracking purposes. */
  sourceId?: number;
}

// ─── Dungeon / Monster ────────────────────────────────────────────────────

export interface Monster {
  id: number;
  name: string;
  health: number;
  maxHealth?: number;
  damage?: number;
  minDamage: number;
  maxDamage: number;
  value: number;
  loot?: number;
  xp?: number;
  low?: string;
  high?: string;
  /** Active status effects on this monster (optional; absent = no effects). */
  statusEffects?: StatusEffect[];
}

export interface Dungeon {
  id: number;
  name: string;
  level: number;
  enabled: boolean;
  boss?: string;
  bossID?: number;
  length?: number;
  encounterRate: number;
  steps?: number;
  encounterLevel?: number;
  reward?: string;
}

export interface DungeonJourney {
  id: number;
  name: string;
  level: number;
  enabled?: boolean;
  boss?: string;
  bossID?: number;
  steps: number;
  encounterRate: number;
  encounterLevel: number;
  reward: string;
}

export interface Battle {
  id: number;
  hero: Hero[];
  copyMonsters: Monster[];
  experience: number;
  boss: boolean;
}

export interface Journey {
  hero: Hero[];
  dungeon: DungeonJourney;
  steps: number;
}

// ─── Upgrade ──────────────────────────────────────────────────────────────

export interface Upgrade {
  id: number;
  name: string;
  price: number;
  enabled: boolean;
  purchased: boolean;
}

// ─── Potion item (craftable) ──────────────────────────────────────────────

export interface PotionItem {
  id: number;
  name: string;
  count: number;
  working: number;
  maxCount: number;
  cost: number;
  prodTime: number;
  progress: string;
  sellPrice: number;
  healing?: number;
  enabled?: boolean;
  image?: string;
  description?: string;
  maxHero?: number;
  value?: number;
  active?: boolean;
}

// ─── Game Stats ───────────────────────────────────────────────────────────

export interface GameStats {
  battles: number;
  wins: number;
  losses: number;
  weaponsAuto: number;
  weaponsManual: number[];
  buffs: number;
  clicks: number;
}

// ─── Game Config ──────────────────────────────────────────────────────────

export interface GameConfig {
  buildings?: Building[];
  blueprints?: Blueprint[];
  weapons?: Weapon[];
  potions?: PotionItem[];
  events?: Array<string | { type: string; image: string }>;
  heroClasses?: HeroClass[];
}

// ─── Redux Slice States ───────────────────────────────────────────────────

export interface UiState {
  panel: string[];
  panelNumber: number;
  showTutorial: boolean;
  panelInfo: boolean;
  dark: boolean;
  sorting: Record<string, string | boolean>;
  showHeroTable: { enabled?: boolean };
  heroTable: boolean;
  heroEnabled: boolean;
  prodEnabled: boolean;
  upgEnabled: boolean;
  beastEnabled: boolean;
  hFilterString: Record<string, string>;
  heroCollapse: boolean;
  successCount: { amount: number };
  lossCount: { amount: number };
  optionsSuccess: number[];
  optionsLoss: number[];
  version: string;
  bestiary: boolean;
  predicate: string;
  selectedDungeon: number;
}

export interface TutorialState {
  tutorialStepIndex: number;
  tutorialCompleted: boolean;
  gameLog: string[];
}

export interface RandomEvent {
  type: string;
  image: string;
}

export interface ConfigState {
  gameLoop: number;
  randomE: string | RandomEvent | null | undefined;
  randomEventTimer: number | undefined;
  restAmount: number;
  heroName: { first: string[]; title: string[] } | null;
  monsterList: { monsters: Array<{ name: string }> } | null;
  dungeonNames: { dungeons: string[] } | null;
  tempClass: HeroClass | null;
  tempHero: number | null;
  events: Array<string | { type: string; image: string }>;
  heroClass: HeroClass[];
}

export interface HeroesState {
  heroList: Hero[];
  battles: Battle[];
  journeys: Journey[];
  party: Hero[];
  bossBattle: Monster[];
}

export interface DungeonsState {
  dungeons: Dungeon[];
  monsters: Monster[];
  bosses: Monster[];
}

export interface ProductionState {
  potion: PotionItem;
  potions: PotionItem[];
  weapons: Weapon[];
  blueprints: Blueprint[];
}

// ─── Redux Store Shape ────────────────────────────────────────────────────

export interface RootState {
  economy: EconomyState;
  ui: UiState;
  tutorial: TutorialState;
  config: ConfigState;
  buildings: Building[];
  heroes: HeroesState;
  dungeons: DungeonsState;
  production: ProductionState;
  jobs: HeroJob[];
  upgrades: Upgrade[];
  gameStats: GameStats;
}

// ─── Flat Game State (used by services) ───────────────────────────────────

export interface FlatGameState extends EconomyState, UiState, TutorialState {
  // Config
  gameLoop: number;
  randomE: string | RandomEvent | null | undefined;
  randomEventTimer: number | undefined;
  restAmount: number;
  heroName: { first: string[]; title: string[] } | null;
  monsterList: { monsters: Array<{ name: string }> } | null;
  dungeonNames: { dungeons: string[] } | null;
  tempClass: HeroClass | null;
  tempHero: number | null;
  events: Array<string | { type: string; image: string }>;
  heroClass: HeroClass[];
  // Heroes
  heroList: Hero[];
  battles: Battle[];
  journeys: Journey[];
  party: Hero[];
  bossBattle: Monster[];
  // Dungeons
  dungeons: Dungeon[];
  monsters: Monster[];
  bosses: Monster[];
  // Production
  potion: PotionItem;
  potions: PotionItem[];
  weapons: Weapon[];
  blueprints: Blueprint[];
  // Other
  buildings: Building[];
  jobs: HeroJob[];
  upgrades: Upgrade[];
  gameStats: GameStats;
}

// ─── Service interfaces ───────────────────────────────────────────────────

export interface GameUiServiceType {
  register(scope: unknown): void;
  showError(msg: string): void;
  nextTutorial(): void;
  checkTutorialProgress(state: { resources: number; gold: number; tutorialStepIndex: number }): void;
  openHeroDialog(): void;
  openWorkerDialog(): void;
}

export interface EconomyServiceType {
  incResources(value: number): number;
  decResources(value: number): boolean;
  incGold(value: number): number;
  decGold(value: number): boolean;
  incrRes(multi?: number): void;
}
