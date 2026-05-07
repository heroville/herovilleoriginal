// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Heroville E2E tests follow the in-game tutorial to completion. One shared page, no reload between tests.
 * Fast tick (2ms) is set in beforeAll. Gather uses Playwright clickCount (one round-trip per batch) instead of per-click loops.
 *
 * Tutorial order: Welcome → Gather 5, Tent, Hero → Stockpile → Potions, gold → First upgrade →
 * Dungeons → Market, Blacksmith blueprint, Blacksmith → Dagger → Save Point → Tavern → Work Hut,
 * worker, change profession → End tips. E2E also verifies: all tabs/screens, save/load, combat stats.
 */

/** Wait until game state has at least minGold (heroes buy potions when in town and damaged). */
async function waitForGold(page, minGold, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const gold = await page.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.gold === 'number' ? s.gold : -1;
    });
    if (gold >= minGold) return gold;
    await page.waitForTimeout(25);
  }
  throw new Error(`Gold did not reach ${minGold} within ${timeoutMs}ms`);
}

/** Wait until any hero is in combat or dungeon (progress: Fighting Boss!, Fighting Encounter!, or X% Complete). */
async function waitForHeroCombatOrDungeon(page, timeoutMs = 18000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const found = await page.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      const list = s && s.heroList;
      if (!Array.isArray(list)) return false;
      return list.some(h => {
        const p = (h && h.progress) || '';
        return /Fighting Boss!|Fighting Encounter!/.test(p) || /%\s*Complete/.test(p);
      });
    });
    if (found) return;
    await page.waitForTimeout(35);
  }
  throw new Error(`No hero entered combat or dungeon within ${timeoutMs}ms`);
}

/** Click the tutorial Next button if visible (within timeoutMs). Returns true if clicked. */
async function clickTutorialNext(page, timeoutMs = 800) {
  const btn = page.getByTestId('tutorial-next');
  try {
    await btn.click({ timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

/** Get current game state (resources, maxResources, buildings). */
async function getState(page) {
  return page.evaluate(() => {
    const getState = window['__HEROVILLE_E2E_STATE__'];
    const s = getState && getState();
    return s ? { resources: s.resources ?? 0, maxResources: s.maxResources ?? 0, buildings: s.buildings ?? [] } : { resources: 0, maxResources: 0, buildings: [] };
  });
}

/** Click gather until resources >= amount. Each batch is one locator.click({ clickCount }) — fast vs N sequential clicks. */
const GATHER_BATCH_SIZE = 200;

async function gatherUntil(page, amount, timeoutMs = 45000) {
  const gather = page.getByTestId('gather-trigger');
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const state = await getState(page);
    if (state.resources >= amount) return;
    const need = amount - state.resources;
    const batch = Math.min(GATHER_BATCH_SIZE, need);
    if (batch > 0) await gather.click({ clickCount: batch });
  }
  const state = await getState(page);
  throw new Error(`Resources did not reach ${amount} (got ${state.resources}) within ${timeoutMs}ms`);
}

/** Ensure maxResources >= amount, buying stockpile upgrades as needed; then gather until resources >= amount. */
async function ensureCapacityAndGather(page, amount, timeoutMs = 60000) {
  const townTab = page.getByRole('tab', { name: 'Town' });
  const improveStockpile = page.getByRole('button', { name: 'Improve Stockpile' });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const state = await getState(page);
    if (state.maxResources >= amount) break;
    const stockpile = state.buildings[1];
    const cost = stockpile && typeof stockpile.cost === 'number' ? stockpile.cost : 0;
    if (cost <= 0) break;
    if (state.maxResources < cost) {
      throw new Error(`Need capacity ${amount} but next stockpile costs ${cost} and maxResources is ${state.maxResources}`);
    }
    await gatherUntil(page, cost, Math.min(20000, deadline - Date.now()));
    await townTab.click();
    await improveStockpile.click();
    await page.waitForTimeout(40);
  }
  const stateAfter = await getState(page);
  if (stateAfter.maxResources < amount) {
    throw new Error(`Could not get capacity >= ${amount} (maxResources: ${stateAfter.maxResources}) within ${timeoutMs}ms`);
  }
  await gatherUntil(page, amount, Math.min(45000, deadline - Date.now()));
}

/** Read the current cost of a building by name from game state. */
async function getBuildingCost(page, buildingName) {
  return page.evaluate((name) => {
    const getState = window['__HEROVILLE_E2E_STATE__'];
    const s = getState && getState();
    if (!s || !s.buildings) return -1;
    const b = s.buildings.find((b) => b.name === name);
    return b && typeof b.cost === 'number' ? b.cost : -1;
  }, buildingName);
}

/** Ensure capacity, gather enough, and buy a building by name. */
async function ensureAndBuyBuilding(page, buildingName, timeoutMs = 60000) {
  const cost = await getBuildingCost(page, buildingName);
  if (cost <= 0) throw new Error(`Building ${buildingName} not found or cost is 0`);
  await ensureCapacityAndGather(page, cost, timeoutMs);
  await page.getByRole('tab', { name: 'Town' }).click();
  await page.getByRole('button', { name: `Improve ${buildingName}` }).click();
  await page.waitForTimeout(40);
}

/** Gather n times in one Playwright action when possible (clickCount; delay defaults to 0). */
async function gather(page, n) {
  if (n <= 0) return;
  await page.getByTestId('gather-trigger').click({ clickCount: n });
}

test.describe.serial('Heroville E2E – tutorial flow', () => {
  /** @type {import('@playwright/test').Page} */
  let sharedPage;
  /** @type {import('@playwright/test').BrowserContext} */
  let sharedContext;

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext();
    // Block external requests (fonts, analytics) that would hang in sandboxed CI environments.
    await sharedContext.route(/googleapis|google-analytics|googletagmanager/, (route) => route.abort());
    await sharedContext.addInitScript(() => {
      window['__HEROVILLE_E2E_FAST_TICK__'] = 2;
    });
    sharedPage = await sharedContext.newPage();
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  test('1. fresh load: main UI and Town content', async () => {
    await sharedPage.goto('/');
    await sharedPage.evaluate(() => localStorage.removeItem('data'));
    await sharedPage.reload();
    await expect(sharedPage.getByTestId('game-tabs')).toBeVisible({ timeout: 3000 });
    await expect(sharedPage.getByTestId('gather-trigger')).toBeVisible({ timeout: 6000 });
    await sharedPage.waitForFunction(() => typeof window['__HEROVILLE_E2E_STATE__'] === 'function', { timeout: 3000 });
    const gameLoopMs = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.gameLoop === 'number' ? s.gameLoop : null;
    });
    expect(gameLoopMs, 'E2E fast tick should set state.gameLoop to 2').toBe(2);
    await expect(sharedPage.locator('#town-react-root')).toContainText('Buildings', { timeout: 6000 });
    await expect(sharedPage.getByTestId('app-wrap')).toBeVisible();
    await expect(sharedPage.getByTestId('resources-count')).toBeVisible();
    await expect(sharedPage.locator('#panelList')).toBeVisible();
  });

  test('2. tutorial: welcome, gather 5, buy Tent, add hero', async () => {
    await clickTutorialNext(sharedPage);
    await gather(sharedPage, 5);
    await sharedPage.getByRole('tab', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(sharedPage.getByTestId('hero-name-input')).toBeVisible({ timeout: 3000 });
    await sharedPage.getByTestId('hero-name-input').fill('SmokeTestHero');
    await sharedPage.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();
    await sharedPage.getByRole('tab', { name: 'Heroes' }).click();
    await expect(sharedPage.getByTestId('hero-list')).toContainText('SmokeTestHero', { timeout: 3000 });
    await expect(sharedPage.getByTestId('hero-list')).toContainText('Class: Adventurer');
    await clickTutorialNext(sharedPage);
    await clickTutorialNext(sharedPage);
  });

  test('3. tutorial: expand Stockpile, build 2 more heroes (3 total)', async () => {
    test.setTimeout(60000);
    // Buy first Stockpile
    await ensureAndBuyBuilding(sharedPage, 'Stockpile');
    const maxGold = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.maxGold === 'number' ? s.maxGold : -1;
    });
    expect(maxGold).toBeGreaterThanOrEqual(1);
    // Expand stockpile 2 more times to ensure cap for later tent purchases
    for (let i = 0; i < 2; i++) {
      await ensureAndBuyBuilding(sharedPage, 'Stockpile');
    }
    // Build 2 more tents (2nd and 3rd heroes). Costs are read dynamically.
    const heroNames = ['Hero2', 'Hero3'];
    for (let i = 0; i < heroNames.length; i++) {
      await ensureAndBuyBuilding(sharedPage, 'Tent');
      await expect(sharedPage.getByTestId('hero-name-input')).toBeVisible({ timeout: 3000 });
      await sharedPage.getByTestId('hero-name-input').fill(heroNames[i]);
      await sharedPage.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();
    }
    const heroCount = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return (s && s.heroList && s.heroList.length) || 0;
    });
    expect(heroCount).toBe(3);
  });

  test('4. tutorial: create potions', async () => {
    await ensureCapacityAndGather(sharedPage, 55);
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const createBtn = sharedPage.getByTestId('potion-create-button');
    for (let i = 0; i < 5; i++) {
      await createBtn.click();
      await sharedPage.waitForTimeout(25);
    }
  });

  test('5. save and load: state persists', async () => {
    await sharedPage.getByRole('tab', { name: 'Options/Help' }).click();
    await expect(sharedPage.getByTestId('save-button')).toBeVisible();
    await sharedPage.getByTestId('save-button').click();
    await expect(sharedPage.getByTestId('error-toast')).toContainText(/saved|save/i, { timeout: 2500 });
    await sharedPage.reload();
    await sharedPage.waitForFunction(() => typeof window['__HEROVILLE_E2E_STATE__'] === 'function', { timeout: 3000 });
    await sharedPage.getByRole('tab', { name: 'Options/Help' }).click();
    await sharedPage.getByRole('button', { name: 'Load' }).click();
    await sharedPage.waitForTimeout(150);
    const state = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      return getState ? getState() : null;
    });
    expect(state).toBeTruthy();
    expect(state.heroList && state.heroList.length).toBe(3);
    expect(state.heroList[0].name).toBe('SmokeTestHero');
    await sharedPage.getByRole('tab', { name: 'Heroes' }).click();
    await expect(sharedPage.getByTestId('hero-list')).toContainText('SmokeTestHero', { timeout: 3000 });
  });

  test('6. tutorial: buy Bonus Resources I, verify +2 per gather, build 2 more heroes (5 total)', async () => {
    test.setTimeout(60000);
    await waitForGold(sharedPage, 1, 15000);
    await clickTutorialNext(sharedPage);
    await sharedPage.getByRole('tab', { name: 'Upgrades' }).click();
    await sharedPage.getByTestId('upgrade-list').getByRole('button', { name: /Bonus Resources I/i }).click();
    // Verify the incr (resources per gather click) increased to 2 after buying the upgrade
    const incr = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.incr === 'number' ? s.incr : -1;
    });
    expect(incr).toBe(2);
    await clickTutorialNext(sharedPage);
    // Build 2 more tents (4th and 5th). Costs are read dynamically from game state.
    const heroNames = ['Hero4', 'Hero5'];
    for (let i = 0; i < heroNames.length; i++) {
      await ensureAndBuyBuilding(sharedPage, 'Tent');
      await expect(sharedPage.getByTestId('hero-name-input')).toBeVisible({ timeout: 3000 });
      await sharedPage.getByTestId('hero-name-input').fill(heroNames[i]);
      await sharedPage.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();
    }
    const heroCount = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return (s && s.heroList && s.heroList.length) || 0;
    });
    expect(heroCount).toBe(5);
  });

  test('7. tutorial: build Dungeons, hero enters combat', async () => {
    await gather(sharedPage, 25);
    await sharedPage.getByRole('tab', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Dungeons' }).click();
    const townPanel = sharedPage.getByTestId('town-tab');
    const dungeonTable = townPanel.locator('table').filter({ hasText: 'Encounter Rate' });
    await expect(dungeonTable.locator('tr')).toHaveCount(4, { timeout: 3500 });
    await clickTutorialNext(sharedPage);
    await sharedPage.getByRole('tab', { name: 'Heroes' }).click();
    await waitForHeroCombatOrDungeon(sharedPage, 18000);
  });

  test('8. Production tab: potion UI and Create Potion', async () => {
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const productionSection = sharedPage.getByTestId('production-tab');
    await expect(productionSection).toContainText('Healing Herbs', { timeout: 3500 });
    await expect(productionSection).toContainText('Create Potion');
    await expect(productionSection).toContainText(/Prod Cost|Prod Time|Sell Price/);
    await expect(productionSection.getByRole('button', { name: /Create Potion/i })).toBeVisible({ timeout: 3500 });
    const createBtn = sharedPage.getByTestId('potion-create-button');
    await createBtn.click();
    await sharedPage.waitForTimeout(80);
    await expect(createBtn).toContainText('Create Potion', { timeout: 3500 });
  });

  test('9. tutorial: Market, Blacksmith blueprint, Blacksmith', async () => {
    test.setTimeout(60000);
    // Expand stockpile so we have capacity for Market + Blacksmith costs
    await ensureAndBuyBuilding(sharedPage, 'Stockpile');
    await ensureAndBuyBuilding(sharedPage, 'Market');
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const createBtn = sharedPage.getByTestId('potion-create-button');
    for (let i = 0; i < 4; i++) {
      await createBtn.click();
      await sharedPage.waitForTimeout(25);
    }
    await waitForGold(sharedPage, 1, 15000);
    await expect(sharedPage.getByRole('button', { name: /Buy Blacksmith Blueprint/i })).toBeVisible({ timeout: 3500 });
    await sharedPage.getByRole('button', { name: /Buy Blacksmith Blueprint/i }).click();
    await ensureAndBuyBuilding(sharedPage, 'Blacksmith');
  });

  test('10. tutorial: create Dagger stack', async () => {
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    await gather(sharedPage, 45);
    const daggerBtn = sharedPage.getByRole('button', { name: /Create Dagger/i });
    await expect(daggerBtn).toBeVisible({ timeout: 3500 });
    for (let i = 0; i < 3; i++) {
      await daggerBtn.click();
      await sharedPage.waitForTimeout(25);
    }
    await clickTutorialNext(sharedPage);
  });

  test('11. tutorial: Save Point upgrade, Tavern blueprint, Tavern', async () => {
    test.setTimeout(60000);
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const createBtn = sharedPage.getByTestId('potion-create-button');
    for (let i = 0; i < 5; i++) {
      await createBtn.click();
      await sharedPage.waitForTimeout(25);
    }
    await waitForGold(sharedPage, 5, 12000);
    await sharedPage.getByRole('tab', { name: 'Upgrades' }).click();
    await sharedPage.getByTestId('upgrade-list').getByRole('button', { name: /Save Point/i }).click();
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    for (let i = 0; i < 5; i++) {
      await createBtn.click();
      await sharedPage.waitForTimeout(25);
    }
    await waitForGold(sharedPage, 5, 15000);
    const tavernBlueprintBtn = sharedPage.getByRole('button', { name: /Buy Tavern Blueprint/i });
    await expect(tavernBlueprintBtn).toBeVisible({ timeout: 45000 });
    await expect(tavernBlueprintBtn).toBeEnabled({ timeout: 3000 });
    await tavernBlueprintBtn.scrollIntoViewIfNeeded();
    await tavernBlueprintBtn.click({ force: true });
    await ensureAndBuyBuilding(sharedPage, 'Tavern');
    await clickTutorialNext(sharedPage);
    await clickTutorialNext(sharedPage);
  });

  test('12. tutorial: Work Hut, create worker, change profession', async () => {
    await ensureAndBuyBuilding(sharedPage, 'Work Hut');
    await sharedPage.waitForTimeout(40);
    await expect(sharedPage.getByTestId('worker-name-input')).toBeVisible({ timeout: 3000 });
    await sharedPage.getByTestId('worker-name-input').fill('E2EWorker');
    await sharedPage.locator('.workerPopup').getByRole('button', { name: 'Accept' }).click();
    await sharedPage.getByRole('tab', { name: 'Heroes' }).click();
    await expect(sharedPage.getByTestId('hero-tab')).toContainText('Workers', { timeout: 3500 });
    await expect(sharedPage.getByTestId('hero-tab')).toContainText('E2EWorker');
    await clickTutorialNext(sharedPage);
    const changeBtn = sharedPage.getByRole('button', { name: 'Change' }).first();
    await expect(changeBtn).toBeVisible({ timeout: 3000 });
    await sharedPage.locator('select.span17').first().selectOption({ index: 1 });
    await changeBtn.click();
    await clickTutorialNext(sharedPage);
  });

  test('13. tutorial: complete guide, end tips, guide becomes Log', async () => {
    const guidePanel = sharedPage.locator('#guide-panel');
    for (let i = 0; i < 6; i++) {
      if (await guidePanel.textContent().then((t) => t && t.includes('Log'))) break;
      await clickTutorialNext(sharedPage);
      await sharedPage.waitForTimeout(25);
    }
    await expect(guidePanel).toContainText('Log', { timeout: 3000 });
  });

  test('14. screens display correct information', async () => {
    await sharedPage.getByRole('tab', { name: 'Town' }).click();
    const townPanel = sharedPage.getByTestId('town-tab');
    await expect(townPanel).toContainText('Buildings');
    await expect(townPanel).toContainText('Dungeons');
    await expect(townPanel).toContainText(/Encounter Rate|Length/);

    await sharedPage.getByRole('tab', { name: 'Heroes' }).click();
    await expect(sharedPage.getByTestId('hero-list')).toContainText('SmokeTestHero');
    await expect(sharedPage.getByTestId('hero-list')).toContainText(/Location: Home|Location: Cave|Resting|Complete|Fighting/);
    await expect(sharedPage.getByRole('progressbar').first()).toBeVisible({ timeout: 3500 });

    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const productionSection = sharedPage.getByTestId('production-tab');
    await expect(productionSection).toContainText('Healing Herbs');
    await expect(productionSection).toContainText(/Create Potion|Create Dagger/);

    await sharedPage.getByRole('tab', { name: 'Upgrades' }).click();
    await expect(sharedPage.getByTestId('upgrade-list')).toBeVisible();
    await expect(sharedPage.getByTestId('upgrade-list')).toContainText(/Bonus Resources|Save Point/);

    await sharedPage.getByRole('tab', { name: 'Professions' }).click();
    const section = sharedPage.getByTestId('professions-tab');
    await expect(section).toContainText('Jobs');
    await expect(section).toContainText('Name');
    await expect(section).toContainText('Description');

    await sharedPage.getByRole('tab', { name: 'Options/Help' }).click();
    const optionsPanel = sharedPage.getByTestId('options-panel');
    await expect(optionsPanel).toContainText(/Total Battles:|Wins:|Losses:/);
    await expect(optionsPanel).toContainText(/Total Battles: \d+|Wins: \d+|Losses: \d+/);
  });

  test('15. upgrade Blacksmith, create Hand Axes', async () => {
    test.setTimeout(60000);
    await ensureAndBuyBuilding(sharedPage, 'Blacksmith');
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const handAxeBtn = sharedPage.getByRole('button', { name: /Create Hand Axe/i });
    if (await handAxeBtn.isVisible()) {
      await handAxeBtn.scrollIntoViewIfNeeded();
      await handAxeBtn.click({ force: true });
      await sharedPage.waitForTimeout(80);
      await expect(handAxeBtn).toBeVisible();
    }
  });
});
