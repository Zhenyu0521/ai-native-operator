import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const readText = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const readJson = (path) => JSON.parse(readText(path));

test("workspace hub exposes a local dashboard surface", () => {
  for (const path of [
    "workspace-hub/index.html",
    "workspace-hub/styles.css",
    "workspace-hub/dashboard.js",
    "workspace-hub/README.md",
    "workspace-hub/data/progress.json",
    "workspace-hub/data/tasks.json",
    "workspace-hub/data/sessions.json",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, path);
  }
});

test("progress data summarizes the current website build", () => {
  const progress = readJson("workspace-hub/data/progress.json");

  assert.equal(progress.project.name, "个人网站制作");
  assert.match(progress.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(progress.highlights));
  assert.ok(progress.highlights.length >= 3);
  assert.ok(progress.pages.some((page) => page.path === "index.html"));
  assert.ok(progress.pages.some((page) => page.path === "build-skills.html"));
  assert.ok(progress.pages.some((page) => page.path === "build-skill-data-analysis-interview.html"));
  assert.ok(progress.nextActions.length >= 2);
});

test("task data supports a lightweight kanban workflow", () => {
  const tasks = readJson("workspace-hub/data/tasks.json");

  assert.deepEqual(tasks.lanes, ["backlog", "doing", "review", "done"]);
  assert.ok(tasks.tasks.length >= 4);

  for (const task of tasks.tasks) {
    assert.equal(typeof task.id, "string");
    assert.match(task.status, /^(backlog|doing|review|done)$/);
    assert.equal(typeof task.title, "string");
    assert.equal(typeof task.area, "string");
    assert.ok(Array.isArray(task.links));
  }
});

test("session data records handoffs across different conversations", () => {
  const sessions = readJson("workspace-hub/data/sessions.json");

  assert.ok(Array.isArray(sessions.sessions));
  assert.ok(sessions.sessions.length >= 1);

  for (const session of sessions.sessions) {
    assert.match(session.id, /^session-/);
    assert.match(session.status, /^(active|paused|done)$/);
    assert.ok(Array.isArray(session.filesChanged));
    assert.ok(Array.isArray(session.nextSteps));
  }
});

test("dashboard reads progress, task, and session JSON", () => {
  const html = readText("workspace-hub/index.html");
  const script = readText("workspace-hub/dashboard.js");

  assert.match(html, /Workspace Control Center/);
  assert.match(html, /data-progress/);
  assert.match(html, /data-tasks/);
  assert.match(html, /data-sessions/);
  assert.match(script, /data\/progress\.json/);
  assert.match(script, /data\/tasks\.json/);
  assert.match(script, /data\/sessions\.json/);
  assert.match(script, /renderProgress/);
  assert.match(script, /renderTasks/);
  assert.match(script, /renderSessions/);
});
