# Backend — TO-DO Web

Tu responsabilidad: API REST + base de datos. El frontend (`static/`, `templates/`) lo hace tu compañero.

## Arranque
```bash
PYTHONPATH=backend uvicorn app.main:app --reload
```
Servidor en `http://localhost:8000`. Docs automáticas en `/docs`.

## Dependencias
```bash
pip install -r backend/requirements.txt
```

## Estructura
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py       # FastAPI app, CORS, monta static/templates, crea tablas
│   ├── database.py   # engine SQLite, sesión, Base declarativa
│   ├── models.py     # Modelo Todo
│   ├── schemas.py    # Pydantic: TodoCreate, TodoUpdate, TodoResponse
│   └── routes.py     # CRUD en /todos
├── data/             # Aquí se crea database.db
└── requirements.txt
```

## Convenciones
- snake_case, type hints estrictos
- Validar entrada con Pydantic en cada endpoint
- No usar variables globales para la DB — siempre `Depends(get_db)`

## No hacer
- No tocar `static/` ni `templates/` — es del compañero
- No subir `.db` ni `venv/` al repo
- No instalar librerías innecesarias

## Contrato API (lo que el frontend espera)
- `GET /todos` — lista todas las tareas
- `POST /todos` — crea tarea (body: `{title, description?}`)
- `PUT /todos/{id}` — actualiza tarea (body parcial)
- `DELETE /todos/{id}` — elimina tarea

Campos del modelo: `id`, `title`, `description`, `completed`, `created_at`, `updated_at`

## Workflow
- Una tarea a la vez
- Antes de algo no trivial, propón plan
- Al terminar, reporta qué cambiaste