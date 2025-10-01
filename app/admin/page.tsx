'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import StatCard from '../../components/StatCard'
import AdminCard from '../../components/AdminCard'
import AdminTable, { AdminTableRow, AdminTableCell } from '../../components/AdminTable'
import EnvironmentIndicator from '../../components/EnvironmentIndicator'
import LoadingSpinner from '../../components/LoadingSpinner'
import { dashboardApiService, DashboardStats, Booking } from '../../lib/dashboardApi'
import { useEnvironment } from '../../contexts/EnvironmentContext'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentEnvironment, currentConfig } = useEnvironment()

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log(`🔄 Fetching dashboard data for ${currentConfig.name}...`)
      
      const dashboardData = await dashboardApiService.getDashboardStats()
      setStats(dashboardData)
      setRecentBookings(dashboardData.recentBookings)
      
      toast.success(`Dashboard data loaded from ${currentConfig.name}`)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
      toast.error(`Failed to load data from ${currentConfig.name}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when component mounts or environment changes
  useEffect(() => {
    fetchDashboardData()
  }, [currentEnvironment])

  // Format stats for display
  const formatStats = () => {
    if (!stats) return []
    
    return [
      {
        title: 'Total Users',
        value: stats.totalUsers.toLocaleString(),
        icon: <span className="text-2xl">👥</span>,
        change: { value: '+12% from last month', type: 'increase' as const }
      },
      {
        title: 'Active Events',
        value: stats.activeEvents.toString(),
        icon: <span className="text-2xl">📅</span>,
        change: { value: '+3 new this week', type: 'increase' as const }
      },
      {
        title: 'Total Revenue',
        value: `₹${stats.totalRevenue.toLocaleString()}`,
        icon: <span className="text-2xl">💰</span>,
        change: { 
          value: `+${stats.totalEarnings.growthPercentage}% from last month`, 
          type: 'increase' as const 
        }
      },
      {
        title: 'Conversion Rate',
        value: `${stats.conversionRate}%`,
        icon: <span className="text-2xl">📈</span>,
        change: { value: '+0.5% from last month', type: 'increase' as const }
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'text-green-400 bg-green-400/20'
      case 'Pending':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'Cancelled':
        return 'text-red-400 bg-red-400/20'
      default:
        return 'text-white/60 bg-white/10'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-2">Loading dashboard data...</p>
        </div>

        {/* Environment Indicator */}
        <EnvironmentIndicator />

        {/* Loading Stats Grid */}
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="admin-card p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-white/10"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Table */}
        <AdminCard title="Recent Bookings">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 bg-white/20 rounded w-16"></div>
                <div className="h-4 bg-white/20 rounded w-32"></div>
                <div className="h-4 bg-white/20 rounded w-24"></div>
                <div className="h-4 bg-white/20 rounded w-20"></div>
                <div className="h-4 bg-white/20 rounded w-16"></div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-2">Error loading dashboard data</p>
        </div>

        {/* Environment Indicator */}
        <EnvironmentIndicator />

        {/* Error Card */}
        <AdminCard>
          <div className="text-center py-8">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-white text-lg font-semibold mb-2">Failed to Load Dashboard Data</h3>
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </AdminCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-2">
            Welcome back! Here's what's happening with your events from {currentConfig.name}.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Environment Indicator */}
      <EnvironmentIndicator />

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {formatStats().map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      {/* Recent Bookings */}
      <AdminCard 
        title="Recent Bookings" 
        headerAction={
          <span className="text-sm text-white/60">
            {recentBookings.length} bookings
          </span>
        }
      >
        {recentBookings.length > 0 ? (
          <AdminTable headers={['Booking ID', 'Event', 'User', 'Amount', 'Status', 'Date']}>
            {recentBookings.map((booking) => (
              <AdminTableRow key={booking.id}>
                <AdminTableCell className="font-mono text-primary">
                  {booking.id}
                </AdminTableCell>
                <AdminTableCell className="font-medium">
                  {booking.eventName}
                </AdminTableCell>
                <AdminTableCell>
                  {booking.userName}
                </AdminTableCell>
                <AdminTableCell className="font-semibold">
                  {booking.amount}
                </AdminTableCell>
                <AdminTableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </AdminTableCell>
                <AdminTableCell className="text-white/60 text-sm">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        ) : (
          <div className="text-center py-8">
            <div className="text-white/40 text-4xl mb-4">📋</div>
            <h3 className="text-white text-lg font-semibold mb-2">No Recent Bookings</h3>
            <p className="text-white/60">No bookings found in the current environment.</p>
          </div>
        )}
      </AdminCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-2xl">📅</span>
            </div>
            <h3 className="text-white font-semibold">Create Event</h3>
            <p className="text-white/60 text-sm mt-1">Add a new event</p>
          </div>
        </AdminCard>

        <AdminCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-2xl">👥</span>
            </div>
            <h3 className="text-white font-semibold">Manage Users</h3>
            <p className="text-white/60 text-sm mt-1">View all users</p>
          </div>
        </AdminCard>

        <AdminCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-2xl">💰</span>
            </div>
            <h3 className="text-white font-semibold">View Reports</h3>
            <p className="text-white/60 text-sm mt-1">Financial reports</p>
          </div>
        </AdminCard>

        <AdminCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-2xl">📈</span>
            </div>
            <h3 className="text-white font-semibold">Analytics</h3>
            <p className="text-white/60 text-sm mt-1">View insights</p>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
