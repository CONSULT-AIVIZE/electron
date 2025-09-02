/**
 * OS桥接SDK - 注入到网页中的通用SDK
 * 为任意网站提供与OS交互的标准API
 */

export interface OSBridgeAPI {
  // 基础系统信息
  getOSInfo(): OSInfo
  
  // 指令相关
  registerCommands(commands: any[]): Promise<boolean>
  executeCommand(commandId: string, params?: any): Promise<boolean>
  
  // 导航和页面管理
  navigate(url: string): Promise<boolean>
  getCurrentPage(): string
  
  // UI和样式
  applyStyle(css: string, scope?: string): Promise<boolean>
  toggleMode(mode: 'traditional' | 'ai_enhanced' | 'ai'): Promise<boolean>
  
  // 通信
  sendMessage(type: string, data: any): void
  onMessage(type: string, handler: (data: any) => void): void
  
  // 事件系统
  on(event: string, handler: (...args: any[]) => void): void
  off(event: string, handler: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
}

export interface OSInfo {
  name: string
  version: string
  mode: 'traditional' | 'ai_enhanced' | 'ai'
  features: string[]
}

/**
 * OS桥接实现
 * 这个类会被注入到网页的window对象中
 */
class OSBridge implements OSBridgeAPI {
  private eventHandlers: Map<string, Set<Function>> = new Map()
  private messageHandlers: Map<string, Function> = new Map()
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    // 监听来自OS的消息
    window.addEventListener('message', (event) => {
      this.handleOSMessage(event)
    })

    // 标记为已初始化
    this.isInitialized = true
    
    console.log('🔗 OS桥接SDK已初始化')
  }

  private handleOSMessage(event: MessageEvent) {
    const { type, ...data } = event.data
    
    // 处理标准OS消息
    switch (type) {
      case 'os_navigate':
        this.handleNavigate(data.url)
        break
      case 'os_dom_action':
        this.handleDOMAction(data.selector, data.method, data.value)
        break
      case 'os_ai_style':
        this.handleAIStyle(data.intent, data.scope, data.target)
        break
      case 'os_mode_change':
        this.emit('mode_change', data.mode)
        break
      default:
        // 触发自定义消息处理器
        const handler = this.messageHandlers.get(type)
        if (handler) {
          handler(data)
        }
        this.emit('message', { type, ...data })
    }
  }

  // === 公开API实现 ===

  getOSInfo(): OSInfo {
    return {
      name: 'TriangleOS',
      version: '1.0.0',
      mode: 'ai_enhanced', // 默认值，实际应从OS获取
      features: ['voice_control', 'ai_styling', 'traditional_mode']
    }
  }

  async registerCommands(commands: any[]): Promise<boolean> {
    // 向OS注册指令
    this.sendToOS('register_commands', { commands })
    return true
  }

  async executeCommand(commandId: string, params?: any): Promise<boolean> {
    // 请求OS执行指令
    this.sendToOS('execute_command', { commandId, params })
    return true
  }

  async navigate(url: string): Promise<boolean> {
    // 内部导航
    try {
      if (url.startsWith('http')) {
        window.location.href = url
      } else {
        // SPA路由导航
        if (window.history && window.history.pushState) {
          window.history.pushState({}, '', url)
          this.emit('navigate', url)
        } else {
          window.location.hash = url
        }
      }
      return true
    } catch (error) {
      console.error('导航失败:', error)
      return false
    }
  }

  getCurrentPage(): string {
    return window.location.pathname
  }

  async applyStyle(css: string, scope: string = 'page'): Promise<boolean> {
    try {
      // 创建或更新样式标签
      const styleId = `os-bridge-style-${scope}`
      let styleElement = document.getElementById(styleId) as HTMLStyleElement
      
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        styleElement.setAttribute('data-source', 'os-bridge')
        document.head.appendChild(styleElement)
      }
      
      styleElement.textContent = css
      this.emit('style_applied', { css, scope })
      return true
    } catch (error) {
      console.error('应用样式失败:', error)
      return false
    }
  }

  async toggleMode(mode: 'traditional' | 'ai_enhanced' | 'ai'): Promise<boolean> {
    this.sendToOS('toggle_mode', { mode })
    return true
  }

  sendMessage(type: string, data: any): void {
    this.sendToOS(type, data)
  }

  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler)
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  off(event: string, handler: (...args: any[]) => void): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error)
        }
      })
    }
  }

  // === 内部方法 ===

  private sendToOS(type: string, data: any) {
    if (window.parent !== window) {
      // 在iframe中，向父窗口发送消息
      window.parent.postMessage({ type, ...data }, '*')
    }
  }

  private handleNavigate(url: string) {
    this.navigate(url)
  }

  private handleDOMAction(selector: string, method: string, value?: any) {
    try {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        switch (method) {
          case 'click':
            (element as HTMLElement).click()
            break
          case 'focus':
            (element as HTMLElement).focus()
            break
          case 'setValue':
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
              element.value = value
              element.dispatchEvent(new Event('input', { bubbles: true }))
            }
            break
          case 'submit':
            if (element instanceof HTMLFormElement) {
              element.submit()
            }
            break
          default:
            console.warn('未知的DOM操作:', method)
        }
      })
      
      this.emit('dom_action', { selector, method, value })
    } catch (error) {
      console.error('DOM操作失败:', error)
    }
  }

  private handleAIStyle(intent: string, scope?: string, target?: string) {
    // 基础AI样式处理
    // 实际应用可以扩展这个方法
    console.log('AI样式修改请求:', { intent, scope, target })
    this.emit('ai_style', { intent, scope, target })
  }
}

// 自动注入到全局对象
declare global {
  interface Window {
    OSBridge: OSBridgeAPI
  }
}

// 初始化并注入到window
if (typeof window !== 'undefined' && !window.OSBridge) {
  window.OSBridge = new OSBridge()
}

export default OSBridge