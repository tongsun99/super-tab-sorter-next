// Derived from Super Tab Sorter by Peter White; rewritten 2026-10-21 by tongsun99.
// GPL-3.0; see LICENSE and NOTICE.
import { setLanguage, t } from './i18n.js';
async function activate() {
    const config = await chrome.storage.sync.get({ newInstall: false, newUpdate: false, language: 'auto' });
    await setLanguage(config.language);
    if (config.newInstall || config.newUpdate) {
        await chrome.runtime.openOptionsPage();
        await chrome.storage.sync.set({ installedVersion: chrome.runtime.getManifest().version, newInstall: false, newUpdate: false });
    } else {
        const response = await chrome.runtime.sendMessage({ type: 'click_event' });
        if (response?.message !== 'success') throw new Error('Sorting unavailable');
    }
    window.close();
}
activate().catch(() => { document.getElementById('status').textContent = t('error'); });
