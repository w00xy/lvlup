from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from sqlalchemy import text
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database.session import session_maker
from database.repositories import update_models
from api import example, user_router, auth_router, category_router, courses_router, lessons_router
from core.config import settings
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Добавляем методы get_id_column в модели
    update_models()
    
    async with session_maker() as session:
        try:
            await session.execute(text('SELECT 1'))
            print("База данных доступна")
        except Exception as e:
            print(f"Ошибка соединения с базой данных: {e}")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Монтируем папку static для обслуживания статических файлов
settings.IMAGES_DIR.mkdir(exist_ok=True)
# Важно: монтируем директорию 'static' по пути '/images'
app.mount("/images", StaticFiles(directory=settings.IMAGES_DIR), name="images")

# Подключаем маршруты
# app.include_router(example.example_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(category_router)
app.include_router(courses_router)
app.include_router(lessons_router)

@app.get("/")
def check_alive():
    return {"ok": True}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)