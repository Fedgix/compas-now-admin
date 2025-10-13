import { apiService } from './api'

export interface DiscountCoupon {
  _id?: string
  couponCode: string
  couponTemplateId?: string
  description?: string
  
  // Discount Configuration
  discountType: 'percentage' | 'flat_amount'
  discountValue: number
  isFlat: boolean
  maxDiscountCap?: number | null
  
  // Usage Restrictions
  usageRestrictions: {
    totalGlobalLimit: number
    perUserLimit: number
    currentGlobalUsage: number
    isOneTimePerUser: boolean
    isNewUsersOnly: boolean
    specificUsers: string[]
    excludedUsers: string[]
  }
  
  // Event Restrictions
  eventRestrictions: {
    applicableEvents: string[]
    excludedEvents: string[]
    minTicketsRequired: number
    maxTicketsAllowed: number | null
  }
  
  // Time Restrictions
  timeRestrictions: {
    validFrom: string | Date
    validUntil: string | Date
    daysOfWeek: string[]
    timeRanges: Array<{
      start: string
      end: string
    }>
  }
  
  // Security Restrictions
  securityRestrictions: {
    cooldownPeriodMinutes: number
    maxDevicesPerUser: number
    requiresVerification: boolean
  }
  
  // Status
  isActive: boolean
  isDeleted: boolean
  
  // Metadata
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  lastModifiedBy?: string
}

export interface CouponTemplate {
  _id: string
  name: string
  description: string
  category: string
}

export interface CreateCouponData extends Omit<DiscountCoupon, '_id' | 'createdAt' | 'updatedAt'> {}

export class CouponApiService {
  // Get all coupons with pagination and filters
  async getAllCoupons(params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    eventId?: string
  }) {
    // apiService.get already returns response.data
    // Backend returns: { success: true, coupons: [...], pagination: {...} }
    const response = await apiService.get('/discount-coupons/all', params)
    return response
  }

  // Get coupon by ID
  async getCouponById(id: string) {
    const response = await apiService.get(`/discount-coupons/${id}`)
    return response
  }

  // Create new coupon
  async createCoupon(couponData: CreateCouponData) {
    const response = await apiService.post('/discount-coupons', couponData)
    return response
  }

  // Update coupon
  async updateCoupon(id: string, couponData: Partial<CreateCouponData>) {
    const response = await apiService.put(`/discount-coupons/${id}`, couponData)
    return response
  }

  // Delete coupon (soft delete)
  async deleteCoupon(id: string) {
    const response = await apiService.delete(`/discount-coupons/${id}`)
    return response
  }

  // Toggle coupon active status
  async toggleCouponStatus(id: string, isActive: boolean) {
    const response = await apiService.patch(`/discount-coupons/${id}/status`, { isActive })
    return response
  }

  // Get all coupon templates
  async getCouponTemplates() {
    const response = await apiService.get('/discount-coupons/templates')
    return response
  }

  // Get coupon usage statistics
  async getCouponStats(id: string) {
    const response = await apiService.get(`/discount-coupons/${id}/stats`)
    return response
  }

  // Generate unique coupon code
  async generateCouponCode(prefix?: string) {
    const response = await apiService.post('/discount-coupons/generate-code', { prefix })
    return response
  }

  // Validate coupon code (check if already exists)
  async validateCouponCode(couponCode: string) {
    const response = await apiService.post('/discount-coupons/validate-code', { couponCode })
    return response
  }

  // Get coupons by event
  async getCouponsByEvent(eventId: string) {
    const response = await apiService.get(`/discount-coupons/event/${eventId}`)
    return response
  }
}

export const couponApiService = new CouponApiService()
export default couponApiService

