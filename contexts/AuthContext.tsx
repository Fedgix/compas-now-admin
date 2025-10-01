'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, AuthState, AdminUser } from '../lib/auth'

interface AuthContextType {
  isAuthenticated: boolean
  user: AdminUser | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshAuthToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false
  })

  // Initialize auth service
  useEffect(() => {
    // Initialize auth service
    authService.initialize()
    
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newState) => {
      setAuthState(newState)
    })

    // Set initial state after initialization
    const currentState = authService.getAuthState()
    setAuthState(currentState)

    return unsubscribe
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await authService.login(email, password)
    return response.success
  }

  // Logout function
  const logout = async (): Promise<void> => {
    await authService.logout()
  }

  // Refresh token function
  const refreshAuthToken = async (): Promise<boolean> => {
    return await authService.refreshAuthToken()
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuthToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  return <>{children}</>
}
