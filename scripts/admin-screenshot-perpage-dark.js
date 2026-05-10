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

  // Click dark mode toggle
  const darkToggle = await page.$('button[aria-label="Dark mode"], button[title="Dark mode"], .theme-toggle, [data-testid="theme-toggle"]');
  if (darkToggle) {
    await darkToggle.click();
    await page.waitForTimeout(1000);
  } else {
    // Try clicking the moon icon or theme switcher in top right
    const themeBtn = await page.$('header button:last-child, .nav__controls button:last-child');
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Screenshot the per-page area in dark mode
  const perPageEl = await page.$('.collection-list .per-page, .collection-list .page-controls');
  if (perPageEl) {
    const bbox = await perPageEl.boundingBox();
    if (bbox) {
      const screenshotPath = path.join(outDir, 'admin-perpage-dark.png');
      await page.screenshot({
        path: screenshotPath,
        clip: {
          x: Math.max(0, bbox.x - 20),
          y: Math.max(0, bbox.y - 20),
          width: bbox.width + 40,
          height: bbox.height + 40,
        },
      });
      console.log('Saved per-page dark mode to:', screenshotPath);
    }
  }

  // Switch to EN and screenshot
  const enBtn = await page.$('button:has-text("EN")');
  if (enBtn) {
    await enBtn.click();
    await page.waitForTimeout(1000);

    const perPageEl2 = await page.$('.collection-list .per-page, .collection-list .page-controls');
    if (perPageEl2) {
      const bbox2 = await perPageEl2.boundingBox();
      if (bbox2) {
        const screenshotPath2 = path.join(outDir, 'admin-perpage-en-dark.png');
        await page.screenshot({
          path: screenshotPath2,
          clip: {
            x: Math.max(0, bbox2.x - 20),
            y: Math.max(0, bbox2.y - 20),
            width: bbox2.width + 40,
            height: bbox2.height + 40,
          },
        });
        console.log('Saved per-page EN dark mode to:', screenshotPath2);
      }
    }
  }

  await browser.close();
})();
