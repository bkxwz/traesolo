@echo off
chcp 65001 >nul
echo ========================================
echo 生成原生 Android 项目
echo ========================================
echo.

echo [1/3] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo [2/3] 生成原生 Android 项目...
call npx expo prebuild --platform android
if %errorlevel% neq 0 (
    echo 错误: 生成失败
    pause
    exit /b 1
)

echo [3/3] 完成！
echo.
echo ========================================
echo 原生 Android 项目已生成！
echo ========================================
echo.
echo 现在可以用 Android Studio 打开:
echo   %cd%\android
echo.
echo 或使用 Gradle 构建 APK:
echo   cd android
echo   .\gradlew assembleRelease
echo.
pause
