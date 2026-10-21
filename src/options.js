// Derived from Super Tab Sorter by Peter White. GPL-3.0.
// Rewritten by tongsun99, 2026-10-21; existing storage keys retained.
import { setLanguage, t } from './i18n.js';
import { BILIBILI_HOME_RULE, compileDedupeRules, normalizeForDedupe } from './dedupe-rules.js';

const defaults = {
    sortBy: 'url', groupFrom: 'leftToRight', preserveOrderWithinGroups: true,
    groupSuspendedTabs: false, tabSuspenderExtensionId: 'noogafoofpebimajpfpamcfhoaifemoa',
    sortPinnedTabs: false, dedupeTabs: false, autoSortEnabled: false,
    autoSortIntervalSeconds: 300, autoSortOnTabCreate: true, autoSortOnTabClose: true,
    language: 'auto', dedupeMode: 'exact', dedupeRules: []
};
const form = document.getElementById('settings-form');
const save = document.getElementById('save');
const status = document.getElementById('status');
let saved;
let saving = false;
let languageRequest = Promise.resolve();
const field = key => document.getElementById(key);
const ruleRows = () => [...field('dedupe-rules').children];
function readRule(row) {
    return {
        pattern: row.querySelector('.rule-pattern').value,
        replacement: row.querySelector('.rule-replacement').value,
        flags: row.querySelector('.rule-flags').value
    };
}
function addRule(rule = {pattern:'', replacement:'$1', flags:''}) {
    const row = field('rule-template').content.firstElementChild.cloneNode(true);
    row.querySelector('.rule-pattern').value = rule.pattern ?? '';
    row.querySelector('.rule-replacement').value = rule.replacement ?? '';
    row.querySelector('.rule-flags').value = rule.flags ?? '';
    row.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    row.querySelector('.remove-rule').addEventListener('click', () => { row.remove(); edited(); });
    row.querySelector('.move-up').addEventListener('click', () => {
        if (row.previousElementSibling) row.previousElementSibling.before(row);
        edited();
    });
    row.querySelector('.move-down').addEventListener('click', () => {
        if (row.nextElementSibling) row.nextElementSibling.after(row);
        edited();
    });
    field('dedupe-rules').append(row);
    return row;
}
function validateRules() {
    ruleRows().forEach(row => {
        const pattern = row.querySelector('.rule-pattern');
        pattern.setCustomValidity('');
        try { compileDedupeRules([readRule(row)]); }
        catch { pattern.setCustomValidity(t('invalidRule')); }
    });
}
function values() {
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key,
        key === 'dedupeRules' ? ruleRows().map(readRule) :
        typeof value === 'boolean' ? field(key).checked :
        typeof value === 'number' ? Number(field(key).value) : field(key).value
    ]));
}
function dependencies() {
    field('custom-options').disabled = field('sortBy').value !== 'custom';
    field('auto-options').disabled = !field('autoSortEnabled').checked;
    field('tabSuspenderExtensionId').disabled = field('groupSuspendedTabs').checked;
    field('dedupe-options').disabled = !field('dedupeTabs').checked;
    field('regex-options').hidden = field('dedupeMode').value !== 'regex';
    field('regex-options').disabled = field('dedupeMode').value !== 'regex';
    ruleRows().forEach((row, index, rows) => {
        row.querySelector('.rule-number').textContent = index + 1;
        row.querySelector('.move-up').disabled = index === 0;
        row.querySelector('.move-down').disabled = index === rows.length - 1;
    });
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
    if (!['exact', 'regex'].includes(settings.dedupeMode)) settings.dedupeMode = 'exact';
    for (const [key, value] of Object.entries(settings)) {
        if (key === 'dedupeRules') {
            if (Array.isArray(value)) value.forEach(rule => addRule(rule || {}));
        } else if (typeof defaults[key] === 'boolean') field(key).checked = value;
        else field(key).value = value;
    }
    saved = values();
    await setLanguage(settings.language);
    validateRules();
    field('version').textContent = `v${chrome.runtime.getManifest().version}`;
    dirty();
}
function edited() { showStatus(''); field('test-results').replaceChildren(); validateRules(); dirty(); }
field('add-rule').addEventListener('click', () => {
    const row = addRule(); edited(); row.querySelector('.rule-pattern').focus();
});
field('bilibili-rule').addEventListener('click', () => { addRule(BILIBILI_HOME_RULE); edited(); });
field('test-rules').addEventListener('click', () => {
    validateRules();
    const invalid = ruleRows().find(row => !row.querySelector('.rule-pattern').validity.valid);
    if (invalid) { invalid.querySelector('.rule-pattern').reportValidity(); return; }
    const rules = compileDedupeRules(ruleRows().map(readRule));
    const results = field('test-urls').value.split(/\r?\n/).map(url => url.trim()).filter(Boolean).map(url => {
        try { return {url, ...normalizeForDedupe(new URL(url).href, rules)}; }
        catch { return {url, error:true}; }
    });
    const counts = new Map(), groupIds = new Map();
    results.filter(result => !result.error).forEach(({key}) => counts.set(key, (counts.get(key) || 0) + 1));
    const output = field('test-results');
    output.replaceChildren();
    results.forEach(result => {
        const line = document.createElement('p');
        line.className = 'test-result';
        if (result.error) line.textContent = `${result.url}\n${t('invalidTestUrl')}`;
        else {
            const match = result.ruleIndex < 0 ? t('noRuleMatch') : `${t('matchedRule')} ${result.ruleIndex + 1}`;
            let duplicate = '';
            if (counts.get(result.key) > 1) {
                if (!groupIds.has(result.key)) groupIds.set(result.key, groupIds.size + 1);
                duplicate = ` · ${t('duplicateGroup')} ${groupIds.get(result.key)}`;
            }
            line.textContent = `${result.url}\n→ ${result.key}\n${match}${duplicate}`;
        }
        output.append(line);
    });
});
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
        edited();
    }).catch(() => showStatus('error', true));
    dirty();
});
form.addEventListener('submit', async event => {
    event.preventDefault();
    validateRules();
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
