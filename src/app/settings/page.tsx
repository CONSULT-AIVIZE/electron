'use client'

import { useState, useEffect } from 'react'
import VoiceAssistant from '@/components/VoiceAssistant'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    voiceLanguage: 'zh-CN',
    autoStart: true,
    fullscreen: true,
    theme: 'dark'
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="h-12 bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-5 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="window-controls">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-lg font-semibold text-white">系统设置</h1>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="os-button text-xs"
        >
          返回桌面
        </button>
      </header>

      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto modern-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Voice Settings */}
          <section className="glass-strong p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              语音控制
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white text-opacity-80">启用语音控制</label>
                <button
                  onClick={() => handleSettingChange('voiceEnabled', !settings.voiceEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.voiceEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Voice Language</label>
                <select
                  value={settings.voiceLanguage}
                  onChange={(e) => handleSettingChange('voiceLanguage', e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                >
                  <option value="zh-CN">Chinese (Simplified)</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                </select>
              </div>
            </div>
          </section>

          {/* System Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-green-400">System</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Auto Start with System</label>
                <button
                  onClick={() => handleSettingChange('autoStart', !settings.autoStart)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoStart ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoStart ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Fullscreen Mode</label>
                <button
                  onClick={() => {
                    handleSettingChange('fullscreen', !settings.fullscreen)
                    // Toggle fullscreen via Electron API
                    if (window.electronAPI) {
                      window.electronAPI.toggleFullscreen()
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.fullscreen ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.fullscreen ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </section>

          {/* System Info */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">System Information</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Version: 1.0.0</div>
              <div>Platform: {typeof window !== 'undefined' ? navigator.platform : 'Unknown'}</div>
              <div>Build: Development</div>
            </div>
          </section>

        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  )
}