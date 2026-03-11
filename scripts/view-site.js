/**
 * Browser automation: open the dev site and take a screenshot.
 * Run while dev server is up: npm run dev (port 5173).
 */
const { chromium } = require('playwright');
const path = require('path');

const PORT = process.env.PORT || 5173;
const URL = `http://localhost:${PORT}`;
const OUT = path.join(__dirname, '..', 'site-screenshot.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: OUT, fullPage: false });
    console.log('Screenshot saved to', OUT);
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
