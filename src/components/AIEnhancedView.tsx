'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RuntimeService, RuntimeCommand, AppConfig } from '../core/runtime/RuntimeService'
import { getSharedRuntimeService } from '../core/runtime/sharedRuntime'
import MatrixLoading from './MatrixLoading'
import VoiceControlPage from './voice-pages/VoiceControlPage'
import VoiceSettingsPage from './voice-pages/VoiceSettingsPage'
import VoiceWorkstudioPage from './voice-pages/VoiceWorkstudioPage'
import ErrorBoundary from './ErrorBoundary'
import { GlobalErrorHandler, safeAsync } from '../utils/errorHandler'

interface AIEnhancedViewProps {
  websiteUrl: string
  appConfig: AppConfig
  onToggleMode: () => void
}

const AIEnhancedView: React.FC<AIEnhancedViewProps> = ({ websiteUrl, appConfig, onToggleMode }) => {
  const runtimeService = getSharedRuntimeService() // 使用共享的 RuntimeService
  const [commands, setCommands] = useState<RuntimeCommand[]>([])
  const [currentPage, setCurrentPage] = useState('voice-home') // 默认显示语音主页
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGeneratingPage, setIsGeneratingPage] = useState(false) // Unified loading状态
  const [generatingMessage, setGeneratingMessage] = useState('') // 生成消息
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // 动态指令状态
  const [dynamicCommands, setDynamicCommands] = useState<RuntimeCommand[]>([])
  const [currentPageName, setCurrentPageName] = useState('')
  
  // 语音识别状态
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 初始化全局错误处理
    const errorHandler = GlobalErrorHandler.getInstance()
    const handleGlobalError = (error: Error) => {
      console.error('🚨 全局错误捕获:', error.message)
      setError(`系统错误: ${error.message}`)
    }
    errorHandler.addErrorListener(handleGlobalError)

    initializeRuntime()
    initializeSpeechRecognition()
    
    // 监听指令变化
    const handleCommandsChange = (newCommands: RuntimeCommand[]) => {
      console.log('🔄 运行时指令更新:', newCommands.length, '个')
      console.log('📋 新指令列表:', newCommands.map(cmd => ({ 
        id: cmd.id, 
        triggers: cmd.triggers,
        description: cmd.description 
      })))
      setCommands(newCommands)
    }
    
    runtimeService.addListener(handleCommandsChange)
    
    // 监听来自iframe的消息
    const handleMessage = (event: MessageEvent) => {
      // 放宽消息源检查，允许来自iframe内容的消息
      if (event.source !== iframeRef.current?.contentWindow) {
        // 只接收来自CONSULT_AI的消息
        if (!event.data?.source || event.data.source !== 'consult_ai') {
          return
        }
      }
      
      const { type, data } = event.data
      console.log('📨 Triangle OS 接收到消息:', { type, data, source: event.source === iframeRef.current?.contentWindow ? 'iframe' : 'other' })
      
      switch (type) {
        case 'auth_success':
          console.log('✅ 用户登录成功，重定向到:', data.redirectTo || '/')
          if (data.redirectTo) {
            const fullUrl = websiteUrl + data.redirectTo
            if (iframeRef.current) {
              iframeRef.current.src = fullUrl
            }
            setCurrentPage(data.redirectTo)
            setTimeout(() => initializeRuntime(), 500)
          }
          break
          
        case 'page_ready':
          console.log('📄 页面准备就绪:', data.page)
          // 新页面准备就绪时，清除旧的动态指令（如果有的话）
          if (data.page && data.page !== currentPageName) {
            clearPageCommands()
          }
          setTimeout(() => initializeRuntime(), 500)
          break
          
        case 'command_registered':
          console.log('🎯 接收到动态指令注册:', data)
          if (data?.command) {
            console.log('📝 注册动态指令:', data.command)
            setDynamicCommands(prev => {
              // 避免重复注册同一个指令
              const exists = prev.find(cmd => cmd.id === data.command.id)
              if (exists) {
                console.log('🔄 更新现有指令:', data.command.id)
                return prev.map(cmd => cmd.id === data.command.id ? data.command : cmd)
              } else {
                console.log('➕ 添加新指令:', data.command.id)
                return [...prev, data.command]
              }
            })
            setCurrentPageName(data.page || 'unknown')
          }
          break
          
        case 'command_unregistered':
          console.log('🗑️ 接收到动态指令注销:', data)
          if (data?.commandId) {
            setDynamicCommands(prev => prev.filter(cmd => cmd.id !== data.commandId))
          }
          break
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      runtimeService.removeListener(handleCommandsChange)
      window.removeEventListener('message', handleMessage)
      errorHandler.removeErrorListener(handleGlobalError)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [runtimeService, appConfig, websiteUrl])

  // 初始化语音识别
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'zh-CN'
        recognition.maxAlternatives = 3

        recognition.onstart = () => {
          setIsListening(true)
          setError('')
          console.log('Voice recognition started')
        }

        recognition.onresult = (event) => {
          let currentTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            } else {
              currentTranscript += result[0].transcript
            }
          }

          setTranscript(currentTranscript)
          
          if (finalTranscript) {
            console.log('Final transcript:', finalTranscript)
            processVoiceCommand(finalTranscript.trim())
            setLastCommand(finalTranscript.trim())
          }
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'no-speech') {
            scheduleRestart()
            return
          }
          setError(`语音识别错误: ${event.error}`)
          setIsListening(false)
        }

        recognition.onend = () => {
          console.log('Voice recognition ended')
          setIsListening(false)
          setTranscript('')
          
          if (recognitionRef.current && isListening) {
            scheduleRestart()
          }
        }

        recognitionRef.current = recognition
      } else {
        setIsSupported(false)
        setError('Speech recognition not supported in this browser')
      }
    }
  }, [isListening])

  // 重启语音识别
  const scheduleRestart = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }
    
    restartTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error('Failed to restart recognition:', error)
        }
      }
    }, 1000)
  }, [isListening])

  // 处理语音指令
  const processVoiceCommand = useCallback(async (command: string) => {
    console.log('Processing voice command:', command)
    console.log('🔍 可用运行时指令:', commands.length, '个')
    console.log('🔍 运行时指令列表:', commands.map(cmd => ({ id: cmd.id, triggers: cmd.triggers })))

    // 首先尝试匹配运行时指令
    const matchedCommand = runtimeService.matchCommand(command)
    if (matchedCommand) {
      console.log('✅ 匹配到运行时指令:', matchedCommand)
      await executeCommand(matchedCommand)
      return
    } else {
      console.log('❌ 未匹配到运行时指令，尝试导航指令')
    }

    // 后备导航指令 - 通用系统级指令
    const navigationCommands = [
      { patterns: ['回到主页', '主页', '桌面', '语音主页'], route: 'voice-home' }, // 显示语音主页
      { patterns: ['打开设置', '设置', '系统设置'], route: 'voice-settings' }, // 显示系统设置页面  
      { patterns: ['工作室', '显示工作室', '指令工作室'], route: 'voice-workstudio' }, // 语音指令工作室页面
      { patterns: ['语音控制', '控制中心', '语音中心'], route: 'voice-control' }, // 语音控制中心
    ]

    const lowerCommand = command.toLowerCase()
    for (const nav of navigationCommands) {
      if (nav.patterns.some(pattern => lowerCommand.includes(pattern))) {
        await executeCommand({
          id: 'voice_navigate',
          triggers: nav.patterns,
          description: `导航到 ${nav.route}`,
          action: { type: 'navigate', target: nav.route },
          scope: 'global'
        })
        return
      }
    }
  }, [runtimeService])

  // 切换语音监听
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        setError('Failed to start voice recognition')
      }
    }
  }, [isListening, isSupported])

  // 切换页面时的清理函数
  const clearPageCommands = useCallback(() => {
    console.log('🗑️ 清除之前页面的动态指令')
    setDynamicCommands([])
    setCurrentPageName('')
  }, [])

  // 简化版iframe导航（不注入Bridge）
  const handleIframeNavigationSimple = async (target: string) => {
    console.log('🚀 简化iframe导航:', target)
    
    // 页面切换前清除之前的动态指令
    clearPageCommands()
    
    return new Promise<void>((resolve, reject) => {
      try {
        if (!iframeRef.current) {
          console.log('⚠️ iframe ref不存在，跳过导航')
          resolve()
          return
        }

        console.log('✅ iframe ref存在，开始设置URL')
        const fullUrl = target.startsWith('http') ? target : websiteUrl + target
        console.log(`🔗 设置iframe URL: ${fullUrl}`)
        
        // 设置iframe源
        iframeRef.current.src = fullUrl
        
        // 监听iframe加载完成
        const handleLoad = () => {
          console.log('📄 iframe加载完成')
          if (iframeRef.current) {
            iframeRef.current.removeEventListener('load', handleLoad)
          }
          resolve()
        }
        
        if (iframeRef.current) {
          iframeRef.current.addEventListener('load', handleLoad)
        }
        
        // 设置超时
        setTimeout(() => {
          console.log('⏰ iframe加载超时，继续执行')
          resolve()
        }, 5000)
        
      } catch (error) {
        console.error('🚫 iframe导航失败:', error)
        resolve() // 即使失败也继续
      }
    })
  }


  // 更新运行时上下文的辅助函数
  const updateRuntimeContext = async (target: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const contextUrl = target.startsWith('http') ? target : `voice-mode://${target}`
        
        runtimeService.setContext({
          current_url: contextUrl,
          iframe: iframeRef.current || undefined
        })
        
        console.log(`🔄 运行时上下文已更新: ${contextUrl}`)
        resolve()
      } catch (contextError) {
        console.error('🚫 运行时上下文更新失败:', contextError)
        reject(new Error(`运行时上下文更新失败: ${contextError.message || '未知错误'}`))
      }
    })
  }


  const initializeRuntime = async () => {
    try {
      console.log('🚀 AI增强模式：初始化运行时环境')
      console.log('App Config:', appConfig)
      
      // 加载应用到运行时
      const loadResult = await runtimeService.loadApp(appConfig)
      console.log('🔄 应用加载结果:', loadResult)
      
      // AI增强模式不处理重定向，总是显示语音主页
      if (loadResult.success && loadResult.redirectUrl) {
        console.log('🔒 检测到重定向，但AI增强模式忽略，保持语音主页')
      }
      
      if (loadResult.success) {
        // AI增强模式默认显示语音主页，不加载外部页面
        console.log('🏠 AI增强模式显示语音主页，等待语音指令')
        
        // 设置运行时上下文
        runtimeService.setContext({
          app_id: appConfig.id,
          current_url: 'voice-mode://home',
          iframe: iframeRef.current || undefined,
          systemHandler: async (command: string, params?: any) => {
            switch (command) {
              case 'toggle_traditional_mode':
                onToggleMode()
                return true
              default:
                return false
            }
          }
        })
        
        const loadedCommands = runtimeService.getCurrentCommands()
        console.log('📋 加载的指令数量:', loadedCommands.length)
        console.log('📋 指令详情:', loadedCommands)
        
        // 如果没有加载到指令，添加一些基础系统指令
        if (loadedCommands.length === 0) {
          console.log('⚠️ 未加载到外部指令，使用基础系统指令')
          const basicCommands: RuntimeCommand[] = [
            {
              id: 'navigate_home',
              triggers: ['回到主页', '主页', '桌面', '语音主页'],
              description: '返回语音主页',
              icon: '🏠',
              action: { type: 'navigate', target: 'voice-home' },
              scope: 'global'
            },
            {
              id: 'open_settings',
              triggers: ['打开设置', '设置', '系统设置'],
              description: '打开系统设置',
              icon: '⚙️',
              action: { type: 'navigate', target: 'voice-settings' },
              scope: 'global'
            },
            {
              id: 'open_workstudio',
              triggers: ['工作室', '显示工作室', '指令工作室'],
              description: '显示指令工作室',
              icon: '🛠️',
              action: { type: 'navigate', target: 'voice-workstudio' },
              scope: 'global'
            },
            {
              id: 'open_voice_control',
              triggers: ['语音控制', '控制中心', '语音中心'],
              description: '打开语音控制中心',
              icon: '🎙️',
              action: { type: 'navigate', target: 'voice-control' },
              scope: 'global'
            },
            {
              id: 'toggle_mode',
              triggers: ['切换模式', '传统模式', 'toggle mode'],
              description: '切换显示模式',
              icon: '🔄',
              action: { type: 'system_command', command: 'toggle_traditional_mode' },
              scope: 'global'
            }
          ]
          setCommands(basicCommands)
        } else {
          setCommands(loadedCommands)
        }
      } else {
        setError('无法初始化运行时环境')
        console.error('❌ 运行时环境初始化失败')
      }
    } catch (err) {
      setError('初始化失败')
      console.error('💥 Runtime initialization error:', err)
    }
  }

  const executeCommand = async (command: RuntimeCommand) => {
    // 防止重复执行
    if (loading || isGeneratingPage) {
      console.warn('⚠️ 指令执行中，忽略重复请求')
      return
    }
    
    setLoading(true)
    setError('')
    
    console.log('🔥 AI增强模式执行指令:', command)
    console.log('🔥 当前页面:', currentPage)
    console.log('🔥 WebsiteUrl:', websiteUrl)
    
    try {
      // 处理基础系统指令
      if (command.action.type === 'system_command') {
        try {
          switch (command.action.command) {
            case 'toggle_traditional_mode':
              onToggleMode()
              return
            default:
              break
          }
        } catch (systemError) {
          console.error('❌ 系统指令执行失败:', systemError)
          setError('系统指令执行失败')
          return
        }
      }
      
      // 处理导航指令 - 显示Matrix loading
      if (command.action.type === 'navigate') {
        const target = command.action.target
        console.log(`🧭 AI增强模式导航到: ${target}`)
        
        if (target === 'reload') {
          // 刷新当前页面
          setIsGeneratingPage(true)
          setGeneratingMessage('AI正在重新生成页面...')
          
          setTimeout(() => {
            setIsGeneratingPage(false)
            if (iframeRef.current) {
              iframeRef.current.src = iframeRef.current.src
            }
            console.log('✅ 页面已刷新')
          }, 3000)
          return
        }
        
        // 根据不同的目标显示不同的生成消息
        let message = 'AI正在生成页面...'
        if (target.includes('consult') || target.includes('/consult')) {
          message = 'AI正在构建智能咨询界面...'
        } else if (target.includes('settings') || target.includes('/settings')) {
          message = 'AI正在生成系统设置面板...'
        } else if (target === 'voice-workstudio' || target.includes('workstudio')) {
          message = 'AI正在构建语音指令工作室...'
        } else if (target === 'voice-home') {
          message = 'AI正在重构语音控制中心...'
        } else if (target.includes('voice-')) {
          message = 'AI正在创建专属语音界面...'
        }
        
        // 显示Matrix loading
        setIsGeneratingPage(true)
        setGeneratingMessage(message)
        
        // 延迟执行页面切换，让loading有时间显示
        const switchTimeout = setTimeout(async () => {
          try {
            console.log(`🔄 开始页面切换到: ${target}`)
            
            // 先设置页面状态
            setCurrentPage(target)
            
            // 如果切换到语音页面（不需要iframe），清除动态指令
            if (target.startsWith('voice-') || target === 'voice-home') {
              clearPageCommands()
            }
            
            // 处理需要iframe的页面
            const needsIframe = target.startsWith('http') || (!target.startsWith('voice-') && target !== 'voice-home')
            console.log('🔍 iframe判断:', {
              target,
              startsWithHttp: target.startsWith('http'),
              startsWithVoice: target.startsWith('voice-'),
              isVoiceHome: target === 'voice-home',
              needsIframe
            })
            
            if (needsIframe) {
              console.log('✅ 需要iframe，等待iframe渲染后导航')
              
              // 等待iframe渲染完成
              const waitForIframe = () => {
                return new Promise<void>((resolve) => {
                  const checkIframe = () => {
                    if (iframeRef.current) {
                      console.log('✅ iframe已渲染，开始导航')
                      resolve()
                    } else {
                      console.log('⏳ 等待iframe渲染...')
                      setTimeout(checkIframe, 100)
                    }
                  }
                  checkIframe()
                })
              }
              
              await waitForIframe()
              // 简化导航，只设置iframe URL，由web端自己处理Bridge
              await handleIframeNavigationSimple(target)
            } else {
              console.log('❌ 不需要iframe')
            }
            
            // 更新运行时上下文（使用Promise处理可能的异步操作）
            await updateRuntimeContext(target)
            
            console.log(`✅ AI页面切换成功: ${target}`)
          } catch (switchError) {
            console.error('❌ 页面切换失败:', switchError)
            setError(`页面切换失败: ${switchError.message || '未知错误'}`)
            // 切换失败时隐藏loading
            setIsGeneratingPage(false)
          }
        }, 2500) // 在loading结束前切换页面，给loading时间完成
        
        // 保存timeout引用以便清理
        return () => clearTimeout(switchTimeout)
        
        return
      }

      try {
        const success = await runtimeService.executeCommand(command)
        
        if (!success) {
          setError('指令执行失败')
        }
      } catch (runtimeError) {
        console.error('❌ 运行时指令执行失败:', runtimeError)
        setError(`运行时指令执行失败: ${runtimeError.message || '未知错误'}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`执行命令失败: ${errorMessage}`)
      console.error('❌ Command execution error:', err)
    } finally {
      setLoading(false)
    }
  }

  // AI增强模式不包含样式修改功能

  // MatrixLoading完成回调
  // 执行动态指令
  const executeDynamicCommand = useCallback(async (commandId: string) => {
    console.log('🎯 执行动态指令:', commandId)
    
    // 发送消息到iframe让Bridge执行指令
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'execute_command',
        commandId: commandId,
        params: {}
      }, '*')
    }
  }, [])

  const handleLoadingComplete = useCallback(() => {
    console.log('🎬 MatrixLoading完成，当前状态:', { isGeneratingPage, currentPage })
    setIsGeneratingPage(false)
    console.log('🎬 已设置isGeneratingPage=false')
    // 强制重新渲染检查
    setTimeout(() => {
      console.log('🔄 延迟检查状态:', { isGeneratingPage: false })
    }, 100)
  }, [isGeneratingPage, currentPage])

  // 自动开始语音监听
  useEffect(() => {
    if (isSupported && recognitionRef.current && !isListening && !error) {
      const timer = setTimeout(() => {
        try {
          recognitionRef.current?.start()
        } catch (error) {
          console.error('Auto-start failed:', error)
        }
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isSupported, isListening, error])

  // 渲染状态调试
  console.log('🎨 AIEnhancedView渲染:', { isGeneratingPage, currentPage })

  // 渲染状态调试 - 保持语音OS的指令面板显示
  console.log('🔍 页面状态:', { currentPage, isGeneratingPage })
  console.log('🔍 渲染条件判断:', {
    isVoiceHome: currentPage === 'voice-home',
    isVoiceControl: currentPage === 'voice-control', 
    isVoiceSettings: currentPage === 'voice-settings',
    isVoiceWorkstudio: currentPage === 'voice-workstudio',
    startsWithVoice: currentPage.startsWith('voice-'),
    shouldShowIframe: !currentPage.startsWith('voice-') && currentPage !== 'voice-home' && currentPage !== 'voice-control' && currentPage !== 'voice-settings' && currentPage !== 'voice-workstudio'
  })

  return (
    <ErrorBoundary>
      <div className="h-full w-full flex bg-black">      
        {/* 左侧：主要内容区域 */}
        <div className="flex-1 flex flex-col relative">
          {/* Matrix Loading Overlay - 只覆盖左侧 */}
          {isGeneratingPage && (
            <MatrixLoading
              message={generatingMessage}
              onComplete={handleLoadingComplete}
              duration={3000}
              minDuration={2500}
            />
          )}
        {/* 上部：语音优化页面显示区 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="page-container">
            
            {currentPage === 'voice-home' ? (
            // 语音主页 - 不是iframe，而是本地组件
            <div className="page-content h-full w-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-8">
              <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-light text-white mb-4">Triangle OS 语音助手</h1>
                  <p className="text-xl text-gray-300 opacity-80">使用语音指令或右侧按钮控制系统</p>
                </div>
                
                {/* 通用系统功能展示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="text-blue-300 text-xs">说："切换模式" 或 "传统模式"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🏠</div>
                    <h3 className="text-white text-lg font-medium mb-2">返回主页</h3>
                    <p className="text-gray-300 text-sm mb-3">回到语音助手主界面</p>
                    <div className="text-blue-300 text-xs">说："回到主页" 或 "主页"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🛠️</div>
                    <h3 className="text-white text-lg font-medium mb-2">指令工作室</h3>
                    <p className="text-gray-300 text-sm mb-3">管理和查看语音指令</p>
                    <div className="text-blue-300 text-xs">说："工作室" 或 "指令工作室"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🎙️</div>
                    <h3 className="text-white text-lg font-medium mb-2">语音控制中心</h3>
                    <p className="text-gray-300 text-sm mb-3">通用语音指令处理系统</p>
                    <div className="text-blue-300 text-xs">说："语音控制" 或 "控制中心"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">📱</div>
                    <h3 className="text-white text-lg font-medium mb-2">应用控制</h3>
                    <p className="text-gray-300 text-sm mb-3">控制应用窗口状态</p>
                    <div className="text-blue-300 text-xs">说："最小化" 或 "全屏"</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <div className="text-2xl mb-3">🎯</div>
                    <h3 className="text-white text-lg font-medium mb-2">动态指令</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      {dynamicCommands.length > 0 
                        ? `${currentPageName} 页面指令 (${dynamicCommands.length}个)`
                        : '根据加载的应用显示更多功能'
                      }
                    </p>
                    {/* 调试信息 */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-yellow-300 text-xs mb-2">
                        调试: 动态指令数={dynamicCommands.length}, 页面={currentPageName}
                      </div>
                    )}
                    {dynamicCommands.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {dynamicCommands.map((cmd, index) => (
                          <div 
                            key={cmd.id}
                            className="bg-blue-500 bg-opacity-20 rounded-lg p-3 cursor-pointer hover:bg-opacity-30 transition-all"
                            onClick={() => executeDynamicCommand(cmd.id)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{cmd.icon || '🎯'}</span>
                              <span className="text-white text-sm font-medium">{cmd.description}</span>
                            </div>
                            <div className="text-blue-300 text-xs">
                              说："{cmd.triggers?.[0] || cmd.id}"
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-blue-300 text-xs">语音识别会自动发现应用指令</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : currentPage === 'voice-control' ? (
            // 通用语音控制中心
            <div className="page-content">
              <VoiceControlPage />
            </div>
          ) : currentPage === 'voice-settings' ? (
            // AI定制设置页面
            <div className="page-content">
              <VoiceSettingsPage />
            </div>
          ) : currentPage === 'voice-workstudio' ? (
            // AI定制工作室页面
            <div className="page-content">
              <VoiceWorkstudioPage />
            </div>
          ) : currentPage.startsWith('voice-') ? (
            // 其他语音优化页面
            <div className="page-content h-full w-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-light text-white mb-4">语音优化页面</h2>
                <p className="text-gray-300">当前页面: {currentPage}</p>
                <p className="text-gray-400 text-sm mt-2">这里将显示适合语音交互的专门页面</p>
                <div className="mt-8">
                  <div className="text-blue-400 text-sm">正在开发中...</div>
                  <div className="text-gray-500 text-xs mt-2">AI正在为您定制专属界面</div>
                </div>
              </div>
            </div>
          ) : (
            // 需要加载外部页面时才使用iframe
            <div className="page-content">
              <iframe
                ref={iframeRef}
                src={currentPage.startsWith('http') ? currentPage : websiteUrl + currentPage}
                className="w-full h-full border-0"
                title="AI Enhanced Website"
              />
              
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="text-white text-lg">执行中...</div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
        
        {/* 下部：语音显示区 */}
        <div className="h-32 border-t border-gray-700 bg-gradient-to-b from-slate-900 to-black flex items-center justify-center px-8">
          <div className="flex items-center space-x-8 w-full max-w-4xl">
            {/* 语音按钮 */}
            <button
              onClick={toggleListening}
              className={`
                w-16 h-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center relative flex-shrink-0
                ${!isSupported 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : isListening 
                    ? 'bg-red-500 hover:bg-red-400' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
                }
                ${isSupported ? 'hover:scale-110 active:scale-95' : ''}
              `}
              title={!isSupported ? '语音识别不支持' : isListening ? '停止语音识别' : '开始语音控制'}
              disabled={!isSupported}
            >
              {!isSupported ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M13 13l6 6" />
                </svg>
              ) : isListening ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
              
              {/* 语音指示环 */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
                  <div className="absolute -inset-2 rounded-full border border-red-200 animate-pulse"></div>
                  <div className="absolute -inset-4 rounded-full border border-red-100 opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </>
              )}
            </button>
            
            {/* 转录显示区 */}
            <div className="flex-1 min-h-[80px] flex items-center">
              {transcript ? (
                <div className="text-white text-xl font-light leading-relaxed animate-pulse">
                  {transcript}
                  <span className="animate-pulse ml-1 text-blue-400">|</span>
                </div>
              ) : lastCommand ? (
                <div className="text-white text-lg font-light leading-relaxed opacity-80">
                  最后指令: {lastCommand}
                </div>
              ) : (
                <div className="text-white text-base opacity-40">
                  {!isSupported ? '语音识别在当前环境下不可用' : 
                   isListening ? '请开始说话...' : '点击麦克风开始语音交互'}
                </div>
              )}
              
              {/* 错误显示 */}
              {error && (
                <div className="ml-4 text-red-400 text-sm bg-red-500 bg-opacity-10 rounded-lg px-3 py-1 backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>

            {/* 状态指示 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                !isSupported ? 'bg-gray-400' : 
                isListening ? 'bg-red-400 animate-pulse' : 'bg-white bg-opacity-30'
              }`}></div>
              <span className="text-white text-sm opacity-70 whitespace-nowrap">
                {!isSupported ? '不可用' : isListening ? '监听中' : '待命'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：指令按钮面板 */}
      <div className="w-80 bg-gray-900 flex flex-col border-l border-gray-700 relative z-10">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-lg font-medium">
                智能指令面板
              </h2>
              <p className="text-gray-400 text-sm">
                点击按钮执行语音指令
              </p>
            </div>
            <button
              onClick={onToggleMode}
              className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
            >
              传统模式
            </button>
          </div>
          
          {/* 状态指示 */}
          <div className="mt-3 text-xs text-gray-500">
            {commands.length > 0 || dynamicCommands.length > 0 
              ? `${commands.length} 个系统指令 ${dynamicCommands.length > 0 ? `+ ${dynamicCommands.length} 个页面指令` : ''}` 
              : '正在加载指令...'
            }
          </div>
        </div>

        {/* 指令列表 */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-white text-sm font-medium mb-3">可用指令</h3>
          
          <div className="space-y-2">
            {/* 动态指令区域 */}
            {dynamicCommands.length > 0 && (
              <>
                <div className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  <span>页面指令 ({currentPageName})</span>
                </div>
                {dynamicCommands.map((command) => (
                  <button
                    key={`dynamic-${command.id}`}
                    onClick={() => executeDynamicCommand(command.id)}
                    disabled={loading}
                    className="w-full p-3 bg-blue-800 bg-opacity-50 hover:bg-blue-700 hover:bg-opacity-60 disabled:bg-gray-800 disabled:opacity-50 text-left rounded-lg transition-colors border border-blue-600 border-opacity-30"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{command.icon || '🎯'}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          {command.description}
                        </div>
                        <div className="text-blue-300 text-xs mt-1">
                          触发词: {command.triggers?.slice(0, 2).join(', ') || command.id}
                          {command.triggers && command.triggers.length > 2 && '...'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                <div className="border-t border-gray-600 my-3"></div>
              </>
            )}
            
            {/* 系统指令区域 */}
            <div className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-2">
              <span>⚙️</span>
              <span>系统指令</span>
            </div>
            {commands.length > 0 ? (
              commands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  disabled={loading}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-left rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{command.icon}</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {command.description}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        触发词: {command.triggers.slice(0, 2).join(', ')}
                        {command.triggers.length > 2 && '...'}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm mb-4">
                  正在加载指令...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部：操作说明 */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div>💡 提示：</div>
            <div>• 点击按钮执行语音指令</div>
            <div>• 上方显示转录结果</div>
            <div>• 支持语音和按钮操作</div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}

// 页面浮现效果样式
const pageStyles = `
  .page-container {
    position: relative;
    height: 100%;
    width: 100%;
    perspective: 1000px;
  }
  
  .page-content {
    height: 100%;
    width: 100%;
    animation: pageEmerge 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-origin: center center;
    backface-visibility: hidden;
  }
  
  @keyframes pageEmerge {
    0% {
      opacity: 0;
      transform: translateZ(-200px) rotateX(15deg) scale(0.8);
      filter: blur(10px);
    }
    40% {
      opacity: 0.6;
      transform: translateZ(-100px) rotateX(8deg) scale(0.9);
      filter: blur(5px);
    }
    70% {
      opacity: 0.9;
      transform: translateZ(-30px) rotateX(3deg) scale(0.98);
      filter: blur(1px);
    }
    100% {
      opacity: 1;
      transform: translateZ(0) rotateX(0deg) scale(1);
      filter: blur(0px);
    }
  }
  
  /* 为不同页面添加轻微的浮现延迟 */
  .page-content:nth-child(1) {
    animation-delay: 0.1s;
  }
  
  /* 增强3D透视效果 */
  .page-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%);
    opacity: 0;
    animation: shadowEmerge 1.2s ease-out forwards;
    pointer-events: none;
    z-index: -1;
  }
  
  @keyframes shadowEmerge {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
  }
`;

// 注入样式到页面
if (typeof document !== 'undefined' && !document.getElementById('page-emerge-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'page-emerge-styles';
  styleSheet.textContent = pageStyles;
  document.head.appendChild(styleSheet);
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export default AIEnhancedView