/**
 * Plain JS hero list and battle filters. Used by Angular templates (via app.js filters)
 * and will be used directly by React components after migration.
 */

/**
 * @param {Array} items - Array of battles (each has .hero array)
 * @param {{ id: number }} value - Hero object with id
 * @returns {Array} Battles that include the given hero
 */
export function filterHeroBattle(items, value) {
    const filtered = [];
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
 * @param {Array} heroList - Full hero list
 * @returns {Array} Heroes with academy.id === 1 (workers)
 */
export function filterHeroWorker(heroList) {
    const filtered = [];
    for (let i = 0; i < heroList.length; i++) {
        if (heroList[i].academy.id === 1) {
            filtered.push(heroList[i]);
        }
    }
    return filtered;
}

/**
 * @param {Array} heroList - Full hero list
 * @returns {Array} Heroes with academy.id === 0 or 2 (adventure)
 */
export function filterHeroAdventure(heroList) {
    const filtered = [];
    for (let i = 0; i < heroList.length; i++) {
        if (heroList[i].academy.id === 0 || heroList[i].academy.id === 2) {
            filtered.push(heroList[i]);
        }
    }
    return filtered;
}
