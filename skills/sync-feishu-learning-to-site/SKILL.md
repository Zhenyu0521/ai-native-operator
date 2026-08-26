---
name: sync-feishu-learning-to-site
description: Use when publishing or syncing a Feishu/Lark document section into the AI Native Operator website Learning section.
---

# Sync Feishu Learning To Site

Turn one `#` section in a Feishu document into a Learning article in the `ai-native-operator` repository, then optionally publish it to `siyu0529.com`.

## Required Inputs

Ask for any missing item before changing files:

- Feishu document URL
- Article title exactly matching a `#` heading
- Category: `AI-Native 工作理念` or `AI-Native 工作方法`
- Publish mode: local preview or online after preview

Infer slug, tags, excerpt, and date when absent, then show them in the confirmation summary.

## Find the Repository

Work from the website repository root. It must contain:

```text
data/learning-sources.json
scripts/sync-learning-from-lark.mjs
explore-learning.html
workspace-hub/data/progress.json
```

If these files cannot be found, ask for the local repository path. Never assume a user-specific absolute path.

## Workflow

1. Read the source registry, Learning page, sync script, and progress data.
2. Fetch Markdown with:

   ```bash
   lark-cli docs +fetch --api-version v2 --doc "<url>" --doc-format markdown --format json
   ```

   If authorization is missing, follow the installed Lark document and shared-auth workflows.
3. Confirm title, category, slug, output page, tags, excerpt, and publish mode.
4. Update `data/learning-sources.json`:
   - 工作理念 → `category: "work-principles"`
   - 工作方法 → `category: "work-methods"`
   - Visible cards → `status: "published"`
5. Run `node scripts/sync-learning-from-lark.mjs`. Run it twice when practical to verify idempotency.
6. Verify:

   ```bash
   node --check scripts/sync-learning-from-lark.mjs
   node --test tests/site.test.mjs
   ```

   Parse `data/learning-sources.json` and every `workspace-hub/data/*.json` file.
7. Update `workspace-hub/data/progress.json`, `tasks.json`, and `sessions.json`.
8. For online publication, review `git status --short`, stage only intended files, push `main`, and verify the `Deploy site` workflow.

## Output Conventions

- Article pages use `learning-<slug>.html` and the current local date.
- Preserve the author's voice; normalize only obvious `AI`, `Codex`, and `agent` spacing.
- Use a no-text CSS card visual unless the user supplies an image.
- Keep `workspace-hub/` local unless the user explicitly requests publication.

## Safety

- Never publish online without an explicit request.
- Never overwrite or commit unrelated edits.
- Never expose credentials, authentication state, deployment secrets, private document contents, or local machine paths.
- If GitHub authentication or deployment fails, stop, report the exact blocker, and preserve verified local work.
