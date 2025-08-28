# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TriangleOS is an immersive voice-interactive desktop operating system built with Electron and Next.js. It features a simplified, iOS-style dashboard interface focused on AI consultation and system settings functionality. The application runs in fullscreen mode with hidden system menus, providing a pure, distraction-free experience.

## Architecture

### Hybrid Electron + Next.js Setup
- **Electron Main Process**: `src/main-nextjs.cjs` handles window management and security
- **Next.js Frontend**: App Router architecture with static export for Electron compatibility
- **Development Mode**: Next.js dev server on localhost:3000 with Electron wrapper
- **Production Mode**: Static files served from `out/` directory via `file://` protocol

### Key Components
- **Dashboard**: `src/components/dashboard/Dashboard.tsx` - Main iOS-style interface
- **Voice Assistant**: `src/components/VoiceAssistant.tsx` - Web Speech API integration
- **State Management**: Zustand stores in `src/core/store/` for chat, settings, and projects
- **Consultation System**: `src/app/consult/page.tsx` - AI consultation interface
- **Settings System**: `src/app/settings/` - Configuration management

### Special Build Process
The application uses a specialized build pipeline to ensure Next.js routes work with Electron's `file://` protocol:

1. Next.js builds static export to `out/`
2. `fix-electron-paths.cjs` converts absolute paths (`/_next/`) to relative paths (`./_next/`)
3. Electron loads from the fixed static files

## Common Development Commands

```bash
# Development (hot reload with Next.js dev server + Electron)
npm run dev

# Production build and launch
npm run build-for-electron
npm start

# Next.js only (for web testing)
npm run next-dev
npm run next-build

# Electron only (requires existing build)
npm run dev-nextjs
```

## Voice Integration

The system uses browser-native Web Speech API with the following configuration:
- **Language**: Chinese (zh-CN) primary, with fallback support
- **Continuous Recognition**: Enabled for hands-free operation
- **Auto-restart**: Built-in recovery mechanism for interrupted recognition
- **Command Processing**: Voice commands trigger navigation and application actions

## Security Configuration

Electron security settings are configured for production safety:
- Node.js integration disabled
- Context isolation enabled
- External URL navigation blocked
- Preload script for secure IPC communication

## State Management Architecture

The application uses Zustand for state management with several specialized stores:

### Core Store (`src/core/store/store.ts`)
- Message handling and chat session management
- Research activity tracking and organization
- Real-time streaming message updates via Redis Streams
- Automatic session resumption and history loading

### Project Store
- Current project context and switching
- Project-specific settings and configurations

### Settings Store  
- Chat stream configuration
- MCP (Model Context Protocol) settings
- Report generation preferences

## API Integration

The system integrates with external AI services through:
- **Chat API**: Real-time streaming responses with tool calling support
- **Research API**: Multi-agent research coordination
- **Authentication**: Firebase-based user management
- **Resource Management**: File and document processing pipeline

## Development Notes

### Electron Path Issues
Always run `npm run build-for-electron` instead of `npm run next-build` directly, as the path fixing script is essential for proper Electron functionality.

### Voice Recognition Debugging
Voice recognition requires HTTPS in production or localhost in development. Test voice commands using the browser's developer tools console for debugging.

### State Persistence
Message history and chat sessions persist across app restarts through the backend API integration, not local storage.

### iOS-Style Interface
The current interface design uses only consultation and settings applications. Adding new apps requires updating both the Dashboard component and sidebar navigation.