'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AppItem {
  id: string
  name: string
  icon: React.ReactNode
  route: string
  color: string
  description: string
}

const Dashboard = () => {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const apps: AppItem[] = [
    {
      id: 'consult',
      name: 'AI Consult',
      route: '/consult',
      color: 'from-blue-500 to-purple-600',
      description: 'AI-powered consultation system',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'settings',
      name: 'Settings',
      route: '/settings',
      color: 'from-gray-600 to-gray-800',
      description: 'System settings and preferences',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'browser',
      name: 'Browser',
      route: '#',
      color: 'from-orange-500 to-red-600',
      description: 'Web browser (Coming Soon)',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    {
      id: 'files',
      name: 'Files',
      route: '#',
      color: 'from-green-500 to-teal-600',
      description: 'File manager (Coming Soon)',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }
  ]

  const handleAppClick = (app: AppItem) => {
    if (app.route !== '#') {
      router.push(app.route)
    }
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900" />
        {/* Animated particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* System Status Bar */}
      <div className="relative z-10 h-8 bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-5 flex items-center justify-between px-4 text-xs text-white text-opacity-70">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="font-medium">TriangleOS</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <span className="font-mono">
            {currentTime.toLocaleTimeString('zh-CN', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span>
            {currentTime.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Desktop Area */}
      <div className="flex-1 relative z-10 p-8">
        {/* Desktop Grid */}
        <div className="grid grid-cols-8 gap-4 h-full">
          
          {/* Left Side - Applications */}
          <div className="col-span-5 space-y-6">
            
            {/* Applications Grid */}
            <div className="grid grid-cols-6 gap-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="group cursor-pointer"
                >
                  <div className={`
                    w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} 
                    flex items-center justify-center shadow-lg
                    transform transition-all duration-200
                    group-hover:scale-110 group-hover:shadow-2xl
                    group-active:scale-95
                    ${app.route === '#' ? 'opacity-50' : ''}
                  `}>
                    <div className="scale-75">
                      {app.icon}
                    </div>
                    {app.route === '#' && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
                        <span className="text-[8px] text-white/80 font-medium">Soon</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-center">
                    <span className="text-xs text-white/80 font-medium">
                      {app.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Side - System Info & Quick Actions */}
          <div className="col-span-3 space-y-6">
            
            {/* Welcome Panel */}
            <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-10">
              <h2 className="text-2xl font-bold text-white mb-2">
                欢迎使用 TriangleOS
              </h2>
              <p className="text-sm text-white/60 mb-4">
                AI 驱动的语音交互桌面系统
              </p>
              <div className="flex items-center space-x-2 text-xs text-white/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>语音控制已启用</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-10">
              <h3 className="text-lg font-semibold text-white mb-4">快速操作</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/consult')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105"
                >
                  开始 AI 咨询
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20 rounded-xl text-white text-sm font-medium border border-white border-opacity-20 transition-all duration-200"
                >
                  系统设置
                </button>
              </div>
            </div>

            {/* System Stats */}
            <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-10">
              <h3 className="text-lg font-semibold text-white mb-4">系统状态</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">系统版本</span>
                  <span className="text-sm text-white font-mono">v1.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">运行时间</span>
                  <span className="text-sm text-white font-mono">
                    {Math.floor((Date.now() - Date.now()) / 60000) || '< 1'}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">语音识别</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">就绪</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard