FROM node:20-alpine

WORKDIR /app

# Установка зависимостей
COPY frontend/package*.json ./
RUN npm install

# Копирование исходного кода
COPY frontend/ .

# Открываем порт для Vite
EXPOSE 5173

# Запускаем в режиме разработки
CMD ["npm", "run", "dev", "--", "--host"]
