'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiUpload } from 'react-icons/fi'
import { SubscriptionPlan, CreateSubscriptionPlanData, SUBSCRIPTION_PLAN_FIELD_DESCRIPTIONS } from '@/lib/types'
import { subscriptionPlanApi } from '@/lib/subscriptionPlanApi'
import LoadingSpinner from '@/components/LoadingSpinner'

interface SubscriptionPlanFormData extends CreateSubscriptionPlanData {}

const DAYS_OF_WEEK = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]

const REFUND_POLICIES = [
  'refundable', 'non-refundable', 'partial-refundable'
]

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<SubscriptionPlanFormData>({
    planId: 'SILVER',
    name: 'SILVER',
    displayName: '',
    description: '',
    detailedInfo: {
      benefits: [],
      validity: [],
      usage: [],
      restrictions: []
    },
    howToUse: [],
    importantNotes: [],
    displayConfig: {
      showKeyFeatures: true,
      showDetailedInfo: true,
      showHowToUse: true,
      showImportantNotes: true,
      defaultView: 'summary'
    },
    availability: {},
    supportInfo: {},
    pricing: {
      couponPrice: 125,
      pvrCouponValue: 200,
      currency: 'INR',
      convenienceFeePercentage: 5,
      convenienceFeeTiers: [
        {
          tierName: 'BASIC',
          minCoupons: 1,
          maxCoupons: 2,
          percentage: 7,
          description: 'Higher fee for small purchases'
        },
        {
          tierName: 'PREMIUM',
          minCoupons: 3,
          maxCoupons: 50,
          percentage: 5,
          description: 'Lower fee for bulk purchases'
        }
      ]
    },
    purchaseRules: {
      minimumCouponCount: 2,
      maximumCouponCount: 50
    },
    usageRules: {
      validDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      couponValidityDays: 60,
      minimumPurchaseRequirement: 2,
      refundPolicy: 'non-refundable'
    },
    isActive: true,
    sortOrder: 0,
    availabilityRequirements: {
      minimumValidHours: 24,
      minimumAvailableCoupons: 10,
      checkInterval: 5
    }
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await subscriptionPlanApi.getAllSubscriptionPlans()
      
      // API returns {success: true, data: Array, pagination: {...}}
      const plansData = (response as any)?.data && Array.isArray((response as any).data) ? (response as any).data : []
      setPlans(plansData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription plans')
      setPlans([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        const planId = editingPlan.id || (editingPlan as any)._id
        if (!planId) {
          throw new Error('Plan ID is required for editing')
        }
        await subscriptionPlanApi.updateSubscriptionPlan(planId, formData)
        } else {
        await subscriptionPlanApi.createSubscriptionPlan(formData)
      }
      await loadPlans()
      setShowForm(false)
      setEditingPlan(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription plan')
    }
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setFormData({
      planId: plan.planId,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      detailedInfo: plan.detailedInfo,
      howToUse: plan.howToUse,
      importantNotes: plan.importantNotes,
      displayConfig: plan.displayConfig,
      availability: plan.availability,
      supportInfo: plan.supportInfo,
      pricing: plan.pricing,
      purchaseRules: plan.purchaseRules,
      usageRules: plan.usageRules,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
      availabilityRequirements: plan.availabilityRequirements
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return
    
    try {
      // Note: Delete endpoint might not be available, you may need to deactivate instead
      await subscriptionPlanApi.updateSubscriptionPlan(id, { isActive: false })
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscription plan')
    }
  }

  const handleMarkSoldOut = async (planId: string) => {
    const reason = prompt('Enter reason for marking as sold out:')
    if (!reason) return

    try {
      await subscriptionPlanApi.markPlanAsSoldOut(planId, reason)
      await loadPlans() // Reload plans to show updated status
      setSuccess('Plan marked as sold out successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark plan as sold out')
    }
  }

  const handleReactivate = async (planId: string) => {
    if (!confirm('Are you sure you want to reactivate this plan? This will make it available for purchase again.')) {
      return
    }

    try {
      await subscriptionPlanApi.reactivatePlan(planId)
      await loadPlans() // Reload plans to show updated status
      setSuccess('Plan reactivated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate plan')
    }
  }

  const resetForm = () => {
    setFormData({
      planId: 'SILVER',
      name: 'SILVER',
      displayName: '',
      description: '',
      detailedInfo: {
        benefits: [],
        validity: [],
        usage: [],
        restrictions: []
      },
      howToUse: [],
      importantNotes: [],
      displayConfig: {
        showKeyFeatures: true,
        showDetailedInfo: true,
        showHowToUse: true,
        showImportantNotes: true,
        defaultView: 'summary'
      },
      availability: {},
      supportInfo: {},
      pricing: {
        couponPrice: 125,
        pvrCouponValue: 200,
        currency: 'INR',
        convenienceFeePercentage: 5,
        convenienceFeeTiers: [
          {
            tierName: 'BASIC',
            minCoupons: 1,
            maxCoupons: 2,
            percentage: 7,
            description: 'Higher fee for small purchases'
          },
          {
            tierName: 'PREMIUM',
            minCoupons: 3,
            maxCoupons: 50,
            percentage: 5,
            description: 'Lower fee for bulk purchases'
          }
        ]
      },
      purchaseRules: {
        minimumCouponCount: 2,
        maximumCouponCount: 50
      },
      usageRules: {
        validDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        couponValidityDays: 60,
        minimumPurchaseRequirement: 2,
        refundPolicy: 'non-refundable'
      },
      isActive: true,
      sortOrder: 0,
      availabilityRequirements: {
        minimumValidHours: 24,
        minimumAvailableCoupons: 10,
        checkInterval: 5
      }
    })
  }

  const getFieldDescription = (fieldPath: string) => {
    return SUBSCRIPTION_PLAN_FIELD_DESCRIPTIONS.find(desc => desc.field === fieldPath)
  }

  const FieldTooltip = ({ fieldPath, children }: { fieldPath: string; children: React.ReactNode }) => {
    const description = getFieldDescription(fieldPath)
    
    if (!description) return <>{children}</>

    return (
      <div className="relative group">
        {children}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
          <div className="font-semibold mb-1">{description.field}</div>
          <div className="mb-1">{description.description}</div>
          <div className="text-gray-300">
            <div><strong>Format:</strong> {description.format}</div>
            <div><strong>Example:</strong> {description.example}</div>
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    )
  }

  const StringArrayInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = "Enter item",
    fieldPath 
  }: { 
    label: string
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    fieldPath: string
  }) => (
    <FieldTooltip fieldPath={fieldPath}>
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          {label}
          <FiInfo className="h-4 w-4 text-gray-400" />
        </label>
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newValue = [...value]
                  newValue[index] = e.target.value
                  onChange(newValue)
                }}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                placeholder={placeholder}
                maxLength={200}
              />
              <button
                type="button"
                onClick={() => {
                  const newValue = value.filter((_, i) => i !== index)
                  onChange(newValue)
                }}
                className="px-3 py-2 text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded-md transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...value, ''])}
            className="px-3 py-2 text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 text-sm rounded-md transition-colors"
          >
            + Add {label.toLowerCase().slice(0, -1)}
          </button>
        </div>
      </div>
    </FieldTooltip>
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setShowForm(true)
              setEditingPlan(null)
              resetForm()
            }}
            className="bg-primary text-black px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 font-medium"
          >
            <FiPlus className="h-4 w-4" />
            Create Plan
          </button>
          
          <a
            href="/admin/movie-passes/import-excel"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
          >
            <FiUpload className="h-4 w-4" />
            Import Excel Batch
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-md">
        <div className="flex">
          <FiXCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">Error</h3>
              <div className="mt-2 text-sm text-red-200">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-md">
        <div className="flex">
          <FiCheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-300">Success</h3>
              <div className="mt-2 text-sm text-green-200">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      {!showForm && (
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-700">
          <ul className="divide-y divide-gray-700">
            {Array.isArray(plans) && plans.length > 0 ? plans.map((plan) => (
              <li key={plan.id || (plan as any)._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white">
                        {plan.displayName}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.isActive 
                          ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
                          : 'bg-red-900/30 text-red-300 border border-red-500/30'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {plan.soldOut && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-500/30">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{plan.description}</p>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Plan ID: {plan.planId}</span>
                      <span>Price: ₹{plan.pricing.couponPrice}/coupon</span>
                      <span>PVR Value: ₹{plan.pricing.pvrCouponValue}</span>
                      <span>Min Purchase: {plan.purchaseRules.minimumCouponCount} coupons</span>
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20 transition-colors"
                    title="Edit Plan"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  
                  {plan.soldOut ? (
                    <button
                      onClick={() => handleReactivate(plan.id)}
                      className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20 transition-colors"
                      title="Reactivate Plan"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkSoldOut(plan.id)}
                      className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-900/20 transition-colors"
                      title="Mark as Sold Out"
                    >
                      <FiXCircle className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                    title="Delete Plan"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
                </div>
              </li>
            )) : (
              <li className="px-6 py-8 text-center text-gray-400">
                {loading ? 'Loading subscription plans...' : 'No subscription plans found. Create your first plan!'}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 shadow sm:rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldTooltip fieldPath="planId">
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    Plan ID
                    <FiInfo className="h-4 w-4 text-gray-400" />
                  </label>
                  <select
                    value={formData.planId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        planId: e.target.value,
                        name: e.target.value
                      })
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                  </select>
                </div>
              </FieldTooltip>

              <FieldTooltip fieldPath="displayName">
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    Display Name
                    <FiInfo className="h-4 w-4 text-gray-400" />
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                    required
                  />
                </div>
              </FieldTooltip>
              </div>

            <FieldTooltip fieldPath="description">
              <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    Description
                    <FiInfo className="h-4 w-4 text-gray-400" />
                  </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                  rows={3}
                  maxLength={500}
                  required
                />
              </div>
            </FieldTooltip>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StringArrayInput
                label="Benefits"
                value={formData.detailedInfo.benefits}
                onChange={(value) => setFormData({
                  ...formData,
                  detailedInfo: { ...formData.detailedInfo, benefits: value }
                })}
                fieldPath="detailedInfo.benefits"
              />

              <StringArrayInput
                label="Validity Rules"
                value={formData.detailedInfo.validity}
                onChange={(value) => setFormData({
                  ...formData,
                  detailedInfo: { ...formData.detailedInfo, validity: value }
                })}
                fieldPath="detailedInfo.validity"
              />

              <StringArrayInput
                label="Usage Rules"
                value={formData.detailedInfo.usage}
                onChange={(value) => setFormData({
                  ...formData,
                  detailedInfo: { ...formData.detailedInfo, usage: value }
                })}
                fieldPath="detailedInfo.usage"
              />

              <StringArrayInput
                label="Restrictions"
                value={formData.detailedInfo.restrictions}
                onChange={(value) => setFormData({
                  ...formData,
                  detailedInfo: { ...formData.detailedInfo, restrictions: value }
                })}
                fieldPath="detailedInfo.restrictions"
              />
            </div>

            <StringArrayInput
              label="How to Use"
              value={formData.howToUse}
              onChange={(value) => setFormData({ ...formData, howToUse: value })}
              fieldPath="howToUse"
            />

            <StringArrayInput
              label="Important Notes"
              value={formData.importantNotes}
              onChange={(value) => setFormData({ ...formData, importantNotes: value })}
              fieldPath="importantNotes"
            />

            {/* Pricing */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Pricing Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FieldTooltip fieldPath="pricing.couponPrice">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      Coupon Price (₹)
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pricing.couponPrice}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, couponPrice: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                      required
                    />
          </div>
                </FieldTooltip>

                <FieldTooltip fieldPath="pricing.pvrCouponValue">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      PVR Coupon Value (₹)
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.pricing.pvrCouponValue}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, pvrCouponValue: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                      required
                    />
                  </div>
                </FieldTooltip>

                <FieldTooltip fieldPath="pricing.convenienceFeePercentage">
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      Convenience Fee (%)
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.pricing.convenienceFeePercentage}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, convenienceFeePercentage: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                      required
                    />
                  </div>
                </FieldTooltip>
                </div>
              </div>

            {/* Convenience Fee Tiers */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Convenience Fee Tiers</h3>
              <p className="text-sm text-gray-400 mb-4">Set different convenience fees based on coupon count (e.g., Under 3 coupons: 7%, 3+ coupons: 5%)</p>
              
              <div className="space-y-4">
                {formData.pricing.convenienceFeeTiers?.map((tier, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">Tier {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newTiers = formData.pricing.convenienceFeeTiers?.filter((_, i) => i !== index) || []
                          setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                          })
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Tier Name</label>
                        <select
                          value={tier.tierName}
                          onChange={(e) => {
                            const newTiers = [...(formData.pricing.convenienceFeeTiers || [])]
                            newTiers[index].tierName = e.target.value as 'BASIC' | 'PREMIUM'
                            setFormData({
                              ...formData,
                              pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                            })
                          }}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        >
                          <option value="BASIC">BASIC</option>
                          <option value="PREMIUM">PREMIUM</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Min Coupons</label>
                        <input
                          type="number"
                          min="1"
                          value={tier.minCoupons}
                          onChange={(e) => {
                            const newTiers = [...(formData.pricing.convenienceFeeTiers || [])]
                            newTiers[index].minCoupons = Number(e.target.value)
                            setFormData({
                              ...formData,
                              pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                            })
                          }}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Max Coupons</label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxCoupons}
                          onChange={(e) => {
                            const newTiers = [...(formData.pricing.convenienceFeeTiers || [])]
                            newTiers[index].maxCoupons = Number(e.target.value)
                            setFormData({
                              ...formData,
                              pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                            })
                          }}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Fee %</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={tier.percentage}
                          onChange={(e) => {
                            const newTiers = [...(formData.pricing.convenienceFeeTiers || [])]
                            newTiers[index].percentage = Number(e.target.value)
                            setFormData({
                              ...formData,
                              pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                            })
                          }}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-300 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={tier.description || ''}
                        onChange={(e) => {
                          const newTiers = [...(formData.pricing.convenienceFeeTiers || [])]
                          newTiers[index].description = e.target.value
                          setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                          })
                        }}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        placeholder="e.g., Higher volume discount"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = [...(formData.pricing.convenienceFeeTiers || [])]
                    newTiers.push({
                      tierName: 'BASIC',
                      minCoupons: 1,
                      maxCoupons: 10,
                      percentage: 5,
                      description: ''
                    })
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, convenienceFeeTiers: newTiers }
                    })
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-600 text-gray-400 hover:text-primary hover:border-primary rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiPlus className="h-4 w-4" />
                  Add Convenience Fee Tier
                </button>
              </div>
            </div>

            {/* Purchase Rules */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Purchase Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldTooltip fieldPath="purchaseRules.minimumCouponCount">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      Minimum Coupon Count
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.purchaseRules.minimumCouponCount}
                      onChange={(e) => setFormData({
                        ...formData,
                        purchaseRules: { ...formData.purchaseRules, minimumCouponCount: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                      required
                    />
                  </div>
                </FieldTooltip>

                <FieldTooltip fieldPath="purchaseRules.maximumCouponCount">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      Maximum Coupon Count
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.purchaseRules.maximumCouponCount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        purchaseRules: { ...formData.purchaseRules, maximumCouponCount: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                    />
                  </div>
                </FieldTooltip>
              </div>
            </div>

            {/* Usage Rules */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Usage Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldTooltip fieldPath="usageRules.validDays">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      Valid Days
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.usageRules.validDays.includes(day)}
                            onChange={(e) => {
                              const newValidDays = e.target.checked
                                ? [...formData.usageRules.validDays, day]
                                : formData.usageRules.validDays.filter(d => d !== day)
                              setFormData({
                                ...formData,
                                usageRules: { ...formData.usageRules, validDays: newValidDays }
                              })
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-300">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </FieldTooltip>

                <div className="space-y-4">
                  <FieldTooltip fieldPath="usageRules.couponValidityDays">
                    <div className="mb-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        Coupon Validity Days
                        <FiInfo className="h-4 w-4 text-gray-400" />
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.usageRules.couponValidityDays}
                        onChange={(e) => setFormData({
                          ...formData,
                          usageRules: { ...formData.usageRules, couponValidityDays: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                        required
                      />
                    </div>
                  </FieldTooltip>

                  <FieldTooltip fieldPath="usageRules.minimumPurchaseRequirement">
                    <div className="mb-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        Minimum Purchase Requirement
                        <FiInfo className="h-4 w-4 text-gray-400" />
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.usageRules.minimumPurchaseRequirement}
                        onChange={(e) => setFormData({
                          ...formData,
                          usageRules: { ...formData.usageRules, minimumPurchaseRequirement: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                        required
                      />
                    </div>
                  </FieldTooltip>

                  <FieldTooltip fieldPath="usageRules.refundPolicy">
                    <div className="mb-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        Refund Policy
                        <FiInfo className="h-4 w-4 text-gray-400" />
                      </label>
                      <select
                        value={formData.usageRules.refundPolicy}
                        onChange={(e) => setFormData({
                          ...formData,
                          usageRules: { ...formData.usageRules, refundPolicy: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                      >
                        {REFUND_POLICIES.map(policy => (
                          <option key={policy} value={policy}>
                            {policy.charAt(0).toUpperCase() + policy.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FieldTooltip>
                </div>
                  </div>
                </div>

            {/* Status and Order */}
            <div className="border-t border-gray-700 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Plan
                  </label>
                </div>

                <FieldTooltip fieldPath="sortOrder">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      Sort Order
                      <FiInfo className="h-4 w-4 text-gray-400" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                    />
          </div>
                </FieldTooltip>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingPlan(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 border border-gray-600 transition-colors"
              >
                Cancel
              </button>
                <button
                type="submit"
                className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary/90 font-medium transition-colors"
                >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
            </div>
          </form>
            </div>
          )}
    </div>
  )
}