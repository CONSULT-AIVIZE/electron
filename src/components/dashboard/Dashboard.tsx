'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RealtimeVoice from '../RealtimeVoice'
import AIEnhancedView from '../AIEnhancedView'
import MatrixLoading from '../MatrixLoading'
import { RuntimeService } from '../../core/runtime/RuntimeService'
import { getSharedRuntimeService } from '../../core/runtime/sharedRuntime'
import type { AppConfig } from '../../core/config/appConfig'
import { appRegistry } from '../../core/config/appConfig'
import { getStartupAppConfig, initializeDefaultApps } from '../../core/config/defaultApps'

type ViewMode = 'ai' | 'traditional' | 'ai_enhanced'

const Dashboard = () => {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const sharedRuntimeService = getSharedRuntimeService() // 使用共享的 RuntimeService
  const [viewMode, setViewMode] = useState<ViewMode>('ai')
  const [currentApp, setCurrentApp] = useState<AppConfig | null>(null)
  const [availableApps, setAvailableApps] = useState<AppConfig[]>([])
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationTarget, setNavigationTarget] = useState('')
  const [showAppIframe, setShowAppIframe] = useState(false)
  const [currentIframeUrl, setCurrentIframeUrl] = useState('')

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Listen for OS navigation events
  useEffect(() => {
    const handleIframeNavigation = (event: CustomEvent) => {
      console.log('[Dashboard] Received iframe navigation event:', event.detail)
      
      if (event.detail.type === 'iframe_navigation') {
        setIsNavigating(true)
        setNavigationTarget(event.detail.fullUrl)
        
        // Show loading effect, then update iframe
        setTimeout(() => {
          setCurrentIframeUrl(event.detail.fullUrl)
          setShowAppIframe(true)
          setIsNavigating(false)
        }, 800) // Allow time for loading animation
      }
    }

    window.addEventListener('os_iframe_navigation', handleIframeNavigation as EventListener)
    
    return () => {
      window.removeEventListener('os_iframe_navigation', handleIframeNavigation as EventListener)
    }
  }, [])

  // Add navigation to home functionality
  useEffect(() => {
    const handleHomeNavigation = () => {
      console.log('[Dashboard] Navigating to home, hiding iframe')
      setShowAppIframe(false)
      setCurrentIframeUrl('')
    }

    // Listen for home navigation events
    const handleNavToHome = (event: CustomEvent) => {
      if (event.detail.type === 'navigate_home' || event.detail.targetPath === '/') {
        handleHomeNavigation()
      }
    }

    window.addEventListener('os_iframe_navigation', handleNavToHome as EventListener)
    
    return () => {
      window.removeEventListener('os_iframe_navigation', handleNavToHome as EventListener)
    }
  }, [])

  // Initialize OS with universal app system
  useEffect(() => {
    const initializeOS = async () => {
      try {
        // 首先初始化默认应用配置
        await initializeDefaultApps()
        
        // 获取可用应用列表
        const apps = appRegistry?.getAll() || []
        setAvailableApps(apps)
        
        // 获取启动应用
        const startupApp = getStartupAppConfig()
        if (startupApp) {
          setCurrentApp(startupApp)
          console.log('✅ 设置启动应用:', startupApp.name)
          
          // 重要：无论哪个模式，都要加载应用到 RuntimeService 以支持语音指令
          console.log('📡 [Dashboard] 加载应用到 RuntimeService...')
          const loadResult = await sharedRuntimeService.loadApp(startupApp)
          console.log('🔄 [Dashboard] 应用加载结果:', loadResult)
        } else {
          console.warn('⚠️ 没有可用的应用配置')
        }
      } catch (error) {
        console.error('❌ OS初始化异常:', error)
        // 即使初始化失败，也要确保组件能正常显示
        setAvailableApps([])
        setCurrentApp(null)
      }
    }

    initializeOS()

    return () => {
      runtimeService.destroy()
    }
  }, [])

  const switchToNextMode = () => {
    setViewMode(prev => {
      switch (prev) {
        case 'ai': return 'ai_enhanced'
        case 'ai_enhanced': return 'traditional'
        case 'traditional': return 'ai'
        default: return 'ai'
      }
    })
  }

  const getModeButtonText = () => {
    switch (viewMode) {
      case 'ai': return 'AI增强'
      case 'ai_enhanced': return '传统模式'
      case 'traditional': return 'AI模式'
    }
  }

  // 传统模式：纯iframe
  if (viewMode === 'traditional') {
    if (!currentApp) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="text-xl mb-2">⚙️</div>
            <div>正在初始化应用...</div>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full w-full relative">
        <button
          onClick={switchToNextMode}
          className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black bg-opacity-40 backdrop-blur-md text-white text-sm rounded-lg border border-white border-opacity-20 hover:bg-opacity-60 transition-all"
        >
          {getModeButtonText()}
        </button>
        
        <iframe
          src={currentApp.url}
          className="w-full h-full border-0"
          title={`${currentApp.name} - Traditional Mode`}
        />
      </div>
    )
  }

  // AI增强模式：双面板
  if (viewMode === 'ai_enhanced') {
    if (!currentApp) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="text-xl mb-2">⚙️</div>
            <div>正在初始化应用...</div>
          </div>
        </div>
      )
    }

    return (
      <AIEnhancedView
        websiteUrl={currentApp.url}
        appConfig={currentApp}
        onToggleMode={switchToNextMode}
      />
    )
  }

  // AI模式：与增强模式相同的左侧内容（上面iframe，下面语音）
  if (!currentApp) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-xl mb-2">⚙️</div>
          <div>正在初始化应用...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-black">
      <div className="flex flex-col h-full">
        {/* 上部：页面显示区 */}
        <div className={`flex-1 relative ${showAppIframe ? '' : 'bg-gradient-to-b from-gray-900 to-black'}`}>
          {showAppIframe && currentIframeUrl ? (
            /* 显示应用 iframe */
            <iframe
              src={currentIframeUrl}
              className="w-full h-full border-0"
              title="CONSULT_AI Application"
              id="app-iframe"
            />
          ) : (
            /* 默认显示语音指令集页面 */
            <div className="h-full w-full flex flex-col items-center justify-center p-8">
              <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-light text-white mb-4">Triangle OS 语音助手</h1>
                  <p className="text-xl text-gray-300 opacity-80">使用语音指令控制系统和应用</p>
                </div>
                
                {/* 语音指令展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">💬</div>
                    <h3 className="text-white text-lg font-medium mb-2">AI 咨询</h3>
                    <p className="text-gray-300 text-sm mb-3">智能对话和咨询服务</p>
                    <div className="text-blue-300 text-xs">说："打开咨询" 或 "开始咨询"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">⚙️</div>
                    <h3 className="text-white text-lg font-medium mb-2">系统设置</h3>
                    <p className="text-gray-300 text-sm mb-3">配置系统偏好和选项</p>
                    <div className="text-blue-300 text-xs">说："打开设置" 或 "系统设置"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🔄</div>
                    <h3 className="text-white text-lg font-medium mb-2">切换模式</h3>
                    <p className="text-gray-300 text-sm mb-3">在不同显示模式间切换</p>
                    <div className="text-blue-300 text-xs">说："切换模式" 或 "增强模式"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🏠</div>
                    <h3 className="text-white text-lg font-medium mb-2">返回主页</h3>
                    <p className="text-gray-300 text-sm mb-3">回到语音助手主界面</p>
                    <div className="text-blue-300 text-xs">说："回到主页" 或 "主页"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">📱</div>
                    <h3 className="text-white text-lg font-medium mb-2">应用控制</h3>
                    <p className="text-gray-300 text-sm mb-3">控制应用窗口状态</p>
                    <div className="text-blue-300 text-xs">说："最小化" 或 "全屏"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🎯</div>
                    <h3 className="text-white text-lg font-medium mb-2">更多功能</h3>
                    <p className="text-gray-300 text-sm mb-3">探索其他语音功能</p>
                    <div className="text-blue-300 text-xs">语音识别会自动发现更多指令</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 模式切换按钮 */}
          <button
            onClick={switchToNextMode}
            className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black bg-opacity-40 backdrop-blur-md text-white text-sm rounded-lg border border-white border-opacity-20 hover:bg-opacity-60 transition-all"
          >
            {getModeButtonText()}
          </button>
        </div>
        
        {/* 下部：语音显示区 - 始终保持可见 */}
        <div className="h-32 border-t border-gray-700 bg-gradient-to-b from-slate-900 to-black">
          <RealtimeVoice className="h-full" />
        </div>
      </div>
      
      {/* MatrixLoading 覆盖层 */}
      {isNavigating && (
        <div className="absolute inset-0 z-[100]">
          <MatrixLoading
            message={`正在导航到 ${navigationTarget}`}
            duration={800}
            onComplete={() => {
              console.log('[Dashboard] MatrixLoading completed')
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Dashboard