/**
 * Navigation helper for Electron app
 * Handles navigation in both development (localhost) and production (file://) environments
 */

export function navigateToRoute(route: string) {
  if (typeof window === 'undefined') return
  
  const isDev = window.location.protocol === 'http:' || window.location.protocol === 'https:'
  
  if (isDev) {
    // In development, use Next.js router normally
    window.location.href = `${window.location.origin}${route}`
  } else {
    // In production Electron app, navigate to the static HTML files
    const routeMap: Record<string, string> = {
      '/': 'index.html',
      '/consult': 'consult/index.html',
      '/settings': 'settings/index.html',
      '/test': 'test/index.html',
      '/realtime-test': 'realtime-test/index.html'
    }
    
    const targetFile = routeMap[route] || 'index.html'
    
    // Get the current file URL and extract the directory
    const currentUrl = window.location.href
    const appRootUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/out/') + 5) // Keep /out/ 
    
    // Navigate to the new file relative to the app root
    const newUrl = `${appRootUrl}${targetFile}`
    
    console.log(`[Navigation] From: ${currentUrl} -> To: ${newUrl}`)
    
    // Use replace to avoid issues with the file:// protocol
    window.location.replace(newUrl)
  }
}

export function isElectronProduction(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'file:'
}