// Export all stores for easy importing
export { useSettingsStore } from './settingsStore'
export { useChatStore } from './chatStore'  
export { useProjectStore } from './projectStore'

// Re-export types
export type { Message, ChatSession } from './chatStore'
export type { Project } from './projectStore'

// Store initialization
export const initializeStores = async () => {
  // Any store initialization logic can go here
  // For example, loading initial data or setting up subscriptions
  console.log('Initializing TriangleOS stores...')
}

// Store cleanup
export const cleanupStores = () => {
  // Any cleanup logic when the app shuts down
  console.log('Cleaning up TriangleOS stores...')
}