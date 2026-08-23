# Site Favicon Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the existing black `ANO` favicon on every public HTML page without changing any page title.

**Architecture:** Add one root-level `favicon.svg` and make every public page resolve its favicon link to that asset. Extend the existing static-site regression suite to discover public HTML recursively, excluding hidden tooling directories, and update the Learning article template so future generated pages inherit the same link.

**Tech Stack:** Static HTML, SVG, Node.js built-in test runner

## Global Constraints

- Use the existing black rounded-square `ANO` artwork.
- Keep every existing `<title>` unchanged.
- Do not add external dependencies.
- Do not modify page content, navigation, styling, or deployment behavior.

---

### Task 1: Enforce one shared favicon across all public pages

**Files:**
- Create: `favicon.svg`
- Modify: `tests/site.test.mjs`
- Modify: `scripts/sync-learning-from-lark.mjs`
- Modify: `index.html`
- Modify: `explore.html`
- Modify: `explore-learning.html`
- Modify: `explore-news.html`
- Modify: `explore-tools.html`
- Modify: `build.html`
- Modify: `build-analytical-structure.html`
- Modify: `build-projects.html`
- Modify: `build-skills.html`
- Modify: `build-skill-data-analysis-interview.html`
- Modify: `share.html`
- Modify: `share-career-coaching.html`
- Modify: `share-data-analysis-mentoring.html`
- Modify: `share-other-courses.html`
- Modify: `learning-ai-native-work-principles.html`
- Modify: `learning-ai-judgment-survival.html`
- Modify: `learning-ai-job-title-tasks.html`
- Modify: `learning-ai-usage-tips.html`
- Modify: `workspace-hub/index.html`

**Interfaces:**
- Consumes: Public HTML files at the repository root and below non-hidden directories.
- Produces: `favicon.svg`; exactly one `<link rel="icon" ...>` per public HTML page; a generator template that emits the same root-level link.

- [ ] **Step 1: Write the failing regression test**

Add filesystem and path imports, a recursive public-page finder, and this test to `tests/site.test.mjs`:

```js
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

test("every public HTML page uses the shared ANO favicon", () => {
  const faviconPath = resolve(repoRoot, "favicon.svg");

  assert.equal(existsSync(faviconPath), true, "favicon.svg should exist");

  for (const pagePath of listPublicHtmlFiles()) {
    const page = readFileSync(pagePath, "utf8");
    const iconLinks = [...page.matchAll(/<link\b[^>]*\brel=["']icon["'][^>]*>/gi)];
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="shared ANO favicon" tests/site.test.mjs`

Expected: FAIL because `favicon.svg` does not exist and many pages lack a favicon declaration.

- [ ] **Step 3: Add the shared favicon asset**

Create `favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#181713" />
  <text x="32" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#fffdf7">ANO</text>
</svg>
```

- [ ] **Step 4: Point every page and the generator to the asset**

In each root-level HTML `<head>`, replace any existing inline icon or add this immediately before the stylesheet:

```html
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
```

In `workspace-hub/index.html`, use the nested relative path:

```html
<link rel="icon" href="../favicon.svg" type="image/svg+xml" />
```

In the `renderArticle` template in `scripts/sync-learning-from-lark.mjs`, add:

```html
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
```

Do not alter any `<title>` content.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node --test --test-name-pattern="shared ANO favicon" tests/site.test.mjs`

Expected: PASS with one matching test and no failures.

- [ ] **Step 6: Run full verification**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS with zero failures.

Run: `git diff --check`

Expected: exit code 0 with no whitespace errors.

- [ ] **Step 7: Review the final diff**

Run: `git diff -- favicon.svg tests/site.test.mjs scripts/sync-learning-from-lark.mjs '*.html' workspace-hub/index.html`

Expected: only the shared favicon asset, favicon declarations, generator update, and regression test changed; every `<title>` remains unchanged.
