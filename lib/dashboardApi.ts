import { apiService } from './api'

export interface DashboardStats {
  totalUsers: number
  activeEvents: number
  totalRevenue: number
  conversionRate: number
  recentBookings: Booking[]
  totalEarnings: EarningsData
}

export interface Booking {
  id: string
  eventName: string
  userName: string
  amount: number
  status: 'Confirmed' | 'Pending' | 'Cancelled'
  bookingDate: string
}

export interface EarningsData {
  totalEarnings: number
  thisMonth: number
  lastMonth: number
  growthPercentage: number
  currency: string
}

export interface EventStats {
  totalEvents: number
  activeEvents: number
  completedEvents: number
  cancelledEvents: number
  totalBookings: number
  totalRevenue: number
}

export interface EventBasicStats {
  totalBookings: number
  totalRevenue: number
  averageTicketPrice: number
  bookingStatus: {
    confirmed: number
    pending: number
    cancelled: number
  }
}

class DashboardApiService {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      
      // Call real backend API
      const response = await apiService.get('/admin/dashboard/stats') as any
      
      
      if (response.status === 'success' && response.data) {
        const data = response.data
        
        // Map backend response to frontend interface
        const mappedStats: DashboardStats = {
          totalUsers: data.totalUsers || 0,
          activeEvents: data.activeEvents || 0,
          totalRevenue: data.totalRevenue || 0,
          conversionRate: data.conversionRate || 0,
          totalEarnings: {
            totalEarnings: data.totalEarnings?.current || data.totalRevenue || 0,
            thisMonth: Math.round((data.totalRevenue || 0) * 0.4), // 40% assumed for current month
            lastMonth: Math.round((data.totalRevenue || 0) * 0.35), // 35% assumed for last month
            growthPercentage: data.totalEarnings?.growthPercentage || 0,
            currency: '₹'
          },
          recentBookings: (data.recentBookings || []).map((booking: any) => ({
            id: booking.id || 'N/A',
            eventName: booking.eventName || 'Event',
            userName: booking.userName || 'Unknown',
            amount: typeof booking.amount === 'string' ? parseInt(booking.amount.replace(/[^0-9]/g, '')) : booking.amount,
            status: booking.status === 'Confirmed' ? 'Confirmed' : booking.status === 'Pending' ? 'Pending' : 'Cancelled',
            bookingDate: booking.bookingDate || new Date().toISOString()
          }))
        }
        
        return mappedStats
      }
      
      throw new Error('Invalid response format')
    } catch (error: any) {
      
      // Mock data as fallback
      const mockStats: DashboardStats = {
        totalUsers: 2543,
        activeEvents: 12,
        totalRevenue: 125000,
        totalEarnings: {
          totalEarnings: 125000,
          thisMonth: 50000,
          lastMonth: 40000,
          growthPercentage: 15.5,
          currency: '₹'
        },
        conversionRate: 4.5,
        recentBookings: [
          { id: 'B001', eventName: 'Summer Fest', userName: 'Alice Smith', amount: 1500, status: 'Confirmed', bookingDate: '2025-09-15T10:00:00Z' },
          { id: 'B002', eventName: 'Tech Conference', userName: 'Bob Johnson', amount: 2500, status: 'Pending', bookingDate: '2025-09-14T14:30:00Z' },
          { id: 'B003', eventName: 'Art Exhibition', userName: 'Charlie Brown', amount: 800, status: 'Cancelled', bookingDate: '2025-09-13T18:45:00Z' },
          { id: 'B004', eventName: 'Music Concert', userName: 'Diana Prince', amount: 3000, status: 'Confirmed', bookingDate: '2025-09-12T09:15:00Z' },
          { id: 'B005', eventName: 'Food Festival', userName: 'Eve Adams', amount: 1200, status: 'Confirmed', bookingDate: '2025-09-11T11:00:00Z' },
        ]
      }
      
      return mockStats
    }
  }

  // User growth series API
  async getUserGrowthSeries(params: { startDate?: string; endDate?: string; groupBy?: 'daily'|'weekly'|'monthly'; tz?: string }): Promise<{ series: { date: string; count: number }[]; totals: { rangeNewUsers: number; allTimeUsers: number } }> {
    const query = new URLSearchParams()
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    if (params.groupBy) query.append('groupBy', params.groupBy)
    if (params.tz) query.append('tz', params.tz)
    const resp = await apiService.get<any>(`/platform-analytics/users?${query.toString()}`)
    return resp.data || { series: [], totals: { rangeNewUsers: 0, allTimeUsers: 0 } }
  }

  // Active users by transactions series
  async getActiveUsersSeries(params: { startDate?: string; endDate?: string; groupBy?: 'daily'|'weekly'|'monthly'; tz?: string }): Promise<{ series: { date: string; count: number }[]; totals: { rangeActiveUsers: number; allTimeActiveUsers: number } }> {
    const query = new URLSearchParams()
    if (params.startDate) query.append('startDate', params.startDate)
    if (params.endDate) query.append('endDate', params.endDate)
    if (params.groupBy) query.append('groupBy', params.groupBy)
    if (params.tz) query.append('tz', params.tz)
    const resp = await apiService.get<any>(`/platform-analytics/active-users?${query.toString()}`)
    return resp.data || { series: [], totals: { rangeActiveUsers: 0, allTimeActiveUsers: 0 } }
  }

  // Get recent bookings
  async getRecentBookings(): Promise<Booking[]> {
    try {
      const eventsResponse = await apiService.get('/admin/events?limit=5') as any
      const events = eventsResponse.data?.events || []
      
      const bookings: Booking[] = []
      
      // Get bookings for each event
      for (const event of events) {
        try {
          const bookingsResponse = await apiService.get(`/admin/events/${event.id}/bookings?limit=3`) as any
          const eventBookings = bookingsResponse.data?.bookings || []
          
          eventBookings.forEach((booking: any) => {
            bookings.push({
              id: booking.id || `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              eventName: event.title || event.name || 'Unknown Event',
              userName: booking.user?.name || booking.userName || 'Unknown User',
              amount: booking.amount || booking.totalAmount || 0,
              
              status: this.getBookingStatus(booking.status),
              bookingDate: booking.createdAt || new Date().toISOString()
            })
          })
        } catch (error) {
        }
      }
      
      // Sort by date and limit to 10
      return bookings
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
        .slice(0, 10)
    } catch (error) {
      return []
    }
  }

  // Get event statistics
  async getEventStats(): Promise<EventStats> {
    try {
      const eventsResponse = await apiService.get('/admin/events?limit=100') as any
      const events = eventsResponse.data?.events || []
      
      const earningsResponse = await apiService.get('/admin/events/earnings') as any
      const earnings = earningsResponse.data || { totalEarnings: 0 }
      
      const activeEvents = events.filter((event: any) => event.status === 'active').length
      const completedEvents = events.filter((event: any) => event.status === 'completed').length
      const cancelledEvents = events.filter((event: any) => event.status === 'cancelled').length
      
      // Calculate total bookings (this would be more accurate with a dedicated endpoint)
      let totalBookings = 0
      for (const event of events.slice(0, 10)) { // Limit to first 10 events for performance
        try {
          const statsResponse = await apiService.get(`/admin/events/${event.id}/basic-stats`) as any
          totalBookings += statsResponse.data?.totalBookings || 0
        } catch (error) {
        }
      }
      
      return {
        totalEvents: events.length,
        activeEvents,
        completedEvents,
        cancelledEvents,
        totalBookings,
        totalRevenue: earnings.totalEarnings || 0
      }
    } catch (error) {
      throw error
    }
  }

  // Get specific event basic stats
  async getEventBasicStats(eventId: string): Promise<EventBasicStats> {
    try {
      const response = await apiService.get(`/admin/events/${eventId}/basic-stats`) as any
      return response.data || {
        totalBookings: 0,
        totalRevenue: 0,
        averageTicketPrice: 0,
        bookingStatus: {
          confirmed: 0,
          pending: 0,
          cancelled: 0
        }
      }
    } catch (error) {
      throw error
    }
  }

  // Get total earnings with filters
  async getTotalEarnings(filters?: {
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<EarningsData> {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)
      
      const response = await apiService.get(`/admin/events/earnings?${queryParams.toString()}`) as any
      const data = response.data || { totalEarnings: 0 }
      
      return {
        totalEarnings: data.totalEarnings || 0,
        thisMonth: data.thisMonth || data.totalEarnings * 0.4,
        lastMonth: data.lastMonth || data.totalEarnings * 0.3,
        growthPercentage: data.growthPercentage || 8.5,
        currency: '₹'
      }
    } catch (error) {
      throw error
    }
  }

  // Helper function to determine booking status
  private getBookingStatus(status: string): 'Confirmed' | 'Pending' | 'Cancelled' {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return 'Confirmed'
      case 'pending':
      case 'processing':
        return 'Pending'
      case 'cancelled':
      case 'refunded':
        return 'Cancelled'
      default:
        return 'Pending'
    }
  }

  // Test connection to current environment
  async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    return apiService.testConnection()
  }
}

// Create singleton instance
export const dashboardApiService = new DashboardApiService()

// Export for use in components
export default dashboardApiService
