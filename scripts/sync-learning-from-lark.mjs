#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcesPath = join(root, "data", "learning-sources.json");
const learningPath = join(root, "explore-learning.html");

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const normalizeText = (value) =>
  value
    .replace(/pua/gi, "PUA")
    .replace(/\bai\b/gi, "AI")
    .replace(/\bcodex\b/gi, "Codex")
    .replace(/\bagent\b/gi, "agent")
    .replace(/([\u4e00-\u9fa5])AI/g, "$1 AI")
    .replace(/AI(?!-)([\u4e00-\u9fa5])/g, "AI $1")
    .replace(/([\u4e00-\u9fa5])Codex/g, "$1 Codex")
    .replace(/Codex([\u4e00-\u9fa5])/g, "Codex $1")
    .replace(/([\u4e00-\u9fa5])agent/g, "$1 agent")
    .replace(/agent([\u4e00-\u9fa5])/g, "agent $1")
    .replace(/\s+/g, " ")
    .replace(/AI - native/gi, "AI-Native")
    .trim();

const formatDate = (date) => date.replaceAll("-", ".");

const fetchMarkdown = (docUrl) => {
  const output = execFileSync(
    "lark-cli",
    [
      "docs",
      "+fetch",
      "--api-version",
      "v2",
      "--doc",
      docUrl,
      "--doc-format",
      "markdown",
      "--format",
      "json",
    ],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  if (!result.ok) {
    throw new Error(result.error?.message || "Failed to fetch Lark document");
  }
  return result.data.document.content;
};

const extractSection = (markdown, sectionTitle) => {
  const lines = markdown.split(/\r?\n/);
  const titleLine = `# ${sectionTitle}`;
  const start = lines.findIndex((line) => line.trim() === titleLine);
  if (start === -1) {
    throw new Error(`Section not found: ${sectionTitle}`);
  }

  const sectionLines = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("# ")) break;
    sectionLines.push(line);
  }

  return sectionLines.map((line) => line.trim()).filter(Boolean);
};

const renderBody = (lines) =>
  lines
    .map((line) => {
      const numbered = line.match(/^([1-9])、(.+)$/);
      if (numbered) {
        return `<p><strong>${numbered[1]}. </strong>${escapeHtml(normalizeText(numbered[2]))}</p>`;
      }
      return `<p>${escapeHtml(normalizeText(line))}</p>`;
    })
    .join("\n          ");

const renderArticle = (source, lines) => {
  const title = escapeHtml(source.sectionTitle);
  const categoryLabel = escapeHtml(source.categoryLabel);
  const tags = source.tags.join(" / ");
  const excerpt = escapeHtml(source.excerpt);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | Learning | AI Native Operator</title>
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <meta
      name="description"
      content="${excerpt}"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="index.html" aria-label="AI Native Operator home"><span class="brand-mark" data-logo="ano-monogram" aria-hidden="true"><span class="monogram-letter">A</span><span class="monogram-letter">N</span><span class="monogram-letter">O</span></span><span>AI Native Operator</span></a>
      <nav class="nav" aria-label="Primary navigation"><a href="index.html#philosophy">Philosophy</a><a href="explore.html">Explore</a><a href="build.html">Build</a><a href="share.html">Share</a></nav>
    </header>

    <main id="top">
      <article class="section-shell article-page">
        <a class="back-link" href="explore-learning.html">Back to Learning</a>

        <header class="article-hero">
          <div>
            <p class="section-kicker">${categoryLabel}</p>
            <h1>${title}</h1>
            <p class="page-intro">
              ${excerpt}
            </p>
          </div>
          <aside class="article-meta" aria-label="Article metadata">
            <span>Category</span>
            <strong>${categoryLabel}</strong>
            <span>Published</span>
            <strong>${formatDate(source.publishedAt)}</strong>
            <span>Tags</span>
            <strong>${escapeHtml(tags)}</strong>
          </aside>
        </header>

        <section class="article-content">
          ${renderBody(lines)}
        </section>
      </article>
    </main>

    <script src="script.js?v=split-pages"></script>
  </body>
</html>
`;
};

const renderVisual = (visualClass) => {
  if (visualClass === "tips-visual") {
    return `<span class="learning-card-visual tips-visual" aria-hidden="true">
                  <span class="tips-step tips-step-a"></span>
                  <span class="tips-step tips-step-b"></span>
                  <span class="tips-step tips-step-c"></span>
                  <span class="tips-line tips-line-a"></span>
                  <span class="tips-line tips-line-b"></span>
                </span>`;
  }
  if (visualClass === "parallel-visual") {
    return `<span class="learning-card-visual parallel-visual" aria-hidden="true">
                  <span class="parallel-pane parallel-pane-a"></span>
                  <span class="parallel-pane parallel-pane-b"></span>
                  <span class="parallel-pane parallel-pane-c"></span>
                  <span class="parallel-core"></span>
                </span>`;
  }

  return `<span class="learning-card-visual" aria-hidden="true"></span>`;
};

const renderCard = (source) => {
  const href = `${source.slug}.html`;
  const tags = source.tags.slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `            <article class="learning-card">
              <a class="learning-card-media" href="${href}" aria-label="阅读 ${escapeHtml(source.sectionTitle)}">
                ${renderVisual(source.visualClass)}
              </a>
              <div class="learning-card-body">
                <div class="learning-meta"><span>方法</span><time datetime="${source.publishedAt}">${formatDate(source.publishedAt)}</time></div>
                <h3><a href="${href}">${escapeHtml(source.sectionTitle)}</a></h3>
                <p class="learning-card-excerpt">
                  ${escapeHtml(source.excerpt)}
                </p>
                <div class="learning-tags" aria-label="Article tags">${tags}</div>
              </div>
            </article>`;
};

const upsertCard = (html, source) => {
  const href = `${source.slug}.html`;
  const card = renderCard(source);
  const sectionStart = html.indexOf('<section class="learning-section" id="work-methods"');
  if (sectionStart === -1) throw new Error("work-methods section not found");
  const sectionEnd = html.indexOf("</section>", sectionStart);
  if (sectionEnd === -1) throw new Error("work-methods section end not found");

  const beforeSection = html.slice(0, sectionStart);
  const section = html.slice(sectionStart, sectionEnd);
  const afterSection = html.slice(sectionEnd);
  const withoutExisting = section.replace(
    /\n\s*<article class="learning-card">[\s\S]*?<\/article>/g,
    (existing) => (existing.includes(`href="${href}"`) ? "" : existing),
  );
  const gridStart = withoutExisting.indexOf('<div class="learning-article-grid">');
  if (gridStart === -1) throw new Error("work-methods article grid not found");
  const insertAt = withoutExisting.indexOf("\n", gridStart) + 1;
  const updatedSection = `${withoutExisting.slice(0, insertAt)}${card}\n${withoutExisting.slice(insertAt)}`;
  return `${beforeSection}${updatedSection}${afterSection}`;
};

const sources = JSON.parse(readFileSync(sourcesPath, "utf8"));
let learningHtml = readFileSync(learningPath, "utf8");

for (const source of sources.filter((item) => item.status === "published")) {
  const markdown = fetchMarkdown(source.docUrl);
  const lines = extractSection(markdown, source.sectionTitle);
  writeFileSync(join(root, `${source.slug}.html`), renderArticle(source, lines));
  learningHtml = upsertCard(learningHtml, source);
}

writeFileSync(learningPath, learningHtml);
