import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TriangleOS',
  description: 'AI-powered voice-interactive desktop operating system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-black text-white overflow-hidden`}>
        <main className="h-full w-full">
          {children}
        </main>
      </body>
    </html>
  )
}