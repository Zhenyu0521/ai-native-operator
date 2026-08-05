import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildNewsData, injectNewsSnapshot } from "../scripts/update-news.mjs";

const readText = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const rawDigest = {
  generatedAt: "2026-08-05T01:30:00.000Z",
  stats: {
    podcastEpisodes: 1,
    xBuilders: 2,
    totalTweets: 3,
    blogPosts: 1,
    feedGeneratedAt: "2026-08-05T01:30:00.000Z",
  },
  x: [
    {
      name: "Builder One",
      bio: "CEO @ Example",
      tweets: [
        {
          text: "Shipping small product loops is still the best way to learn what users actually need.",
          url: "https://x.com/builder/status/1",
          likes: 50,
          retweets: 4,
          replies: 3,
        },
        {
          text: "A second note about product instrumentation and workflow quality.",
          url: "https://x.com/builder/status/2",
          likes: 12,
          retweets: 1,
          replies: 1,
        },
      ],
    },
    {
      name: "Builder Two",
      bio: "",
      tweets: [
        {
          text: "Agents need boring reliability before teams trust them with real work.",
          url: "https://x.com/builder2/status/1",
          likes: 80,
          retweets: 6,
          replies: 4,
        },
      ],
    },
  ],
  blogs: [
    {
      name: "Example Engineering",
      title: "Designing reliable managed agents",
      content:
        "A practical architecture note about separating orchestration, tool execution, and durable session state for long running agents.",
      url: "https://example.com/agents",
    },
  ],
  podcasts: [
    {
      name: "AI Practice",
      title: "How operators use AI systems",
      transcript:
        "The episode explains how operators use AI systems to compress research, automate repeated judgment, and keep humans in control.",
      url: "https://youtube.com/watch?v=abc",
    },
  ],
  errors: ["Tweet feed problem: one source unavailable"],
};

test("buildNewsData converts follow-builders raw feed into website news schema", () => {
  const result = buildNewsData({
    rawDigest,
    existingNews: {
      updatedAt: "2026-08-04",
      workflow: "follow-builders",
      groups: [
        {
          title: "AI Builders Digest",
          date: "2026-08-04",
          source: "follow-builders",
          sections: { x_twitter: [], official_blogs: [], podcasts: [] },
        },
      ],
    },
    today: "2026-08-05",
  });

  assert.equal(result.updatedAt, "2026-08-05");
  assert.equal(result.workflow, "follow-builders");
  assert.equal(result.groups.length, 2);
  assert.equal(result.groups[0].date, "2026-08-05");
  assert.equal(result.groups[0].stats.xBuilders, 2);
  assert.equal(result.groups[0].stats.totalTweets, 3);
  assert.equal(result.groups[0].sections.x_twitter.length, 2);
  assert.equal(result.groups[0].sections.official_blogs.length, 1);
  assert.equal(result.groups[0].sections.podcasts.length, 1);
  assert.match(result.groups[0].sections.x_twitter[0].summary, /Agents need boring reliability/);
  assert.deepEqual(result.groups[0].sections.x_twitter[0].urls, [
    "https://x.com/builder2/status/1",
  ]);
  assert.equal(result.groups[1].date, "2026-08-04");
});

test("daily news workflow runs the no-api update script and commits changes", () => {
  const workflowPath = ".github/workflows/update-news.yml";

  assert.equal(existsSync(new URL(`../${workflowPath}`, import.meta.url)), true);

  const workflow = readText(workflowPath);

  assert.match(workflow, /cron:/);
  assert.match(workflow, /node scripts\/update-news\.mjs/);
  assert.match(workflow, /data\/news\.json/);
  assert.match(workflow, /explore-news\.html/);
  assert.match(workflow, /git commit/);
  assert.doesNotMatch(workflow, /OPENAI_API_KEY/);
});

test("Explore News heading has deliberate spacing between title and Chinese intro", () => {
  const html = readText("explore-news.html");
  const styles = readText("styles.css");

  assert.match(html, /class="news-heading-copy"/);
  assert.match(styles, /\.news-heading-copy h1/);
  assert.match(styles, /margin-bottom:\s*clamp\(18px,\s*2\.4vw,\s*28px\)/);
});

test("Explore News page embeds a news snapshot for direct file opening", () => {
  const html = readText("explore-news.html");
  const script = readText("script.js");
  const news = JSON.parse(readText("data/news.json"));

  assert.match(html, /id="news-data"/);
  assert.match(html, /type="application\/json"/);
  assert.match(html, new RegExp(`"updatedAt":\\s*"${news.updatedAt}"`));
  assert.match(script, /readEmbeddedNews/);
  assert.match(script, /document\.getElementById\("news-data"\)/);
});

test("injectNewsSnapshot replaces the embedded JSON payload", () => {
  const html = `
    <section>
      <script type="application/json" id="news-data">{"updatedAt":"old"}</script>
    </section>
  `;

  const result = injectNewsSnapshot(html, {
    updatedAt: "2026-08-05",
    workflow: "follow-builders",
    groups: [],
  });

  assert.match(result, /"updatedAt": "2026-08-05"/);
  assert.doesNotMatch(result, /"updatedAt":"old"/);
});
