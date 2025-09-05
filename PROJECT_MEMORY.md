# Triangle OS 项目记忆

## 系统架构
Triangle OS 是一个基于 Electron + Next.js 的沉浸式语音交互桌面操作系统，核心架构包含三个主要组件：

1. **底部语音输入栏** - 处理语音输入和命令识别（RealtimeVoice 组件）
2. **上方页面展示区域** - 显示加载的应用内容（如 CONSULT_AI）
3. **右上角模型切换** - AI 模型选择器

## OpenAI Realtime 语音功能集成

### 认证和端点配置
- **密钥获取**：直接使用 `https://api.openai.com/v1/realtime/sessions` 端点
- **CORS 问题解决**：移除 `next.config.js` 中冲突的通配符 CORS 头，通过 `middleware.ts` 处理
- **Firebase 认证集成**：`/api/auth/firebase/status` 端点支持 credentials 模式

### 关键问题和解决方案

#### 1. 重复命令加载问题
**问题**：RealtimeVoice 组件不断重新注册命令
**解决**：移除 `createToolsFromCommands` 函数依赖，内联创建工具避免循环重渲染

#### 2. RuntimeService 共享实例
**问题**：多个组件创建独立 RuntimeService 实例导致状态不同步  
**解决**：使用 `getSharedRuntimeService()` 确保全局单例

#### 3. 语音命令导航机制
**错误方式**：直接使用 `window.location.href` 跳转会失去加载效果
**正确方式**：
```javascript
// RuntimeService 发出自定义事件
const navigationEvent = new CustomEvent('os_navigation', {
  detail: { type: 'app_navigation', fullUrl: targetUrl }
})
window.dispatchEvent(navigationEvent)

// Dashboard 监听事件并显示 MatrixLoading
window.addEventListener('os_navigation', handleNavigation)
```

## CONSULT_AI 应用集成

### Triangle OS 模式支持
CONSULT_AI 已内置 Triangle OS 集成支持：
- **参数**：`?triangle_os=true`  
- **效果**：隐藏侧边栏，简化界面，显示"Triangle OS 集成模式"标识
- **实现**：`main-layout.tsx` 检测 URL 参数自动切换模式

### 页面路径映射
```javascript
// 语音命令 → CONSULT_AI 页面
"咨询/创建咨询" → "/project" (创建项目页面)
"项目管理" → "/projects" (项目列表页面)  
"设置" → "/settings"
"主页" → "/"
```

## 技术实现细节

### 命令加载流程
1. Dashboard 加载应用 → `sharedRuntimeService.loadApp()`
2. 获取 protocol.json → 包含应用所有可用命令
3. 解析命令并通知监听器 → `notifyListeners()`
4. RealtimeVoice 接收命令 → 创建 OpenAI 工具函数
5. 语音识别触发 → 执行对应命令处理器

### MatrixLoading 加载效果
- **触发**：RuntimeService 发出 `os_navigation` 事件
- **显示**：Dashboard 设置 `isNavigating = true`  
- **持续**：800ms 加载动画
- **完成**：同时进行实际页面跳转

### CORS 配置最佳实践
- **移除冲突**：不在 `next.config.js` 设置通配符 CORS 头
- **中间件处理**：在 `middleware.ts` 中根据来源动态设置 CORS
- **凭证支持**：避免 `Access-Control-Allow-Origin: *` + credentials 的冲突

## 开发经验总结

### 问题排查方法
1. **重复渲染**：检查 useEffect 依赖数组，避免包含会重新创建的函数
2. **状态不同步**：确保使用共享实例而非多个独立实例  
3. **CORS 错误**：检查多层配置是否冲突（next.config.js vs middleware.ts）
4. **导航问题**：确认是 OS 级导航还是应用内导航，选择合适的实现方式

### 代码组织原则
- **组件职责分离**：RuntimeService 处理命令逻辑，Dashboard 处理 UI 状态
- **事件驱动架构**：使用 CustomEvent 实现松耦合的组件通信
- **参数化集成**：通过 URL 参数控制应用展示模式，支持不同使用场景

## 待优化项目
- [ ] 考虑将语音命令响应时间优化到更低延迟
- [ ] 增加语音命令的视觉反馈提升用户体验
- [ ] 完善错误处理和恢复机制