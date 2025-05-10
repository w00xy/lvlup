from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime

class CourseBase(BaseModel):
    course_name: str
    category_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    course_image: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    course_name: Optional[str] = None
    category_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    course_image: Optional[str] = None

class CourseResponse(BaseModel):
    course_id: int
    user_id: int
    course_name: str
    category_id: int
    category_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    course_image: Optional[str] = None
    
    # Добавляем вычисляемое поле для полного URL изображения
    @property
    def image_url(self) -> Optional[str]:
        if self.course_image:
            return f"images/{self.course_image}"
        return None
    
    class Config:
        from_attributes = True
        # Важно для включения вычисляемых полей
        computed = ["image_url"]

class CourseDetailResponse(CourseResponse):
    user_name: str
    
    class Config:
        from_attributes = True
