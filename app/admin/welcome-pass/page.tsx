'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FiSettings, FiToggleLeft, FiToggleRight, FiSave, FiRefreshCw, FiCheck, FiX, FiPlus, FiTrash2, FiInfo, FiFilter, FiSearch, FiUser, FiPackage } from 'react-icons/fi'
import { welcomePassApi, WelcomePassConfig, WelcomePassStats, BatchInfo, WelcomePassAllocation, AllocationStatistics, CouponPlan } from '@/lib/welcomePassApi'
import AdminCard from '@/components/AdminCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatCard from '@/components/StatCard'

export default function WelcomePassPage() {
  console.log('🎬 [WELCOME_PASS_PAGE] Component rendered!')
  
  const [config, setConfig] = useState<WelcomePassConfig | null>(null)
  const [stats, setStats] = useState<WelcomePassStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [showBatchManagement, setShowBatchManagement] = useState(false)
  const [availableBatches, setAvailableBatches] = useState<BatchInfo[]>([])
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([])
  const [loadingBatches, setLoadingBatches] = useState(false)
  
  // Allocation tracking state
  const [showAllocations, setShowAllocations] = useState(false)
  const [allocations, setAllocations] = useState<WelcomePassAllocation[]>([])
  const [allocationStats, setAllocationStats] = useState<AllocationStatistics | null>(null)
  const [loadingAllocations, setLoadingAllocations] = useState(false)
  const [allocationFilters, setAllocationFilters] = useState({
    userId: '',
    batchId: '',
    planType: '',
    status: '',
    startDate: '',
    endDate: '',
    limit: 50
  })
  
  // Available coupon plans
  const [availablePlans, setAvailablePlans] = useState<CouponPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    maxAllocations: 0,
    couponCount: 1,
    expiresInHours: 24,
    planType: 'SILVER' as 'SILVER' | 'GOLD' | 'BRONZE'
  })

  useEffect(() => {
    loadData()
    loadAvailablePlans()
  }, [])
  
  const loadAvailablePlans = async () => {
    try {
      setLoadingPlans(true)
      console.log('📋 [WELCOME_PASS_PAGE] Loading available coupon plans...')
      const plans = await welcomePassApi.getAvailableCouponPlans()
      console.log('📋 [WELCOME_PASS_PAGE] Available plans:', plans)
      setAvailablePlans(plans || [])
      
      // If no planType is set in config, use the first available plan
      if (plans && plans.length > 0 && !formData.planType) {
        const firstPlan = plans[0]
        setFormData(prev => ({ ...prev, planType: firstPlan.planId as 'SILVER' | 'GOLD' | 'BRONZE' }))
      }
    } catch (error: any) {
      console.error('❌ [WELCOME_PASS_PAGE] Error loading plans:', error)
      toast.error(error.message || 'Failed to load available plans')
    } finally {
      setLoadingPlans(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [configData, statsData] = await Promise.all([
        welcomePassApi.getConfig(),
        welcomePassApi.getStats()
      ])
      setConfig(configData)
      setStats(statsData)
      
      // Initialize form data
      if (configData.config) {
        setFormData({
          startDate: configData.config.startDate ? new Date(configData.config.startDate).toISOString().slice(0, 16) : '',
          endDate: configData.config.endDate ? new Date(configData.config.endDate).toISOString().slice(0, 16) : '',
          maxAllocations: configData.config.maxAllocations || 0,
          couponCount: configData.config.couponCount || 1,
          expiresInHours: configData.config.expiresInHours || 24,
          planType: configData.config.planType || 'SILVER'
        })
        setSelectedBatchIds(configData.config.allowedBatchIds || [])
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load welcome pass data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!config) return
    
    try {
      setSaving(true)
      const newConfig = await welcomePassApi.toggleWelcomePass(!config.isEnabled)
      setConfig(newConfig)
      toast.success(`Welcome pass ${newConfig.isEnabled ? 'enabled' : 'disabled'} successfully`)
      await loadData() // Reload stats
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle welcome pass')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setSaving(true)
      const updatedConfig = await welcomePassApi.updateConfig({
        config: {
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          maxAllocations: formData.maxAllocations,
          couponCount: formData.couponCount,
          expiresInHours: formData.expiresInHours,
          planType: formData.planType,
          allowedBatchIds: selectedBatchIds,
          allocatedCount: config?.config.allocatedCount || 0
        }
      })
      setConfig(updatedConfig)
      setShowConfigForm(false)
      toast.success('Configuration updated successfully')
      await loadData() // Reload stats
    } catch (error: any) {
      toast.error(error.message || 'Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const loadAvailableBatches = async () => {
    console.log('🚀 [WELCOME_PASS_PAGE] loadAvailableBatches called!')
    console.log('🚀 [WELCOME_PASS_PAGE] planType:', formData.planType)
    console.log('🚀 [WELCOME_PASS_PAGE] showBatchManagement:', showBatchManagement)
    
    try {
      setLoadingBatches(true)
      console.log('📥 [WELCOME_PASS_PAGE] Loading batches for planType:', formData.planType)
      console.log('📥 [WELCOME_PASS_PAGE] Calling API...')
      
      const batches = await welcomePassApi.getAvailableBatches(formData.planType)
      
      console.log('📥 [WELCOME_PASS_PAGE] API call completed!')
      console.log('📥 [WELCOME_PASS_PAGE] Batches response:', batches)
      console.log('📥 [WELCOME_PASS_PAGE] Batches type:', typeof batches)
      console.log('📥 [WELCOME_PASS_PAGE] Is array?', Array.isArray(batches))
      console.log('📥 [WELCOME_PASS_PAGE] Batches count:', batches?.length || 0)
      
      if (batches && batches.length > 0) {
        console.log('✅ [WELCOME_PASS_PAGE] Setting batches:', batches.length, 'batches')
      } else {
        console.warn('⚠️ [WELCOME_PASS_PAGE] No batches returned!')
      }
      
      setAvailableBatches(batches || [])
    } catch (error: any) {
      console.error('❌ [WELCOME_PASS_PAGE] Error loading batches:', error)
      console.error('❌ [WELCOME_PASS_PAGE] Error message:', error.message)
      console.error('❌ [WELCOME_PASS_PAGE] Error stack:', error.stack)
      console.error('❌ [WELCOME_PASS_PAGE] Full error:', JSON.stringify(error, null, 2))
      toast.error(error.message || 'Failed to load available batches')
      setAvailableBatches([])
    } finally {
      setLoadingBatches(false)
      console.log('🏁 [WELCOME_PASS_PAGE] loadAvailableBatches finished')
    }
  }

  useEffect(() => {
    console.log('🔄 [WELCOME_PASS_PAGE] useEffect triggered')
    console.log('🔄 [WELCOME_PASS_PAGE] showBatchManagement:', showBatchManagement)
    console.log('🔄 [WELCOME_PASS_PAGE] formData.planType:', formData.planType)
    
    if (showBatchManagement && formData.planType) {
      console.log('✅ [WELCOME_PASS_PAGE] Conditions met, calling loadAvailableBatches')
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        loadAvailableBatches()
      }, 100)
      return () => clearTimeout(timer)
    } else {
      console.log('⏸️ [WELCOME_PASS_PAGE] Conditions not met, skipping load')
    }
  }, [showBatchManagement, formData.planType])

  const loadAllocations = async () => {
    try {
      setLoadingAllocations(true)
      const filters: any = {}
      if (allocationFilters.userId) filters.userId = allocationFilters.userId
      if (allocationFilters.batchId) filters.batchId = allocationFilters.batchId
      if (allocationFilters.planType) filters.planType = allocationFilters.planType
      if (allocationFilters.status) filters.status = allocationFilters.status
      if (allocationFilters.startDate) filters.startDate = allocationFilters.startDate
      if (allocationFilters.endDate) filters.endDate = allocationFilters.endDate
      if (allocationFilters.limit) filters.limit = allocationFilters.limit

      const [allocationsData, statsData] = await Promise.all([
        welcomePassApi.getAllAllocations(filters),
        welcomePassApi.getAllocationStatistics({
          startDate: allocationFilters.startDate || undefined,
          endDate: allocationFilters.endDate || undefined
        })
      ])
      
      console.log('📥 [WELCOME_PASS_PAGE] Allocations response:', allocationsData)
      console.log('📥 [WELCOME_PASS_PAGE] Stats response:', statsData)
      setAllocations(allocationsData)
      setAllocationStats(statsData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load allocations')
    } finally {
      setLoadingAllocations(false)
    }
  }

  useEffect(() => {
    if (showAllocations) {
      loadAllocations()
    }
  }, [showAllocations])

  const handleAddBatch = async (batchId: string) => {
    if (selectedBatchIds.includes(batchId)) return
    
    try {
      setSaving(true)
      const updatedConfig = await welcomePassApi.addAllowedBatches([batchId])
      setConfig(updatedConfig)
      setSelectedBatchIds(updatedConfig.config.allowedBatchIds || [])
      toast.success('Batch added successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add batch')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveBatch = async (batchId: string) => {
    try {
      setSaving(true)
      const updatedConfig = await welcomePassApi.removeAllowedBatches([batchId])
      setConfig(updatedConfig)
      setSelectedBatchIds(updatedConfig.config.allowedBatchIds || [])
      toast.success('Batch removed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove batch')
    } finally {
      setSaving(false)
    }
  }

  const handleClearAllBatches = async () => {
    if (!confirm('Are you sure you want to clear all batch restrictions? This will allow all batches to be used for welcome bonuses.')) {
      return
    }
    
    try {
      setSaving(true)
      const updatedConfig = await welcomePassApi.clearAllowedBatches()
      setConfig(updatedConfig)
      setSelectedBatchIds([])
      toast.success('All batch restrictions cleared')
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear batches')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const statsCards = stats ? [
    {
      title: 'Total Allocated',
      value: stats.totalAllocated.toString(),
      icon: '🎁',
      change: undefined
    },
    {
      title: 'Today Allocated',
      value: stats.todayAllocated.toString(),
      icon: '📅',
      change: undefined
    },
    {
      title: 'Remaining',
      value: stats.remainingAllocations.toString(),
      icon: '📊',
      change: undefined
    },
    {
      title: 'Status',
      value: config?.isEnabled ? 'Enabled' : 'Disabled',
      icon: config?.isEnabled ? '✅' : '❌',
      change: undefined
    }
  ] : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome Pass Management</h1>
          <p className="text-white/60 mt-2">
            Manage welcome bonus settings and batch allocations for new users
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadData}
            disabled={saving}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiRefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {statsCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      {/* Enable/Disable Toggle */}
      <AdminCard title="Welcome Pass Status">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-1">Current Status</p>
            <p className={`text-lg font-semibold ${config?.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {config?.isEnabled ? 'Enabled' : 'Disabled'}
            </p>
            {config?.isEnabled && (
              <p className="text-sm text-white/60 mt-2">
                Welcome bonuses are currently being allocated to new users
              </p>
            )}
          </div>
          <button
            onClick={handleToggle}
            disabled={saving || !config}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              config?.isEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {config?.isEnabled ? (
              <>
                <FiToggleRight className="h-5 w-5" />
                <span>Disable</span>
              </>
            ) : (
              <>
                <FiToggleLeft className="h-5 w-5" />
                <span>Enable</span>
              </>
            )}
          </button>
        </div>
      </AdminCard>

      {/* Configuration */}
      <AdminCard 
        title="Configuration"
        headerAction={
          <button
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiSettings className="h-4 w-4" />
            <span>{showConfigForm ? 'Hide' : 'Edit'} Config</span>
          </button>
        }
      >
        {showConfigForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Allocations
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxAllocations}
                  onChange={(e) => setFormData({ ...formData, maxAllocations: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coupon Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.couponCount}
                  onChange={(e) => setFormData({ ...formData, couponCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires In (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.expiresInHours}
                  onChange={(e) => setFormData({ ...formData, expiresInHours: parseInt(e.target.value) || 24 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Type
                </label>
                <select
                  value={formData.planType}
                  onChange={(e) => {
                    const newPlanType = e.target.value as 'SILVER' | 'GOLD' | 'BRONZE'
                    setFormData({ ...formData, planType: newPlanType })
                    setSelectedBatchIds([]) // Clear selected batches when plan type changes
                  }}
                  disabled={loadingPlans || availablePlans.length === 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  {loadingPlans ? (
                    <option value="">Loading plans...</option>
                  ) : availablePlans.length === 0 ? (
                    <option value="">No plans available</option>
                  ) : (
                    <>
                      <option value="">Select Plan Type</option>
                      {availablePlans.map((plan) => (
                        <option key={plan._id} value={plan.planId}>
                          {plan.displayName || plan.name} ({plan.planId})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowConfigForm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <FiSave className="h-4 w-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-white/80">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60">Start Date</p>
                <p className="font-medium">
                  {config?.config.startDate ? new Date(config.config.startDate).toLocaleString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">End Date</p>
                <p className="font-medium">
                  {config?.config.endDate ? new Date(config.config.endDate).toLocaleString() : 'Not set'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60">Max Allocations</p>
                <p className="font-medium">{config?.config.maxAllocations || 0}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Coupon Count</p>
                <p className="font-medium">{config?.config.couponCount || 1}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60">Expires In</p>
                <p className="font-medium">{config?.config.expiresInHours || 24} hours</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Plan Type</p>
                <p className="font-medium">{config?.config.planType || 'SILVER'}</p>
              </div>
            </div>
          </div>
        )}
      </AdminCard>

      {/* Batch Management */}
      <AdminCard 
        title="Batch Management"
        headerAction={
            <button
              onClick={() => {
                console.log('🖱️ [WELCOME_PASS_PAGE] Button clicked!')
                console.log('🖱️ [WELCOME_PASS_PAGE] Current showBatchManagement:', showBatchManagement)
                const newValue = !showBatchManagement
                console.log('🖱️ [WELCOME_PASS_PAGE] Setting showBatchManagement to:', newValue)
                setShowBatchManagement(newValue)
                if (!showBatchManagement && formData.planType) {
                  console.log('🖱️ [WELCOME_PASS_PAGE] Calling loadAvailableBatches from button')
                  setTimeout(() => loadAvailableBatches(), 100)
                }
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiSettings className="h-4 w-4" />
              <span>{showBatchManagement ? 'Hide' : 'Manage'} Batches</span>
            </button>
        }
      >
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiInfo className="h-4 w-4 text-blue-400" />
            <p className="text-sm text-white/80">
              {selectedBatchIds.length > 0 
                ? `Currently restricting to ${selectedBatchIds.length} selected batch(es). Only movie passes from these batches will be allocated as welcome bonuses.`
                : 'No batch restrictions. All available batches will be used for welcome bonuses.'}
            </p>
          </div>
          {selectedBatchIds.length > 0 && (
            <button
              onClick={handleClearAllBatches}
              disabled={saving}
              className="text-sm text-red-400 hover:text-red-300 underline"
            >
              Clear all batch restrictions
            </button>
          )}
        </div>

        {showBatchManagement && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h4 className="text-lg font-semibold text-white">Available Batches</h4>
                <select
                  value={formData.planType}
                  onChange={(e) => {
                    const newPlanType = e.target.value as 'SILVER' | 'GOLD' | 'BRONZE'
                    console.log('📋 [WELCOME_PASS_PAGE] Plan type changed to:', newPlanType)
                    setFormData({ ...formData, planType: newPlanType })
                    setAvailableBatches([]) // Clear batches when plan type changes
                    setTimeout(() => {
                      if (showBatchManagement) {
                        loadAvailableBatches()
                      }
                    }, 100)
                  }}
                  disabled={loadingPlans || availablePlans.length === 0}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlans ? (
                    <option value="">Loading plans...</option>
                  ) : availablePlans.length === 0 ? (
                    <option value="">No plans available</option>
                  ) : (
                    <>
                      <option value="">Select Plan Type</option>
                      {availablePlans.map((plan) => (
                        <option key={plan._id} value={plan.planId}>
                          {plan.displayName || plan.name} ({plan.planId})
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <span className="text-white/60 text-sm">({formData.planType})</span>
              </div>
              <button
                onClick={loadAvailableBatches}
                disabled={loadingBatches}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiRefreshCw className={`h-4 w-4 ${loadingBatches ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingBatches ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : availableBatches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 mb-2">No available batches found for {formData.planType}</p>
                <p className="text-white/40 text-sm">Try selecting a different plan type or check if batches exist for this plan</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableBatches.map((batch) => {
                  const isSelected = selectedBatchIds.includes(batch._id)
                  return (
                    <div
                      key={batch._id}
                      className={`p-4 rounded-lg border ${
                        isSelected 
                          ? 'bg-green-900/20 border-green-500/30' 
                          : 'bg-gray-700/50 border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-white">{batch.batchName}</h5>
                            {isSelected && (
                              <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/60">
                            Batch ID: {batch.batchId} | Available: {batch.availableMoviePasses} / {batch.totalMoviePasses}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {isSelected ? (
                            <button
                              onClick={() => handleRemoveBatch(batch._id)}
                              disabled={saving}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              <FiX className="h-4 w-4" />
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddBatch(batch._id)}
                              disabled={saving}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              <FiPlus className="h-4 w-4" />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </AdminCard>

      {/* Allocation Tracking */}
      <AdminCard 
        title="Allocation Tracking"
        headerAction={
          <button
            onClick={() => {
              setShowAllocations(!showAllocations)
              if (!showAllocations) {
                loadAllocations()
              }
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiSearch className="h-4 w-4" />
            <span>{showAllocations ? 'Hide' : 'View'} Allocations</span>
          </button>
        }
      >
        {showAllocations && (
          <div className="space-y-4">
            {/* Statistics */}
            {allocationStats && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Total Allocations</p>
                  <p className="text-2xl font-bold text-white">{allocationStats.total}</p>
                </div>
                {Object.entries(allocationStats.byPlanType).map(([planType, count]) => (
                  <div key={planType} className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-white/60 mb-1">{planType}</p>
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FiFilter className="h-4 w-4 text-blue-400" />
                <h4 className="font-semibold text-white">Filters</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                  <input
                    type="text"
                    value={allocationFilters.userId}
                    onChange={(e) => setAllocationFilters({ ...allocationFilters, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Batch ID</label>
                  <input
                    type="text"
                    value={allocationFilters.batchId}
                    onChange={(e) => setAllocationFilters({ ...allocationFilters, batchId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter batch ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plan Type</label>
                  <select
                    value={allocationFilters.planType}
                    onChange={(e) => setAllocationFilters({ ...allocationFilters, planType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All</option>
                  {availablePlans.map((plan) => (
                    <option key={plan._id} value={plan.planId}>
                      {plan.displayName || plan.name}
                    </option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={allocationFilters.status}
                    onChange={(e) => setAllocationFilters({ ...allocationFilters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="USED">USED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={allocationFilters.startDate}
                    onChange={(e) => setAllocationFilters({ ...allocationFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={allocationFilters.endDate}
                    onChange={(e) => setAllocationFilters({ ...allocationFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={loadAllocations}
                  disabled={loadingAllocations}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiSearch className="h-4 w-4" />
                  <span>Apply Filters</span>
                </button>
                <button
                  onClick={() => {
                    setAllocationFilters({
                      userId: '',
                      batchId: '',
                      planType: '',
                      status: '',
                      startDate: '',
                      endDate: '',
                      limit: 50
                    })
                    setTimeout(loadAllocations, 100)
                  }}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiX className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>

            {/* Allocations Table */}
            {loadingAllocations ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : allocations.length === 0 ? (
              <p className="text-white/60 text-center py-8">No allocations found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-white">User</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white">Coupon Code</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white">Batch</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white">Plan Type</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white">Status</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white">Allocated At</th>
                      <th className="px-4 py-3 text-sm font-semibold text-white">Expires At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {allocations.map((allocation) => {
                      const userName = typeof allocation.userId === 'object' 
                        ? allocation.userId?.name || allocation.userName || 'Unknown'
                        : allocation.userName || 'Unknown'
                      const userEmail = typeof allocation.userId === 'object'
                        ? allocation.userId?.email || allocation.userEmail || 'Unknown'
                        : allocation.userEmail || 'Unknown'
                      const userPhone = typeof allocation.userId === 'object'
                        ? allocation.userId?.phone || allocation.userPhone || 'Unknown'
                        : allocation.userPhone || 'Unknown'

                      const statusColors = {
                        ACTIVE: 'bg-green-600',
                        USED: 'bg-blue-600',
                        EXPIRED: 'bg-red-600',
                        CANCELLED: 'bg-gray-600'
                      }

                      return (
                        <tr key={allocation._id} className="hover:bg-gray-700/30">
                          <td className="px-4 py-3 text-sm text-white">
                            <div>
                              <div className="font-medium">{userName}</div>
                              <div className="text-xs text-white/60">{userEmail}</div>
                              <div className="text-xs text-white/60">{userPhone}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-white font-mono">
                            {allocation.couponCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            <div>
                              <div className="font-medium">{allocation.batchName}</div>
                              <div className="text-xs text-white/60">{allocation.batchIdString}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            <span className="px-2 py-1 bg-gray-700 rounded text-xs">{allocation.planType}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs text-white ${statusColors[allocation.status] || 'bg-gray-600'}`}>
                              {allocation.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            {new Date(allocation.allocatedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            {new Date(allocation.expiresAt).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </AdminCard>
    </div>
  )
}

