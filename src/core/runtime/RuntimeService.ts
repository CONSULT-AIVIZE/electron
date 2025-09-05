/**
 * Triangle OS Universal Runtime Service
 * 通用运行时服务 - 提供标准化的应用集成接口
 * 遵循Triangle OS Application Integration Protocol v1.0
 * 完全与具体业务解耦，支持任意符合协议的应用集成
 */

export interface AppConfig {
  id: string
  name: string
  url: string
  type: 'website' | 'spa' | 'desktop'
  features?: {
    voice_control?: boolean
    ai_styling?: boolean
    traditional_mode?: boolean
    adaptive_ui?: boolean
  }
  icon?: string
  description?: string
}

export interface RuntimeCommand {
  id: string
  triggers: string[]
  description: string
  icon?: string
  action: RuntimeAction
  scope?: 'global' | 'app' | 'page'
  app_id?: string
  page_id?: string
}

export interface RuntimeAction {
  type: 'navigate' | 'dom_action' | 'api_call' | 'system_command' | 'ai_style' | 'custom'
  [key: string]: any
}

export interface RuntimeContext {
  app_id: string
  current_url: string
  iframe?: HTMLIFrameElement
  systemHandler?: (command: string, params?: any) => Promise<boolean>
  customHandler?: (action: RuntimeAction, context: any) => Promise<boolean>
}

export interface AuthConfig {
  required: boolean
  provider: 'firebase' | 'oauth' | 'custom'
  login_page: string
  check_endpoint: string
  login_endpoint?: string
  logout_endpoint?: string
  session_storage: string
  auto_redirect: boolean
  public_pages?: string[]
}

export interface AuthStatus {
  authenticated: boolean
  user?: any
  token?: string
  expires?: number
}

/**
 * 通用运行时服务
 * 负责管理应用生命周期、指令路由和通信协调
 */
export class RuntimeService {
  private currentApp: AppConfig | null = null
  private commands: Map<string, RuntimeCommand[]> = new Map()
  private listeners: Set<(commands: RuntimeCommand[]) => void> = new Set()
  private context: RuntimeContext | null = null
  private authConfig: AuthConfig | null = null
  private authStatus: AuthStatus = { authenticated: false }

  /**
   * 加载应用配置
   */
  async loadApp(appConfig: AppConfig): Promise<{success: boolean, redirectUrl?: string}> {
    try {
      this.currentApp = appConfig
      this.context = {
        app_id: appConfig.id,
        current_url: appConfig.url
      }

      // 尝试从应用加载指令配置和身份验证配置
      if (appConfig.type === 'website' || appConfig.type === 'spa') {
        const protocolData = await this.loadWebsiteCommands(appConfig.url)
        
        // 如果有身份验证配置，检查登录状态
        if (this.authConfig && this.authConfig.required) {
          const authResult = await this.checkAuthentication()
          if (!authResult.authenticated && this.authConfig.auto_redirect) {
            const redirectUrl = `${appConfig.url}${this.authConfig.login_page}`
            console.log('🔒 用户未认证，重定向到登录页:', redirectUrl)
            return { success: true, redirectUrl }
          }
        }
      }

      this.notifyListeners()
      return { success: true }
    } catch (error) {
      console.error('加载应用失败:', error)
      return { success: false }
    }
  }

  /**
   * 从网站加载指令配置（标准协议）
   */
  private async loadWebsiteCommands(websiteUrl: string): Promise<any> {
    try {
      // 只允许本地网站和file://协议加载协议文件
      if (!websiteUrl.startsWith('http://localhost') && !websiteUrl.startsWith('file://')) {
        console.log('ℹ️ 跳过外部网站协议加载，避免CSP限制')
        return null
      }
      
      // 加载标准协议配置（使用API端点以支持CORS）
      const protocolUrl = `${websiteUrl}/api/ai/protocol.json`
      const response = await fetch(protocolUrl, {
        mode: 'cors',
        credentials: 'same-origin'
      })
      
      if (response.ok) {
        const protocol = await response.json()
        
        // 解析身份验证配置
        if (protocol.authentication) {
          this.authConfig = protocol.authentication
          console.log('🔐 加载身份验证配置:', this.authConfig)
        }
        
        await this.parseProtocolCommands(protocol, websiteUrl)
        console.log('✅ 加载OS协议配置成功')
        return protocol
      } else {
        console.log('ℹ️ 协议文件不存在，使用基础集成模式')
        return null
      }
    } catch (error) {
      console.log('ℹ️ 未找到OS协议配置，使用基础集成模式')
      return null
    }
  }

  /**
   * 解析协议指令 - 直接从 protocol.json 读取
   */
  private async parseProtocolCommands(protocol: any, websiteUrl: string) {
    console.log('🔍 解析协议指令:', protocol)
    
    // 直接使用 commands 数组
    if (Array.isArray(protocol.commands)) {
      const globalCommands = protocol.commands.map((cmd: any) => ({
        ...cmd,
        scope: 'global',
        app_id: this.currentApp?.id
      }))
      this.commands.set('global', globalCommands)
      console.log('✅ 从 protocol.json 直接加载指令成功:', globalCommands.length, '个指令')
      
      // 重要：通知监听器指令已更新
      this.notifyListeners()
    } else {
      console.warn('⚠️ protocol.json 中未找到 commands 数组')
    }
  }

  /**
   * 设置运行时上下文
   */
  setContext(context: Partial<RuntimeContext>) {
    if (this.context) {
      this.context = { ...this.context, ...context }
    }
  }

  /**
   * 获取当前可用指令
   */
  getCurrentCommands(): RuntimeCommand[] {
    const allCommands: RuntimeCommand[] = []
    
    // 全局指令
    const globalCommands = this.commands.get('global') || []
    allCommands.push(...globalCommands)

    // 当前页面指令
    if (this.context?.current_url) {
      const pageId = this.extractPageId(this.context.current_url)
      const pageCommands = this.commands.get(`page:${pageId}`) || []
      allCommands.push(...pageCommands)
    }

    return allCommands
  }

  /**
   * 从URL提取页面ID
   */
  private extractPageId(url: string): string {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname
      
      if (path === '/') return 'home'
      
      // 移除开头的斜杠并获取第一部分
      const segments = path.substring(1).split('/')
      return segments[0] || 'home'
    } catch {
      return 'home'
    }
  }

  /**
   * 匹配指令
   */
  matchCommand(input: string): RuntimeCommand | null {
    const normalizedInput = input.toLowerCase().trim()
    const commands = this.getCurrentCommands()

    for (const command of commands) {
      for (const trigger of command.triggers) {
        if (normalizedInput.includes(trigger.toLowerCase())) {
          return command
        }
      }
    }

    return null
  }

  /**
   * 执行指令
   */
  async executeCommand(command: RuntimeCommand, params?: any): Promise<boolean> {
    if (!this.context) {
      console.error('运行时上下文未初始化')
      return false
    }

    try {
      switch (command.action.type) {
        case 'navigate':
          return await this.executeNavigate(command.action)
        case 'dom_action':
          return await this.executeDOMAction(command.action)
        case 'api_call':
          return await this.executeAPICall(command.action)
        case 'system_command':
          return await this.executeSystemCommand(command.action)
        case 'ai_style':
          return await this.executeAIStyle(command.action)
        case 'custom':
          return await this.executeCustom(command.action)
        default:
          console.error('未知的指令类型:', command.action.type)
          return false
      }
    } catch (error) {
      console.error('执行指令失败:', error)
      return false
    }
  }

  private async executeNavigate(action: RuntimeAction): Promise<boolean> {
    // For iframe context (AI enhanced mode) - use postMessage
    if (this.context?.iframe) {
      this.context.iframe.contentWindow?.postMessage({
        type: 'os_navigate',
        url: action.target
      }, '*')
    } 
    // For Voice commands - emit navigation event to update iframe in Dashboard
    else if (this.currentApp) {
      // Add Triangle OS mode parameter to hide sidebar and simplify UI
      const triangleOSParams = new URLSearchParams()
      triangleOSParams.set('triangle_os', 'true')
      
      const fullUrl = `${this.currentApp.url}${action.target}?${triangleOSParams.toString()}`
      
      // Emit navigation event to update iframe instead of full page navigation
      const navigationEvent = new CustomEvent('os_iframe_navigation', {
        detail: {
          type: 'iframe_navigation',
          appUrl: this.currentApp.url,
          targetPath: action.target,
          fullUrl: fullUrl
        }
      })
      
      console.log('[RuntimeService] Emitting iframe navigation event with Triangle OS mode:', navigationEvent.detail)
      window.dispatchEvent(navigationEvent)
    }
    // Fallback to direct navigation only when no app is loaded
    else {
      // Import navigation utilities dynamically to avoid circular dependencies
      const { navigateToRoute, isElectronProduction } = await import('../../utils/electronNavigation')
      
      if (isElectronProduction()) {
        navigateToRoute(action.target)
      } else {
        // In development, we need access to Next.js router
        // This will be handled by the calling component
        if (typeof window !== 'undefined') {
          window.location.href = action.target
        }
      }
    }
    
    if (this.context) {
      this.context.current_url = action.target
    }
    return true
  }

  private async executeDOMAction(action: RuntimeAction): Promise<boolean> {
    if (this.context?.iframe) {
      this.context.iframe.contentWindow?.postMessage({
        type: 'os_dom_action',
        selector: action.selector,
        method: action.method,
        value: action.value
      }, '*')
      return true
    }
    return false
  }

  private async executeAPICall(action: RuntimeAction): Promise<boolean> {
    try {
      const response = await fetch(action.endpoint, {
        method: action.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...action.headers
        },
        body: action.data ? JSON.stringify(action.data) : undefined
      })
      return response.ok
    } catch (error) {
      console.error('API调用失败:', error)
      return false
    }
  }

  private async executeSystemCommand(action: RuntimeAction): Promise<boolean> {
    if (this.context?.systemHandler) {
      return this.context.systemHandler(action.command, action.params)
    }
    console.warn('系统处理器未注册')
    return false
  }

  private async executeAIStyle(action: RuntimeAction): Promise<boolean> {
    if (this.context?.iframe) {
      this.context.iframe.contentWindow?.postMessage({
        type: 'os_ai_style',
        intent: action.intent,
        scope: action.scope,
        target: action.target
      }, '*')
      return true
    }
    return false
  }

  private async executeCustom(action: RuntimeAction): Promise<boolean> {
    if (this.context?.customHandler) {
      return this.context.customHandler(action, this.context)
    }
    console.warn('自定义处理器未注册')
    return false
  }

  /**
   * 监听器管理
   */
  addListener(callback: (commands: RuntimeCommand[]) => void) {
    this.listeners.add(callback)
  }

  removeListener(callback: (commands: RuntimeCommand[]) => void) {
    this.listeners.delete(callback)
  }

  private notifyListeners() {
    const commands = this.getCurrentCommands()
    this.listeners.forEach(callback => callback(commands))
  }

  /**
   * 获取当前应用信息
   */
  getCurrentApp(): AppConfig | null {
    return this.currentApp
  }

  /**
   * 获取运行时上下文
   */
  getContext(): RuntimeContext | null {
    return this.context
  }

  /**
   * 检查身份验证状态
   */
  async checkAuthentication(): Promise<AuthStatus> {
    if (!this.authConfig || !this.currentApp) {
      return { authenticated: false }
    }

    try {
      // 首先检查本地存储的会话
      const sessionKey = this.authConfig.session_storage
      const stored = localStorage.getItem(sessionKey)
      if (stored) {
        const session = JSON.parse(stored)
        if (session.expires && Date.now() < session.expires) {
          this.authStatus = { authenticated: true, ...session }
          console.log('✅ 本地会话有效')
          return this.authStatus
        } else {
          localStorage.removeItem(sessionKey)
          console.log('⏰ 本地会话已过期')
        }
      }

      // 对于Firebase认证，通过iframe内部的Firebase客户端检查状态
      if (this.authConfig.provider === 'firebase' && this.context?.iframe) {
        console.log('🔥 检查Firebase认证状态通过iframe')
        
        // 发送消息请求认证状态
        return new Promise((resolve) => {
          const requestId = Date.now().toString()
          
          // 监听响应
          const handleMessage = (event: MessageEvent) => {
            if (event.source === this.context?.iframe?.contentWindow && 
                event.data.type === 'auth_status_response' && 
                event.data.requestId === requestId) {
              
              window.removeEventListener('message', handleMessage)
              
              const authData = event.data.authStatus
              this.authStatus = {
                authenticated: authData.authenticated || false,
                user: authData.user,
                expires: authData.expires
              }
              
              // 保存到本地存储
              if (this.authStatus.authenticated) {
                localStorage.setItem(sessionKey, JSON.stringify(this.authStatus))
                console.log('✅ Firebase认证有效')
              } else {
                console.log('❌ Firebase认证无效')
              }
              
              resolve(this.authStatus)
            }
          }
          
          window.addEventListener('message', handleMessage)
          
          // 发送认证状态检查请求
          this.context?.iframe?.contentWindow?.postMessage({
            type: 'os_check_auth_status',
            requestId
          }, '*')
          
          // 5秒超时
          setTimeout(() => {
            window.removeEventListener('message', handleMessage)
            this.authStatus = { authenticated: false }
            console.log('⏰ Firebase认证状态检查超时')
            resolve(this.authStatus)
          }, 5000)
        })
      }

      // 对于非Firebase认证，回退到服务器端检查
      if (!this.authConfig.check_endpoint) {
        console.warn('⚠️ 未配置 check_endpoint，跳过服务器认证检查')
        this.authStatus = { authenticated: true } // 默认认为已认证
        return this.authStatus
      }
      
      const checkUrl = `${this.currentApp.url}${this.authConfig.check_endpoint}`
      const response = await fetch(checkUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const authData = await response.json()
        this.authStatus = {
          authenticated: authData.authenticated || false,
          user: authData.user,
          token: authData.token,
          expires: authData.expires
        }
        
        // 保存到本地存储
        if (this.authStatus.authenticated) {
          localStorage.setItem(sessionKey, JSON.stringify(this.authStatus))
          console.log('✅ 服务器认证成功')
        }
      } else {
        this.authStatus = { authenticated: false }
        console.log('❌ 服务器认证检查失败')
      }

      return this.authStatus
    } catch (error) {
      console.error('身份验证检查失败:', error)
      // 如果认证检查失败，但当前不在登录页面，假设已登录
      const currentUrl = this.context?.current_url || this.currentApp.url + '/'
      const isLoginPage = currentUrl.includes('/login')
      console.log('🔍 当前URL:', currentUrl, '是否登录页面:', isLoginPage)
      this.authStatus = { authenticated: !isLoginPage }
      if (!isLoginPage) {
        console.log('✅ 非登录页面，假设用户已登录')
      }
      return this.authStatus
    }
  }

  /**
   * 执行登录
   */
  async login(credentials: {username: string, password: string}): Promise<AuthStatus> {
    if (!this.authConfig || !this.currentApp) {
      return { authenticated: false }
    }

    try {
      const loginUrl = `${this.currentApp.url}${this.authConfig.login_endpoint}`
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const authData = await response.json()
        this.authStatus = {
          authenticated: authData.authenticated || false,
          user: authData.user,
          token: authData.token,
          expires: authData.expires || Date.now() + 24 * 60 * 60 * 1000 // 默认24小时
        }

        if (this.authStatus.authenticated) {
          // 保存到本地存储
          const sessionKey = this.authConfig.session_storage
          localStorage.setItem(sessionKey, JSON.stringify(this.authStatus))
          console.log('✅ 登录成功')
        }

        return this.authStatus
      } else {
        const errorData = await response.json().catch(() => ({ message: '登录失败' }))
        console.log('❌ 登录失败:', errorData.message)
        return { authenticated: false }
      }
    } catch (error) {
      console.error('登录请求失败:', error)
      return { authenticated: false }
    }
  }

  /**
   * 执行登出
   */
  async logout(): Promise<boolean> {
    if (!this.authConfig || !this.currentApp) {
      return false
    }

    try {
      const logoutUrl = `${this.currentApp.url}${this.authConfig.logout_endpoint}`
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // 无论服务器响应如何，都清理本地状态
      const sessionKey = this.authConfig.session_storage
      localStorage.removeItem(sessionKey)
      this.authStatus = { authenticated: false }
      
      console.log('✅ 已登出')
      return true
    } catch (error) {
      console.error('登出请求失败:', error)
      // 即使请求失败，也清理本地状态
      const sessionKey = this.authConfig.session_storage
      localStorage.removeItem(sessionKey)
      this.authStatus = { authenticated: false }
      return false
    }
  }

  /**
   * 获取身份验证状态
   */
  getAuthStatus(): AuthStatus {
    return this.authStatus
  }

  /**
   * 获取身份验证配置
   */
  getAuthConfig(): AuthConfig | null {
    return this.authConfig
  }

  /**
   * 检查当前页面是否需要认证
   */
  isCurrentPageProtected(): boolean {
    if (!this.authConfig || !this.authConfig.required) {
      return false
    }

    const currentUrl = this.context?.current_url
    if (!currentUrl) {
      return true // 如果无法确定URL，默认需要认证
    }

    try {
      const urlObj = new URL(currentUrl)
      const path = urlObj.pathname
      
      // 检查是否在公开页面列表中
      const publicPages = ['/login', '/register', '/forgot-password'] // 默认公开页面
      if (this.authConfig && 'public_pages' in this.authConfig) {
        publicPages.push(...((this.authConfig as any).public_pages || []))
      }

      return !publicPages.includes(path)
    } catch {
      return true // 如果URL解析失败，默认需要认证
    }
  }

  /**
   * 清理资源
   */
  destroy() {
    this.commands.clear()
    this.listeners.clear()
    this.context = null
    this.currentApp = null
    this.authConfig = null
    this.authStatus = { authenticated: false }
  }
}