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
    <>
      {/* Voice Status Panel - only show when active */}
      {(transcript || lastCommand || error) && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-black bg-opacity-80 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-4 shadow-2xl">
            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {transcript && (
              <div className="flex items-center space-x-2 text-blue-400 text-sm mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>听到: {transcript}</span>
              </div>
            )}
            {lastCommand && (
              <div className="flex items-center space-x-2 text-green-400 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>执行: {lastCommand}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mini Voice Control Button - bottom right corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleListening}
          className={`
            w-12 h-12 rounded-full shadow-lg transition-all duration-300 group
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gray-800 bg-opacity-90 hover:bg-gray-700 border border-white border-opacity-20'
            }
            backdrop-blur-sm hover:scale-110 active:scale-95
          `}
          title={isListening ? '停止语音识别' : '开始语音控制'}
        >
          {isListening ? (
            <svg className="w-6 h-6 text-white mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {isListening ? '停止语音' : '语音控制'}
          </div>
        </button>
        
        {/* Voice indicator ring */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
        )}
      </div>
    </>
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