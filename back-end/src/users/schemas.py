from pydantic import BaseModel, EmailStr


class UserCreateModel(BaseModel) : 
    first_name : str
    last_name : str 
    email : EmailStr
    phone_number : str 



