// Authentication utilities for admin panel
export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    admin: AdminUser
    token: string
    refreshToken: string
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user: AdminUser | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
}

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false
  }

  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Initialize auth state from localStorage
  initialize(): void {
    if (typeof window === 'undefined') {
      // Server side - set default state
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false
      }
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const refreshToken = localStorage.getItem('admin_refresh_token')
      const userStr = localStorage.getItem('admin_user')

      if (token && userStr) {
        const user = JSON.parse(userStr)
        this.authState = {
          isAuthenticated: true,
          user,
          token,
          refreshToken,
          isLoading: false
        }
      } else {
        // No token found, set as not authenticated
        this.authState = {
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
          isLoading: false
        }
      }
      
      // Notify listeners after state is set
      this.notifyListeners()
    } catch (error) {
      console.error('Error initializing auth state:', error)
      this.clearAuth()
    }
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState))
  }

  // Get current auth state
  getAuthState(): AuthState {
    return { ...this.authState }
  }

  // Login admin
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔧 AuthService.login called with:', { email, password: '***' })
    this.authState.isLoading = true
    this.notifyListeners()

    try {
      console.log('🔧 About to import apiService...')
      // Import apiService dynamically to avoid circular dependency
      const { apiService } = await import('./api')
      console.log('🔧 apiService imported:', apiService)
      console.log('🔧 apiService.post method:', typeof apiService.post)
      
      console.log('🌐 Making API request to /admin/login')
      const response = await apiService.post('/admin/login', {
        email,
        password
      }) as any
      console.log('📡 API response:', response)

      if (response.status === 'success') {
        const { admin, tokens } = response.data
        const { accessToken, refreshToken } = tokens

        // Store in localStorage
        localStorage.setItem('admin_token', accessToken)
        localStorage.setItem('admin_refresh_token', refreshToken || '')
        localStorage.setItem('admin_user', JSON.stringify(admin))

        // Update auth state
        this.authState = {
          isAuthenticated: true,
          user: admin,
          token: accessToken,
          refreshToken,
          isLoading: false
        }

        this.notifyListeners()
        return { success: true, data: response.data, message: response.message }
      } else {
        this.authState.isLoading = false
        this.notifyListeners()
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error: any) {
      this.authState.isLoading = false
      this.notifyListeners()
      
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      }
    }
  }

  // Logout admin
  async logout(): Promise<void> {
    try {
      // Import apiService dynamically
      const { apiService } = await import('./api')
      
      // Call logout endpoint if token exists
      if (this.authState.token) {
        try {
          await apiService.post('/admin/logout')
        } catch (error) {
          console.warn('Logout API call failed:', error)
        }
      }
    } catch (error) {
      console.warn('Error during logout:', error)
    } finally {
      this.clearAuth()
    }
  }

  // Clear authentication data
  private clearAuth(): void {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('admin_user')

    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false
    }

    this.notifyListeners()
  }

  // Refresh token
  async refreshAuthToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      this.clearAuth()
      return false
    }

    try {
      const { apiService } = await import('./api')
      
      const response = await apiService.post('/admin/refresh-token', {
        refreshToken: this.authState.refreshToken
      }) as any

      if (response.data.success) {
        const { token, refreshToken } = response.data.data

        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_refresh_token', refreshToken || '')

        this.authState.token = token
        this.authState.refreshToken = refreshToken

        this.notifyListeners()
        return true
      } else {
        this.clearAuth()
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuth()
      return false
    }
  }

  // Get authorization header
  getAuthHeader(): { Authorization: string } | {} {
    if (this.authState.token) {
      return { Authorization: `Bearer ${this.authState.token}` }
    }
    return {}
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.authState.user?.role === role
  }

  // Check if user is active
  isUserActive(): boolean {
    return this.authState.user?.isActive === true
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()

// Export for use in components
export default authService
