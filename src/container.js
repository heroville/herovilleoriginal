/**
 * Service container: wires all game services.
 * Creates the Redux store first (from GameConfig initial state), then passes it to each service.
 * Services read/write state exclusively via the Redux store — no GameStateService.
 */
import gameConfig from './constants/gameConfig.data.js';
import GameStateServiceFactory from './services/gameState.service.js';
import GameUiServiceFactory from './services/gameUi.service.js';
import EconomyServiceFactory from './services/economy.service.js';
import UtilServiceFactory from './services/util.service.js';
import SaveLoadServiceFactory from './services/saveLoad.service.js';
import ProductionServiceFactory from './services/production.service.js';
import DungeonServiceFactory from './services/dungeon.service.js';
import HeroServiceFactory from './services/hero.service.js';
import CombatServiceFactory from './services/combat.service.js';
import BuildingServiceFactory from './services/building.service.js';
import { createGameStore } from './store/index.js';

const container = {};
const $timeout = (fn, ms) => setTimeout(fn, ms || 0);
const $injector = { get: (name) => container[name] };

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
  $timeout
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
