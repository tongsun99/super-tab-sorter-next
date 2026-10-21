// Copyright (c) 2026 tongsun99. GPL-3.0. Modified 2026-10-21.
let messages = {};
export async function setLanguage(preference = 'auto') {
    const requested = preference === 'auto' ? chrome.i18n.getUILanguage() : preference;
    const locale = requested.toLowerCase().startsWith('zh') ? 'zh_CN' : 'en';
    const response = await fetch(chrome.runtime.getURL(`_locales/${locale}/messages.json`));
    if (!response.ok) throw new Error('Unable to load translations');
    messages = await response.json();
    document.documentElement.lang = locale === 'zh_CN' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });
    document.title = t('extensionName');
}
export function t(key) { return messages[key]?.message || key; }
