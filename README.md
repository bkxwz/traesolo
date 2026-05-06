# B站视频下载器 - Android App

一个简洁高效的B站视频下载安卓应用，支持直接下载包含音画的完整视频。

## 功能特点

- 🎬 一键解析B站视频链接
- 🎯 直接下载已合并的音画视频（无需分离下载再合并）
- 🎨 支持多种画质选择
- 📱 美观的深色主题界面
- 📂 下载历史管理
- 🎵 支持视频播放和分享
- 🗑️ 删除管理功能

## 技术栈

- React Native + Expo
- React Navigation
- AsyncStorage
- Expo File System
- Expo Media Library

## 项目结构

```
.
├── App.js                          # 主应用入口
├── package.json                    # 依赖配置
├── app.json                        # Expo配置
├── babel.config.js                 # Babel配置
├── src/
│   ├── services/
│   │   ├── bilibiliParser.js       # B站视频解析模块
│   │   ├── downloadManager.js      # 下载管理器
│   │   └── storageManager.js       # 本地存储管理
│   └── screens/
│       ├── HomeScreen.js           # 主页面
│       └── HistoryScreen.js        # 下载历史页面
└── .trae/
    └── documents/
        ├── prd.md                  # 产品需求文档
        └── arch.md                 # 技术架构文档
```

## 安装和运行

### 前置要求

- Node.js (v14 或更高版本)
- Expo CLI

### 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 在Android设备上运行：
```bash
npm run android
```

## 使用说明

1. 打开应用
2. 在输入框中粘贴B站视频链接
3. 点击"解析视频"按钮
4. 选择需要的视频画质
5. 点击"下载视频"开始下载
6. 下载完成后可在"下载历史"中查看和管理

## 自动构建 APK

本项目支持通过 GitHub Actions 自动编译生成 APK 文件。

### 快速开始

1. **部署到 GitHub**:
   ```bash
   # Windows 用户可以直接运行
   deploy-github.bat
   
   # 或手动执行
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/bilibili-downloader.git
   git push -u origin main
   ```

2. **配置 Expo Token**:
   - 访问 https://expo.dev 创建账号
   - 获取 Access Token
   - 在 GitHub 仓库 Settings → Secrets 中添加 `EXPO_TOKEN`

3. **下载 APK**:
   - 推送代码后自动触发构建
   - 在 Actions 页面下载生成的 APK

详细说明请查看 [DEPLOY.md](DEPLOY.md)

### 本地构建

```bash
# Windows 用户可以直接运行
build-local.bat

# 或手动执行
npm install
npm install -g eas-cli
eas login
eas build --platform android --profile preview --local
```

## 注意事项

- 本应用仅供学习和个人使用
- 请遵守B站的用户协议和相关法律法规
- 下载的视频仅供个人观看，请勿用于商业用途
- Expo 免费账户每月有 30 次构建限制

## 开发说明

### 核心模块

- **bilibiliParser**: 负责解析B站视频信息和获取视频地址
- **downloadManager**: 管理视频下载过程
- **storageManager**: 管理本地存储的下载历史记录

### 界面设计

- 主色调采用B站标志性粉色 (#FB7299)
- 深色主题设计，护眼且美观
- 响应式布局，适配各种屏幕尺寸
