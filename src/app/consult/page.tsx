'use client'

import { useState } from 'react'
import VoiceAssistant from '@/components/VoiceAssistant'

export default function ConsultPage() {
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header with OS-style controls */}
      <header className="h-12 bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-5 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="window-controls">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-lg font-semibold text-white">AI 咨询助手</h1>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="os-button text-xs"
        >
          返回桌面
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex flex-col bg-black bg-opacity-10 backdrop-blur-sm rounded-2xl border border-white border-opacity-10 p-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto modern-scrollbar space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">欢迎使用 AI 咨询</h2>
                  <p className="text-gray-400">使用语音控制或聊天界面开始您的咨询</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="mt-4 flex space-x-3">
            <input
              type="text"
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white placeholder-opacity-50 backdrop-blur-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // Handle message sending
                }
              }}
            />
            <button className="os-button os-button-primary">
              发送
            </button>
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  )
}