import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const readFixture = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const html = readFixture("index.html");
const buildSkillsHtml = readFixture("build-skills.html");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const news = JSON.parse(
  readFileSync(new URL("../data/news.json", import.meta.url), "utf8"),
);

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
    "Career",
  ]) {
    assert.match(exploreHtml, new RegExp(text));
  }

  for (const href of [
    "explore-learning.html",
    "explore-tools.html",
    "explore-news.html",
    "explore-career.html",
  ]) {
    assert.match(exploreHtml, new RegExp(`href="${href}"`));
  }

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
    "explore-learning.html",
    "explore-tools.html",
    "explore-career.html",
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
