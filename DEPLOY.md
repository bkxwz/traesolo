# GitHub 部署和自动编译 APK 指南

## 前置要求

1. 安装 [Git](https://git-scm.com/downloads)
2. 安装 [Node.js](https://nodejs.org/) (v14 或更高版本)
3. 拥有 [GitHub](https://github.com) 账号
4. 拥有 [Expo](https://expo.dev) 账号

## 步骤 1: 安装依赖

```bash
cd c:\Users\wjx\Documents\traesolo
npm install
```

## 步骤 2: 初始化 Git 仓库

```bash
git init
git add .
git commit -m "Initial commit: B站视频下载器"
```

## 步骤 3: 创建 GitHub 仓库

### 方法 A: 使用 GitHub CLI (推荐)

如果你安装了 GitHub CLI (`gh`):

```bash
gh repo create bilibili-downloader --public --source=. --push
```

### 方法 B: 手动创建

1. 访问 https://github.com/new
2. 创建新仓库，名称: `bilibili-downloader`
3. 不要勾选 "Add a README file"
4. 点击 "Create repository"
5. 在本地运行:

```bash
git remote add origin https://github.com/你的用户名/bilibili-downloader.git
git branch -M main
git push -u origin main
```

## 步骤 4: 配置 Expo Token

### 4.1 获取 Expo Token

1. 访问 https://expo.dev/accounts/你的用户名/settings/access-tokens
2. 点击 "Create Token"
3. 复制生成的 token

### 4.2 添加到 GitHub Secrets

1. 进入你的 GitHub 仓库页面
2. 点击 "Settings" → "Secrets and variables" → "Actions"
3. 点击 "New repository secret"
4. Name: `EXPO_TOKEN`
5. Value: 粘贴你的 Expo token
6. 点击 "Add secret"

## 步骤 5: 触发自动构建

### 方法 A: 推送代码触发

```bash
git commit --allow-empty -m "Trigger build"
git push
```

### 方法 B: 手动触发

1. 进入 GitHub 仓库页面
2. 点击 "Actions" 标签
3. 选择 "Build Android APK" 工作流
4. 点击 "Run workflow" → "Run workflow"

## 步骤 6: 下载 APK

1. 等待 GitHub Actions 构建完成 (约 10-20 分钟)
2. 构建完成后，在 Actions 页面点击对应的工作流运行
3. 在 "Artifacts" 部分下载 `app-apk`
4. 解压后得到 `app.apk` 文件

## 替代方案: 使用 EAS CLI 本地构建

如果你想在本地构建 APK:

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo
eas login

# 配置项目
eas build:configure

# 构建 APK
eas build --platform android --profile preview
```

构建完成后，可以在 Expo 控制台下载 APK。

## 常见问题

### Q: 构建失败怎么办?

检查 GitHub Actions 的日志，常见原因:
- `EXPO_TOKEN` 未正确设置
- 依赖安装失败
- Expo 配置错误

### Q: 如何更新应用?

```bash
git add .
git commit -m "Update app"
git push
```

推送后会自动触发新的构建。

### Q: 如何修改应用图标?

1. 替换 `assets/icon.png` (1024x1024)
2. 替换 `assets/adaptive-icon.png` (1024x1024)
3. 替换 `assets/splash.png` (1284x2778)
4. 提交并推送更改

## 注意事项

- Expo 免费账户每月有 30 次构建限制
- APK 文件会在 GitHub Actions 中保留 30 天
- 首次构建可能需要较长时间
