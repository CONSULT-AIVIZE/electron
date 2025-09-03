const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
});