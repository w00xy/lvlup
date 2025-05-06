from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LessonBase(BaseModel):
    lesson_num: int
    description: Optional[str] = None

class LessonCreate(LessonBase):
    course_id: int

class LessonUpdate(BaseModel):
    lesson_num: Optional[int] = None
    description: Optional[str] = None

class LessonResponse(LessonBase):
    lesson_id: int
    course_id: int
    lesson_image: Optional[str] = None
    
    class Config:
        from_attributes = True
