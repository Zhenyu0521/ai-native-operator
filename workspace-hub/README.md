# Workspace Control Center

这是《个人网站制作》工作区的本地中枢，用来追踪网站建设进展、多任务状态和不同 Codex 会话之间的交接。

## 打开方式

直接打开：

```text
workspace-hub/index.html
```

如果浏览器因为本地文件安全策略无法读取 JSON，可以在工作区根目录启动一个本地静态服务后访问。

## 数据来源

- `data/progress.json`：当前网站进展、页面地图、下一步动作。
- `data/tasks.json`：任务看板，支持 `backlog / doing / review / done`。
- `data/sessions.json`：不同会话的工作摘要、改动文件和交接事项。

## 会话协作约定

每个并行会话开始前先查看 dashboard。每个会话结束前更新：

1. `data/sessions.json`：记录本次做了什么、改了哪些文件、下一步是什么。
2. `data/tasks.json`：更新任务状态。
3. `data/progress.json`：如果页面地图或整体进展有变化，也同步更新。

这版是方案 B：本地 dashboard + 手动维护 JSON。它不自动运行 git 或测试，重点是轻、稳、可读。
