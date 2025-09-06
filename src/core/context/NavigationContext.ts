/**
 * 导航Context系统 - 管理页面跳转时的动态参数
 */

export interface NavigationContext {
  // 用户相关
  userId?: string
  username?: string
  
  // 项目相关
  projectId?: string
  projectName?: string
  projectType?: string
  
  // 聊天会话相关
  chatId?: string
  sessionId?: string
  
  // 页面状态
  currentPage?: string
  previousPage?: string
  
  // 临时参数
  [key: string]: any
}

export class NavigationContextManager {
  private static instance: NavigationContextManager
  private context: NavigationContext = {}
  private listeners: ((context: NavigationContext) => void)[] = []

  private constructor() {}

  static getInstance(): NavigationContextManager {
    if (!NavigationContextManager.instance) {
      NavigationContextManager.instance = new NavigationContextManager()
    }
    return NavigationContextManager.instance
  }

  /**
   * 获取完整的Context
   */
  getContext(): NavigationContext {
    return { ...this.context }
  }

  /**
   * 获取特定的Context值
   */
  get(key: string): any {
    return this.context[key]
  }

  /**
   * 设置Context值
   */
  set(key: string, value: any): void {
    const oldValue = this.context[key]
    this.context[key] = value
    
    console.log(`🔧 [NavigationContext] Set ${key}:`, { old: oldValue, new: value })
    this.notifyListeners()
  }

  /**
   * 批量更新Context
   */
  update(updates: Partial<NavigationContext>): void {
    const oldContext = { ...this.context }
    this.context = { ...this.context, ...updates }
    
    console.log('🔄 [NavigationContext] Batch update:', { 
      old: oldContext, 
      new: this.context,
      changes: updates 
    })
    this.notifyListeners()
  }

  /**
   * 删除Context值
   */
  remove(key: string): void {
    const oldValue = this.context[key]
    delete this.context[key]
    
    console.log(`🗑️ [NavigationContext] Remove ${key}:`, oldValue)
    this.notifyListeners()
  }

  /**
   * 清空Context（保留基本信息）
   */
  clear(): void {
    const preserved = {
      userId: this.context.userId,
      username: this.context.username,
    }
    
    this.context = preserved
    console.log('🧹 [NavigationContext] Cleared, preserved:', preserved)
    this.notifyListeners()
  }

  /**
   * 替换URL中的占位符
   * 支持格式: /project/{projectId}/chat/{chatId}
   */
  resolvePlaceholders(url: string): string {
    let resolvedUrl = url
    
    // 匹配 {key} 格式的占位符
    const placeholderRegex = /\{([^}]+)\}/g
    const matches = url.match(placeholderRegex)
    
    if (!matches) {
      return resolvedUrl
    }

    for (const match of matches) {
      const key = match.slice(1, -1) // 移除 {} 
      const value = this.context[key]
      
      if (value !== undefined) {
        resolvedUrl = resolvedUrl.replace(match, encodeURIComponent(String(value)))
        console.log(`🔗 [NavigationContext] Resolved placeholder ${match} -> ${value}`)
      } else {
        console.warn(`⚠️ [NavigationContext] Placeholder ${match} not found in context`)
        // 保留占位符，不替换
      }
    }
    
    return resolvedUrl
  }

  /**
   * 设置页面跳转时的Context
   */
  setNavigationContext(fromPage: string, toPage: string, params?: Record<string, any>): void {
    this.update({
      previousPage: fromPage,
      currentPage: toPage,
      ...params
    })
  }

  /**
   * 监听Context变化
   */
  addListener(listener: (context: NavigationContext) => void): () => void {
    this.listeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getContext())
      } catch (error) {
        console.error('❌ [NavigationContext] Listener error:', error)
      }
    })
  }
}

// 全局实例
export const navigationContext = NavigationContextManager.getInstance()