@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set "RUN_SERVICES=1"
set "DB_READY=0"
if /I "%~1"=="--install-only" set "RUN_SERVICES=0"

echo.
echo ==========================================
echo  CareerPilot AI - Windows Local Setup
echo ==========================================
echo.

where py >nul 2>nul
if not errorlevel 1 (
    set "PY_CMD=py"
) else (
    where python >nul 2>nul
    if not errorlevel 1 (
        set "PY_CMD=python"
    ) else (
        echo [ERROR] Python was not found. Install Python 3.11+ and try again.
        pause
        exit /b 1
    )
)

if not exist ".venv\Scripts\python.exe" (
    echo [1/6] Creating Python virtual environment...
    %PY_CMD% -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Could not create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo [1/6] Python virtual environment already exists.
)

echo [2/6] Installing backend Python dependencies...
".venv\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 exit /b 1
".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
if errorlevel 1 exit /b 1
if exist "requirements.txt" (
    ".venv\Scripts\python.exe" -m pip install -r requirements.txt
    if errorlevel 1 exit /b 1
)

echo [3/6] Preparing environment files...
if not exist "backend\.env" (
    > "backend\.env" echo PROJECT_NAME=CareerPilot AI
    >> "backend\.env" echo API_V1_PREFIX=/api
    >> "backend\.env" echo DATABASE_URL=postgresql+asyncpg://careerpilot:careerpilot@localhost:5432/careerpilot
    >> "backend\.env" echo JWT_SECRET_KEY=change-this-local-secret-key
    >> "backend\.env" echo JWT_ALGORITHM=HS256
    >> "backend\.env" echo ACCESS_TOKEN_EXPIRE_MINUTES=1440
    >> "backend\.env" echo OPENAI_API_KEY=
    >> "backend\.env" echo OPENAI_MODEL=gpt-4o-2024-08-06
    >> "backend\.env" echo CORS_ORIGINS=http://localhost:3000
    >> "backend\.env" echo MAX_UPLOAD_SIZE_MB=10
    echo Created backend\.env
) else (
    echo backend\.env already exists.
)

if not exist "frontend\.env.local" (
    > "frontend\.env.local" echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
    echo Created frontend\.env.local
) else (
    echo frontend\.env.local already exists.
)

echo [4/6] Checking PostgreSQL database...
set "DOCKER_COMPOSE_CMD="
docker compose version >nul 2>nul
if not errorlevel 1 (
    set "DOCKER_COMPOSE_CMD=docker compose"
) else (
    docker-compose version >nul 2>nul
    if not errorlevel 1 set "DOCKER_COMPOSE_CMD=docker-compose"
)

if defined DOCKER_COMPOSE_CMD (
    echo Starting PostgreSQL with Docker Compose...
    %DOCKER_COMPOSE_CMD% up -d db
    if errorlevel 1 (
        echo [WARN] Docker Compose could not start PostgreSQL.
        echo        Make sure PostgreSQL is running on localhost:5432.
    )
) else (
    echo [WARN] Docker Compose was not found.
    echo        Make sure PostgreSQL is running on localhost:5432 with:
    echo        user=careerpilot password=careerpilot database=careerpilot
)

echo Checking PostgreSQL connection from backend\.env...
".venv\Scripts\python.exe" scripts\check_database.py --wait 20
if errorlevel 1 (
    set "DB_READY=0"
    echo.
    echo [WARN] PostgreSQL is not ready.
    echo        Backend database features will not work until it is running.
    echo        Register, login, CV upload and dashboard APIs require PostgreSQL.
    echo.
    echo        Default local database:
    echo        host=localhost port=5432 database=careerpilot user=careerpilot password=careerpilot
    echo.
    echo        If Docker Desktop is installed, run:
    echo        docker compose up -d db
    echo.
) else (
    set "DB_READY=1"
)

echo [5/6] Checking frontend dependencies...
where npm >nul 2>nul
if errorlevel 1 (
    echo [WARN] npm was not found. Frontend will not be started.
    set "SKIP_FRONTEND=1"
) else (
    if not exist "frontend\node_modules" (
        pushd frontend
        if exist "package-lock.json" (
            npm ci
        ) else (
            npm install
        )
        if errorlevel 1 (
            popd
            echo [ERROR] Frontend dependency installation failed.
            pause
            exit /b 1
        )
        popd
    ) else (
        echo frontend\node_modules already exists.
    )
)

if "%RUN_SERVICES%"=="0" (
    echo [6/6] Install-only mode complete.
    echo.
    echo To run later:
    echo   setup_venv_and_run.bat
    exit /b 0
)

echo [6/6] Starting local development servers...
echo.
if "%DB_READY%"=="1" (
    echo Backend:  http://localhost:8000
    echo Swagger:  http://localhost:8000/docs
) else (
    echo Backend:  not started because PostgreSQL is not ready
)
echo Frontend: http://localhost:3000
echo.
echo Note: CV upload analysis requires OPENAI_API_KEY in backend\.env.
echo.

if "%DB_READY%"=="1" (
    start "CareerPilot Backend" cmd /k "cd /d %CD%\backend && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

if not defined SKIP_FRONTEND (
    start "CareerPilot Frontend" cmd /k "cd /d %CD%\frontend && npm run dev"
    timeout /t 5 /nobreak >nul
    start http://localhost:3000
)

echo Local startup finished. Available services were started in separate windows.
pause
