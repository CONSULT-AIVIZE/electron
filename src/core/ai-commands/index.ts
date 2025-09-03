export { CommandService } from './CommandService'
export type { 
  AICommand, 
  AIAction, 
  AIConfig, 
  PageConfig 
} from './CommandService'

// 延迟创建CommandService实例，确保只在客户端运行
let _commandService: CommandService | null = null

export const getCommandService = (): CommandService => {
  if (typeof window === 'undefined') {
    // 服务端返回一个mock对象
    return {} as CommandService
  }
  
  if (!_commandService) {
    _commandService = new CommandService()
  }
  return _commandService
}

export const commandService = getCommandService()