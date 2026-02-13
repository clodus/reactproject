# Pour démarrer l'app : uvicorn app.main:app --reload

from fastapi import FastAPI
from app import models
from app.database import engine
from app.routes import users

# Créer l'app AVANT tout
app = FastAPI(title="Backend FastAPI Starter")

# Pour que React puisse appeler ton API FastAPI en local, il faut activer CORS 
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # port React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer les tables si elles n'existent pas
models.Base.metadata.create_all(bind=engine)

# Inclure les routes
app.include_router(users.router)

# Route par defaut
@app.get("/")
def root():
    return {"message": "Backend FastAPI prêt 🚀"}