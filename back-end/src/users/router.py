from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from uuid import uuid4
import os
from datetime import datetime


from src.database.main import get_session
from .models import Users

router = APIRouter()

UPLOAD_DIR = "src/static/uploads"

@router.post("/register")
def register_user(
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),
    numero: str = Form(...),
    capture: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    # Vérifie si email déjà utilisé
    statement = select(Users).where(Users.email == email)
    user = session.exec(statement)
    user = user.first()

    if user : 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail ="Email déjà utilisé")

    # Enregistrer le fichier
    ext = capture.filename.split('.')[-1]#type: ignore 
    filename = f"{uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(capture.file.read())

    # Créer l'utilisateur en attente
    user = Users(
        uid=uuid4(),
        first_name=nom,
        last_name=prenom,
        email=email,
        phone_number=numero,
        capture_path=filepath,
        subscripted_at=datetime.now(),  # Replace with appropriate value if needed
        payement_reference=None  # Replace with appropriate value if needed
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"message": "Inscription reçue. En attente de validation.", "user_id": user.uid}




@router.get("/access/{token}")
def verify_access_token(
    token: str,
    session: Session = Depends(get_session)
):
    user = session.exec(
        select(Users).where(Users.access_token == token)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Token invalide.")

    if user.payment_status != "valide":
        raise HTTPException(status_code=403, detail="Inscription non validée.")

    return JSONResponse(
        content={
            "message": "Accès autorisé.",
            "user_id": str(user.uid),
            "nom": user.last_name,
            "prenom": user.first_name
        }
    )
