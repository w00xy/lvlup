from sqlalchemy import String, BigInteger, Float, Integer, ForeignKey, DateTime, func, Boolean, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""
    
    @classmethod
    def get_id_column(cls):
        """
        Получение столбца ID модели.
        Переопределяется для конкретных моделей или устанавливается через update_models.
        
        По умолчанию ищет столбец с именем, заканчивающимся на '_id'
        """
        for attr_name in dir(cls):
            if attr_name.endswith('_id') and isinstance(getattr(cls, attr_name), Mapped):
                return getattr(cls, attr_name)
        raise NotImplementedError(f"Model {cls.__name__} must implement get_id_column method")
    
class User(Base):
    __tablename__ = 'users'

    user_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_name: Mapped[str] = mapped_column(String(45), nullable=False)
    login: Mapped[str] = mapped_column(String(45), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    
    # Отношения
    courses = relationship("Course", back_populates="user")
    

class Category(Base):
    __tablename__ = 'categories'
    
    category_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(45), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Отношения
    courses = relationship("Course", back_populates="category")
    
    
class Course(Base):  # Исправлено на единственное число для соблюдения конвенций именования
    __tablename__ = 'courses'
    
    course_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.user_id'), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('categories.category_id'), nullable=False)
    course_name: Mapped[str] = mapped_column(String(45), nullable=False)
    start_date: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    course_image: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Отношения
    user = relationship("User", back_populates="courses")
    category = relationship("Category", back_populates="courses")
    lessons = relationship("Lesson", back_populates="course")


class Lesson(Base):
    __tablename__ = 'lessons'
    
    lesson_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey('courses.course_id'), nullable=False)
    lesson_num: Mapped[int] = mapped_column(Integer, nullable=True)
    lesson_image: Mapped[str] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text(1024), nullable=True)
    
    # Отношения
    course = relationship("Course", back_populates="lessons")