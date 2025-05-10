import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from '../utils/auth';

export const getCourses = async ({ skip = 0, limit = 100, category_id = null, user_id = null } = {}) => {
    try {
        // Формируем параметры запроса
        const params = {};
        if (skip) params.skip = skip;
        if (limit) params.limit = limit;
        if (category_id) params.category_id = category_id;
        if (user_id) params.user_id = user_id;

        const response = await axios.get(`${API_URL}/courses/my`, {
            params,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Ошибка при получении курсов:', error);
        throw error;
    }
};

export const createCourse = async (courseData) => {
    try {
        // Создаем объект FormData для отправки multipart/form-data
        const formData = new FormData();
        
        // Добавляем текстовые поля
        formData.append('course_name', courseData.title);
        formData.append('category_id', courseData.category_id);
        
        // Отправляем дату в ISO формате (с временем)
        if (courseData.startDate) {
            formData.append('start_date', courseData.startDate);
        }
        
        if (courseData.endDate) {
            formData.append('end_date', courseData.endDate);
        }
        
        // Добавляем изображение, если оно есть
        if (courseData.image) {
            formData.append('image', courseData.image);
        }
        
        // Отправляем запрос
        const response = await axios.post(`${API_URL}/courses/`, formData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании курса:', error);
        throw error;
    }
}; 