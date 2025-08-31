'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceAssistant from '../VoiceAssistant'

const Dashboard = () => {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTraditionalMode, setIsTraditionalMode] = useState(false)

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleTraditionalMode = () => {
    setIsTraditionalMode(!isTraditionalMode)
  }

  if (isTraditionalMode) {
    return (
      <div className="h-full w-full relative">
        {/* AI Mode Toggle */}
        <button
          onClick={toggleTraditionalMode}
          className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black bg-opacity-40 backdrop-blur-md text-white text-sm rounded-lg border border-white border-opacity-20 hover:bg-opacity-60 transition-all"
        >
          AI 模式
        </button>
        
        {/* Full-screen iframe for traditional mode */}
        <iframe
          src="https://pre-aivize.tlboy.com"
          className="w-full h-full border-0"
          title="Traditional Mode"
        />
      </div>
    )
  }

  return (
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Simple background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black" />

      {/* Traditional Mode Toggle - Top Right - Simplified */}
      <button
        onClick={toggleTraditionalMode}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black bg-opacity-40 backdrop-blur-md text-white text-sm rounded-lg border border-white border-opacity-20 hover:bg-opacity-60 transition-all"
      >
        传统模式
      </button>

      {/* Voice Assistant Component - This will be redesigned to be centered */}
      <VoiceAssistant />
    </div>
  )
}

export default Dashboard