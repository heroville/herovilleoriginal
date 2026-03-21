/**
 * Service container: wires all game services.
 * Uses setTimeout for delayed calls and a getter for lazy resolution (e.g. DungeonService → CombatService).
 */
import gameConfig from './constants/gameConfig.data.js';
import GameStateServiceFactory from './services/gameState.service.js';
import GameUiServiceFactory from './services/gameUi.service.js';
import EconomyServiceFactory from './services/economy.service.js';
import UtilServiceFactory from './services/util.service.js';
import UiServiceFactory from './services/ui.service.js';
import SaveLoadServiceFactory from './services/saveLoad.service.js';
import ProductionServiceFactory from './services/production.service.js';
import DungeonServiceFactory from './services/dungeon.service.js';
import HeroServiceFactory from './services/hero.service.js';
import CombatServiceFactory from './services/combat.service.js';
import BuildingServiceFactory from './services/building.service.js';

const container = {};
const $timeout = (fn, ms) => setTimeout(fn, ms || 0);
const $injector = { get: (name) => container[name] };

container.GameConfig = gameConfig;
container.GameStateService = GameStateServiceFactory(container.GameConfig);
container.GameUiService = GameUiServiceFactory();
container.EconomyService = EconomyServiceFactory(container.GameUiService);
container.UtilService = UtilServiceFactory();
container.UiService = UiServiceFactory(container.GameStateService);
container.SaveLoadService = SaveLoadServiceFactory(
  container.GameConfig,
  container.GameUiService,
  container.GameStateService
);
container.ProductionService = ProductionServiceFactory(
  container.EconomyService,
  container.GameUiService
);
container.DungeonService = DungeonServiceFactory(container.GameStateService, $timeout, $injector);
container.HeroService = HeroServiceFactory(
  container.GameConfig,
  container.EconomyService,
  container.GameStateService,
  container.GameUiService,
  container.DungeonService,
  container.ProductionService,
  container.UtilService
);
container.CombatService = CombatServiceFactory(
  container.GameStateService,
  container.HeroService,
  container.DungeonService,
  container.GameUiService,
  container.GameConfig,
  $timeout
);
container.BuildingService = BuildingServiceFactory(
  container.GameStateService,
  container.GameUiService,
  container.DungeonService,
  container.ProductionService
);

export const GameStateService = container.GameStateService;
export const GameUiService = container.GameUiService;
export const EconomyService = container.EconomyService;
export const SaveLoadService = container.SaveLoadService;
export const HeroService = container.HeroService;
export const BuildingService = container.BuildingService;
export const ProductionService = container.ProductionService;
export const UiService = container.UiService;
export const DungeonService = container.DungeonService;
export const CombatService = container.CombatService;
export const UtilService = container.UtilService;
export default container;
