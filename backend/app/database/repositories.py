from typing import Generic, TypeVar, Type, List, Optional, Any, Dict, Union
from sqlalchemy import select, update, delete, join
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select
from sqlalchemy.orm import joinedload, contains_eager

from .models import Base, User, Category, Course, Lesson
from core.security import get_password_hash, verify_password

T = TypeVar('T', bound=Base)

class BaseRepository(Generic[T]):
    """Базовый репозиторий для работы с данными"""
    
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model
    
    async def create(self, obj_in: Dict[str, Any]) -> T:
        """Создание новой записи"""
        db_obj = self.model(**obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj
    
    async def get(self, id: Any) -> Optional[T]:
        """Получение записи по ID"""
        id_column = self.model.get_id_column()
        stmt = select(self.model).where(id_column == id)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def get_multi(self, *, skip: int = 0, limit: int = 100) -> List[T]:
        """Получение списка записей с пагинацией"""
        stmt = select(self.model).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def update(self, id: Any, obj_in: Dict[str, Any]) -> Optional[T]:
        """Обновление записи"""
        stmt = (
            update(self.model)
            .where(self.model.get_id_column() == id)
            .values(**obj_in)
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalars().first()
    
    async def delete(self, id: Any) -> bool:
        """Удаление записи"""
        stmt = delete(self.model).where(self.model.get_id_column() == id)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0
    
    async def filter(self, **kwargs) -> List[T]:
        """Фильтрация записей по атрибутам"""
        stmt = select(self.model)
        for key, value in kwargs.items():
            if hasattr(self.model, key):
                stmt = stmt.where(getattr(self.model, key) == value)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


# Исправим определение методов get_id_column
def update_models():
    """
    Добавляет методы get_id_column в модели
    Вызовите эту функцию при запуске приложения
    """
    # Исправляем: возвращаем статические методы вместо методов экземпляров
    # В этом случае лямбда не принимает self
    User.get_id_column = classmethod(lambda cls: User.user_id)
    Category.get_id_column = classmethod(lambda cls: Category.category_id)
    Course.get_id_column = classmethod(lambda cls: Course.course_id)
    Lesson.get_id_column = classmethod(lambda cls: Lesson.lesson_id)


class UserRepository(BaseRepository[User]):
    """Репозиторий для работы с пользователями, включая хеширование паролей"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Получение пользователя по email"""
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def get_by_login(self, login: str) -> Optional[User]:
        """Получение пользователя по логину"""
        stmt = select(User).where(User.login == login)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def create_with_hashed_password(self, obj_in: Dict[str, Any]) -> User:
        """Создание пользователя с хешированием пароля"""
        user_data = obj_in.copy()
        if "password" in user_data:
            user_data["password"] = get_password_hash(user_data["password"])
        return await self.create(user_data)
    
    async def update_with_hashed_password(self, id: Any, obj_in: Dict[str, Any]) -> Optional[User]:
        """Обновление пользователя с хешированием пароля при необходимости"""
        user_data = obj_in.copy()
        if "password" in user_data:
            user_data["password"] = get_password_hash(user_data["password"])
        return await self.update(id, user_data)
    
    async def authenticate(self, login: str, password: str) -> Optional[User]:
        """Аутентификация пользователя по логину и паролю"""
        user = await self.get_by_login(login)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user
    
    async def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """Изменение пароля пользователя с проверкой старого пароля"""
        user = await self.get(user_id)
        if not user:
            return False
            
        if not verify_password(old_password, user.password):
            return False
            
        hashed_password = get_password_hash(new_password)
        await self.update(user_id, {"password": hashed_password})
        return True


class CategoryRepository(BaseRepository[Category]):
    """Репозиторий для работы с категориями"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, Category)
    
    async def get_by_name(self, name: str) -> Optional[Category]:
        """Получение категории по имени"""
        stmt = select(Category).where(Category.name == name)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def has_courses(self, category_id: int) -> bool:
        """Проверка, есть ли курсы, связанные с категорией"""
        stmt = select(Course).where(Course.category_id == category_id).limit(1)
        result = await self.session.execute(stmt)
        return result.scalars().first() is not None
    
    async def get_categories_with_courses(self) -> List[Category]:
        """Получение категорий, содержащих курсы"""
        # Сложный запрос с подзапросом для получения только тех категорий, у которых есть курсы
        subquery = select(Course.category_id).distinct().subquery()
        stmt = select(Category).join(subquery, Category.category_id == subquery.c.category_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class CourseRepository(BaseRepository[Course]):
    """Репозиторий для работы с курсами"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, Course)
    
    async def get_courses_by_user(self, user_id: int) -> List[Course]:
        """Получение курсов пользователя"""
        stmt = select(Course).where(Course.user_id == user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_courses_by_category(self, category_id: int) -> List[Course]:
        """Получение курсов по категории"""
        stmt = select(Course).where(Course.category_id == category_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_multi_with_category(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Получение списка курсов с информацией о категориях"""
        stmt = (
            select(Course, Category.name.label("category_name"))
            .join(Category, Course.category_id == Category.category_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        courses = []
        for row in result:
            course_dict = row[0].__dict__
            course_dict["category_name"] = row[1]
            courses.append(course_dict)
        return courses

    async def filter_with_category(self, **filters) -> List[Dict[str, Any]]:
        """Фильтрация курсов с информацией о категориях"""
        stmt = (
            select(Course, Category.name.label("category_name"))
            .join(Category, Course.category_id == Category.category_id)
        )
        
        if "category_id" in filters:
            stmt = stmt.where(Course.category_id == filters["category_id"])
        if "user_id" in filters:
            stmt = stmt.where(Course.user_id == filters["user_id"])
            
        result = await self.session.execute(stmt)
        courses = []
        for row in result:
            course_dict = row[0].__dict__
            course_dict["category_name"] = row[1]
            courses.append(course_dict)
        return courses

    async def get_courses_by_user_with_category(self, user_id: int) -> List[Dict[str, Any]]:
        """Получение курсов пользователя с информацией о категориях"""
        stmt = (
            select(Course, Category.name.label("category_name"))
            .join(Category, Course.category_id == Category.category_id)
            .where(Course.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        courses = []
        for row in result:
            course_dict = row[0].__dict__
            course_dict["category_name"] = row[1]
            courses.append(course_dict)
        return courses

    async def get_course_with_details(self, course_id: int) -> Optional[Dict[str, Any]]:
        """Получение курса с дополнительной информацией"""
        stmt = (
            select(Course, User.user_name, Category.name.label("category_name"))
            .join(User, Course.user_id == User.user_id)
            .join(Category, Course.category_id == Category.category_id)
            .where(Course.course_id == course_id)
        )
        result = await self.session.execute(stmt)
        row = result.first()
        
        if not row:
            return None
            
        course, user_name, category_name = row
        
        course_dict = {
            "course_id": course.course_id,
            "user_id": course.user_id,
            "category_id": course.category_id,
            "course_name": course.course_name,
            "start_date": course.start_date,
            "end_date": course.end_date,
            "course_image": course.course_image,
            "user_name": user_name,
            "category_name": category_name
        }
        
        return course_dict
    
    async def get_course_with_lessons(self, course_id: int) -> Optional[Course]:
        """Получение курса вместе с уроками"""
        stmt = (
            select(Course)
            .options(joinedload(Course.lessons))
            .where(Course.course_id == course_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def count_lessons(self, course_id: int) -> int:
        """Подсчет количества уроков в курсе"""
        stmt = select(Lesson).where(Lesson.course_id == course_id)
        result = await self.session.execute(stmt)
        return len(list(result.scalars().all()))

    async def search_by_name(self, query: str) -> List[Course]:
        """Поиск курсов по названию"""
        search_term = f"%{query}%"
        stmt = select(Course).where(Course.course_name.ilike(search_term))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_by_name_with_category(self, query: str) -> List[Dict[str, Any]]:
        """Поиск курсов по названию с информацией о категориях"""
        search_term = f"%{query}%"
        stmt = (
            select(Course, Category.name.label("category_name"))
            .join(Category, Course.category_id == Category.category_id)
            .where(Course.course_name.ilike(search_term))
        )
        result = await self.session.execute(stmt)
        courses = []
        for row in result:
            course_dict = row[0].__dict__
            course_dict["category_name"] = row[1]
            courses.append(course_dict)
        return courses


class LessonRepository(BaseRepository[Lesson]):
    """Репозиторий для работы с уроками"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, Lesson)
    
    async def get_lessons_by_course(self, course_id: int) -> List[Lesson]:
        """Получение уроков курса"""
        stmt = select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.lesson_num)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()) 