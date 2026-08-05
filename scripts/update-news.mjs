#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const FEEDS = {
  x: "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json",
  blogs:
    "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-blogs.json",
  podcasts:
    "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json",
};

const NEWS_PATH = new URL("../data/news.json", import.meta.url);
const EXPLORE_NEWS_PATH = new URL("../explore-news.html", import.meta.url);
const SOURCE_URL = "https://github.com/zarazhangrui/follow-builders";
const MAX_GROUPS = 7;
const SNAPSHOT_PATTERN =
  /<script type="application\/json" id="news-data">[\s\S]*?<\/script>/;

const decodeEntities = (value) =>
  String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();

const clip = (value, max = 260) => {
  const text = decodeEntities(value).replace(/https?:\/\/\S+/g, "").trim();
  if (text.length <= max) return text;

  const shortened = text.slice(0, max - 1).trimEnd();
  return `${shortened}…`;
};

const engagementScore = (tweet) =>
  Number(tweet?.likes || 0) +
  Number(tweet?.retweets || 0) * 2 +
  Number(tweet?.replies || 0);

const topTweets = (tweets = []) =>
  tweets
    .filter((tweet) => tweet?.url && tweet?.text)
    .sort((a, b) => engagementScore(b) - engagementScore(a))
    .slice(0, 2);

const builderScore = (builder) =>
  topTweets(builder.tweets).reduce((sum, tweet) => sum + engagementScore(tweet), 0);

const summarizeBuilder = (builder) => {
  const tweets = topTweets(builder.tweets);
  if (tweets.length === 0) return null;

  const summary = tweets.map((tweet) => clip(tweet.text, 220)).join(" / ");
  const urls = tweets.map((tweet) => tweet.url);

  return {
    author: builder.name || builder.handle || "Unknown builder",
    ...(builder.bio ? { role: clip(builder.bio, 86) } : {}),
    summary,
    urls,
  };
};

const summarizeBlog = (blog) => {
  if (!blog?.url || !blog?.title) return null;

  return {
    source: blog.name || "Official Blog",
    title: blog.title,
    summary: clip(blog.description || blog.content || blog.title, 340),
    url: blog.url,
  };
};

const summarizePodcast = (podcast) => {
  if (!podcast?.url || !podcast?.title) return null;

  return {
    source: podcast.name || "Podcast",
    title: podcast.title,
    summary: clip(podcast.transcript || podcast.title, 360),
    url: podcast.url,
  };
};

const byDateDescending = (a, b) => String(b.date).localeCompare(String(a.date));

const compactGroups = (groups) =>
  groups
    .filter((group) => group?.date)
    .sort(byDateDescending)
    .slice(0, MAX_GROUPS);

export const buildNewsData = ({ rawDigest, existingNews, today }) => {
  const generatedAt = rawDigest.generatedAt || new Date().toISOString();
  const date = today || generatedAt.slice(0, 10);
  const xItems = (rawDigest.x || [])
    .sort((a, b) => builderScore(b) - builderScore(a))
    .map(summarizeBuilder)
    .filter(Boolean)
    .slice(0, 10);
  const blogItems = (rawDigest.blogs || []).map(summarizeBlog).filter(Boolean).slice(0, 4);
  const podcastItems = (rawDigest.podcasts || [])
    .map(summarizePodcast)
    .filter(Boolean)
    .slice(0, 2);

  const group = {
    title: "AI Builders Digest",
    date,
    source: "follow-builders",
    source_url: SOURCE_URL,
    stats: {
      podcastEpisodes: rawDigest.stats?.podcastEpisodes ?? podcastItems.length,
      xBuilders: rawDigest.stats?.xBuilders ?? xItems.length,
      totalTweets: rawDigest.stats?.totalTweets ?? 0,
      blogPosts: rawDigest.stats?.blogPosts ?? blogItems.length,
      feedGeneratedAt: rawDigest.stats?.feedGeneratedAt || generatedAt,
    },
    sections: {
      x_twitter: xItems,
      official_blogs: blogItems,
      podcasts: podcastItems,
    },
    errors: rawDigest.errors || [],
  };

  const previousGroups = (existingNews?.groups || []).filter(
    (existingGroup) => existingGroup.date !== date,
  );

  return {
    updatedAt: date,
    workflow: "follow-builders",
    groups: compactGroups([group, ...previousGroups]),
  };
};

export const injectNewsSnapshot = (html, newsData) => {
  const snapshot = `<script type="application/json" id="news-data">${JSON.stringify(
    newsData,
    null,
    2,
  )}</script>`;

  if (SNAPSHOT_PATTERN.test(html)) {
    return html.replace(SNAPSHOT_PATTERN, snapshot);
  }

  return html.replace(
    /(\s*<script src="script\.js[^"]*"><\/script>)/,
    `\n    ${snapshot}$1`,
  );
};

const fetchJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`);
  }
  return response.json();
};

const fetchRawDigest = async () => {
  const [xFeed, blogFeed, podcastFeed] = await Promise.all([
    fetchJSON(FEEDS.x),
    fetchJSON(FEEDS.blogs),
    fetchJSON(FEEDS.podcasts),
  ]);

  return {
    generatedAt:
      xFeed.generatedAt || blogFeed.generatedAt || podcastFeed.generatedAt || new Date().toISOString(),
    stats: {
      podcastEpisodes: podcastFeed.podcasts?.length || 0,
      xBuilders: xFeed.x?.length || 0,
      totalTweets: (xFeed.x || []).reduce(
        (sum, builder) => sum + (builder.tweets?.length || 0),
        0,
      ),
      blogPosts: blogFeed.blogs?.length || 0,
      feedGeneratedAt:
        xFeed.generatedAt || blogFeed.generatedAt || podcastFeed.generatedAt || null,
    },
    x: xFeed.x || [],
    blogs: blogFeed.blogs || [],
    podcasts: podcastFeed.podcasts || [],
    errors: [
      ...(xFeed.errors || []).map((error) => `Tweet feed problem: ${error}`),
      ...(blogFeed.errors || []).map((error) => `Blog feed problem: ${error}`),
      ...(podcastFeed.errors || []).map((error) => `Podcast feed problem: ${error}`),
    ],
  };
};

const readExistingNews = async () => {
  if (!existsSync(NEWS_PATH)) return { groups: [] };
  return JSON.parse(await readFile(NEWS_PATH, "utf8"));
};

const main = async () => {
  const rawDigest = await fetchRawDigest();
  const existingNews = await readExistingNews();
  const updatedNews = buildNewsData({
    rawDigest,
    existingNews,
    today: process.env.NEWS_TODAY,
  });

  await writeFile(NEWS_PATH, `${JSON.stringify(updatedNews, null, 2)}\n`);
  const exploreNewsHtml = await readFile(EXPLORE_NEWS_PATH, "utf8");
  await writeFile(EXPLORE_NEWS_PATH, injectNewsSnapshot(exploreNewsHtml, updatedNews));
  console.log(
    `Updated data/news.json with ${updatedNews.groups[0].date} (${updatedNews.groups.length} groups)`,
  );
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
