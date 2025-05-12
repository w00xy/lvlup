import axios from 'axios';
import { API_URL } from '../config/api';
import { getToken } from '../utils/auth';

export const getCategories = async (skip = 0, limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/categories`, {
      params: { skip, limit },
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    throw error;
  }
}; 

export const getCategoryByName = async (name) => {
  try {
    const response = await axios.get(`${API_URL}/categories/name/${name}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Категория не найдена
      return null;
    }
    console.error('Ошибка при поиске категории:', error);
    throw error;
  }
}; 

export const createCategory = async (name, description) => {
  try {
    const response = await axios.post(
      `${API_URL}/categories/`,
      { name, description },
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    throw error;
  }
}; 