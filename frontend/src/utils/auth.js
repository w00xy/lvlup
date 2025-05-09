import { API_URL } from '../config/api';

// Функция для получения токена
export const getAuthToken = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Ошибка авторизации');
    }

    return response.json();
};

// Функция для сохранения токена
export const saveToken = (token) => {
    document.cookie = `access_token=${token}; path=/; max-age=3600; SameSite=Strict`;
};

// Функция для получения токена из куки
export const getToken = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Функция для удаления токена
export const removeToken = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
};
