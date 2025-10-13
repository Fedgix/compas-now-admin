'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { couponApiService, type DiscountCoupon, type CreateCouponData } from '@/lib/couponApi'
import { apiService } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import InfoTooltip from '@/components/InfoTooltip'
import { useEnvironment } from '@/contexts/EnvironmentContext'
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiCopy } from 'react-icons/fi'

interface Event {
  _id: string
  title: string
  date: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<DiscountCoupon | null>(null)
  const { currentEnvironment } = useEnvironment()

  // Fetch coupons - auto-refresh on environment change
  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const response = await couponApiService.getAllCoupons({ limit: 100 })
      // Backend returns: { success: true, coupons: [...] }
      setCoupons(response.coupons || [])
    } catch (error: any) {
      console.error('Fetch coupons error:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch coupons')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch events for dropdown
  const fetchEvents = async () => {
    try {
      const response = await apiService.get('/events')
      setEvents(response.data?.data || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  // Auto-refresh on environment change
  useEffect(() => {
    fetchCoupons()
    fetchEvents()
  }, [currentEnvironment])

  // Delete coupon
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      await couponApiService.deleteCoupon(id)
      toast.success('Coupon deleted successfully!')
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon')
    }
  }

  // Toggle coupon status
  const handleToggleStatus = async (coupon: DiscountCoupon) => {
    try {
      await couponApiService.toggleCouponStatus(coupon._id!, !coupon.isActive)
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'} successfully!`)
      fetchCoupons()
    } catch (error: any) {
      toast.error('Failed to update coupon status')
    }
  }

  // Copy coupon code
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discount Coupons</h1>
          <p className="text-gray-400 mt-1">Manage event booking discount coupons</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Environment Badge */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <p className="text-sm text-gray-400">
          Currently managing coupons for: <span className="text-primary font-semibold">{currentEnvironment.toUpperCase()}</span>
        </p>
      </div>

      {/* Coupons List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No coupons found. Create your first coupon!
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono font-semibold">{coupon.couponCode}</span>
                        <button
                          onClick={() => handleCopy(coupon.couponCode)}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : `₹${coupon.discountValue}`}
                      {coupon.maxDiscountCap && (
                        <span className="text-xs text-gray-500 ml-1">(Max: ₹{coupon.maxDiscountCap})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {coupon.usageRestrictions.currentGlobalUsage} / {coupon.usageRestrictions.totalGlobalLimit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(coupon.timeRestrictions.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon)
                            setShowEditModal(true)
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id!)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <CouponFormModal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedCoupon(null)
          }}
          onSuccess={() => {
            fetchCoupons()
            setShowCreateModal(false)
            setShowEditModal(false)
            setSelectedCoupon(null)
          }}
          coupon={selectedCoupon}
          events={events}
        />
      )}
    </div>
  )
}

// Coupon Form Modal Component
interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  coupon: DiscountCoupon | null
  events: Event[]
}

function CouponFormModal({ isOpen, onClose, onSuccess, coupon, events }: CouponFormModalProps) {
  const isEdit = !!coupon
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CreateCouponData>({
    couponCode: coupon?.couponCode || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || 0,
    isFlat: coupon?.isFlat || false,
    maxDiscountCap: coupon?.maxDiscountCap || null,
    
    usageRestrictions: {
      totalGlobalLimit: coupon?.usageRestrictions.totalGlobalLimit || 100,
      perUserLimit: coupon?.usageRestrictions.perUserLimit || 1,
      currentGlobalUsage: coupon?.usageRestrictions.currentGlobalUsage || 0,
      isOneTimePerUser: coupon?.usageRestrictions.isOneTimePerUser ?? true,
      isNewUsersOnly: coupon?.usageRestrictions.isNewUsersOnly || false,
      specificUsers: coupon?.usageRestrictions.specificUsers || [],
      excludedUsers: coupon?.usageRestrictions.excludedUsers || []
    },
    
    eventRestrictions: {
      applicableEvents: coupon?.eventRestrictions.applicableEvents || [],
      excludedEvents: coupon?.eventRestrictions.excludedEvents || [],
      minTicketsRequired: coupon?.eventRestrictions.minTicketsRequired || 1,
      maxTicketsAllowed: coupon?.eventRestrictions.maxTicketsAllowed || null
    },
    
    timeRestrictions: {
      validFrom: coupon?.timeRestrictions.validFrom || new Date().toISOString().slice(0, 16),
      validUntil: coupon?.timeRestrictions.validUntil || '',
      daysOfWeek: coupon?.timeRestrictions.daysOfWeek || [],
      timeRanges: coupon?.timeRestrictions.timeRanges || []
    },
    
    securityRestrictions: {
      cooldownPeriodMinutes: coupon?.securityRestrictions.cooldownPeriodMinutes || 0,
      maxDevicesPerUser: coupon?.securityRestrictions.maxDevicesPerUser || 3,
      requiresVerification: coupon?.securityRestrictions.requiresVerification || false
    },
    
    isActive: coupon?.isActive ?? true,
    isDeleted: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isEdit) {
        await couponApiService.updateCoupon(coupon._id!, formData)
        toast.success('Coupon updated successfully!')
      } else {
        await couponApiService.createCoupon(formData)
        toast.success('Coupon created successfully!')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save coupon')
    } finally {
      setIsSubmitting(false)
    }
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Coupon Code
                  <InfoTooltip text="Unique code that users will enter. Use uppercase letters and numbers (e.g., SAVE50, WELCOME10)" />
                </label>
                <input
                  type="text"
                  required
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., SAVE50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                  <InfoTooltip text="Brief description of the coupon for admin reference" />
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., Diwali Special Offer"
                />
              </div>
            </div>
          </div>

          {/* Discount Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Discount Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Discount Type
                  <InfoTooltip text="Percentage: Discount as % of amount (e.g., 10%). Flat: Fixed amount off (e.g., ₹100)" />
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat_amount">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Discount Value
                  <InfoTooltip text="The discount amount. For percentage: enter 10 for 10%. For flat: enter 100 for ₹100 off" />
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Discount Cap (₹)
                  <InfoTooltip text="Maximum discount amount for percentage discounts. e.g., 10% with cap ₹500 means max ₹500 off" />
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxDiscountCap || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscountCap: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                  placeholder="No cap"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFlat"
                checked={formData.isFlat}
                onChange={(e) => setFormData({ ...formData, isFlat: e.target.checked })}
                className="rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
              />
              <label htmlFor="isFlat" className="text-sm text-gray-300">
                Apply to Total Cart
                <InfoTooltip text="If checked, discount applies to total amount. If unchecked, applies per ticket" />
              </label>
            </div>
          </div>

          {/* Usage Restrictions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Usage Restrictions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Total Global Limit
                  <InfoTooltip text="Maximum number of times this coupon can be used across ALL users" />
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.usageRestrictions.totalGlobalLimit}
                  onChange={(e) => setFormData({
                    ...formData,
                    usageRestrictions: { ...formData.usageRestrictions, totalGlobalLimit: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Per User Limit
                  <InfoTooltip text="Maximum times a single user can use this coupon" />
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.usageRestrictions.perUserLimit}
                  onChange={(e) => setFormData({
                    ...formData,
                    usageRestrictions: { ...formData.usageRestrictions, perUserLimit: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOneTimePerUser"
                  checked={formData.usageRestrictions.isOneTimePerUser}
                  onChange={(e) => setFormData({
                    ...formData,
                    usageRestrictions: { ...formData.usageRestrictions, isOneTimePerUser: e.target.checked }
                  })}
                  className="rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
                />
                <label htmlFor="isOneTimePerUser" className="text-sm text-gray-300">
                  One Time Per User
                  <InfoTooltip text="Each user can only use this coupon once, regardless of per-user limit" />
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNewUsersOnly"
                  checked={formData.usageRestrictions.isNewUsersOnly}
                  onChange={(e) => setFormData({
                    ...formData,
                    usageRestrictions: { ...formData.usageRestrictions, isNewUsersOnly: e.target.checked }
                  })}
                  className="rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
                />
                <label htmlFor="isNewUsersOnly" className="text-sm text-gray-300">
                  New Users Only
                  <InfoTooltip text="Only users who have never booked before can use this coupon" />
                </label>
              </div>
            </div>
          </div>

          {/* Event Restrictions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Event Restrictions
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Applicable Events
                <InfoTooltip text="Select events where this coupon can be used. Leave empty for all events" />
              </label>
              <select
                multiple
                value={formData.eventRestrictions.applicableEvents}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setFormData({
                    ...formData,
                    eventRestrictions: { ...formData.eventRestrictions, applicableEvents: selected }
                  })
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary h-32"
              >
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple events</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Min Tickets Required
                  <InfoTooltip text="Minimum number of tickets user must book to use this coupon" />
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.eventRestrictions.minTicketsRequired}
                  onChange={(e) => setFormData({
                    ...formData,
                    eventRestrictions: { ...formData.eventRestrictions, minTicketsRequired: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Tickets Allowed
                  <InfoTooltip text="Maximum number of tickets this coupon can be applied to. Leave empty for no limit" />
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.eventRestrictions.maxTicketsAllowed || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    eventRestrictions: { 
                      ...formData.eventRestrictions, 
                      maxTicketsAllowed: e.target.value ? parseInt(e.target.value) : null 
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>

          {/* Time Restrictions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Time Restrictions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valid From
                  <InfoTooltip text="Date and time when coupon becomes valid" />
                </label>
                <input
                  type="datetime-local"
                  required
                  value={typeof formData.timeRestrictions.validFrom === 'string' 
                    ? formData.timeRestrictions.validFrom.slice(0, 16) 
                    : new Date(formData.timeRestrictions.validFrom).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeRestrictions: { ...formData.timeRestrictions, validFrom: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valid Until
                  <InfoTooltip text="Date and time when coupon expires" />
                </label>
                <input
                  type="datetime-local"
                  required
                  value={typeof formData.timeRestrictions.validUntil === 'string' 
                    ? formData.timeRestrictions.validUntil.slice(0, 16) 
                    : new Date(formData.timeRestrictions.validUntil).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeRestrictions: { ...formData.timeRestrictions, validUntil: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valid Days of Week
                <InfoTooltip text="Select days when coupon can be used. Leave empty for all days" />
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.timeRestrictions.daysOfWeek.includes(day)}
                      onChange={(e) => {
                        const days = e.target.checked
                          ? [...formData.timeRestrictions.daysOfWeek, day]
                          : formData.timeRestrictions.daysOfWeek.filter(d => d !== day)
                        setFormData({
                          ...formData,
                          timeRestrictions: { ...formData.timeRestrictions, daysOfWeek: days }
                        })
                      }}
                      className="rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
                    />
                    <span className="text-sm text-gray-300">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Security Restrictions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Security & Fraud Prevention
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cooldown Period (Minutes)
                  <InfoTooltip text="Minimum time between consecutive uses by same user. Set 0 for no cooldown" />
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.securityRestrictions.cooldownPeriodMinutes}
                  onChange={(e) => setFormData({
                    ...formData,
                    securityRestrictions: { ...formData.securityRestrictions, cooldownPeriodMinutes: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Devices Per User
                  <InfoTooltip text="Maximum number of different devices a user can use this coupon from" />
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.securityRestrictions.maxDevicesPerUser}
                  onChange={(e) => setFormData({
                    ...formData,
                    securityRestrictions: { ...formData.securityRestrictions, maxDevicesPerUser: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiresVerification"
                checked={formData.securityRestrictions.requiresVerification}
                onChange={(e) => setFormData({
                  ...formData,
                  securityRestrictions: { ...formData.securityRestrictions, requiresVerification: e.target.checked }
                })}
                className="rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
              />
              <label htmlFor="requiresVerification" className="text-sm text-gray-300">
                Requires Verification
                <InfoTooltip text="User must verify email/phone before using this coupon" />
              </label>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Status
            </h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-600 text-primary focus:ring-primary bg-gray-700"
              />
              <label htmlFor="isActive" className="text-sm text-gray-300">
                Active
                <InfoTooltip text="Coupon must be active for users to apply it" />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

