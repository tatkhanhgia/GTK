const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'plans', 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/admin/login');
  await page.waitForTimeout(1000);

  await page.fill('input[type="email"]', 'admin@gtkblog.com');
  await page.fill('input[type="password"]', 'admin123456');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/admin/collections/pages');
  await page.waitForTimeout(2000);

  // Screenshot the per-page area
  const perPageEl = await page.$('.collection-list .per-page, .collection-list .page-controls');
  if (perPageEl) {
    const bbox = await perPageEl.boundingBox();
    if (bbox) {
      const screenshotPath = path.join(outDir, 'admin-perpage-current.png');
      await page.screenshot({
        path: screenshotPath,
        clip: {
          x: Math.max(0, bbox.x - 20),
          y: Math.max(0, bbox.y - 20),
          width: bbox.width + 40,
          height: bbox.height + 40,
        },
      });
      console.log('Saved per-page area to:', screenshotPath);
    }
  }

  // Full page screenshot too
  const fullPath = path.join(outDir, 'admin-pages-full.png');
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log('Saved full page to:', fullPath);

  await browser.close();
})();
