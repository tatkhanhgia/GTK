const { chromium } = require('playwright');
const path = require('path');

const outDir = path.join(__dirname, '..', 'plans', 'reports');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3004/admin/login');
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

  await page.goto('http://localhost:3004/admin/collections/pages');
  await page.waitForTimeout(3000);

  // Tick checkbox on first row
  const checkbox = await page.$('table tbody tr:first-child td:first-child input[type="checkbox"]');
  if (checkbox) {
    await checkbox.click();
    await page.waitForTimeout(2000);
  }

  // Try to find and click "Chỉnh sửa" in the bulk action bar
  const editBtn = await page.$('text=Chỉnh sửa');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(3000);
  }

  const drawerPath = path.join(outDir, 'admin-bulk-edit-drawer-fixed-v2.png');
  await page.screenshot({ path: drawerPath, fullPage: true });
  console.log('Saved bulk edit drawer fixed v2 to:', drawerPath);

  await browser.close();
})();
