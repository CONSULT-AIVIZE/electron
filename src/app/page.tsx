'use client'

import WindowsDesktop from '@/components/desktop/WindowsDesktop'
import VoiceWaveform from '@/components/VoiceWaveform'

export default function HomePage() {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Windows-style Desktop */}
      <WindowsDesktop />
      
      {/* Voice Waveform - Fixed at bottom center */}
      <VoiceWaveform />
    </div>
  )
}