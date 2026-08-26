# Changelog

这里记录 `sync-feishu-learning-to-site` 的重要迭代。

## 2026-08-27 — 网站 Skills Library 版

- 在 Build / Skills Library 新增 Skill 卡片和独立详情页。
- 网站详情页补充四阶段工作流、必要输入、安装方式和安全边界。
- 新增公开 Skill 完整性、隐私扫描、网站入口和本地迭代记录测试。
- 采用 GitHub 源码先行、网站部署后发的两阶段发布方式。

## 2026-08-27 — GitHub 目录版

- 在 `ai-native-operator` 仓库中新增顶层 `skills/` 目录并收录本 Skill。
- 移除对本机用户名和固定绝对路径的依赖，改为通过项目特征文件定位仓库。
- 新增中文 README、Codex 展示元数据、安装方式和安全边界。

## 2026-08-23 — 第二篇文章实战

- 使用该工作流同步第二篇飞书 Learning 文章，验证同一来源文档可按不同一级标题重复使用。
- 改进 `AI`、`Codex`、`agent` 与中文之间的空格规范。
- 为多 Agent 主题文章增加无文字 CSS 视觉样式，并补充回归测试。

## 2026-08-23 — 初始版本

- 将飞书章节读取、Learning 配置、页面生成、测试、进展记录和可选部署封装为项目专用 Codex Skill。
- 明确四项必要输入：文档链接、精确标题、Learning 栏目和发布模式。
