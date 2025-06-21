from sqlmodel import Session
from fastapi import Depends

from src.admin.models import Admin
from src.database.main import get_session
from .auth import get_password_hash

db : Session = Depends(get_session)

super_admin = Admin(
    username="admin_master",
    hashed_password=get_password_hash("motdepassefort"),
    is_superadmin=True,
)
db.add(super_admin)
db.commit()
