// api.js
// Capa de comunicación con el backend FastAPI.
// Ninguna función de aquí toca el DOM: solo hace fetch() y devuelve datos u errores.

const BASE_URL = "/todos";

/**
 * Lanza un error legible cuando la respuesta HTTP no es exitosa.
 * @param {Response} response
 */
async function assertOk(response) {
  if (response.ok) return response;

  let detail = `Error ${response.status}`;
  try {
    const body = await response.json();
    if (body?.detail) detail = body.detail;
  } catch {
    // el cuerpo no era JSON; nos quedamos con el mensaje por defecto
  }
  throw new Error(detail);
}

/**
 * Obtiene todas las tareas.
 * @returns {Promise<Array<object>>}
 */
export async function getTasks() {
  const response = await fetch(`${BASE_URL}/`, {
    headers: { Accept: "application/json" },
  });
  await assertOk(response);
  return response.json();
}

/**
 * Crea una nueva tarea.
 * @param {{title: string, description?: string}} data
 * @returns {Promise<object>}
 */
export async function createTask(data) {
  const response = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.title,
      description: data.description ?? "",
      completed: false,
    }),
  });
  await assertOk(response);
  return response.json();
}

/**
 * Actualiza parcialmente una tarea (título, descripción y/o estado).
 * @param {number} id
 * @param {Partial<{title: string, description: string, completed: boolean}>} changes
 * @returns {Promise<object>}
 */
export async function updateTask(id, changes) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  await assertOk(response);
  return response.json();
}

/**
 * Elimina una tarea.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  await assertOk(response);
}
