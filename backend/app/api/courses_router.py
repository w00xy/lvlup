from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime

from database.dependencies import get_course_repository, get_category_repository, get_lesson_repository
from database.repositories import CourseRepository, CategoryRepository, LessonRepository
from schemas.courses import CourseCreate, CourseUpdate, CourseResponse, CourseDetailResponse
from schemas.lessons import LessonResponse
from api.user_router import get_current_user
from database.models import User
from utils.images import save_upload_file, remove_image, is_valid_image, MAX_IMAGE_SIZE

courses_router = APIRouter(prefix="/courses", tags=["courses"])

@courses_router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_name: str = Form(...),
    category_id: int = Form(...),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    course_repo: CourseRepository = Depends(get_course_repository),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Создание нового курса с возможностью загрузки изображения"""
    # Проверяем существование категории
    category = await category_repo.get(category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Указанная категория не найдена"
        )
    
    # Создаем словарь с данными курса
    course_data = {
        "course_name": course_name,
        "category_id": category_id,
        "user_id": current_user.user_id,
        "start_date": datetime.now() if not start_date else datetime.fromisoformat(start_date),
    }
    
    # Добавляем дату окончания только если она указана
    if end_date:
        try:
            course_data["end_date"] = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный формат даты окончания. Используйте ISO формат (YYYY-MM-DD или YYYY-MM-DDTHH:MM:SS)"
            )
    
    # Сохраняем изображение, если оно предоставлено
    if image:
        if image.size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Изображение слишком большое. Максимальный размер: {MAX_IMAGE_SIZE // (1024*1024)} МБ"
            )
        
        # Сохраняем изображение и получаем путь к нему
        image_path = await save_upload_file(image, subfolder="courses")
        course_data["course_image"] = image_path
    
    # Создаем курс
    course = await course_repo.create(course_data)
    return course

@courses_router.get("/", response_model=List[CourseResponse])
async def read_courses(
    skip: int = 0, 
    limit: int = 100,
    category_id: Optional[int] = None,
    user_id: Optional[int] = None,
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """
    Получение списка курсов с возможностью фильтрации по категории и пользователю
    """
    filters = {}
    if category_id is not None:
        filters["category_id"] = category_id
    if user_id is not None:
        filters["user_id"] = user_id
        
    if filters:
        courses = await course_repo.filter_with_category(**filters)
    else:
        courses = await course_repo.get_multi_with_category(skip=skip, limit=limit)
    return courses

@courses_router.get("/my", response_model=List[CourseResponse])
async def read_my_courses(
    current_user: User = Depends(get_current_user),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Получение курсов текущего пользователя"""
    courses = await course_repo.get_courses_by_user_with_category(current_user.user_id)
    return courses

@courses_router.get("/{course_id}", response_model=CourseDetailResponse)
async def read_course(
    course_id: int,
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Получение детальной информации о курсе"""
    course = await course_repo.get_course_with_details(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    return course

@courses_router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_name: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    course_repo: CourseRepository = Depends(get_course_repository),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Обновление курса с возможностью загрузки нового изображения"""
    # Проверяем существование курса
    course = await course_repo.get(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на изменение этого курса"
        )
    
    # Проверяем категорию, если она меняется
    if category_id is not None:
        category = await category_repo.get(category_id)
        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Указанная категория не найдена"
            )
    
    # Собираем данные для обновления
    update_data = {}
    if course_name is not None:
        update_data["course_name"] = course_name
    if category_id is not None:
        update_data["category_id"] = category_id
    if start_date is not None:
        update_data["start_date"] = start_date
    if end_date is not None:
        update_data["end_date"] = end_date
    if description is not None:
        update_data["description"] = description
    
    # Обрабатываем изображение, если оно предоставлено
    if image:
        if image.size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Изображение слишком большое. Максимальный размер: {MAX_IMAGE_SIZE // (1024*1024)} МБ"
            )
        
        # Удаляем старое изображение
        if course.course_image:
            remove_image(course.course_image)
        
        # Сохраняем новое изображение
        image_path = await save_upload_file(image, subfolder="courses")
        update_data["course_image"] = image_path
    
    # Если нет данных для обновления, возвращаем текущий курс
    if not update_data:
        return course
    
    # Обновляем курс
    updated_course = await course_repo.update(course_id, update_data)
    return updated_course

@courses_router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Удаление курса"""
    # Проверяем существование курса
    course = await course_repo.get(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа - только создатель курса или администратор может его удалить
    if course.user_id != current_user.user_id:
        # Если у вас есть система ролей, проверьте здесь права администратора
        # if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на удаление этого курса"
        )
    
    # Удаляем курс
    # Примечание: возможно, потребуется дополнительная логика для удаления связанных уроков
    deleted = await course_repo.delete(course_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении курса"
        )
    
    return None  # 204 No Content

@courses_router.get("/{course_id}/lessons", response_model=List[LessonResponse])
async def read_course_lessons(
    course_id: int,
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

@courses_router.get("/search", response_model=List[CourseResponse])
async def search_courses(
    query: str = Query(..., min_length=3),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Поиск курсов по названию"""
    courses = await course_repo.search_by_name_with_category(query)
    return courses

@courses_router.post("/{course_id}/image", response_model=CourseResponse)
async def upload_course_image(
    course_id: int,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Загрузка или замена изображения для существующего курса"""
    # Проверяем существование курса
    course = await course_repo.get(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на изменение этого курса"
        )
    
    # Проверяем размер файла
    if image.size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Изображение слишком большое. Максимальный размер: {MAX_IMAGE_SIZE // (1024*1024)} МБ"
        )
    
    # Удаляем старое изображение, если оно есть
    if course.course_image:
        remove_image(course.course_image)
    
    # Сохраняем новое изображение
    image_path = await save_upload_file(image, subfolder="courses")
    
    # Обновляем путь к изображению в БД
    updated_course = await course_repo.update(course_id, {"course_image": image_path})
    
    return updated_course

@courses_router.delete("/{course_id}/image", response_model=CourseResponse)
async def delete_course_image(
    course_id: int,
    current_user: User = Depends(get_current_user),
    course_repo: CourseRepository = Depends(get_course_repository)
):
    """Удаление изображения курса"""
    # Проверяем существование курса
    course = await course_repo.get(course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    # Проверяем права доступа
    if course.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на изменение этого курса"
        )
    
    # Проверяем, есть ли изображение
    if not course.course_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="У курса нет изображения"
        )
    
    # Удаляем изображение с диска
    remove_image(course.course_image)
    
    # Обновляем запись в БД
    updated_course = await course_repo.update(course_id, {"course_image": None})
    
    return updated_course
