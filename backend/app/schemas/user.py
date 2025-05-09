from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserBase(BaseModel):
    user_name: str
    login: str
    email: str

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Пароль должен содержать минимум 8 символов')
        # Можно добавить дополнительные проверки:
        # if not any(c.isupper() for c in v):
        #     raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
        # if not any(c.isdigit() for c in v):
        #     raise ValueError('Пароль должен содержать хотя бы одну цифру')
        return v

class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    email: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str
    
    @validator('new_password')
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError('Пароль должен содержать минимум 8 символов')
        return v

class UserResponse(UserBase):
    user_id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    login: Optional[str] = None
