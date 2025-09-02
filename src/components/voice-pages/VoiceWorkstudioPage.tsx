'use client'

import React, { useState, useEffect } from 'react'

const VoiceWorkstudioPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeCommands, setActiveCommands] = useState([
    { id: 1, name: '智能咨询', trigger: '打开咨询', status: 'active', usage: 24 },
    { id: 2, name: '系统设置', trigger: '打开设置', status: 'active', usage: 18 },
    { id: 3, name: '返回主页', trigger: '回到主页', status: 'active', usage: 31 },
    { id: 4, name: '切换模式', trigger: '切换模式', status: 'active', usage: 12 },
    { id: 5, name: '语音工作室', trigger: '工作室', status: 'active', usage: 8 }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-full w-full bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 border border-purple-500 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-blue-500 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-green-500 rounded-full animate-spin" style={{ animationDuration: '25s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-light text-white">语音指令工作室</h1>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl text-gray-300 opacity-80">
            Triangle OS 指令管理与配置中心 - AI智能工作台
          </p>
          <div className="text-purple-400 text-sm mt-2">
            系统时间: {currentTime.toLocaleString('zh-CN')}
          </div>
        </div>

        {/* 工作台统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-500 border-opacity-30">
            <div className="text-purple-400 text-2xl font-bold">{activeCommands.length}</div>
            <div className="text-purple-300 text-sm">活跃指令</div>
            <div className="text-purple-200 text-xs mt-1">系统运行中</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-500 border-opacity-30">
            <div className="text-blue-400 text-2xl font-bold">93</div>
            <div className="text-blue-300 text-sm">总使用次数</div>
            <div className="text-blue-200 text-xs mt-1">本周统计</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-500 border-opacity-30">
            <div className="text-green-400 text-2xl font-bold">98%</div>
            <div className="text-green-300 text-sm">识别精度</div>
            <div className="text-green-200 text-xs mt-1">语音引擎</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl p-6 border border-orange-500 border-opacity-30">
            <div className="text-orange-400 text-2xl font-bold">24/7</div>
            <div className="text-orange-300 text-sm">在线状态</div>
            <div className="text-orange-200 text-xs mt-1">持续监听</div>
          </div>
        </div>

        {/* 指令管理面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：活跃指令列表 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-medium">活跃指令集</h3>
              <span className="text-purple-400 text-sm bg-purple-500 bg-opacity-20 px-2 py-1 rounded-full">
                {activeCommands.length} 个指令
              </span>
            </div>
            
            <div className="space-y-3">
              {activeCommands.map((command) => (
                <div key={command.id} className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600 border-opacity-30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">{command.name}</div>
                    <div className={`w-2 h-2 rounded-full ${command.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">触发词: "{command.trigger}"</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">使用次数: {command.usage}</span>
                    <span className="text-purple-400">{command.status === 'active' ? '运行中' : '离线'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：系统控制面板 */}
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
              <h3 className="text-white text-xl font-medium mb-6">语音引擎控制</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                  <span className="text-gray-300">连续识别</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                  <span className="text-gray-300">自动重启</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                  <span className="text-gray-300">噪声抑制</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
              <h3 className="text-white text-xl font-medium mb-6">快速操作</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-purple-600 bg-opacity-20 text-purple-300 text-sm rounded-lg border border-purple-500 border-opacity-30 hover:bg-opacity-30 transition-all">
                  刷新指令集
                </button>
                <button className="p-3 bg-blue-600 bg-opacity-20 text-blue-300 text-sm rounded-lg border border-blue-500 border-opacity-30 hover:bg-opacity-30 transition-all">
                  导出配置
                </button>
                <button className="p-3 bg-green-600 bg-opacity-20 text-green-300 text-sm rounded-lg border border-green-500 border-opacity-30 hover:bg-opacity-30 transition-all">
                  重置引擎
                </button>
                <button className="p-3 bg-orange-600 bg-opacity-20 text-orange-300 text-sm rounded-lg border border-orange-500 border-opacity-30 hover:bg-opacity-30 transition-all">
                  系统诊断
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <div className="text-gray-400 text-sm mb-4">工作室语音指令</div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '返回主页',
              '刷新指令',
              '导出配置',
              '系统诊断',
              '打开设置',
              '语音引擎'
            ].map((command, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 bg-opacity-20 text-white text-xs rounded-full border border-purple-400 border-opacity-30"
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

export default VoiceWorkstudioPage