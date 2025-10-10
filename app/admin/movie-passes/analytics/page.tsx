'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { authApiService } from '@/lib/authApi'
import { moviePassAnalyticsApi } from '@/lib/moviePassAnalyticsApi'
import { subscriptionPlanApi } from '@/lib/subscriptionPlanApi'
import { getCurrentConfig } from '@/lib/config'
import { useEnvironment } from '@/contexts/EnvironmentContext'

interface AnalyticsData {
  overview: {
    totalBatches: number
    totalCoupons: number
    totalUsed: number
    totalRevenue: number
    averageUtilization: number
    activeBatches: number
    expiringSoon: number
  }
  utilizationStats: any[]
  performanceStats: any[]
  insights: {
    totalBatches: number
    averageUtilization: number
    totalRevenue: number
    activeBatches: number
    expiringSoon: number
  }
}

interface BatchData {
  _id: string
  batchId: string
  batchName: string
  planType: string
  planId: string
  totalMoviePasses: number
  availableMoviePasses: number
  usedMoviePasses: number
  status: string
  batchStatus: string
  createdAt: string
  expiresAt: string
}

interface SubscriptionPlan {
  _id: string
  planId: string
  name: string
  displayName: string
  planType: string
  price: number
  isActive: boolean
}

// Version 3.0 - Added environment change listener
export default function MoviePassAnalyticsPage() {
  const router = useRouter()
  const { currentEnvironment, currentConfig } = useEnvironment()
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [batches, setBatches] = useState<BatchData[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [error, setError] = useState<string | null>(null)

  // Simple data loading function with useCallback to prevent infinite loops
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading analytics data...')
      
      // Load subscription plans
      console.log('📋 Loading subscription plans...')
      const plansResponse: any = await subscriptionPlanApi.getAllSubscriptionPlans()
      console.log('📋 Plans response:', plansResponse)
      
      // Handle both array response and {success, data} response
      if (Array.isArray(plansResponse)) {
        setSubscriptionPlans(plansResponse)
        console.log('✅ Plans loaded (array):', plansResponse)
      } else if (plansResponse && plansResponse.data && Array.isArray(plansResponse.data)) {
        setSubscriptionPlans(plansResponse.data)
        console.log('✅ Plans loaded (object):', plansResponse.data)
      } else {
        console.error('❌ Plans failed or invalid format:', plansResponse)
      }
      
      // Load batches
      console.log('📦 Loading batches...')
      const batchesResponse: any = await moviePassAnalyticsApi.getAllBatches()
      console.log('📦 Batches response:', batchesResponse)
      
      // Handle both array response and {status: 'success', data} response
      if (Array.isArray(batchesResponse)) {
        setBatches(batchesResponse)
        console.log('✅ Batches loaded (array):', batchesResponse)
      } else if (batchesResponse && batchesResponse.status === 'success' && batchesResponse.data) {
        setBatches(batchesResponse.data)
        console.log('✅ Batches loaded (object):', batchesResponse.data)
      } else if (batchesResponse && batchesResponse.data && Array.isArray(batchesResponse.data)) {
        setBatches(batchesResponse.data)
        console.log('✅ Batches loaded (object with data):', batchesResponse.data)
      } else {
        console.error('❌ Batches failed or invalid format:', batchesResponse)
      }
      
    } catch (err) {
      console.error('❌ Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array for useCallback

  // Load data on component mount and when environment changes
  useEffect(() => {
    loadData()
  }, [currentEnvironment, loadData]) // Reload when environment changes
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiTrendingUp className="h-6 w-6 text-blue-400" />
          Movie Pass Analytics
        </h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md transition-colors"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-md">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-md">
        <h3 className="text-blue-400 font-medium mb-2">Debug Info:</h3>
        <p className="text-blue-300 text-sm">Loading: {loading ? 'Yes' : 'No'}</p>
        <p className="text-blue-300 text-sm">Plans Count: {subscriptionPlans.length}</p>
        <p className="text-blue-300 text-sm">Batches Count: {batches.length}</p>
        <p className="text-blue-300 text-sm">Error: {error || 'None'}</p>
        <p className="text-blue-300 text-sm">API Base URL: {getCurrentConfig().baseUrl}</p>
        <p className="text-blue-300 text-sm">Auth Status: {authApiService.isAuthenticated() ? 'Authenticated' : 'Not authenticated'}</p>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Plans */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Subscription Plans</h2>
          <div className="space-y-3">
            {subscriptionPlans.length > 0 ? (
              subscriptionPlans.map((plan, index) => (
                <div key={plan._id || plan.id || `plan-${index}`} className="p-3 bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-white">{plan.displayName || plan.name}</h3>
                  <p className="text-sm text-gray-400">{plan.planType} - ₹{plan.price}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                <p>No subscription plans found</p>
                <p className="text-sm mt-1">Check console for API response details</p>
              </div>
            )}
          </div>
        </div>

        {/* Batches */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Movie Pass Batches</h2>
          <div className="space-y-3">
            {batches.length > 0 ? (
              batches.slice(0, 5).map((batch, index) => (
                <div key={batch._id || batch.id || `batch-${index}`} className="p-3 bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-white">{batch.batchName}</h3>
                  <p className="text-sm text-gray-400">{batch.planType} - {batch.planId}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Total</p>
                      <p className="text-white font-medium">{batch.totalMoviePasses}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Used</p>
                      <p className="text-white font-medium">{batch.usedMoviePasses || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Available</p>
                      <p className="text-white font-medium">{batch.availableMoviePasses}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(batch.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                <p>No movie pass batches found</p>
                <p className="text-sm mt-1">Check console for API response details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}