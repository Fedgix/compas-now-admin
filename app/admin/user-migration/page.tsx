'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { userMigrationApiService } from '@/lib/userMigrationApi'

interface User {
  _id: string
  name: string
  email: string
  phone: string
}

interface Plan {
  _id: string
  planId: string
  name: string
  displayName: string
  pricing: {
    couponPrice: number
    basePrice: number
    couponCount: number
  }
  isActive: boolean
  soldOut?: boolean
  soldOutReason?: string
}

interface Bundle {
  _id: string
  bundleId: string
  couponCount: number
  remainingCoupons: number
  generatedCoupons: number
  purchasedAt: string
  expiresAt: string
  status: string
  pricing?: {
    couponPrice: number
    subtotal: number
    convenienceFee: number
    totalAmount: number
    totalSavings: number
  }
  paymentId?: string
  planId?: string
  createdAt?: string
  updatedAt?: string
}

interface UserForMigration {
  userId: string
  user: User
  currentPlan: Plan
  bundles: Bundle[]
  totalRemainingCoupons: number
  totalGeneratedCoupons: number
  totalCouponCount: number
}

interface Batch {
  _id: string
  batchId: string
  batchName: string
  planId: string
  planType: string
  availableMoviePasses: number
  totalMoviePasses: number
  allocatedMoviePasses: number
  importedAt: string
  expiryDays: number
  expiryDate: string
}

export default function UserMigrationPage() {
  const [users, setUsers] = useState<UserForMigration[]>([])
  const [selectedUser, setSelectedUser] = useState<UserForMigration | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [sourcePlan, setSourcePlan] = useState<Plan | null>(null)
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    if (sourcePlan) {
      loadUsers(sourcePlan._id)
    } else {
      setUsers([])
      setSelectedUser(null)
      setSelectedBundle(null)
    }
  }, [sourcePlan])

  useEffect(() => {
    if (targetPlan) {
      loadBatches(targetPlan._id)
    } else {
      setBatches([])
      setSelectedBatch(null)
    }
  }, [targetPlan])

  const loadUsers = async (sourcePlanId: string) => {
    try {
      setLoadingUsers(true)
      const usersData = await userMigrationApiService.getUsersForMigration(sourcePlanId)
      setUsers(usersData)
      setSelectedUser(null)
      setSelectedBundle(null)
      if (usersData.length > 0) {
        toast.success(`Loaded ${usersData.length} users eligible for migration`)
      } else {
        toast('No users found with remaining coupons in this plan', { icon: 'ℹ️' })
      }
    } catch (error: any) {
      console.error('Failed to load users:', error)
      toast.error(error.message || 'Failed to load users for migration')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadPlans = async () => {
    try {
      const plansData = await userMigrationApiService.getAvailablePlans()
      setPlans(plansData)
    } catch (error: any) {
      console.error('Failed to load plans:', error)
      toast.error(error.message || 'Failed to load available plans')
    }
  }

  const loadBatches = async (planId: string) => {
    try {
      setLoadingBatches(true)
      const batchesData = await userMigrationApiService.getBatchesForPlan(planId)
      setBatches(batchesData)
      setSelectedBatch(null) // Reset selection when batches change
    } catch (error: any) {
      console.error('Failed to load batches:', error)
      toast.error(error.message || 'Failed to load batches for plan')
      setBatches([])
    } finally {
      setLoadingBatches(false)
    }
  }

  const handleSelectUser = (user: UserForMigration) => {
    setSelectedUser(user)
    setSelectedBundle(null)
    // Auto-select first bundle if available
    if (user.bundles.length > 0) {
      setSelectedBundle(user.bundles[0])
    }
  }

  const handleMigrate = async () => {
    if (!selectedUser || !selectedBundle || !targetPlan || !selectedBatch) {
      toast.error('Please select user, bundle, target plan, and batch')
      return
    }

    if (!sourcePlan) {
      toast.error('Source plan is required')
      return
    }

    if (sourcePlan._id === targetPlan._id) {
      toast.error('Source plan and target plan cannot be the same')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to migrate user "${selectedUser.user.name}" from ${selectedUser.currentPlan.displayName} to ${targetPlan.displayName}?\n\n` +
      `Bundle: ${selectedBundle.bundleId}\n` +
      `Remaining Coupons: ${selectedBundle.remainingCoupons}\n` +
      `Source Plan: ${sourcePlan.displayName}\n` +
      `Target Plan: ${targetPlan.displayName}\n` +
      `Target Batch: ${selectedBatch.batchName}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setMigrating(true)
      const result = await userMigrationApiService.migrateUser(
        selectedUser.userId,
        selectedBundle.bundleId,
        targetPlan._id,
        selectedBatch._id
      )

      toast.success(`User migrated successfully! Bundle: ${result.bundle?.bundleId || (result as any).newBundle?.bundleId || 'N/A'}`)
      
      // Reload users to reflect changes
      if (sourcePlan) {
        await loadUsers(sourcePlan._id)
      }
      
      // Reset selections
      setSelectedUser(null)
      setSelectedBundle(null)
      setSelectedBatch(null)
    } catch (error: any) {
      console.error('Migration failed:', error)
      toast.error(error.message || 'Failed to migrate user')
    } finally {
      setMigrating(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">User Migration</h1>
          <p className="text-gray-400">Migrate users from one plan to another</p>
        </div>

        {/* Plan Selection Section */}
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Plan Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Source Plan
              </label>
              <select
                value={sourcePlan?._id || ''}
                onChange={(e) => {
                  const plan = plans.find(p => p._id === e.target.value)
                  setSourcePlan(plan || null)
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
              >
                <option value="">Select source plan</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.displayName} {plan.soldOut ? '(Sold Out)' : ''} {!plan.isActive ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
              {sourcePlan && (
                <div className="mt-2 p-3 bg-gray-700/50 rounded-lg text-sm">
                  <p className="text-gray-300"><span className="text-gray-400">Plan:</span> {sourcePlan.displayName}</p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Status:</span> {sourcePlan.isActive ? 'Active' : 'Inactive'} 
                    {sourcePlan.soldOut && ' • Sold Out'}
                  </p>
                </div>
              )}
            </div>

            {/* Target Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Target Plan
              </label>
              <select
                value={targetPlan?._id || ''}
                onChange={(e) => {
                  const plan = plans.find(p => p._id === e.target.value)
                  setTargetPlan(plan || null)
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
              >
                <option value="">Select target plan</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id} disabled={plan._id === sourcePlan?._id}>
                    {plan.displayName} {plan.soldOut ? '(Sold Out)' : ''} {!plan.isActive ? '(Inactive)' : ''}
                    {plan._id === sourcePlan?._id ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
              {targetPlan && (
                <div className="mt-2 p-3 bg-gray-700/50 rounded-lg text-sm">
                  <p className="text-gray-300"><span className="text-gray-400">Plan:</span> {targetPlan.displayName}</p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Status:</span> {targetPlan.isActive ? 'Active' : 'Inactive'} 
                    {targetPlan.soldOut && ' • Sold Out'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Users List */}
          <div className="bg-gray-800/50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white">Users for Migration</h2>
              {sourcePlan && (
                <button
                  onClick={() => loadUsers(sourcePlan._id)}
                  disabled={loadingUsers}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {loadingUsers ? 'Loading...' : 'Refresh'}
                </button>
              )}
            </div>

            {!sourcePlan ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Please select a source plan first</p>
              </div>
            ) : loadingUsers ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No users found with remaining coupons in this plan</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleSelectUser(user)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedUser?.userId === user.userId
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-gray-700/50 border-2 border-transparent hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{user.user.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{user.user.email}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-300">
                            Plan: <span className="text-primary">{user.currentPlan.displayName}</span>
                          </span>
                          <span className="text-gray-300">
                            Remaining: <span className="text-green-400">{user.totalRemainingCoupons}</span>
                          </span>
                          <span className="text-gray-300">
                            Generated: <span className="text-yellow-400">{user.totalGeneratedCoupons}</span>
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Bundles: {user.bundles.length}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Migration Details */}
          <div className="bg-gray-800/50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Migration Details</h2>

            {selectedUser ? (
              <div className="space-y-6">
                {/* Selected User Info */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Selected User</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300"><span className="text-gray-400">Name:</span> {selectedUser.user.name}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Email:</span> {selectedUser.user.email}</p>
                    <p className="text-gray-300"><span className="text-gray-400">Phone:</span> {selectedUser.user.phone || 'N/A'}</p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Current Plan:</span> {selectedUser.currentPlan.displayName}
                    </p>
                  </div>
                </div>

                {/* Bundle Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Bundle
                  </label>
                  <select
                    value={selectedBundle?.bundleId || ''}
                    onChange={(e) => {
                      const bundle = selectedUser.bundles.find(b => b.bundleId === e.target.value)
                      setSelectedBundle(bundle || null)
                    }}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select a bundle</option>
                    {selectedUser.bundles.map((bundle) => (
                      <option key={bundle.bundleId} value={bundle.bundleId}>
                        {bundle.bundleId} - {bundle.remainingCoupons} remaining ({bundle.generatedCoupons} generated)
                      </option>
                    ))}
                  </select>
                  {selectedBundle && (
                    <div className="mt-2 p-4 bg-gray-700/50 rounded-lg text-sm space-y-2">
                      <div className="border-b border-gray-600 pb-2">
                        <p className="text-white font-semibold mb-1">CouponBundlePurchase Details</p>
                        <p className="text-gray-300 text-xs break-all">
                          <span className="text-gray-400">ID:</span> {selectedBundle._id}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-gray-300">
                          <span className="text-gray-400">Bundle ID:</span> {selectedBundle.bundleId}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Status:</span> {selectedBundle.status}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Coupon Count:</span> {selectedBundle.couponCount}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Remaining:</span> 
                          <span className="text-green-400 ml-1">{selectedBundle.remainingCoupons}</span>
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Generated:</span> 
                          <span className="text-yellow-400 ml-1">{selectedBundle.generatedCoupons}</span>
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Purchased:</span> {formatDate(selectedBundle.purchasedAt)}
                        </p>
                        <p className="text-gray-300 col-span-2">
                          <span className="text-gray-400">Expires:</span> {formatDate(selectedBundle.expiresAt)}
                        </p>
                      </div>
                      {selectedBundle.pricing && (
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <p className="text-white font-semibold mb-1">Pricing Details</p>
                          <div className="grid grid-cols-2 gap-2">
                            <p className="text-gray-300">
                              <span className="text-gray-400">Coupon Price:</span> ₹{selectedBundle.pricing.couponPrice}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Subtotal:</span> ₹{selectedBundle.pricing.subtotal}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Convenience Fee:</span> ₹{selectedBundle.pricing.convenienceFee}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400">Total Amount:</span> ₹{selectedBundle.pricing.totalAmount}
                            </p>
                            {selectedBundle.pricing.totalSavings > 0 && (
                              <p className="text-gray-300 col-span-2">
                                <span className="text-gray-400">Total Savings:</span> 
                                <span className="text-green-400 ml-1">₹{selectedBundle.pricing.totalSavings}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {(selectedBundle.paymentId || selectedBundle.planId) && (
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <p className="text-white font-semibold mb-1">References</p>
                          <div className="space-y-1">
                            {selectedBundle.paymentId && (
                              <p className="text-gray-300 text-xs break-all">
                                <span className="text-gray-400">Payment ID:</span> {selectedBundle.paymentId}
                              </p>
                            )}
                            {selectedBundle.planId && (
                              <p className="text-gray-300 text-xs break-all">
                                <span className="text-gray-400">Plan ID:</span> {selectedBundle.planId}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {(selectedBundle.createdAt || selectedBundle.updatedAt) && (
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <p className="text-white font-semibold mb-1">Timestamps</p>
                          <div className="space-y-1">
                            {selectedBundle.createdAt && (
                              <p className="text-gray-300 text-xs">
                                <span className="text-gray-400">Created:</span> {formatDate(selectedBundle.createdAt)}
                              </p>
                            )}
                            {selectedBundle.updatedAt && (
                              <p className="text-gray-300 text-xs">
                                <span className="text-gray-400">Updated:</span> {formatDate(selectedBundle.updatedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Target Plan Selection */}
                {!targetPlan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Target Plan
                    </label>
                    <select
                      value={(targetPlan as Plan | null)?._id || ''}
                      onChange={(e) => {
                        const plan = plans.find((p: Plan) => p._id === e.target.value) as Plan | undefined
                        setTargetPlan(plan || null)
                      }}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none"
                    >
                      <option value="">Select target plan</option>
                      {plans.filter((p: Plan) => p._id !== sourcePlan?._id).map((plan: Plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.displayName} - ₹{plan.pricing.couponPrice}/coupon
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetPlan && (
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-white font-semibold mb-1">Target Plan</p>
                    <p className="text-gray-300 text-sm">{targetPlan.displayName}</p>
                    <button
                      onClick={() => setTargetPlan(null)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Change Plan
                    </button>
                  </div>
                )}

                {/* Batch Selection */}
                {targetPlan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Batch
                      {loadingBatches && <span className="text-gray-500 ml-2">(Loading...)</span>}
                    </label>
                    <select
                      value={selectedBatch?._id || ''}
                      onChange={(e) => {
                        const batch = batches.find(b => b._id === e.target.value)
                        setSelectedBatch(batch || null)
                      }}
                      disabled={loadingBatches || batches.length === 0}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Select a batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batchName} - {batch.availableMoviePasses} available
                        </option>
                      ))}
                    </select>
                    {selectedBatch && (
                      <div className="mt-2 p-3 bg-gray-700/50 rounded-lg text-sm">
                        <p className="text-gray-300"><span className="text-gray-400">Batch:</span> {selectedBatch.batchName}</p>
                        <p className="text-gray-300"><span className="text-gray-400">Available:</span> {selectedBatch.availableMoviePasses}</p>
                        <p className="text-gray-300"><span className="text-gray-400">Total:</span> {selectedBatch.totalMoviePasses}</p>
                        <p className="text-gray-300"><span className="text-gray-400">Expires:</span> {formatDate(selectedBatch.expiryDate)}</p>
                      </div>
                    )}
                  </div>
                )}

                {!targetPlan && (
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">Please select a target plan to see available batches</p>
                  </div>
                )}

                {/* Migrate Button */}
                <button
                  onClick={handleMigrate}
                  disabled={migrating || !selectedUser || !selectedBundle || !targetPlan || !selectedBatch || !sourcePlan}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {migrating ? 'Migrating...' : 'Migrate User'}
                </button>
                
                {(!sourcePlan || !targetPlan || !selectedUser || !selectedBundle || !selectedBatch) && (
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    {!sourcePlan && '• Select source plan'}
                    {!targetPlan && ' • Select target plan'}
                    {!selectedUser && ' • Select user'}
                    {!selectedBundle && ' • Select bundle'}
                    {!selectedBatch && ' • Select batch'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Select a user to view migration details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

