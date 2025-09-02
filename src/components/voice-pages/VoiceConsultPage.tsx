'use client'

import React, { useState, useEffect } from 'react'

const VoiceConsultPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-900 via-purple-900 to-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* 背景动画效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-purple-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-cyan-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* 页面标题 */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-light text-white">AI 智能咨询</h1>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl text-gray-300 opacity-80">
            由AI驱动的专业咨询服务 - 语音优化界面
          </p>
          <div className="text-cyan-400 text-sm mt-2">
            {currentTime.toLocaleTimeString('zh-CN', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        {/* 功能模块 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-white text-xl font-medium mb-3">智能分析</h3>
            <p className="text-gray-300 text-sm mb-4">
              基于深度学习的问题分析和解决方案推荐
            </p>
            <div className="text-cyan-300 text-xs">
              语音指令："开始分析" 或 "智能分析"
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">💭</div>
            <h3 className="text-white text-xl font-medium mb-3">对话咨询</h3>
            <p className="text-gray-300 text-sm mb-4">
              自然语言交互，实时响应您的咨询需求
            </p>
            <div className="text-cyan-300 text-xs">
              语音指令："开始对话" 或 "我要咨询"
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white text-xl font-medium mb-3">数据洞察</h3>
            <p className="text-gray-300 text-sm mb-4">
              多维度数据分析，提供深度业务洞察
            </p>
            <div className="text-cyan-300 text-xs">
              语音指令："查看数据" 或 "分析报告"
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-white text-xl font-medium mb-3">方案定制</h3>
            <p className="text-gray-300 text-sm mb-4">
              个性化解决方案，精准匹配您的需求
            </p>
            <div className="text-cyan-300 text-xs">
              语音指令："定制方案" 或 "个性化服务"
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-white text-xl font-medium mb-3">实时支持</h3>
            <p className="text-gray-300 text-sm mb-4">
              24/7在线支持，即时响应您的问题
            </p>
            <div className="text-cyan-300 text-xs">
              语音指令："获取帮助" 或 "在线支持"
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-white text-xl font-medium mb-3">全球连接</h3>
            <p className="text-gray-300 text-sm mb-4">
              连接全球专家网络，获得最优质的咨询
            </p>
            <div className="text-cyan-300 text-xs">
              语音指令："连接专家" 或 "全球咨询"
            </div>
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">AI系统在线</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-blue-400 text-sm">语音控制就绪</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="text-purple-400 text-sm">专家网络连接</span>
          </div>
        </div>

        {/* 快捷操作提示 */}
        <div className="mt-8 text-center">
          <div className="text-gray-400 text-sm mb-2">常用语音指令</div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '返回主页',
              '开始对话', 
              '智能分析',
              '查看数据',
              '获取帮助'
            ].map((command, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white bg-opacity-10 text-white text-xs rounded-full border border-white border-opacity-20"
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

export default VoiceConsultPage