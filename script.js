const navLinks = Array.from(document.querySelectorAll(".nav a"));
const hashNavLinks = navLinks.filter((link) =>
  link.getAttribute("href")?.startsWith("#"),
);
const sections = hashNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const newsList = document.querySelector("[data-news-list]");
const newsUpdated = document.querySelector("[data-news-updated]");

const currentPage = window.location.pathname.split("/").pop() || "index.html";

navLinks.forEach((link) => {
  const href = link.getAttribute("href") || "";
  const page = href.split("#")[0] || "index.html";
  link.classList.toggle("is-active", page === currentPage);
});

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      hashNavLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${visible.target.id}`,
        );
      });
    },
    {
      rootMargin: "-20% 0px -55%",
      threshold: [0.15, 0.35, 0.6],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const sectionLabels = {
  x_twitter: "Builder Signals",
  official_blogs: "Official Blogs",
  podcasts: "Podcasts",
};

const formatCount = (count, label) => `${count} ${label}${count === 1 ? "" : "s"}`;

const countSignals = (group) =>
  Object.values(group.sections || {}).reduce(
    (total, items) => total + (Array.isArray(items) ? items.length : 0),
    0,
  );

const renderLinks = (urls) => {
  const safeUrls = (urls || []).filter(Boolean);
  if (safeUrls.length === 0) return "";

  return `
    <div class="news-links">
      ${safeUrls
        .map(
          (url, index) =>
            `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Source ${index + 1}</a>`,
        )
        .join("")}
    </div>
  `;
};

const renderXSignal = (item) => `
  <article class="news-item">
    <div class="news-content">
      <span class="news-source">${escapeHtml(item.role || "X / Twitter")}</span>
      <h4>${escapeHtml(item.author)}</h4>
      <p>${escapeHtml(item.summary)}</p>
      ${renderLinks(item.urls)}
    </div>
  </article>
`;

const renderArticleSignal = (item) => `
  <article class="news-item">
    <div class="news-content">
      <span class="news-source">${escapeHtml(item.source)}</span>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.summary)}</p>
      ${renderLinks([item.url])}
    </div>
  </article>
`;

const renderSection = (key, items) => {
  if (!Array.isArray(items) || items.length === 0) return "";

  const renderer = key === "x_twitter" ? renderXSignal : renderArticleSignal;

  return `
    <section class="news-section">
      <div class="news-section-heading">
        <h5>${escapeHtml(sectionLabels[key] || key)}</h5>
        <span>${formatCount(items.length, "item")}</span>
      </div>
      <div class="news-section-items">
        ${items.map(renderer).join("")}
      </div>
    </section>
  `;
};

const renderStats = (stats) => {
  if (!stats) return "";

  const statItems = [
    ["X Builders", stats.xBuilders],
    ["Tweets", stats.totalTweets],
    ["Blogs", stats.blogPosts],
    ["Podcasts", stats.podcastEpisodes],
  ].filter(([, value]) => Number.isFinite(value));

  if (statItems.length === 0) return "";

  return `
    <div class="news-stats">
      ${statItems
        .map(
          ([label, value]) => `
            <span>
              <strong>${escapeHtml(value)}</strong>
              ${escapeHtml(label)}
            </span>
          `,
        )
        .join("")}
    </div>
  `;
};

const sortNewsGroups = (groups) =>
  [...groups].sort((a, b) => String(b.date).localeCompare(String(a.date)));

const renderNewsGroups = (groups) => {
  if (!newsList) return;

  newsList.innerHTML = sortNewsGroups(groups)
    .slice(0, 7)
    .map(
      (group, index) => `
        <details class="news-day" aria-label="${escapeHtml(group.date)} AI signals"${index === 0 ? " open" : ""}>
          <summary class="news-day-summary">
            <span class="news-date">${escapeHtml(group.date)}</span>
            <span>${formatCount(countSignals(group), "signal")}</span>
          </summary>
          <div class="news-day-items">
            <div class="news-day-source">
              ${group.source_url ? `<a href="${escapeHtml(group.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(group.source || "source")}</a>` : escapeHtml(group.source || "source")}
            </div>
            <article class="news-digest-summary">
              <span class="news-source">${escapeHtml(group.source || "Digest")}</span>
              <h4>${escapeHtml(group.title || "AI Builders Digest")}</h4>
              ${renderStats(group.stats)}
            </article>
            ${renderSection("x_twitter", group.sections?.x_twitter)}
            ${renderSection("official_blogs", group.sections?.official_blogs)}
            ${renderSection("podcasts", group.sections?.podcasts)}
          </div>
        </details>
      `,
    )
    .join("");
};

const loadNews = async () => {
  if (!newsList) return;

  try {
    const response = await fetch("./data/news.json");
    if (!response.ok) throw new Error("News data unavailable");

    const data = await response.json();
    renderNewsGroups(data.groups || []);

    if (newsUpdated) {
      newsUpdated.textContent = data.updatedAt
        ? `Last sync ${data.updatedAt}`
        : "Last sync unavailable";
    }
  } catch {
    newsList.innerHTML = `
      <article class="news-item">
        <span class="news-date">Offline</span>
        <div class="news-content">
          <span class="news-source">Local preview</span>
          <h4>News data could not be loaded</h4>
          <p>Serve the site locally to load <code>data/news.json</code>, or check the daily sync workflow.</p>
        </div>
      </article>
    `;
  }
};

loadNews();
