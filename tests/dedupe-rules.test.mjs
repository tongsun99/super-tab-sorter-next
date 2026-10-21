// Super Tab Sorter Next, tongsun99, 2026-10-21. GPL-3.0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BILIBILI_HOME_RULE, compileDedupeRules, normalizeForDedupe } from '../src/dedupe-rules.js';

test('Bilibili example matches the homepage and source parameter only', () => {
    const rules = compileDedupeRules([BILIBILI_HOME_RULE]);
    for (const url of ['https://www.bilibili.com/', 'https://www.bilibili.com/?spm_id_from=333.1007.0.0']) {
        assert.equal(normalizeForDedupe(url, rules).key, 'https://www.bilibili.com/');
    }
    for (const url of ['https://www.bilibili.com/?other=1', 'https://www.bilibili.com/?spm_id_from=x&other=1',
        'https://www.bilibili.com/video/BV123/?p=2', 'https://www.bilibili.com/#route', 'https://evil.com/?spm_id_from=x']) {
        assert.equal(normalizeForDedupe(url, rules).key, url);
        assert.equal(normalizeForDedupe(url, rules).ruleIndex, -1);
    }
});
test('rules apply the first matching replacement, preserve capture groups, and reset global state', () => {
    const rules = compileDedupeRules([
        {pattern:'^(https://example\\.com/).*$',replacement:'$1',flags:'g'},
        {pattern:'.*',replacement:'should-not-apply',flags:''}
    ]);
    for (let i=0; i<3; i++) {
        const result = normalizeForDedupe('https://example.com/?a=1', rules);
        assert.equal(result.key, 'https://example.com/');
        assert.equal(result.ruleIndex, 0);
    }
    const insensitive = compileDedupeRules([{pattern:'(example)(\\.com)',replacement:'$1.org',flags:'i'}]);
    assert.equal(normalizeForDedupe('https://EXAMPLE.com/a?x=1#part', insensitive).key, 'https://EXAMPLE.org/a?x=1#part');
});
test('unmatched URLs and empty results fall back to the original URL', () => {
    const url = 'https://example.com/?x=1#route';
    assert.equal(normalizeForDedupe(url, []).key, url);
    assert.equal(normalizeForDedupe(url, compileDedupeRules([{pattern:'.*',replacement:'',flags:'g'}])).key, url);
});
test('invalid patterns, flags, and malformed stored rules are rejected', () => {
    for (const rule of [null, {}, {pattern:'',replacement:'',flags:''}, {pattern:'[',replacement:'',flags:''},
        {pattern:'.',replacement:'',flags:'gg'}, {pattern:'.',replacement:'',flags:'x'}, {pattern:'.',replacement:42,flags:''}]) {
        assert.throws(() => compileDedupeRules([rule]));
    }
    assert.throws(() => compileDedupeRules('invalid'));
});
