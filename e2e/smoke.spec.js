// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Heroville smoke tests run as a dependent sequence: one shared page, no reload between tests.
 * Each test builds on the previous so we avoid repeated setup and save/load conflicts.
 * Fast tick (10ms) is set once in beforeAll.
 *
 * Progression: 1–2) Load, gather. 3) Save. 4) Tent + hero. 5–6) Hero tab, Town/dungeons.
 * 7) Stockpile (gold capacity) + second dungeon. 8) Hero enters combat/dungeon. 9) Production:
 * gather resources, create potions, wait for hero to buy (gold ≥ 1). 10–12) Production UI and
 * one potion run. 13) Buy Bonus Resources I, assert +2 per gather. 14) Professions nav.
 * 15) Second Stockpile, Market, potions, gold, Blacksmith, Tavern, Professions. 16) Work Hut,
 * create worker. 17) Options/Help combat stats, Hero tab.
 */

/** Wait until game state has at least minGold (heroes buy potions when in town and damaged). */
async function waitForGold(page, minGold, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const gold = await page.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.gold === 'number' ? s.gold : -1;
    });
    if (gold >= minGold) return gold;
    await page.waitForTimeout(200);
  }
  throw new Error(`Gold did not reach ${minGold} within ${timeoutMs}ms`);
}

/** Wait until any hero is in combat or dungeon (progress: Fighting Boss!, Fighting Encounter!, or X% Complete). */
async function waitForHeroCombatOrDungeon(page, timeoutMs = 30000) {
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
    await page.waitForTimeout(300);
  }
  throw new Error(`No hero entered combat or dungeon within ${timeoutMs}ms`);
}

test.describe.serial('Heroville smoke', () => {
  /** @type {import('@playwright/test').Page} */
  let sharedPage;
  /** @type {import('@playwright/test').BrowserContext} */
  let sharedContext;

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext();
    await sharedContext.addInitScript(() => {
      window['__HEROVILLE_E2E_FAST_TICK__'] = 10;
    });
    sharedPage = await sharedContext.newPage();
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  // Disabled-tab visual/class behavior is not asserted here (ng-class/scope quirk with uib-tab).
  // Revisit when tabs are migrated to React.
  test('1. fresh load: main UI and Town content', async () => {
    await sharedPage.goto('/');
    await sharedPage.evaluate(() => localStorage.removeItem('data'));
    await sharedPage.reload();
    await expect(sharedPage.locator('#gameTabs')).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.locator('#gatherButton').first()).toBeVisible({ timeout: 10000 });
    await sharedPage.waitForFunction(() => typeof window['__HEROVILLE_E2E_STATE__'] === 'function', { timeout: 5000 });
    const gameLoopMs = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.gameLoop === 'number' ? s.gameLoop : null;
    });
    expect(gameLoopMs, 'E2E fast tick should set state.gameLoop to 10').toBe(10);
    const townRoot = sharedPage.locator('#town-react-root');
    await expect(townRoot).toContainText('Buildings', { timeout: 10000 });
    await expect(sharedPage.locator('#wrap')).toBeVisible();
    await expect(sharedPage.locator('#resources')).toBeVisible();
    await expect(sharedPage.locator('#gatherButton').first()).toBeVisible();
  });

  test('2. gather button increases resources', async () => {
    const resourcesEl = sharedPage.locator('#resources');
    const initialText = await resourcesEl.textContent();
    const gather = sharedPage.locator('#gatherButton').first();
    await gather.click();
    await gather.click();
    await gather.click();
    const afterText = await resourcesEl.textContent();
    expect(afterText).not.toBe(initialText);
    expect(afterText).toMatch(/\d/);
  });

  test('3. save button shows confirmation', async () => {
    await sharedPage.getByRole('link', { name: 'Options/Help' }).click();
    await expect(sharedPage.locator('#save')).toBeVisible();
    await sharedPage.locator('#save').click();
    await expect(sharedPage.locator('#errorDialog')).toContainText(/saved|save/i, { timeout: 4000 });
  });

  test('4. buy Tent, add hero, see in Hero tab', async () => {
    const heroName = 'SmokeTestHero';
    const gather = sharedPage.locator('#gatherButton').first();
    for (let i = 0; i < 6; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(sharedPage.locator('#name')).toBeVisible({ timeout: 5000 });
    await sharedPage.locator('#name').fill(heroName);
    await sharedPage.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();
    await sharedPage.getByRole('link', { name: 'Hero' }).click();
    await expect(sharedPage.locator('#heroList')).toContainText(heroName, { timeout: 5000 });
    await expect(sharedPage.locator('#heroList')).toContainText('Class: Adventurer');
  });

  test('5. Hero tab progress bars, images, popover triggers', async () => {
    await sharedPage.getByRole('link', { name: 'Hero' }).click();
    await expect(sharedPage.getByText('SmokeTestHero', { exact: false })).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.getByRole('progressbar').first()).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.locator('#heroList img[src*="images/"]').first()).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.getByTestId('hero-equip-popover-trigger').first()).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.getByTestId('hero-battle-popover-trigger').first()).toBeVisible({ timeout: 5000 });
  });

  test('6. Town shows dungeon list', async () => {
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    const townPanel = sharedPage.locator('section#container').filter({ hasText: 'Buildings' });
    await expect(townPanel).toContainText('Dungeons', { timeout: 5000 });
    await expect(townPanel).toContainText(/Encounter Rate|Length/, { timeout: 3000 });
  });

  test('7. build Stockpile and second Dungeon', async () => {
    const gather = sharedPage.locator('#gatherButton').first();
    for (let i = 0; i < 25; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Stockpile' }).click();
    const maxGold = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.maxGold === 'number' ? s.maxGold : -1;
    });
    expect(maxGold, 'Stockpile must be upgraded to a level with gold capacity').toBeGreaterThanOrEqual(1);
    for (let i = 0; i < 25; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    const townPanel = sharedPage.locator('section#container').filter({ hasText: 'Buildings' });
    await expect(townPanel).toContainText('Dungeons', { timeout: 5000 });
    await sharedPage.getByRole('button', { name: 'Improve Dungeons' }).click();
    const dungeonTable = townPanel.locator('table').filter({ hasText: 'Encounter Rate' });
    await expect(dungeonTable.locator('tr')).toHaveCount(4, { timeout: 5000 });
  });

  test('8. hero enters combat or dungeon', async () => {
    test.setTimeout(45000);
    await sharedPage.getByRole('link', { name: 'Hero' }).click();
    await expect(sharedPage.locator('#heroList')).toContainText('SmokeTestHero', { timeout: 5000 });
    await waitForHeroCombatOrDungeon(sharedPage, 35000);
  });

  test('9. potion buy: create potions and wait for gold to increment', async () => {
    test.setTimeout(45000);
    const maxGold = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.maxGold === 'number' ? s.maxGold : -1;
    });
    expect(maxGold, 'Stockpile must have gold capacity for town gold').toBeGreaterThanOrEqual(1);
    // Potion cost is 10 each; gather enough so we can actually create 5 potions.
    const gather = sharedPage.locator('#gatherButton').first();
    for (let i = 0; i < 55; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Production' }).click();
    const createBtn = sharedPage.locator('#potionButt');
    for (let i = 0; i < 5; i++) {
      await expect(createBtn).toContainText('Create Potion', { timeout: 5000 }).catch(() => {});
      await createBtn.click();
      await expect(createBtn).toContainText('Create Potion', { timeout: 3000 });
    }
    await waitForGold(sharedPage, 1, 25000);
  });

  test('10. Production tab shows potion UI', async () => {
    await sharedPage.getByRole('link', { name: 'Production' }).click();
    const productionSection = sharedPage.locator('section#containter');
    await expect(productionSection).toContainText('Healing Herbs', { timeout: 5000 });
    await expect(productionSection).toContainText('Create Potion');
  });

  test('11. Production tab visual parity', async () => {
    await sharedPage.getByRole('link', { name: 'Production' }).click();
    const productionSection = sharedPage.locator('section#containter');
    await expect(productionSection).toContainText('Healing Herbs', { timeout: 5000 });
    await expect(productionSection.locator('img[src*="images/"]').first()).toBeVisible({ timeout: 5000 });
    await expect(productionSection).toContainText(/Prod Cost|Prod Time|Sell Price/);
    await expect(productionSection.getByRole('button', { name: /Create Potion/i })).toBeVisible({ timeout: 5000 });
  });

  test('12. Production Create Potion runs to completion', async () => {
    const createBtn = sharedPage.locator('#potionButt');
    await expect(createBtn).toContainText('Create Potion', { timeout: 5000 });
    await createBtn.click();
    await sharedPage.waitForTimeout(200);
    await expect(createBtn).toContainText('Create Potion', { timeout: 5000 });
  });

  test('13. buy Bonus Resources I and verify gather increment is 2', async () => {
    test.setTimeout(35000);
    await sharedPage.getByRole('link', { name: 'Production' }).click();
    await sharedPage.locator('#upgradeList').getByRole('button', { name: /Bonus Resources I/i }).click();
    const resourcesBefore = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.resources === 'number' ? s.resources : -1;
    });
    await sharedPage.locator('#gatherButton').first().click();
    await sharedPage.waitForTimeout(200);
    const resourcesAfter = await sharedPage.evaluate(() => {
      const getState = window['__HEROVILLE_E2E_STATE__'];
      const s = getState && getState();
      return s && typeof s.resources === 'number' ? s.resources : -1;
    });
    expect(resourcesAfter - resourcesBefore).toBe(2);
  });

  test('14. Professions tab in navigation', async () => {
    await expect(sharedPage.getByRole('link', { name: 'Professions' })).toBeVisible();
  });

  test('15. build to Tavern, Professions shows Jobs table', async () => {
    test.setTimeout(120000);
    const gather = sharedPage.locator('#gatherButton').first();
    // Second Stockpile upgrade (cost 57) so we can hold 100+ for Blacksmith/Work Hut.
    for (let i = 0; i < 57; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Stockpile' }).click();
    for (let i = 0; i < 40; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    await expect(sharedPage.getByRole('button', { name: 'Improve Market' })).toBeVisible({ timeout: 10000 });
    await sharedPage.getByRole('button', { name: 'Improve Market' }).click();
    for (let i = 0; i < 40; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Production' }).click();
    const createBtn = sharedPage.locator('#potionButt');
    for (let i = 0; i < 4; i++) {
      await expect(createBtn).toContainText('Create Potion', { timeout: 5000 }).catch(() => {});
      await createBtn.click();
      await expect(createBtn).toContainText('Create Potion', { timeout: 3000 });
    }
    await waitForGold(sharedPage, 1, 25000);
    await expect(sharedPage.getByRole('button', { name: /Buy Blacksmith Blueprint/i })).toBeVisible({ timeout: 5000 });
    await sharedPage.getByRole('button', { name: /Buy Blacksmith Blueprint/i }).click();
    for (let i = 0; i < 100; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    await expect(sharedPage.getByRole('button', { name: 'Improve Blacksmith' })).toBeVisible({ timeout: 10000 });
    await sharedPage.getByRole('button', { name: 'Improve Blacksmith' }).click();
    await sharedPage.getByRole('link', { name: 'Production' }).click();
    for (let i = 0; i < 5; i++) {
      await expect(createBtn).toContainText('Create Potion', { timeout: 5000 }).catch(() => {});
      await createBtn.click();
      await expect(createBtn).toContainText('Create Potion', { timeout: 3000 });
    }
    await waitForGold(sharedPage, 5, 20000);
    await expect(sharedPage.getByRole('button', { name: /Buy Tavern Blueprint/i })).toBeVisible({ timeout: 5000 });
    await sharedPage.getByRole('button', { name: /Buy Tavern Blueprint/i }).click();
    for (let i = 0; i < 150; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Tavern' }).click();
    await expect(sharedPage.getByRole('button', { name: /Improve Work Hut/i })).toBeVisible({ timeout: 10000 });
    await sharedPage.getByRole('link', { name: 'Professions' }).click();
    const section = sharedPage.locator('section#container').filter({ hasText: 'Jobs' });
    await expect(section).toContainText('Jobs', { timeout: 5000 });
    await expect(section).toContainText('Name');
    await expect(section).toContainText('Description');
    await expect(section).toContainText('Gather', { timeout: 5000 });
  });

  test('16. Work Hut allows creating a worker', async () => {
    test.setTimeout(60000);
    const gather = sharedPage.locator('#gatherButton').first();
    for (let i = 0; i < 100; i++) await gather.click();
    await sharedPage.getByRole('link', { name: 'Town' }).click();
    const workHutBtn = sharedPage.getByRole('button', { name: /Improve Work Hut/i });
    await expect(workHutBtn).toBeVisible({ timeout: 15000 });
    await workHutBtn.click();
    await expect(sharedPage.locator('#name2')).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.getByText(/Enter a name for the worker/i)).toBeVisible({ timeout: 3000 });
    await sharedPage.locator('#name2').fill('E2EWorker');
    await sharedPage.locator('.workerPopup').getByRole('button', { name: 'Accept' }).click();
  });

  test('17. combat stats update after hero adventures', async () => {
    test.setTimeout(45000);
    // Dismiss any open modal overlay (e.g. from worker popup or tutorial) so the tab is clickable.
    await sharedPage.keyboard.press('Escape');
    await sharedPage.keyboard.press('Escape');
    await sharedPage.waitForTimeout(300);
    const overlay = sharedPage.locator('.ui-widget-overlay');
    await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await sharedPage.getByRole('link', { name: 'Options/Help' }).click({ force: true });
    const tips = sharedPage.locator('#tips');
    await expect(tips).toContainText(/Total Battles:|Wins:|Losses:/, { timeout: 5000 });
    await expect(tips).toContainText(/Total Battles: [1-9]|Wins: [1-9]|Losses: [1-9]/, { timeout: 15000 });
    await sharedPage.getByRole('link', { name: 'Hero' }).click({ force: true });
    await expect(sharedPage.locator('#heroList')).toContainText('SmokeTestHero');
    await expect(sharedPage.locator('#heroList')).toContainText(/Location: Home|Location: Cave|Resting|Complete|Fighting/);
  });
});
