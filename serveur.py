from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Autoriser les requêtes venant d'autres domaines (ex. : http://localhost:5500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pour développement uniquement !
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/users")
async def recevoir_donnees(request: Request):
    data = await request.json()  # Récupère les données JSON envoyées
    print(data)  # Par exemple : {'nom': 'Alice', 'email': 'alice@mail.com'}
    return {"message": "Données reçues", "data": data}
