/**
 * Sales Statistics API Integration
 * Handles all API calls related to sales statistics
 */

import { apiService } from './api'
import { getCurrentConfig } from './config'

interface PlanBreakdown {
  planId: string
  planName: string
  planType: string
  subscriptionCount: number
  revenue: number
}

interface SalesStatistics {
  totalMoviePassesSold: number
  totalRevenueFromMoviePass: number
  totalSubscriptionsTaken: number
  planBreakdown: PlanBreakdown[]
  period: string
  dateRange: {
    startDate: string | null
    endDate: string | null
  }
}

interface ApiResponse<T> {
  status: string
  message: string
  data: T
  error?: string
}

export const salesApi = {
  // Get sales statistics
  getSalesStatistics: async (params: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all'
    date?: string
    startDate?: string
    endDate?: string
    download?: boolean
  } = {}): Promise<ApiResponse<SalesStatistics> | Blob> => {
    const queryParams = new URLSearchParams()
    
    if (params.period) queryParams.append('period', params.period)
    if (params.date) queryParams.append('date', params.date)
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.download) queryParams.append('download', 'true')

    // If download is requested, return blob
    if (params.download) {
      const envConfig = getCurrentConfig()
      const baseUrl = envConfig.baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const token = localStorage.getItem('admin_access_token') || localStorage.getItem('admin_token')

      const response = await fetch(`${baseUrl}/admin/sales/statistics?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to export sales statistics: ${errorText}`)
      }

      return response.blob()
    }

    // Otherwise return JSON
    const response = await apiService.get<ApiResponse<SalesStatistics>>(`/admin/sales/statistics?${queryParams.toString()}`)
    return response
  }
}

export type { SalesStatistics, PlanBreakdown }

