const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'plans', 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
  console.log('After login, URL:', page.url());

  await page.goto('http://localhost:3003/admin/collections/pages');
  await page.waitForTimeout(2000);
  console.log('Pages list URL:', page.url());

  const listPath = path.join(outDir, 'admin-pages-list.png');
  await page.screenshot({ path: listPath, fullPage: true });
  console.log('Saved pages list to:', listPath);

  const link = await page.$('table tbody tr:first-child a');
  if (link) {
    await link.click();
    await page.waitForTimeout(3000);
    console.log('Edit page URL:', page.url());
    const editPath = path.join(outDir, 'admin-page-edit.png');
    await page.screenshot({ path: editPath, fullPage: true });
    console.log('Saved edit page to:', editPath);
  } else {
    console.log('No link found in pages list');
    const cell = await page.$('table tbody tr:first-child td:first-child');
    if (cell) {
      await cell.click();
      await page.waitForTimeout(3000);
      const editPath = path.join(outDir, 'admin-page-edit.png');
      await page.screenshot({ path: editPath, fullPage: true });
      console.log('Saved edit page (cell click) to:', editPath);
    }
  }

  await browser.close();
})();
