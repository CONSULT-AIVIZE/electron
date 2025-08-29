// TypeScript declarations for Electron API
declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<{
        platform: string;
        version: string;
        isFullscreen: boolean;
      }>;
      toggleFullscreen: () => Promise<boolean>;
      minimizeApp: () => Promise<boolean>;
      sendVoiceCommand: (command: string) => Promise<boolean>;
      onVoiceCommand: (callback: (command: string) => void) => void;
      removeVoiceCommandListener: () => void;
    };
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export {}