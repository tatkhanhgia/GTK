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

  // Navigate directly to about page edit
  await page.goto('http://localhost:3003/admin/collections/pages/1');
  await page.waitForTimeout(3000);

  const editPath = path.join(outDir, 'admin-page-about-edit.png');
  await page.screenshot({ path: editPath, fullPage: true });
  console.log('Saved about edit page to:', editPath);

  await browser.close();
})();
