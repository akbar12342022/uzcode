@echo off
title UzCode
cd /d "%~dp0"
echo.
echo [1/3] Baza konteyneri yoqilmoqda...
call docker compose up -d
echo.
echo [2/3] Kutubxonalar tekshirilmoqda (birinchi marta birmuncha vaqt oladi)...
call npm install
echo.
echo [3/3] Sayt ishga tushirilmoqda: http://localhost:3000
echo Toxtatish uchun: Ctrl+C
echo.
call npm run dev
pause
