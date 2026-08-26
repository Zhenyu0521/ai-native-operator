# Sync Feishu Learning to Site

一个面向 AI Native Operator 个人网站的 Codex Skill：把飞书文档中的指定一级标题章节同步为 Learning 文章，并完成页面生成、测试、迭代记录和可选线上发布。

## 功能

- 根据飞书文档链接和一级标题精确定位文章内容。
- 写入 `data/learning-sources.json`，生成 `learning-<slug>.html` 并更新 Learning 列表。
- 校验同步脚本、页面测试和项目 JSON 数据。
- 更新本地 `workspace-hub` 中的进度、任务和会话记录。
- 在用户明确要求时推送 `main`，通过 GitHub Actions 发布到 `siyu0529.com`。

## 前置条件

- 已安装并登录 `lark-cli`，且有权限读取目标飞书文档。
- 本地已有 `Zhenyu0521/ai-native-operator` 网站仓库。
- 已安装 Node.js 和 Git；线上发布还需要有效的 GitHub 认证。
- 网站仓库保留以下文件：

  ```text
  data/learning-sources.json
  scripts/sync-learning-from-lark.mjs
  explore-learning.html
  workspace-hub/data/progress.json
  ```

## 安装

在 `ai-native-operator` 仓库根目录执行：

```bash
mkdir -p ~/.codex/skills
cp -R skills/sync-feishu-learning-to-site ~/.codex/skills/
```

随后重启 Codex，或开启一个新任务以刷新 Skill 列表。

## 使用方式

可以直接告诉 Codex：

```text
使用 $sync-feishu-learning-to-site，把这篇飞书文章同步到网站 Learning 的 AI-Native 工作方法，并在预览后发布上线。
```

Skill 会要求四项必要输入：

1. 飞书文档链接。
2. 与文档中 `#` 一级标题完全一致的文章标题。
3. `AI-Native 工作理念` 或 `AI-Native 工作方法`。
4. 只做本地预览，或预览后线上发布。

slug、标签、摘要和日期可以由 Codex 推断，但在生成前会展示确认摘要。

## 工作流程

1. 读取网站的来源配置、同步脚本和当前进展。
2. 通过 `lark-cli` 获取飞书 Markdown，并按一级标题截取章节。
3. 确认页面元数据并更新来源配置。
4. 运行同步脚本生成文章页和 Learning 卡片。
5. 重复运行脚本检查幂等性，并执行 Node 测试与 JSON 校验。
6. 更新本地进展记录。
7. 仅在明确授权后提交、推送，并检查部署结果。

## 栏目映射

| 网站栏目 | 配置值 |
| --- | --- |
| AI-Native 工作理念 | `work-principles` |
| AI-Native 工作方法 | `work-methods` |

## 限制与安全边界

- 这是项目专用 Skill，不是通用 CMS 导入器。
- 不会在缺少明确发布请求时自行上线。
- 不会提交无关工作区修改、认证信息、部署 Secret 或本机绝对路径。
- `workspace-hub/` 默认只用于本地开发管理，不随生产站点发布。
- 若飞书或 GitHub 授权失效，Skill 会保留本地成果并报告阻塞点。

## 文件说明

```text
sync-feishu-learning-to-site/
├── README.md
├── SKILL.md
├── CHANGELOG.md
└── agents/
    └── openai.yaml
```

## 迭代记录

版本变化见 [CHANGELOG.md](CHANGELOG.md)。
