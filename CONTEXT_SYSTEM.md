# Triangle OS Context System

## 概述

Triangle OS Context System 是一个全局上下文管理系统，用于在页面跳转时传递动态参数。它解决了语音操作系统中需要根据用户当前状态进行智能导航的问题。

## 核心特性

### 🔧 全局Context管理
- **统一状态管理**: 通过`NavigationContextManager`统一管理所有导航相关的状态
- **实时更新**: 支持Context的实时监听和更新
- **持久化**: 重要的Context信息可以跨页面保持

### 🎯 参数占位符系统
- **灵活配置**: 页面URL支持`{paramName}`格式的占位符
- **自动替换**: 导航时自动从Context中提取参数替换占位符
- **验证机制**: 支持必需参数和可选参数的验证

### 📱 应用配置集成
- **声明式配置**: 在`AppConfig`中声明页面所需的参数
- **智能解析**: 自动检查参数完整性并提供默认值
- **错误处理**: 缺失参数时的优雅降级

## 系统架构

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  NavigationContext  │────│   RuntimeService    │────│    AppRegistry      │
│  全局状态管理        │    │   指令执行          │    │   应用配置管理       │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     Context         │    │   URL Resolution    │    │  Parameter Config   │
│  - projectId        │    │   {param} -> value  │    │  - required: []     │
│  - chatId           │    │   /project/{id}     │    │  - optional: []     │
│  - userId           │    │   -> /project/123   │    │  - defaults: {}     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 使用方法

### 1. 应用配置中定义参数

```typescript
const projectPageConfig: AppConfig = {
  id: 'project-detail',
  name: '项目详情',
  url: '/project/{projectId}', // 使用占位符
  type: 'spa',
  params: {
    required: ['projectId'],      // 必需参数
    optional: ['tab'],           // 可选参数
    defaults: { tab: 'overview' } // 默认值
  }
}

// 注册到全局Registry
appRegistry.register(projectPageConfig)
```

### 2. 设置Context参数

```typescript
import { navigationContext } from '../core/context/NavigationContext'

// 单个参数设置
navigationContext.set('projectId', 'proj_123')

// 批量参数设置
navigationContext.update({
  projectId: 'proj_123',
  projectName: '智能客服系统',
  userId: 'user_456'
})
```

### 3. 创建语音指令

```typescript
const voiceCommand: RuntimeCommand = {
  id: 'open_current_project',
  triggers: ['打开当前项目', '查看项目详情'],
  description: '打开当前选中的项目',
  action: {
    type: 'navigate',
    target: 'project-detail' // 使用配置ID
  }
}
```

### 4. 执行导航

当用户说"打开当前项目"时：

1. 语音识别匹配指令
2. RuntimeService解析`target: 'project-detail'`
3. 从AppRegistry获取URL模板: `/project/{projectId}`
4. 从NavigationContext获取参数: `projectId: 'proj_123'`
5. 替换占位符生成最终URL: `/project/proj_123`
6. 执行页面跳转

## 高级功能

### Context监听

```typescript
// 监听Context变化
const unsubscribe = navigationContext.addListener((context) => {
  console.log('Context更新:', context)
  // 根据Context更新UI或执行其他操作
})

// 取消监听
unsubscribe()
```

### 智能参数检查

```typescript
// 获取解析结果和缺失参数
const result = appRegistry.resolveAppUrl('project-chat', context)
if (result.missing.length > 0) {
  // 提示用户提供缺失参数
  showParameterInputDialog(result.missing)
}
```

### 自动Context设置

```typescript
// 从URL自动提取Context
export const autoSetContextFromUrl = (url: string) => {
  const projectMatch = url.match(/\/project\/([^\/]+)/)
  if (projectMatch) {
    navigationContext.set('projectId', projectMatch[1])
  }
}
```

## 实际场景示例

### 场景1: 项目管理流程

```typescript
// 1. 用户选择项目
navigationContext.update({
  projectId: 'proj_001',
  projectName: '电商平台优化',
  projectType: 'consultation'
})

// 2. 语音指令配置
const commands = [
  {
    triggers: ['查看项目', '项目详情'],
    action: { type: 'navigate', target: '/project/{projectId}' }
  },
  {
    triggers: ['开始咨询', '新建对话'],  
    action: { type: 'navigate', target: '/project/{projectId}/chat/new' }
  },
  {
    triggers: ['查看报告', '生成报告'],
    action: { type: 'navigate', target: '/project/{projectId}/report' }
  }
]
```

### 场景2: 聊天会话管理

```typescript
// 1. 进入聊天页面时设置Context
navigationContext.update({
  projectId: 'proj_001',
  chatId: 'chat_456',
  sessionType: 'guided'
})

// 2. 聊天相关指令
const chatCommands = [
  {
    triggers: ['继续对话', '回到聊天'],
    action: { type: 'navigate', target: '/project/{projectId}/chat/{chatId}' }
  },
  {
    triggers: ['查看历史', '聊天记录'], 
    action: { type: 'navigate', target: '/project/{projectId}/history' }
  }
]
```

## 最佳实践

### 1. Context命名规范
- 使用驼峰命名: `projectId`, `chatId`, `userId`
- 保持一致性: 相同概念使用相同命名
- 避免冲突: 使用明确的前缀区分不同模块

### 2. 参数验证
```typescript
// 在执行导航前验证Context
const validateContext = (requiredParams: string[]) => {
  const context = navigationContext.getContext()
  const missing = requiredParams.filter(param => !context[param])
  return missing
}
```

### 3. 错误处理
```typescript
// 优雅的错误处理
const safeNavigate = (appId: string) => {
  try {
    const result = appRegistry.resolveAppUrl(appId, context)
    if (result.missing.length > 0) {
      // 提示用户或使用默认值
      showMissingParamsNotification(result.missing)
      return
    }
    // 执行导航
    executeNavigation(result.url)
  } catch (error) {
    console.error('Navigation failed:', error)
    showErrorNotification('页面跳转失败')
  }
}
```

### 4. Context清理
```typescript
// 页面切换时清理无关Context
const cleanupPageContext = () => {
  // 保留用户相关信息
  const preserved = {
    userId: navigationContext.get('userId'),
    username: navigationContext.get('username')
  }
  
  navigationContext.clear()
  navigationContext.update(preserved)
}
```

## 调试工具

### Context查看器
```typescript
// 开发时查看当前Context
console.log('Current Context:', navigationContext.getContext())

// 监控Context变化
if (process.env.NODE_ENV === 'development') {
  navigationContext.addListener((context) => {
    console.log('🔄 Context Changed:', context)
  })
}
```

### URL解析测试
```typescript
// 测试URL解析
const testUrlResolution = (appId: string, testContext: any) => {
  console.group(`Testing ${appId}`)
  console.log('Context:', testContext)
  
  const result = appRegistry.resolveAppUrl(appId, testContext)
  console.log('Resolved:', result.url)
  console.log('Missing:', result.missing)
  
  console.groupEnd()
}
```

## 扩展接口

系统提供了丰富的扩展点，支持：

- **自定义Context处理器**: 实现特殊的Context逻辑
- **参数验证器**: 添加参数格式验证
- **Context持久化**: 实现跨会话的Context保存
- **智能参数推断**: 基于历史数据自动填充参数

通过这个Context系统，Triangle OS实现了真正的智能语音导航，用户可以通过自然语言在复杂的应用状态中自由跳转。