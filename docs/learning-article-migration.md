# 复制文章到网站

这份说明用于把已经写好的文章，以复制粘贴的方式迁移到 Explore / Learning 模块。

## 推荐流程

1. 复制文章模板文件。

   当前模板是根目录下的 `learning-ai-native-work-principles.html`。复制一份后，把文件名改成新的英文短链接，例如：

   ```text
   learning-ai-native-problem-framing.html
   ```

2. 修改新文章页面的信息。

   在新文件里依次替换：

   - `<title>` 和 `meta description`
   - `section-kicker`，例如 `AI-Native 工作理念` 或 `AI-Native 工作方法`
   - `<h1>` 主标题
   - `page-intro` 开头摘要
   - `article-meta` 里的分类、日期、标签
   - `article-cover` 里的图片路径
   - `article-content` 里的正文段落和小标题

3. 把正文复制到 `article-content`。

   普通段落用：

   ```html
   <p>这里粘贴一段正文。</p>
   ```

   小标题用：

   ```html
   <h2>这里粘贴小标题</h2>
   ```

   如果文章里有列表，可以用：

   ```html
   <ul>
     <li>第一点</li>
     <li>第二点</li>
   </ul>
   ```

4. 在 `explore-learning.html` 增加文章卡片。

   找到对应分类下的 `learning-article-grid`，复制一整段 `learning-card`，然后替换：

   - 链接地址：改成新文章文件名
   - 图片地址
   - 分类和日期
   - 文章标题
   - `learning-card-excerpt` 开头摘要
   - 标签

5. 放置文章图片。

   目前可以先复用 `ai-startup-screenshots/01-anthropic.png` 或 `ai-startup-screenshots/02-perplexity.png`。如果后续有自己的文章配图，建议新建 `assets/learning/` 目录，把图片放进去，然后在 HTML 里引用：

   ```html
   <img src="assets/learning/my-cover.png" alt="文章封面说明" />
   ```

6. 本地检查。

   修改后运行：

   ```bash
   node --test tests/site.test.mjs
   ```

   如果只新增静态文章，通常不需要改 JavaScript。

## 内容分类建议

- `AI-Native 工作理念`：适合放认知框架、趋势判断、工作观念、能力模型。
- `AI-Native 工作方法`：适合放具体步骤、工具流程、提示词方法、案例复盘、交付 SOP。

## 文章卡片摘要写法

`learning-card-excerpt` 建议放文章开头 1 到 2 句话，不要只写口号。它应该让读者知道这篇文章解决什么问题、适合谁读、读完能带走什么。
