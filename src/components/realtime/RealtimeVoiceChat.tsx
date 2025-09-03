'use client'

import React, { useEffect, useRef, useState } from 'react'
import { RealtimeAgent } from '@openai/agents/realtime'
import { useRealtime } from '@/hooks/useRealtime'
import { createDefaultAgent } from '@/lib/realtime/agents'

interface RealtimeVoiceChatProps {
  agent?: RealtimeAgent
  className?: string
  onTranscript?: (text: string, isFinal: boolean) => void
}

export default function RealtimeVoiceChat({ 
  agent, 
  className = '',
  onTranscript 
}: RealtimeVoiceChatProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')
  const [isVADEnabled, setIsVADEnabled] = useState(true)
  
  const defaultAgent = createDefaultAgent()
  const currentAgent = agent || defaultAgent

  const {
    status,
    lastTranscript,
    connect,
    disconnect,
    sendText,
    pttStart,
    pttStop,
    enableServerVAD,
  } = useRealtime({
    agent: currentAgent,
    onTranscript,
    onError: (err) => setError(err.message),
  })

  // VAD is enabled by default, no need to manually set it

  const handleConnect = () => {
    if (audioRef.current) {
      setError('')
      connect(audioRef.current)
    }
  }

  const handleSendText = () => {
    if (textInput.trim()) {
      sendText(textInput.trim())
      setTextInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED': return 'text-green-500'
      case 'CONNECTING': return 'text-yellow-500'
      case 'DISCONNECTED': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'CONNECTED': return 'Connected'
      case 'CONNECTING': return 'Connecting...'
      case 'DISCONNECTED': return 'Disconnected'
      default: return 'Unknown'
    }
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <audio ref={audioRef} autoPlay playsInline />
      
      {/* Status Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Realtime Voice Chat</h2>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'CONNECTED' ? 'bg-green-500 animate-pulse' :
            status === 'CONNECTING' ? 'bg-yellow-500 animate-pulse' :
            'bg-gray-400'
          }`} />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={handleConnect}
          disabled={status !== 'DISCONNECTED'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600 transition-colors"
        >
          Connect
        </button>
        <button
          onClick={disconnect}
          disabled={status === 'DISCONNECTED'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Voice Activity Detection Toggle */}
      <div className="flex items-center space-x-3 mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isVADEnabled}
            onChange={(e) => setIsVADEnabled(e.target.checked)}
            disabled={status !== 'CONNECTED'}
            className="rounded"
          />
          <span className="text-sm">Server VAD (Voice Activity Detection)</span>
        </label>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={status !== 'CONNECTED'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendText}
            disabled={status !== 'CONNECTED' || !textInput.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400 hover:bg-green-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Push-to-Talk Button */}
      <div className="mb-4">
        <button
          onMouseDown={pttStart}
          onMouseUp={pttStop}
          onMouseLeave={pttStop}
          disabled={status !== 'CONNECTED' || isVADEnabled}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-purple-600 transition-colors active:bg-purple-700 select-none"
        >
          {isVADEnabled ? 'PTT (Disabled - VAD Active)' : 'Push to Talk'}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          {isVADEnabled ? 'Disable VAD to use Push-to-Talk' : 'Hold down to speak'}
        </p>
      </div>

      {/* Transcript Display */}
      {lastTranscript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Last Transcript:</h3>
          <p className="text-sm">{lastTranscript}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800 mb-1">Error:</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 mt-4 space-y-1">
        <p>• Connect to start voice chat</p>
        <p>• Enable VAD for hands-free speaking or use Push-to-Talk</p>
        <p>• Try asking: "What time is it?" or "Tell me about my system"</p>
      </div>
    </div>
  )
}