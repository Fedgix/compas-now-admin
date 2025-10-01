'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiEdit, FiTrash2, FiArrowLeft, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { subscriptionPlanApi, type SubscriptionPlan } from '@/lib/subscriptionPlanApi'

export default function SubscriptionPlanDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const response = await subscriptionPlanApi.getPlanById(params.id as string)
      
      if (response.success) {
        setPlan(response.data)
      }
    } catch (error) {
      console.error('Error fetching subscription plan:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchPlan()
    }
  }, [params.id])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await subscriptionPlanApi.deletePlan(params.id as string)

      if (response.success) {
        router.push('/admin/subscription-plans')
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    )
  }

  const getPlanTypeBadge = (planId: string) => {
    const colors = {
      SILVER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      GOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[planId as keyof typeof colors]}`}>
        {planId}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white/60 mt-4">Loading subscription plan...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">
          Plan not found
        </h3>
        <p className="text-white/60 mb-6">
          The subscription plan you're looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push('/admin/subscription-plans')}
          className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Plans
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {plan.displayName}
                  </h1>
                  <p className="text-white/60 mt-2">
                    Subscription plan details and configuration
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchPlan}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2 border border-white/20"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => router.push(`/admin/subscription-plans/${plan._id}/edit`)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center space-x-2 border border-red-500/30 hover:bg-red-500/30"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Basic Information
                  </h2>
                  <div className="flex items-center space-x-2">
                    {getPlanTypeBadge(plan.planId)}
                    {getStatusBadge(plan.isActive)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">
                      Display Name
                    </label>
                    <p className="text-white">{plan.displayName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">
                      Description
                    </label>
                    <p className="text-white/80">{plan.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Sort Order
                      </label>
                      <p className="text-white">{plan.sortOrder}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Created At
                      </label>
                      <p className="text-white/80">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Pricing Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">
                  Pricing Information
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Coupon Price
                      </label>
                      <p className="text-2xl font-bold text-white">
                        ₹{plan.pricing.couponPrice}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        PVR Coupon Value
                      </label>
                      <p className="text-lg font-semibold text-white">
                        ₹{plan.pricing.pvrCouponValue}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Convenience Fee
                      </label>
                      <p className="text-lg font-semibold text-white">
                        {plan.pricing.convenienceFeePercentage}%
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Currency
                      </label>
                      <p className="text-lg font-semibold text-white">
                        {plan.pricing.currency}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Detailed Information */}
              {plan.detailedInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6"
                >
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Detailed Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plan.detailedInfo.benefits && plan.detailedInfo.benefits.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-3">Benefits</h3>
                        <ul className="space-y-2">
                          {plan.detailedInfo.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-primary mt-1">•</span>
                              <span className="text-white/80">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.detailedInfo.validity && plan.detailedInfo.validity.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-3">Validity</h3>
                        <ul className="space-y-2">
                          {plan.detailedInfo.validity.map((validity, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span className="text-white/80">{validity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.detailedInfo.usage && plan.detailedInfo.usage.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-3">Usage Rules</h3>
                        <ul className="space-y-2">
                          {plan.detailedInfo.usage.map((usage, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span className="text-white/80">{usage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.detailedInfo.restrictions && plan.detailedInfo.restrictions.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-3">Restrictions</h3>
                        <ul className="space-y-2">
                          {plan.detailedInfo.restrictions.map((restriction, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span className="text-white/80">{restriction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* How to Use & Important Notes */}
              {(plan.howToUse?.length > 0 || plan.importantNotes?.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6"
                >
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Instructions & Notes
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plan.howToUse && plan.howToUse.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-3">How to Use</h3>
                        <ol className="space-y-2">
                          {plan.howToUse.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full mt-0.5 border border-primary/30">
                                {index + 1}
                              </span>
                              <span className="text-white/80">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {plan.importantNotes && plan.importantNotes.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-3">Important Notes</h3>
                        <ul className="space-y-2">
                          {plan.importantNotes.map((note, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-400 mt-1">⚠</span>
                              <span className="text-white/80">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/admin/subscription-plans/${plan._id}/edit`)}
                    className="w-full bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Edit Plan</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-red-500/30"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Plan</span>
                  </button>
                </div>
              </motion.div>

              {/* Plan Statistics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Plan Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">Status</span>
                    {getStatusBadge(plan.isActive)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Type</span>
                    {getPlanTypeBadge(plan.planId)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Last Updated</span>
                    <span className="text-white text-sm">
                      {new Date(plan.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 max-w-md w-full mx-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Delete Subscription Plan
                </h3>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete "{plan.displayName}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 text-red-400 rounded-lg transition-colors border border-red-500/30"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}
