const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Window controls
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  
  // Voice control
  sendVoiceCommand: (command) => ipcRenderer.invoke('voice-command', command),
  
  // Listen for voice commands from main process
  onVoiceCommand: (callback) => {
    ipcRenderer.on('voice-command', (event, command) => callback(command));
  },
  
  // Remove voice command listener
  removeVoiceCommandListener: () => {
    ipcRenderer.removeAllListeners('voice-command');
  }
});

// This will be available on window.electronAPI in the renderer process

// Triangle OS Bridge - 为外部应用(如CONSULT_AI)提供的集成接口
contextBridge.exposeInMainWorld('triangleOSBridge', {
  // 应用信息
  version: '1.0.0',
  name: 'TriangleOS',
  
  // 语音控制
  voice: {
    // 发送语音指令到OS
    sendCommand: (command) => ipcRenderer.invoke('voice-command', command),
    
    // 监听OS发出的语音指令
    onCommand: (callback) => {
      ipcRenderer.on('voice-command', (event, command) => callback(command));
    },
    
    // 移除语音指令监听器
    removeCommandListener: () => {
      ipcRenderer.removeAllListeners('voice-command');
    },
    
    // 请求启用语音识别(如果OS支持)
    enableRecognition: () => ipcRenderer.invoke('enable-voice-recognition'),
    
    // 请求禁用语音识别
    disableRecognition: () => ipcRenderer.invoke('disable-voice-recognition')
  },
  
  // 窗口控制
  window: {
    // 最小化应用窗口
    minimize: () => ipcRenderer.invoke('minimize-app'),
    
    // 切换全屏
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
    
    // 获取窗口状态
    getInfo: () => ipcRenderer.invoke('get-system-info')
  },
  
  // 导航控制
  navigation: {
    // 导航到OS的特定页面
    navigateTo: (path) => ipcRenderer.invoke('os-navigate', path),
    
    // 打开OS应用
    openApp: (appId) => ipcRenderer.invoke('os-open-app', appId),
    
    // 返回OS桌面
    goHome: () => ipcRenderer.invoke('os-go-home')
  },
  
  // 通信接口
  communication: {
    // 向OS发送消息
    sendMessage: (type, data) => ipcRenderer.invoke('os-message', { type, data }),
    
    // 监听OS消息
    onMessage: (callback) => {
      ipcRenderer.on('os-message', (event, message) => callback(message));
    },
    
    // 移除消息监听器
    removeMessageListener: () => {
      ipcRenderer.removeAllListeners('os-message');
    }
  },
  
  // 状态查询
  status: {
    // 检查是否在Triangle OS环境中运行
    isInTriangleOS: () => true,
    
    // 获取OS版本信息
    getOSVersion: () => ipcRenderer.invoke('get-os-version'),
    
    // 检查特定功能是否可用
    checkFeature: (featureName) => ipcRenderer.invoke('check-feature', featureName)
  },
  
  // 主题和样式
  theme: {
    // 获取当前主题
    getCurrentTheme: () => ipcRenderer.invoke('get-current-theme'),
    
    // 监听主题变化
    onThemeChange: (callback) => {
      ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
    },
    
    // 移除主题变化监听器
    removeThemeListener: () => {
      ipcRenderer.removeAllListeners('theme-changed');
    }
  }
});