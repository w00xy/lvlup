FROM python:3.12-slim

# Установка зависимостей для сборки
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

# Установка uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

COPY --from=ghcr.io/astral-sh/uv:0.7.2 /uv /uvx /bin/

# Добавление uv в PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Настройка рабочей директории
WORKDIR /app

# Копирование файла pyproject.toml из backend директории
COPY backend/pyproject.toml .
COPY backend/uv.lock .

# Установка зависимостей через uv из pyproject.toml
RUN uv sync --no-cache

# Копирование кода приложения
COPY backend/ .

# Открываем порт
EXPOSE 8000

CMD ["uv", "run", "python", "app/main.py"]