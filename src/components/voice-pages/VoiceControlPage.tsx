'use client'

import React, { useState, useEffect, useRef } from 'react'

interface VoiceCommand {
  id: string
  command: string
  timestamp: Date
  status: 'processing' | 'completed' | 'failed'
  result?: string
}

const VoiceControlPage: React.FC = () => {
  const [commands, setCommands] = useState<VoiceCommand[]>([])
  const [inputCommand, setInputCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemStatus, setSystemStatus] = useState({
    voiceRecognition: true,
    bridgeConnection: true,
    runtimeService: true
  })
  const commandsEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [commands])

  const scrollToBottom = () => {
    commandsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const executeCommand = async () => {
    if (!inputCommand.trim()) return

    const voiceCommand: VoiceCommand = {
      id: Date.now().toString(),
      command: inputCommand,
      timestamp: new Date(),
      status: 'processing'
    }

    setCommands(prev => [...prev, voiceCommand])
    setInputCommand('')
    setIsProcessing(true)

    // 模拟语音指令处理（实际项目中这里会调用RuntimeService）
    setTimeout(() => {
      const result = processVoiceCommand(voiceCommand.command)
      setCommands(prev => prev.map(cmd => 
        cmd.id === voiceCommand.id 
          ? { ...cmd, status: 'completed', result }
          : cmd
      ))
      setIsProcessing(false)
    }, 1000 + Math.random() * 2000)
  }

  const processVoiceCommand = (command: string): string => {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('设置') || lowerCommand.includes('系统设置')) {
      return '正在打开系统设置页面...'
    } else if (lowerCommand.includes('主页') || lowerCommand.includes('桌面')) {
      return '正在返回语音主页...'
    } else if (lowerCommand.includes('工作室') || lowerCommand.includes('指令')) {
      return '正在打开指令工作室...'
    } else if (lowerCommand.includes('切换') || lowerCommand.includes('模式')) {
      return '正在切换显示模式...'
    } else {
      return `语音指令"${command}"已接收，正在处理...`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeCommand()
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-900 to-black flex flex-col">
      {/* 头部 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-slate-900 bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-light text-white">语音控制中心</h1>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-cyan-400 text-sm">
            {currentTime.toLocaleTimeString('zh-CN', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
        
        {/* 系统状态指示器 */}
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.voiceRecognition ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-xs ${systemStatus.voiceRecognition ? 'text-green-400' : 'text-red-400'}`}>语音识别</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.bridgeConnection ? 'bg-blue-400' : 'bg-red-400'}`} style={{ animationDelay: '0.5s' }}></div>
            <span className={`text-xs ${systemStatus.bridgeConnection ? 'text-blue-400' : 'text-red-400'}`}>Bridge连接</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${systemStatus.runtimeService ? 'bg-purple-400' : 'bg-red-400'}`} style={{ animationDelay: '1s' }}></div>
            <span className={`text-xs ${systemStatus.runtimeService ? 'text-purple-400' : 'text-red-400'}`}>运行时服务</span>
          </div>
        </div>
      </div>

      {/* 语音控制区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 指令历史列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commands.length === 0 ? (
            /* 控制台欢迎界面 */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-8">
                <div className="text-6xl mb-4">🎙️</div>
                <h2 className="text-3xl font-light text-white mb-4">Triangle OS 语音控制中心</h2>
                <p className="text-gray-300 text-lg mb-6">
                  通用语音指令处理系统，支持语音和文本输入
                </p>
                
                {/* 系统指令示例 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { icon: '🏠', text: '返回主页', command: '回到主页' },
                    { icon: '⚙️', text: '系统设置', command: '打开设置' },
                    { icon: '🛠️', text: '指令工作室', command: '显示工作室' },
                    { icon: '🔄', text: '切换模式', command: '切换模式' }
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setInputCommand(item.command)}
                      className="p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 text-left"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-white text-sm font-medium">{item.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 指令历史展示 */
            commands.map((command) => (
              <div key={command.id} className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl p-4 bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">语音指令</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      command.status === 'processing' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                      command.status === 'completed' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                      'bg-red-500 bg-opacity-20 text-red-300'
                    }`}>
                      {command.status === 'processing' ? '处理中' :
                       command.status === 'completed' ? '已完成' : '失败'}
                    </div>
                  </div>
                  <div className="text-lg leading-relaxed mb-2">"{command.command}"</div>
                  {command.result && (
                    <div className="text-sm text-gray-300 bg-black bg-opacity-20 rounded p-2">
                      {command.result}
                    </div>
                  )}
                  <div className="text-xs mt-2 opacity-70 text-gray-400">
                    {command.timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* 处理指示器 */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl p-4 bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-gray-300 text-sm ml-2">系统处理中...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={commandsEndRef} />
        </div>

        {/* 指令输入区域 */}
        <div className="flex-shrink-0 p-4 bg-slate-900 bg-opacity-50 backdrop-blur-sm border-t border-gray-700">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入语音指令，或直接使用语音控制..."
                className="w-full p-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-opacity-20 transition-all duration-300"
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={executeCommand}
              disabled={!inputCommand.trim() || isProcessing}
              className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-300 flex items-center justify-center min-w-[48px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
          
          {/* 系统指令提示 */}
          <div className="mt-2 text-center">
            <div className="text-gray-400 text-xs">
              系统指令: "回到主页" | "打开设置" | "显示工作室" | "切换模式"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceControlPage