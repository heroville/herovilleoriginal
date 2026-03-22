/**
 * Service container: wires all game services.
 * Creates the Redux store first (from GameConfig initial state), then passes it to each service.
 * Services read/write state exclusively via the Redux store — no GameStateService.
 */
import gameConfig from './constants/gameConfig.data.ts';
import GameStateServiceFactory from './services/gameState.service.ts';
import GameUiServiceFactory from './services/gameUi.service.ts';
import EconomyServiceFactory from './services/economy.service.ts';
import UtilServiceFactory from './services/util.service.ts';
import SaveLoadServiceFactory from './services/saveLoad.service.ts';
import ProductionServiceFactory from './services/production.service.ts';
import DungeonServiceFactory from './services/dungeon.service.ts';
import HeroServiceFactory from './services/hero.service.ts';
import CombatServiceFactory from './services/combat.service.ts';
import BuildingServiceFactory from './services/building.service.ts';
import { createGameStore } from './store/index.ts';
import type { GameUiServiceInstance } from './services/gameUi.service.ts';
import type { EconomyServiceInstance } from './services/economy.service.ts';
import type { SaveLoadServiceInstance } from './services/saveLoad.service.ts';
import type { ProductionServiceInstance } from './services/production.service.ts';
import type { DungeonServiceInstance } from './services/dungeon.service.ts';
import type { HeroServiceInstance } from './services/hero.service.ts';
import type { CombatServiceInstance } from './services/combat.service.ts';
import type { BuildingServiceInstance } from './services/building.service.ts';
import type { UtilServiceInstance } from './services/util.service.ts';

interface Container {
  GameConfig: typeof gameConfig;
  GameUiService: GameUiServiceInstance;
  EconomyService: EconomyServiceInstance;
  UtilService: UtilServiceInstance;
  SaveLoadService: SaveLoadServiceInstance;
  ProductionService: ProductionServiceInstance;
  DungeonService: DungeonServiceInstance;
  HeroService: HeroServiceInstance;
  CombatService: CombatServiceInstance;
  BuildingService: BuildingServiceInstance;
  [key: string]: unknown;
}

const container = {} as Container;
const $timeout = (fn: () => void, ms?: number) => setTimeout(fn, ms || 0);
const $injector = { get: (name: string) => container[name] as { startFight(monList: import('./types/index.ts').Monster[], journey: unknown, boss: boolean): void } };

container.GameConfig = gameConfig;

// Use GameStateServiceFactory only to produce the initial flat state for store hydration.
// After the store is created, GameStateService is not used by any service at runtime.
const _initialFlat = GameStateServiceFactory(container.GameConfig).getState();
export const store = createGameStore(_initialFlat);

container.GameUiService = GameUiServiceFactory();
container.EconomyService = EconomyServiceFactory(container.GameUiService, store);
container.UtilService = UtilServiceFactory();
container.SaveLoadService = SaveLoadServiceFactory(
  container.GameConfig,
  container.GameUiService,
  store
);
container.ProductionService = ProductionServiceFactory(
  container.EconomyService,
  container.GameUiService,
  store
);
container.DungeonService = DungeonServiceFactory(store, $timeout, $injector);
container.HeroService = HeroServiceFactory(
  container.GameConfig,
  container.EconomyService,
  store,
  container.GameUiService,
  container.DungeonService,
  container.ProductionService,
  container.UtilService
);
container.CombatService = CombatServiceFactory(
  store,
  container.HeroService,
  container.DungeonService,
  container.GameUiService,
  container.GameConfig,
  $timeout,
  container.EconomyService
);
container.BuildingService = BuildingServiceFactory(
  store,
  container.GameUiService,
  container.DungeonService,
  container.ProductionService
);

export const GameUiService = container.GameUiService;
export const EconomyService = container.EconomyService;
export const SaveLoadService = container.SaveLoadService;
export const HeroService = container.HeroService;
export const BuildingService = container.BuildingService;
export const ProductionService = container.ProductionService;
export const DungeonService = container.DungeonService;
export const CombatService = container.CombatService;
export const UtilService = container.UtilService;
export default container;
