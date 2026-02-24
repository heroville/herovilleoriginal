// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Heroville smoke', () => {
  test('app loads and shows main UI', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#wrap')).toBeVisible();
    await expect(page.locator('#resources')).toBeVisible();
    await expect(page.locator('#gatherButton').first()).toBeVisible();
  });

  test('gather button increases resources', async ({ page }) => {
    await page.goto('/');
    const resourcesEl = page.locator('#resources');
    const initialText = await resourcesEl.textContent();

    const gather = page.locator('#gatherButton').first();
    await gather.click();
    await gather.click();
    await gather.click();

    const afterText = await resourcesEl.textContent();
    expect(afterText).not.toBe(initialText);
    expect(afterText).toMatch(/\d/);
  });

  test('save button shows confirmation (options tab)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#gatherButton').first().click({ clickCount: 3 });

    await page.getByRole('link', { name: 'Options/Help' }).click();
    await expect(page.locator('#save')).toBeVisible();
    await page.locator('#save').click();

    await expect(page.locator('#errorDialog')).toContainText(/saved|save/i, { timeout: 4000 });
  });

  test('buy Tent, add named hero, and see hero in Hero tab', async ({ page }) => {
    const heroName = 'SmokeTestHero';
    await page.goto('/');

    const gather = page.locator('#gatherButton').first();
    for (let i = 0; i < 6; i++) await gather.click();

    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Tent' }).click();

    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });
    await page.locator('#name').fill(heroName);
    await page.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();

    await page.getByRole('link', { name: 'Hero' }).click();
    await expect(page.locator('#heroList')).toContainText(heroName, { timeout: 5000 });
    await expect(page.locator('#heroList')).toContainText('Class: Adventurer');
  });

  test('Town shows dungeon list after first Tent', async ({ page }) => {
    await page.goto('/');
    const gather = page.locator('#gatherButton').first();
    for (let i = 0; i < 6; i++) await gather.click();

    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });
    await page.locator('#name').fill('DungeonTestHero');
    await page.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();

    await page.getByRole('link', { name: 'Town' }).click();
    const townPanel = page.locator('section#container').filter({ hasText: 'Buildings' });
    await expect(townPanel).toContainText('Dungeons', { timeout: 5000 });
    await expect(townPanel).toContainText(/Encounter Rate|Length/, { timeout: 3000 });
  });

  test('building Dungeons adds a second dungeon (DungeonService)', async ({ page }) => {
    await page.goto('/');
    const gather = page.locator('#gatherButton').first();
    for (let i = 0; i < 25; i++) await gather.click();

    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });
    await page.locator('#name').fill('Dungeon2Hero');
    await page.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();

    for (let i = 0; i < 5; i++) await gather.click();
    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Stockpile' }).click();

    for (let i = 0; i < 25; i++) await gather.click();
    await page.getByRole('link', { name: 'Town' }).click();
    const townPanel = page.locator('section#container').filter({ hasText: 'Buildings' });
    await expect(townPanel).toContainText('Dungeons', { timeout: 5000 });

    await page.getByRole('button', { name: 'Improve Dungeons' }).click();

    const dungeonTable = townPanel.locator('table').filter({ hasText: 'Encounter Rate' });
    await expect(dungeonTable.locator('tr')).toHaveCount(4, { timeout: 5000 });
  });

  test('Production tab shows potion UI after Stockpile (ProductionService)', async ({ page }) => {
    await page.goto('/');
    const gather = page.locator('#gatherButton').first();
    for (let i = 0; i < 5; i++) await gather.click();

    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });
    await page.locator('#name').fill('ProdTestHero');
    await page.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();

    for (let i = 0; i < 25; i++) await gather.click();
    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Stockpile' }).click();

    await page.locator('a[uib-tab-heading-transclude]').filter({ hasText: /^Production$/ }).click();
    const productionSection = page.locator('section#containter');
    await expect(productionSection).toContainText('Healing Herbs', { timeout: 5000 });
    await expect(productionSection).toContainText('Create Potion');
  });

  test('combat runs and win/loss stats update after hero adventures', async ({ page }) => {
    await page.goto('/');
    const gather = page.locator('#gatherButton').first();
    for (let i = 0; i < 6; i++) await gather.click();

    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });
    await page.locator('#name').fill('CombatTestHero');
    await page.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();

    await page.getByRole('link', { name: 'Options/Help' }).click();
    const tips = page.locator('#tips');
    await expect(tips).toContainText(/Total Battles:|Wins:|Losses:/, { timeout: 5000 });

    await expect(tips).toContainText(/Total Battles: [1-9]|Wins: [1-9]|Losses: [1-9]/, { timeout: 55000 });

    await page.locator('a[uib-tab-heading-transclude]').filter({ hasText: /^Hero$/ }).click();
    await expect(page.locator('#heroList')).toContainText('CombatTestHero');
    await expect(page.locator('#heroList')).toContainText(/Location: Home|Location: Cave|Resting|Complete|Fighting/);
  });
});
