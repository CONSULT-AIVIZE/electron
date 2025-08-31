const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
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
    // Development: Connect to Next.js dev server
    mainWindow.loadURL('http://localhost:3000');
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
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:3000 ws://localhost:3000 https://pre-aivize.tlboy.com https://pre-api.aivize.tlboy.com https://consultai-bb799.firebaseapp.com; media-src 'self' blob: data:; frame-src 'self' https://pre-aivize.tlboy.com https://consultai-bb799.firebaseapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; connect-src 'self' https://pre-api.aivize.tlboy.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;"
            : "default-src 'self' 'unsafe-inline' data: blob: https://pre-aivize.tlboy.com https://pre-api.aivize.tlboy.com https://consultai-bb799.firebaseapp.com; media-src 'self' blob: data:; script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; frame-src 'self' https://pre-aivize.tlboy.com https://consultai-bb799.firebaseapp.com; connect-src 'self' https://pre-api.aivize.tlboy.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;"
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
    
    if (isDev && parsedUrl.origin === 'http://localhost:3000') {
      // Allow navigation within Next.js dev server
      return;
    }
    
    if (!isDev && parsedUrl.protocol === 'file:') {
      // Allow navigation within static files
      return;
    }
    
    if (parsedUrl.origin === 'https://pre-aivize.tlboy.com') {
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