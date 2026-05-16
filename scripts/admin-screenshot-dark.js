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

  // Set dark mode via localStorage before navigating
  await page.evaluate(() => {
    localStorage.setItem('gtkblog-admin-theme', 'dark');
    document.documentElement.classList.add('dark', 'admin-dark');
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.adminTheme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  });

  await page.goto('http://localhost:3003/admin/collections/pages');
  await page.waitForTimeout(2000);

  // Re-apply dark mode after navigation
  await page.evaluate(() => {
    localStorage.setItem('gtkblog-admin-theme', 'dark');
    document.documentElement.classList.add('dark', 'admin-dark');
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.adminTheme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  });
  await page.waitForTimeout(500);

  const listPath = path.join(outDir, 'admin-pages-dark.png');
  await page.screenshot({ path: listPath, fullPage: true });
  console.log('Saved dark list to:', listPath);

  // Select first row checkbox
  const checkbox = await page.$('table tbody tr:first-child td:first-child input[type="checkbox"]');
  if (checkbox) {
    await checkbox.click();
    await page.waitForTimeout(2000);

    // Re-apply dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark', 'admin-dark');
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.style.colorScheme = 'dark';
    });

    const selPath = path.join(outDir, 'admin-pages-selected-dark.png');
    await page.screenshot({ path: selPath, fullPage: true });
    console.log('Saved selected dark to:', selPath);
  }

  await browser.close();
})();
