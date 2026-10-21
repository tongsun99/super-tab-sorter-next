// GPL-3.0, tongsun99, 2026-10-22. Assemble Chrome Web Store assets.
// Run tests/extension.cjs first to capture the actual extension settings.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist/store-assets');

(async () => {
    fs.mkdirSync(output, { recursive: true });
    for (const language of ['en', 'zh']) {
        fs.copyFileSync(path.join(root, `test-results/store-${language}.png`), path.join(output, `screenshot-${language}.png`));
    }
    fs.copyFileSync(path.join(root, 'src/img/128.png'), path.join(output, 'icon-128.png'));
    const icon = fs.readFileSync(path.join(root, 'src/img/128.png')).toString('base64');
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.STSN_CHROME_PATH ? { executablePath: process.env.STSN_CHROME_PATH } : {})
    });
    try {
        const page = await browser.newPage({ viewport: { width: 440, height: 280 }, deviceScaleFactor: 1 });
        await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><style>
            *{box-sizing:border-box}body{margin:0;width:440px;height:280px;padding:30px 32px;
            background:linear-gradient(125deg,#152a60,#254ec5);color:#fff;font-family:system-ui,-apple-system,sans-serif}
            header{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:650;letter-spacing:-.3px}
            img{width:44px;height:44px}header span{color:#b8d0ff}h1{font-size:34px;line-height:1.17;
            letter-spacing:-1px;font-weight:700;margin:24px 0 22px}p{margin:0;color:#d6e2ff;font-size:14px;letter-spacing:.1px}
        </style><header><img src="data:image/png;base64,${icon}" alt=""><div>Super Tab Sorter <span>Next</span></div></header>
        <h1>A little order for<br>your open tabs.</h1><p>Sort · Deduplicate · Automate</p></html>`);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(output, 'promo-440x280.png') });
    } finally { await browser.close(); }
    console.log(`Store assets: ${output}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
