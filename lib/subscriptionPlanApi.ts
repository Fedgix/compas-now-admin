import { SubscriptionPlan, CreateSubscriptionPlanData } from './types'
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

class SubscriptionPlanApi {
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
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Get all subscription plans
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.request<SubscriptionPlan[]>('/subscription-plans/plans')
  }

  // Get active subscription plans
  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.request<SubscriptionPlan[]>('/subscription-plans/active')
  }

  // Get subscription plan by ID
  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>(`/subscription-plans/plans/${id}`)
  }

  // Get subscription plan by plan ID (SILVER/GOLD)
  async getSubscriptionPlanByPlanId(planId: string): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>(`/subscription-plans/plans/plan/${planId}`)
  }

  // Create new subscription plan
  async createSubscriptionPlan(data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>('/subscription-plans/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Update subscription plan
  async updateSubscriptionPlan(id: string, data: Partial<CreateSubscriptionPlanData>): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>(`/subscription-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Calculate bundle price
  async calculateBundlePrice(planId: string, couponCount: number): Promise<{
    couponCount: number
    couponPrice: number
    subtotal: number
    convenienceFeeTier: string
    convenienceFeePercentage: number
    convenienceFee: number
    totalAmount: number
    savings: number
  }> {
    return this.request('/subscription-plans/calculate-price', {
      method: 'POST',
      body: JSON.stringify({ planId, couponCount }),
    })
  }

  // Get availability status
  async getAvailabilityStatus(): Promise<{
    plans: Array<{
      planId: string
      name: string
      isAvailable: boolean
      reason?: string
      availableCoupons?: number
    }>
  }> {
    return this.request('/subscription-plans/availability/status')
  }

  // Mark plan as sold out (Admin only)
  async markPlanAsSoldOut(planId: string, reason: string): Promise<{ success: boolean }> {
    return this.request('/subscription-plans/availability/sold-out', {
      method: 'POST',
      body: JSON.stringify({ planId, reason }),
    })
  }

  // Reactivate plan (Admin only)
  async reactivatePlan(planId: string): Promise<{ success: boolean }> {
    return this.request('/subscription-plans/availability/reactivate', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    })
  }

  // Run availability check (Admin only)
  async runAvailabilityCheck(): Promise<{ success: boolean; results: any }> {
    return this.request('/subscription-plans/availability/check', {
      method: 'POST',
    })
  }

  // Get bundle purchase statistics (Admin only)
  async getBundlePurchaseStats(startDate?: string, endDate?: string, planType?: string): Promise<{
    totalBundles: number
    totalCoupons: number
    totalRevenue: number
    averageBundleSize: number
    averageBundleValue: number
  }> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (planType) params.append('planType', planType)
    
    const queryString = params.toString()
    const endpoint = queryString 
      ? `/subscription-plans/analytics/bundle-stats?${queryString}`
      : '/subscription-plans/analytics/bundle-stats'
    
    return this.request(endpoint)
  }

  // Get plan comparison analytics (Admin only)
  async getPlanComparison(startDate?: string, endDate?: string): Promise<Array<{
    _id: string
    totalBundles: number
    totalCoupons: number
    totalRevenue: number
    averageBundleSize: number
    averageRevenue: number
    planDetails: {
      couponPrice: number
      pvrValue: number
      validDays: string[]
    }
  }>> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const queryString = params.toString()
    const endpoint = queryString 
      ? `/subscription-plans/analytics/plan-comparison?${queryString}`
      : '/subscription-plans/analytics/plan-comparison'
    
    return this.request(endpoint)
  }

  // Get bundle utilization statistics (Admin only)
  async getBundleUtilizationStats(startDate?: string, endDate?: string): Promise<Array<{
    _id: string
    totalBundles: number
    averageUtilization: number
    fullyUsedBundles: number
    expiredBundles: number
    activeBundles: number
  }>> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const queryString = params.toString()
    const endpoint = queryString 
      ? `/subscription-plans/analytics/utilization-stats?${queryString}`
      : '/subscription-plans/analytics/utilization-stats'
    
    return this.request(endpoint)
  }

  // Get user purchase behavior (Admin only)
  async getUserPurchaseBehavior(userId: string, limit?: number): Promise<Array<{
    _id: string
    bundleId: string
    couponCount: number
    pricing: {
      totalAmount: number
      totalSavings: number
    }
    status: string
    purchasedAt: string
    usage: {
      totalCouponsUsed: number
      remainingCoupons: number
    }
    planId: {
      name: string
      pricing: {
        couponPrice: number
      }
    }
  }>> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    
    const queryString = params.toString()
    const endpoint = queryString 
      ? `/subscription-plans/analytics/user-behavior/${userId}?${queryString}`
      : `/subscription-plans/analytics/user-behavior/${userId}`
    
    return this.request(endpoint)
  }


}

export const subscriptionPlanApi = new SubscriptionPlanApi()