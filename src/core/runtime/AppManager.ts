/**
 * 应用管理器 - 管理OS中的应用配置和生命周期
 * 支持动态配置和多应用集成
 */

import { AppConfig, RuntimeService } from './RuntimeService'

export interface AppRegistry {
  [appId: string]: AppConfig
}

export interface OSConfig {
  version: string
  default_app: string
  apps: AppRegistry
  system: {
    modes: ('ai' | 'ai_enhanced' | 'traditional')[]
    default_mode: 'ai' | 'ai_enhanced' | 'traditional'
    voice_enabled: boolean
    ai_style_enabled: boolean
  }
}

/**
 * 应用管理器
 * 负责应用的注册、切换和配置管理
 */
export class AppManager {
  private config: OSConfig
  private runtimeService: RuntimeService
  private currentApp: string | null = null
  private listeners: Set<(appId: string) => void> = new Set()

  constructor(runtimeService: RuntimeService, initialConfig?: Partial<OSConfig>) {
    this.runtimeService = runtimeService
    this.config = this.mergeWithDefaults(initialConfig || {})
  }

  private mergeWithDefaults(config: Partial<OSConfig>): OSConfig {
    return {
      version: config.version || '1.0.0',
      default_app: config.default_app || 'default',
      apps: {
        // 默认应用配置（可以是任何网站）
        default: {
          id: 'default',
          name: '默认应用',
          url: 'about:blank',
          type: 'website',
          features: {
            voice_control: true,
            ai_styling: true,
            traditional_mode: true
          }
        },
        ...config.apps
      },
      system: {
        modes: ['ai', 'ai_enhanced', 'traditional'],
        default_mode: 'ai',
        voice_enabled: true,
        ai_style_enabled: true,
        ...config.system
      }
    }
  }

  /**
   * 从配置文件加载OS配置
   */
  async loadConfig(configPath?: string): Promise<boolean> {
    try {
      // 在实际应用中，这里应该从文件系统或远程加载配置
      // 目前使用默认配置
      console.log('✅ OS配置加载成功')
      return true
    } catch (error) {
      console.error('加载OS配置失败:', error)
      return false
    }
  }

  /**
   * 注册应用
   */
  registerApp(appConfig: AppConfig): boolean {
    try {
      this.config.apps[appConfig.id] = appConfig
      console.log(`✅ 应用注册成功: ${appConfig.name}`)
      return true
    } catch (error) {
      console.error('注册应用失败:', error)
      return false
    }
  }

  /**
   * 注销应用
   */
  unregisterApp(appId: string): boolean {
    if (this.config.apps[appId]) {
      delete this.config.apps[appId]
      
      // 如果当前应用被注销，切换到默认应用
      if (this.currentApp === appId) {
        this.switchToApp(this.config.default_app)
      }
      
      console.log(`✅ 应用注销成功: ${appId}`)
      return true
    }
    return false
  }

  /**
   * 切换应用
   */
  async switchToApp(appId: string): Promise<boolean> {
    const app = this.config.apps[appId]
    if (!app) {
      console.error(`应用不存在: ${appId}`)
      return false
    }

    try {
      // 加载应用到运行时
      const success = await this.runtimeService.loadApp(app)
      
      if (success) {
        this.currentApp = appId
        this.notifyListeners(appId)
        console.log(`✅ 切换应用成功: ${app.name}`)
        return true
      } else {
        console.error(`切换应用失败: ${app.name}`)
        return false
      }
    } catch (error) {
      console.error('切换应用异常:', error)
      return false
    }
  }

  /**
   * 获取当前应用
   */
  getCurrentApp(): AppConfig | null {
    if (this.currentApp) {
      return this.config.apps[this.currentApp] || null
    }
    return null
  }

  /**
   * 获取所有应用列表
   */
  getApps(): AppConfig[] {
    return Object.values(this.config.apps)
  }

  /**
   * 获取应用配置
   */
  getApp(appId: string): AppConfig | null {
    return this.config.apps[appId] || null
  }

  /**
   * 获取OS配置
   */
  getConfig(): OSConfig {
    return { ...this.config }
  }

  /**
   * 更新系统配置
   */
  updateSystemConfig(config: Partial<OSConfig['system']>): void {
    this.config.system = { ...this.config.system, ...config }
  }

  /**
   * 获取默认应用ID
   */
  getDefaultAppId(): string {
    return this.config.default_app
  }

  /**
   * 设置默认应用
   */
  setDefaultApp(appId: string): boolean {
    if (this.config.apps[appId]) {
      this.config.default_app = appId
      return true
    }
    return false
  }

  /**
   * 初始化默认应用
   */
  async initializeDefaultApp(): Promise<boolean> {
    const defaultAppId = this.getDefaultAppId()
    return await this.switchToApp(defaultAppId)
  }

  /**
   * 添加应用切换监听器
   */
  addAppChangeListener(callback: (appId: string) => void) {
    this.listeners.add(callback)
  }

  /**
   * 移除应用切换监听器
   */
  removeAppChangeListener(callback: (appId: string) => void) {
    this.listeners.delete(callback)
  }

  private notifyListeners(appId: string) {
    this.listeners.forEach(callback => {
      try {
        callback(appId)
      } catch (error) {
        console.error('应用切换监听器错误:', error)
      }
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.listeners.clear()
    this.currentApp = null
  }

  /**
   * 创建应用配置的便捷方法
   */
  static createAppConfig(config: {
    id: string
    name: string
    url: string
    type?: 'website' | 'spa' | 'desktop'
    features?: AppConfig['features']
    icon?: string
    description?: string
  }): AppConfig {
    return {
      type: 'website',
      features: {
        voice_control: true,
        ai_styling: true,
        traditional_mode: true,
        adaptive_ui: true
      },
      ...config
    }
  }
}