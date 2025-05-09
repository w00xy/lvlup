# Пакет API содержит все маршруты приложения 
from .user_router import user_router, auth_router
from .category_router import category_router
from .courses_router import courses_router  
from .lessons_router import lessons_router

__all__ = ["user_router", "auth_router", "category_router", "courses_router", "lessons_router"]