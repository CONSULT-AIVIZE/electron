'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CodeGeneration from '../CodeGeneration'

// Desktop wallpaper component
const DesktopWallpaper = () => (
  <div className="absolute inset-0">
    {/* Windows 11 style gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-blue-800"></div>
    
    {/* Subtle texture overlay */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
    </div>
    
    {/* Windows logo watermark */}
    <div className="absolute bottom-10 right-10 opacity-10">
      <div className="w-32 h-32 grid grid-cols-2 gap-1">
        <div className="bg-white rounded-sm"></div>
        <div className="bg-white rounded-sm"></div>
        <div className="bg-white rounded-sm"></div>
        <div className="bg-white rounded-sm"></div>
      </div>
    </div>
  </div>
)

// Desktop icon component
const DesktopIcon = ({ 
  name, 
  icon, 
  onClick, 
  position 
}: { 
  name: string
  icon: React.ReactNode
  onClick: () => void
  position: { x: number; y: number }
}) => (
  <div
    className="absolute cursor-pointer group"
    style={{ left: `${position.x}px`, top: `${position.y}px` }}
    onClick={onClick}
    onDoubleClick={onClick}
  >
    <div className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200">
      <div className="w-12 h-12 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <span className="text-white text-xs font-medium text-center max-w-16 leading-tight drop-shadow-lg">
        {name}
      </span>
    </div>
  </div>
)

// Taskbar component
const Taskbar = () => (
  <div className="absolute bottom-0 left-0 right-0 h-12 bg-black bg-opacity-40 backdrop-blur-lg border-t border-white border-opacity-10">
    <div className="flex items-center justify-between h-full px-4">
      {/* Start button */}
      <div className="flex items-center space-x-2">
        <button className="flex items-center justify-center w-10 h-8 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors duration-200">
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
          </div>
        </button>
      </div>

      {/* Center - reserved for voice waveform */}
      <div className="flex-1"></div>

      {/* System tray */}
      <div className="flex items-center space-x-3 text-white text-sm">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
        </div>
        <div className="text-xs font-mono">
          {new Date().toLocaleTimeString('zh-CN', { 
            hour12: false,
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  </div>
)

export default function WindowsDesktop() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [targetPage, setTargetPage] = useState<string>('')

  // Listen for voice-triggered code generation
  useEffect(() => {
    const handleVoiceCodeGeneration = (event: CustomEvent) => {
      const { targetPage } = event.detail
      setTargetPage(targetPage)
      setIsGenerating(true)
    }

    window.addEventListener('triggerCodeGeneration', handleVoiceCodeGeneration as EventListener)

    return () => {
      window.removeEventListener('triggerCodeGeneration', handleVoiceCodeGeneration as EventListener)
    }
  }, [])

  // Navigate with code generation effect
  const navigateToPage = (path: string) => {
    const pageName = path.replace('/', '')
    setTargetPage(pageName)
    setIsGenerating(true)
  }

  const handleGenerationComplete = () => {
    setIsGenerating(false)
    setTargetPage('')
  }

  // Desktop icons configuration
  const desktopIcons = [
    {
      name: 'AI 咨询',
      position: { x: 50, y: 50 },
      onClick: () => navigateToPage('/consult'),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: '系统设置',
      position: { x: 50, y: 150 },
      onClick: () => navigateToPage('/settings'),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: '文件管理器',
      position: { x: 50, y: 250 },
      onClick: () => {}, // Placeholder
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      name: '浏览器',
      position: { x: 50, y: 350 },
      onClick: () => {}, // Placeholder
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ]

  return (
    <div className="absolute inset-0">
      {/* Desktop Wallpaper */}
      <DesktopWallpaper />

      {/* Desktop Icons */}
      {desktopIcons.map((icon, index) => (
        <DesktopIcon
          key={index}
          name={icon.name}
          icon={icon.icon}
          onClick={icon.onClick}
          position={icon.position}
        />
      ))}

      {/* Taskbar */}
      <Taskbar />

      {/* Code Generation Effect */}
      <CodeGeneration
        isGenerating={isGenerating}
        targetPage={targetPage}
        onComplete={handleGenerationComplete}
      />
    </div>
  )
}