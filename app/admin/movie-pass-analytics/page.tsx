'use client'

import { useState, useEffect } from 'react'
import { moviePassAnalyticsApi } from '@/lib/moviePassAnalyticsApi'
import MetricCard from '@/components/analytics/MetricCard'
import SimpleLineChart from '@/components/charts/SimpleLineChart'
import SimpleBarChart from '@/components/charts/SimpleBarChart'
import SimplePieChart from '@/components/charts/SimplePieChart'
import toast from 'react-hot-toast'

export default function MoviePassAnalyticsOverview() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalPasses: 0,
    usedPasses: 0,
    totalRevenue: 0,
    usageRate: 0,
    growth: 0
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [planData, setPlanData] = useState<any[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Load overview metrics
      const overviewData = await moviePassAnalyticsApi.getOverviewMetrics()
      setMetrics(overviewData)

      // Load plan comparison
      const planComparison = await moviePassAnalyticsApi.getPlanComparison()
      if (planComparison && Array.isArray(planComparison)) {
        setPlanData(planComparison.map((plan: any) => ({
          label: plan._id === 'SILVER' ? 'Silver' : 'Gold',
          value: plan.totalRevenue || 0,
          color: plan._id === 'SILVER' ? '#C0C0C0' : '#FFD700'
        })))
      }

      // Mock revenue trend data (replace with actual API call)
      setRevenueData([
        { label: 'Mon', value: 12000 },
        { label: 'Tue', value: 15000 },
        { label: 'Wed', value: 18000 },
        { label: 'Thu', value: 14000 },
        { label: 'Fri', value: 22000 },
        { label: 'Sat', value: 28000 },
        { label: 'Sun', value: 25000 },
      ])

    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Movie Pass Analytics</h1>
          <p className="text-white/60 mt-1">Overview of all movie pass metrics</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-primary hover:bg-primary/80 text-black font-medium rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Movie Passes"
          value={metrics.totalPasses.toLocaleString()}
          icon="📦"
          change={metrics.growth}
          color="blue"
        />
        <MetricCard
          title="Used Passes"
          value={metrics.usedPasses.toLocaleString()}
          icon="✅"
          change={8}
          color="green"
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${(metrics.totalRevenue / 1000).toFixed(1)}K`}
          icon="💰"
          change={15}
          color="yellow"
        />
        <MetricCard
          title="Usage Rate"
          value={`${metrics.usageRate.toFixed(1)}%`}
          icon="📈"
          change={2.1}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Revenue Trend (7 Days)</h2>
            <select className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <SimpleLineChart 
            data={revenueData}
            height={250}
          />
        </div>

        {/* Plan Distribution */}
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Plan Distribution</h2>
          {planData.length > 0 ? (
            <SimplePieChart 
              data={planData}
              size={250}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-white/50">
              No plan data available
            </div>
          )}
        </div>
      </div>

      {/* Batch Performance */}
      <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top 5 Performing Batches</h2>
        <SimpleBarChart 
          data={[
            { label: 'Oct-001', value: 85, color: '#10B981' },
            { label: 'Oct-002', value: 72, color: '#3B82F6' },
            { label: 'Oct-003', value: 68, color: '#F59E0B' },
            { label: 'Oct-004', value: 55, color: '#EF4444' },
            { label: 'Oct-005', value: 45, color: '#8B5CF6' },
          ]}
          height={250}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 font-medium py-3 px-4">User</th>
                <th className="text-left text-white/60 font-medium py-3 px-4">Plan</th>
                <th className="text-left text-white/60 font-medium py-3 px-4">Passes</th>
                <th className="text-left text-white/60 font-medium py-3 px-4">Amount</th>
                <th className="text-left text-white/60 font-medium py-3 px-4">Status</th>
                <th className="text-left text-white/60 font-medium py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock data - replace with actual API data */}
              {[
                { user: 'John Doe', plan: 'Silver', passes: 3, amount: 1500, status: 'Active', date: '10/10/25' },
                { user: 'Sarah M', plan: 'Gold', passes: 5, amount: 3000, status: 'Active', date: '10/10/25' },
                { user: 'Mike R', plan: 'Silver', passes: 2, amount: 1000, status: 'Active', date: '09/10/25' },
              ].map((transaction, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="text-white py-3 px-4">{transaction.user}</td>
                  <td className="text-white py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.plan === 'Silver' 
                        ? 'bg-gray-500/20 text-gray-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {transaction.plan}
                    </span>
                  </td>
                  <td className="text-white py-3 px-4">{transaction.passes}</td>
                  <td className="text-white py-3 px-4">₹{transaction.amount.toLocaleString()}</td>
                  <td className="text-white py-3 px-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="text-white/60 py-3 px-4">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

