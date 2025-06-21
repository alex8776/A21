from pydantic import BaseModel, EmailStr



class AdminLogin(BaseModel) : 
    user_name : str
    password : str


class AdminCreate(BaseModel):
    username: str
    password: str