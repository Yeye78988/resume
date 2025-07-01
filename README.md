# 个人简历生成器 Pro

这是一个经过深度优化的在线简历生成器。它不仅拥有一个现代、专业的前端界面，还配备了一个健壮的后端服务，能够将您的简历数据实时、持久地存储在 MongoDB 数据库中。

## ✨ 特性

- **✍️ 在线编辑**: 实时修改简历内容，所见即所得。
- **🚀 持久化存储**: 基于 Node.js + Express + MongoDB 的后端，确保您的数据安全不丢失。
- **💾 自动保存**: 您每一次的修改都会被自动同步到云端，并有清晰的状态提示。
- **📄 多种模板**: 内置多种简历模板，并支持轻松切换。
- **⬇️ 一键下载**: 可随时将您的简历下载为 PDF 格式。

## 🛠️ 技术栈

- **前端**:
  - React
  - Gatsby.js (v2)
  - TypeScript
  - Ant Design
- **后端**:
  - Node.js
  - Express.js
  - MongoDB
- **包管理器**: pnpm

## 🚀 启动项目

在开始之前，请确保您的电脑上已经安装了 [Node.js](https://nodejs.org/)、[pnpm](https://pnpm.io/installation) 和 [MongoDB](https://www.mongodb.com/try/download/community)。

### 1. 克隆仓库

```bash
git clone [你的仓库地址]
cd resume
```

### 2. 安装依赖

本项目推荐使用 `pnpm` 进行依赖管理。

```bash
pnpm install
```

### 3. 启动后端服务

> **重要**: 请确保您的 MongoDB 服务已经在此之前启动。

打开一个**新的终端**，在项目根目录下运行以下命令来启动后端 API 服务：

```bash
node server.js
```

您应该会看到 `Server running at http://localhost:3001` 的提示，请**保持这个终端窗口不要关闭**。

### 4. 启动前端开发环境

回到**原来的终端**，运行以下命令来启动前端开发服务器：

```bash
pnpm start
```

现在，您可以在浏览器中打开 [http://localhost:8000](http://localhost:8000) 来访问和编辑您的简历了！

## 📁 项目结构

```
.
├── server.js           # 后端服务入口文件
├── package.json        # 项目依赖与脚本
├── gatsby-config.js    # Gatsby 配置文件
├── src/                # 前端源代码目录
│   ├── components/     # 可复用的 React 组件
│   ├── layout/         # 页面布局组件 (头部、页脚)
│   ├── pages/          # 页面级组件
│   ├── data/           # 初始简历数据
│   └── styles/         # 全局样式
└── ...
```

##🤝 贡献

欢迎通过提交 Pull Requests 或 Issues 来为这个项目做出贡献！
