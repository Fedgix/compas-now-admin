'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiSave, FiX, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi'
import LoadingSpinner from '@/components/LoadingSpinner'
import { subscriptionPlanApi } from '@/lib/subscriptionPlanApi'
import { type SubscriptionPlan, type CreateSubscriptionPlanData } from '@/lib/types'

interface PlanFormData {
  planId: 'SILVER' | 'GOLD'
  name: string
  displayName: string
  description: string
  detailedInfo: {
    benefits: string[]
    validity: string[]
    usage: string[]
    restrictions: string[]
  }
  howToUse: string[]
  importantNotes: string[]
  displayConfig: {
    showKeyFeatures: boolean
    showDetailedInfo: boolean
    showHowToUse: boolean
    showImportantNotes: boolean
    defaultView: 'summary' | 'detailed'
  }
  availability: {
    region: string
    expansion: string
    announcementChannel: string
  }
  supportInfo: {
    email: string
    whatsapp: string
    responseTime: string
    reportingDeadline: string
  }
  pricing: {
    basePrice: number
    couponPrice: number
    couponCount: number
    totalCouponValue: number
    pvrDiscountPerCoupon: number
    pvrCouponValue: number
    currency: string
    convenienceFeePercentage: number
  }
  isActive: boolean
  sortOrder: number
  tags: string[]
}

export default function EditSubscriptionPlanPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PlanFormData>({
    planId: 'SILVER',
    name: 'SILVER',
    displayName: '',
    description: '',
    detailedInfo: {
      benefits: [''],
      validity: [''],
      usage: [''],
      restrictions: ['']
    },
    howToUse: [''],
    importantNotes: [''],
    displayConfig: {
      showKeyFeatures: true,
      showDetailedInfo: true,
      showHowToUse: true,
      showImportantNotes: true,
      defaultView: 'summary'
    },
    availability: {
      region: '',
      expansion: '',
      announcementChannel: ''
    },
    supportInfo: {
      email: '',
      whatsapp: '',
      responseTime: '',
      reportingDeadline: ''
    },
    pricing: {
      basePrice: 0,
      couponPrice: 125,
      couponCount: 1,
      totalCouponValue: 0,
      pvrDiscountPerCoupon: 0,
      pvrCouponValue: 200,
      currency: 'INR',
      convenienceFeePercentage: 5
    },
    isActive: true,
    sortOrder: 0,
    tags: ['']
  })

  // Fetch existing plan data
  const fetchPlan = async () => {
    try {
      setLoading(true)
      const plan = await subscriptionPlanApi.getSubscriptionPlanById(params.id as string)
      
      if (plan) {
        setFormData({
          planId: plan.planId as 'SILVER' | 'GOLD',
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          detailedInfo: {
            benefits: plan.detailedInfo?.benefits || [''],
            validity: plan.detailedInfo?.validity || [''],
            usage: plan.detailedInfo?.usage || [''],
            restrictions: plan.detailedInfo?.restrictions || ['']
          },
          howToUse: plan.howToUse || [''],
          importantNotes: plan.importantNotes || [''],
          displayConfig: {
            showKeyFeatures: plan.displayConfig?.showKeyFeatures ?? true,
            showDetailedInfo: plan.displayConfig?.showDetailedInfo ?? true,
            showHowToUse: plan.displayConfig?.showHowToUse ?? true,
            showImportantNotes: plan.displayConfig?.showImportantNotes ?? true,
            defaultView: plan.displayConfig?.defaultView || 'summary'
          },
          availability: {
            region: plan.availability?.region || '',
            expansion: plan.availability?.expansion || '',
            announcementChannel: plan.availability?.announcementChannel || ''
          },
          supportInfo: {
            email: plan.supportInfo?.email || '',
            whatsapp: plan.supportInfo?.whatsapp || '',
            responseTime: plan.supportInfo?.responseTime || '',
            reportingDeadline: plan.supportInfo?.reportingDeadline || ''
          },
          pricing: {
            basePrice: plan.pricing?.basePrice || 0,
            couponPrice: plan.pricing?.couponPrice || 125,
            couponCount: plan.pricing?.couponCount || 1,
            totalCouponValue: plan.pricing?.totalCouponValue || 0,
            pvrDiscountPerCoupon: plan.pricing?.pvrDiscountPerCoupon || 0,
            pvrCouponValue: plan.pricing?.pvrCouponValue || 200,
            currency: plan.pricing?.currency || 'INR',
            convenienceFeePercentage: plan.pricing?.convenienceFeePercentage || 5
          },
          isActive: plan.isActive,
          sortOrder: plan.sortOrder || 0,
          tags: ['']
        })
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchPlan()
    }
  }, [params.id])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentField = prev[parent as keyof PlanFormData]
      return {
        ...prev,
        [parent]: {
          ...(typeof parentField === 'object' ? parentField : {}),
          [field]: value
        }
      }
    })
  }

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const fieldValue = prev[field as keyof PlanFormData]
      const arrayValue = Array.isArray(fieldValue) ? fieldValue : []
      return {
        ...prev,
        [field]: arrayValue.map((item: string, i: number) => 
          i === index ? value : item
        )
      }
    })
  }

  const addArrayItem = (field: string) => {
    setFormData(prev => {
      const fieldValue = prev[field as keyof PlanFormData]
      const arrayValue = Array.isArray(fieldValue) ? fieldValue : []
      return {
        ...prev,
        [field]: [...arrayValue, '']
      }
    })
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const fieldValue = prev[field as keyof PlanFormData]
      const arrayValue = Array.isArray(fieldValue) ? fieldValue : []
      return {
        ...prev,
        [field]: arrayValue.filter((_: string, i: number) => i !== index)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Clean up empty strings from arrays
      const cleanedData: Partial<CreateSubscriptionPlanData> = {
        ...formData,
        detailedInfo: {
          benefits: formData.detailedInfo.benefits.filter(item => item.trim() !== ''),
          validity: formData.detailedInfo.validity.filter(item => item.trim() !== ''),
          usage: formData.detailedInfo.usage.filter(item => item.trim() !== ''),
          restrictions: formData.detailedInfo.restrictions.filter(item => item.trim() !== '')
        },
        howToUse: formData.howToUse.filter(item => item.trim() !== ''),
        importantNotes: formData.importantNotes.filter(item => item.trim() !== '')
      }

      const response = await subscriptionPlanApi.updateSubscriptionPlan(params.id as string, cleanedData)

      if (response) {
        router.push(`/admin/subscription-plans/${params.id}`)
      }
    } catch (error) {
    } finally {
      setSaving(false)
    }
  }

  const renderArrayInput = (field: string, label: string, placeholder: string) => {
    const array = formData[field as keyof PlanFormData] as string[]
    
    if (!array || !Array.isArray(array)) {
      return null
    }
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {array.map((item, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayInputChange(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {array.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(field, index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(field)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add {label.slice(0, -1)}</span>
        </button>
      </div>
    )
  }

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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Edit Subscription Plan
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Update subscription plan details and configuration
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FiX className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Type *
                    </label>
                    <select
                      value={formData.planId}
                      onChange={(e) => {
                        const planId = e.target.value as 'SILVER' | 'GOLD'
                        handleInputChange('planId', planId)
                        handleInputChange('name', planId)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="SILVER">SILVER</option>
                      <option value="GOLD">GOLD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="e.g., Silver Cinema Pass"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the subscription plan..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Active Plan
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Pricing Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Pricing Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Coupon Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.couponPrice}
                      onChange={(e) => handleNestedInputChange('pricing', 'couponPrice', parseFloat(e.target.value) || 0)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      PVR Coupon Value (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.pvrCouponValue}
                      onChange={(e) => handleNestedInputChange('pricing', 'pvrCouponValue', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Convenience Fee Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.convenienceFeePercentage}
                      onChange={(e) => handleNestedInputChange('pricing', 'convenienceFeePercentage', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.basePrice}
                      onChange={(e) => handleNestedInputChange('pricing', 'basePrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Coupon Count
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.couponCount}
                      onChange={(e) => handleNestedInputChange('pricing', 'couponCount', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Detailed Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Detailed Information
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderArrayInput('detailedInfo.benefits', 'Benefits', 'Enter a benefit...')}
                {renderArrayInput('detailedInfo.validity', 'Validity Rules', 'Enter validity rule...')}
                {renderArrayInput('detailedInfo.usage', 'Usage Rules', 'Enter usage rule...')}
                {renderArrayInput('detailedInfo.restrictions', 'Restrictions', 'Enter restriction...')}
              </div>
            </motion.div>

            {/* How to Use & Important Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Instructions & Notes
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderArrayInput('howToUse', 'How to Use Steps', 'Enter step...')}
                {renderArrayInput('importantNotes', 'Important Notes', 'Enter note...')}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end space-x-4"
            >
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </motion.div>
          </form>
    </div>
  )
}
