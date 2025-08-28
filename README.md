# TriangleOS

一个基于Electron和Next.js的沉浸式语音交互操作系统概念产品，集成了完整的AI驱动应用生态系统。

## 特性

- 🎯 **沉浸式全屏体验** - 隐藏系统菜单和工具栏，提供纯净的全屏界面
- 🗣️ **纯语音交互** - 支持中文语音识别和语音合成
- 🚀 **Next.js集成** - 现代React框架，支持静态导出
- 🤖 **AI驱动平台** - 集成CONSULT_AI项目的完整AI工具套件
- 🎨 **现代化界面** - Tailwind CSS v4 + shadcn/ui组件库
- 📱 **多应用生态** - 聊天、工作室、录音、设置等多个应用页面

## 项目结构

```
├── src/
│   ├── main-nextjs.cjs          # Electron主进程
│   ├── preload.js               # 预加载脚本
│   ├── app/                     # Next.js应用目录
│   │   ├── page.tsx             # 主页面
│   │   ├── chat/                # 聊天应用
│   │   ├── workstudio/          # 工作室应用
│   │   ├── recording/           # 录音应用
│   │   └── ...                  # 其他应用页面
│   ├── components/              # 共享React组件
│   └── lib/                     # 工具库
├── public/                      # 静态资源
├── out/                         # Electron构建输出
├── fix-electron-paths.cjs       # Electron路径修复脚本
└── next.config.js               # Next.js配置
```

## 安装和运行

### 环境要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发模式（支持热重载）：

```bash
npm run dev
```

此命令将同时启动Next.js开发服务器和Electron，支持实时重载。

### 生产构建

构建生产版本：

```bash
npm run build-for-electron
```

启动构建的应用：

```bash
npm start
```

## 可用脚本

- `npm run dev` - 开发模式（热重载）
- `npm run next-dev` - 仅启动Next.js开发服务器
- `npm run dev-nextjs` - 仅启动Electron开发模式
- `npm run next-build` - 构建Next.js生产版本
- `npm run build-for-electron` - 构建并修复Electron路径
- `npm start` - 启动生产Electron应用

## 内置应用

- **主页** - 带语音助手的主界面
- **聊天** - AI驱动的聊天界面
- **工作室** - 专业工作流管理
- **录音** - 音频录制与转录
- **设置** - 应用配置
- **项目** - 项目管理
- **数据库** - 数据管理界面
- **提示** - AI提示管理
- 等等...

## 语音命令

应用支持多种语音命令进行导航和控制，语音识别已集成到整个界面中，支持免手操作。

### 导航命令示例
- "打开聊天" - 跳转到聊天页面
- "打开工作室" - 跳转到工作室页面
- "打开设置" - 跳转到设置页面
- "返回主页" - 返回主界面

## 技术栈

- **Electron** - 桌面应用框架
- **Next.js 15** - React框架（App Router）
- **React 19** - 最新React版本（并发特性）
- **Tailwind CSS v4** - 现代实用优先CSS框架
- **shadcn/ui** - 高质量React组件库
- **TypeScript** - 类型安全开发
- **Web Speech API** - 语音识别和合成
- **Firebase** - 后端服务集成

## 环境变量

创建 `.env.local` 文件：

```env
SKIP_ENV_VALIDATION=1
NEXT_PUBLIC_STATIC_WEBSITE_ONLY=true
NODE_ENV=production
```

## 构建流程

应用使用专门的构建流程：

1. Next.js构建针对Electron优化的静态导出
2. 路径修复脚本将绝对路径转换为相对路径
3. Electron从 `out/` 目录加载静态文件

这确保了Next.js路由与Electron的 file:// 协议的兼容性。

## 开发说明

### 语音识别配置

语音识别使用浏览器原生的Web Speech API，支持：
- 连续识别
- 实时结果反馈
- 中文/英文语言切换
- 自动重启机制

### 安全特性

- 禁用Node.js集成
- 启用上下文隔离
- 防止外部URL导航
- 预加载脚本安全通信

### 界面设计

- 响应式布局适配不同屏幕尺寸
- 流畅的页面切换动画
- 实时语音状态可视化
- 现代化UI组件

## 系统要求

- Node.js 18+
- 支持Web Speech API的浏览器内核
- macOS / Windows / Linux

## 许可证

MIT License