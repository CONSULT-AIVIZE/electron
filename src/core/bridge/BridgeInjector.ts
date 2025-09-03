/**
 * Triangle OS Universal Bridge Injector
 * 通用Bridge代码注入器 - 完全与具体业务解耦
 * 遵循Triangle OS Application Integration Protocol v1.0
 */

export const getBridgeCode = async (): Promise<string> => {
  // Triangle OS Universal Bridge Code
  // 此代码完全通用，支持任何遵循协议的应用
  return `
/**
 * Triangle OS Bridge - Universal Web Application Integration
 * 为任意网站应用提供与Triangle OS的通信桥梁
 * 此脚本由OS动态注入到iframe中，无需网站本身包含
 */

class TriangleOSBridge {
  constructor() {
    this.isOSMode = this.detectOSMode()
    this.commands = new Map()
    this.currentPage = this.getCurrentPage()
    
    console.log('🌉 Triangle OS Bridge 已加载')
    console.log('🔍 OS模式:', this.isOSMode ? '是' : '否')
    console.log('📍 当前页面:', this.currentPage)
    
    // 监听来自OS的消息
    if (this.isOSMode) {
      this.setupOSMessageListener()
    }
  }

  // 检测是否在OS环境中运行
  detectOSMode() {
    try {
      // 检查是否在iframe中
      const inIframe = window.self !== window.top
      
      // 检查URL参数
      const urlParams = new URLSearchParams(window.location.search)
      const osMode = urlParams.get('os_mode') === 'true'
      
      // 检查parent window是否存在Triangle OS标识
      let hasOSParent = false
      try {
        hasOSParent = window.parent && window.parent.triangleOS
      } catch (e) {
        // 跨域限制，但这通常意味着在iframe中
        hasOSParent = inIframe
      }
      
      return inIframe || osMode || hasOSParent
    } catch (error) {
      console.error('检测OS模式失败:', error)
      return false
    }
  }

  // 获取当前页面ID
  getCurrentPage() {
    const path = window.location.pathname
    if (path === '/') return 'home'
    
    const segments = path.substring(1).split('/')
    return segments[0] || 'home'
  }

  // 设置OS消息监听器
  setupOSMessageListener() {
    window.addEventListener('message', (event) => {
      // 只处理来自父窗口的消息
      if (event.source !== window.parent) return
      
      const { type, ...data } = event.data
      
      switch (type) {
        case 'os_navigate':
          this.handleNavigation(data.url)
          break
          
        case 'os_dom_action':
          this.handleDOMAction(data)
          break
          
        case 'os_ai_style':
          this.handleAIStyle(data)
          break
          
        case 'os_ping':
          // 响应OS的ping消息
          this.sendMessageToOS('os_pong', { 
            page: this.currentPage,
            ready: true 
          })
          break
          
        case 'os_check_auth_status':
          // 响应OS的认证状态检查
          this.handleAuthStatusCheck(data.requestId)
          break
          
        default:
          console.log('🔄 收到未知OS消息:', type, data)
      }
    })

    // 向OS发送准备就绪消息
    this.sendMessageToOS('page_ready', {
      page: this.currentPage,
      url: window.location.href
    })
  }

  // 向OS发送消息
  sendMessageToOS(type, data = {}) {
    if (!this.isOSMode) return false
    
    try {
      window.parent.postMessage({
        type,
        source: 'triangleos_bridge',
        page: this.currentPage,
        timestamp: Date.now(),
        ...data
      }, '*')
      return true
    } catch (error) {
      console.error('发送消息到OS失败:', error)
      return false
    }
  }

  // 处理导航
  handleNavigation(url) {
    console.log('🧭 OS导航请求:', url)
    
    // 如果是相对路径，直接导航
    if (!url.startsWith('http')) {
      if (url.startsWith('/')) {
        window.location.pathname = url
      } else {
        window.location.hash = '#/' + url
      }
    }
    
    // 更新当前页面
    this.currentPage = this.getCurrentPage()
    
    // 通知OS导航完成
    this.sendMessageToOS('navigation_complete', {
      url: window.location.href,
      page: this.currentPage
    })
  }

  // 处理DOM操作
  handleDOMAction(data) {
    const { selector, method, value } = data
    
    try {
      const element = document.querySelector(selector)
      if (!element) {
        console.warn('⚠️ DOM元素未找到:', selector)
        return
      }

      switch (method) {
        case 'click':
          element.click()
          break
          
        case 'focus':
          element.focus()
          break
          
        case 'setValue':
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value || ''
            // 触发input事件以确保React等框架能够响应
            element.dispatchEvent(new Event('input', { bubbles: true }))
          }
          break
          
        case 'getText':
          const text = element.textContent || element.innerText || ''
          this.sendMessageToOS('dom_action_result', {
            selector,
            method,
            result: text
          })
          break
          
        default:
          console.warn('⚠️ 未知的DOM操作方法:', method)
      }
      
      console.log('✅ DOM操作完成:', method, selector)
    } catch (error) {
      console.error('❌ DOM操作失败:', error)
      this.sendMessageToOS('dom_action_error', {
        selector,
        method,
        error: error.message
      })
    }
  }

  // 处理AI样式修改
  handleAIStyle(data) {
    const { intent, scope, target, css } = data
    
    console.log('🎨 AI样式修改请求:', intent)
    
    if (css) {
      try {
        // 创建或更新样式标签
        let styleEl = document.getElementById('triangle-os-ai-style')
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'triangle-os-ai-style'
          document.head.appendChild(styleEl)
        }
        
        styleEl.textContent = css
        
        this.sendMessageToOS('ai_style_applied', {
          success: true,
          intent
        })
        
        console.log('✅ AI样式已应用')
      } catch (error) {
        console.error('❌ AI样式应用失败:', error)
        this.sendMessageToOS('ai_style_error', {
          error: error.message,
          intent
        })
      }
    }
  }

  // 注册页面特定指令
  registerPageCommand(command) {
    this.commands.set(command.id, command)
    
    // 通知OS新指令已注册
    this.sendMessageToOS('command_registered', {
      command,
      page: this.currentPage
    })
    
    console.log('📝 页面指令已注册:', command.id)
  }

  // 批量注册指令
  registerCommands(commands) {
    commands.forEach(cmd => this.registerPageCommand(cmd))
  }

  // 执行指令
  executeCommand(commandId, params = {}) {
    const command = this.commands.get(commandId)
    if (!command) {
      console.warn('⚠️ 指令未找到:', commandId)
      return false
    }

    try {
      if (typeof command.handler === 'function') {
        command.handler(params)
      }
      
      this.sendMessageToOS('command_executed', {
        commandId,
        params,
        success: true
      })
      
      return true
    } catch (error) {
      console.error('❌ 指令执行失败:', error)
      this.sendMessageToOS('command_error', {
        commandId,
        params,
        error: error.message
      })
      return false
    }
  }

  // 处理OS认证状态检查请求
  async handleAuthStatusCheck(requestId) {
    console.log('🔍 处理OS认证状态检查请求:', requestId)
    
    try {
      let authStatus = { authenticated: false }
      
      // 通用认证状态检查 - 根据不同provider自动适配
      if (typeof window.firebase !== 'undefined' && window.firebase.auth) {
        // Firebase认证
        const currentUser = window.firebase.auth().currentUser
        if (currentUser) {
          const idToken = await currentUser.getIdToken(true)
          authStatus = {
            authenticated: true,
            user: {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL
            },
            expires: Date.now() + 60 * 60 * 1000
          }
        }
      } else if (typeof window.auth !== 'undefined') {
        // 自定义认证系统
        const currentUser = window.auth.getCurrentUser()
        if (currentUser) {
          authStatus = {
            authenticated: true,
            user: currentUser,
            expires: currentUser.expires || Date.now() + 60 * 60 * 1000
          }
        }
      } else {
        // 尝试从cookie或localStorage获取认证信息
        const sessionKeys = ['auth_token', 'user_session', 'triangleos_session']
        for (const key of sessionKeys) {
          const stored = localStorage.getItem(key)
          if (stored) {
            try {
              const session = JSON.parse(stored)
              if (session.authenticated && (!session.expires || Date.now() < session.expires)) {
                authStatus = session
                break
              }
            } catch (e) {
              // 忽略解析错误，继续尝试下一个key
            }
          }
        }
      }
      
      // 发送认证状态响应
      this.sendMessageToOS('auth_status_response', {
        requestId,
        authStatus
      })
      
      console.log('✅ 认证状态检查完成:', authStatus.authenticated)
    } catch (error) {
      console.error('❌ 认证状态检查失败:', error)
      
      // 发送失败响应
      this.sendMessageToOS('auth_status_response', {
        requestId,
        authStatus: { authenticated: false, error: error.message }
      })
    }
  }

  // 获取页面信息
  getPageInfo() {
    return {
      page: this.currentPage,
      url: window.location.href,
      title: document.title,
      isOSMode: this.isOSMode,
      commands: Array.from(this.commands.keys())
    }
  }
}

// 全局初始化
window.triangleOSBridge = new TriangleOSBridge()

// 为网站应用提供通用的OS集成API
window.TriangleOS = {
  // 注册指令
  registerCommand: (command) => window.triangleOSBridge.registerPageCommand(command),
  
  // 发送消息到OS
  sendToOS: (type, data) => window.triangleOSBridge.sendMessageToOS(type, data),
  
  // 获取OS状态
  isOSMode: () => window.triangleOSBridge.isOSMode,
  
  // 获取页面信息
  getPageInfo: () => window.triangleOSBridge.getPageInfo(),
  
  // 通知页面变化
  onPageChange: (page) => {
    window.triangleOSBridge.currentPage = page
    window.triangleOSBridge.sendMessageToOS('page_changed', { page })
  },
  
  // 通用身份验证API - 自动适配不同的认证提供者
  auth: {
    // 检查认证状态 - 自动检测并适配不同provider
    checkStatus: async () => {
      try {
        if (typeof window.firebase !== 'undefined' && window.firebase.auth) {
          // Firebase认证
          const currentUser = window.firebase.auth().currentUser
          if (currentUser) {
            const idToken = await currentUser.getIdToken()
            return {
              authenticated: true,
              user: {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL
              },
              provider: 'firebase'
            }
          }
        } else if (typeof window.auth !== 'undefined') {
          // 自定义认证系统
          const status = await window.auth.checkStatus()
          return status
        } else {
          // 通过API检查
          const response = await fetch('/api/auth/status')
          return response.ok ? await response.json() : { authenticated: false }
        }
        
        return { authenticated: false }
      } catch (error) {
        console.error('认证状态检查失败:', error)
        return { authenticated: false }
      }
    },
    
    // 监听认证状态变化 - 通用接口
    onAuthStateChanged: (callback) => {
      if (typeof window.firebase !== 'undefined' && window.firebase.auth) {
        // Firebase认证状态监听
        return window.firebase.auth().onAuthStateChanged((user) => {
          const authData = user ? {
            authenticated: true,
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }
          } : { authenticated: false }
          
          // 通知OS
          window.triangleOSBridge.sendMessageToOS(
            user ? 'auth_success' : 'auth_logout',
            user ? { user: authData.user, redirectTo: '/' } : { redirectTo: '/login' }
          )
          
          callback(authData)
        })
      } else if (typeof window.auth !== 'undefined' && window.auth.onStateChanged) {
        // 自定义认证系统
        return window.auth.onStateChanged(callback)
      }
      return () => {} // 返回空的取消订阅函数
    },
    
    // 执行登出 - 通用接口
    logout: async () => {
      try {
        if (typeof window.firebase !== 'undefined' && window.firebase.auth) {
          // Firebase登出
          await window.firebase.auth().signOut()
        } else if (typeof window.auth !== 'undefined') {
          // 自定义认证系统登出
          await window.auth.logout()
        } else {
          // 通过API登出
          await fetch('/api/auth/logout', { method: 'POST' })
        }
        
        // 通知OS登出
        window.triangleOSBridge.sendMessageToOS('auth_logout', {
          redirectTo: '/login'
        })
        
        return true
      } catch (error) {
        console.error('登出失败:', error)
        return false
      }
    },
    
    // 获取会话信息
    getSession: () => {
      const sessionKey = 'triangleos_session'
      try {
        const stored = localStorage.getItem(sessionKey)
        return stored ? JSON.parse(stored) : null
      } catch (error) {
        return null
      }
    },
    
    // 清除会话
    clearSession: () => {
      const sessionKey = 'triangleos_session'
      localStorage.removeItem(sessionKey)
    }
  }
}

console.log('✅ Triangle OS Bridge API 已就绪')

// 为了向后兼容，也提供原来的ConsultAI API
window.ConsultAI = window.TriangleOS
  `
}

export const injectBridgeToIframe = (iframe: HTMLIFrameElement): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      // 检查是否是登录页面或外部域
      const iframeSrc = iframe.src
      if (iframeSrc.includes('/login') || iframeSrc.includes('firebaseapp.com') || iframeSrc.includes('google.com')) {
        console.log('⏭️ 跳过登录页面或外部域的Bridge注入:', iframeSrc)
        resolve(true) // 返回true表示这是预期行为
        return
      }
      
      // 等待iframe加载完成
      if (iframe.contentDocument?.readyState !== 'complete') {
        await new Promise<void>((resolveLoad, rejectLoad) => {
          iframe.onload = () => resolveLoad()
          iframe.onerror = () => rejectLoad(new Error('Iframe load failed'))
          setTimeout(() => rejectLoad(new Error('Iframe load timeout')), 10000)
        })
      }

      const iframeDoc = iframe.contentDocument
      if (!iframeDoc) {
        console.error('无法访问iframe文档（可能是跨域限制）')
        resolve(false)
        return
      }

      // 获取bridge代码并注入
      const bridgeCode = await getBridgeCode()
      
      // 创建script标签
      const script = iframeDoc.createElement('script')
      script.type = 'text/javascript'
      script.textContent = bridgeCode
      
      // 添加OS标识到父窗口
      ;(window as any).triangleOS = true
      
      // 注入到iframe的head中
      const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0]
      if (head) {
        head.appendChild(script)
        console.log('✅ Triangle OS Bridge 注入成功')
        resolve(true)
      } else {
        console.error('无法找到iframe head元素')
        resolve(false)
      }

    } catch (error) {
      console.error('❌ Bridge 注入失败:', error)
      resolve(false)
    }
  })
}