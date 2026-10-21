// GPL-3.0, tongsun99, 2026-10-21. Behavior regression tests for retained sorting.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function engine() {
    const removed = [], moved = [], groups = [], timers = [], alarms = [];
    const event = () => ({ listeners: [], addListener(fn) { this.listeners.push(fn); } });
    const chrome = {
        runtime: { onMessage: event(), onInstalled: event() },
        tabs: { onCreated: event(), onUpdated: event(), onRemoved: event(), remove(ids) { removed.push(...ids); }, move(ids) { moved.push([...ids]); }, group(value) { groups.push(value); } },
        storage: { sync: { get(defaults, callback) { if (callback) callback(defaults); else return Promise.resolve(defaults); } }, onChanged: event() },
        alarms: { onAlarm: event(), clear() {}, create(...args) { alarms.push(args); } }
    };
    const context = vm.createContext({ chrome, URL, URLSearchParams, console, setTimeout() {}, clearTimeout() {}, setInterval(fn, ms) { timers.push(ms); return 1; }, clearInterval() {} });
    vm.runInContext(fs.readFileSync(new URL('../src/psl.min.js', import.meta.url), 'utf8'), context);
    vm.runInContext(fs.readFileSync(new URL('../src/background.js', import.meta.url), 'utf8').replace("import './psl.min.js';", ''), context);
    return { context, removed, moved, groups, chrome, timers, alarms };
}
const tab = (id, url, title = '', extra = {}) => ({ id, url, title, index: id - 1, pinned: false, groupId: -1, ...extra });

test('URL sort retains upstream public-suffix and component ordering', () => {
    const { context } = engine();
    const tabs = [tab(1,'https://z.co.uk/'), tab(2,'https://mail.a.co.uk/'), tab(3,'https://a.co.uk/z'), tab(4,'https://a.co.uk/a')];
    context.sortByTitleOrUrl(tabs, 'url', false, false);
    // Upstream concatenates the nullable subdomain into the sort key.
    assert.deepEqual(tabs.map(t => t.id), [2,4,3,1]);
});
test('title ordering and fixed-tab exclusion are retained', () => {
    const { context } = engine();
    const tabs = [tab(1,'https://z.com/','Z', { pinned: true }),tab(2,'https://c.com/','C'),tab(3,'https://a.com/','A')];
    context.sortByTitleOrUrl(tabs, 'title', false, false);
    assert.deepEqual(tabs.map(t => t.id), [1,3,2]);
});
test('custom ordering preserves host appearance and within-host preference', () => {
    const { context } = engine();
    const original = [tab(1,'https://b.com/z'),tab(2,'https://a.com/'),tab(3,'https://b.com/a')];
    for (const direction of ['leftToRight','rightToLeft']) {
        const tabs = [...original];
        context.sortByCustom(tabs, direction, false, true, false);
        assert.deepEqual(tabs.map(t => t.id), direction === 'leftToRight' ? [1,3,2] : [2,1,3]);
    }
    context.sortByCustom(original, 'leftToRight', false, false, false);
    assert.deepEqual(original.map(t => t.id), [3,1,2]);
});
test('suspended tabs can be decoded or grouped to the left', () => {
    const { context } = engine();
    const prefix = 'chrome-extension://noogafoofpebimajpfpamcfhoaifemoa/suspended.html#';
    context.SUSPENDED_PREFIX = prefix;
    context.SUSPENDED_PREFIX_LEN = prefix.length;
    const suspended = tab(2,prefix+'uri='+encodeURIComponent('https://z.com/'),'Z');
    assert.equal(context.tabToUrl(suspended, false).href, 'https://z.com/');
    const tabs = [tab(1,'https://a.com/','A'), suspended];
    context.sortByTitleOrUrl(tabs, 'title', true, false);
    assert.deepEqual(tabs.map(t => t.id), [2,1]);
});
test('deduplication keeps highest ID, preserves URL hashes, and reassigns group', async () => {
    const { context, removed, moved, groups } = engine();
    await context.sortTabs([tab(1,'https://a.com/'),tab(4,'https://a.com/'),tab(5,'https://a.com/#other')], 7,
        { sortBy:'url', dedupeTabs:true, tabSuspenderExtensionId:'noogafoofpebimajpfpamcfhoaifemoa' });
    assert.deepEqual(removed, [1]);
    assert.deepEqual(moved, [[4,5]]);
    assert.equal(groups[0].groupId, 7);
    assert.deepEqual([...groups[0].tabIds], [4,5]);
});
test('deduplication does not close duplicates in another processing batch', async () => {
    const { context, removed } = engine();
    for (const id of [1,2]) await context.sortTabs([tab(id,'https://a.com/')], -1, {sortBy:'url',dedupeTabs:true});
    assert.deepEqual(removed, []);
});
test('auto-sort retains second timers and rounded minute alarms', () => {
    const { context, chrome, timers, alarms } = engine();
    for (const interval of [5,59,60,61,3600]) {
        chrome.storage.sync.get = (defaults, callback) => callback({...defaults,autoSortEnabled:true,autoSortIntervalSeconds:interval});
        context.initializeAutoSort();
    }
    assert.deepEqual(timers, [5000,59000]);
    assert.deepEqual(alarms.map(a => a[1].periodInMinutes), [1,2,60]);
});
test('URL updates schedule automatic sorting only when the tab creation option is enabled', () => {
    const { context, chrome } = engine();
    let scheduled = 0;
    context.triggerAutoSortIfEnabled = () => { scheduled++; };
    let settings = {autoSortEnabled:true, autoSortOnTabCreate:true};
    chrome.storage.sync.get = (defaults, callback) => callback({...defaults, ...settings});
    const updated = chrome.tabs.onUpdated.listeners[0];
    updated(1, {status:'complete'});
    updated(1, {url:'https://example.com/'});
    assert.equal(scheduled, 1);
    settings.autoSortOnTabCreate = false;
    updated(1, {url:'https://example.com/other'});
    settings.autoSortOnTabCreate = true;
    settings.autoSortEnabled = false;
    updated(1, {url:'https://example.com/third'});
    assert.equal(scheduled, 1);
});
test('both locales cover all settings labels and manifest messages', () => {
    const en = JSON.parse(fs.readFileSync(new URL('../src/_locales/en/messages.json',import.meta.url)));
    const zh = JSON.parse(fs.readFileSync(new URL('../src/_locales/zh_CN/messages.json',import.meta.url)));
    assert.deepEqual(Object.keys(en),Object.keys(zh));
    const html = fs.readFileSync(new URL('../src/options.html',import.meta.url),'utf8');
    for (const [,key] of html.matchAll(/data-i18n="([^"]+)"/g)) {
        assert.ok(en[key]?.message && zh[key]?.message, key);
    }
    assert.ok(en.extensionDescription.message.length <= 132);
    assert.ok(zh.extensionDescription.message.length <= 132);
});
