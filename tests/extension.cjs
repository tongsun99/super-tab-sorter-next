// GPL-3.0, tongsun99, 2026-10-21. Smoke test in an isolated, real extension profile.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/manifest.json'), 'utf8')).version;
const server = http.createServer((request,response) => {
    const title = new URL(request.url,'http://localhost').searchParams.get('title') || 'Tab';
    response.setHeader('Content-Type','text/html; charset=utf-8');
    response.end(`<title>${title.replace(/[^A-Za-z ]/g,'')}</title><p>Extension test</p>`);
});
let context;
let profile;
async function until(page, predicate, argument) {
    const deadline=Date.now()+10000;
    while (Date.now()<deadline) {
        if (await page.evaluate(predicate,argument)) return;
        await new Promise(resolve=>setTimeout(resolve,50));
    }
    throw new Error('Timed out waiting for native tab operations');
}
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const origin=`http://127.0.0.1:${server.address().port}`;
    profile=fs.mkdtempSync(path.join(os.tmpdir(),'stsn-extension-'));
    context=await chromium.launchPersistentContext(profile,{
        headless:true, args:['--enable-unsafe-extension-debugging'], ignoreDefaultArgs:['--disable-extensions','--enable-features=CDPScreenshotNewSurface'],
        ...(process.env.STSN_CHROME_PATH ? {executablePath:process.env.STSN_CHROME_PATH}: {})
    });
    const session=await context.browser().newBrowserCDPSession();
    const {id}=await session.send('Extensions.loadUnpacked',{path:path.resolve(__dirname,'../src')});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`chrome-extension://${id}/options.html`);
    await page.locator('#version').filter({hasText:`v${version}`}).waitFor();
    const manifest=await page.evaluate(()=>chrome.runtime.getManifest());
    assert.equal(manifest.name,'Super Tab Sorter Next');
    assert.equal(manifest.version,version);
    assert.deepEqual(manifest.permissions,['tabs','tabGroups','storage','alarms']);
    await page.locator('#language').selectOption('zh_CN');
    await page.getByRole('heading',{name:'排序',exact:true}).waitFor();
    await page.locator('#save').click();
    await page.getByRole('status').filter({hasText:'设置已保存'}).waitFor();
    await page.reload();
    await page.getByRole('heading',{name:'排序',exact:true}).waitFor();
    const output=path.resolve(__dirname,'../test-results');
    fs.mkdirSync(output,{recursive:true});
    await page.setViewportSize({width:1280,height:800});
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,'store-zh.png'),fullPage:true,clip:{x:0,y:0,width:1280,height:800}});
    await page.locator('#language').selectOption('en');
    await page.getByRole('heading',{name:'Sorting',exact:true}).waitFor();
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,'store-en.png'),fullPage:true,clip:{x:0,y:0,width:1280,height:800}});
    const fixture=await page.evaluate(async origin=>{
        await chrome.storage.sync.set({sortBy:'title',dedupeTabs:true,autoSortEnabled:false,sortPinnedTabs:false});
        const win=await chrome.windows.create({url:origin+'/?title=Zebra',focused:true});
        const a=await chrome.tabs.create({windowId:win.id,url:origin+'/?title=Apple',active:false});
        const old=await chrome.tabs.create({windowId:win.id,url:origin+'/?title=Duplicate',active:false});
        const newest=await chrome.tabs.create({windowId:win.id,url:origin+'/?title=Duplicate',active:false});
        const pin=await chrome.tabs.create({windowId:win.id,url:origin+'/?title=Pinned',pinned:true,active:false});
        return {windowId:win.id,old:old.id,newest:newest.id,pin:pin.id};
    },origin);
    await until(page,async winId=>(await chrome.tabs.query({windowId:winId})).every(t=>t.status==='complete'),fixture.windowId);
    await page.evaluate(async winId=>{await chrome.windows.update(winId,{focused:true});await chrome.runtime.sendMessage({type:'click_event'});},fixture.windowId);
    await until(page,async f=>{
        const tabs=await chrome.tabs.query({windowId:f.windowId});
        return tabs.length===4 && tabs.map(t=>t.title).join(',')==='Pinned,Apple,Duplicate,Zebra';
    },fixture);
    const result=await page.evaluate(async winId=>await chrome.tabs.query({windowId:winId}),fixture.windowId);
    assert.ok(result.some(t=>t.id===fixture.newest));
    assert.ok(!result.some(t=>t.id===fixture.old));
    assert.equal(result[0].id,fixture.pin);
    // Group membership survives movement; duplicates in separate groups remain.
    const groupId=await page.evaluate(async f=>{
        const tabs=await chrome.tabs.query({windowId:f.windowId,pinned:false});
        const groupId=await chrome.tabs.group({tabIds:tabs.map(t=>t.id)});
        await chrome.tabGroups.update(groupId,{title:'01 Work'});
        await chrome.runtime.sendMessage({type:'click_event'});
        return groupId;
    },fixture);
    await until(page,async ({windowId,groupId})=>(await chrome.tabs.query({windowId,pinned:false})).every(t=>t.groupId===groupId),{windowId:fixture.windowId,groupId});
    assert.deepEqual(errors,[]);
    console.log('Native extension checks passed: install/manifest, real sync storage and language reload, title sorting, newest-ID deduplication, pinned exclusion, group preservation.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
    if(context) await context.close();
    if(profile) fs.rmSync(profile,{recursive:true,force:true});
    server.close();
});
