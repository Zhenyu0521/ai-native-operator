import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const readFixture = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const ignoredDirectories = new Set(["node_modules", "dist"]);

const listPublicHtmlFiles = (directory = repoRoot) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || ignoredDirectories.has(entry.name)) {
      return [];
    }

    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return listPublicHtmlFiles(entryPath);
    }

    return entry.name.endsWith(".html") ? [entryPath] : [];
  });

const html = readFixture("index.html");
const buildSkillsHtml = readFixture("build-skills.html");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const news = JSON.parse(
  readFileSync(new URL("../data/news.json", import.meta.url), "utf8"),
);

test("every public HTML page uses the shared ANO favicon", () => {
  const faviconPath = resolve(repoRoot, "favicon.svg");

  assert.equal(existsSync(faviconPath), true, "favicon.svg should exist");

  for (const pagePath of listPublicHtmlFiles()) {
    const page = readFileSync(pagePath, "utf8");
    const iconLinks = [
      ...page.matchAll(/<link\b[^>]*\brel=["']icon["'][^>]*>/gi),
    ];
    const pageName = relative(repoRoot, pagePath);

    assert.equal(iconLinks.length, 1, `${pageName} should declare one favicon`);

    const iconTag = iconLinks[0][0];
    const href = iconTag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    assert.ok(href, `${pageName} favicon should have an href`);
    assert.match(iconTag, /\btype=["']image\/svg\+xml["']/i);
    assert.equal(resolve(dirname(pagePath), href), faviconPath);
  }

  const syncScript = readFixture("scripts/sync-learning-from-lark.mjs");
  assert.match(
    syncScript,
    /<link rel="icon" href="favicon\.svg" type="image\/svg\+xml" \/>/,
  );
});

test("homepage contains core AI Native Operator positioning", () => {
  assert.match(html, /AI Native Operator/);
  assert.match(html, /Building the Future of AI-Native Work/);
  assert.match(html, /持续探索 AI 时代工作生活的最佳实践，让AI-Native触手可及/);
  assert.match(html, /AI 的价值不在于替代人/);
});

test("homepage navigation stops at philosophy and links pillars to separate pages", () => {
  for (const href of ["#philosophy", "explore.html", "build.html", "share.html"]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }

  assert.doesNotMatch(html, /id="explore"/);
  assert.doesNotMatch(html, /id="build"/);
  assert.doesNotMatch(html, /id="share"/);
  assert.doesNotMatch(html, /Brand Architecture/);
  assert.doesNotMatch(html, /href="#evidence"/);
  assert.doesNotMatch(html, /href="#products"/);
  assert.doesNotMatch(html, /id="evidence"/);
  assert.doesNotMatch(html, /id="products"/);
});

test("homepage uses ANO monogram brand mark instead of the old cross mark", () => {
  assert.match(html, /data-logo="ano-monogram"/);
  assert.match(html, /<span class="monogram-letter">A<\/span>/);
  assert.match(html, /<span class="monogram-letter">N<\/span>/);
  assert.match(html, /<span class="monogram-letter">O<\/span>/);
  assert.doesNotMatch(html, /brand-mark" aria-hidden="true"><\/span>/);
});

test("pillar pages include vertical module links", () => {
  const exploreHtml = readFixture("explore.html");
  const buildHtml = readFixture("build.html");
  const shareHtml = readFixture("share.html");

  for (const text of [
    "Learning",
    "Tools",
    "News",
  ]) {
    assert.match(exploreHtml, new RegExp(text));
  }

  assert.doesNotMatch(exploreHtml, /Career/);

  for (const href of [
    "explore-learning.html",
    "explore-tools.html",
    "explore-news.html",
  ]) {
    assert.match(exploreHtml, new RegExp(`href="${href}"`));
  }

  assert.doesNotMatch(exploreHtml, /href="explore-career\.html"/);

  for (const text of [
    "Analytical Structure",
    "Skills",
    "Projects",
  ]) {
    assert.match(buildHtml, new RegExp(text));
  }

  for (const href of [
    "build-analytical-structure.html",
    "build-skills.html",
    "build-projects.html",
  ]) {
    assert.match(buildHtml, new RegExp(`href="${href}"`));
  }

  for (const text of [
    "Career Coaching",
    "Data Analysis Mentoring",
    "Other Courses",
  ]) {
    assert.match(shareHtml, new RegExp(text));
  }

  for (const href of [
    "share-career-coaching.html",
    "share-data-analysis-mentoring.html",
    "share-other-courses.html",
  ]) {
    assert.match(shareHtml, new RegExp(`href="${href}"`));
  }
});

test("explore news detail page exposes the existing News module", () => {
  const newsHtml = readFixture("explore-news.html");

  assert.match(newsHtml, /id="news"/);
  assert.match(newsHtml, />AI Signals</);
  assert.doesNotMatch(html, /Latest AI Signals/);
  assert.match(newsHtml, /data-news-list/);
  assert.match(newsHtml, /data-news-updated/);
  assert.match(newsHtml, /Updated daily by AI workflow/);
});

test("blank module pages exist for the split pillar structure", () => {
  for (const path of [
    "explore-tools.html",
    "build-analytical-structure.html",
    "build-projects.html",
    "share-career-coaching.html",
    "share-data-analysis-mentoring.html",
    "share-other-courses.html",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true);
    assert.match(readFixture(path), /class="blank-state"/);
  }
});

test("explore learning page presents article browsing by AI-native category", () => {
  const learningHtml = readFixture("explore-learning.html");

  assert.match(learningHtml, /id="learning"/);
  assert.match(learningHtml, /AI-Native 工作理念/);
  assert.match(learningHtml, /AI-Native 工作方法/);
  assert.match(learningHtml, /class="learning-category-nav"/);
  assert.match(learningHtml, /class="learning-article-grid"/);
  assert.match(learningHtml, /class="learning-card"/);
  assert.match(learningHtml, /class="learning-card-media"/);
  assert.match(learningHtml, /class="learning-card-excerpt"/);
  assert.match(learningHtml, /learning-ai-native-work-principles.html/);
  assert.match(learningHtml, /AI-Native 不是多用几个工具/);
  assert.match(learningHtml, /从问题拆解到交付/);
  assert.doesNotMatch(learningHtml, /class="blank-state"/);
});

test("explore learning category headings stay readable in Chrome wide viewports", () => {
  assert.match(
    styles,
    /\.learning-section-heading\s*{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.match(
    styles,
    /\.learning-section-heading h2\s*{[^}]*font-size:\s*clamp\(30px,\s*4vw,\s*48px\)/s,
  );
  assert.match(
    styles,
    /\.learning-section-heading h2\s*{[^}]*text-wrap:\s*balance/s,
  );
  assert.match(
    styles,
    /\.learning-section-heading h2\s*{[^}]*overflow-wrap:\s*anywhere/s,
  );
  assert.match(
    styles,
    /\.learning-section-heading p:last-child\s*{[^}]*max-width:\s*820px/s,
  );
  assert.match(
    styles,
    /\.learning-section-heading p:last-child\s*{[^}]*text-wrap:\s*pretty/s,
  );
  assert.match(
    styles,
    /\.learning-card\s*{[^}]*min-width:\s*0/s,
  );
  assert.match(
    styles,
    /\.learning-card-body\s*{[^}]*min-width:\s*0/s,
  );
  assert.match(
    styles,
    /\.learning-card h3\s*{[^}]*overflow-wrap:\s*anywhere/s,
  );
});

test("learning article template supports copied long-form posts", () => {
  const articleHtml = readFixture("learning-ai-native-work-principles.html");

  assert.match(articleHtml, /class="[^"]*article-page[^"]*"/);
  assert.match(articleHtml, /class="article-hero"/);
  assert.match(articleHtml, /class="article-content"/);
  assert.match(articleHtml, /AI-Native 工作理念/);
  assert.match(articleHtml, /AI-Native 不是多用几个工具/);
  assert.match(articleHtml, /href="explore-learning.html"/);
  assert.match(articleHtml, /如何复制一篇新文章/);
});

test("learning judgment article is listed and renders as a philosophy article", () => {
  const learningHtml = readFixture("explore-learning.html");
  const articleHtml = readFixture("learning-ai-judgment-survival.html");

  assert.match(learningHtml, /learning-ai-judgment-survival.html/);
  assert.match(learningHtml, /AI 时代，你不提升判断力，确实没有生存空间/);
  assert.match(learningHtml, /判断力正在从职场加分项变成基本功/);
  assert.match(learningHtml, /class="learning-card-visual judgment-visual"/);
  assert.match(articleHtml, /AI-Native 工作理念/);
  assert.match(articleHtml, /AI 时代，你不提升判断力，确实没有生存空间/);
  assert.match(articleHtml, /真正值得焦虑的，从来不是/);
  assert.match(articleHtml, /吃透基础学科的底层逻辑/);
  assert.match(articleHtml, /坚持拿一手信息/);
  assert.match(articleHtml, /刻意练习质疑默认前提/);
  assert.match(articleHtml, /做假设验证和复盘/);
  assert.match(articleHtml, /href="explore-learning.html"/);
  assert.doesNotMatch(articleHtml, /class="article-cover"/);
  assert.doesNotMatch(articleHtml, /AI research and products/);
});

test("learning job title article is listed and renders as a philosophy article", () => {
  const learningHtml = readFixture("explore-learning.html");
  const articleHtml = readFixture("learning-ai-job-title-tasks.html");

  assert.match(learningHtml, /learning-ai-job-title-tasks.html/);
  assert.match(learningHtml, /岗位名称，是AI时代最该被扔掉的东西/);
  assert.match(learningHtml, /AI 不是在替代岗位，而是在一个一个吃掉岗位里的具体任务/);
  assert.match(learningHtml, /class="learning-card-visual task-visual"/);
  assert.match(articleHtml, /AI-Native 工作理念/);
  assert.match(articleHtml, /岗位名称，是AI时代最该被扔掉的东西/);
  assert.match(articleHtml, /岗位名称是个幌子，实际工作内容才是关键/);
  assert.match(articleHtml, /岗位名称是真的会骗人/);
  assert.match(articleHtml, /选工作的新标准/);
  assert.match(articleHtml, /岗位还在，但活儿没了/);
  assert.match(articleHtml, /href="explore-learning.html"/);
  assert.doesNotMatch(articleHtml, /class="article-cover"/);
});

test("learning AI tips article is synced from Feishu into work methods", () => {
  const learningHtml = readFixture("explore-learning.html");
  const articleHtml = readFixture("learning-ai-usage-tips.html");
  const sources = JSON.parse(readFixture("data/learning-sources.json"));
  const syncScript = readFixture("scripts/sync-learning-from-lark.mjs");

  assert.match(learningHtml, /learning-ai-usage-tips.html/);
  assert.match(learningHtml, /分享3条最近的AI使用tips/);
  assert.match(learningHtml, /AI-Native 工作方法/);
  assert.match(learningHtml, /class="learning-card-visual tips-visual"/);
  assert.match(articleHtml, /AI-Native 工作方法/);
  assert.match(articleHtml, /分享3条最近的AI使用tips/);
  assert.match(articleHtml, /管它好不好，先用起来再说/);
  assert.match(articleHtml, /上下文记忆/);
  assert.match(articleHtml, /组建自己的 agent 团队/);
  assert.match(articleHtml, /href="explore-learning.html"/);
  assert.doesNotMatch(articleHtml, /class="article-cover"/);

  assert.equal(sources[0].sectionTitle, "分享3条最近的AI使用tips");
  assert.equal(sources[0].category, "work-methods");
  assert.equal(sources[0].slug, "learning-ai-usage-tips");
  assert.match(sources[0].docUrl, /URjJd8PiKog7IOxizpvcP31unSe/);
  assert.match(syncScript, /lark-cli/);
  assert.match(syncScript, /sectionTitle/);
});

test("learning multi-agent overload article is synced from Feishu into work methods", () => {
  const learningHtml = readFixture("explore-learning.html");
  const articleHtml = readFixture("learning-agent-parallel-overload.html");
  const sources = JSON.parse(readFixture("data/learning-sources.json"));
  const source = sources.find((item) => item.slug === "learning-agent-parallel-overload");

  assert.match(learningHtml, /learning-agent-parallel-overload.html/);
  assert.match(learningHtml, /多agent并行让我非常内耗甚至拖慢我的效率/);
  assert.match(learningHtml, /AI-Native 工作方法/);
  assert.match(articleHtml, /AI-Native 工作方法/);
  assert.match(articleHtml, /多agent并行让我非常内耗甚至拖慢我的效率/);
  assert.match(articleHtml, /不仅没让我的工作效率提升/);
  assert.match(articleHtml, /我仿佛成了 agent 的助理/);
  assert.match(articleHtml, /人的“记忆”是有限的/);
  assert.match(articleHtml, /强制要求自己同时最多解决两个方向的问题/);
  assert.match(articleHtml, /href="explore-learning.html"/);
  assert.doesNotMatch(articleHtml, /class="article-cover"/);

  assert.equal(source.sectionTitle, "多agent并行让我非常内耗甚至拖慢我的效率");
  assert.equal(source.category, "work-methods");
  assert.match(source.docUrl, /URjJd8PiKog7IOxizpvcP31unSe/);
});

test("learning article migration guide explains copy-paste publishing flow", () => {
  const guide = readFixture("docs/learning-article-migration.md");

  assert.match(guide, /复制文章到网站/);
  assert.match(guide, /learning-ai-native-work-principles.html/);
  assert.match(guide, /explore-learning.html/);
  assert.match(guide, /learning-card/);
  assert.match(guide, /node --test tests\/site\.test\.mjs/);
});

test("build skills page presents a skill library with the featured data analysis skill", () => {
  assert.match(buildSkillsHtml, /Skills Library/);
  assert.match(buildSkillsHtml, /Reusable AI-native workflows/);
  assert.match(buildSkillsHtml, /Data Analysis Interview Skill/);
  assert.match(buildSkillsHtml, /DA \/ BA Interview/);
  assert.match(buildSkillsHtml, /Business Analysis/);
  assert.match(buildSkillsHtml, /AB Testing/);
  assert.match(buildSkillsHtml, /Codex Skill/);
  assert.match(
    buildSkillsHtml,
    /href="build-skill-data-analysis-interview.html"/,
  );
  assert.match(
    buildSkillsHtml,
    /href="https:\/\/github\.com\/Zhenyu0521\/data-analysis-interview-skill"/,
  );
  assert.doesNotMatch(buildSkillsHtml, /class="blank-state"/);
});

test("data analysis interview skill detail explains purpose, usage, and install path", () => {
  const detailHtml = readFixture("build-skill-data-analysis-interview.html");

  for (const text of [
    "Data Analysis Interview Skill",
    "What It Solves",
    "Question Types Covered",
    "How It Works",
    "Output Format",
    "Example Prompts",
    "Installation",
    "Current Status",
    "Indicator System Design",
    "Anomaly Diagnosis",
    "Business Optimization",
    "AB Testing",
    "Classify",
    "Frame",
    "Execute",
    "问题分类",
    "分析思路",
    "具体执行",
    "面试表达",
    "git clone https://github.com/Zhenyu0521/data-analysis-interview-skill.git ~/.codex/skills/data-analysis-interview",
  ]) {
    assert.match(detailHtml, new RegExp(text.replaceAll("/", "\\/")));
  }

  assert.match(
    detailHtml,
    /href="https:\/\/github\.com\/Zhenyu0521\/data-analysis-interview-skill"/,
  );
  assert.match(detailHtml, /href="build-skills.html"/);
});

test("news data file uses the website news schema", () => {
  assert.ok(Array.isArray(news.groups));
  assert.ok(news.groups.length >= 2);
  assert.match(news.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(news.updatedAt, news.groups[0].date);

  const sortedDates = news.groups
    .map((group) => group.date)
    .sort((a, b) => String(b).localeCompare(String(a)));
  assert.deepEqual(
    news.groups.map((group) => group.date),
    sortedDates,
  );

  for (const group of news.groups) {
    assert.match(group.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof group.title, "string");
    assert.equal(group.source, "follow-builders");
    assert.equal(typeof group.source_url, "string");
    assert.equal(typeof group.stats, "object");
    assert.equal(typeof group.sections, "object");
    assert.ok(Array.isArray(group.sections.x_twitter));
    assert.ok(Array.isArray(group.sections.official_blogs));
    assert.ok(Array.isArray(group.sections.podcasts));

    for (const item of group.sections.x_twitter) {
      assert.equal(typeof item.author, "string");
      assert.equal(typeof item.summary, "string");
      assert.ok(Array.isArray(item.urls));
    }

    for (const item of [
      ...group.sections.official_blogs,
      ...group.sections.podcasts,
    ]) {
      assert.equal(typeof item.title, "string");
      assert.equal(typeof item.summary, "string");
      assert.equal(typeof item.url, "string");
      assert.equal(typeof item.source, "string");
    }
  }
});

test("script loads and renders data/news.json", () => {
  assert.match(script, /fetch\("\.\/data\/news\.json"\)/);
  assert.match(script, /hashNavLinks/);
  assert.match(script, /pathname/);
  assert.match(script, /renderNewsGroups/);
  assert.match(script, /sortNewsGroups/);
  assert.match(script, /<details class="news-day"/);
  assert.match(script, /index === 0 \? " open" : ""/);
  assert.match(script, /news-day-summary/);
  assert.match(script, /x_twitter/);
  assert.match(script, /official_blogs/);
  assert.match(script, /podcasts/);
  assert.match(script, /data-news-list/);
  assert.doesNotMatch(script, /Latest/);
  assert.doesNotMatch(script, /Archive/);
  assert.doesNotMatch(styles, /news-day-summary::after/);
});

test("homepage removes old Evidence and Products sections", () => {
  assert.doesNotMatch(html, />Evidence</);
  assert.doesNotMatch(html, />Products</);
  assert.doesNotMatch(html, /Product Architecture/);
});

test("homepage removes secondary hero CTA and final Mission section", () => {
  assert.doesNotMatch(html, /See the Practice/);
  assert.doesNotMatch(html, /class="section-shell closing"/);
  assert.doesNotMatch(html, />Mission</);
  assert.doesNotMatch(html, /Back to Top/);
});

test("homepage links local stylesheet and script", () => {
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="script\.js(?:\?v=[^"]+)?"/);
});
