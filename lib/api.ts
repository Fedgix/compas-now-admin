import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { getCurrentConfig, Environment } from './config'

class ApiService {
  private instance: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.instance = axios.create({
      timeout: 30000, // Increased to 30 seconds for production servers
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const envConfig = getCurrentConfig()
        config.baseURL = envConfig.baseUrl
        
        // Add auth token if available
        const token = this.authToken || localStorage.getItem('admin_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        console.log(`🌐 API Request to ${envConfig.name}:`, config.url)
        return config
      },
      (error) => {
        console.error('❌ API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response from ${getCurrentConfig().name}:`, response.status)
        return response
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.message)
        return Promise.reject(error)
      }
    )
  }

  // Update base URL when environment changes
  updateEnvironment(env: Environment) {
    const envConfig = getCurrentConfig()
    this.instance.defaults.baseURL = envConfig.baseUrl
    console.log(`🔄 Switched to ${envConfig.name}: ${envConfig.baseUrl}`)
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<T> {
    console.log('🔧 ApiService.get called with:', { url, params })
    try {
      const response = await this.instance.get(url, { params })
      console.log('🔧 ApiService.get response:', response)
      return response.data
    } catch (error) {
      console.error('🔧 ApiService.get error:', error)
      throw error
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    console.log('🔧 ApiService.post called with:', { url, data: data ? '***' : 'no data' })
    console.log('🔧 Instance baseURL:', this.instance.defaults.baseURL)
    console.log('🔧 Instance config:', this.instance.defaults)
    
    try {
      const response = await this.instance.post(url, data)
      console.log('🔧 ApiService.post response:', response)
      return response.data
    } catch (error) {
      console.error('🔧 ApiService.post error:', error)
      throw error
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete(url)
    return response.data
  }

  // Admin specific API methods
  async getDashboardStats() {
    return this.get('/admin/dashboard/stats')
  }

  async getEvents(params?: any) {
    return this.get('/admin/events', params)
  }

  async getUsers(params?: any) {
    return this.get('/admin/users', params)
  }

  async getBookings(params?: any) {
    return this.get('/admin/bookings', params)
  }

  async getPayments(params?: any) {
    return this.get('/admin/payments', params)
  }

  async getAnalytics(params?: any) {
    return this.get('/admin/analytics', params)
  }

  // Set auth token
  setAuthToken(token: string | null): void {
    this.authToken = token
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.authToken
  }

  // Test connection to current environment
  async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    const startTime = Date.now()
    try {
      await this.get('/health')
      const responseTime = Date.now() - startTime
      return {
        success: true,
        message: 'Connection successful',
        responseTime
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Connection failed'
      }
    }
  }
}

// Create singleton instance
export const apiService = new ApiService()

// Export for use in components
export default apiService
