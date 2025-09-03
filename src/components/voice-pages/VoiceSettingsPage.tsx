'use client'

import React, { useState, useEffect } from 'react'

const VoiceSettingsPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemStatus, setSystemStatus] = useState({
    ai_engine: 'online',
    voice_recognition: 'active',
    network: 'connected',
    storage: '78%'
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-full w-full bg-gradient-to-b from-gray-900 via-slate-800 to-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* 背景网格效果 */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div 
              key={i} 
              className="border border-gray-500 rounded"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animation: 'pulse 3s infinite'
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-light text-white">系统设置中心</h1>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl text-gray-300 opacity-80">
            Triangle OS 配置控制面板 - 语音优化界面
          </p>
          <div className="text-orange-400 text-sm mt-2">
            系统时间: {currentTime.toLocaleString('zh-CN')}
          </div>
        </div>

        {/* 系统状态面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-6 border border-green-500 border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-400 text-lg font-medium">AI引擎</div>
                <div className="text-green-300 text-sm">运行状态</div>
              </div>
              <div className="w-8 h-8 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-green-200 text-xs mt-2">在线 | 性能优异</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 border border-blue-500 border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-400 text-lg font-medium">语音识别</div>
                <div className="text-blue-300 text-sm">活动状态</div>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-blue-200 text-xs mt-2">激活 | 准确度 98%</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-2xl p-6 border border-purple-500 border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-400 text-lg font-medium">网络连接</div>
                <div className="text-purple-300 text-sm">连接状态</div>
              </div>
              <div className="w-8 h-8 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-purple-200 text-xs mt-2">已连接 | 延迟 12ms</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-2xl p-6 border border-yellow-500 border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-yellow-400 text-lg font-medium">存储空间</div>
                <div className="text-yellow-300 text-sm">使用情况</div>
              </div>
              <div className="text-yellow-400 text-2xl font-bold">78%</div>
            </div>
            <div className="text-yellow-200 text-xs mt-2">256GB 可用空间</div>
          </div>
        </div>

        {/* 设置模块 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-white text-xl font-medium mb-3">语音设置</h3>
            <p className="text-gray-300 text-sm mb-4">
              配置语音识别、合成和语言偏好
            </p>
            <div className="text-orange-300 text-xs mb-3">
              语音指令："语音设置" 或 "声音配置"
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">识别语言</span>
                <span className="text-white">中文</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">灵敏度</span>
                <span className="text-white">高</span>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-white text-xl font-medium mb-3">界面主题</h3>
            <p className="text-gray-300 text-sm mb-4">
              个性化界面外观和视觉效果
            </p>
            <div className="text-orange-300 text-xs mb-3">
              语音指令："更换主题" 或 "界面设置"
            </div>
            <div className="flex space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-white text-xl font-medium mb-3">隐私安全</h3>
            <p className="text-gray-300 text-sm mb-4">
              管理数据隐私和系统安全设置
            </p>
            <div className="text-orange-300 text-xs mb-3">
              语音指令："隐私设置" 或 "安全配置"
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">数据加密</span>
                <span className="text-green-400">启用</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">自动锁定</span>
                <span className="text-green-400">30分钟</span>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-white text-xl font-medium mb-3">网络配置</h3>
            <p className="text-gray-300 text-sm mb-4">
              配置网络连接和云服务设置
            </p>
            <div className="text-orange-300 text-xs mb-3">
              语音指令："网络设置" 或 "连接配置"
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">WiFi状态</span>
                <span className="text-green-400">已连接</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">云同步</span>
                <span className="text-blue-400">启用</span>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-white text-xl font-medium mb-3">性能优化</h3>
            <p className="text-gray-300 text-sm mb-4">
              系统性能监控和优化设置
            </p>
            <div className="text-orange-300 text-xs mb-3">
              语音指令："性能设置" 或 "系统优化"
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">CPU使用率</span>
                <span className="text-yellow-400">32%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">内存使用</span>
                <span className="text-blue-400">56%</span>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-white text-xl font-medium mb-3">系统更新</h3>
            <p className="text-gray-300 text-sm mb-4">
              检查更新和系统维护设置
            </p>
            <div className="text-orange-300 text-xs mb-3">
              语音指令："检查更新" 或 "系统维护"
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">当前版本</span>
                <span className="text-white">v2.1.0</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">最后更新</span>
                <span className="text-green-400">3天前</span>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-12 text-center">
          <div className="text-gray-400 text-sm mb-4">快捷语音指令</div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '返回主页',
              '语音设置',
              '更换主题', 
              '隐私设置',
              '检查更新',
              '系统重启'
            ].map((command, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 bg-opacity-20 text-white text-xs rounded-full border border-orange-400 border-opacity-30"
              >
                "{command}"
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceSettingsPage