// Super Tab Sorter Next, tongsun99, 2026-10-21. GPL-3.0.
export const BILIBILI_HOME_RULE = {
    pattern: '^(https://www\\.bilibili\\.com/)(?:\\?spm_id_from=[^&#]*)?$',
    replacement: '$1',
    flags: ''
};

export function compileDedupeRules(rules) {
    if (!Array.isArray(rules)) throw new Error('Expected an array of rules');
    return rules.map(rule => {
        if (!rule || typeof rule.pattern !== 'string' || !rule.pattern.trim() ||
            typeof rule.replacement !== 'string' || typeof rule.flags !== 'string' ||
            !/^[gimsu]*$/.test(rule.flags)) {
            throw new Error('Invalid regular expression rule');
        }
        return { regex: new RegExp(rule.pattern, rule.flags), replacement: rule.replacement };
    });
}

// Each rule sees the original URL; the first match wins. Never navigate a tab.
export function normalizeForDedupe(url, rules) {
    for (let index = 0; index < rules.length; index++) {
        const { regex, replacement } = rules[index];
        regex.lastIndex = 0;
        if (!regex.test(url)) continue;
        regex.lastIndex = 0;
        const key = url.replace(regex, replacement);
        // An accidental empty replacement must not merge unrelated pages.
        return { key: key || url, ruleIndex: index };
    }
    return { key: url, ruleIndex: -1 };
}
