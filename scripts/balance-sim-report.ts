/**
 * Generates a markdown balance report from the game data files.
 *
 * Run: npx tsx scripts/balance-sim-report.ts > balance-report.md
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

interface Building { id: number; name: string; cost: number; multiplier: number; count: number }
interface Weapon { id: number; name: string; sellPrice: number; minDamage: number; maxDamage: number }
interface Potion { id: number; name: string; sellPrice: number; cost: number; value: number; type: number }

const buildings: Building[] = JSON.parse(readFileSync(resolve(root, 'public/models/buildings.json'), 'utf-8'));
const weapons: Weapon[] = JSON.parse(readFileSync(resolve(root, 'public/models/weapons.json'), 'utf-8'));
const potions: Potion[] = JSON.parse(readFileSync(resolve(root, 'public/models/potions.json'), 'utf-8'));

const WEAPON_UPKEEP_RATE = 0.5;
const DUNGEON_STEPS_MULTIPLIER = 15;
const HERO_BASE_HEALTH = 100;
const HERO_HEALTH_PER_LEVEL = 75;

function calcCost(base: number, count: number, mult: number): number {
  return Math.ceil(base + Math.pow(count + 1, mult));
}

const lines: string[] = [];
function w(s: string) { lines.push(s); }

w('# Heroville Balance Report');
w(`\n*Generated: ${new Date().toISOString().split('T')[0]}*\n`);

// Buildings
w('## Building Costs\n');
for (const b of buildings) {
  w(`### ${b.name} (base=${b.cost}, mult=${b.multiplier})\n`);
  w('| Level | Cost | Cumulative |');
  w('|-------|------|------------|');
  let cum = 0;
  for (let i = 0; i < 8; i++) {
    const c = calcCost(b.cost, i, b.multiplier);
    cum += c;
    w(`| ${i + 1} | ${c} | ${cum} |`);
  }
  w('');
}

// Stockpile
w('## Stockpile Cap Progression\n');
const sp = buildings.find(b => b.name === 'Stockpile')!;
w('| Level | Next Cost | Resource Cap | Gold Cap | Cost/Cap % |');
w('|-------|-----------|-------------|----------|------------|');
for (let i = 0; i < 8; i++) {
  const c = calcCost(sp.cost, i, sp.multiplier);
  const cap = c + Math.floor(c / 5);
  const gcap = Math.floor(c / 5);
  w(`| ${i + 1} | ${c} | ${cap} | ${gcap} | ${((c / cap) * 100).toFixed(1)}% |`);
}

// Weapons
w('\n## Weapons\n');
w('| Weapon | Min | Max | Avg | Sell | Upkeep | Variance |');
w('|--------|-----|-----|-----|------|--------|----------|');
for (const wp of weapons) {
  const avg = ((wp.minDamage + wp.maxDamage) / 2).toFixed(1);
  const upkeep = Math.ceil(wp.sellPrice * WEAPON_UPKEEP_RATE);
  const variance = wp.minDamage > 0 ? `${(wp.maxDamage / wp.minDamage).toFixed(1)}:1` : 'inf';
  w(`| ${wp.name} | ${wp.minDamage} | ${wp.maxDamage} | ${avg} | ${wp.sellPrice} | ${upkeep} | ${variance} |`);
}

// Dungeon gold
w('\n## Dungeon Gold Income\n');
w('| Dungeon | Steps | Gold (est) | Upkeep (weapon tier) | Net |');
w('|---------|-------|------------|---------------------|-----|');
for (let d = 1; d <= 14; d++) {
  const steps = DUNGEON_STEPS_MULTIPLIER * d;
  const enc = Math.round(steps * 0.175);
  const mobs = enc * Math.min(4, Math.max(2, d));
  const gold = mobs * 0.10 * Math.ceil(d * 0.6) + Math.ceil((d + 1) * 0.5);
  const wi = Math.min(d, weapons.length - 1);
  const upkeep = Math.ceil(weapons[wi].sellPrice * WEAPON_UPKEEP_RATE);
  w(`| ${d} | ${steps} | ${gold.toFixed(1)} | ${upkeep} (${weapons[wi].name}) | ${(gold - upkeep).toFixed(1)} |`);
}

// Healing
w('\n## Healing Cadence\n');
w('| Level | Max HP | Potions to full heal | Gold cost |');
w('|-------|--------|---------------------|-----------|');
for (let l = 1; l <= 20; l++) {
  const hp = HERO_BASE_HEALTH + (l - 1) * HERO_HEALTH_PER_LEVEL;
  const potions_needed = Math.ceil(hp / 50);
  w(`| ${l} | ${hp} | ${potions_needed} | ${potions_needed * 2} |`);
}

// Potions
w('\n## Potions\n');
w('| Potion | Value | Sell | Prod Cost |');
w('|--------|-------|------|-----------|');
w('| Basic (Healing Herbs) | 50 HP | 2 | 10 |');
for (const p of potions) {
  const typeNames: Record<number, string> = { 1: 'HP', 2: 'x dmg', 3: '% regen' };
  w(`| ${p.name} | ${p.value} ${typeNames[p.type] ?? ''} | ${p.sellPrice} | ${p.cost} |`);
}

console.log(lines.join('\n'));
