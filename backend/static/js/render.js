// render.js
// Todas las funciones aquí pintan el DOM a partir de un estado dado.
// No hacen fetch ni guardan estado propio: reciben datos y una lista de callbacks.

const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const errorBanner = document.getElementById("error-banner");
const countPending = document.getElementById("count-pending");
const rowTemplate = document.getElementById("task-row-template");

const timeFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTime(isoString) {
  try {
    return timeFormatter.format(new Date(isoString));
  } catch {
    return "";
  }
}

/**
 * Filtra la lista de tareas según el filtro activo.
 * @param {Array<object>} tasks
 * @param {"all"|"pending"|"done"} filter
 */
export function applyFilter(tasks, filter) {
  if (filter === "pending") return tasks.filter((t) => !t.completed);
  if (filter === "done") return tasks.filter((t) => t.completed);
  return tasks;
}

/**
 * Renderiza la lista completa de tareas.
 * @param {Array<object>} tasks - tareas ya filtradas, listas para mostrar
 * @param {Array<object>} allTasks - todas las tareas, para calcular el contador
 * @param {object} handlers - { onToggle, onDelete, onEditStart, onEditSave, onEditCancel }
 */
export function renderTasks(tasks, allTasks, handlers) {
  list.innerHTML = "";

  const pendingCount = allTasks.filter((t) => !t.completed).length;
  countPending.textContent = pendingCount;

  emptyState.hidden = tasks.length !== 0;

  for (const task of tasks) {
    list.appendChild(buildRow(task, handlers));
  }
}

function buildRow(task, handlers) {
  const node = rowTemplate.content.cloneNode(true);
  const li = node.querySelector(".task");

  li.dataset.id = task.id;
  li.classList.toggle("is-done", task.completed);

  const checkBtn = node.querySelector(".task__check");
  checkBtn.setAttribute("aria-pressed", String(task.completed));
  checkBtn.addEventListener("click", () => handlers.onToggle(task));

  node.querySelector(".task__title").textContent = task.title;
  node.querySelector(".task__desc").textContent = task.description || "";
  node.querySelector(".task__time").textContent = formatTime(task.updated_at);

  node.querySelector(".task__edit").addEventListener("click", () =>
    startEdit(li, task, handlers)
  );

  node.querySelector(".task__delete").addEventListener("click", () =>
    handlers.onDelete(task)
  );

  return node;
}

function startEdit(li, task, handlers) {
  li.classList.add("is-editing");

  const body = li.querySelector(".task__body");
  const form = document.createElement("div");
  form.className = "task__edit-form";

  const titleInput = document.createElement("input");
  titleInput.className = "task__edit-title";
  titleInput.value = task.title;
  titleInput.maxLength = 255;

  const descInput = document.createElement("input");
  descInput.className = "task__edit-desc";
  descInput.value = task.description || "";
  descInput.placeholder = "Nota o detalle (opcional)";
  descInput.maxLength = 1024;

  form.append(titleInput, descInput);
  body.appendChild(form);
  titleInput.focus();
  titleInput.selectionStart = titleInput.value.length;

  function save() {
    const title = titleInput.value.trim();
    if (!title) {
      cancel();
      return;
    }
    handlers.onEditSave(task, {
      title,
      description: descInput.value.trim(),
    });
  }

  function cancel() {
    li.classList.remove("is-editing");
    form.remove();
  }

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  });
  descInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  });
  titleInput.addEventListener("blur", () => setTimeout(save, 120));
  descInput.addEventListener("blur", () => setTimeout(save, 120));
}

export function setLoading(isLoading) {
  loadingState.classList.toggle("is-active", isLoading);
  list.hidden = isLoading;
  emptyState.hidden = true;
}

export function showError(message) {
  if (!message) {
    errorBanner.hidden = true;
    errorBanner.textContent = "";
    return;
  }
  errorBanner.hidden = false;
  errorBanner.textContent = message;
}

export function setActiveFilterButton(filter) {
  document.querySelectorAll(".filters__btn").forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
}
