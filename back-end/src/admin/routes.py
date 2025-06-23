import uuid
import os
from uuid import uuid4
from datetime import timedelta
from sqlmodel import Session, select, desc

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse

from src.database.main import get_session
from src.users.models import Users
from src.utils.email_utils import send_validation_email,send_refusal_email
from .schemas import AdminCreate
from .models import Admin
from .auth import (
    get_current_admin_user,
    get_current_superadmin,  # ✅ Nouvelle dépendance
    get_password_hash,
    verify_password,
    create_access_token
)


router = APIRouter()
ACCESS_TOKEN = 60




# ✅ Route réservée au superadmin
@router.post("/create-admin")
def create_admin_superuser(
    data: AdminCreate,
    session: Session = Depends(get_session),
    current_superadmin=Depends(get_current_superadmin)
):
    existing_admin = session.exec(select(Admin).where(Admin.username == data.username)).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Cet admin existe déjà.")

    hashed_pw = get_password_hash(data.password)
    new_admin = Admin(
        username=data.username,
        hashed_password=hashed_pw,
        is_superadmin=False  # ✅ Tous les nouveaux admins créés ne sont PAS superadmin
    )

    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)

    return {"message": f"Admin {new_admin.username} créé avec succès."}


# 🆕 Liste des admins
@router.get("/superadmin/list")
def list_admins(
    current_admin=Depends(get_current_superadmin),
    session: Session = Depends(get_session)
):
    admins = session.exec(select(Admin)).all()
    return [
        {
            "id": str(admin.id),
            "username": admin.username,
            "is_superadmin": admin.is_superadmin
        }
        for admin in admins
    ]


# ✅ Suppression d’un admin (seulement par superadmin)
@router.delete("/superadmin/delete/{admin_id}")
def delete_admin(
    admin_id: int,
    session: Session = Depends(get_session),
    current_superadmin=Depends(get_current_superadmin)
):
    admin = session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin introuvable.")
    if admin.is_superadmin:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un superadmin.")

    session.delete(admin)
    session.commit()
    return {"message": f"Admin {admin.username} supprimé avec succès."}



@router.post("/superadmin/create")
def create_admin(data: AdminCreate, session: Session = Depends(get_session)):
    # Vérifie si l'admin existe déjà
    existing_admin = session.exec(select(Admin).where(Admin.username == data.username)).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Cet admin existe déjà.")

    hashed_pw = get_password_hash(data.password)
    new_admin = Admin(
        username=data.username,
        hashed_password=hashed_pw
    )

    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)

    return {"message": f"Admin {new_admin.username} créé avec succès."}




@router.post("/login")
def login_admin(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    admin = session.exec(select(Admin).where(Admin.username == form_data.username)).first()

    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    access_token = create_access_token(data={"sub": admin.username,"is_superadmin" : admin.is_superadmin}, expires_delta=timedelta(minutes=60))
    return {"access_token": access_token, "token_type": "bearer"}




@router.get("/pending")
def get_pending_users(
    current_admin = Depends(get_current_admin_user),
    session: Session = Depends(get_session)
):
    pending_users = session.exec(
        select(Users).where(Users.payment_status == "En Attente").order_by(desc(Users.subscripted_at))
    ).all()

    return [
        {
            "id": user.uid,
            "nom": user.last_name,
            "prenom": user.first_name,
            "email": user.email,
            "numero": user.phone_number,
            "capture_path": user.capture_path,
            "date_inscription": user.subscripted_at,
            "status" : user.payment_status
        }
        for user in pending_users
    ]





@router.post("/validate/{user_id}")
def validate_user(
    user_id: uuid.UUID,
    current_admin = Depends(get_current_admin_user),
    session: Session = Depends(get_session)
):
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if user.payment_status== "valide":
        raise HTTPException(status_code=400, detail="Déjà validé.")

    # Générer un token unique
    token = uuid4().hex

    # Mise à jour utilisateur
    user.payment_status = "valide"
    user.access_token = token
    session.add(user)
    session.commit()

    # Envoi de l'email
    try:
        send_validation_email(user.email, user.last_name, token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur envoi email : {e}")

    return {"message": f"Utilisateur {user.last_name} validé et email envoyé."}






@router.get("/capture/{user_id}")
def get_user_capture(
    user_id: uuid.UUID,
    current_admin = Depends(get_current_admin_user),
    session: Session = Depends(get_session)
):
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if not os.path.exists(user.capture_path):#type: ignore
        raise HTTPException(status_code=404, detail="Fichier non trouvé.")

    # On renvoie directement le fichier
    return FileResponse(
        path=user.capture_path,#type: ignore
        media_type="image/*",  # ou image/png si tu veux forcer
        filename=os.path.basename(user.capture_path)#type: ignore
    )




@router.post("/refuse/{user_id}")
def refuse_user(
    user_id: uuid.UUID,
    current_admin = Depends(get_current_admin_user),
    session: Session = Depends(get_session)
):
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if user.payment_status == "refuse":
        raise HTTPException(status_code=400, detail="Utilisateur déjà refusé.")

    # Supprimer la capture
    if user.capture_path and os.path.exists(user.capture_path):
        try:
            os.remove(user.capture_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur suppression capture : {e}")

    # Mise à jour du statut
    user.payment_status = "refuse"
    user.capture_path 
    session.add(user)
    session.commit()

    # Envoi du mail
    try:
        send_refusal_email(user.email, user.last_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur envoi mail : {e}")

    return {"message": f"Utilisateur {user.last_name} refusé, capture supprimée, mail envoyé."}
