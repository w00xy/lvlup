const API_CONFIG = {
    // В режиме разработки
    development: {
        baseURL: 'http://localhost:8000'
    },
    // В продакшене (через Docker network)
    production: {
        baseURL: 'http://backend:8000'
    }
};

// Выбираем конфигурацию в зависимости от окружения
const currentEnv = import.meta.env.MODE || 'development';
export const API_URL = API_CONFIG[currentEnv].baseURL;
