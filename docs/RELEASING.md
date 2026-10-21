# 发布准备 / Release preparation

Next 的版本号从 `0.1.0` 起独立迭代：修复用 `0.1.1`，新增功能用 `0.2.0`，稳定后发布 `1.0.0`。只需修改 `src/manifest.json`，测试和打包自动读取版本。

Next starts its own version sequence at `0.1.0`: fixes use `0.1.1`, feature releases use `0.2.0`, and a stable release can become `1.0.0`. Tests and packaging read the version from `src/manifest.json`.

## 本地验证 / Local verification

1. 在 `chrome://extensions` 加载 `src/`。Load `src/` as an unpacked extension.
2. 检查网址／标题／自定义排序、标签组、固定页、去重，以及新建／关闭／定时自动排序。Check all sorting modes, groups, pins, deduplication and auto-sort triggers.
3. 检查中英文切换、保存、刷新恢复与窄屏布局。Check both languages, saving, reload and narrow layouts.
4. `node --test tests/*.test.mjs` 验证排序回归。`node --test tests/*.test.mjs` runs sorting regression tests.
5. `./package_for_web_store.sh` 生成商店包和对应源码包，版本号只读取 `src/manifest.json`。Build store/source archives; the manifest is the sole version source.

界面自动检查：安装 Playwright（`npm install --no-save playwright`），安装其 Chromium（`npx playwright install chromium`），然后运行 `node tests/ui.cjs`；也可用 `STSN_CHROME_PATH` 指定已有 Chrome。测试使用隔离浏览器及模拟的 Chrome 存储，不会修改日常浏览器数据；截图保存在 `test-results/`，不加入上传包。

UI checks: install Playwright and its Chromium as above, then run `node tests/ui.cjs`. An existing Chrome can be selected with `STSN_CHROME_PATH`. Storage is mocked; native tab movement still needs an unpacked-extension check. Screenshots in `test-results/` are excluded from the store package.

`node tests/extension.cjs` 可在支持 `Extensions.loadUnpacked` 的 Chrome 中执行真实扩展检查，使用临时配置目录和本地测试页面，结束后关闭并清理。验证安装、真实同步存储、标题排序、去重、固定页及标签组保留；同时输出 `store-zh.png` / `store-en.png`（1280×800）。

Native extension smoke checks: `node tests/extension.cjs` uses a disposable profile and local fixture tabs on a Chrome build supporting `Extensions.loadUnpacked`. It checks installation, real sync storage, title sorting, deduplication, pinned exclusions and groups, and generates actual settings screenshots.

## 上架前 / Before submission

- 准备 Chrome Web Store 开发者账号并开启两步验证。Register a developer account with 2-Step Verification.
- 源码仓库为 https://github.com/tongsun99/super-tab-sorter-next 。公开本次发布的完整源码，为此版本建立 `v0.1.0` tag，并在商店说明中链接对应版本源码下载。不要链接未包含本次改动的旧版本。Publish the exact corresponding source, including scripts and dependency sources, tag the release, and link its download in the listing.
- 隐私政策网址为 https://github.com/tongsun99/super-tab-sorter-next/blob/master/PRIVACY.md 。公开仓库后检查该链接无需登录即可访问，再填入商店隐私政策字段。Verify that the policy is publicly accessible without signing in and enter its URL in the dashboard.
- 添加本版本的实际截图（例如 1280×800）及图标；不要沿用原版的商店链接、评价、安装量或作者身份。Add actual screenshots and use Next's identity.
- 使用下方的单一用途、权限说明和双语描述。按实际行为填写隐私披露：扩展会在本地访问网址、标题等浏览活动，不向开发者传输；偏好通过 Chrome 同步。不能因为不上传数据就忽略访问数据的披露。Complete privacy disclosures based on local access and Chrome preference sync.
- 上传 `dist/super-tab-sorter-next-v0.1.0.zip`，不要上传源码包。提交审核不代表保证获批。Upload the store archive, not the source archive; approval is subject to review.

商店字段及素材清单见 [STORE_LISTING.md](STORE_LISTING.md)。正式公开仓库、接受开发者协议、付款以及提交审核／发布的最终确认由发布者手动完成。

See [STORE_LISTING.md](STORE_LISTING.md) for the listing fields and assets. The publisher manually confirms repository visibility, developer agreements, payments, and review submission/publication.

## 商店描述 / Listing copy

**中文：** Super Tab Sorter Next 帮你整理当前窗口的标签页，支持按网址、标题或自定义网站顺序排序，并保留原生标签组。可选重复网址去重、固定标签页排序、定时自动排序及新建／关闭标签页时排序。提供简洁的中英文设置页。网址、标题和分组信息仅在浏览器内处理；配置通过 Chrome 同步存储保存。秒级定时受后台休眠影响。独立维护的 GPL v3 开源衍生项目，基于 Peter White 的 Super Tab Sorter。

**English:** Super Tab Sorter Next organizes tabs in the last focused window by URL, title, or custom website order while preserving native tab groups. Optional features include duplicate removal, pinned-tab sorting, scheduled sorting, and sorting when tabs open or close. Includes a simple English/Chinese settings page. URLs, titles, and group information are processed inside your browser; preferences use Chrome storage sync. Short intervals may be delayed by background suspension. An independently maintained GPL v3 derivative of Peter White's Super Tab Sorter.

**单一用途 / Single purpose:** 整理浏览器标签页及标签组。Organize browser tabs and tab groups.

| 权限 / Permission | 用途 / Purpose |
| --- | --- |
| `tabs` | 读取网址／标题以排序和去重，移动或关闭重复页面。Read URLs/titles for sorting and deduplication; move tabs and close duplicates. |
| `tabGroups` | 查询、排列并保持标签组。Query, move and preserve native groups. |
| `storage` | 保存和同步偏好。Save and sync preferences. |
| `alarms` | 定时触发排序。Schedule periodic sorting. |

## 协议核对 / License review

可以修改、改名和分发，但须遵守上游 GPL v3 第 4～6 条：保留声明及许可证、标记改动及日期、衍生版继续采用 GPL v3，并向接收者提供精确对应源码。本仓库保留上游历史，新增 NOTICE、依赖许可证、修改声明，并在上传包内包含可读源码及许可证；打包脚本另外生成含脚本／文档的源码包。公开发布时仍需提供真实可访问的版本源码地址。GPL 许可不等同于商店审核通过。

Modification, renaming and distribution are permitted subject to GPL v3 sections 4–6: preserve notices and the license, mark changes and dates, license the derivative under GPL v3, and supply corresponding source. The store package includes readable code and notices; a separate archive includes scripts and documentation. Publish an accessible exact-version source download before distribution. GPL permission does not guarantee store approval.

Sources checked 2026-10-21:

- [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html)
- [GNU GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html)
- [Chrome Web Store policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
- [Publishing](https://developer.chrome.com/docs/webstore/publish)
- [Service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
