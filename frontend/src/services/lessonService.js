import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from '../utils/auth';

// Добавляем новую функцию для получения уроков по ID курса 
export const getLessonsByCourse = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/courses/${courseId}/lessons`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении уроков курса:', error);
        throw error;
    }
};

// Функция для определения следующего номера урока
export const getNextLessonNumber = async (courseId) => {
    try {
        // Получаем все уроки курса
        const lessons = await getLessonsByCourse(courseId);
        
        if (!lessons || lessons.length === 0) {
            return 1; // Если уроков нет, возвращаем 1
        }
        
        // Находим максимальный номер урока
        const maxLessonNum = Math.max(...lessons.map(lesson => lesson.lesson_num));
        
        // Возвращаем следующий номер
        return maxLessonNum + 1;
    } catch (error) {
        console.error('Ошибка при определении номера урока:', error);
        // В случае ошибки, вернем 1 как безопасное значение по умолчанию
        return 1;
    }
};

export const createLesson = async (lessonData) => {
    try {
        // Создаем объект FormData для отправки multipart/form-data
        const formData = new FormData();
        
        // Добавляем текстовые поля
        formData.append('course_id', lessonData.course_id);
        formData.append('lesson_num', lessonData.lesson_num);
        
        if (lessonData.description) {
            formData.append('description', lessonData.description);
        }
        
        // Добавляем изображение, если оно есть
        if (lessonData.image) {
            formData.append('image', lessonData.image);
        }
        
        // Отправляем запрос
        const response = await axios.post(`${API_URL}/lessons/`, formData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании урока:', error);
        throw error;
    }
};

// Функция для обновления данных урока
export const updateLesson = async (lessonId, lessonData) => {
    try {
        // Создаем объект FormData для отправки multipart/form-data
        const formData = new FormData();
        
        // Добавляем текстовые поля
        if (lessonData.lesson_num) {
            formData.append('lesson_num', lessonData.lesson_num);
        }
        
        if (lessonData.description) {
            formData.append('description', lessonData.description);
        }
        
        // Добавляем изображение, если оно есть и не является строкой (URL)
        if (lessonData.image && typeof lessonData.image !== 'string') {
            formData.append('image', lessonData.image);
        }
        
        // Отправляем запрос
        const response = await axios.put(`${API_URL}/lessons/${lessonId}`, formData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении урока:', error);
        throw error;
    }
};

// Добавим функцию для получения данных урока по ID
export const getLessonById = async (lessonId) => {
    try {
        const response = await axios.get(`${API_URL}/lessons/${lessonId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении данных урока:', error);
        throw error;
    }
};

export const getCourseLessons = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/courses/${courseId}/lessons`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении уроков курса:', error);
        throw error;
    }
};

// Функция для удаления урока
export const deleteLesson = async (lessonId) => {
    try {
        const response = await axios.delete(`${API_URL}/lessons/${lessonId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении урока:', error);
        throw error;
    }
}; 