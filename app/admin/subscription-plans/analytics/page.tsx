'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiUsers, FiDollarSign, FiBarChart, FiRefreshCw } from 'react-icons/fi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { subscriptionPlanApi } from '@/lib/subscriptionPlanApi'

interface AnalyticsData {
  bundleStats: {
    totalBundles: number
    totalRevenue: number
    averageBundleValue: number
    bundlesThisMonth: number
  }
  planComparison: {
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
  }
  utilizationStats: {
    totalCouponsGenerated: number
    totalCouponsUsed: number
    utilizationRate: number
    unusedCoupons: number
  }
}

export default function SubscriptionPlansAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch all analytics data in parallel
      const [bundleStatsResponse, planComparisonResponse, utilizationResponse] = await Promise.all([
        subscriptionPlanApi.analytics.getBundleStats(),
        subscriptionPlanApi.analytics.getPlanComparison(),
        subscriptionPlanApi.analytics.getUtilizationStats()
      ])
      
      setAnalytics({
        bundleStats: bundleStatsResponse.data || {
          totalBundles: 0,
          totalRevenue: 0,
          averageBundleValue: 0,
          bundlesThisMonth: 0
        },
        planComparison: planComparisonResponse.data || {
          silver: { totalPurchases: 0, totalRevenue: 0, averageValue: 0 },
          gold: { totalPurchases: 0, totalRevenue: 0, averageValue: 0 }
        },
        utilizationStats: utilizationResponse.data || {
          totalCouponsGenerated: 0,
          totalCouponsUsed: 0,
          utilizationRate: 0,
          unusedCoupons: 0
        }
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Subscription Plans Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Performance metrics and insights for subscription plans
                </p>
              </div>
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Bundle Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bundles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.bundleStats.totalBundles || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <FiBarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{analytics?.bundleStats.totalRevenue || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bundle Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{analytics?.bundleStats.averageBundleValue || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <FiTrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.bundleStats.bundlesThisMonth || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <FiUsers className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Plan Comparison
              </h2>
              
              <div className="space-y-6">
                {/* Silver Plan */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Silver Plan</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm">
                      SILVER
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.planComparison.silver.totalPurchases || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Purchases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{analytics?.planComparison.silver.totalRevenue || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{analytics?.planComparison.silver.averageValue || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value</p>
                    </div>
                  </div>
                </div>

                {/* Gold Plan */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gold Plan</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm">
                      GOLD
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.planComparison.gold.totalPurchases || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Purchases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{analytics?.planComparison.gold.totalRevenue || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{analytics?.planComparison.gold.averageValue || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Value</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Utilization Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Coupon Utilization
              </h2>
              
              <div className="space-y-6">
                {/* Utilization Rate */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray={`${analytics?.utilizationStats.utilizationRate || 0}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.utilizationStats.utilizationRate || 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.utilizationStats.totalCouponsGenerated || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Generated</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.utilizationStats.totalCouponsUsed || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Used</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.utilizationStats.unusedCoupons || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unused</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics?.utilizationStats.utilizationRate || 0}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rate</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
    </div>
  )
}
