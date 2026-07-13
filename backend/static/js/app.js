// app.js
// Orquesta la aplicación: guarda el estado en memoria, escucha eventos del DOM,
// llama a api.js y delega el pintado a render.js.

import { getTasks, createTask, updateTask, deleteTask } from "./api.js";
import {
  renderTasks,
  applyFilter,
  setLoading,
  showError,
  setActiveFilterButton,
} from "./render.js";

/** @type {{tasks: Array<object>, filter: "all"|"pending"|"done"}} */
const state = {
  tasks: [],
  filter: "all",
};

const form = document.getElementById("form-new");
const inputTitle = document.getElementById("input-title");
const inputDescription = document.getElementById("input-description");

function draw() {
  const visible = applyFilter(state.tasks, state.filter);
  renderTasks(visible, state.tasks, {
    onToggle: handleToggle,
    onDelete: handleDelete,
    onEditSave: handleEditSave,
  });
}

async function loadTasks() {
  setLoading(true);
  showError(null);
  try {
    state.tasks = await getTasks();
    draw();
  } catch (err) {
    showError("No se pudieron cargar las tareas. Verifica que el backend esté corriendo.");
  } finally {
    setLoading(false);
  }
}

async function handleCreate(event) {
  event.preventDefault();

  const title = inputTitle.value.trim();
  if (!title) return;

  const description = inputDescription.value.trim();

  try {
    const newTask = await createTask({ title, description });
    state.tasks.unshift(newTask);
    inputTitle.value = "";
    inputDescription.value = "";
    inputTitle.focus();
    showError(null);
    draw();
  } catch (err) {
    showError("No se pudo crear la tarea. Intenta de nuevo.");
  }
}

async function handleToggle(task) {
  const previous = task.completed;
  task.completed = !previous; // actualización optimista
  draw();

  try {
    const updated = await updateTask(task.id, { completed: task.completed });
    Object.assign(task, updated);
    draw();
  } catch (err) {
    task.completed = previous; // revertir si falla
    draw();
    showError("No se pudo actualizar la tarea.");
  }
}

async function handleEditSave(task, changes) {
  const previous = { title: task.title, description: task.description };
  Object.assign(task, changes); // actualización optimista
  draw();

  try {
    const updated = await updateTask(task.id, changes);
    Object.assign(task, updated);
    draw();
  } catch (err) {
    Object.assign(task, previous);
    draw();
    showError("No se pudieron guardar los cambios.");
  }
}

async function handleDelete(task) {
  const index = state.tasks.findIndex((t) => t.id === task.id);
  if (index === -1) return;

  const [removed] = state.tasks.splice(index, 1);
  draw();

  try {
    await deleteTask(task.id);
  } catch (err) {
    state.tasks.splice(index, 0, removed); // restaurar si falla
    draw();
    showError("No se pudo eliminar la tarea.");
  }
}

function handleFilterClick(event) {
  const btn = event.target.closest(".filters__btn");
  if (!btn) return;

  state.filter = btn.dataset.filter;
  setActiveFilterButton(state.filter);
  draw();
}

form.addEventListener("submit", handleCreate);
document.querySelector(".filters").addEventListener("click", handleFilterClick);

loadTasks();
