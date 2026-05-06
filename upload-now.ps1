# ========================================
# 一键上传到 GitHub 并编译 APK
# ========================================
# 请在 PowerShell 中运行此脚本

# 进入项目目录
cd c:\Users\wjx\Documents\traesolo

# 初始化 Git
git init
git add .
git commit -m "Initial commit: B站视频下载器"

# 创建 GitHub 仓库并推送
gh repo create bilibili-downloader --public --source=. --remote=origin --push

# 提示设置 Expo Token
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "上传成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "接下来请设置 Expo Token 以启用自动构建：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 访问 https://expo.dev 注册账号" -ForegroundColor Cyan
Write-Host "2. 进入 Settings -> Access Tokens 创建 Token" -ForegroundColor Cyan
Write-Host "3. 运行以下命令设置 Token：" -ForegroundColor Cyan
Write-Host ""
Write-Host '   echo "你的TOKEN" | gh secret set EXPO_TOKEN' -ForegroundColor White
Write-Host ""
Write-Host "4. 访问仓库 Actions 页面查看构建状态" -ForegroundColor Cyan
Write-Host ""
