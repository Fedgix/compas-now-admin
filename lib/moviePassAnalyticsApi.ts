/**
 * Movie Pass Analytics API Service
 */

import { apiService } from './api'

export interface AnalyticsMetrics {
  totalPasses: number
  usedPasses: number
  availablePasses: number
  totalRevenue: number
  usageRate: number
  growth: number
}

export interface BatchAnalytics {
  batchId: string
  batchName: string
  totalCoupons: number
  usedCoupons: number
  availableCoupons: number
  utilizationRate: number
  totalRevenue: number
  averageRevenuePerCoupon: number
  createdAt: string
  status: string
}

export interface PlanComparison {
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
}

export interface UtilizationStats {
  _id: string
  totalBundles: number
  averageUtilization: number
  fullyUsedBundles: number
  expiredBundles: number
  activeBundles: number
}

export interface UserBehavior {
  userId: string
  totalPurchases: number
  totalAmount: number
  averagePurchaseValue: number
  preferredPlan: string
  lastPurchaseDate: string
  totalCoupons: number
}

export interface RevenueData {
  date: string
  revenue: number
  transactions: number
}

class MoviePassAnalyticsApi {
  private basePath = '/platform-analytics'
  private batchPath = '/batch-analytics'
  private subscriptionPath = '/subscription-plans/analytics'
  private moviePassPath = '/movie-passes'

  // ===========================
  // OVERVIEW ANALYTICS
  // ===========================

  async getOverviewMetrics(): Promise<AnalyticsMetrics> {
    try {
      // Get batches and subscription analytics in parallel
      const [batchesResponse, bundleStatsResponse] = await Promise.all([
        this.getAllBatches(),
        this.getBundlePurchaseStats().catch(() => null) // Don't fail if this endpoint fails
      ])
      
      // Handle batches response
      let batches: any[] = []
      if (Array.isArray(batchesResponse)) {
        batches = batchesResponse
      } else if (batchesResponse && batchesResponse.status === 'success' && batchesResponse.data) {
        batches = batchesResponse.data
      } else if (batchesResponse && batchesResponse.data && Array.isArray(batchesResponse.data)) {
        batches = batchesResponse.data
      }
      
      // Calculate totals from batches
      const totalPasses = batches.reduce((sum, batch) => sum + (batch.totalMoviePasses || 0), 0)
      const usedPasses = batches.reduce((sum, batch) => sum + (batch.usedMoviePasses || 0), 0)
      const availablePasses = batches.reduce((sum, batch) => sum + (batch.availableMoviePasses || 0), 0)
      const batchRevenue = batches.reduce((sum, batch) => sum + (batch.totalRevenue || 0), 0)
      
      // Get revenue from subscription analytics (fallback to batch revenue)
      let totalRevenue = batchRevenue
      if (bundleStatsResponse && bundleStatsResponse.totalRevenue) {
        totalRevenue = bundleStatsResponse.totalRevenue
      }
      
      return {
        totalPasses,
        usedPasses,
        availablePasses,
        totalRevenue,
        usageRate: totalPasses > 0 ? (usedPasses / totalPasses) * 100 : 0,
        growth: 12 // TODO: Calculate from historical data
      }
    } catch (error) {
      // Return default values on error
      return {
        totalPasses: 0,
        usedPasses: 0,
        availablePasses: 0,
        totalRevenue: 0,
        usageRate: 0,
        growth: 0
      }
    }
  }

  async getRecentTransactions(limit = 10) {
    return apiService.get(`${this.subscriptionPath}/recent-transactions?limit=${limit}`)
  }

  // ===========================
  // BATCH ANALYTICS
  // ===========================

  async getAllBatches() {
    return apiService.get<BatchAnalytics[]>(`${this.moviePassPath}/batches`)
  }

  async getBatchAnalytics(batchId: string) {
    return apiService.get(`${this.batchPath}/${batchId}`)
  }

  async getBatchAnalyticsOverview(filters?: {
    startDate?: string
    endDate?: string
    status?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.status) params.append('status', filters.status)
    
    return apiService.get(`${this.batchPath}?${params.toString()}`)
  }

  async getBatchUtilizationStats() {
    return apiService.get(`${this.batchPath}/utilization-stats`)
  }

  async getBatchPerformanceStats() {
    return apiService.get(`${this.batchPath}/performance-stats`)
  }

  // ===========================
  // SUBSCRIPTION ANALYTICS
  // ===========================

  async getBundlePurchaseStats(startDate?: string, endDate?: string, planType?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (planType) params.append('planType', planType)
    
    return apiService.get(`${this.subscriptionPath}/bundle-stats?${params.toString()}`)
  }

  async getPlanComparison(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return apiService.get<PlanComparison[]>(`${this.subscriptionPath}/plan-comparison?${params.toString()}`)
  }

  async getBundleUtilizationStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return apiService.get<UtilizationStats[]>(`${this.subscriptionPath}/utilization-stats?${params.toString()}`)
  }

  async getUserPurchaseBehavior(userId: string, limit = 10) {
    return apiService.get<UserBehavior>(`${this.subscriptionPath}/user-behavior/${userId}?limit=${limit}`)
  }

  // ===========================
  // REVENUE ANALYTICS
  // ===========================

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
    return apiService.get(`${this.basePath}/dashboard/revenue?period=${period}&days=${days}`)
  }

  async getRevenueTrend(startDate: string, endDate: string) {
    return apiService.get<RevenueData[]>(
      `${this.basePath}/range?startDate=${startDate}&endDate=${endDate}`
    )
  }

  // ===========================
  // USER BEHAVIOR ANALYTICS
  // ===========================

  async getUserAnalytics() {
    return apiService.get(`${this.basePath}/dashboard/users`)
  }

  async getTopUsers(limit = 10) {
    // TODO: Implement backend endpoint for top users
    return apiService.get(`${this.basePath}/top-users?limit=${limit}`)
  }

  // ===========================
  // PLATFORM SUMMARY
  // ===========================

  async getPlatformSummary(days = 30) {
    return apiService.get(`${this.basePath}/summary?days=${days}`)
  }

  async getDailyAnalytics(date?: string) {
    const params = date ? `?date=${date}` : ''
    return apiService.get(`${this.basePath}/daily${params}`)
  }

  async getSubscriptionAnalytics() {
    return apiService.get(`${this.basePath}/dashboard/subscriptions`)
  }
}

export const moviePassAnalyticsApi = new MoviePassAnalyticsApi()
