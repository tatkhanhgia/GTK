const { chromium } = require('playwright');

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

  // Tick checkbox and click Chỉnh sửa to open drawer
  const checkbox = await page.$('table tbody tr:first-child td:first-child input[type="checkbox"]');
  if (checkbox) {
    await checkbox.click();
    await page.waitForTimeout(2000);
  }

  const editBtn = await page.$('text=Chỉnh sửa');
  if (editBtn) {
    await editBtn.click();
    await page.waitForTimeout(3000);
  }

  // Inspect all visible panels/drawers
  const panels = await page.$$eval('div, aside, section', els =>
    els
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 100 && rect.width < 400 && rect.height > 200 && rect.left < 300;
      })
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        text: el.textContent?.substring(0, 100)
      }))
  );

  console.log('Left panels:', JSON.stringify(panels, null, 2));

  await browser.close();
})();
