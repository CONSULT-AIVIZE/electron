'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtime } from '../hooks/useRealtime'
import { RealtimeAgent, tool } from '@openai/agents-realtime'
import { useRouter } from 'next/navigation'
import { getSharedRuntimeService } from '../core/runtime/sharedRuntime'
import { navigateToRoute, isElectronProduction } from '../utils/electronNavigation'
import { z } from 'zod'

interface RealtimeVoiceProps {
  className?: string
  onTranscript?: (text: string, isFinal: boolean) => void
}

const RealtimeVoice: React.FC<RealtimeVoiceProps> = ({ 
  className = '',
  onTranscript 
}) => {
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [agent, setAgent] = useState<RealtimeAgent | null>(null)
  const runtimeService = getSharedRuntimeService()
  const [isInitialized, setIsInitialized] = useState(false)
  const [vadEnabled, setVadEnabled] = useState(true)
  const [userTranscript, setUserTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [lastToolsHash, setLastToolsHash] = useState('')
  
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    console.log('[RealtimeVoice] User Transcript:', text, 'Final:', isFinal)
    
    // Update user transcript display
    setUserTranscript(text)
    setIsUserSpeaking(!isFinal)
    
    if (isFinal) {
      // Clear user transcript after a delay
      setTimeout(() => {
        setUserTranscript('')
        setIsUserSpeaking(false)
      }, 3000)
      
      // The agent will handle command processing through tools
      console.log('[RealtimeVoice] Transcript will be processed by agent tools')
    }
    
    onTranscript?.(text, isFinal)
  }, [onTranscript])
  
  const handleAiResponse = useCallback((text: string, isFinal: boolean) => {
    console.log('[RealtimeVoice] AI Response:', text, 'Final:', isFinal)
    
    // Update AI response display
    setAiResponse(text)
    setIsAiSpeaking(!isFinal)
    
    if (isFinal) {
      // Clear AI response after a delay
      setTimeout(() => {
        setAiResponse('')
        setIsAiSpeaking(false)
      }, 5000)
    }
  }, [])
  
  const realtime = useRealtime({
    agent: agent || null,
    onTranscript: handleTranscript,
    onAiResponse: handleAiResponse,
    onError: (error) => {
      console.error('[RealtimeVoice] Error:', error)
    }
  })
  

  // Initialize agent once
  useEffect(() => {
    const initAgent = () => {
      console.log('[RealtimeVoice] Initializing basic agent')
      
      // Create basic agent first (will be updated with tools later)
      const newAgent = new RealtimeAgent({
        name: 'TriangleOS Assistant',
        instructions: `You are the TriangleOS voice assistant. You help users navigate the system and execute commands.

IMPORTANT: You MUST use the appropriate tool when the user asks to perform an action.

CHAT/MESSAGE HANDLING:
- When user wants to send a message or chat content, use the guided_chat_send tool with userInput parameter
- For example: "帮我调研下COLOX的供应商" -> use guided_chat_send tool with userInput: "帮我调研下COLOX的供应商"
- The system will automatically add this to the chat input and send it

Respond in Chinese by default, but understand both Chinese and English.
Keep responses brief and action-oriented.
ALWAYS use the appropriate tool - do not just describe what you would do.`,
        voice: 'sage',
        tools: [] // Start with empty tools
      })
      
      console.log('[RealtimeVoice] Basic agent initialized')
      setAgent(newAgent)
      setIsInitialized(true)
    }
    
    initAgent()
  }, [])

  // Listen for command updates and update tools without reconnecting
  useEffect(() => {
    if (!agent) {
      console.log('[RealtimeVoice] Agent not ready yet, waiting for initialization')
      return
    }

    const handleCommandsUpdate = (commands: any[]) => {
      console.log('[RealtimeVoice] Commands updated, updating tools without reconnection', commands.length)
      
      // Create a hash of the commands to detect actual changes
      const commandsHash = commands.map(c => `${c.id}-${c.triggers.join(',')}`).sort().join('|')
      if (commandsHash === lastToolsHash) {
        console.log('[RealtimeVoice] Tools unchanged, skipping session.update')
        return
      }
      setLastToolsHash(commandsHash)
      
      // Create new tools from commands inline to avoid dependency issues
      const newTools = commands.map(command => {
        try {
          return tool({
            name: command.id,
            description: `${command.description}. Use when user says: ${command.triggers.join(', ')}`,
            parameters: z.object({
              params: z.any().nullable().optional().describe('Optional parameters for the command'),
              userInput: z.string().nullable().optional().describe('User spoken content to be sent as message (for chat/send commands)')
            }),
            execute: async (args) => {
          console.log(`[Tool Execute] ${command.id}:`, command.description, args)
          
          // Prepare parameters including user input for chat commands
          const commandParams = {
            ...args.params,
            userInput: args.userInput // Include user spoken content
          }
          
          // Directly use RuntimeService to execute the command
          const success = await runtimeService.executeCommand(command, commandParams)
          
          if (success) {
            return `已执行: ${command.description}`
          } else {
            return `执行失败: ${command.description}`
          }
        }
      })
        } catch (error) {
          console.error(`[RealtimeVoice] Failed to create tool for ${command.id}:`, error)
          return null
        }
      }).filter(t => t !== null)
      
      console.log(`[RealtimeVoice] Created ${newTools.length} tools from commands:`, newTools.map(t => t.name))
      
      // Update agent's tools directly
      agent.tools = newTools
      console.log(`[RealtimeVoice] Agent tools updated, now has ${agent.tools.length} tools`)
      
      // If connected, update the session with new tools
      if (realtime.status === 'CONNECTED') {
        console.log('[RealtimeVoice] Updating session tools via session.update')
        
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: `You are the TriangleOS voice assistant. You help users navigate the system and execute commands.

IMPORTANT: You MUST use the appropriate tool when the user asks to perform an action.

CHAT/MESSAGE HANDLING:
- When user wants to send a message or chat content, use the guided_chat_send tool with userInput parameter
- For example: "帮我调研下COLOX的供应商" -> use guided_chat_send tool with userInput: "帮我调研下COLOX的供应商"
- The system will automatically add this to the chat input and send it

Available tools and their triggers:
${newTools.map((t: any) => `- ${t.name}: ${t.description}`).join('\n')}

Respond in Chinese by default, but understand both Chinese and English.
Keep responses brief and action-oriented.
ALWAYS use the appropriate tool - do not just describe what you would do.`,
            tools: newTools.map((tool: any) => ({
              type: 'function',
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }))
          }
        }
        
        realtime.sendEvent(sessionUpdate)
        setLastToolsHash(commandsHash) // 更新hash以保持同步
        console.log('[RealtimeVoice] Session update sent with tools:', newTools.length)
      } else {
        console.log('[RealtimeVoice] Not connected yet, tools will be updated when connection is established')
      }
    }
    
    // Add listener for command updates
    runtimeService.addListener(handleCommandsUpdate)
    
    // Check for commands immediately when agent becomes available
    const currentCommands = runtimeService.getCurrentCommands()
    console.log('[RealtimeVoice] Agent ready, checking current commands:', currentCommands.length)
    
    if (currentCommands.length > 0) {
      handleCommandsUpdate(currentCommands)
    } else {
      console.log('[RealtimeVoice] No commands available yet, waiting for app to load...')
    }
    
    // Cleanup listener on unmount
    return () => {
      runtimeService.removeListener(handleCommandsUpdate)
    }
  }, [agent, runtimeService, lastToolsHash]) // Added lastToolsHash to detect changes
  
  // Auto-connect when component mounts and agent is initialized
  useEffect(() => {
    if (audioRef.current && agent && isInitialized && realtime.status === 'DISCONNECTED') {
      // Ensure agent is fully ready with tools before connecting
      const currentCommands = runtimeService.getCurrentCommands()
      
      // Small delay to ensure component is fully mounted and tools are ready
      const timer = setTimeout(() => {
        console.log('[RealtimeVoice] Auto-connecting to OpenAI Realtime...', {
          hasAgent: !!agent,
          isInitialized,
          status: realtime.status,
          commandsCount: currentCommands.length
        })
        realtime.connect(audioRef.current!)
      }, 1500) // Increased delay to ensure everything is ready
      
      return () => clearTimeout(timer)
    }
  }, [agent, isInitialized, realtime.status, runtimeService])

  // When connection is established, just log - tools are updated by handleCommandsUpdate
  useEffect(() => {
    if (realtime.status === 'CONNECTED') {
      console.log('[RealtimeVoice] Connection established, tools will be updated by command listener')
    }
  }, [realtime.status])

  
  const handleToggle = useCallback(() => {
    if (realtime.status === 'CONNECTED') {
      realtime.disconnect()
    } else if (realtime.status === 'DISCONNECTED' && audioRef.current && agent) {
      realtime.connect(audioRef.current)
    }
  }, [realtime, agent])
  
  const handlePTT = useCallback((pressed: boolean) => {
    if (pressed) {
      realtime.pttStart()
    } else {
      realtime.pttStop()
    }
  }, [realtime])
  
  const toggleVAD = useCallback(() => {
    const newState = !vadEnabled
    setVadEnabled(newState)
    realtime.enableServerVAD(newState)
  }, [vadEnabled, realtime])
  
  const getStatusColor = () => {
    switch (realtime.status) {
      case 'CONNECTED': return 'bg-green-500'
      case 'CONNECTING': return 'bg-yellow-500'
      case 'DISCONNECTED': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }
  
  const getStatusText = () => {
    switch (realtime.status) {
      case 'CONNECTED': return '在线'
      case 'CONNECTING': return '连接中'
      case 'DISCONNECTED': return '离线'
      default: return '离线'
    }
  }
  
  return (
    <div className={`h-full w-full flex items-center justify-center px-8 ${className}`}>
      {/* Hidden audio element for OpenAI Realtime */}
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex items-center space-x-8 w-full max-w-4xl">
        {/* 语音状态指示器 */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center ${
              realtime.status === 'CONNECTED' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : realtime.status === 'CONNECTING'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            
            {/* 动画效果 */}
            {realtime.status === 'CONNECTED' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping"></div>
                <div className="absolute -inset-1 rounded-full border border-green-200 animate-pulse"></div>
              </>
            )}
            
            {realtime.status === 'CONNECTING' && (
              <div className="absolute inset-0 rounded-full border-4 border-yellow-300 border-t-transparent animate-spin"></div>
            )}
          </div>
        </div>
        
        {/* 转录显示区 */}
        <div className="flex-1 min-h-[80px] flex flex-col justify-center space-y-2">
          {/* User transcript */}
          {userTranscript && (
            <div className="flex items-center space-x-2">
              <span className="text-blue-400 text-xs font-semibold">用户:</span>
              <div className="text-white text-lg font-light leading-relaxed">
                {userTranscript}
                {isUserSpeaking && <span className="animate-pulse ml-1 text-blue-400">|</span>}
              </div>
            </div>
          )}
          
          {/* AI response */}
          {aiResponse && (
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-xs font-semibold">AI:</span>
              <div className="text-white text-lg font-light leading-relaxed">
                {aiResponse}
                {isAiSpeaking && <span className="animate-pulse ml-1 text-green-400">|</span>}
              </div>
            </div>
          )}
          
          {/* Default message when no transcript */}
          {!userTranscript && !aiResponse && (
            <div className="text-white text-base opacity-60">
              {realtime.status === 'CONNECTED' ? '✨ AI 助手已就绪，请随时说话...' : 
               realtime.status === 'CONNECTING' ? '🔄 正在连接 AI 助手，请稍候...' :
               '⏳ 正在初始化语音系统...'}
            </div>
          )}
        </div>

        {/* 状态指示 */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* 连接状态 */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
              realtime.status === 'CONNECTED' ? 'animate-pulse' : ''
            }`}></div>
            <span className="text-white text-xs opacity-50 whitespace-nowrap">
              {getStatusText()}
            </span>
          </div>
          
          {/* 快捷控制 - 仅在连接成功后显示 */}
          {realtime.status === 'CONNECTED' && (
            <div className="flex items-center space-x-2">
              <div className="w-px h-4 bg-gray-600"></div>
              
              {/* PTT 按钮 */}
              <button
                onMouseDown={() => handlePTT(true)}
                onMouseUp={() => handlePTT(false)}
                onMouseLeave={() => handlePTT(false)}
                className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
                title="按住说话"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* VAD 开关 */}
              <button
                onClick={toggleVAD}
                className={`p-2 rounded-lg transition-all ${
                  vadEnabled 
                    ? 'bg-green-500 bg-opacity-20 hover:bg-opacity-30' 
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                }`}
                title={vadEnabled ? '自动检测已开' : '自动检测已关'}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={vadEnabled 
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    }
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RealtimeVoice