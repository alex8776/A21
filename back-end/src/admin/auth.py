from datetime import datetime, timedelta
import jwt
from jwt.exceptions import PyJWKError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from .models import Admin
from src.database.main import get_session
from src.config import Config




ACCESS_TOKEN_EXPIRE_MINUTES = 60



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")


# Utilitaires
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, Config.JWT_SECRET, algorithm=Config.ALGORITHM)




# Dépendance pour authentifier un admin
def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider le token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except PyJWKError:
        raise credentials_exception

    admin = session.exec(select(Admin).where(Admin.username == username)).first()
    if admin is None:
        raise credentials_exception
    return admin



#dependance pour autentifier un super admin 
def get_current_superadmin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.ALGORITHM])
        if not payload.get("is_superadmin", False):
            raise HTTPException(status_code=403, detail="Superadmin requis")
        return payload
    except PyJWKError:
        raise HTTPException(status_code=401, detail="Token invalide")
