# ========================================
# B站视频下载器 - GitHub 上传命令
# ========================================

# 1. 进入项目目录
cd c:\Users\wjx\Documents\traesolo

# 2. 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: B站视频下载器"

# 3. 创建 GitHub 仓库并推送 (使用 gh CLI)
# 公开仓库:
gh repo create bilibili-downloader --public --source=. --remote=origin --push

# 或私有仓库:
# gh repo create bilibili-downloader --private --source=. --remote=origin --push

# 4. 设置 Expo Token (可选，用于自动构建 APK)
# 先获取你的 Expo Token: https://expo.dev/accounts/你的用户名/settings/access-tokens
# 然后运行:
# echo "你的EXPO_TOKEN" | gh secret set EXPO_TOKEN

# 5. 触发构建 (如果没有自动触发)
# git commit --allow-empty -m "Trigger build"
# git push

# ========================================
# 完整一键命令 (复制粘贴运行)
# ========================================

<#
cd c:\Users\wjx\Documents\traesolo
git init
git add .
git commit -m "Initial commit: B站视频下载器"
gh repo create bilibili-downloader --public --source=. --remote=origin --push
#>
