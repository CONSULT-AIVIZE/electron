import { RealtimeAgent, tool } from '@openai/agents/realtime'
import { runtimeService } from '~/core/runtime/RuntimeService'

// 动态获取当前可用指令的工具
const getCurrentCommands = tool({
  name: 'getCurrentCommands',
  description: 'Get all currently available voice commands for the system.',
  parameters: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  execute: async () => {
    console.log('[Commands Tool] Fetching current commands');
    
    const commands = runtimeService.getCurrentCommands();
    
    return {
      commands: commands.map(cmd => ({
        id: cmd.id,
        description: cmd.description,
        triggers: cmd.triggers,
        scope: cmd.scope
      })),
      total: commands.length,
      timestamp: new Date().toISOString()
    };
  },
});

// 执行指令的工具
const executeCommand = tool({
  name: 'executeCommand',
  description: 'Execute a voice command by its ID or matching trigger phrase.',
  parameters: {
    type: 'object',
    properties: {
      input: { type: 'string', description: 'The user input or command phrase to execute' },
    },
    required: ['input'],
    additionalProperties: false,
  },
  execute: async (args: any) => {
    const { input } = args as { input: string };
    console.log('[Execute Tool] Executing command for input:', input);
    
    try {
      const result = await runtimeService.executeCommand(input);
      return {
        success: true,
        result: result,
        input: input,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Execute Tool] Command execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        input: input,
        timestamp: new Date().toISOString()
      };
    }
  },
});

export const systemTools = [getCurrentCommands, executeCommand]

export const createDefaultAgent = (customTools = []) => {
  return new RealtimeAgent({
    name: 'triangle_os_assistant',
    voice: 'sage',
    instructions: `你是Triangle OS的语音助手。你的主要任务是：

1. **指令执行**: 当用户说出可以匹配系统指令的话时，使用executeCommand工具执行对应的命令
2. **指令查询**: 如果用户询问可以做什么，使用getCurrentCommands工具获取当前可用的指令
3. **智能匹配**: 理解用户的自然语言，将其与系统指令进行匹配

重要规则：
- 优先执行系统指令，而不是普通聊天
- 用中文自然回应用户
- 当用户说"帮我调研一下XXX"时，这很可能是想执行"创建咨询"指令
- 当用户问"我可以做什么"时，调用getCurrentCommands获取指令列表
- 保持回应简洁友好
- 每次对话开始时，可以先获取当前可用指令来了解系统状态

例子：
- 用户："帮我调研一下Manus的技术方案" → 执行"创建咨询"指令
- 用户："我想看设置" → 执行"打开设置"指令  
- 用户："我可以做什么？" → 调用getCurrentCommands获取指令列表`,
    tools: [...systemTools, ...customTools],
    handoffs: [],
  })
}