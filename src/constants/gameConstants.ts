/**
 * Named constants for game logic — building indices, class indices, potion indices,
 * timing, and progression formulae. Edit here to tune the game.
 */

// Building array indices (buildings[] in game state)
export const BUILDING_TENT = 0;
export const BUILDING_STOCKPILE = 1;
export const BUILDING_MARKET = 2;
export const BUILDING_BLACKSMITH = 3;
export const BUILDING_TAVERN = 4;
export const BUILDING_ALCHEMIST = 5;
export const BUILDING_DUNGEONS = 6;
export const BUILDING_ACADEMY = 7;
export const BUILDING_ELITE_DUNGEONS = 8;
export const BUILDING_WORK_HUT = 9;

// Hero class IDs (hero.academy.id)
export const CLASS_FIGHTER = 0;
export const CLASS_WORKER = 1;
export const CLASS_TREASURE_HUNTER = 2;

// Potion slot indices (potions[] in game state; -1 = basic potion)
export const POTION_BASIC = -1;
export const POTION_REGEN = 0;
export const POTION_POWER = 1;
export const POTION_HEALTH = 2;
export const POTION_GOOD_HEALTH = 3;
export const POTION_GREAT_HEALTH = 4;

// Hero starting stats
export const HERO_BASE_HEALTH = 100;
export const HERO_BASE_XP_THRESHOLD = 50; // XP required for level 2
export const HERO_HEALTH_PER_LEVEL = 50;
export const HERO_XP_PER_LEVEL = 25; // added to next-XP threshold each level

// Combat multipliers
export const POWER_POTION_DAMAGE_MULTIPLIER = 1.5;
export const TREASURE_HUNTER_LOOT_BONUS = 0.15;
export const WEAPON_DURABILITY_LOW_THRESHOLD = 0.2; // 20% — trigger repair
export const MONSTER_XP_MULTIPLIER = 5; // XP = monster.value * 5
export const MULTI_HERO_SCALE_FACTOR = 10; // stat multiplier when heroes fight together

// Hero resting
export const HERO_REST_HEAL_PERCENT = 2; // % of max health recovered per tick at rest

// Production
export const PROGRESS_SYNC_THROTTLE_MS = 500; // min ms between production progress Redux syncs
export const WORKER_PROD_SPEED_PER_LEVEL = 0.05; // prodTime reduction per hero level
export const WORKER_XP_PER_CRAFT = 2; // XP divisor for crafting: prodTime / WORKER_XP_PER_CRAFT

// Game loop / timing
export const DEFAULT_GAME_LOOP_MS = 1000;
export const MAX_GAME_LOOP_MS = 5000;
export const SAVE_INTERVAL_MS = 30_000;
export const RANDOM_EVENT_BASE_DELAY_MS = 600_000; // 10 minutes base + up to 10 min variance

// Hero automation
export const HERO_AUTO_HEAL_THRESHOLD = 0.5; // use a health potion when currHealth drops below this fraction of max HP

// Status effects
export const STATUS_POISON_TICK_PERCENT = 5;     // % of max HP dealt as damage per poison tick
export const STATUS_STUN_SKIP_CHANCE = 1.0;       // 1.0 = 100%: stun always skips the entity's turn
export const STATUS_ARMOR_BREAK_MULTIPLIER = 0.5; // +50% damage taken while armor is broken

// Dungeon generation
export const MONSTERS_PER_BATCH = 3;
export const MONSTER_HEALTH_MULTIPLIER = 5;
export const MONSTER_LOOT_MULTIPLIER = 3;
export const MAX_MONSTERS_PER_ENCOUNTER = 4;
export const DUNGEON_STEPS_MULTIPLIER = 15;
export const MAX_DUNGEON_COUNT = 14; // disable dungeon building above this count
export const BOSS_LEVEL_OFFSET = 2; // boss level = dungeon level + BOSS_LEVEL_OFFSET
