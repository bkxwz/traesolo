@echo off
echo ========================================
echo B站视频下载器 - 本地构建脚本
echo ========================================
echo.

echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js
    echo 请从 https://nodejs.org 下载并安装 Node.js
    pause
    exit /b 1
)

echo [2/4] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo [3/4] 检查 EAS CLI...
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 未安装 EAS CLI，正在安装...
    call npm install -g eas-cli
)

echo [4/4] 开始构建 APK...
echo 请确保你已经登录 Expo 账号
echo 如果未登录，请运行: eas login
echo.

call eas build --platform android --profile preview --local

echo.
echo ========================================
echo 构建完成！
echo APK 文件位于当前目录
echo ========================================
pause
