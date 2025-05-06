import os
import uuid
import shutil
from typing import Optional
from fastapi import UploadFile
from pathlib import Path
from core.config import settings

# Базовая директория для хранения изображений
IMAGES_DIR = settings.IMAGES_DIR

# Поддерживаемые форматы изображений
ALLOWED_EXTENSIONS = settings.ALLOWED_EXTENSIONS
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

def is_valid_image(filename: str) -> bool:
    """Проверяет, является ли файл допустимым изображением"""
    return Path(filename.lower()).suffix in ALLOWED_EXTENSIONS

async def save_upload_file(upload_file: UploadFile, subfolder: str = "") -> str:
    """
    Сохраняет загруженное изображение на диск.
    Возвращает относительный путь к сохраненному файлу.
    """
    # Проверяем расширение файла
    if not is_valid_image(upload_file.filename):
        raise ValueError("Недопустимый формат файла. Разрешены только JPG, PNG, GIF и WebP")
    
    # Создаем уникальное имя файла, но сохраняем оригинальное расширение
    ext = Path(upload_file.filename).suffix
    new_filename = f"{uuid.uuid4()}{ext}"
    
    # Создаем директорию, если она не существует
    save_dir = IMAGES_DIR / subfolder
    save_dir.mkdir(parents=True, exist_ok=True)
    
    # Полный путь для сохранения
    file_path = save_dir / new_filename
    
    # Сохраняем файл
    with file_path.open("wb") as buffer:
        # Чтобы не загружать большие файлы в память целиком, копируем по частям
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Возвращаем относительный путь для хранения в БД
    return f"images/{subfolder}/{new_filename}" if subfolder else f"images/{new_filename}"

def remove_image(image_path: Optional[str]) -> bool:
    """Удаляет изображение с диска"""
    if not image_path:
        return False
    
    try:
        # Полный путь к файлу в файловой системе
        full_path = Path("static/images") / image_path
        if full_path.exists():
            os.remove(full_path)
            return True
        return False
    except Exception:
        return False

def get_image_url(image_path: Optional[str]) -> Optional[str]:
    """Возвращает URL для доступа к изображению"""
    if not image_path:
        return None
    
    # Просто добавляем '/images/' в начало пути, если нужно
    if not image_path.startswith("/"):
        return f"/images/{image_path}"
    return image_path
