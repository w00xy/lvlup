from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from database.dependencies import get_user_repository, get_course_repository
from database.repositories import UserRepository, CourseRepository

example_router = APIRouter(prefix="/example", tags=["example"])

# Модели данных Pydantic
class UserBase(BaseModel):
    user_name: str
    login: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: int
    
    class Config:
        from_attributes = True

# Примеры API маршрутов
@example_router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate, 
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Создание нового пользователя"""
    # Проверяем, существует ли пользователь с таким email или логином
    existing_email = await user_repo.get_by_email(user.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    existing_login = await user_repo.get_by_login(user.login)
    if existing_login:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Логин уже занят"
        )
    
    # Создаем нового пользователя
    # В реальном приложении здесь нужно хешировать пароль
    new_user = await user_repo.create(user.model_dump())
    return new_user

@example_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int, 
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Получение пользователя по ID"""
    user = await user_repo.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    return user

@example_router.get("/users/{user_id}/courses")
async def get_user_courses(
    user_id: int,
    course_repo: CourseRepository = Depends(get_course_repository),
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Получение курсов пользователя"""
    # Проверка существования пользователя
    user = await user_repo.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Получение курсов пользователя
    courses = await course_repo.get_courses_by_user(user_id)
    return courses 