/**
 * Balance simulation script for Heroville.
 *
 * Reads the actual game data files (buildings.json, weapons.json, potions.json)
 * and game constants to simulate progression breakpoints, gold income, and
 * resource generation cadence.
 *
 * Run: npx tsx scripts/balance-sim.ts
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Load game data ──────────────────────────────────────────────────────────

interface Building {
  id: number;
  name: string;
  cost: number;
  multiplier: number;
  count: number;
}

interface Weapon {
  id: number;
  name: string;
  sellPrice: number;
  minDamage: number;
  maxDamage: number;
}

interface Potion {
  id: number;
  name: string;
  sellPrice: number;
  cost: number;
  value: number;
  type: number;
}

const buildings: Building[] = JSON.parse(
  readFileSync(resolve(root, 'public/models/buildings.json'), 'utf-8')
);
const weapons: Weapon[] = JSON.parse(
  readFileSync(resolve(root, 'public/models/weapons.json'), 'utf-8')
);
const potions: Potion[] = JSON.parse(
  readFileSync(resolve(root, 'public/models/potions.json'), 'utf-8')
);

// ── Import constants (re-declare to avoid TS module resolution issues) ──────

const HERO_BASE_HEALTH = 100;
const HERO_HEALTH_PER_LEVEL = 75;
const MONSTER_HEALTH_MULTIPLIER = 3;
const WEAPON_UPKEEP_RATE = 0.5;
const HERO_REST_HEAL_PERCENT = 2;
const DUNGEON_STEPS_MULTIPLIER = 15;

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcBuildingCost(base: number, count: number, mult: number): number {
  return Math.ceil(base + Math.pow(count + 1, mult));
}

function pad(s: string | number, width: number): string {
  return String(s).padStart(width);
}

function header(title: string): void {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

// ── 1. Building Progression ─────────────────────────────────────────────────

header('BUILDING COST PROGRESSION');

for (const b of buildings) {
  console.log(`\n  ${b.name} (base=${b.cost}, mult=${b.multiplier}):`);
  console.log('    Level | Cost      | Cumulative');
  console.log('    ------+-----------+-----------');
  let cumulative = 0;
  for (let level = 0; level < 8; level++) {
    const cost = calcBuildingCost(b.cost, level, b.multiplier);
    cumulative += cost;
    console.log(
      `    ${pad(level + 1, 5)} | ${pad(cost, 9)} | ${pad(cumulative, 9)}`
    );
  }
}

// ── 2. Stockpile Cap Progression ────────────────────────────────────────────

header('STOCKPILE CAP PROGRESSION');

const stockpile = buildings.find((b) => b.name === 'Stockpile')!;
console.log('\n  Level | Next Cost | Resource Cap | Gold Cap | Cost/Cap %');
console.log('  ------+-----------+--------------+----------+-----------');

for (let level = 0; level < 8; level++) {
  const nextCost = calcBuildingCost(stockpile.cost, level, stockpile.multiplier);
  const resCap = nextCost + Math.floor(nextCost / 5);
  const goldCap = Math.floor(nextCost / 5);
  const ratio = ((nextCost / resCap) * 100).toFixed(1);
  console.log(
    `  ${pad(level + 1, 5)} | ${pad(nextCost, 9)} | ${pad(resCap, 12)} | ${pad(goldCap, 8)} | ${pad(ratio, 8)}%`
  );
}

// ── 3. Dungeon Gold Income ──────────────────────────────────────────────────

header('DUNGEON GOLD INCOME (per run)');

console.log('\n  Dungeon | Steps | ~Encounters | ~Monsters | Gold(monsters) | Gold(reward) | Total Gold');
console.log('  --------+-------+-------------+-----------+----------------+--------------+-----------');

for (let dLevel = 1; dLevel <= 14; dLevel++) {
  const steps = DUNGEON_STEPS_MULTIPLIER * dLevel;
  const encounterRate = 0.175; // ~17.5% per step
  const encounters = Math.round(steps * encounterRate);
  const monstersPerEncounter = Math.min(4, Math.max(2, dLevel));
  const totalMonsters = encounters * monstersPerEncounter;

  const goldPerDrop = Math.ceil(dLevel * 0.6);
  const dropRate = 0.10;
  const goldFromMonsters = totalMonsters * dropRate * goldPerDrop;

  const rewardGold = Math.ceil((dLevel + 1) * 0.5);
  const totalGold = goldFromMonsters + rewardGold;

  console.log(
    `  ${pad(dLevel, 7)} | ${pad(steps, 5)} | ${pad(encounters, 11)} | ${pad(totalMonsters, 9)} | ${pad(goldFromMonsters.toFixed(1), 14)} | ${pad(rewardGold, 12)} | ${pad(totalGold.toFixed(1), 9)}`
  );
}

// ── 4. Hero Economy (gold per dungeon after upkeep) ─────────────────────────

header('HERO ECONOMY: NET GOLD PER DUNGEON');

console.log('\n  Dungeon | Weapon       | Gross Gold | Upkeep | Net Gold | Runs to next weapon | Next weapon');
console.log('  --------+--------------+------------+--------+----------+---------------------+-----------');

for (let dLevel = 1; dLevel <= 10; dLevel++) {
  // Estimate which weapon tier a hero at this dungeon level would have
  const weaponIdx = Math.min(dLevel, weapons.length - 1);
  const weapon = weapons[weaponIdx];
  const nextWeapon = weaponIdx + 1 < weapons.length ? weapons[weaponIdx + 1] : null;

  const steps = DUNGEON_STEPS_MULTIPLIER * dLevel;
  const encounters = Math.round(steps * 0.175);
  const totalMonsters = encounters * Math.min(4, Math.max(2, dLevel));
  const goldPerDrop = Math.ceil(dLevel * 0.6);
  const goldFromMonsters = totalMonsters * 0.10 * goldPerDrop;
  const rewardGold = Math.ceil((dLevel + 1) * 0.5);
  const grossGold = goldFromMonsters + rewardGold;

  const upkeep = Math.ceil((weapon.sellPrice ?? 0) * WEAPON_UPKEEP_RATE);
  const netGold = grossGold - upkeep;

  const runsToNext = nextWeapon ? Math.ceil(nextWeapon.sellPrice / Math.max(1, netGold)) : '-';

  console.log(
    `  ${pad(dLevel, 7)} | ${weapon.name.padEnd(12)} | ${pad(grossGold.toFixed(1), 10)} | ${pad(upkeep, 6)} | ${pad(netGold.toFixed(1), 8)} | ${pad(String(runsToNext), 19)} | ${(nextWeapon?.name ?? 'MAX').padEnd(12)}`
  );
}

// ── 5. Healing Cadence ──────────────────────────────────────────────────────

header('HEALING CADENCE');

console.log('\n  Level | Max HP | Ticks to full heal (rest) | Basic potions to full | Gold cost');
console.log('  ------+--------+---------------------------+-----------------------+----------');

const basicPotionHeal = 50;
const basicPotionPrice = 2;

for (let level = 1; level <= 20; level++) {
  const maxHP = HERO_BASE_HEALTH + (level - 1) * HERO_HEALTH_PER_LEVEL;
  const healPerTick = Math.floor((maxHP / 100) * HERO_REST_HEAL_PERCENT);
  const ticksToFull = healPerTick > 0 ? Math.ceil(maxHP / healPerTick) : Infinity;
  const potionsNeeded = Math.ceil(maxHP / basicPotionHeal);
  const goldCost = potionsNeeded * basicPotionPrice;

  console.log(
    `  ${pad(level, 5)} | ${pad(maxHP, 6)} | ${pad(ticksToFull, 25)} | ${pad(potionsNeeded, 21)} | ${pad(goldCost, 8)}`
  );
}

// ── 6. Resource Generation ──────────────────────────────────────────────────

header('RESOURCE GENERATION (per minute, 60 ticks)');

console.log('\n  Heroes | Avg Level | Res/tick (heroes) | Res/min (heroes) | Res/min (click) | Total/min');
console.log('  -------+-----------+-------------------+------------------+-----------------+----------');

for (const scenario of [
  { heroes: 1, avgLevel: 1 },
  { heroes: 1, avgLevel: 5 },
  { heroes: 2, avgLevel: 3 },
  { heroes: 3, avgLevel: 5 },
  { heroes: 3, avgLevel: 10 },
  { heroes: 5, avgLevel: 10 },
  { heroes: 5, avgLevel: 15 },
]) {
  // Heroes generate resources only when at home (healing).
  // Assume ~40% of time at home (healing between runs).
  const homeRatio = 0.4;
  const resPerTickPerHero = Math.ceil(scenario.avgLevel / 2);
  const resPerTickAll = scenario.heroes * resPerTickPerHero * homeRatio;
  const resPerMinHeroes = Math.round(resPerTickAll * 60);
  const resPerMinClick = 60; // 1 click per second
  const total = resPerMinHeroes + resPerMinClick;

  console.log(
    `  ${pad(scenario.heroes, 6)} | ${pad(scenario.avgLevel, 9)} | ${pad(resPerTickAll.toFixed(1), 17)} | ${pad(resPerMinHeroes, 16)} | ${pad(resPerMinClick, 15)} | ${pad(total, 8)}`
  );
}

// ── 7. Early Game Milestone Simulation ──────────────────────────────────────

header('EARLY GAME MILESTONE SIMULATION');
console.log('  Assumptions: 1 click/sec, hero idle gen at home, 66% home time');
console.log('');

interface Milestone {
  name: string;
  building: string;
}

const milestones: Milestone[] = [
  { name: 'Tent 1 (first hero)', building: 'Tent' },
  { name: 'Stockpile 1', building: 'Stockpile' },
  { name: 'Tent 2 (second hero)', building: 'Tent' },
  { name: 'Stockpile 2', building: 'Stockpile' },
  { name: 'Market 1', building: 'Market' },
  { name: 'Tent 3 (third hero)', building: 'Tent' },
  { name: 'Stockpile 3', building: 'Stockpile' },
  { name: 'Blacksmith 1', building: 'Blacksmith' },
  { name: 'Tent 4 (fourth hero)', building: 'Tent' },
  { name: 'Dungeons 2', building: 'Dungeons' },
];

let resources = 0;
let maxResources = 25;
let heroCount = 0;
const heroLevels: number[] = [];
const buildingCounts: Record<string, number> = {};
for (const b of buildings) buildingCounts[b.name] = b.count;

let milestoneIdx = 0;

for (let tick = 0; tick < 7200; tick++) {
  // Manual click
  resources = Math.min(resources + 1, maxResources);

  // Hero passive gen (~66% home time)
  for (const lvl of heroLevels) {
    if (tick % 3 < 2) {
      resources = Math.min(resources + Math.ceil(lvl / 2), maxResources);
    }
  }

  if (milestoneIdx >= milestones.length) break;

  const ms = milestones[milestoneIdx];
  const bData = buildings.find((b) => b.name === ms.building)!;
  const cost = calcBuildingCost(bData.cost, buildingCounts[ms.building], bData.multiplier);

  if (resources >= cost) {
    resources -= cost;
    buildingCounts[ms.building]++;

    if (ms.building === 'Stockpile') {
      const nextCost = calcBuildingCost(bData.cost, buildingCounts[ms.building], bData.multiplier);
      maxResources = nextCost + Math.floor(nextCost / 5);
    }

    if (ms.building === 'Tent') {
      heroCount++;
      heroLevels.push(1);
    }

    const minutes = (tick / 60).toFixed(1);
    console.log(
      `  ${pad(minutes, 7)}min: ${ms.name.padEnd(25)} cost=${pad(cost, 5)}  resources_left=${pad(resources, 5)}  cap=${pad(maxResources, 5)}`
    );
    milestoneIdx++;
  }
}

if (milestoneIdx < milestones.length) {
  console.log(`  (Simulation ended before reaching: ${milestones[milestoneIdx].name})`);
}

// ── 8. Weapon Comparison Table ──────────────────────────────────────────────

header('WEAPON STATS');

console.log('\n  ID | Weapon       | Min | Max | Avg  | SellPrice | Upkeep | Variance');
console.log('  ---+--------------+-----+-----+------+-----------+--------+---------');

for (const w of weapons) {
  const avg = ((w.minDamage + w.maxDamage) / 2).toFixed(1);
  const upkeep = Math.ceil(w.sellPrice * WEAPON_UPKEEP_RATE);
  const variance = w.minDamage > 0 ? (w.maxDamage / w.minDamage).toFixed(1) : 'inf';
  console.log(
    `  ${pad(w.id, 2)} | ${w.name.padEnd(12)} | ${pad(w.minDamage, 3)} | ${pad(w.maxDamage, 3)} | ${pad(avg, 4)} | ${pad(w.sellPrice, 9)} | ${pad(upkeep, 6)} | ${pad(variance, 7)}:1`
  );
}

// ── 9. Combat Potion Table ──────────────────────────────────────────────────

header('POTION STATS');

console.log('\n  ID | Potion          | Value | SellPrice | Prod Cost | Type');
console.log('  ---+-----------------+-------+-----------+-----------+-----');

for (const p of potions) {
  const typeNames: Record<number, string> = { 1: 'Health', 2: 'Power', 3: 'Regen' };
  console.log(
    `  ${pad(p.id, 2)} | ${p.name.padEnd(15)} | ${pad(p.value, 5)} | ${pad(p.sellPrice, 9)} | ${pad(p.cost, 9)} | ${typeNames[p.type] ?? String(p.type)}`
  );
}

console.log(`\n  Basic Potion: heal=${basicPotionHeal}, sellPrice=${basicPotionPrice}`);

console.log('\n' + '='.repeat(70));
console.log('  Simulation complete.');
console.log('='.repeat(70) + '\n');
