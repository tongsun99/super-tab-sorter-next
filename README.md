# Super Tab Sorter Next

[中文](#中文) · [English](#english)

## 中文

一个简洁的 Chrome 标签页排序扩展，支持中英文界面。

- 按网址、标题或自定义网站顺序排序，保留 Chrome 标签组。
- 可选整理固定标签页、重复网址去重（按标签 ID 保留最新页面）。
- 支持定时排序、新建或关闭标签页时自动排序。
- 保留休眠扩展兼容设置，全部选项集中在一个页面。

**安装：** 打开 `chrome://extensions`，开启开发者模式，点击“加载已解压的扩展程序”，选择 `src` 目录。点击工具栏图标整理最近聚焦的窗口；右键图标 → 选项，修改配置。首次点击或更新后会打开设置页。

自动排序默认关闭。间隔为 1～3600 秒；60 秒及以上向上取整到整分钟，后台休眠可能造成延迟。去重按标签组／未分组区域分别处理，固定标签页单独处理。

**隐私：** 网址、标题和标签组信息仅在浏览器中处理，不向开发者发送；配置通过 Chrome 同步存储保存。详见 [隐私政策](PRIVACY.md)。

**打包：** 运行 `./package_for_web_store.sh`，产物位于 `dist/`。发布准备见 [发布说明](docs/RELEASING.md)。目前尚未发布到 Chrome Web Store。

致敬 Peter White 的 [Super Tab Sorter](https://github.com/pwhite2/super-tab-sorter) 和 [Simple Tab Sorter](https://github.com/pwhite2/simple-tab-sorter)。本项目是独立维护的衍生版本，新增自动排序、去重策略及简洁双语界面，使用 **GPL v3**，不提供担保。详见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。

## English

A simple Chrome tab sorter with English and Chinese settings.

- Sort by URL, title, or custom website order while preserving Chrome tab groups.
- Optionally sort pinned tabs and close duplicate URLs, keeping the highest tab ID.
- Automatically sort on a schedule or when tabs open or close.
- Suspender compatibility and all settings on one page.

**Install:** Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `src`. Click the toolbar icon to sort the last focused window. Right-click → Options to configure. The first click after installation or an update opens settings.

Auto-sort is off by default. Intervals range from 1–3600 seconds; values of 60 seconds or more round up to whole minutes. Background suspension may delay sorting. Duplicates are handled separately within each group, the ungrouped area, and included pinned tabs.

**Privacy:** URLs, titles, and group information stay in your browser and are not sent to the developer. Preferences use Chrome storage sync. See [Privacy Policy](PRIVACY.md).

**Package:** Run `./package_for_web_store.sh`; archives appear in `dist/`. See [release notes](docs/RELEASING.md). Not yet published to the Chrome Web Store.

Thanks to Peter White for [Super Tab Sorter](https://github.com/pwhite2/super-tab-sorter) and [Simple Tab Sorter](https://github.com/pwhite2/simple-tab-sorter). This independently maintained derivative adds auto-sort, updated deduplication, and a simple bilingual interface. Licensed under **GPL v3**, without warranty. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
