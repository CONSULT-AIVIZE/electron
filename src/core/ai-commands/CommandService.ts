import { getStyleModifier, StyleModificationRequest } from '../ai-style'

// AI指令服务：负责加载、解析和执行AI指令
export interface AICommand {
  id: string
  triggers: string[]
  description: string
  icon: string
  action: AIAction
  page_specific?: boolean
}

export interface AIAction {
  type: 'navigate' | 'dom_action' | 'api_call' | 'system_command' | 'ai_style'
  [key: string]: any
}

export interface AIConfig {
  version: string
  app: {
    name: string
    description: string
    homepage: string
    locale: string
  }
  features: {
    voice_control: boolean
    ai_styling: boolean
    traditional_mode: boolean
    adaptive_ui: boolean
  }
  navigation: {
    default_page: string
    auth_required: boolean
    auth_redirect: string
  }
}

export interface PageConfig {
  page_id: string
  name: string
  url: string
  description: string
  layout: string
  ai_features: {
    style_modification: boolean
    content_generation: boolean
    voice_input: boolean
  }
  context: {
    purpose: string
    key_elements: string[]
    user_goals: string[]
  }
}

export class CommandService {
  private config: AIConfig | null = null
  private globalCommands: AICommand[] = []
  private pageCommands: Map<string, AICommand[]> = new Map()
  private currentPage: string = '/'
  private listeners: Set<(commands: AICommand[]) => void> = new Set()

  async loadConfiguration(websiteUrl: string): Promise<boolean> {
    try {
      // 尝试从网站加载AI协议配置
      const configUrl = `${websiteUrl}/ai/protocol.json`
      
      try {
        const response = await fetch(configUrl)
        if (response.ok) {
          this.config = await response.json()
          await this.loadCommands(websiteUrl)
          return true
        }
      } catch (error) {
        console.log('无法加载远程AI配置，使用默认配置')
      }

      // 使用最小默认配置
      this.loadDefaultConfiguration()
      return false // 返回false表示未成功加载完整配置
    } catch (error) {
      console.error('加载AI配置失败:', error)
      return false
    }
  }

  private loadDefaultConfiguration() {
    // 不再提供硬编码的默认配置
    // 应用必须通过协议文件提供配置，确保OS完全通用化
    console.warn('⚠️  未找到应用协议配置，请确保应用实现了OS Protocol')
    
    this.config = {
      version: "1.0",
      app: {
        name: "未配置应用",
        description: "请配置OS协议以启用完整功能",
        homepage: "/",
        locale: "zh-CN"
      },
      features: {
        voice_control: false,
        ai_styling: false,
        traditional_mode: true,
        adaptive_ui: false
      },
      navigation: {
        default_page: "home",
        auth_required: false,
        auth_redirect: "/"
      }
    }

    // 仅提供最基本的系统指令
    this.globalCommands = [
      {
        id: "toggle_mode",
        triggers: ["切换模式", "传统模式", "toggle mode"],
        description: "切换显示模式",
        icon: "🔄",
        action: { type: "system_command", command: "toggle_traditional_mode" }
      }
    ]
    
    // 清空页面特定指令，强制应用提供自己的指令
    this.pageCommands.clear()
  }

  private async loadCommands(websiteUrl: string) {
    try {
      // 从协议配置中获取指令路径并加载
      const protocol = this.config as any
      
      // 加载全局指令
      if (protocol?.commands?.global) {
        const globalPath = protocol.commands.global
        const globalResponse = await fetch(`${websiteUrl}/${globalPath}`)
        if (globalResponse.ok) {
          const globalData = await globalResponse.json()
          this.globalCommands = globalData.commands || []
          console.log('✅ 加载全局指令:', this.globalCommands.length, '个')
        }
      }

      // 加载页面特定指令
      if (protocol?.commands?.pages) {
        for (const [pageId, pagePath] of Object.entries(protocol.commands.pages)) {
          try {
            const pageResponse = await fetch(`${websiteUrl}/${pagePath}`)
            if (pageResponse.ok) {
              const pageData = await pageResponse.json()
              this.pageCommands.set(pageId, pageData.commands || [])
              console.log(`✅ 加载${pageId}页面指令:`, pageData.commands?.length || 0, '个')
            }
          } catch (pageError) {
            console.log(`ℹ️ 页面${pageId}无指令配置`)
          }
        }
      }
    } catch (error) {
      console.error('加载指令配置失败:', error)
    }
  }

  setCurrentPage(page: string) {
    this.currentPage = page
    this.notifyListeners()
  }

  getCurrentCommands(): AICommand[] {
    const pageCommands = this.pageCommands.get(this.getPageId(this.currentPage)) || []
    return [...this.globalCommands, ...pageCommands]
  }

  private getPageId(url: string): string {
    // URL到页面ID的映射，匹配咨询网站的路由
    const pathMap: Record<string, string> = {
      '/': 'home',
      '/chat': 'chat',
      '/project': 'project', 
      '/settings': 'settings',
      '/consult': 'chat', // 兼容旧路由
      '/history': 'history',
      '/files': 'files'
    }
    
    // 支持动态路由，如 /project/123
    const path = url.split('?')[0] // 移除查询参数
    if (path.startsWith('/project/')) return 'project'
    
    return pathMap[path] || 'home'
  }

  matchCommand(input: string): AICommand | null {
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

  async executeCommand(command: AICommand, context?: any): Promise<boolean> {
    try {
      switch (command.action.type) {
        case 'navigate':
          return await this.executeNavigate(command.action, context)
        case 'dom_action':
          return await this.executeDOMAction(command.action, context)
        case 'api_call':
          return await this.executeAPICall(command.action, context)
        case 'system_command':
          return await this.executeSystemCommand(command.action, context)
        case 'ai_style':
          return await this.executeAIStyle(command.action, context)
        default:
          console.error('未知的指令类型:', command.action.type)
          return false
      }
    } catch (error) {
      console.error('执行指令失败:', error)
      return false
    }
  }

  private async executeNavigate(action: AIAction, context?: any): Promise<boolean> {
    // 通过postMessage与iframe通信
    if (context?.iframe) {
      context.iframe.contentWindow?.postMessage({
        type: 'navigate',
        url: action.target
      }, '*')
    }
    
    this.setCurrentPage(action.target)
    return true
  }

  private async executeDOMAction(action: AIAction, context?: any): Promise<boolean> {
    // 通过postMessage指示iframe执行DOM操作
    if (context?.iframe) {
      context.iframe.contentWindow?.postMessage({
        type: 'dom_action',
        selector: action.selector,
        method: action.method,
        value: action.value
      }, '*')
      return true
    }
    return false
  }

  private async executeAPICall(action: AIAction, context?: any): Promise<boolean> {
    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: action.data ? JSON.stringify(action.data) : undefined
      })
      return response.ok
    } catch (error) {
      console.error('API调用失败:', error)
      return false
    }
  }

  private async executeSystemCommand(action: AIAction, context?: any): Promise<boolean> {
    // 执行系统级命令
    if (context?.systemHandler) {
      return context.systemHandler(action.command, action.params)
    }
    return false
  }

  private async executeAIStyle(action: AIAction, context?: any): Promise<boolean> {
    try {
      const styleModifier = getStyleModifier()
      
      if (!styleModifier.modifyStyle) {
        console.warn('AI样式修改器不可用')
        return false
      }

      // 构建样式修改请求
      const request: StyleModificationRequest = {
        intent: action.intent || '修改样式',
        scope: action.scope || 'page',
        target: action.target,
        context: {
          currentStyles: action.currentStyles,
          pageType: this.getPageId(this.currentPage),
          colorScheme: 'dark' // 默认深色主题
        }
      }

      // 执行样式修改
      const result = await styleModifier.modifyStyle(request)
      
      if (result.success) {
        // 应用样式到iframe
        if (context?.iframe && result.css) {
          context.iframe.contentWindow?.postMessage({
            type: 'apply_style',
            css: result.css,
            description: result.description
          }, '*')
        }
        
        // 应用到当前页面的样式缓存
        await styleModifier.applyStyleToPage(result.css, this.getPageId(this.currentPage))
        
        console.log('AI样式修改成功:', result.description)
        return true
      } else {
        console.error('AI样式修改失败:', result.error)
        return false
      }
    } catch (error) {
      console.error('AI样式修改异常:', error)
      return false
    }
  }

  addListener(callback: (commands: AICommand[]) => void) {
    this.listeners.add(callback)
  }

  removeListener(callback: (commands: AICommand[]) => void) {
    this.listeners.delete(callback)
  }

  private notifyListeners() {
    const commands = this.getCurrentCommands()
    this.listeners.forEach(callback => callback(commands))
  }

  getConfig(): AIConfig | null {
    return this.config
  }
}