'use client'

import RealtimeVoiceChat from '@/components/realtime/RealtimeVoiceChat'

export default function RealtimeTestPage() {
  const handleTranscript = (text: string, isFinal: boolean) => {
    console.log('Transcript:', { text, isFinal })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OpenAI Realtime Voice Chat Test
          </h1>
          <p className="text-gray-600">
            Test the realtime voice chat functionality with OpenAI's realtime API
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-1">
          <RealtimeVoiceChat onTranscript={handleTranscript} />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Connect" to establish connection with OpenAI Realtime API</li>
            <li>Once connected, you can either:</li>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Type text messages and click "Send"</li>
              <li>Use voice with VAD (hands-free) - just speak</li>
              <li>Disable VAD and use Push-to-Talk button</li>
            </ul>
            <li>Try these example prompts:</li>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>"What time is it?"</li>
              <li>"Tell me about my system"</li>
              <li>"Hello, how are you?"</li>
            </ul>
            <li>Check browser console for debugging information</li>
          </ol>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Requirements:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• OPENAI_API_KEY environment variable must be set</li>
            <li>• Microphone permission required for voice input</li>
            <li>• HTTPS or localhost required for WebRTC</li>
          </ul>
        </div>
      </div>
    </div>
  )
}