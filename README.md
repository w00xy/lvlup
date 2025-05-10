# LvlUp - Платформа для онлайн-обучения

LvlUp (SkillLvlUp) — это веб-приложение для создания и управления образовательными курсами, разработанное с использованием Python FastAPI для бэкенда и React с JavaScript для фронтенда.

## О проекте

LvlUp предоставляет возможность создавать и управлять образовательными курсами. Платформа позволяет пользователям регистрироваться, создавать свои курсы, разбивать их на уроки.

### Основной функционал:

- **Управление пользователями**: регистрация, авторизация, просмотр профиля
- **Работа с категориями**: создание и просмотр категорий курсов
- **Управление курсами**: создание, редактирование, удаление и просмотр курсов
- **Уроки**: добавление уроков к курсам, управление содержимым
- **Загрузка изображений**: возможность добавлять изображения к курсам и урокам
- **Современный UI**: удобный и интуитивно понятный интерфейс

## Технический стек

### Бэкенд:
- Python 3.12+
- FastAPI
- SQLAlchemy (асинхронный)
- Alembic для миграций
- SQLite (для демонстрации, можно заменить на другую СУБД)
- JWT аутентификация

### Фронтенд:
- React
- JavaScript
- Vite
- React Router
- Axios для работы с API

### Инфраструктура:
- Docker и Docker Compose для контейнеризации
- uv для управления Python зависимостями
- npm для управления frontend зависимостями

## Запуск приложения

### Используя Docker Compose (рекомендуемый способ)

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/yourusername/lvlup.git
   cd lvlup
   ```

2. Создайте файл `.env` в директории `backend/app/`:
   ```
   SECRET_KEY=your_secret_key
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   EMAIL=admin@example.com
   ```

3. Запустите контейнеры с помощью Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Приложение будет доступно по адресам:
   - Бэкенд: http://localhost:8000
   - Фронтенд: http://localhost:5173

### Запуск без Docker (для разработки)

#### Запуск бэкенда:

1. Перейдите в корневую директорию проекта:
   ```bash
   cd lvlup
   ```

2. Создайте файл `.env` в директории `backend/app/`:
   ```
   SECRET_KEY=your_secret_key
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   EMAIL=admin@example.com
   ```

3. Установите uv, если у вас его еще нет:
   ```bash
   curl -sSf https://astral.sh/uv/install.sh | sh
   ```

4. Запустите бэкенд:
   ```bash
   uv run backend/app/main.py
   ```

5. Сервер будет доступен по адресу http://localhost:8000

#### Запуск фронтенда:

1. Перейдите в директорию фронтенда:
   ```bash
   cd lvlup/frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите dev-сервер:
   ```bash
   npm run dev
   ```

4. Фронтенд будет доступен по адресу http://localhost:5173

## Структура проекта

### Бэкенд:
- `/backend/app/api/` - API эндпоинты
- `/backend/app/core/` - Основные настройки приложения
- `/backend/app/database/` - Модели данных, репозитории и сессии
- `/backend/app/schemas/` - Pydantic схемы для валидации данных
- `/backend/app/utils/` - Вспомогательные функции

### Фронтенд:
- `/frontend/src/components/` - React компоненты
- `/frontend/src/pages/` - Страницы приложения
- `/frontend/src/services/` - Сервисы для работы с API
- `/frontend/src/utils/` - Вспомогательные функции

## Разработка

### Миграции базы данных

Для создания новых миграций используйте Alembic:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Лицензия

[MIT](LICENSE)