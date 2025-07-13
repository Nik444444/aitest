# 📋 German Letter AI Assistant - Пошаговая инструкция настройки

Этот гид поможет вам запустить приложение **German Letter AI Assistant** с Google OAuth авторизацией на вашем компьютере.

## 🎯 Что это за приложение?

**German Letter AI Assistant** - это веб-приложение, которое помогает анализировать немецкие официальные письма с помощью искусственного интеллекта. Приложение:
- 📄 Анализирует PDF файлы и изображения писем
- 🤖 Использует ИИ для объяснения содержания
- 🌍 Поддерживает русский, английский и немецкий языки
- 🔐 Имеет Google OAuth авторизацию для упрощения входа
- 📱 Адаптировано для мобильных устройств

---

## 📋 Что нужно установить

### 1. Установите Python 3.8+
```bash
# Проверьте версию Python
python --version

# Если Python не установлен, скачайте с https://python.org
```

### 2. Установите Node.js 18+
```bash
# Проверьте версию Node.js
node --version

# Если Node.js не установлен, скачайте с https://nodejs.org
```

### 3. Установите MongoDB
**Для Windows:**
1. Скачайте MongoDB Community с https://www.mongodb.com/try/download/community
2. Установите и запустите службу MongoDB

**Для macOS:**
```bash
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Для Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 4. Установите Tesseract OCR
**Для Windows:**
1. Скачайте с https://github.com/UB-Mannheim/tesseract/wiki
2. Установите, запомните путь установки
3. Добавьте путь в переменную PATH

**Для macOS:**
```bash
brew install tesseract
brew install tesseract-lang
```

**Для Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install tesseract-ocr-deu  # Немецкий язык
sudo apt install tesseract-ocr-eng  # Английский язык
```

---

## 🔑 Получение API ключей

### 1. Google OAuth настройка

1. **Перейдите в Google Cloud Console:**
   - Откройте https://console.cloud.google.com/
   - Войдите в свой Google аккаунт

2. **Создайте новый проект или выберите существующий:**
   - Нажмите на селектор проекта вверху
   - Нажмите "NEW PROJECT" если нужен новый проект
   - Введите имя проекта (например, "German Letter AI")

3. **Включите Google+ API:**
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google+ API" и включите его
   - Также включите "Google OAuth2 API"

4. **Настройте OAuth consent screen:**
   - Перейдите в "APIs & Services" > "OAuth consent screen"
   - Выберите "External" если это для тестирования
   - Заполните обязательные поля:
     - App name: "German Letter AI Assistant"
     - User support email: ваш email
     - Developer contact: ваш email

5. **Создайте OAuth credentials:**
   - Перейдите в "APIs & Services" > "Credentials"
   - Нажмите "Create Credentials" > "OAuth client ID"
   - Выберите "Web application"
   - Введите название: "German Letter AI Web Client"
   - Authorized redirect URIs:
     - `http://localhost:8001/api/auth/google/callback`
     - `https://your-domain.com/api/auth/google/callback` (для продакшена)
   - Сохраните **Client ID** и **Client Secret**

### 2. AI API ключи (опционально)

Пользователи могут добавлять свои ключи, но вы можете настроить системные:

**Google Gemini API:**
1. Перейдите на https://makersuite.google.com/app/apikey
2. Создайте API ключ
3. Скопируйте ключ

**OpenAI API:**
1. Перейдите на https://platform.openai.com/api-keys
2. Создайте API ключ
3. Скопируйте ключ

**Anthropic Claude API:**
1. Перейдите на https://console.anthropic.com/
2. Создайте API ключ
3. Скопируйте ключ

---

## ⚙️ Настройка проекта

### 1. Скачайте проект
```bash
# Если у вас есть git
git clone <your-repo-url>
cd german-letter-ai-assistant

# Или скачайте ZIP файл и распакуйте
```

### 2. Настройте Backend

```bash
# Перейдите в папку backend
cd backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте окружение
# Для Windows:
venv\Scripts\activate
# Для macOS/Linux:
source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
cp .env.example .env
```

**Отредактируйте файл `backend/.env`:**
```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=german_letter_ai

# JWT Configuration (сгенерируйте случайные строки)
JWT_SECRET_KEY=ваш-супер-секретный-ключ-jwt
SESSION_SECRET_KEY=ваш-секретный-ключ-сессии

# Encryption for API Keys (сгенерируйте случайную строку)
ENCRYPTION_KEY=ваш-ключ-шифрования

# Google OAuth Configuration (вставьте ваши ключи)
GOOGLE_CLIENT_ID=ваш-google-client-id
GOOGLE_CLIENT_SECRET=ваш-google-client-secret

# Frontend URL
REACT_APP_FRONTEND_URL=http://localhost:3000

# AI API Keys (опционально)
GEMINI_API_KEY=ваш-gemini-ключ
OPENAI_API_KEY=ваш-openai-ключ
ANTHROPIC_API_KEY=ваш-anthropic-ключ
```

### 3. Настройте Frontend

```bash
# Откройте новый терминал и перейдите в папку frontend
cd frontend

# Установите зависимости
yarn install

# Создайте .env файл
cp .env.example .env
```

**Отредактируйте файл `frontend/.env`:**
```env
# Backend URL (оставьте как есть для локальной разработки)
REACT_APP_BACKEND_URL=http://localhost:8001

# Google OAuth Client ID (тот же, что в backend)
REACT_APP_GOOGLE_CLIENT_ID=ваш-google-client-id

# WebSocket port
WDS_SOCKET_PORT=443
```

---

## 🚀 Запуск приложения

### 1. Запустите MongoDB
```bash
# Убедитесь, что MongoDB запущен
# Windows: проверьте службы Windows
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongodb
```

### 2. Запустите Backend
```bash
# В папке backend (с активированным venv)
cd backend
python server.py

# Вы должны увидеть:
# INFO:     Uvicorn running on http://0.0.0.0:8001
```

### 3. Запустите Frontend
```bash
# В новом терминале, в папке frontend
cd frontend
yarn start

# Браузер автоматически откроет http://localhost:3000
```

---

## 🧪 Тестирование приложения

### 1. Проверьте подключение к backend
- Откройте http://localhost:8001/api/health
- Должно показать: `{"status":"healthy"}`

### 2. Проверьте статус AI провайдеров
- Откройте http://localhost:8001/api/llm-status
- Увидите статус всех AI сервисов

### 3. Протестируйте авторизацию
1. Откройте http://localhost:3000
2. Нажмите "Войти через Google"
3. Авторизуйтесь через Google
4. Должны попасть в главное приложение

### 4. Протестируйте анализ документов
1. Найдите немецкий документ (PDF или изображение)
2. Загрузите его в приложение
3. Выберите язык анализа
4. Нажмите "Анализировать"
5. Получите результат анализа

---

## 🔧 Устранение проблем

### Проблема: MongoDB не подключается
```bash
# Проверьте статус MongoDB
# Windows: 
services.msc -> найдите MongoDB

# macOS:
brew services list | grep mongodb

# Linux:
sudo systemctl status mongodb

# Если не запущен, запустите:
sudo systemctl start mongodb
```

### Проблема: Tesseract не найден
```bash
# Убедитесь, что tesseract в PATH
tesseract --version

# Для Windows: добавьте путь C:\Program Files\Tesseract-OCR в PATH
# Для Linux/macOS: переустановите через пакетный менеджер
```

### Проблема: Google OAuth не работает
1. Проверьте правильность Client ID и Client Secret
2. Убедитесь, что redirect URI правильный в Google Console
3. Проверьте, что Google+ API включен
4. Очистите cookies браузера

### Проблема: AI анализ не работает
1. Проверьте API ключи в .env файле
2. Убедитесь в наличии интернет соединения
3. Проверьте лимиты на AI API ключах
4. Посмотрите логи backend для ошибок

### Проблема: Ошибки установки зависимостей
```bash
# Для Python зависимостей:
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Для Node.js зависимостей:
yarn cache clean
yarn install --force
```

---

## 📁 Структура проекта

```
german-letter-ai-assistant/
├── backend/                    # FastAPI сервер
│   ├── server.py              # Основной сервер
│   ├── models.py              # Модели данных
│   ├── auth.py                # Аутентификация
│   ├── llm_manager.py         # Менеджер AI провайдеров
│   ├── requirements.txt       # Python зависимости
│   └── .env                   # Переменные окружения
├── frontend/                  # React приложение
│   ├── src/
│   │   ├── App.js            # Главный компонент
│   │   ├── components/       # React компоненты
│   │   └── context/          # React контексты
│   ├── package.json          # Node.js зависимости
│   └── .env                  # Переменные окружения
└── SETUP_INSTRUCTIONS.md     # Этот файл
```

---

## 🌐 Деплой на сервер

Для деплоя на продакшн сервер:

1. **Настройте домен и SSL**
2. **Обновите redirect URI в Google Console**
3. **Измените .env файлы** с продакшн URL
4. **Используйте процесс-менеджер** (PM2, systemd)
5. **Настройте reverse proxy** (Nginx, Apache)
6. **Настройте базу данных** (MongoDB Atlas или локальный)

---

## 📞 Поддержка

Если у вас возникли проблемы:

1. **Проверьте логи:**
   - Backend: смотрите терминал где запущен `python server.py`
   - Frontend: смотрите терминал где запущен `yarn start`
   - Browser: откройте Developer Tools (F12) > Console

2. **Распространенные ошибки:**
   - Порт уже занят: измените порт в настройках
   - Модуль не найден: переустановите зависимости
   - База данных недоступна: проверьте MongoDB

3. **Проверьте версии:**
   ```bash
   python --version    # должно быть 3.8+
   node --version      # должно быть 18+
   yarn --version      # должно быть 1.22+
   ```

---

## ✅ Готово!

После выполнения всех шагов у вас будет работающее приложение **German Letter AI Assistant** с:

- ✅ Google OAuth авторизацией
- ✅ Анализом немецких документов
- ✅ Поддержкой множества AI провайдеров
- ✅ Красивым мобильным интерфейсом
- ✅ Безопасным хранением API ключей

**Приложение готово к использованию!** 🎉