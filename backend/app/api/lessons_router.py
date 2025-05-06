from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from typing import List, Optional

from database.dependencies import get_lesson_repository, get_course_repository
from database.repositories import LessonRepository, CourseRepository
from schemas.lessons import LessonResponse, LessonCreate, LessonUpdate
from utils.images import save_upload_file, remove_image, is_valid_image, MAX_IMAGE_SIZE
from api.user_router import get_current_user
from database.models import User

lessons_router = APIRouter(prefix="/lessons", tags=["lessons"])

@lessons_router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    course_id: int = Form(...),
    lesson_num: int = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    lesson_repo: LessonRepository = Depends(get_lesson_repository),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Создание нового урока с возможностью загрузки изображения"""
    # Проверяем существование курса
    course = await course_repo.get(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа (только автор курса может добавлять уроки)
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для добавления уроков в этот курс"
        )
    
    # Создаем словарь с данными урока
    lesson_data = {
        "course_id": course_id,
        "lesson_num": lesson_num,
    }
    
    # Добавляем опциональные поля
    if description:
        lesson_data["description"] = description
    
    # Сохраняем изображение, если оно предоставлено
    if image:
        if image.size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Изображение слишком большое. Максимальный размер: {MAX_IMAGE_SIZE // (1024*1024)} МБ"
            )
        
        # Проверяем формат
        if not is_valid_image(image.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Недопустимый формат файла. Разрешены только изображения."
            )
        
        # Сохраняем изображение и получаем путь к нему
        image_path = await save_upload_file(image, subfolder="lessons")
        lesson_data["lesson_image"] = image_path
    
    # Создаем урок
    lesson = await lesson_repo.create(lesson_data)
    return lesson

@lessons_router.get("/course/{course_id}", response_model=List[LessonResponse])
async def get_course_lessons(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    lesson_repo: LessonRepository = Depends(get_lesson_repository),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Получение всех уроков курса"""
    # Проверяем существование курса
    course = await course_repo.get(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Получаем уроки
    lessons = await lesson_repo.get_lessons_by_course(course_id)
    return lessons

@lessons_router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: int,
    lesson_repo: LessonRepository = Depends(get_lesson_repository)
):
    """Получение урока по ID"""
    lesson = await lesson_repo.get(lesson_id)
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Урок не найден"
        )
    return lesson

@lessons_router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: int,
    lesson_num: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    lesson_repo: LessonRepository = Depends(get_lesson_repository),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Обновление урока с возможностью загрузки нового изображения"""
    # Проверяем существование урока
    lesson = await lesson_repo.get(lesson_id)
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Урок не найден"
        )
    
    # Получаем курс
    course = await course_repo.get(lesson.course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа (только автор курса может редактировать уроки)
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для редактирования этого урока"
        )
    
    # Собираем данные для обновления
    update_data = {}
    if lesson_num is not None:
        update_data["lesson_num"] = lesson_num
    if description is not None:
        update_data["description"] = description
    
    # Обрабатываем изображение, если оно предоставлено
    if image:
        if image.size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Изображение слишком большое. Максимальный размер: {MAX_IMAGE_SIZE // (1024*1024)} МБ"
            )
        
        # Проверяем формат
        if not is_valid_image(image.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Недопустимый формат файла. Разрешены только изображения."
            )
        
        # Удаляем старое изображение
        if lesson.lesson_image:
            remove_image(lesson.lesson_image)
        
        # Сохраняем новое изображение
        image_path = await save_upload_file(image, subfolder="lessons")
        update_data["lesson_image"] = image_path
    
    # Если нет данных для обновления, возвращаем текущий урок
    if not update_data:
        return lesson
    
    # Обновляем урок
    updated_lesson = await lesson_repo.update(lesson_id, update_data)
    return updated_lesson

@lessons_router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    lesson_repo: LessonRepository = Depends(get_lesson_repository),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Удаление урока"""
    # Проверяем существование урока
    lesson = await lesson_repo.get(lesson_id)
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Урок не найден"
        )
    
    # Получаем курс
    course = await course_repo.get(lesson.course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа (только автор курса может удалять уроки)
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для удаления этого урока"
        )
    
    # Удаляем изображение, если оно есть
    if lesson.lesson_image:
        remove_image(lesson.lesson_image)
    
    # Удаляем урок
    deleted = await lesson_repo.delete(lesson_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении урока"
        )
    
    return None

@lessons_router.post("/{lesson_id}/image", response_model=LessonResponse)
async def upload_lesson_image(
    lesson_id: int,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    lesson_repo: LessonRepository = Depends(get_lesson_repository),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Загрузка или замена изображения для существующего урока"""
    # Проверяем существование урока
    lesson = await lesson_repo.get(lesson_id)
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Урок не найден"
        )
    
    # Получаем курс
    course = await course_repo.get(lesson.course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на изменение этого урока"
        )
    
    # Проверяем размер файла
    if image.size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Изображение слишком большое. Максимальный размер: {MAX_IMAGE_SIZE // (1024*1024)} МБ"
        )
    
    # Проверяем формат
    if not is_valid_image(image.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недопустимый формат файла. Разрешены только изображения."
        )
    
    # Удаляем старое изображение, если оно есть
    if lesson.lesson_image:
        remove_image(lesson.lesson_image)
    
    # Сохраняем новое изображение
    image_path = await save_upload_file(image, subfolder="lessons")
    
    # Обновляем путь к изображению в БД
    updated_lesson = await lesson_repo.update(lesson_id, {"lesson_image": image_path})
    
    return updated_lesson

@lessons_router.delete("/{lesson_id}/image", response_model=LessonResponse)
async def delete_lesson_image(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    lesson_repo: LessonRepository = Depends(get_lesson_repository),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Удаление изображения урока"""
    # Проверяем существование урока
    lesson = await lesson_repo.get(lesson_id)
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Урок не найден"
        )
    
    # Получаем курс
    course = await course_repo.get(lesson.course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на изменение этого урока"
        )
    
    # Проверяем, есть ли изображение
    if not lesson.lesson_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="У урока нет изображения"
        )
    
    # Удаляем изображение с диска
    remove_image(lesson.lesson_image)
    
    # Обновляем запись в БД
    updated_lesson = await lesson_repo.update(lesson_id, {"lesson_image": None})
    
    return updated_lesson
