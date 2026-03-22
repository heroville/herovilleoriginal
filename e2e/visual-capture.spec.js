// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Visual capture: drive the game through key states and save screenshots.
 * Run before and after UI changes, then diff the screenshots/ folder to spot regressions.
 *
 * Usage:
 *   npm run test:visual   # builds app, starts preview, runs this spec, saves to screenshots/
 *
 * Screenshots are named 01-fresh-load.png, 02-after-gather.png, etc. Use a diff tool or
 * git diff screenshots/ to compare before vs after.
 */

const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');
const VIEWPORT = { width: 1920, height: 1080 };

function screenshotPath(name) {
  return path.join(SCREENSHOTS_DIR, `${name}.png`);
}

async function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

test.describe.serial('Visual capture', () => {
  /** @type {import('@playwright/test').Page} */
  let sharedPage;
  /** @type {import('@playwright/test').BrowserContext} */
  let sharedContext;

  test.beforeAll(async ({ browser }) => {
    ensureScreenshotsDir();
    sharedContext = await browser.newContext({
      viewport: VIEWPORT,
    });
    // Block external requests (fonts, analytics) that would hang in sandboxed CI environments.
    await sharedContext.route(/googleapis|google-analytics|googletagmanager/, (route) => route.abort());
    await sharedContext.addInitScript(() => {
      window['__HEROVILLE_E2E_FAST_TICK__'] = 10;
    });
    sharedPage = await sharedContext.newPage();
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  test('1. fresh load – Town tab', async () => {
    await sharedPage.goto('/');
    await sharedPage.evaluate(() => localStorage.removeItem('data'));
    await sharedPage.reload();
    await expect(sharedPage.getByTestId('game-tabs')).toBeVisible({ timeout: 10000 });
    await expect(sharedPage.getByTestId('gather-trigger')).toBeVisible({ timeout: 10000 });
    await sharedPage.waitForFunction(() => typeof window['__HEROVILLE_E2E_STATE__'] === 'function', { timeout: 5000 });
    await expect(sharedPage.getByTestId('town-tab')).toContainText('Buildings', { timeout: 10000 });
    await sharedPage.screenshot({ path: screenshotPath('01-fresh-load') });
  });

  test('2. after gather – resources updated', async () => {
    const gather = sharedPage.getByTestId('gather-trigger');
    await gather.click({ clickCount: 5 });
    await sharedPage.waitForTimeout(200);
    await sharedPage.screenshot({ path: screenshotPath('02-after-gather') });
  });

  test('3. Options/Help tab', async () => {
    await sharedPage.getByRole('tab', { name: 'Options/Help' }).click();
    await expect(sharedPage.getByTestId('save-button')).toBeVisible({ timeout: 5000 });
    await sharedPage.screenshot({ path: screenshotPath('03-options-help') });
  });

  test('4. Hero dialog (buy new hero)', async () => {
    const gather = sharedPage.getByTestId('gather-trigger');
    await gather.click({ clickCount: 6 });
    await sharedPage.getByRole('tab', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Tent' }).click();
    await expect(sharedPage.locator('.heroPopup')).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.getByTestId('hero-name-input')).toBeVisible({ timeout: 5000 });
    await sharedPage.screenshot({ path: screenshotPath('04-hero-dialog') });
    await sharedPage.getByTestId('hero-name-input').fill('VisualCaptureHero');
    await sharedPage.locator('.heroPopup').getByRole('button', { name: 'Accept' }).click();
  });

  test('5. Hero tab with hero', async () => {
    await sharedPage.getByRole('tab', { name: 'Heroes' }).click();
    await expect(sharedPage.getByTestId('hero-list')).toContainText('VisualCaptureHero', { timeout: 5000 });
    await sharedPage.screenshot({ path: screenshotPath('05-hero-tab-with-hero') });
  });

  test('6. Town – Stockpile + second dungeon', async () => {
    const gather = sharedPage.getByTestId('gather-trigger');
    await gather.click({ clickCount: 25 });
    await sharedPage.getByRole('tab', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Stockpile' }).click();
    await gather.click({ clickCount: 25 });
    await sharedPage.getByRole('tab', { name: 'Town' }).click();
    await sharedPage.getByRole('button', { name: 'Improve Dungeons' }).click();
    const townPanel = sharedPage.getByTestId('town-tab');
    await expect(townPanel.locator('table').filter({ hasText: 'Encounter Rate' }).locator('tr')).toHaveCount(4, { timeout: 5000 });
    await sharedPage.screenshot({ path: screenshotPath('06-town-dungeons') });
  });

  test('7. Production tab', async () => {
    await sharedPage.getByRole('tab', { name: 'Production' }).click();
    const productionSection = sharedPage.getByTestId('production-tab');
    await expect(productionSection).toContainText('Healing Herbs', { timeout: 5000 });
    await expect(productionSection).toContainText('Create Potion');
    await sharedPage.screenshot({ path: screenshotPath('07-production-tab') });
  });

  test('8. Options/Help – save confirmation dialog', async () => {
    await sharedPage.getByRole('tab', { name: 'Options/Help' }).click();
    await sharedPage.getByTestId('save-button').click();
    await expect(sharedPage.getByTestId('error-toast')).toContainText(/saved|save/i, { timeout: 4000 });
    await sharedPage.screenshot({ path: screenshotPath('08-options-save-dialog') });
  });
});
