/**
 * Shared RuntimeService instance for the entire application
 * This ensures all components use the same runtime context and commands
 */

import { RuntimeService } from './RuntimeService'

// Create a singleton instance
let sharedRuntimeInstance: RuntimeService | null = null

export function getSharedRuntimeService(): RuntimeService {
  if (!sharedRuntimeInstance) {
    sharedRuntimeInstance = new RuntimeService()
    console.log('✅ RuntimeService instance created, waiting for app to be loaded...')
  }
  
  return sharedRuntimeInstance
}

// Export the instance getter for convenience
export const runtimeService = () => getSharedRuntimeService()