from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from src.database.main import create_db_and_tables
from src.users.router import router as users_router
from src.admin.routes import router as admin_router



@asynccontextmanager
async def life_span(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    lifespan=life_span
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pour tout autoriser, sinon ["http://localhost:5500"] si tu utilises Live Server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Routes

# ✅ MONTER les dossiers statiques FRONTEND
app.mount("/admin-interface", StaticFiles(directory="../Front-end/admin_interface"), name="admin")
app.mount("/user-interface", StaticFiles(directory="../Front-end/user_interface"), name="user")


@app.get("/")
def home_page():
    return FileResponse("../Front-end/index.html")


# ✅ ROUTES spécifiques pour renvoyer les HTML
@app.get("/super-admin")
def get_super_admin():
    return FileResponse("../Front-end/admin_interface/super-admin.html")

@app.get("/login")
def get_admin_login():
    return FileResponse("../Front-end/admin_interface/login.html")

@app.get("/admin-login")
def get_user_pending() : 
    return FileResponse("../Front-end/admin_interface/admin-login.html")

@app.get("/inscription")
def get_user_inscription():
    return FileResponse("../Front-end/user_interface/inscription.html")

@app.get("/attente")
def get_user_attente():
    return FileResponse("../Front-end/user_interface/attente.html")

# ✅ Inclure les routers
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(users_router, prefix="/user", tags=["Users"])