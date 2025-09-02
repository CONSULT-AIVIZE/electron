/**
 * Triangle OS Universal App Configuration System
 * 通用应用配置系统 - 完全与具体业务解耦
 * 遵循Triangle OS Application Integration Protocol v1.0
 */

export interface AppConfig {
  id: string
  name: string
  url: string
  type: 'website' | 'spa' | 'desktop'
  icon?: string
  description?: string
  // 可选的功能标记
  features?: {
    voice_control?: boolean
    ai_styling?: boolean
    traditional_mode?: boolean
    adaptive_ui?: boolean
  }
}

/**
 * 应用注册表 - 从外部配置或运行时动态添加
 */
class AppRegistry {
  private apps: Map<string, AppConfig> = new Map()
  
  /**
   * 注册应用
   */
  register(config: AppConfig): void {
    this.apps.set(config.id, config)
  }
  
  /**
   * 获取应用配置
   */
  get(appId: string): AppConfig | null {
    return this.apps.get(appId) || null
  }
  
  /**
   * 获取所有应用
   */
  getAll(): AppConfig[] {
    return Array.from(this.apps.values())
  }
  
  /**
   * 移除应用
   */
  unregister(appId: string): boolean {
    return this.apps.delete(appId)
  }
  
  /**
   * 检查应用是否存在
   */
  has(appId: string): boolean {
    return this.apps.has(appId)
  }
}

// 全局应用注册表实例
export const appRegistry = new AppRegistry()

/**
 * 创建应用配置的工厂函数
 */
export const createAppConfig = (config: Partial<AppConfig> & { 
  id: string, 
  name: string, 
  url: string 
}): AppConfig => {
  return {
    type: 'website',
    icon: '🌐',
    description: '',
    features: {
      voice_control: true,
      ai_styling: true,
      traditional_mode: true,
      adaptive_ui: true
    },
    ...config
  }
}

/**
 * 批量注册应用
 */
export const registerApps = (configs: AppConfig[]): void => {
  configs.forEach(config => appRegistry.register(config))
}

/**
 * 从URL注册应用（用于动态发现应用）
 */
export const registerAppFromUrl = async (url: string): Promise<AppConfig | null> => {
  try {
    // 使用API端点而不是静态文件，以支持CORS
    const protocolUrl = `${url}/api/ai/protocol.json`
    console.log('🔍 尝试从URL获取应用协议:', protocolUrl)
    
    // 尝试从URL获取协议配置
    const protocolResponse = await fetch(protocolUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 添加超时控制
      signal: AbortSignal.timeout(5000)
    })
    
    if (!protocolResponse.ok) {
      throw new Error(`Protocol file not found - HTTP ${protocolResponse.status}`)
    }
    
    const protocol = await protocolResponse.json()
    console.log('📋 获取到应用协议:', protocol)
    
    const config: AppConfig = {
      id: protocol.app.id,
      name: protocol.app.name,
      url: url,
      type: 'website',
      icon: protocol.app.icon || '🌐',
      description: protocol.app.description || '',
      features: protocol.features
    }
    
    appRegistry.register(config)
    console.log('✅ 成功注册应用:', config.name)
    return config
  } catch (error) {
    console.error('❌ 无法从URL注册应用:', url)
    console.error('错误详情:', error)
    
    // 如果是网络错误，提供更具体的错误信息
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('💡 可能的原因: 网络连接问题，CORS配置问题，或目标服务器未运行')
    }
    
    return null
  }
}

// 默认应用配置（可以通过环境变量或配置文件覆盖）
const DEFAULT_APPS: AppConfig[] = [
  {
    id: 'example.app',
    name: '示例应用',
    url: 'http://localhost:3000',
    type: 'website',
    icon: '🌐',
    description: '遵循Triangle OS协议的示例应用',
    features: {
      voice_control: true,
      ai_styling: true,
      traditional_mode: true,
      adaptive_ui: true
    }
  }
]

// 初始化默认应用
registerApps(DEFAULT_APPS)