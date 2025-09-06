'use client'

import React, { useState, useEffect } from 'react'
import { getSharedRuntimeService } from '../core/runtime/sharedRuntime'
import type { RuntimeCommand } from '../core/runtime/RuntimeService'

interface CommandPanelProps {
  className?: string
  onCommandExecute?: (command: RuntimeCommand) => void
}

const CommandPanel: React.FC<CommandPanelProps> = ({ className = '', onCommandExecute }) => {
  const [commands, setCommands] = useState<RuntimeCommand[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const runtimeService = getSharedRuntimeService()

  // 监听指令变化
  useEffect(() => {
    const handleCommandsUpdate = (newCommands: RuntimeCommand[]) => {
      console.log('📋 [CommandPanel] Received command update:', newCommands.length, 'commands')
      console.log('📋 [CommandPanel] Commands:', newCommands.map(c => c.id))
      setCommands(newCommands)
    }

    runtimeService.addListener(handleCommandsUpdate)
    
    // 获取当前指令
    const currentCommands = runtimeService.getCurrentCommands()
    console.log('📋 [CommandPanel] Initial commands:', currentCommands.length, 'commands')
    console.log('📋 [CommandPanel] Initial commands:', currentCommands.map(c => c.id))
    setCommands(currentCommands)

    return () => {
      runtimeService.removeListener(handleCommandsUpdate)
    }
  }, [runtimeService])

  const executeCommand = async (command: RuntimeCommand) => {
    console.log('🎯 [CommandPanel] Executing command:', command.id)
    const success = await runtimeService.executeCommand(command)
    if (success) {
      console.log('✅ [CommandPanel] Command executed successfully')
      onCommandExecute?.(command)
    } else {
      console.error('❌ [CommandPanel] Command execution failed')
    }
  }

  const getCommandIcon = (command: RuntimeCommand) => {
    return command.icon || '🎯'
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`bg-black bg-opacity-80 backdrop-blur-sm border-l border-gray-700 flex flex-col ${className}`}>
      {/* 面板标题 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-medium">语音指令</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="隐藏面板"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-1">点击执行或直接语音操作</p>
      </div>

      {/* 指令列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {commands.length > 0 ? (
          <div className="space-y-2">
            {commands.map((command, index) => (
              <button
                key={`${command.id}-${index}`}
                onClick={() => executeCommand(command)}
                className="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {getCommandIcon(command)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm mb-1 truncate">
                      {command.description || command.id}
                    </div>
                    <div className="text-gray-400 text-xs">
                      触发词: {command.triggers?.slice(0, 2).join(', ')}
                      {command.triggers?.length > 2 && '...'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-sm">等待指令加载...</div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-center text-gray-500 text-xs">
          共 {commands.length} 个可用指令
        </div>
      </div>
    </div>
  )
}

export default CommandPanel