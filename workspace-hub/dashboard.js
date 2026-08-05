const loadJson = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderProgress = (progress) => {
  const target = document.querySelector("[data-progress]");
  const pagesTarget = document.querySelector("[data-pages]");
  if (!target || !pagesTarget) return;

  target.innerHTML = `
    <div class="panel-heading">
      <p class="eyebrow">Progress · ${escapeHtml(progress.updatedAt)}</p>
      <h2>${escapeHtml(progress.project.name)}</h2>
      <p>${escapeHtml(progress.project.mode)}</p>
    </div>
    <div class="highlight-list">
      ${(progress.highlights || [])
        .map((item) => `<article><span>Done</span><p>${escapeHtml(item)}</p></article>`)
        .join("")}
    </div>
    <div class="next-actions">
      <h3>Next actions</h3>
      <ul>${(progress.nextActions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `;

  pagesTarget.innerHTML = (progress.pages || [])
    .map(
      (page) => `
        <a class="page-card" href="../${escapeHtml(page.path)}">
          <span>${escapeHtml(page.area)}</span>
          <strong>${escapeHtml(page.title)}</strong>
          <small>${escapeHtml(page.path)}</small>
        </a>
      `,
    )
    .join("");
};

const renderTasks = (tasksData) => {
  const target = document.querySelector("[data-tasks]");
  if (!target) return;

  target.innerHTML = (tasksData.lanes || [])
    .map((lane) => {
      const tasks = (tasksData.tasks || []).filter((task) => task.status === lane);
      return `
        <section class="lane">
          <h3>${escapeHtml(lane)}</h3>
          ${tasks
            .map(
              (task) => `
                <article class="task-card">
                  <span>${escapeHtml(task.area)} · ${escapeHtml(task.priority)}</span>
                  <h4>${escapeHtml(task.title)}</h4>
                  <p>${escapeHtml(task.notes || "")}</p>
                  <div class="link-row">
                    ${(task.links || [])
                      .map((link) => `<a href="../${escapeHtml(link)}">${escapeHtml(link)}</a>`)
                      .join("")}
                  </div>
                </article>
              `,
            )
            .join("")}
        </section>
      `;
    })
    .join("");
};

const renderSessions = (sessionsData) => {
  const target = document.querySelector("[data-sessions]");
  if (!target) return;

  target.innerHTML = (sessionsData.sessions || [])
    .map(
      (session) => `
        <article class="session-card">
          <div>
            <span>${escapeHtml(session.date)} · ${escapeHtml(session.status)}</span>
            <h3>${escapeHtml(session.id)}</h3>
            <p>${escapeHtml(session.summary)}</p>
          </div>
          <div>
            <h4>Files</h4>
            <ul>${(session.filesChanged || []).map((file) => `<li>${escapeHtml(file)}</li>`).join("")}</ul>
          </div>
          <div>
            <h4>Next</h4>
            <ul>${(session.nextSteps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>
          </div>
        </article>
      `,
    )
    .join("");
};

const boot = async () => {
  try {
    const [progress, tasks, sessions] = await Promise.all([
      loadJson("data/progress.json"),
      loadJson("data/tasks.json"),
      loadJson("data/sessions.json"),
    ]);

    renderProgress(progress);
    renderTasks(tasks);
    renderSessions(sessions);
  } catch (error) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<p class="load-error">Dashboard data could not be loaded. Use a local server if direct file loading is blocked by the browser.</p>`,
    );
    console.error(error);
  }
};

boot();
