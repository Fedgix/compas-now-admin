import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { EnvironmentProvider } from '../contexts/EnvironmentContext'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Compas Admin - Event Management Dashboard',
  description: 'Admin dashboard for managing events, users, and bookings',
  keywords: 'admin, dashboard, events, management, bookings',
  authors: [{ name: 'Compas Admin Team' }],
  icons: {
    icon: [
      { url: '/1024.ico', sizes: 'any' },
      { url: '/1024.png', type: 'image/png' }
    ],
    shortcut: '/1024.ico',
    apple: '/1024.png',
  },
  manifest: '/site.webmanifest'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <EnvironmentProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #c0f75b',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 16px',
                maxWidth: '90vw',
                wordBreak: 'break-word',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
              },
              success: {
                style: {
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid #10b981',
                },
              },
              error: {
                style: {
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid #ef4444',
                },
              },
            }}
            containerStyle={{
              top: 20,
              right: 20,
              left: 20,
            }}
            containerClassName="!z-[9999]"
          />
        </EnvironmentProvider>
      </body>
    </html>
  )
}
