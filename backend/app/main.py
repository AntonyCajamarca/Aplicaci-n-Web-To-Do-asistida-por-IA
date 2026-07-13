import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse
from starlette.requests import Request
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import router as todos_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TO-DO Web", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos_router)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BASE_DIR)

static_dir = os.path.join(PROJECT_DIR, "static")
templates_dir = os.path.join(PROJECT_DIR, "templates")

templates = None
if os.path.isdir(templates_dir):
    templates = Jinja2Templates(directory=templates_dir)

if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    if templates:
        return templates.TemplateResponse(request, "index.html")
    return HTMLResponse("<h1>TO-DO Web API</h1><p>Frontend not ready yet.</p>")
