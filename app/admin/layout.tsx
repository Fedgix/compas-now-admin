'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { authApiService } from '../../lib/authApi'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import { EnvironmentProvider } from '../../contexts/EnvironmentContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      // Check if tokens exist
      if (!authApiService.isAuthenticated()) {
        console.log('❌ No authentication found, redirecting to login...')
        router.push('/login')
        return
      }

      // Initialize auth (set token in API service)
      authApiService.initAuth()

      // Verify token by fetching profile
      const profile = await authApiService.getProfile()

      if (!profile) {
        console.log('❌ Invalid token, redirecting to login...')
        authApiService.clearAuth()
        router.push('/login')
        return
      }

      console.log('✅ Admin authenticated:', profile)
      setAdmin(profile)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('❌ Auth check failed:', error)
      
      // Try to refresh token
      const refreshed = await authApiService.refreshToken()
      
      if (refreshed) {
        // Retry auth check
        checkAuth()
      } else {
        toast.error('Session expired. Please login again.')
        authApiService.clearAuth()
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApiService.logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white/60 mt-4">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <EnvironmentProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className="pl-64">
          {/* Header */}
          <AdminHeader admin={admin} onLogout={handleLogout} />

          {/* Page Content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </EnvironmentProvider>
  )
}
