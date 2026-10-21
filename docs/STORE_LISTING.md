# Chrome Web Store listing · v0.1.0

Prepared 2026-10-22. The publisher manually confirms review submission and publication.

## Links and package

- Name: Super Tab Sorter Next
- Category: Productivity / Workflow & Planning (choose the corresponding dashboard category)
- Languages: English and Simplified Chinese
- Homepage: https://github.com/tongsun99/super-tab-sorter-next
- Support: https://github.com/tongsun99/super-tab-sorter-next/issues
- Privacy policy: https://github.com/tongsun99/super-tab-sorter-next/blob/master/PRIVACY.md
- Exact v0.1.0 source: https://github.com/tongsun99/super-tab-sorter-next/archive/refs/tags/v0.1.0.zip
- Package: `dist/super-tab-sorter-next-v0.1.0.zip`
- Icon: `dist/store-assets/icon-128.png`
- Small promotional tile: `dist/store-assets/promo-440x280.png`
- English screenshot: `dist/store-assets/screenshot-en.png` (1280 × 800)
- Chinese screenshot: `dist/store-assets/screenshot-zh.png` (1280 × 800)
- Distribution: Free, public; no in-app purchases, ads, or login required.

The source and privacy URLs must be publicly accessible before review submission.

## English description

Super Tab Sorter Next brings a little order to your open tabs. Sort the last focused browser window while preserving native tab groups.

• Sort by website address or page title. Custom mode follows the existing order of website hosts, read from left to right or right to left.
• Optionally close duplicate tabs, keeping the newest tab by tab ID. Choose exact URL matching or your own regular-expression rules, with a preview to test rules before using them.
• Keep duplicates in separate tab groups separate. Pinned tabs are excluded unless you choose to include them.
• Enable automatic sorting on a schedule or when tabs open or close. Automatic sorting and duplicate removal are off by default.
• Use English or Simplified Chinese settings.

Privacy: Open-tab URLs, titles, and group information are processed inside your browser and are not sent to the developer. Preferences, including user-entered regex rules, use Chrome storage sync. No analytics, ads, trackers, or remotely executed code.

Timing: Short sorting intervals may be delayed when the extension's background worker sleeps. Intervals of 60 seconds or more round up to whole minutes.

An independently maintained GPL v3 derivative of Peter White's Super Tab Sorter and Simple Tab Sorter.

Source: https://github.com/tongsun99/super-tab-sorter-next
Source for this version: https://github.com/tongsun99/super-tab-sorter-next/archive/refs/tags/v0.1.0.zip
Privacy: https://github.com/tongsun99/super-tab-sorter-next/blob/master/PRIVACY.md
Support: https://github.com/tongsun99/super-tab-sorter-next/issues

## 中文说明

Super Tab Sorter Next 帮你整理最近聚焦窗口的标签页，并保留浏览器原生标签组。

• 按网址或页面标题排序；自定义模式按照网站现有的出现顺序，从左到右或从右到左整理。
• 可选关闭重复标签页，按标签 ID 保留最新页面。支持精确网址匹配或自定义正则表达式，并可先预览规则效果。
• 不跨标签组去重；固定标签页默认不参与，可自行开启。
• 可选定时自动排序，或在新建、关闭标签页时排序。自动排序和去重默认关闭。
• 提供简体中文和英文设置页。

隐私：打开的标签页网址、标题和分组信息仅在浏览器内处理，不向开发者发送。偏好设置（包括你填写的正则去重规则）通过 Chrome 同步存储保存。没有分析统计、广告、追踪器或远程执行代码。

定时说明：后台休眠可能导致短间隔排序延迟；60 秒及以上的间隔向上取整到整分钟。

本项目是基于 Peter White 的 Super Tab Sorter / Simple Tab Sorter 独立维护的 GPL v3 开源衍生版本。

源码：https://github.com/tongsun99/super-tab-sorter-next
本版本源码：https://github.com/tongsun99/super-tab-sorter-next/archive/refs/tags/v0.1.0.zip
隐私政策：https://github.com/tongsun99/super-tab-sorter-next/blob/master/PRIVACY.md
问题反馈：https://github.com/tongsun99/super-tab-sorter-next/issues

## Single purpose

Organize browser tabs and native tab groups through sorting and optional duplicate removal.

## Permission justifications

| Permission | Justification |
| --- | --- |
| tabs | Read open-tab URLs and titles to sort and identify duplicates; move tabs and close duplicates only when the user enables duplicate removal. No tab URLs or titles are transmitted to the developer. |
| tabGroups | Query and move native tab groups and preserve group membership while sorting. Duplicate removal is scoped to each group or ungrouped area. |
| storage | Save and sync sorting preferences, user-entered regex deduplication rules, automatic sorting options, language, and installation/version flags using Chrome storage sync. Open-tab URLs and titles are not stored in sync. |
| alarms | Schedule periodic automatic tab sorting when the user enables it. Automatic sorting is disabled by default. |

Remote code: No. All executable code is bundled with the extension.

## User data handling

The extension handles web browsing activity (open-tab URLs and titles) locally for its single purpose. It does not send that data to the developer or analytics services. Preferences and user-entered regex rules use Chrome storage sync. Do not describe the extension as handling no user data: local processing and Chrome sync must still be disclosed.

The publisher confirms that data is not sold or transferred outside the permitted uses, is not used for unrelated purposes, and is not used for creditworthiness or lending.

## Reviewer test instructions

No login, account, payment, or external service is required.

1. Install the extension and click its toolbar icon. The first click opens settings.
2. Select a sort mode and save. Open several ordinary web pages in one browser window, then click the toolbar icon again to sort them.
3. Optionally enable duplicate removal and open the same URL twice. Click the icon to retain the tab with the higher tab ID. Tabs in different native groups are not deduplicated together.
4. To test regex rules, select Regular expressions, add the Bilibili homepage example, and use Test rules with `https://www.bilibili.com/` and `https://www.bilibili.com/?spm_id_from=example`. The preview identifies them as duplicates without changing or closing tabs.
5. Automatic sorting is opt-in. Enable it, save, and create or close a tab to test its event triggers. Background suspension can delay short timer intervals.
