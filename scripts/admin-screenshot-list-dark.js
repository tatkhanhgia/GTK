const { chromium } = require('playwright');
const path = require('path');

const outDir = path.join(__dirname, '..', 'plans', 'reports');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3003/admin/login');
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'admin@gtkblog.com');
  await page.fill('input[type="password"]', 'admin123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Set dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark', 'admin-dark');
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.dataset.adminTheme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  });

  await page.goto('http://localhost:3003/admin/collections/pages');
  await page.waitForTimeout(2000);

  const listPath = path.join(outDir, 'admin-pages-list-dark.png');
  await page.screenshot({ path: listPath, fullPage: true });
  console.log('Saved pages list dark to:', listPath);

  // Try to click checkbox on first row
  const checkbox = await page.$('table tbody tr:first-child td:first-child input[type="checkbox"]');
  if (checkbox) {
    await checkbox.click();
    await page.waitForTimeout(2000);
    const selectPath = path.join(outDir, 'admin-pages-list-selected-dark.png');
    await page.screenshot({ path: selectPath, fullPage: true });
    console.log('Saved pages list selected dark to:', selectPath);
  }

  await browser.close();
})();
