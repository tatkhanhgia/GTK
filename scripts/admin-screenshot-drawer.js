const { chromium } = require('playwright');
const path = require('path');

const outDir = path.join(__dirname, '..', 'plans', 'reports');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3003/admin/login');
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'admin@gtkblog.com');
  await page.fill('input[type="password"]', 'admin123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Click theme toggle to set dark mode (click moon icon)
  const themeBtn = await page.$('button[aria-label*="theme" i], button[title*="theme" i]');
  if (themeBtn) {
    await themeBtn.click();
    await page.waitForTimeout(500);
  }

  await page.goto('http://localhost:3003/admin/collections/pages');
  await page.waitForTimeout(2000);

  // Click on first row to open edit drawer
  const firstRow = await page.$('table tbody tr:first-child');
  if (firstRow) {
    // Try clicking the edit button or the row itself
    const editBtn = await firstRow.$('button[aria-label*="edit" i], a[href*="/admin/collections/pages/"]');
    if (editBtn) {
      await editBtn.click();
    } else {
      await firstRow.click();
    }
    await page.waitForTimeout(3000);

    const drawerPath = path.join(outDir, 'admin-drawer-dark.png');
    await page.screenshot({ path: drawerPath, fullPage: true });
    console.log('Saved drawer screenshot to:', drawerPath);
  }

  await browser.close();
})();
