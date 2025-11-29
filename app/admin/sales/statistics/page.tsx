'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { salesApi, type SalesStatistics } from '../../../../lib/salesApi'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { useEnvironment } from '../../../../contexts/EnvironmentContext'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all'

export default function SalesStatisticsPage() {
  const [statistics, setStatistics] = useState<SalesStatistics | null>(null)
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

      const response = await salesApi.getSalesStatistics(params) as any

      if (response.status === 'success') {
        setStatistics(response.data)
      } else {
        setError(response.message || 'Failed to fetch sales statistics')
        toast.error(response.message || 'Failed to fetch sales statistics')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sales statistics'
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

      const blob = await salesApi.getSalesStatistics(params) as Blob

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-statistics-${period}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Sales statistics exported successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to export sales statistics')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [currentConfig])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Statistics</h1>
          <p className="text-white/60">Movie passes sold, revenue, and subscription statistics</p>
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

      {/* Statistics Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      ) : statistics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-white/60 mb-2">Total Movie Passes Sold</div>
              <div className="text-3xl font-bold text-white">{statistics.totalMoviePassesSold.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-white/60 mb-2">Total Revenue from Movie Passes</div>
              <div className="text-3xl font-bold text-white">₹{statistics.totalRevenueFromMoviePass.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-white/60 mb-2">Total Subscriptions Taken</div>
              <div className="text-3xl font-bold text-white">{statistics.totalSubscriptionsTaken.toLocaleString()}</div>
            </div>
          </div>

          {/* Plan Breakdown */}
          {statistics.planBreakdown && statistics.planBreakdown.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Plan Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Plan Name</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Plan Type</th>
                      <th className="text-right py-3 px-4 text-white/80 font-medium">Subscriptions</th>
                      <th className="text-right py-3 px-4 text-white/80 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.planBreakdown.map((plan, index) => (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="py-3 px-4 text-white">{plan.planName}</td>
                        <td className="py-3 px-4 text-white/60">{plan.planType}</td>
                        <td className="py-3 px-4 text-right text-white">{plan.subscriptionCount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-white">₹{plan.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-white/60">
          No sales statistics found for the selected period
        </div>
      )}
    </div>
  )
}

