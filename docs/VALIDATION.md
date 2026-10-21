# 本次验证 / Validation

2026-10-21 · Super Tab Sorter Next 0.1.0

## 商店发布准备复核 / Store preparation recheck · 2026-10-22

- 16 项 Node 回归检查通过。
- 隔离 Chrome 界面检查通过：旧配置、双语切换与保存、表单校验、规则编辑与预览、窄屏布局。
- 真实 Chrome 扩展检查通过：安装、本地化、图标解码及刷新、同步设置、排序、去重、固定页排除、标签组保留及事件触发的正则去重。
- 本次真实扩展检查生成中英文商店截图，尺寸均为 1280 × 800。
- 移除旧的 `STS_Custom_Sort_Demo.mp4` 演示视频；保留 Git 历史及许可证、依赖源码和测试。
- 补全实际项目、隐私政策、反馈和版本源码地址；隐私说明明确用户填写的正则规则属于 Chrome 同步设置。

All 16 Node checks, isolated Chrome UI checks, and native Chrome extension checks passed. The native check generated English and Chinese 1280 × 800 screenshots. Store submission and approval remain separate manual steps.

## 正则去重增量验证 / Regex deduplication checks

- 15 项 Node 检查通过，覆盖首条命中、捕获组替换、全局正则状态重置、空结果及无效同步规则回退、B 站首页合并、视频参数和分批范围保留。
- 隔离 Chrome 界面检查通过：规则新增、删除、上下移动、无效正则禁止保存、保存及刷新恢复、中英文测试预览、390px 窄屏无横向溢出。截图位于 `test-results/`。
- 真实 Chrome 扩展检查通过：标签页事件自动触发正则去重，保留最新标签页，保留未匹配参数的页面，且不修改保留页面的网址；已有标题排序、固定页排除、标签组保留检查继续通过。
- Vivaldi 隔离测试未完成启动，已终止测试；尚不能据此确认 Vivaldi 实际运行结果。

All 15 Node checks, isolated Chrome UI checks, and native Chrome extension checks passed, including event-triggered regex deduplication. Vivaldi's isolated test did not finish starting and was stopped; Vivaldi still needs real-use verification.

### 工具栏图标兼容处理 / Toolbar icon refresh

Vivaldi 当前窗口中观察到扩展按钮存在、图像空白。补充 32px 图标，并在后台启动和安装／更新事件中调用 `action.setIcon` 重新发布图标。Node 检查增至 16 项并通过；真实 Chrome 检查确认声明图标均可解码且 `setIcon` 成功，排序与自动正则去重继续通过。尚未确认该处理能消除 Vivaldi 重新加载后的显示问题，需要在其工具栏中复验。

## 原有验证 / Previous checks

- 8 项 Node 回归检查全部通过：网址、标题、自定义方向及顺序、休眠页、去重、分批去重范围、自动排序间隔、双语文案覆盖。
- 隔离 Chrome 155 中的界面检查通过：旧配置读取、跟随浏览器语言、中英文切换、保存及刷新恢复、依赖控件、间隔校验、保存失败后重试和 390px 窄屏无横向溢出。已检查页面截图。
- 真实扩展检查通过：Chrome 加载 manifest、本地化信息、实际同步存储、标题排序、最大 ID 去重、固定页排除、移动后保留标签组。
- 原始 LICENSE 和 `psl.min.js` 与改动前逐字节一致。补齐 psl 1.9.0 和其内含 punycode.js 1.4.1 的 MIT 声明及可读源码。
- 上传 ZIP 根目录包含 manifest，另有对应源码 ZIP 和 SHA-256 校验文件。

These checks passed locally. They do not establish Chrome Web Store approval. Background suspension, full multi-window workflows and third-party suspender extensions still need real-use checks before a public release. Current auto-sort timing and sorting algorithms are retained from the previous version.

检查结果不代表商店审核通过。正式发布前仍需实际使用验证后台休眠、多窗口流程和第三方休眠扩展；本次保留原有自动排序时序及排序算法。
