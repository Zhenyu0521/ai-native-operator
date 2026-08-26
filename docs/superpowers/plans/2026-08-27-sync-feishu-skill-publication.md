# Sync Feishu Skill Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a reusable, sanitized `sync-feishu-learning-to-site` Skill in the existing website repository before adding and deploying its website presentation.

**Architecture:** Treat `skills/sync-feishu-learning-to-site/` as a self-contained public artifact with its own documentation, Skill entrypoint, Codex metadata, and changelog. Publish that artifact in a deployment-skipping commit first; then add a tested Skills Library card and detail page, update local progress data, and push a second commit that triggers the existing GitHub Actions deployment.

**Tech Stack:** Markdown, Codex Skill YAML frontmatter, static HTML/CSS, Node.js built-in test runner, Git, GitHub Actions, GitHub CLI.

## Global Constraints

- Use the existing `Zhenyu0521/ai-native-operator` repository; do not create a standalone or nested Git repository.
- Store the public artifact at `skills/sync-feishu-learning-to-site/`.
- Do not publish `/Users/` paths, credentials, Feishu source document URLs, authentication state, or deployment secrets.
- Keep the site-specific domain, source registry paths, category mappings, validation commands, and GitHub Actions deployment model.
- Keep the existing Data Analysis Interview Skill unchanged.
- Preserve unrelated worktree changes and stage every commit explicitly.
- Publish the Skill source to GitHub before deploying the website card and detail page.
- Keep `workspace-hub/` excluded from production deployment.

---

## File Structure

**Create:**

- `skills/sync-feishu-learning-to-site/README.md`: public overview, requirements, installation, use, and safety notes.
- `skills/sync-feishu-learning-to-site/SKILL.md`: relocatable Codex workflow with no local absolute path.
- `skills/sync-feishu-learning-to-site/CHANGELOG.md`: dated history for the initial workflow, first reuse, public release, and website release.
- `skills/sync-feishu-learning-to-site/agents/openai.yaml`: Codex display metadata and default prompt.
- `build-skill-sync-feishu-learning-to-site.html`: public website detail page.

**Modify:**

- `build-skills.html`: add the second Skill card and GitHub directory link.
- `styles.css`: add only Skill workflow/detail styles that existing component classes cannot provide.
- `tests/site.test.mjs`: validate public artifact safety and website presentation.
- `workspace-hub/data/progress.json`: record the new artifact, page, and publication milestone.
- `workspace-hub/data/tasks.json`: record the completed GitHub-first publication task.
- `workspace-hub/data/sessions.json`: prepend the 2026-08-27 implementation and deployment session.

## Task 1: Build and Validate the Public Skill Artifact

**Files:**

- Create: `skills/sync-feishu-learning-to-site/README.md`
- Create: `skills/sync-feishu-learning-to-site/SKILL.md`
- Create: `skills/sync-feishu-learning-to-site/CHANGELOG.md`
- Create: `skills/sync-feishu-learning-to-site/agents/openai.yaml`

**Interfaces:**

- Consumes: website repository containing `data/learning-sources.json`, `scripts/sync-learning-from-lark.mjs`, `tests/site.test.mjs`, and `workspace-hub/data/*.json`.
- Produces: installable Codex Skill directory `skills/sync-feishu-learning-to-site/` and invocation name `$sync-feishu-learning-to-site`.

- [ ] **Step 1: Run a failing artifact check**

```bash
test -f skills/sync-feishu-learning-to-site/SKILL.md \
  && test -f skills/sync-feishu-learning-to-site/README.md \
  && test -f skills/sync-feishu-learning-to-site/CHANGELOG.md \
  && test -f skills/sync-feishu-learning-to-site/agents/openai.yaml
```

Expected: non-zero exit because the public Skill directory does not exist.

- [ ] **Step 2: Create the public Skill entrypoint**

Create `SKILL.md` with the existing four required inputs, repository-root discovery by sentinel files, Feishu Markdown fetch command, category mappings, sync script execution, idempotency check, Node/JSON validation, progress updates, optional GitHub publication, and safety rules. Use this public description:

```yaml
---
name: sync-feishu-learning-to-site
description: Use when the user wants to sync, publish, upload, or deploy a Feishu/Lark document article into the AI Native Operator website Learning section.
---
```

Repository discovery must require these sentinels and ask for the repository path if they are not found:

```text
data/learning-sources.json
scripts/sync-learning-from-lark.mjs
explore-learning.html
workspace-hub/data/progress.json
```

- [ ] **Step 3: Create public documentation, metadata, and history**

Create a Chinese-first `README.md` with 功能、前置条件、安装、使用方式、工作流程、目录依赖、限制与安全边界. Use this installation command:

```bash
mkdir -p ~/.codex/skills
cp -R skills/sync-feishu-learning-to-site ~/.codex/skills/
```

Create `agents/openai.yaml` exactly as:

```yaml
interface:
  display_name: "Sync Feishu Learning"
  short_description: "同步飞书文章到个人网站 Learning"
  brand_color: "#8F4B2E"
  default_prompt: "Use $sync-feishu-learning-to-site to sync a Feishu article into my personal website Learning section."
policy:
  allow_implicit_invocation: true
```

Create `CHANGELOG.md` with dated entries for the initial 2026-08-23 workflow, second-article reuse plus typography/visual improvements, and the 2026-08-27 relocatable GitHub release. Do not claim the website release before it happens.

- [ ] **Step 4: Validate the public artifact**

```bash
test -f skills/sync-feishu-learning-to-site/SKILL.md \
  && test -f skills/sync-feishu-learning-to-site/README.md \
  && test -f skills/sync-feishu-learning-to-site/CHANGELOG.md \
  && test -f skills/sync-feishu-learning-to-site/agents/openai.yaml
rg -n '/Users/|URjJd8PiKog7IOxizpvcP31unSe|SSH_PRIVATE_KEY|SERVER_HOST|SERVER_USER|SERVER_PATH' skills/sync-feishu-learning-to-site
```

Expected: file check exits zero; `rg` exits one with no matches.

- [ ] **Step 5: Commit and push the GitHub-first artifact**

```bash
git add skills/sync-feishu-learning-to-site
git commit -m "feat: publish Feishu sync skill [skip actions]"
git push origin main
```

Expected: push succeeds; the HEAD commit's `[skip actions]` instruction prevents `push` workflows from running.

- [ ] **Step 6: Verify source visibility**

```bash
gh api 'repos/Zhenyu0521/ai-native-operator/contents/skills/sync-feishu-learning-to-site?ref=main' --jq '.[] | .name'
```

Expected: `CHANGELOG.md`, `README.md`, `SKILL.md`, and `agents`.

## Task 2: Add a Tested Website Presentation

**Files:**

- Create: `build-skill-sync-feishu-learning-to-site.html`
- Modify: `build-skills.html`
- Modify: `styles.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**

- Consumes: `https://github.com/Zhenyu0521/ai-native-operator/tree/main/skills/sync-feishu-learning-to-site`.
- Produces: list card and detail route `build-skill-sync-feishu-learning-to-site.html`.

- [ ] **Step 1: Add the failing website test**

```javascript
test("skills library presents the Feishu Learning sync skill", () => {
  const detail = readFixture("build-skill-sync-feishu-learning-to-site.html");
  const githubUrl = "https://github.com/Zhenyu0521/ai-native-operator/tree/main/skills/sync-feishu-learning-to-site";

  assert.match(buildSkillsHtml, /Sync Feishu Learning to Site/);
  assert.match(buildSkillsHtml, /build-skill-sync-feishu-learning-to-site\.html/);
  assert.match(buildSkillsHtml, new RegExp(githubUrl.replaceAll("/", "\\/")));
  assert.match(detail, /Sync Feishu Learning to Site/);
  assert.match(detail, /飞书文档/);
  assert.match(detail, /GitHub/);
  assert.match(detail, /href="build-skills\.html"/);
  assert.match(detail, new RegExp(githubUrl.replaceAll("/", "\\/")));
});
```

- [ ] **Step 2: Confirm the test fails**

```bash
node --test --test-name-pattern="skills library presents" tests/site.test.mjs
```

Expected: FAIL because the detail page does not exist.

- [ ] **Step 3: Add the card and detail page**

Add a second `.featured-skill` card after the Data Analysis card with title `Sync Feishu Learning to Site`, a Chinese workflow summary, tags `Feishu`, `Learning`, `Codex Skill`, `GitHub Actions`, a `View Skill` link to the detail page, and a `GitHub` link to the exact directory URL.

Create the detail page with the existing header, shared favicon, `styles.css`, and `script.js`; include a back link, purpose, the four workflow stages (定位章节、生成页面、校验与记录、确认后发布), required inputs, safety boundaries, GitHub source button, and installation command.

- [ ] **Step 4: Add narrow styling and pass the focused test**

Add only selectors scoped under `.skill-detail-page`, `.skill-workflow-grid`, and `.skill-code-block`, then run:

```bash
node --test --test-name-pattern="skills library presents" tests/site.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run website tests**

```bash
node --test tests/site.test.mjs
if [ -f package.json ]; then npm test --if-present; fi
```

Expected: all Node tests pass; the npm suite runs only when the repository has a `package.json`.

## Task 3: Record Iterations and Deploy

**Files:**

- Modify: `skills/sync-feishu-learning-to-site/CHANGELOG.md`
- Modify: `workspace-hub/data/progress.json`
- Modify: `workspace-hub/data/tasks.json`
- Modify: `workspace-hub/data/sessions.json`

**Interfaces:**

- Consumes: verified public artifact and website presentation.
- Produces: local project history and the deployment-triggering commit.

- [ ] **Step 1: Update progress, task, and session records**

Append the 2026-08-27 website publication entry to the Skill changelog. Set all dashboard `updatedAt` values to `2026-08-27`. Add the public Skill directory and detail page to progress, add a completed high-priority `site-feishu-sync-skill-publication` task, and prepend `session-2026-08-27-feishu-sync-skill-publication` describing both pushes, verification, files changed, and follow-ups.

- [ ] **Step 2: Parse changed JSON**

```bash
node -e 'for (const p of ["workspace-hub/data/progress.json","workspace-hub/data/tasks.json","workspace-hub/data/sessions.json","data/learning-sources.json"]) JSON.parse(require("fs").readFileSync(p,"utf8")); console.log("JSON OK")'
```

Expected: `JSON OK`.

- [ ] **Step 3: Run final local verification**

```bash
git diff --check
node --check scripts/sync-learning-from-lark.mjs
node --test tests/site.test.mjs tests/workspace-hub.test.mjs tests/news-update.test.mjs
rg -n '/Users/|URjJd8PiKog7IOxizpvcP31unSe|SSH_PRIVATE_KEY|SERVER_HOST|SERVER_USER|SERVER_PATH' skills/sync-feishu-learning-to-site
```

Expected: diff and Node checks pass; all tests pass; final `rg` has no matches and exits one.

- [ ] **Step 4: Commit and push the website stage**

```bash
git add build-skills.html build-skill-sync-feishu-learning-to-site.html styles.css tests/site.test.mjs workspace-hub/data/progress.json workspace-hub/data/tasks.json workspace-hub/data/sessions.json skills/sync-feishu-learning-to-site/CHANGELOG.md
git commit -m "feat: publish Feishu sync skill on website"
git push origin main
```

Expected: push succeeds and the normal `Deploy site` workflow starts.

- [ ] **Step 5: Verify deployment and production pages**

```bash
gh run list --repo Zhenyu0521/ai-native-operator --workflow "Deploy site" --limit 3
```

Wait for the website commit's run to conclude `success`, then verify:

```text
https://siyu0529.com/build-skills.html
https://siyu0529.com/build-skill-sync-feishu-learning-to-site.html
```

Both pages must show the Skill title, and the detail page must link to the GitHub source directory.

## Task 4: Completion Audit

**Files:** None.

**Interfaces:**

- Consumes: GitHub source verification, passing tests, deployment success, and live page checks.
- Produces: evidence-backed completion report.

- [ ] **Step 1: Confirm repository state**

```bash
git status --short --branch
git log --oneline --decorate -5
```

Expected: `main` matches `origin/main`; no scoped changes remain.

- [ ] **Step 2: Report final locations**

Report the GitHub Skill directory, live Skills Library, live detail page, changelog, and local progress records. Identify any unrelated worktree changes left untouched.
