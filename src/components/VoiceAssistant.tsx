'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface VoiceAssistantProps {
  className?: string
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className = '' }) => {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        
        // Configure recognition settings
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'zh-CN' // Primary language: Chinese
        recognition.maxAlternatives = 3

        // Event handlers
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
          
          // Handle different error types
          if (event.error === 'network') {
            setError('网络连接问题，语音识别暂时不可用')
            // Don't auto-restart network errors in development
            setIsListening(false)
            return
          } else if (event.error === 'no-speech') {
            // This is normal, just restart
            scheduleRestart()
            return
          } else if (event.error === 'audio-capture') {
            setError('无法访问麦克风，请检查权限设置')
          } else if (event.error === 'not-allowed') {
            setError('麦克风权限被拒绝，请在设置中允许麦克风访问')
          } else {
            setError(`语音识别错误: ${event.error}`)
          }
          
          setIsListening(false)
        }

        recognition.onend = () => {
          console.log('Voice recognition ended')
          setIsListening(false)
          setTranscript('')
          
          // Auto-restart if not manually stopped
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [])

  // Schedule recognition restart
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
    }, 1000) // Restart after 1 second
  }, [isListening])

  // Process voice commands
  const processVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase()
    console.log('Processing command:', lowerCommand)

    // Navigation commands (Chinese and English)
    const navigationCommands = [
      { patterns: ['打开咨询', '咨询', '开始咨询', 'open consult', 'consultation', 'consult'], route: '/consult' },
      { patterns: ['打开设置', '设置', '系统设置', 'open settings', 'settings', 'preferences'], route: '/settings' },
      { patterns: ['回到主页', '主页', '桌面', 'home', 'dashboard', 'go home'], route: '/' },
    ]

    // Check navigation commands
    for (const nav of navigationCommands) {
      if (nav.patterns.some(pattern => lowerCommand.includes(pattern))) {
        router.push(nav.route)
        return
      }
    }

    // System commands
    if (lowerCommand.includes('最小化') || lowerCommand.includes('minimize')) {
      if (window.electronAPI) {
        window.electronAPI.minimizeApp()
      }
      return
    }

    if (lowerCommand.includes('全屏') || lowerCommand.includes('fullscreen')) {
      if (window.electronAPI) {
        window.electronAPI.toggleFullscreen()
      }
      return
    }

    // Send to Electron for system-level handling
    if (window.electronAPI) {
      window.electronAPI.sendVoiceCommand(command)
    }
  }, [router])

  // Toggle listening
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

  // Auto-start listening (only if not in error state)
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

  if (!isSupported) {
    return null // Don't render if not supported
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative z-10">
      {/* Voice Status Indicator - Center top */}
      <div className="mb-8">
        <button
          onClick={toggleListening}
          className={`
            w-20 h-20 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center relative
            ${isListening 
              ? 'bg-red-500 hover:bg-red-400' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
            }
            hover:scale-110 active:scale-95
          `}
          title={isListening ? '停止语音识别' : '开始语音控制'}
        >
          {isListening ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
          
          {/* Voice indicator rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
              <div className="absolute -inset-2 rounded-full border border-red-200 animate-pulse"></div>
              <div className="absolute -inset-4 rounded-full border border-red-100 opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </>
          )}
        </button>

        {/* Status indicator below button */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-white bg-opacity-30'}`}></div>
          <span className="text-white text-sm opacity-70">
            {isListening ? '正在监听' : '点击开始'}
          </span>
        </div>
      </div>

      {/* Lyrics-style transcript display - Center */}
      <div className="max-w-4xl w-full px-8 text-center">
        <div className="min-h-[120px] flex items-center justify-center">
          {transcript ? (
            <div className="text-white text-3xl font-light leading-relaxed animate-pulse">
              {transcript}
              <span className="animate-pulse ml-1 text-blue-400">|</span>
            </div>
          ) : lastCommand ? (
            <div className="text-white text-2xl font-light leading-relaxed opacity-80">
              {lastCommand}
            </div>
          ) : (
            <div className="text-white text-xl opacity-40">
              {isListening ? '请开始说话...' : '点击麦克风开始语音交互'}
            </div>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mt-4 text-red-400 text-sm bg-red-500 bg-opacity-10 rounded-lg px-4 py-2 backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>

    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export default VoiceAssistant