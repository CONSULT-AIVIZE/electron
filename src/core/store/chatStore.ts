import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    tokens?: number
    model?: string
    tools?: string[]
    error?: string
    status?: 'sending' | 'streaming' | 'complete' | 'error'
  }
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  projectId?: string
}

interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  isStreaming: boolean
  streamingMessageId: string | null
  
  // Actions
  createSession: (title?: string, projectId?: string) => string
  switchSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, title: string) => void
  
  // Message actions
  addMessage: (content: string, role: 'user' | 'assistant' | 'system', sessionId?: string) => string
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  deleteMessage: (messageId: string, sessionId?: string) => void
  clearMessages: (sessionId?: string) => void
  
  // Streaming actions
  startStreaming: (messageId: string) => void
  appendToStreamingMessage: (content: string) => void
  finishStreaming: () => void
  
  // Session management
  getCurrentSession: () => ChatSession | null
  getSessionById: (sessionId: string) => ChatSession | null
  searchMessages: (query: string) => Message[]
  
  // Persistence
  exportSession: (sessionId: string) => string | null
  importSession: (sessionData: string) => boolean
  loadSessionHistory: () => Promise<void>
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    sessions: [],
    currentSessionId: null,
    isLoading: false,
    isStreaming: false,
    streamingMessageId: null,
    
    createSession: (title = 'New Consultation', projectId) => {
      const sessionId = nanoid()
      const newSession: ChatSession = {
        id: sessionId,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        projectId,
      }
      
      set((state) => {
        // Deactivate current session
        if (state.currentSessionId) {
          const currentSession = state.sessions.find(s => s.id === state.currentSessionId)
          if (currentSession) {
            currentSession.isActive = false
          }
        }
        
        state.sessions.push(newSession)
        state.currentSessionId = sessionId
      })
      
      return sessionId
    },
    
    switchSession: (sessionId) => {
      set((state) => {
        // Deactivate all sessions
        state.sessions.forEach(session => {
          session.isActive = false
        })
        
        // Activate target session
        const targetSession = state.sessions.find(s => s.id === sessionId)
        if (targetSession) {
          targetSession.isActive = true
          state.currentSessionId = sessionId
        }
      })
    },
    
    deleteSession: (sessionId) => {
      set((state) => {
        state.sessions = state.sessions.filter(s => s.id !== sessionId)
        
        if (state.currentSessionId === sessionId) {
          // Switch to most recent session or create new one
          const remainingSessions = state.sessions.filter(s => s.id !== sessionId)
          if (remainingSessions.length > 0) {
            const mostRecent = remainingSessions.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0]
            state.currentSessionId = mostRecent.id
            mostRecent.isActive = true
          } else {
            state.currentSessionId = null
          }
        }
      })
    },
    
    updateSessionTitle: (sessionId, title) => {
      set((state) => {
        const session = state.sessions.find(s => s.id === sessionId)
        if (session) {
          session.title = title
          session.updatedAt = new Date()
        }
      })
    },
    
    addMessage: (content, role, sessionId) => {
      const messageId = nanoid()
      const targetSessionId = sessionId || get().currentSessionId
      
      if (!targetSessionId) {
        // Create new session if none exists
        const newSessionId = get().createSession()
        return get().addMessage(content, role, newSessionId)
      }
      
      const message: Message = {
        id: messageId,
        role,
        content,
        timestamp: new Date(),
        metadata: {
          status: role === 'user' ? 'complete' : 'sending'
        }
      }
      
      set((state) => {
        const session = state.sessions.find(s => s.id === targetSessionId)
        if (session) {
          session.messages.push(message)
          session.updatedAt = new Date()
        }
      })
      
      return messageId
    },
    
    updateMessage: (messageId, updates) => {
      set((state) => {
        for (const session of state.sessions) {
          const message = session.messages.find(m => m.id === messageId)
          if (message) {
            Object.assign(message, updates)
            session.updatedAt = new Date()
            break
          }
        }
      })
    },
    
    deleteMessage: (messageId, sessionId) => {
      const targetSessionId = sessionId || get().currentSessionId
      if (!targetSessionId) return
      
      set((state) => {
        const session = state.sessions.find(s => s.id === targetSessionId)
        if (session) {
          session.messages = session.messages.filter(m => m.id !== messageId)
          session.updatedAt = new Date()
        }
      })
    },
    
    clearMessages: (sessionId) => {
      const targetSessionId = sessionId || get().currentSessionId
      if (!targetSessionId) return
      
      set((state) => {
        const session = state.sessions.find(s => s.id === targetSessionId)
        if (session) {
          session.messages = []
          session.updatedAt = new Date()
        }
      })
    },
    
    startStreaming: (messageId) => {
      set((state) => {
        state.isStreaming = true
        state.streamingMessageId = messageId
      })
    },
    
    appendToStreamingMessage: (content) => {
      const { streamingMessageId } = get()
      if (!streamingMessageId) return
      
      set((state) => {
        for (const session of state.sessions) {
          const message = session.messages.find(m => m.id === streamingMessageId)
          if (message) {
            message.content += content
            if (message.metadata) {
              message.metadata.status = 'streaming'
            }
            session.updatedAt = new Date()
            break
          }
        }
      })
    },
    
    finishStreaming: () => {
      const { streamingMessageId } = get()
      if (!streamingMessageId) return
      
      set((state) => {
        for (const session of state.sessions) {
          const message = session.messages.find(m => m.id === streamingMessageId)
          if (message) {
            if (message.metadata) {
              message.metadata.status = 'complete'
            }
            break
          }
        }
        state.isStreaming = false
        state.streamingMessageId = null
      })
    },
    
    getCurrentSession: () => {
      const { sessions, currentSessionId } = get()
      return sessions.find(s => s.id === currentSessionId) || null
    },
    
    getSessionById: (sessionId) => {
      return get().sessions.find(s => s.id === sessionId) || null
    },
    
    searchMessages: (query) => {
      const { sessions } = get()
      const results: Message[] = []
      const lowerQuery = query.toLowerCase()
      
      for (const session of sessions) {
        for (const message of session.messages) {
          if (message.content.toLowerCase().includes(lowerQuery)) {
            results.push(message)
          }
        }
      }
      
      return results.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    },
    
    exportSession: (sessionId) => {
      const session = get().getSessionById(sessionId)
      if (!session) return null
      
      return JSON.stringify(session, null, 2)
    },
    
    importSession: (sessionData) => {
      try {
        const session = JSON.parse(sessionData) as ChatSession
        
        set((state) => {
          // Ensure unique ID
          session.id = nanoid()
          session.isActive = false
          state.sessions.push(session)
        })
        
        return true
      } catch (error) {
        console.error('Failed to import session:', error)
        return false
      }
    },
    
    loadSessionHistory: async () => {
      set((state) => {
        state.isLoading = true
      })
      
      try {
        // In a real application, this would load from an API or local storage
        // For now, we'll just simulate loading
        await new Promise(resolve => setTimeout(resolve, 500))
        
        set((state) => {
          state.isLoading = false
        })
      } catch (error) {
        console.error('Failed to load session history:', error)
        set((state) => {
          state.isLoading = false
        })
      }
    },
  }))
)