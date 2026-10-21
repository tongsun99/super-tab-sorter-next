// Derived from Super Tab Sorter by Peter White. GPL-3.0.
// Rewritten by tongsun99, 2026-10-21; existing storage keys retained.
import { setLanguage, t } from './i18n.js';

const defaults = {
    sortBy: 'url', groupFrom: 'leftToRight', preserveOrderWithinGroups: true,
    groupSuspendedTabs: false, tabSuspenderExtensionId: 'noogafoofpebimajpfpamcfhoaifemoa',
    sortPinnedTabs: false, dedupeTabs: false, autoSortEnabled: false,
    autoSortIntervalSeconds: 300, autoSortOnTabCreate: true, autoSortOnTabClose: true,
    language: 'auto'
};
const form = document.getElementById('settings-form');
const save = document.getElementById('save');
const status = document.getElementById('status');
let saved;
let saving = false;
let languageRequest = Promise.resolve();
const field = key => document.getElementById(key);
function values() {
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key,
        typeof value === 'boolean' ? field(key).checked :
        typeof value === 'number' ? Number(field(key).value) : field(key).value
    ]));
}
function dependencies() {
    field('custom-options').disabled = field('sortBy').value !== 'custom';
    field('auto-options').disabled = !field('autoSortEnabled').checked;
    field('tabSuspenderExtensionId').disabled = field('groupSuspendedTabs').checked;
}
function dirty() {
    dependencies();
    save.disabled = saving || !saved || JSON.stringify(values()) === JSON.stringify(saved);
}
function showStatus(key, error = false) {
    status.textContent = key ? t(key) : '';
    status.dataset.error = String(error);
}
async function restore() {
    const settings = await chrome.storage.sync.get(defaults);
    // Fall back gracefully if a preference was written by a newer/older build.
    if (!['auto', 'en', 'zh_CN'].includes(settings.language)) settings.language = 'auto';
    for (const [key, value] of Object.entries(settings)) {
        if (typeof defaults[key] === 'boolean') field(key).checked = value;
        else field(key).value = value;
    }
    saved = values();
    await setLanguage(settings.language);
    field('version').textContent = `v${chrome.runtime.getManifest().version}`;
    dirty();
}
function edited() { showStatus(''); dirty(); }
// Make invalid advanced fields visible before the browser focuses them.
form.addEventListener('invalid', event => {
    const details = event.target.closest('details');
    if (details) details.open = true;
}, true);
form.addEventListener('input', edited);
form.addEventListener('change', edited);
// This select belongs to the form but lives in the header.
field('language').addEventListener('change', () => {
    const preference = field('language').value;
    languageRequest = languageRequest.then(() => setLanguage(preference)).then(() => {
        showStatus(''); dirty();
    }).catch(() => showStatus('error', true));
    dirty();
});
form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!saved || saving || !form.reportValidity()) return;
    const settings = values();
    saving = true;
    dirty();
    try {
        await languageRequest;
        await chrome.storage.sync.set(settings);
        saved = settings;
        showStatus('saved');
    } catch {
        showStatus('error', true);
    } finally {
        saving = false;
        dirty();
    }
});
restore().catch(async () => {
    await setLanguage().catch(() => {});
    showStatus('error', true);
});
