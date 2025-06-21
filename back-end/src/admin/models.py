from sqlmodel import SQLModel, Field



class Admin(SQLModel, table=True) : 
    id : int|None = Field(default = None,primary_key=True)
    username : str
    hashed_password : str 
    is_superadmin : bool = Field(default = False)
