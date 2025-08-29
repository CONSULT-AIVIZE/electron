'use client'

import React, { useState, useEffect, useRef } from 'react'

interface CodeGenerationProps {
  isGenerating: boolean
  targetPage: string // 'consult' | 'settings' | null
  onComplete: () => void
}

// 模拟的代码片段数据
const codeSnippets = {
  test: [
    '// AI 启动语音识别模块',
    'import React, { useState, useEffect } from "react"',
    'import { VoiceRecognition } from "@/lib/voice"',
    '',
    '// 初始化AI语音处理系统',
    'const AIVoiceSystem = () => {',
    '  console.log("🎤 正在激活语音识别...")',
    '  ',
    '  // 启动神经网络处理',
    '  const neuralNetwork = new AIProcessor({',
    '    model: "claude-3.5-sonnet",',
    '    language: "zh-CN",',
    '    realtime: true',
    '  })',
    '  ',
    '  // 配置语音参数',
    '  const voiceConfig = {',
    '    continuous: true,',
    '    interimResults: true,',
    '    maxAlternatives: 1,',
    '    sensitivity: 0.8',
    '  }',
    '  ',
    '  // 启动AI编译器',
    '  const compiler = new AICompiler({',
    '    target: "react-component",',
    '    optimization: "production",',
    '    hotReload: true',
    '  })',
    '  ',
    '  // 实时代码生成',
    '  const generateInterface = async (command) => {',
    '    const codeTemplate = await ai.generateCode({',
    '      prompt: command,',
    '      framework: "react",',
    '      styling: "tailwindcss"',
    '    })',
    '    ',
    '    return compiler.compile(codeTemplate)',
    '  }',
    '  ',
    '  // 渲染AI生成的界面',
    '  return (',
    '    <div className="ai-generated-interface">',
    '      <SystemStatus active={true} />',
    '      <CompilerOutput />',
    '      <VoiceIndicator listening={true} />',
    '    </div>',
    '  )',
    '}',
    '',
    'export default AIVoiceSystem',
    '',
    '// 编译完成，准备启动...'
  ],
  consult: [
    'import React from "react"',
    'import { useState } from "react"',
    'const ConsultPage = () => {',
    '  const [messages, setMessages] = useState([])',
    '  const [isLoading, setIsLoading] = useState(false)',
    '  ',
    '  const handleSendMessage = async (message) => {',
    '    setIsLoading(true)',
    '    const response = await fetch("/api/ai/consult", {',
    '      method: "POST",',
    '      headers: { "Content-Type": "application/json" },',
    '      body: JSON.stringify({ message })',
    '    })',
    '    const data = await response.json()',
    '    setMessages(prev => [...prev, data])',
    '    setIsLoading(false)',
    '  }',
    '  ',
    '  return (',
    '    <div className="h-full flex flex-col">',
    '      <header className="bg-gradient-to-r from-blue-600 to-purple-600">',
    '        <h1>AI 咨询助手</h1>',
    '      </header>',
    '      <div className="flex-1 overflow-y-auto">',
    '        {messages.map((msg, idx) => (',
    '          <div key={idx} className="message">',
    '            {msg.content}',
    '          </div>',
    '        ))}',
    '      </div>',
    '      <input onKeyPress={handleSendMessage} />',
    '    </div>',
    '  )',
    '}',
    '',
    'export default ConsultPage'
  ],
  settings: [
    'import React from "react"',
    'import { useSettings } from "@/hooks/useSettings"',
    'const SettingsPage = () => {',
    '  const { settings, updateSetting } = useSettings()',
    '  ',
    '  const sections = [',
    '    {',
    '      title: "语音控制",',
    '      icon: "🎤",',
    '      settings: [',
    '        { key: "voiceEnabled", label: "启用语音控制" },',
    '        { key: "voiceLanguage", label: "语音语言" }',
    '      ]',
    '    },',
    '    {',
    '      title: "系统设置",',
    '      icon: "⚙️",',
    '      settings: [',
    '        { key: "autoStart", label: "开机自启动" },',
    '        { key: "fullscreen", label: "全屏模式" }',
    '      ]',
    '    },',
    '    {',
    '      title: "外观设置",',
    '      icon: "🎨",',
    '      settings: [',
    '        { key: "theme", label: "主题模式" }',
    '      ]',
    '    }',
    '  ]',
    '  ',
    '  return (',
    '    <div className="max-w-2xl mx-auto space-y-6">',
    '      {sections.map(section => (',
    '        <section key={section.title}>',
    '          <h2>{section.icon} {section.title}</h2>',
    '          {section.settings.map(setting => (',
    '            <div key={setting.key}>',
    '              <label>{setting.label}</label>',
    '              <input onChange={updateSetting} />',
    '            </div>',
    '          ))}',
    '        </section>',
    '      ))}',
    '    </div>',
    '  )',
    '}',
    '',
    'export default SettingsPage'
  ]
}

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const charArray = chars.split('')
    const columns = canvas.width / 20
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#00ff00'
      ctx.font = '20px monospace'

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(text, i * 20, drops[i] * 20)

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-20"
      style={{ background: 'transparent' }}
    />
  )
}

const TypingText = ({ text, speed = 3, onComplete }: { 
  text: string
  speed?: number
  onComplete?: () => void 
}) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className="font-mono text-green-400">
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-green-300">|</span>
      )}
    </span>
  )
}

// AI生成的网页组件
const GeneratedWebpage = ({ targetPage, onClose }: { targetPage: string, onClose: () => void }) => {
  const [messages, setMessages] = useState<Array<{id: number, text: string, isAI: boolean, timestamp: string}>>([])
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const addMessage = (text: string, isAI: boolean = false) => {
    const newMessage = {
      id: Date.now(),
      text,
      isAI,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    addMessage(inputText, false)
    setInputText('')
    setIsThinking(true)

    // 模拟AI思考时间
    setTimeout(() => {
      const responses = [
        "这是一个很有趣的问题！基于我的分析，我认为...",
        "让我帮您解决这个问题。首先，我们需要考虑以下几个方面...",
        "根据您的描述，我建议采用以下解决方案...",
        "这个问题很常见，通常有几种处理方式...",
        "我理解您的需求，让我为您提供一些专业建议..."
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      addMessage(randomResponse, true)
      setIsThinking(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (targetPage === 'test') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="h-full flex flex-col">
          <header className="h-12 bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20 flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="window-controls">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h1 className="text-lg font-semibold text-white">🤖 AI智能助手 - 实时生成</h1>
            </div>
            <button 
              className="os-button text-xs"
              onClick={() => {
                onClose()
                // 直接返回桌面，跳过所有中间状态
                window.location.reload()
              }}
            >
              返回桌面
            </button>
          </header>

          <div className="flex-1 flex">
            {/* 侧边栏 */}
            <div className="w-64 bg-black bg-opacity-20 backdrop-blur-sm border-r border-white border-opacity-10 p-4">
              <div className="space-y-4">
                <div className="text-white text-sm">
                  <div className="font-semibold mb-2">🔥 AI功能</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded bg-blue-600 bg-opacity-30">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>智能对话</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span>代码生成</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span>文档分析</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white border-opacity-10 pt-4">
                  <div className="text-white text-xs opacity-70">
                    <div>在线用户: 1,247</div>
                    <div>AI响应时间: &lt; 1s</div>
                    <div>准确率: 98.7%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 主聊天区域 */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-2">AI助手已就绪</h2>
                      <p className="text-gray-300">输入任何问题，我来帮您解答</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isAI 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-700 text-white">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <span className="text-sm ml-2">AI正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-white border-opacity-10">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white placeholder-opacity-50 backdrop-blur-sm"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isThinking}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-xl transition-colors duration-200"
                  >
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 其他页面类型的生成网页...
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
      <div className="h-full flex flex-col">
        <header className="h-12 bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-white">✨ AI生成网页</h1>
          </div>
          <button 
            className="os-button text-xs"
            onClick={() => {
              onClose()
              window.location.reload()
            }}
          >
            返回桌面
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">🎉 网页生成成功！</h2>
            <p>这是AI为您动态生成的{targetPage}界面</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CodeGeneration({ isGenerating, targetPage, onComplete }: CodeGenerationProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [showFinalScreen, setShowFinalScreen] = useState(false)
  const [showGeneratedWebpage, setShowGeneratedWebpage] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [progress, setProgress] = useState(0)
  const codeContainerRef = useRef<HTMLDivElement>(null)

  const codeLines = targetPage ? codeSnippets[targetPage as keyof typeof codeSnippets] : []

  useEffect(() => {
    if (!isGenerating) {
      setCurrentLineIndex(0)
      setShowFinalScreen(false)
      setShowGeneratedWebpage(false)
      setShowTransition(false)
      setCountdown(3)
      setProgress(0)
      return
    }

    // 模拟代码生成进度 - 加速
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 5
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [isGenerating])

  const handleLineComplete = () => {
    if (currentLineIndex < codeLines.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1)
        // 自动滚动到底部
        if (codeContainerRef.current) {
          codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight
        }
      }, 5)
    } else {
      // 所有代码行完成，显示最终屏幕
      setTimeout(() => {
        setShowFinalScreen(true)
        // 启动倒计时
        let count = 3
        const countdownInterval = setInterval(() => {
          count--
          setCountdown(count)
          if (count <= 0) {
            clearInterval(countdownInterval)
            setShowTransition(true)
            // 转场动画持续2秒后显示生成的网页
            setTimeout(() => {
              setShowGeneratedWebpage(true)
            }, 2000)
          }
        }, 1000)
      }, 100)
    }
  }

  if (!isGenerating) {
    return null
  }

  // 显示转场动画
  if (showTransition && !showGeneratedWebpage) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden">
        {/* 粒子背景效果 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-teal-900"></div>
          {/* 动态粒子 */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* 中央加载动画 */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            {/* 旋转的环形加载器 */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-500 border-opacity-30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-purple-500 border-opacity-30 rounded-full"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl animate-pulse">🚀</div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
              正在启动 AI 系统...
            </h2>
            <p className="text-blue-300 text-lg mb-6">
              Neural networks are initializing...
            </p>

            {/* 进度文字动画 */}
            <div className="space-y-2 text-sm text-gray-300 font-mono">
              <div className="animate-fade-in-delay-1">✓ 加载神经网络模块</div>
              <div className="animate-fade-in-delay-2">✓ 初始化语音识别引擎</div>
              <div className="animate-fade-in-delay-3">✓ 连接 AI 处理器</div>
              <div className="animate-fade-in-delay-4">✓ 建立量子通道</div>
              <div className="animate-fade-in-delay-5 text-green-400">🎯 准备就绪，正在启动...</div>
            </div>
          </div>

          {/* 底部波浪动画 */}
          <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-blue-500 opacity-30 animate-pulse"></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-delay-1 { 
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-delay-2 { 
            0% { opacity: 0; transform: translateY(10px); }
            40% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-delay-3 { 
            0% { opacity: 0; transform: translateY(10px); }
            60% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-delay-4 { 
            0% { opacity: 0; transform: translateY(10px); }
            80% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-delay-5 { 
            0% { opacity: 0; transform: translateY(10px); }
            90% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-delay-1 { animation: fade-in-delay-1 2s ease-out forwards; }
          .animate-fade-in-delay-2 { animation: fade-in-delay-2 2s ease-out forwards; }
          .animate-fade-in-delay-3 { animation: fade-in-delay-3 2s ease-out forwards; }
          .animate-fade-in-delay-4 { animation: fade-in-delay-4 2s ease-out forwards; }
          .animate-fade-in-delay-5 { animation: fade-in-delay-5 2s ease-out forwards; }
        `}</style>
      </div>
    )
  }

  // 显示生成的网页
  if (showGeneratedWebpage) {
    return (
      <GeneratedWebpage 
        targetPage={targetPage}
        onClose={() => {
          setShowGeneratedWebpage(false)
          setShowFinalScreen(false)
          setShowTransition(false)
          setCurrentLineIndex(0)
          setProgress(0)
          // 不调用 onComplete()，让用户停留在这个界面
        }}
      />
    )
  }

  if (showFinalScreen && !showTransition) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* 成功页面内容 */}
        <div className="h-full flex flex-col">
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
              className="os-button text-xs"
              onClick={onComplete}
            >
              返回桌面
            </button>
          </header>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* 成功图标和标题 */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 border-2 border-green-300 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-green-400 mb-2">🎉 系统编译成功！</h1>
                <p className="text-green-300 text-lg">AI已成功生成并运行新的界面模块</p>
              </div>

              {/* 信息卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl border border-green-400 border-opacity-30 p-6">
                  <h3 className="text-green-400 text-xl font-semibold mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    系统信息
                  </h3>
                  <div className="space-y-3 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-300">当前时间:</span>
                      <span className="text-blue-400">{new Date().toLocaleTimeString()}</span>
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

              {/* 代码示例 */}
              <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl border border-purple-400 border-opacity-30 p-6 mb-8">
                <h3 className="text-purple-400 text-xl font-semibold mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  生成的代码样例
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="text-gray-500 mb-2">// AI自动生成的React组件</div>
                  <div className="text-blue-400">export default function <span className="text-yellow-400">AIGeneratedComponent</span>() {`{`}</div>
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
                  <div className="text-gray-300 ml-2">)</div>
                  <div className="text-blue-400">{`}`}</div>
                </div>
              </div>

              {/* 倒计时提示 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-black bg-opacity-60 backdrop-blur-sm rounded-2xl border border-green-400 border-opacity-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm">系统将在</span>
                    <span className="text-2xl font-bold text-green-400 w-8 text-center">{countdown}</span>
                    <span className="text-green-300 text-sm">秒后自动启动</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center space-x-4">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={onComplete}
                >
                  返回桌面
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    setShowFinalScreen(false)
                    setCurrentLineIndex(0)
                    setProgress(0)
                    setCountdown(3)
                    setTimeout(() => setShowFinalScreen(true), 100)
                  }}
                >
                  重新生成
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    // 直接显示转场动画然后生成的网页
                    setShowTransition(true)
                    setTimeout(() => {
                      setShowGeneratedWebpage(true)
                    }, 2000)
                  }}
                >
                  🚀 立即启动
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* 背景矩阵雨效果 */}
      <MatrixRain />
      
      {/* 主要内容区域 */}
      <div className="relative z-10 h-full flex flex-col">
        {/* 顶部状态栏 */}
        <div className="bg-black bg-opacity-80 backdrop-blur-sm border-b border-green-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-mono text-sm">AI SYSTEM ACTIVE</span>
              </div>
              <div className="text-green-300 font-mono text-sm">
                TARGET: {
                  targetPage === 'test' ? 'VOICE_AI_SYSTEM' : 
                  targetPage?.toUpperCase()
                }
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-green-300 font-mono text-sm">
                PROGRESS: {progress.toFixed(0)}%
              </div>
              <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 代码生成区域 */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full bg-black bg-opacity-60 backdrop-blur-sm border border-green-400 border-opacity-30 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-green-400 font-mono text-xl mb-2">
                {'>'} Generating {
                  targetPage === 'consult' ? 'AI Consultation Interface' : 
                  targetPage === 'settings' ? 'System Settings Panel' :
                  targetPage === 'test' ? 'AI Voice Recognition System' : 'System Interface'
                }...
              </h2>
              <div className="text-green-300 font-mono text-sm opacity-75">
                {targetPage === 'test' ? 
                  '正在激活语音识别神经网络，编译AI处理器...' :
                  'Initializing neural pathways and compiling quantum algorithms...'
                }
              </div>
            </div>

            {/* 代码显示区域 */}
            <div 
              ref={codeContainerRef}
              className="font-mono text-sm space-y-1 h-96 overflow-y-auto scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {codeLines.slice(0, currentLineIndex + 1).map((line, index) => (
                <div key={index} className="flex">
                  <span className="text-green-600 mr-4 select-none w-8 text-right">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    {index === currentLineIndex ? (
                      <TypingText 
                        text={line} 
                        speed={2} 
                        onComplete={handleLineComplete}
                      />
                    ) : (
                      <span className="text-green-400">{line}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 底部状态 */}
            <div className="mt-6 flex items-center justify-between text-xs font-mono">
              <div className="text-green-300 opacity-75">
                Lines: {currentLineIndex + 1}/{codeLines.length} | 
                Characters: {codeLines.slice(0, currentLineIndex + 1).join('').length}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">COMPILING</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部消息 */}
        <div className="bg-black bg-opacity-80 backdrop-blur-sm border-t border-green-400 p-4">
          <div className="text-center">
            <div className="text-green-400 font-mono text-sm animate-pulse">
              AI正在为您构建专属界面，请稍候...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}