'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { userApi, type UserStatisticsDetailed } from '../../../../lib/userApi'
import AdminTable from '../../../../components/AdminTable'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { useEnvironment } from '../../../../contexts/EnvironmentContext'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all'

export default function UserStatisticsPage() {
  const [statistics, setStatistics] = useState<UserStatisticsDetailed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('all')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const { currentConfig } = useEnvironment()

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: any = { period }
      
      if (period === 'custom') {
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates for custom period')
          return
        }
        params.startDate = startDate
        params.endDate = endDate
      } else if (period !== 'all') {
        params.date = date
      }

      const response = await userApi.getUserStatisticsDetailed(params) as any

      if (response.status === 'success') {
        setStatistics(response.data)
      } else {
        setError(response.message || 'Failed to fetch user statistics')
        toast.error(response.message || 'Failed to fetch user statistics')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user statistics'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const params: any = { period, download: true }
      
      if (period === 'custom') {
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates for custom period')
          return
        }
        params.startDate = startDate
        params.endDate = endDate
      } else if (period !== 'all') {
        params.date = date
      }

      const blob = await userApi.getUserStatisticsDetailed(params) as Blob

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-statistics-${period}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('User statistics exported successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to export user statistics')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [currentConfig])

  const tableColumns = [
    { key: 'customerName', label: 'Customer Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'emailId', label: 'Email ID' },
    { key: 'city', label: 'City' },
    { key: 'cinemaPassTakenCount', label: 'Cinema Pass Count' },
    { key: 'eventTicketBookedCount', label: 'Event Ticket Count' },
    { key: 'totalAmountSpentForMovies', label: 'Total (Movies)' },
    { key: 'totalAmountSpentForEvents', label: 'Total (Events)' }
  ]

  const tableData = statistics.map((stat, index) => ({
    customerName: stat.customerName,
    mobile: stat.mobile,
    emailId: stat.emailId,
    city: stat.city,
    cinemaPassTakenCount: stat.cinemaPassTakenCount,
    eventTicketBookedCount: stat.eventTicketBookedCount,
    totalAmountSpentForMovies: `₹${stat.totalAmountSpentForMovies.toFixed(2)}`,
    totalAmountSpentForEvents: `₹${stat.totalAmountSpentForEvents.toFixed(2)}`
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">User Statistics</h1>
          <p className="text-white/60">Detailed user statistics with cinema passes and event bookings</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="btn-secondary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <LoadingSpinner size="sm" />
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-white/80 mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {period !== 'all' && period !== 'custom' && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-white/80 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {period === 'custom' && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-white/80 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-white/80 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={fetchStatistics}
            disabled={isLoading}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Apply'}
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      {statistics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-white/60">Total Users</div>
            <div className="text-2xl font-bold text-white">{statistics.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-white/60">Total Cinema Passes</div>
            <div className="text-2xl font-bold text-white">
              {statistics.reduce((sum, s) => sum + s.cinemaPassTakenCount, 0)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-white/60">Total Event Tickets</div>
            <div className="text-2xl font-bold text-white">
              {statistics.reduce((sum, s) => sum + s.eventTicketBookedCount, 0)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-white/60">Total Revenue</div>
            <div className="text-2xl font-bold text-white">
              ₹{statistics.reduce((sum, s) => sum + s.totalAmountSpentForMovies + s.totalAmountSpentForEvents, 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      ) : statistics.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-white/60">
          No user statistics found for the selected period
        </div>
      ) : (
        <AdminTable columns={tableColumns} data={tableData} />
      )}
    </div>
  )
}

