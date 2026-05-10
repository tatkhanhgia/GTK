const { chromium } = require('playwright');
const path = require('path');

const outDir = path.join(__dirname, '..', 'plans', 'reports');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/admin/login');
  await page.waitForTimeout(2000);

  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await page.fill('input[type="email"]', 'admin@gtkblog.com');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  await page.evaluate(() => {
    localStorage.setItem('gtkblog-admin-theme', 'dark');
    document.documentElement.classList.add('dark', 'admin-dark');
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.adminTheme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  });

  await page.goto('http://localhost:3000/admin/collections/pages');
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    document.documentElement.classList.add('dark', 'admin-dark');
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.adminTheme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  });

  const checkbox = await page.$('table tbody tr:first-child td:first-child input[type="checkbox"]');
  if (checkbox) {
    await checkbox.click();
    await page.waitForTimeout(3000);
  }

  const bulkPath = path.join(outDir, 'admin-bulk-edit-dark-fixed.png');
  await page.screenshot({ path: bulkPath, fullPage: true });
  console.log('Saved bulk edit dark fixed to:', bulkPath);

  await browser.close();
})();
