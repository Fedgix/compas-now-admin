import { apiService } from './api'

export interface AdminLoginData {
  email: string
  password: string
}

export interface AdminAuthResponse {
  status: 'success' | 'error'
  message?: string
  data?: {
    admin: {
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
}

export interface Admin {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

class AuthApiService {
  // Login admin
  async login(credentials: AdminLoginData): Promise<AdminAuthResponse> {
    try {
      console.log('🔐 Attempting admin login...')
      
      // Hardcoded to localhost:8000 for now
      const loginUrl = 'http://localhost:8000/api/admin/login'
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      
      if (data.status === 'success' && data.data) {
        // Store tokens in localStorage
        this.setTokens(data.data.tokens)
        
        // Store admin info
        this.setAdmin(data.data.admin)
        
        console.log('✅ Admin login successful')
        return data
      }
      
      throw new Error(data.message || 'Login failed')
    } catch (error: any) {
      console.error('❌ Admin login error:', error)
      throw error
    }
  }

  // Logout admin
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (refreshToken) {
        await apiService.post('/admin/logout', { refreshToken })
      }
      
      this.clearAuth()
      console.log('✅ Admin logged out')
    } catch (error: any) {
      console.error('❌ Admin logout error:', error)
      this.clearAuth()
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (!refreshToken) {
        return false
      }
      
      const response = await apiService.post('/admin/refresh-token', { refreshToken }) as any
      
      if (response.status === 'success' && response.data?.tokens) {
        this.setTokens(response.data.tokens)
        return true
      }
      
      return false
    } catch (error: any) {
      console.error('❌ Token refresh error:', error)
      return false
    }
  }

  // Get admin profile
  async getProfile(): Promise<Admin | null> {
    try {
      const response = await apiService.get('/admin/profile') as any
      
      if (response.status === 'success' && response.data?.admin) {
        this.setAdmin(response.data.admin)
        return response.data.admin
      }
      
      return null
    } catch (error: any) {
      console.error('❌ Get profile error:', error)
      return null
    }
  }

  // Token management
  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('admin_access_token', tokens.accessToken)
    localStorage.setItem('admin_refresh_token', tokens.refreshToken)
    
    // Update API service with new token
    apiService.setAuthToken(tokens.accessToken)
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_refresh_token')
  }

  // Admin info management
  setAdmin(admin: Admin): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('admin_info', JSON.stringify(admin))
  }

  getAdmin(): Admin | null {
    if (typeof window === 'undefined') return null
    
    const adminStr = localStorage.getItem('admin_info')
    if (!adminStr) return null
    
    try {
      return JSON.parse(adminStr)
    } catch (error) {
      return null
    }
  }

  // Check if admin is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const admin = this.getAdmin()
    return !!(token && admin)
  }

  // Clear all auth data
  clearAuth(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('admin_info')
    
    apiService.setAuthToken(null)
  }

  // Initialize auth (call on app load)
  initAuth(): void {
    const token = this.getAccessToken()
    if (token) {
      apiService.setAuthToken(token)
    }
  }
}

// Create singleton instance
export const authApiService = new AuthApiService()

// Export for use in components
export default authApiService

