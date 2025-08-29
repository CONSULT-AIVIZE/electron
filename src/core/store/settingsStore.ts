import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VoiceSettings {
  enabled: boolean
  language: string
  continuous: boolean
  autoRestart: boolean
  volume: number
}

interface SystemSettings {
  autoStart: boolean
  fullscreen: boolean
  theme: 'dark' | 'light' | 'auto'
  notifications: boolean
}

interface MCPSettings {
  endpoint: string
  enabled: boolean
  timeout: number
}

interface ChatSettings {
  streamEnabled: boolean
  maxTokens: number
  temperature: number
  model: string
}

interface SettingsState {
  voice: VoiceSettings
  system: SystemSettings
  mcp: MCPSettings
  chat: ChatSettings
  
  // Actions
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void
  updateSystemSettings: (settings: Partial<SystemSettings>) => void
  updateMCPSettings: (settings: Partial<MCPSettings>) => void
  updateChatSettings: (settings: Partial<ChatSettings>) => void
  resetToDefaults: () => void
  exportSettings: () => string
  importSettings: (settings: string) => boolean
}

const defaultSettings = {
  voice: {
    enabled: true,
    language: 'zh-CN',
    continuous: true,
    autoRestart: true,
    volume: 1.0,
  },
  system: {
    autoStart: true,
    fullscreen: true,
    theme: 'dark' as const,
    notifications: true,
  },
  mcp: {
    endpoint: '',
    enabled: false,
    timeout: 30000,
  },
  chat: {
    streamEnabled: true,
    maxTokens: 4000,
    temperature: 0.7,
    model: 'gpt-4',
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      updateVoiceSettings: (settings) =>
        set((state) => ({
          voice: { ...state.voice, ...settings },
        })),
        
      updateSystemSettings: (settings) =>
        set((state) => ({
          system: { ...state.system, ...settings },
        })),
        
      updateMCPSettings: (settings) =>
        set((state) => ({
          mcp: { ...state.mcp, ...settings },
        })),
        
      updateChatSettings: (settings) =>
        set((state) => ({
          chat: { ...state.chat, ...settings },
        })),
        
      resetToDefaults: () => set(defaultSettings),
      
      exportSettings: () => {
        const state = get()
        return JSON.stringify({
          voice: state.voice,
          system: state.system,
          mcp: state.mcp,
          chat: state.chat,
        }, null, 2)
      },
      
      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson)
          set({
            voice: { ...defaultSettings.voice, ...settings.voice },
            system: { ...defaultSettings.system, ...settings.system },
            mcp: { ...defaultSettings.mcp, ...settings.mcp },
            chat: { ...defaultSettings.chat, ...settings.chat },
          })
          return true
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      },
    }),
    {
      name: 'triangle-os-settings',
      version: 1,
    }
  )
)