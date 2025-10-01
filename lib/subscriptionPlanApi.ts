/**
 * Subscription Plan API Integration
 * Handles all API calls related to subscription plans
 */

import { apiService } from './api'

interface SubscriptionPlan {
  _id: string
  planId: 'SILVER' | 'GOLD'
  name: string
  displayName: string
  description: string
  detailedInfo: {
    benefits: string[]
    validity: string[]
    usage: string[]
    restrictions: string[]
  }
  howToUse: string[]
  importantNotes: string[]
  displayConfig: {
    showKeyFeatures: boolean
    showDetailedInfo: boolean
    showHowToUse: boolean
    showImportantNotes: boolean
    defaultView: 'summary' | 'detailed'
  }
  availability: {
    region: string
    expansion: string
    announcementChannel: string
  }
  supportInfo: {
    email: string
    whatsapp: string
    responseTime: string
    reportingDeadline: string
  }
  pricing: {
    basePrice: number
    couponPrice: number
    couponCount: number
    totalCouponValue: number
    pvrDiscountPerCoupon: number
    pvrCouponValue: number
    currency: string
    convenienceFeePercentage: number
  }
  isActive: boolean
  sortOrder: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface CreatePlanData {
  planId: 'SILVER' | 'GOLD'
  name: string
  displayName: string
  description: string
  detailedInfo?: {
    benefits: string[]
    validity: string[]
    usage: string[]
    restrictions: string[]
  }
  howToUse?: string[]
  importantNotes?: string[]
  displayConfig?: {
    showKeyFeatures: boolean
    showDetailedInfo: boolean
    showHowToUse: boolean
    showImportantNotes: boolean
    defaultView: 'summary' | 'detailed'
  }
  availability?: {
    region: string
    expansion: string
    announcementChannel: string
  }
  supportInfo?: {
    email: string
    whatsapp: string
    responseTime: string
    reportingDeadline: string
  }
  pricing: {
    basePrice?: number
    couponPrice: number
    couponCount?: number
    totalCouponValue?: number
    pvrDiscountPerCoupon?: number
    pvrCouponValue: number
    currency?: string
    convenienceFeePercentage?: number
  }
  isActive?: boolean
  sortOrder?: number
  tags?: string[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
}

interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Helper function to handle API responses
const handleApiResponse = async <T>(response: any): Promise<ApiResponse<T>> => {
  if (!response.success && response.success !== undefined) {
    throw new Error(response.message || 'API request failed')
  }
  
  return response
}

export const subscriptionPlanApi = {
  // Get all subscription plans
  getAllPlans: async (filters?: {
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<SubscriptionPlan>> => {
    const response = await apiService.get<PaginatedResponse<SubscriptionPlan>>('/subscription-plans/plans', filters)
    return response
  },

  // Get active subscription plans only
  getActivePlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const response = await apiService.get<ApiResponse<SubscriptionPlan[]>>('/subscription-plans/active')
    return response
  },

  // Get subscription plan by ID
  getPlanById: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiService.get<ApiResponse<SubscriptionPlan>>(`/subscription-plans/plans/${id}`)
    return response
  },

  // Get subscription plan by planId (SILVER/GOLD)
  getPlanByPlanId: async (planId: string): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiService.get<ApiResponse<SubscriptionPlan>>(`/subscription-plans/plans/plan/${planId}`)
    return response
  },

  // Create new subscription plan
  createPlan: async (planData: CreatePlanData): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiService.post<ApiResponse<SubscriptionPlan>>('/subscription-plans/plans', planData)
    return response
  },

  // Update subscription plan
  updatePlan: async (id: string, planData: Partial<CreatePlanData>): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await apiService.put<ApiResponse<SubscriptionPlan>>(`/subscription-plans/plans/${id}`, planData)
    return response
  },

  // Delete subscription plan
  deletePlan: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiService.delete<ApiResponse<void>>(`/subscription-plans/plans/${id}`)
    return response
  },

  // Calculate bundle price
  calculateBundlePrice: async (data: {
    planId: string
    couponCount: number
  }): Promise<ApiResponse<{
    totalPrice: number
    convenienceFee: number
    finalPrice: number
  }>> => {
    const response = await apiService.post<ApiResponse<{
      totalPrice: number
      convenienceFee: number
      finalPrice: number
    }>>('/subscription-plans/calculate-price', data)
    return response
  },

  // Calculate coupon price
  calculateCouponPrice: async (data: {
    planId: string
    couponCount: number
  }): Promise<ApiResponse<{
    couponPrice: number
    totalPrice: number
    convenienceFee: number
    finalPrice: number
  }>> => {
    const response = await apiService.post<ApiResponse<{
      couponPrice: number
      totalPrice: number
      convenienceFee: number
      finalPrice: number
    }>>('/subscription-plans/calculate-coupon-price', data)
    return response
  },

  // Get availability status
  getAvailabilityStatus: async (): Promise<ApiResponse<{
    isAvailable: boolean
    message: string
    availablePlans: string[]
  }>> => {
    const response = await apiService.get<ApiResponse<{
      isAvailable: boolean
      message: string
      availablePlans: string[]
    }>>('/subscription-plans/availability/status')
    return response
  },

  // Mark plan as sold out
  markPlanAsSoldOut: async (planId: string): Promise<ApiResponse<void>> => {
    const response = await apiService.post<ApiResponse<void>>('/subscription-plans/availability/sold-out', { planId })
    return response
  },

  // Reactivate plan
  reactivatePlan: async (planId: string): Promise<ApiResponse<void>> => {
    const response = await apiService.post<ApiResponse<void>>('/subscription-plans/availability/reactivate', { planId })
    return response
  },

  // Run availability check
  runAvailabilityCheck: async (): Promise<ApiResponse<{
    checkedPlans: string[]
    status: string
  }>> => {
    const response = await apiService.post<ApiResponse<{
      checkedPlans: string[]
      status: string
    }>>('/subscription-plans/availability/check')
    return response
  },

  // Analytics APIs
  analytics: {
    // Get bundle purchase statistics
    getBundleStats: async (): Promise<ApiResponse<{
      totalBundles: number
      totalRevenue: number
      averageBundleValue: number
      bundlesThisMonth: number
    }>> => {
      const response = await apiService.get<ApiResponse<{
        totalBundles: number
        totalRevenue: number
        averageBundleValue: number
        bundlesThisMonth: number
      }>>('/subscription-plans/analytics/bundle-stats')
      return response
    },

    // Get plan comparison
    getPlanComparison: async (): Promise<ApiResponse<{
      silver: {
        totalPurchases: number
        totalRevenue: number
        averageValue: number
      }
      gold: {
        totalPurchases: number
        totalRevenue: number
        averageValue: number
      }
    }>> => {
      const response = await apiService.get<ApiResponse<{
        silver: {
          totalPurchases: number
          totalRevenue: number
          averageValue: number
        }
        gold: {
          totalPurchases: number
          totalRevenue: number
          averageValue: number
        }
      }>>('/subscription-plans/analytics/plan-comparison')
      return response
    },

    // Get user purchase behavior
    getUserPurchaseBehavior: async (userId: string): Promise<ApiResponse<{
      totalPurchases: number
      totalSpent: number
      favoritePlan: string
      lastPurchase: string
      purchaseHistory: any[]
    }>> => {
      const response = await apiService.get<ApiResponse<{
        totalPurchases: number
        totalSpent: number
        favoritePlan: string
        lastPurchase: string
        purchaseHistory: any[]
      }>>(`/subscription-plans/analytics/user-behavior/${userId}`)
      return response
    },

    // Get bundle utilization statistics
    getUtilizationStats: async (): Promise<ApiResponse<{
      totalCouponsGenerated: number
      totalCouponsUsed: number
      utilizationRate: number
      unusedCoupons: number
    }>> => {
      const response = await apiService.get<ApiResponse<{
        totalCouponsGenerated: number
        totalCouponsUsed: number
        utilizationRate: number
        unusedCoupons: number
      }>>('/subscription-plans/analytics/utilization-stats')
      return response
    }
  }
}

export type { SubscriptionPlan, CreatePlanData, ApiResponse, PaginatedResponse }
