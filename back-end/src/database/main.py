from sqlmodel import create_engine, Session, SQLModel, Session 
from typing import Annotated
from fastapi import Depends

from src.config import Config 


DATABASE_URL = "postgresql://postgres:souleymane@localhost:5432/forum_db"



engine = create_engine(
    DATABASE_URL, 
    echo=True
)


def create_db_and_tables() : 
    SQLModel.metadata.create_all(engine)


def get_session() : 
    with Session(engine) as session  : 
        yield session


SessionDependances = Annotated[Session, Depends(get_session)]