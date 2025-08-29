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