/**
 * Triangle OS Default Apps Configuration
 * 默认应用配置 - 可通过环境变量或外部配置文件覆盖
 */

import { AppConfig, appRegistry, registerAppFromUrl } from './appConfig'

/**
 * 初始化默认应用配置
 * 在实际部署中，这些配置应该从外部配置文件或环境变量读取
 */
export const initializeDefaultApps = async (): Promise<void> => {
  console.log('🚀 初始化Triangle OS默认应用配置...')
  
  // 从环境变量读取应用配置
  const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_DEFAULT_APP_URL || 'http://localhost:3000'
  const DEFAULT_APP_NAME = process.env.NEXT_PUBLIC_DEFAULT_APP_NAME || 'CONSULT_AI 咨询平台'
  
  try {
    // 尝试动态发现并注册应用
    const discoveredApp = await registerAppFromUrl(DEFAULT_APP_URL)
    
    if (discoveredApp) {
      console.log('✅ 自动发现并注册应用:', discoveredApp.name)
    } else {
      // 如果无法自动发现，使用后备配置
      console.log('⚠️ 无法自动发现应用协议，使用后备配置')
      
      const fallbackConfig: AppConfig = {
        id: 'fallback.app',
        name: DEFAULT_APP_NAME,
        url: DEFAULT_APP_URL,
        type: 'website',
        icon: '🌐',
        description: '后备应用配置',
        features: {
          voice_control: true,
          ai_styling: true,
          traditional_mode: true,
          adaptive_ui: true
        }
      }
      
      appRegistry.register(fallbackConfig)
      console.log('✅ 注册后备应用配置:', fallbackConfig.name)
    }
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    
    // 即使出现错误，也要确保有一个后备应用配置
    console.log('🔧 创建紧急后备应用配置')
    const emergencyConfig: AppConfig = {
      id: 'emergency.app',
      name: DEFAULT_APP_NAME,
      url: DEFAULT_APP_URL,
      type: 'website',
      icon: '🌐',
      description: '紧急后备应用配置',
      features: {
        voice_control: true,
        ai_styling: true,
        traditional_mode: true,
        adaptive_ui: true
      }
    }
    
    appRegistry.register(emergencyConfig)
    console.log('✅ 注册紧急后备应用配置:', emergencyConfig.name)
  }
  
  console.log('📱 已注册的应用:', appRegistry.getAll().map(app => app.name))
}

/**
 * 获取启动应用配置
 * 返回第一个可用的应用配置，如果没有则返回null
 */
export const getStartupAppConfig = (): AppConfig | null => {
  const allApps = appRegistry.getAll()
  return allApps.length > 0 ? allApps[0] : null
}

/**
 * 添加应用到注册表（运行时动态添加）
 */
export const addApp = (config: Partial<AppConfig> & { id: string, name: string, url: string }): void => {
  const fullConfig: AppConfig = {
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
  
  appRegistry.register(fullConfig)
  console.log('✅ 运行时添加应用:', fullConfig.name)
}