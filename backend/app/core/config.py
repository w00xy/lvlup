import os
from pathlib import Path

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())


class Settings():
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    
    DATABASE_URL: str = f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'lvlup.db')}"
    EMAIL: str = os.getenv("EMAIL")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

    IMAGES_DIR: str = Path("static")
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".gif"}

settings = Settings()