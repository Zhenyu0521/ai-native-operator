# Sync Feishu Skill Publication Design

## Goal

Publish the existing `sync-feishu-learning-to-site` Codex Skill inside the current `Zhenyu0521/ai-native-operator` repository, make it reusable without exposing machine-specific paths, then add it to the website Skills Library. The Skill source must be visible on GitHub before the website presentation is deployed.

## Repository Structure

Add a top-level catalog entry at:

```text
skills/
└── sync-feishu-learning-to-site/
    ├── README.md
    ├── SKILL.md
    ├── CHANGELOG.md
    └── agents/
        └── openai.yaml
```

The directory is a normal folder in the existing website repository, not a nested Git repository or Git submodule. It establishes `skills/` as the home for future website-owned Skills without moving the separately maintained Data Analysis Interview Skill.

## Public Skill Content

- Preserve the current workflow: collect the Feishu document URL, exact article heading, Learning category, and publish mode; update the source registry; run the sync script; verify output; update progress records; and optionally publish.
- Replace the hard-coded local user path with instructions that locate or configure the `ai-native-operator` repository root.
- Keep the project-specific domain, file names, category mappings, validation commands, and deployment behavior because they are part of the Skill's purpose.
- Add a Chinese-first `README.md` covering purpose, prerequisites, installation, invocation examples, repository expectations, and safety boundaries.
- Keep `agents/openai.yaml` so Codex can display and invoke the installed Skill consistently.
- Do not include credentials, Feishu document contents, authentication state, server secrets, or local-only absolute paths.

## Website Presentation

- Add a second Skill card to `build-skills.html` for “Sync Feishu Learning to Site”.
- Add `build-skill-sync-feishu-learning-to-site.html` as the detail page.
- The detail page explains the input-to-publication workflow, prerequisites, safety checks, installation path, and links directly to the Skill directory on GitHub.
- Reuse the current site typography, card, button, and metadata patterns. Add only narrowly scoped styling when existing classes cannot express the layout.
- Keep the existing Data Analysis Interview Skill unchanged.

## Two-Stage Publication

1. **GitHub source stage**
   - Commit the public `skills/sync-feishu-learning-to-site/` directory.
   - Push it to `main` with the deployment workflow intentionally skipped for that push.
   - Verify the Skill files are visible in the GitHub repository.
2. **Website stage**
   - Commit the Skills Library card, detail page, tests, and progress records.
   - Push to `main` normally so the existing `Deploy site` GitHub Action publishes the website.
   - Verify the workflow succeeds and the live Skills Library and detail page resolve correctly.

The repository currently contains an earlier local commit that has not reached `origin/main`. It will be included in the first push, but the first push will not trigger deployment; all accumulated website changes will go live only during the second stage.

## Iteration Records

`skills/sync-feishu-learning-to-site/CHANGELOG.md` will record the public Skill history:

- 2026-08-23: initial project-specific Skill created.
- 2026-08-23: workflow used for the second Feishu Learning article and spacing/visual support improved.
- 2026-08-27: public, relocatable repository version added.
- 2026-08-27: website Skills Library entry published.

The local development dashboard will also be updated intentionally:

- `workspace-hub/data/progress.json`: add the public Skill directory and website detail page, and summarize the new publication milestone.
- `workspace-hub/data/tasks.json`: add or update the GitHub-first Skill publication task.
- `workspace-hub/data/sessions.json`: prepend a session describing both publication stages, verification results, and remaining follow-ups.

These dashboard files remain excluded from production deployment by the existing workflow.

## Testing and Verification

- Validate the public Skill frontmatter and file structure.
- Check that the public copy contains no `/Users/` path, credentials, secrets, or source Feishu document URL.
- Extend `tests/site.test.mjs` to verify the new Skill card, detail page, GitHub link, shared favicon, and navigation.
- Run `node --test tests/site.test.mjs` and the complete Node test suite.
- Parse all changed JSON files.
- After stage one, verify the GitHub directory and files over the GitHub API or public repository page.
- After stage two, verify the `Deploy site` run and request the live website pages.

## Error Handling and Safety

- Stop before any push if GitHub authentication is unavailable; resume after the user completes login.
- Do not alter or discard unrelated worktree changes.
- Stage files explicitly so local dashboard records and website files land in the intended commit.
- Do not expose authentication tokens, Feishu credentials, deployment secrets, or machine-specific paths.
- If the deployment fails, inspect the Action logs and fix only the scoped publication changes before retrying.

## Out of Scope

- Creating a standalone GitHub repository.
- Migrating the existing Data Analysis Interview Skill into the new catalog.
- Changing the Feishu sync script's article-generation behavior beyond what is necessary to document and publish the Skill.
- Publishing `workspace-hub/` to the public website.
