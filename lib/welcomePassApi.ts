import { getCurrentConfig } from './config'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment config
    const config = getCurrentConfig()
    return config.baseUrl
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

export interface WelcomePassConfig {
  settingKey: string
  isEnabled: boolean
  config: {
    startDate: string
    endDate: string
    maxAllocations: number
    couponCount: number
    expiresInHours: number
    allocatedCount: number
    planType: 'SILVER' | 'GOLD' | 'BRONZE'
    allowedBatchIds: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface WelcomePassStats {
  totalAllocated: number
  todayAllocated: number
  maxAllocations: number
  remainingAllocations: number
  isEnabled: boolean
  offerStatus: string
}

export interface BatchInfo {
  _id: string
  batchId: string
  batchName: string
  planType: string
  availableMoviePasses: number
  totalMoviePasses: number
  allocatedMoviePasses: number
  importedAt: string
  expiryDays: number
}

export interface WelcomePassAllocation {
  _id: string
  bundleId: string
  userId: {
    _id: string
    name?: string
    email?: string
    phone?: string
  } | string
  userName?: string
  userEmail?: string
  userPhone?: string
  couponId: string
  couponCode: string
  batchId: string
  batchName: string
  batchIdString: string
  planType: 'SILVER' | 'GOLD' | 'BRONZE'
  allocatedAt: string
  expiresAt: string
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED'
}

export interface AllocationStatistics {
  total: number
  byStatus: {
    [key: string]: number
  }
  byPlanType: {
    [key: string]: number
  }
  topBatches: Array<{
    _id: string
    count: number
  }>
}

export interface CouponPlan {
  _id: string
  planId: string
  name: string
  displayName: string
  isActive: boolean
}

class WelcomePassApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Get auth token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      console.log('🌐 [WELCOME_PASS_API] Making request to:', url)
      console.log('🌐 [WELCOME_PASS_API] Request config:', {
        method: config.method || 'GET',
        headers: config.headers
      })
      
      const response = await fetch(url, config)
      
      console.log('🌐 [WELCOME_PASS_API] Response status:', response.status)
      console.log('🌐 [WELCOME_PASS_API] Response ok:', response.ok)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [WELCOME_PASS_API] Response error:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('🌐 [WELCOME_PASS_API] Response data received:', data)
      console.log('🌐 [WELCOME_PASS_API] Response data type:', typeof data)
      
      // Return data if wrapped in response object, otherwise return whole response
      if (data && typeof data === 'object' && 'data' in data) {
        console.log('🌐 [WELCOME_PASS_API] Extracting data from response.data')
        return data.data as T
      }
      console.log('🌐 [WELCOME_PASS_API] Returning data directly')
      return data as T
    } catch (error) {
      console.error('❌ [WELCOME_PASS_API] Request error:', error)
      throw error
    }
  }

  // Get welcome pass configuration
  async getConfig(): Promise<WelcomePassConfig> {
    return this.request<WelcomePassConfig>('/welcome-pass/config')
  }

  // Update welcome pass configuration
  async updateConfig(configData: Partial<WelcomePassConfig>): Promise<WelcomePassConfig> {
    return this.request<WelcomePassConfig>('/welcome-pass/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    })
  }

  // Toggle welcome pass (enable/disable)
  async toggleWelcomePass(isEnabled: boolean): Promise<WelcomePassConfig> {
    return this.request<WelcomePassConfig>('/welcome-pass/toggle', {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled }),
    })
  }

  // Get welcome pass statistics
  async getStats(): Promise<WelcomePassStats> {
    return this.request<WelcomePassStats>('/welcome-pass/stats')
  }

  // Get recent allocations
  async getRecentAllocations(limit: number = 10): Promise<any[]> {
    return this.request<any[]>(`/welcome-pass/allocations?limit=${limit}`)
  }

  // Add batch IDs to allowed batches
  async addAllowedBatches(batchIds: string[]): Promise<WelcomePassConfig> {
    return this.request<WelcomePassConfig>('/welcome-pass/batches/add', {
      method: 'POST',
      body: JSON.stringify({ batchIds }),
    })
  }

  // Remove batch IDs from allowed batches
  async removeAllowedBatches(batchIds: string[]): Promise<WelcomePassConfig> {
    return this.request<WelcomePassConfig>('/welcome-pass/batches/remove', {
      method: 'POST',
      body: JSON.stringify({ batchIds }),
    })
  }

  // Get available batches for welcome bonus
  async getAvailableBatches(planType: string): Promise<BatchInfo[]> {
    console.log('🌐 [WELCOME_PASS_API] getAvailableBatches called with planType:', planType)
    const url = `/welcome-pass/batches/available?planType=${planType}`
    console.log('🌐 [WELCOME_PASS_API] Request URL:', url)
    
    try {
      const response = await this.request<{ data: BatchInfo[]; status: string; message: string }>(url)
      console.log('🌐 [WELCOME_PASS_API] Raw response received:', response)
      console.log('🌐 [WELCOME_PASS_API] Response type:', typeof response)
      console.log('🌐 [WELCOME_PASS_API] Response keys:', response ? Object.keys(response) : 'null')
      
      // Handle both wrapped and unwrapped responses
      if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as any).data
        console.log('🌐 [WELCOME_PASS_API] Extracted data from response.data:', data)
        console.log('🌐 [WELCOME_PASS_API] Data is array?', Array.isArray(data))
        console.log('🌐 [WELCOME_PASS_API] Data length:', data?.length || 0)
        return Array.isArray(data) ? data : []
      }
      
      console.log('🌐 [WELCOME_PASS_API] Response is array?', Array.isArray(response))
      const result = Array.isArray(response) ? response : []
      console.log('🌐 [WELCOME_PASS_API] Returning result:', result.length, 'items')
      return result
    } catch (error) {
      console.error('❌ [WELCOME_PASS_API] Error in getAvailableBatches:', error)
      throw error
    }
  }

  // Clear all allowed batches
  async clearAllowedBatches(): Promise<WelcomePassConfig> {
    return this.request<WelcomePassConfig>('/welcome-pass/batches/clear', {
      method: 'DELETE',
    })
  }

  // Get all allocations with filters
  async getAllAllocations(filters?: {
    userId?: string
    batchId?: string
    planType?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    skip?: number
  }): Promise<WelcomePassAllocation[]> {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.batchId) params.append('batchId', filters.batchId)
    if (filters?.planType) params.append('planType', filters.planType)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.skip) params.append('skip', filters.skip.toString())

    const queryString = params.toString()
    const endpoint = queryString 
      ? `/welcome-pass/allocations/all?${queryString}`
      : '/welcome-pass/allocations/all'
    
    const response = await this.request<WelcomePassAllocation[]>(endpoint)
    return response
  }

  // Get allocations by user ID
  async getAllocationsByUserId(userId: string): Promise<WelcomePassAllocation[]> {
    const response = await this.request<WelcomePassAllocation[]>(`/welcome-pass/allocations/user/${userId}`)
    return response
  }

  // Get allocations by batch ID
  async getAllocationsByBatchId(batchId: string): Promise<WelcomePassAllocation[]> {
    const response = await this.request<WelcomePassAllocation[]>(`/welcome-pass/allocations/batch/${batchId}`)
    return response
  }

  // Get allocation statistics
  async getAllocationStatistics(filters?: {
    startDate?: string
    endDate?: string
  }): Promise<AllocationStatistics> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const endpoint = queryString 
      ? `/welcome-pass/allocations/statistics?${queryString}`
      : '/welcome-pass/allocations/statistics'
    
    const response = await this.request<AllocationStatistics>(endpoint)
    return response
  }

  // Get available coupon plans (SILVER, GOLD, etc.)
  async getAvailableCouponPlans(): Promise<CouponPlan[]> {
    const response = await this.request<{ data: CouponPlan[]; pagination: any }>('/subscription-plans/active')
    console.log('🌐 [WELCOME_PASS_API] Available plans response:', response)
    // Handle both wrapped and unwrapped responses
    if (response && typeof response === 'object' && 'data' in response) {
      return Array.isArray((response as any).data) ? (response as any).data : []
    }
    return Array.isArray(response) ? response : []
  }
}

export const welcomePassApi = new WelcomePassApi()

