// GPL-3.0, tongsun99, 2026-10-21. Real browser UI tests with mocked Chrome storage.
// Install Playwright to run; STSN_CHROME_PATH can point at an installed Chrome.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../src');
const version = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')).version;
const output = path.resolve(__dirname, '../test-results');
const contentTypes = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
const server = http.createServer((request, response) => {
    const file = path.resolve(root, '.' + decodeURI(new URL(request.url,'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', contentTypes[path.extname(file)] || 'text/plain; charset=utf-8');
    response.end(fs.readFileSync(file));
});
(async () => {
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({ headless:true, ignoreDefaultArgs:['--enable-features=CDPScreenshotNewSurface'], ...(process.env.STSN_CHROME_PATH ? {executablePath:process.env.STSN_CHROME_PATH} : {}) });
    try {
        const page = await browser.newPage({viewport:{width:1280,height:800}});
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(version => {
            // localStorage only emulates the Chrome API here; production uses storage.sync.
            window.chrome ??= {};
            chrome.i18n = {getUILanguage:()=>'zh-CN'};
            chrome.runtime = {getURL:p=>`${location.origin}/${p}`,getManifest:()=>({version})};
            chrome.storage = {sync:{
                async get(defaults) {
                    const stored = JSON.parse(localStorage.getItem('preferences') || '{"sortBy":"custom","preserveOrderWithinGroups":false}');
                    return Object.fromEntries(Object.entries(defaults).map(([key,value])=>[key,stored[key]??value]));
                },
                async set(values) {
                    if (window.failSave) throw new Error('Storage unavailable');
                    localStorage.setItem('preferences',JSON.stringify({...JSON.parse(localStorage.getItem('preferences')||'{}'),...values}));
                }
            }};
        }, version);
        await page.goto(origin+'/options.html');
        await page.getByRole('heading',{name:'排序',exact:true}).waitFor();
        assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
        assert.equal(await page.locator('#sortBy').inputValue(),'custom');
        assert.equal(await page.locator('#preserveOrderWithinGroups').isChecked(),false);
        assert.equal(await page.locator('#save').isDisabled(),true);
        assert.equal(await page.locator('#autoSortIntervalSeconds').isDisabled(),true);
        await page.locator('#language').selectOption('en');
        await page.getByRole('heading',{name:'Sorting',exact:true}).waitFor();
        await page.locator('#sortBy').selectOption('url');
        assert.equal(await page.locator('#groupFrom').isDisabled(),true);
        await page.locator('#autoSortEnabled').check();
        await page.locator('#autoSortIntervalSeconds').fill('5');
        await page.locator('#dedupeTabs').check();
        await page.locator('#save').click();
        await page.getByRole('status').filter({hasText:'Settings saved'}).waitFor();
        await page.reload();
        await page.getByRole('heading',{name:'Sorting',exact:true}).waitFor();
        assert.equal(await page.locator('#language').inputValue(),'en');
        assert.equal(await page.locator('#autoSortIntervalSeconds').inputValue(),'5');
        assert.equal(await page.locator('#dedupeTabs').isChecked(),true);
        assert.equal(await page.locator('#save').isDisabled(),true);
        await page.locator('#autoSortIntervalSeconds').fill('0');
        await page.locator('#save').click();
        assert.equal(await page.locator('#autoSortIntervalSeconds').evaluate(e=>e.validity.rangeUnderflow),true);
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('preferences')).autoSortIntervalSeconds),5);
        await page.locator('#autoSortIntervalSeconds').fill('3601');
        assert.equal(await page.locator('#autoSortIntervalSeconds').evaluate(e=>e.validity.rangeOverflow),true);
        await page.locator('#autoSortIntervalSeconds').fill('300');
        await page.evaluate(()=>window.failSave=true);
        await page.locator('#save').click();
        await page.locator('#status[data-error="true"]').waitFor();
        assert.equal(await page.locator('#save').isEnabled(),true);
        await page.evaluate(()=>window.failSave=false);
        await page.locator('summary[data-i18n="suspendedOptions"]').click();
        await page.locator('#groupSuspendedTabs').check();
        assert.equal(await page.locator('#tabSuspenderExtensionId').isDisabled(),true);
        await page.locator('#groupSuspendedTabs').uncheck();
        assert.equal(await page.locator('#tabSuspenderExtensionId').isEnabled(),true);
        await page.locator('summary[data-i18n="suspendedOptions"]').click();
        await page.locator('#autoSortEnabled').uncheck();
        await page.locator('#save').click();
        await page.getByRole('status').filter({hasText:'Settings saved'}).waitFor();
        fs.mkdirSync(output,{recursive:true});
        await page.screenshot({path:path.join(output,'settings-en.png'),fullPage:true});
        await page.locator('#language').selectOption('zh_CN');
        await page.getByRole('heading',{name:'排序',exact:true}).waitFor();
        await page.locator('#save').click();
        await page.getByRole('status').filter({hasText:'设置已保存'}).waitFor();
        await page.screenshot({path:path.join(output,'settings-zh.png'),fullPage:true});
        await page.setViewportSize({width:390,height:844});
        await page.evaluate(()=>scrollTo(0,0));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await page.screenshot({path:path.join(output,'settings-mobile.png'),fullPage:true,clip:{x:0,y:0,width:390,height:844}});
        await page.emulateMedia({colorScheme:'dark'});
        await page.screenshot({path:path.join(output,'settings-dark.png'),fullPage:true,clip:{x:0,y:0,width:390,height:844}});
        assert.deepEqual(errors,[]);
        console.log('UI checks passed: legacy settings, browser locale, English/Chinese switch, persistence, dependent controls, validation, save failure/retry, mobile layout.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; }).finally(()=>server.close());
