// 全局错误处理工具
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorListeners: ((error: Error) => void)[] = []

  private constructor() {
    this.setupGlobalErrorHandling()
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  private setupGlobalErrorHandling() {
    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 未处理的Promise拒绝:', event.reason)
      
      const error = new Error(`未处理的异步操作失败: ${event.reason?.message || event.reason}`)
      this.notifyListeners(error)
      
      // 防止错误传播到控制台（可选）
      // event.preventDefault()
    })

    // 处理全局JavaScript错误
    window.addEventListener('error', (event) => {
      console.error('🚨 全局JavaScript错误:', event.error)
      
      const error = event.error || new Error(event.message)
      this.notifyListeners(error)
    })
  }

  // 添加错误监听器
  addErrorListener(listener: (error: Error) => void) {
    this.errorListeners.push(listener)
  }

  // 移除错误监听器
  removeErrorListener(listener: (error: Error) => void) {
    const index = this.errorListeners.indexOf(listener)
    if (index > -1) {
      this.errorListeners.splice(index, 1)
    }
  }

  // 通知所有监听器
  private notifyListeners(error: Error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('🔥 错误监听器本身发生错误:', listenerError)
      }
    })
  }

  // 手动报告错误
  reportError(error: Error, context?: string) {
    console.error(`🚨 手动报告错误${context ? ` (${context})` : ''}:`, error)
    this.notifyListeners(error)
  }
}

// 安全的异步函数包装器
export function safeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      const errorHandler = GlobalErrorHandler.getInstance()
      const contextError = new Error(
        `${errorContext || '异步操作'} 失败: ${error instanceof Error ? error.message : String(error)}`
      )
      errorHandler.reportError(contextError, errorContext)
      return null
    }
  }
}

// Promise安全包装器
export function safePromise<T>(
  promise: Promise<T>,
  errorContext?: string
): Promise<T | null> {
  return promise.catch(error => {
    const errorHandler = GlobalErrorHandler.getInstance()
    const contextError = new Error(
      `${errorContext || 'Promise'} 失败: ${error instanceof Error ? error.message : String(error)}`
    )
    errorHandler.reportError(contextError, errorContext)
    return null
  })
}