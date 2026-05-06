@echo off
chcp 65001 >nul
echo ========================================
echo B站视频下载器 - 完整部署脚本
echo ========================================
echo.

REM 检查 Git
echo [1/7] 检查 Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Git
    echo 请确保 Git 已安装并添加到系统 PATH
    echo 下载地址: https://git-scm.com/downloads
    pause
    exit /b 1
)
echo ✓ Git 已安装

REM 检查 Node.js
echo [2/7] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js
    echo 请从 https://nodejs.org 下载并安装 Node.js
    pause
    exit /b 1
)
echo ✓ Node.js 已安装

REM 检查 GitHub CLI
echo [3/7] 检查 GitHub CLI...
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未检测到 GitHub CLI
    echo 正在尝试使用 winget 安装...
    winget install --id GitHub.cli --silent
    if %errorlevel% neq 0 (
        echo 请手动安装 GitHub CLI: https://cli.github.com/
        pause
        exit /b 1
    )
)
echo ✓ GitHub CLI 已安装

REM 检查 GitHub CLI 认证
echo [4/7] 检查 GitHub CLI 认证...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo 需要登录 GitHub...
    gh auth login
    if %errorlevel% neq 0 (
        echo 登录失败，请重试
        pause
        exit /b 1
    )
)
echo ✓ GitHub CLI 已认证

REM 安装项目依赖
echo [5/7] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)
echo ✓ 依赖安装完成

REM 初始化 Git 仓库
echo [6/7] 初始化 Git 仓库...
if not exist .git (
    git init
    git add .
    git commit -m "Initial commit: B站视频下载器"
    echo ✓ Git 仓库初始化完成
) else (
    echo ✓ Git 仓库已存在
)

REM 创建 GitHub 仓库并推送
echo [7/7] 创建 GitHub 仓库并推送代码...
echo.
echo 请输入仓库名称 (直接回车使用默认名称 bilibili-downloader):
set /p REPO_NAME=
if "%REPO_NAME%"=="" set REPO_NAME=bilibili-downloader

echo.
echo 选择仓库可见性:
echo 1. Public (公开)
echo 2. Private (私有)
set /p VISIBILITY_CHOICE="请选择 (1/2): "

if "%VISIBILITY_CHOICE%"=="2" (
    set VISIBILITY=--private
    echo 已选择: 私有仓库
) else (
    set VISIBILITY=--public
    echo 已选择: 公开仓库
)

echo.
echo 正在创建仓库 %REPO_NAME%...
gh repo create %REPO_NAME% %VISIBILITY% --source=. --remote=origin --push
if %errorlevel% neq 0 (
    echo 错误: 创建仓库失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 部署成功！
echo ========================================
echo.

REM 获取仓库 URL
for /f "tokens=*" %%i in ('gh repo view --json url -q ".url"') do set REPO_URL=%%i
echo 仓库地址: %REPO_URL%
echo.

REM 询问是否设置 Expo Token
echo 是否要配置 Expo Token 以启用自动构建 APK?
echo (需要 Expo 账号，可在 https://expo.dev 注册)
set /p SETUP_EXPO="输入 y 继续，其他键跳过: "

if /i "%SETUP_EXPO%"=="y" (
    echo.
    echo 请输入你的 Expo Access Token:
    echo (可在 https://expo.dev/accounts/你的用户名/settings/access-tokens 获取)
    set /p EXPO_TOKEN="Token: "
    
    if not "%EXPO_TOKEN%"=="" (
        echo 正在设置 EXPO_TOKEN secret...
        echo %EXPO_TOKEN% | gh secret set EXPO_TOKEN
        if %errorlevel% neq 0 (
            echo 警告: 设置 Secret 失败，请手动在 GitHub 仓库设置中添加
        ) else (
            echo ✓ EXPO_TOKEN 已设置
        )
    )
)

echo.
echo ========================================
echo 后续步骤:
echo ========================================
echo 1. 访问你的仓库: %REPO_URL%
echo 2. 点击 Actions 标签查看构建状态
echo 3. 构建完成后在 Artifacts 中下载 APK
echo.
echo 如果没有设置 Expo Token:
echo - 在仓库 Settings ^> Secrets and variables ^> Actions
echo - 添加名为 EXPO_TOKEN 的 secret
echo - 推送新代码触发构建: git commit --allow-empty -m "Trigger build" ^&^& git push
echo.
echo ========================================
pause
