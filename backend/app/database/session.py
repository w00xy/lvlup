from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from core.config import settings
from database.models import Base

# Строка подключения к базе данных
DATABASE_URL = settings.DATABASE_URL

# Создание асинхронного движка
engine = create_async_engine(DATABASE_URL, echo=True)

# Фабрика сессий
session_maker = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

@asynccontextmanager
async def get_db_session():
    """
    Контекстный менеджер для получения сессии базы данных
    
    Пример:
    ```
    async with get_db_session() as session:
        result = await session.execute(...)
    ```
    """
    async with session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

# Примечание: эта функция может быть удалена при переходе на Alembic
async def create_db():
    """
    Создает таблицы в базе данных
    ВНИМАНИЕ: Используйте Alembic для миграций вместо этой функции
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)