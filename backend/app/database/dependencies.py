from typing import AsyncGenerator, Callable, Type
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .session import get_db_session
from .repositories import (
    BaseRepository, 
    UserRepository, 
    CategoryRepository, 
    CourseRepository, 
    LessonRepository
)
from .models import Base

# Зависимость для получения сессии БД
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_db_session() as session:
        yield session

# Функция-фабрика для создания зависимостей репозиториев
def get_repository(repo_class: Type[BaseRepository]) -> Callable:
    """
    Создает зависимость для конкретного репозитория
    
    Пример использования:
    ```
    @app.get("/users/{user_id}")
    async def get_user(
        user_id: int, 
        user_repo: UserRepository = Depends(get_repository(UserRepository))
    ):
        return await user_repo.get(user_id)
    ```
    """
    async def _get_repo(session: AsyncSession = Depends(get_db)) -> BaseRepository:
        return repo_class(session)
    return _get_repo

# Готовые зависимости для каждого репозитория
get_user_repository = get_repository(UserRepository)
get_category_repository = get_repository(CategoryRepository)
get_course_repository = get_repository(CourseRepository)
get_lesson_repository = get_repository(LessonRepository) 