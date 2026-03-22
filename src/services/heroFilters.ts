/**
 * Plain hero list and battle filters. Used by React HeroTab.
 */
import type { Hero, Battle } from '../types/index.ts';

/**
 * Returns battles that include the given hero.
 */
export function filterHeroBattle(items: Battle[], value: { id: number }): Battle[] {
  const filtered: Battle[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items[i].hero.length; j++) {
      if (items[i].hero[j].id === value.id) {
        filtered.push(items[i]);
        break;
      }
    }
  }
  return filtered;
}

/**
 * Returns heroes with academy.id === 1 (workers).
 */
export function filterHeroWorker(heroList: Hero[]): Hero[] {
  const filtered: Hero[] = [];
  for (let i = 0; i < heroList.length; i++) {
    if (heroList[i].academy.id === 1) {
      filtered.push(heroList[i]);
    }
  }
  return filtered;
}

/**
 * Returns heroes with academy.id === 0 or 2 (adventurers).
 */
export function filterHeroAdventure(heroList: Hero[]): Hero[] {
  const filtered: Hero[] = [];
  for (let i = 0; i < heroList.length; i++) {
    if (heroList[i].academy.id === 0 || heroList[i].academy.id === 2) {
      filtered.push(heroList[i]);
    }
  }
  return filtered;
}
