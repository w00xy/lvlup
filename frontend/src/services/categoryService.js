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