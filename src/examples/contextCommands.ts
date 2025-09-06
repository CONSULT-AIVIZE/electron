/**
 * Context驱动的语音指令示例
 * 演示如何使用NavigationContext进行参数化页面跳转
 */

import { RuntimeCommand } from '../core/runtime/RuntimeService'
import { getSharedRuntimeService } from '../core/runtime/sharedRuntime'

/**
 * 注册Context驱动的语音指令
 */
export const registerContextCommands = () => {
  const runtime = getSharedRuntimeService()

  // 示例Context驱动的指令
  const contextCommands: RuntimeCommand[] = [
    {
      id: 'open_current_project',
      triggers: ['打开当前项目', '查看项目详情', '项目概览'],
      description: '打开当前选中的项目详情页',
      action: {
        type: 'navigate',
        target: 'project-detail' // 使用appRegistry中的配置ID
      },
      scope: 'global'
    },
    
    {
      id: 'start_project_chat',
      triggers: ['开始项目咨询', '创建咨询会话', '新建项目对话'],
      description: '为当前项目创建新的咨询会话',
      action: {
        type: 'navigate',
        target: 'project-chat' // 使用appRegistry中的配置ID
      },
      scope: 'global'
    },

    {
      id: 'go_to_project_by_name',
      triggers: ['打开项目', '切换到项目', '查看项目'],
      description: '根据项目名称跳转到项目页面',
      action: {
        type: 'navigate',
        target: '/project/{projectId}?tab=overview'
      },
      scope: 'global'
    },

    {
      id: 'open_chat_session',
      triggers: ['打开聊天', '继续对话', '查看聊天记录'],
      description: '打开特定的聊天会话',
      action: {
        type: 'navigate',
        target: '/project/{projectId}/chat/{chatId}'
      },
      scope: 'global'
    }
  ]

  // 注册指令
  console.log('📋 注册Context驱动的语音指令...')
  contextCommands.forEach(command => {
    runtime.registerCommand?.(command)
  })

  return contextCommands
}

/**
 * 示例：设置项目Context
 */
export const setProjectContext = (projectId: string, projectName: string, projectType?: string) => {
  const runtime = getSharedRuntimeService()
  
  runtime.updateNavigationContext({
    projectId,
    projectName,
    projectType: projectType || 'consultation',
    currentPage: `/project/${projectId}`,
    // 可以添加更多相关信息
    timestamp: Date.now()
  })
  
  console.log('✅ 项目Context已设置:', { projectId, projectName, projectType })
}

/**
 * 示例：设置聊天Context
 */
export const setChatContext = (chatId: string, projectId?: string, sessionType?: string) => {
  const runtime = getSharedRuntimeService()
  
  runtime.updateNavigationContext({
    chatId,
    sessionId: chatId, // 别名支持
    sessionType: sessionType || 'guided',
    ...(projectId && { projectId }) // 只有提供projectId时才设置
  })
  
  console.log('✅ 聊天Context已设置:', { chatId, projectId, sessionType })
}

/**
 * 示例：从URL或其他来源自动设置Context
 */
export const autoSetContextFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url, 'http://localhost')
    const pathname = urlObj.pathname
    
    // 解析项目ID
    const projectMatch = pathname.match(/\/project\/([^\/]+)/)
    if (projectMatch) {
      const projectId = projectMatch[1]
      
      // 解析聊天ID
      const chatMatch = pathname.match(/\/chat\/([^\/]+)/)
      if (chatMatch) {
        const chatId = chatMatch[1]
        setChatContext(chatId, projectId)
      } else {
        setProjectContext(projectId, `项目-${projectId}`)
      }
    }
    
    // 可以添加更多URL模式的解析
    
  } catch (error) {
    console.warn('⚠️ URL Context解析失败:', error)
  }
}

/**
 * 示例：清除特定类型的Context
 */
export const clearProjectContext = () => {
  const runtime = getSharedRuntimeService()
  
  runtime.getNavigationContext()
  // 通过navigationContext直接操作
  const { navigationContext } = require('../core/context/NavigationContext')
  
  navigationContext.remove('projectId')
  navigationContext.remove('projectName')
  navigationContext.remove('projectType')
  navigationContext.remove('chatId')
  navigationContext.remove('sessionId')
  
  console.log('🧹 项目和聊天Context已清除')
}