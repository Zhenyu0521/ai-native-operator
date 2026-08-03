# Personal Site Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static first-pass personal website demo for the AI Native Operator brand.

**Architecture:** A no-build static site with one HTML file, one CSS file, and one tiny JavaScript file for progressive enhancement. A Node built-in test validates that the page contains the required brand messages and section structure.

**Tech Stack:** HTML, CSS, JavaScript, Node.js built-in `node:test`.

## Global Constraints

- Static files only.
- No external dependencies.
- Must work by opening `index.html` directly.
- Keep copy editable in HTML.
- Use responsive CSS for desktop and mobile.

---

### Task 1: Static Homepage Demo

**Files:**
- Create: `tests/site.test.mjs`
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`

**Interfaces:**
- Consumes: Brand positioning and Explore / Build / Share architecture from the user brief.
- Produces: A directly openable `index.html` homepage.

- [ ] **Step 1: Write the failing test**

Create `tests/site.test.mjs` with tests that read `index.html` and assert required copy and assets.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/site.test.mjs`
Expected: FAIL because `index.html` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `index.html`, `styles.css`, and `script.js` with the full static demo.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/site.test.mjs`
Expected: PASS with all assertions satisfied.

- [ ] **Step 5: Visual sanity check**

Run: open `index.html` directly or serve the directory locally and inspect the page.
