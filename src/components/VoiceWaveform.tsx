'use client'

import React, { useState, useEffect, useRef } from 'react'

// Waveform bar component
const WaveformBar = ({ 
  height, 
  delay = 0, 
  isActive = false 
}: { 
  height: number
  delay?: number
  isActive?: boolean 
}) => (
  <div 
    className={`bg-gradient-to-t from-blue-400 to-blue-600 rounded-full transition-all duration-150 ${
      isActive ? 'shadow-lg shadow-blue-500/30' : ''
    }`}
    style={{
      width: '3px',
      height: `${height}px`,
      animation: isActive ? `wave 0.6s ease-in-out infinite` : 'none',
      animationDelay: `${delay}ms`
    }}
  />
)

// Voice status indicator
const VoiceStatus = ({ 
  isListening, 
  isProcessing,
  transcript 
}: { 
  isListening: boolean
  isProcessing: boolean
  transcript: string 
}) => (
  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
    <div className="bg-black bg-opacity-80 backdrop-blur-md rounded-lg px-4 py-2 max-w-md">
      {isProcessing ? (
        <div className="flex items-center space-x-2 text-yellow-300">
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <span className="text-sm">处理中...</span>
        </div>
      ) : isListening ? (
        <div className="flex items-center space-x-2 text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">正在聆听...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm">点击开始语音输入</span>
        </div>
      )}
      
      {transcript && (
        <div className="mt-2 text-white text-sm border-t border-white border-opacity-20 pt-2">
          {transcript}
        </div>
      )}
    </div>
  </div>
)

export default function VoiceWaveform() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [waveformHeights, setWaveformHeights] = useState<number[]>(new Array(15).fill(4))
  const [isActive, setIsActive] = useState(false) // Track if voice recognition should be active
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true  
      recognition.lang = 'zh-CN'
      recognition.maxAlternatives = 1
      
      recognition.onstart = () => {
        setIsListening(true)
        setIsProcessing(false)
        startWaveformAnimation()
      }
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript)
        }
      }
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsProcessing(false)
        stopWaveformAnimation()
      }
      
      recognition.onend = () => {
        console.log('Recognition ended')
        setIsListening(false)
        stopWaveformAnimation()
        
        // Only restart if we're supposed to be active
        if (isActive) {
          setTimeout(() => {
            if (recognitionRef.current && isActive) {
              try {
                recognitionRef.current.start()
                console.log('Recognition restarted')
              } catch (err) {
                console.log('Recognition restart failed:', err)
              }
            }
          }, 100)
        }
      }
      
      recognitionRef.current = recognition
      
      // Don't auto-start recognition - wait for user click
    }
    
    return () => {
      setIsActive(false) // Disable auto-restart during cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [isActive])

  // Waveform animation
  const startWaveformAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }
    
    animationRef.current = setInterval(() => {
      setWaveformHeights(prev => 
        prev.map(() => Math.random() * 30 + 4)
      )
    }, 100)
  }

  const stopWaveformAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
    setWaveformHeights(new Array(15).fill(4))
  }

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    setIsProcessing(true)
    
    console.log('Voice command:', command)
    
    // Simple command processing
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('打开') || lowerCommand.includes('启动')) {
      if (lowerCommand.includes('咨询') || lowerCommand.includes('ai')) {
        // 触发代码生成效果
        window.dispatchEvent(new CustomEvent('triggerCodeGeneration', { 
          detail: { targetPage: 'consult' } 
        }))
      } else if (lowerCommand.includes('设置')) {
        // 触发代码生成效果
        window.dispatchEvent(new CustomEvent('triggerCodeGeneration', { 
          detail: { targetPage: 'settings' } 
        }))
      }
    }
    
    // Clear transcript after processing
    setTimeout(() => {
      setTranscript('')
      setIsProcessing(false)
    }, 2000)
  }

  // Manual toggle - trigger code generation effect
  const toggleListening = () => {
    // 直接触发代码生成效果，跳转到测试页面
    window.dispatchEvent(new CustomEvent('triggerCodeGeneration', { 
      detail: { targetPage: 'test' } 
    }))
  }

  return (
    <>
      {/* CSS for wave animation */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
      
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50">
        {/* Waveform Container */}
        <div 
          className="relative cursor-pointer group"
          onClick={toggleListening}
        >
          {/* Outer glow effect */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isActive
              ? 'bg-blue-500 bg-opacity-20 blur-xl scale-150' 
              : 'bg-blue-500 bg-opacity-10 blur-lg scale-125'
          }`} />
          
          {/* Main waveform container */}
          <div className="relative bg-black bg-opacity-60 backdrop-blur-md rounded-full p-4 border border-white border-opacity-20">
            {/* Waveform bars */}
            <div className="flex items-center justify-center space-x-1">
              {waveformHeights.map((height, index) => (
                <WaveformBar
                  key={index}
                  height={height}
                  delay={index * 50}
                  isActive={isActive && isListening}
                />
              ))}
            </div>
            
            {/* Center microphone icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-6 h-6 text-white transition-all duration-200 ${
                isActive && isListening ? 'scale-0 opacity-0' : 'scale-100 opacity-70'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200" />
        </div>
        
        {/* Hint text */}
        <div className="text-center mt-2">
          <p className="text-white text-xs opacity-60">
            试试说："打开AI咨询" 或 "打开设置"
          </p>
        </div>
      </div>
    </>
  )
}