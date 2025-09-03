'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VoiceAssistant from '../VoiceAssistant'
import AIEnhancedView from '../AIEnhancedView'
import { RuntimeService } from '../../core/runtime/RuntimeService'
import type { AppConfig } from '../../core/config/appConfig'
import { appRegistry } from '../../core/config/appConfig'
import { getStartupAppConfig, initializeDefaultApps } from '../../core/config/defaultApps'

type ViewMode = 'ai' | 'traditional' | 'ai_enhanced'

const Dashboard = () => {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [runtimeService] = useState(() => new RuntimeService())
  const [viewMode, setViewMode] = useState<ViewMode>('ai')
  const [currentApp, setCurrentApp] = useState<AppConfig | null>(null)
  const [availableApps, setAvailableApps] = useState<AppConfig[]>([])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
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
        {/* 上部：语音优化页面显示区 */}
        <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black">
          {/* 默认显示语音指令集页面，而不是iframe */}
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
          
          {/* 模式切换按钮 */}
          <button
            onClick={switchToNextMode}
            className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black bg-opacity-40 backdrop-blur-md text-white text-sm rounded-lg border border-white border-opacity-20 hover:bg-opacity-60 transition-all"
          >
            {getModeButtonText()}
          </button>
        </div>
        
        {/* 下部：语音显示区 */}
        <div className="h-32 border-t border-gray-700 bg-gradient-to-b from-slate-900 to-black">
          <VoiceAssistant className="h-full" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard