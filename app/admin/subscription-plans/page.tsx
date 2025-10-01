'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit, FiEye, FiTrash2, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { subscriptionPlanApi, type SubscriptionPlan } from '@/lib/subscriptionPlanApi'

export default function SubscriptionPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null)

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching subscription plans...')
      const response = await subscriptionPlanApi.getAllPlans({
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      })
      
      console.log('📦 API Response:', response)
      
      if (response.success) {
        console.log('✅ Plans data:', response.data)
        setPlans(response.data || [])
      } else {
        console.error('❌ API returned error:', response.message)
      }
    } catch (error) {
      console.error('❌ Error fetching subscription plans:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // Handle view plan
  const handleViewPlan = (planId: string) => {
    router.push(`/admin/subscription-plans/${planId}`)
  }

  // Handle edit plan
  const handleEditPlan = (planId: string) => {
    router.push(`/admin/subscription-plans/${planId}/edit`)
  }

  // Handle delete plan
  const handleDeletePlan = async (planId: string, planName: string) => {
    if (window.confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
      try {
        setDeletingPlan(planId)
        const response = await subscriptionPlanApi.deletePlan(planId)
        
        if (response.success) {
          // Remove the plan from the list
          setPlans(prev => prev.filter(plan => plan._id !== planId))
          console.log('✅ Plan deleted successfully')
        } else {
          console.error('❌ Failed to delete plan:', response.message)
          alert('Failed to delete plan. Please try again.')
        }
      } catch (error) {
        console.error('❌ Error deleting plan:', error)
        alert('An error occurred while deleting the plan. Please try again.')
      } finally {
        setDeletingPlan(null)
      }
    }
  }

  // Handle create plan
  const handleCreatePlan = () => {
    router.push('/admin/subscription-plans/create')
  }

  // Filter plans based on search and status
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.planId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && plan.isActive) ||
                         (filterStatus === 'inactive' && !plan.isActive)
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    )
  }

  const getPlanTypeBadge = (planId: string) => {
    const colors = {
      SILVER: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      GOLD: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[planId as keyof typeof colors]}`}>
        {planId}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white/60 mt-4">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Subscription Plans
                </h1>
                <p className="text-white/60 mt-2">
                  Manage cinema subscription plans and pricing
                </p>
              </div>
              <button
                onClick={handleCreatePlan}
                className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Plan</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-white/60"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchPlans}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2 text-white"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6 hover:bg-black/70 transition-all duration-200"
              >
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getPlanTypeBadge(plan.planId)}
                    {getStatusBadge(plan.isActive)}
                  </div>
                </div>

                {/* Plan Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {plan.displayName}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/60">Coupon Price</span>
                    <span className="font-semibold text-white">
                      ₹{plan.pricing.couponPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/60">PVR Value</span>
                    <span className="font-semibold text-white">
                      ₹{plan.pricing.pvrCouponValue}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Convenience Fee</span>
                    <span className="font-semibold text-white">
                      {plan.pricing.convenienceFeePercentage}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewPlan(plan._id)}
                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 border border-primary/30"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => handleEditPlan(plan._id)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 border border-white/20"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan._id, plan.displayName)}
                    disabled={deletingPlan === plan._id}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingPlan === plan._id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPlans.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <FiFilter className="w-12 h-12 text-white/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No subscription plans found
              </h3>
              <p className="text-white/60 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first subscription plan to get started'
                }
              </p>
              {(!searchTerm && filterStatus === 'all') && (
                <button
                  onClick={handleCreatePlan}
                  className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create First Plan
                </button>
              )}
            </div>
          )}
    </div>
  )
}
