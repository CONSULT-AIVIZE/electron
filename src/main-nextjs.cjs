const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object
let mainWindow;

async function createWindow() {
  // Create the browser window with fullscreen configuration
  mainWindow = new BrowserWindow({
    fullscreen: true,
    width: 1920,
    height: 1080,
    show: false,
    frame: false, // Remove window frame for OS-like experience
    webPreferences: {
      nodeIntegration: false, // Disable node integration for security
      contextIsolation: true, // Enable context isolation
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'), // Secure IPC communication
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  // Hide the menu bar for immersive OS experience
  Menu.setApplicationMenu(null);

  // Load the Next.js app
  if (isDev) {
    // Development: Use wait-on to ensure dev server is ready, then connect
    // Since npm run dev uses wait-on, we know the server will be available
    // We just need to find which port it's actually running on
    
    let serverUrl = null;
    // 固定使用3002端口作为Electron dev server
    const electronDevPort = 3002;
    
    try {
      const response = await fetch(`http://localhost:${electronDevPort}/`);
      if (response.ok) {
        serverUrl = `http://localhost:${electronDevPort}`;
        console.log(`✅ Found Electron dev server on port ${electronDevPort}`);
      } else {
        throw new Error(`Server not ready on port ${electronDevPort}`);
      }
    } catch (error) {
      console.error(`❌ Electron dev server port ${electronDevPort} not available: ${error.message}`);
      console.log('Make sure to run: npm run dev (Electron should start on port 3002)');
    }
    
    if (serverUrl) {
      mainWindow.loadURL(serverUrl);
      console.log(`🚀 Loading Electron app from: ${serverUrl}`);
    } else {
      console.error('❌ Could not find Next.js dev server on any port');
      mainWindow.loadURL('data:text/html,<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#000;color:#fff;"><h1>等待 Next.js 开发服务器启动...</h1></div>');
    }
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from static files
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    // Open DevTools for debugging Google login issues
    mainWindow.webContents.openDevTools();
  }

  // Set Content Security Policy - Allow external iframe for traditional mode
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev 
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:3000 ws://localhost:3000 http://localhost:* ws://localhost:* https://*.google.com https://*.googleapis.com https://*.googleusercontent.com https://gstatic.com https://*.gstatic.com https://*.firebaseapp.com https://*.firebase.com; media-src 'self' blob: data:; frame-src 'self' http://localhost:3000 http://localhost:* https://accounts.google.com https://*.google.com https://*.firebaseapp.com https://*.firebase.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://*.googleapis.com https://www.gstatic.com https://*.firebaseapp.com; connect-src 'self' http://localhost:3000 ws://localhost:3000 http://localhost:* https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://accounts.google.com https://*.firebaseapp.com https://*.firebase.com https://api.openai.com wss://api.openai.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;"
            : "default-src 'self' 'unsafe-inline' data: blob: http://localhost:3000 http://localhost:* https://*.google.com https://*.googleapis.com https://*.googleusercontent.com https://gstatic.com https://*.gstatic.com https://*.firebaseapp.com https://*.firebase.com; media-src 'self' blob: data:; script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://*.googleapis.com https://www.gstatic.com https://*.firebaseapp.com; frame-src 'self' http://localhost:3000 http://localhost:* https://accounts.google.com https://*.google.com https://*.firebaseapp.com https://*.firebase.com; connect-src 'self' http://localhost:3000 http://localhost:* https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://accounts.google.com https://*.firebaseapp.com https://*.firebase.com https://api.openai.com wss://api.openai.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;"
        ]
      }
    });
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Allow controlled external navigation for traditional mode
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (isDev && parsedUrl.hostname === 'localhost' && parsedUrl.port >= '3000' && parsedUrl.port <= '3005') {
      // Allow navigation within Next.js dev server
      return;
    }
    
    if (!isDev && parsedUrl.protocol === 'file:') {
      // Allow navigation within static files
      return;
    }
    
    if (parsedUrl.origin === 'https://pre-aivize.tlboy.com' || (parsedUrl.hostname === 'localhost' && parsedUrl.port >= '3000' && parsedUrl.port <= '3005')) {
      // Allow navigation to the specific external site for traditional mode
      return;
    }
    
    // Handle Google authentication URLs - open in system browser
    if (parsedUrl.hostname.includes('google.com') || 
        parsedUrl.hostname.includes('accounts.google.com') ||
        parsedUrl.hostname.includes('oauth.google.com') ||
        parsedUrl.hostname.includes('googleapis.com')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
      return;
    }
    
    // Block all other navigation
    event.preventDefault();
  });

  // Handle external links - Allow certain external URLs to open in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url);
    
    // Allow Firebase authentication popups to open in new Electron window
    if (parsedUrl.hostname.includes('firebaseapp.com') ||
        parsedUrl.hostname.includes('firebase.com')) {
      return { 
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 600,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
          }
        }
      };
    }
    
    // Allow Google authentication and other necessary external links
    if (parsedUrl.hostname.includes('google.com') || 
        parsedUrl.hostname.includes('accounts.google.com') ||
        parsedUrl.hostname.includes('oauth.google.com') ||
        parsedUrl.hostname.includes('googleapis.com')) {
      // Open in system browser
      shell.openExternal(url);
      return { action: 'deny' }; // Don't open in Electron
    }
    
    // Prevent all other external links
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for voice control and system interaction
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    isFullscreen: mainWindow?.isFullScreen() || false
  };
});

ipcMain.handle('toggle-fullscreen', async () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    return mainWindow.isFullScreen();
  }
  return false;
});

ipcMain.handle('minimize-app', async () => {
  if (mainWindow) {
    mainWindow.minimize();
    return true;
  }
  return false;
});

// Voice command handlers
ipcMain.handle('voice-command', async (event, command) => {
  console.log('Voice command received:', command);
  
  // Handle system-level voice commands
  switch (command.toLowerCase()) {
    case 'minimize':
    case 'minimize app':
      return await ipcMain.emit('minimize-app');
    case 'fullscreen':
    case 'toggle fullscreen':
      return await ipcMain.emit('toggle-fullscreen');
    default:
      // Forward to renderer process for app-specific commands
      mainWindow.webContents.send('voice-command', command);
      return true;
  }
});

// Triangle OS Bridge IPC Handlers - 为CONSULT_AI等外部应用提供的集成接口

// 语音控制相关
ipcMain.handle('enable-voice-recognition', async () => {
  console.log('Bridge: Enable voice recognition requested');
  // 可以在这里向主应用发送启用语音识别的消息
  if (mainWindow) {
    mainWindow.webContents.send('bridge-enable-voice');
  }
  return true;
});

ipcMain.handle('disable-voice-recognition', async () => {
  console.log('Bridge: Disable voice recognition requested');
  // 可以在这里向主应用发送禁用语音识别的消息
  if (mainWindow) {
    mainWindow.webContents.send('bridge-disable-voice');
  }
  return true;
});

// 导航控制相关
ipcMain.handle('os-navigate', async (event, path) => {
  console.log('Bridge: Navigate to path:', path);
  if (mainWindow) {
    // 向主应用发送导航请求
    mainWindow.webContents.send('bridge-navigate', path);
  }
  return true;
});

ipcMain.handle('os-open-app', async (event, appId) => {
  console.log('Bridge: Open app:', appId);
  if (mainWindow) {
    mainWindow.webContents.send('bridge-open-app', appId);
  }
  return true;
});

ipcMain.handle('os-go-home', async () => {
  console.log('Bridge: Go home requested');
  if (mainWindow) {
    mainWindow.webContents.send('bridge-go-home');
  }
  return true;
});

// 通信接口
ipcMain.handle('os-message', async (event, message) => {
  console.log('Bridge: Message received:', message);
  if (mainWindow) {
    // 转发消息到主应用
    mainWindow.webContents.send('bridge-message', message);
  }
  return true;
});

// 状态查询
ipcMain.handle('get-os-version', async () => {
  return {
    name: 'TriangleOS',
    version: '1.0.0',
    electron: process.versions.electron,
    node: process.versions.node
  };
});

ipcMain.handle('check-feature', async (event, featureName) => {
  console.log('Bridge: Check feature:', featureName);
  
  const supportedFeatures = {
    'voice-control': true,
    'window-control': true,
    'navigation': true,
    'messaging': true,
    'theme-control': true
  };
  
  return supportedFeatures[featureName] || false;
});

// 主题控制
ipcMain.handle('get-current-theme', async () => {
  return {
    mode: 'dark',
    primary: '#3B82F6',
    accent: '#8B5CF6'
  };
});