'use client'

import { useCallback, useRef, useState } from 'react'
import {
  RealtimeSession,
  RealtimeAgent,
  OpenAIRealtimeWebRTC,
} from '@openai/agents/realtime'

type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'

interface UseRealtimeOptions {
  agent: RealtimeAgent
  onTranscript?: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}

export function useRealtime(options: UseRealtimeOptions) {
  const sessionRef = useRef<RealtimeSession | null>(null)
  const transportRef = useRef<OpenAIRealtimeWebRTC | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED')
  const [lastTranscript, setLastTranscript] = useState('')

  const fetchEphemeralKey = useCallback(async () => {
    try {
      const response = await fetch('/api/realtime/session')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get session key')
      }
      
      const key = data?.client_secret?.value
      if (!key) {
        throw new Error('No ephemeral key in response')
      }
      
      return key
    } catch (error) {
      console.error('Failed to fetch ephemeral key:', error)
      throw error
    }
  }, [])

  const connect = useCallback(async (audioElement: HTMLAudioElement) => {
    if (sessionRef.current) {
      console.log('Already connected')
      return
    }

    try {
      setStatus('CONNECTING')
      
      const ephemeralKey = await fetchEphemeralKey()
      
      const transport = new OpenAIRealtimeWebRTC({
        audioElement,
      })
      transportRef.current = transport

      console.log('[Agent Config]:', {
        name: options.agent.name,
        voice: options.agent.voice,
        instructions: options.agent.instructions,
        toolsCount: options.agent.tools?.length || 0
      })

      const session = new RealtimeSession(options.agent, {
        transport,
        model: 'gpt-realtime',
        config: {
          inputAudioTranscription: { model: 'gpt-4o-mini-transcribe' },
        },
        context: {},
        outputGuardrails: [],
      })

      // Basic event handling
      session.on('error', (error) => {
        console.error('Session error:', error)
        options.onError?.(error)
      })

      // Log all events for debugging
      session.on('transport_event', (event: any) => {
        console.log('[Realtime Event Received]:', event.type, event)
        
        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          const transcript = event.transcript
          if (transcript) {
            setLastTranscript(transcript)
            options.onTranscript?.(transcript, true)
          }
        }
      })

      // Tool execution events
      session.on('agent_tool_start', (details: any, agent: any, functionCall: any) => {
        console.log('[Tool Start]:', functionCall.name, 'args:', functionCall.arguments, 'details:', details)
      })

      session.on('agent_tool_end', (details: any, agent: any, functionCall: any, result: any) => {
        console.log('[Tool End]:', functionCall.name, 'result:', result, 'details:', details)
      })

      // History events
      session.on('history_added', (item: any) => {
        console.log('[History Added]:', item)
      })

      session.on('history_updated', (item: any) => {
        console.log('[History Updated]:', item)
      })

      // Force correct Realtime endpoint (avoid default /v1/realtime/calls)
      console.log('[Connecting with model]:', 'gpt-realtime')
      await session.connect({ 
        apiKey: ephemeralKey,
        url: 'https://api.openai.com/v1/realtime?model=gpt-realtime',
      })
      
      sessionRef.current = session
      setStatus('CONNECTED')
      console.log('Connected successfully')

      // Manually update session with agent configuration to ensure instructions are applied
      const sessionUpdate = {
        type: 'session.update',
        session: {
          instructions: options.agent.instructions,
          voice: options.agent.voice,
          tools: options.agent.tools?.map((tool: any) => ({
            type: 'function',
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          })) || []
        }
      }
      
      console.log('[Sending Session Update]:', sessionUpdate)
      transport.sendEvent(sessionUpdate)
      
    } catch (error) {
      console.error('Connection failed:', error)
      setStatus('DISCONNECTED')
      options.onError?.(error as Error)
    }
  }, [options, fetchEphemeralKey])

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close()
      sessionRef.current = null
    }
    transportRef.current = null
    setStatus('DISCONNECTED')
    setLastTranscript('')
  }, [])

  const sendText = useCallback((text: string) => {
    if (!sessionRef.current || status !== 'CONNECTED') {
      console.warn('Not connected, cannot send text')
      return
    }

    try {
      console.log('[Sending Text Message]:', text)
      sessionRef.current.sendMessage(text)
    } catch (error) {
      console.error('Failed to send text:', error)
      options.onError?.(error as Error)
    }
  }, [status, options])

  const sendEvent = useCallback((ev: any) => {
    console.log('[Sending Event]:', ev.type, ev)
    sessionRef.current?.transport.sendEvent(ev)
  }, [])

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt()
  }, [])

  const pttStart = useCallback(() => {
    if (!sessionRef.current) return
    try {
      interrupt()
      sendEvent({ type: 'input_audio_buffer.clear' })
    } catch (error) {
      console.error('PTT start error:', error)
    }
  }, [interrupt, sendEvent])

  const pttStop = useCallback(() => {
    if (!sessionRef.current) return
    try {
      sendEvent({ type: 'input_audio_buffer.commit' })
      sendEvent({ type: 'response.create' })
    } catch (error) {
      console.error('PTT stop error:', error)
    }
  }, [sendEvent])

  const enableServerVAD = useCallback((enable: boolean) => {
    if (!sessionRef.current) return
    try {
      sendEvent({
        type: 'session.update',
        session: {
          turn_detection: enable
            ? {
                type: 'server_vad',
                threshold: 0.9,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
                create_response: true,
              }
            : null,
        },
      })
    } catch (error) {
      console.error('VAD toggle error:', error)
    }
  }, [sendEvent])

  return {
    status,
    lastTranscript,
    connect,
    disconnect,
    sendText,
    sendEvent,
    interrupt,
    pttStart,
    pttStop,
    enableServerVAD,
  }
}
