from typing import Optional
from sqlmodel import SQLModel, Field, Column
import sqlalchemy.dialects.postgresql as pg 
import uuid 
from datetime import datetime 
from pydantic import EmailStr



class Users(SQLModel, table = True) : 
    uid : uuid.UUID = Field(sa_column=
        Column(
            pg.UUID(as_uuid=True), 
            primary_key=True, 
            default = uuid.uuid4,
            nullable = False
        )
    )
    first_name : str 
    last_name : str 
    email : EmailStr
    phone_number : str 
    capture_path: Optional[str] = Field(default=None) 
    subscripted_at : datetime = Field(sa_column=Column(pg.TIMESTAMP, default = datetime.now,nullable = False))
    payment_status : str = "En Attente"
    access_token : str |None = None
    payement_reference : uuid.UUID|None = Field(sa_column=
                                            Column(
                                               pg.UUID(as_uuid=True), 
                                               default = uuid.uuid4,
                                               nullable=True
                                               )
                                            )
