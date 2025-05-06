from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from database.dependencies import get_category_repository
from database.repositories import CategoryRepository
from schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from api.user_router import get_current_user
from database.models import User

category_router = APIRouter(prefix="/categories", tags=["categories"])

@category_router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Создание новой категории (требуются права администратора)"""
    # Здесь можно добавить проверку на права администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Проверяем, существует ли категория с таким именем
    existing_category = await category_repo.get_by_name(category_data.name)
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Категория с таким именем уже существует"
        )
    
    # Создаем новую категорию
    category = await category_repo.create(category_data.model_dump())
    return category

@category_router.get("/", response_model=List[CategoryResponse])
async def read_categories(
    skip: int = 0, 
    limit: int = 100,
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Получение списка всех категорий"""
    categories = await category_repo.get_multi(skip=skip, limit=limit)
    return categories

@category_router.get("/{category_id}", response_model=CategoryResponse)
async def read_category(
    category_id: int,
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Получение категории по ID"""
    category = await category_repo.get(category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена"
        )
    return category

@category_router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Обновление категории (требуются права администратора)"""
    # Здесь можно добавить проверку на права администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Проверяем существование категории
    category = await category_repo.get(category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена"
        )
    
    # Проверяем, не занято ли новое имя категории, если оно меняется
    if category_data.name and category_data.name != category.name:
        existing_category = await category_repo.get_by_name(category_data.name)
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Категория с таким именем уже существует"
            )
    
    # Обновляем категорию
    updated_category = await category_repo.update(
        category_id, 
        category_data.model_dump(exclude_unset=True)
    )
    return updated_category

@category_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Удаление категории (требуются права администратора)"""
    # Здесь можно добавить проверку на права администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Проверяем существование категории
    category = await category_repo.get(category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категория не найдена"
        )
    
    # Удаляем категорию
    # Примечание: может потребоваться дополнительная логика для проверки,
    # нет ли связанных с категорией курсов перед удалением
    deleted = await category_repo.delete(category_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении категории"
        )
    
    return None  # 204 No Content

# Новые маршруты для работы с категориями по имени

@category_router.get("/name/{name}", response_model=CategoryResponse)
async def get_category_by_name(
    name: str,
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Получение категории по имени"""
    category = await category_repo.get_by_name(name)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с именем '{name}' не найдена"
        )
    return category

@category_router.put("/name/{name}", response_model=CategoryResponse)
async def update_category_by_name(
    name: str,
    category_data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Обновление категории по имени (требуются права администратора)"""
    # Проверка на права администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Находим категорию по имени
    category = await category_repo.get_by_name(name)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с именем '{name}' не найдена"
        )
    
    # Проверяем, не занято ли новое имя категории, если оно меняется
    if category_data.name and category_data.name != category.name:
        existing_category = await category_repo.get_by_name(category_data.name)
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Категория с таким именем уже существует"
            )
    
    # Обновляем категорию
    updated_category = await category_repo.update(
        category.category_id, 
        category_data.model_dump(exclude_unset=True)
    )
    return updated_category

@category_router.delete("/name/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_by_name(
    name: str,
    force: bool = False,
    current_user: User = Depends(get_current_user),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """
    Удаление категории по имени (требуются права администратора)
    
    - force=false: Проверяет отсутствие курсов перед удалением
    - force=true: Удаляет категорию даже если есть связанные курсы
    """
    # Проверка на права администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Находим категорию по имени
    category = await category_repo.get_by_name(name)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с именем '{name}' не найдена"
        )
    
    # Проверяем, есть ли связанные курсы
    if not force and await category_repo.has_courses(category.category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить категорию, содержащую курсы. Используйте параметр force=true для принудительного удаления."
        )
    
    # Удаляем категорию
    deleted = await category_repo.delete(category.category_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при удалении категории"
        )
    
    return None  # 204 No Content

# Маршрут для создания категории, если она не существует (аналог PUT для идемпотентного создания)
@category_router.post("/name/{name}", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category_by_name(
    name: str,
    description: str = None,
    current_user: User = Depends(get_current_user),
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """
    Создание категории с заданным именем (требуются права администратора).
    Если категория с таким именем уже существует, возвращает существующую категорию.
    """
    # Проверка на права администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    # Проверяем, существует ли категория с таким именем
    existing_category = await category_repo.get_by_name(name)
    if existing_category:
        return existing_category
    
    # Создаем новую категорию
    category_data = {"name": name}
    if description:
        category_data["description"] = description
        
    category = await category_repo.create(category_data)
    return category

@category_router.get("/with-courses", response_model=List[CategoryResponse])
async def get_categories_with_courses(
    category_repo: CategoryRepository = Depends(get_category_repository)
):
    """Получение категорий, содержащих курсы"""
    categories = await category_repo.get_categories_with_courses()
    return categories
