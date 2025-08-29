'use client'

import React, { useState, useEffect } from 'react'

export default function TestPage() {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('zh-CN'))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleBackToDesktop = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="h-12 bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-5 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="window-controls">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-lg font-semibold text-white">AI 生成测试页面</h1>
        </div>
        <button 
          onClick={handleBackToDesktop}
          className="os-button text-xs"
        >
          返回桌面
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 border-2 border-green-300 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-green-400 mb-2">
              🎉 系统编译成功！
            </h1>
            <p className="text-green-300 text-lg">
              AI已成功生成并运行新的界面模块
            </p>
          </div>

          {/* System Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl border border-green-400 border-opacity-30 p-6">
              <h3 className="text-green-400 text-xl font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                编译状态
              </h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-300">编译时间:</span>
                  <span className="text-green-400">2.34秒</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">代码行数:</span>
                  <span className="text-green-400">1,247行</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">组件数量:</span>
                  <span className="text-green-400">15个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">内存占用:</span>
                  <span className="text-green-400">12.8MB</span>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl border border-blue-400 border-opacity-30 p-6">
              <h3 className="text-blue-400 text-xl font-semibold mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                系统信息
              </h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-300">当前时间:</span>
                  <span className="text-blue-400">{currentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">AI模型:</span>
                  <span className="text-blue-400">Claude-3.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">运行环境:</span>
                  <span className="text-blue-400">Electron</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">框架版本:</span>
                  <span className="text-blue-400">Next.js 15</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Code Sample */}
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl border border-purple-400 border-opacity-30 p-6 mb-8">
            <h3 className="text-purple-400 text-xl font-semibold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              生成的代码样例
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-gray-500 mb-2">// AI自动生成的React组件</div>
              <div className="text-blue-400">export default function <span className="text-yellow-400">AIGeneratedComponent</span>() {'{'}
              </div>
              <div className="text-gray-300 ml-2">
                <div className="text-purple-400">const</div> [<span className="text-green-400">isActive</span>, <span className="text-green-400">setIsActive</span>] = <span className="text-blue-400">useState</span>(<span className="text-yellow-400">true</span>)
              </div>
              <div className="text-gray-300 ml-2 mt-2">
                <div className="text-purple-400">return</div> (
              </div>
              <div className="text-gray-300 ml-4">
                &lt;<span className="text-red-400">div</span> <span className="text-green-400">className</span>=<span className="text-yellow-400">"ai-interface"</span>&gt;
              </div>
              <div className="text-gray-300 ml-6">
                &lt;<span className="text-red-400">h1</span>&gt;AI生成界面&lt;/<span className="text-red-400">h1</span>&gt;
              </div>
              <div className="text-gray-300 ml-4">
                &lt;/<span className="text-red-400">div</span>&gt;
              </div>
              <div className="text-gray-300 ml-2">
                )
              </div>
              <div className="text-blue-400">{'}'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleBackToDesktop}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                         text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 
                         shadow-lg hover:shadow-xl"
            >
              返回桌面
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 
                         text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 
                         shadow-lg hover:shadow-xl"
            >
              重新生成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}