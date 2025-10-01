'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <img 
            src="/1024.png" 
            alt="Compas Admin Logo" 
            className="w-16 h-16 rounded-lg"
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">COMPAS ADMIN</h1>
        <p className="text-white/60 mb-6">Redirecting to dashboard...</p>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}
