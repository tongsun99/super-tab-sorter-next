# 本次验证 / Validation

2026-10-21 · Super Tab Sorter Next 0.1.0

- 8 项 Node 回归检查全部通过：网址、标题、自定义方向及顺序、休眠页、去重、分批去重范围、自动排序间隔、双语文案覆盖。
- 隔离 Chrome 155 中的界面检查通过：旧配置读取、跟随浏览器语言、中英文切换、保存及刷新恢复、依赖控件、间隔校验、保存失败后重试和 390px 窄屏无横向溢出。已检查页面截图。
- 真实扩展检查通过：Chrome 加载 manifest、本地化信息、实际同步存储、标题排序、最大 ID 去重、固定页排除、移动后保留标签组。
- 原始 LICENSE 和 `psl.min.js` 与改动前逐字节一致。补齐 psl 1.9.0 和其内含 punycode.js 1.4.1 的 MIT 声明及可读源码。
- 上传 ZIP 根目录包含 manifest，另有对应源码 ZIP 和 SHA-256 校验文件。

These checks passed locally. They do not establish Chrome Web Store approval. Background suspension, full multi-window workflows and third-party suspender extensions still need real-use checks before a public release. Current auto-sort timing and sorting algorithms are retained from the previous version.

检查结果不代表商店审核通过。正式发布前仍需实际使用验证后台休眠、多窗口流程和第三方休眠扩展；本次保留原有自动排序时序及排序算法。
