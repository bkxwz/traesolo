@echo off
echo ========================================
echo B站视频下载器 - GitHub 部署脚本
echo ========================================
echo.

echo [1/5] 检查 Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装 Git
    echo 请从 https://git-scm.com/downloads 下载并安装 Git
    pause
    exit /b 1
)

echo [2/5] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js
    echo 请从 https://nodejs.org 下载并安装 Node.js
    pause
    exit /b 1
)

echo [3/5] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo [4/5] 初始化 Git 仓库...
if not exist .git (
    git init
    git add .
    git commit -m "Initial commit: B站视频下载器"
)

echo [5/5] 准备推送到 GitHub...
echo.
echo 请按照以下步骤操作:
echo 1. 访问 https://github.com/new 创建新仓库
echo 2. 仓库名称: bilibili-downloader
echo 3. 不要勾选 "Add a README file"
echo 4. 点击 "Create repository"
echo 5. 复制仓库 URL (例如: https://github.com/你的用户名/bilibili-downloader.git)
echo.

set /p REPO_URL="请输入你的 GitHub 仓库 URL: "

git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ========================================
echo 部署完成！
echo.
echo 接下来请:
echo 1. 访问 https://expo.dev 创建账号并获取 Access Token
echo 2. 在 GitHub 仓库的 Settings ^> Secrets 中添加 EXPO_TOKEN
echo 3. 推送代码后会自动触发 APK 构建
echo.
echo 详细说明请查看 DEPLOY.md 文件
echo ========================================
pause
