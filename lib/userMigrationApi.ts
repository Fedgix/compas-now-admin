/**
 * User Migration API Service
 * Handles user migration from Silver Pass to Gold Pass
 */

import { getCurrentConfig } from './config'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const config = getCurrentConfig()
    return config.baseUrl
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
}

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

interface MigrationResult {
  success: boolean
  message: string
  bundle: {
    _id: string
    bundleId: string
    planId: string
    planName: string
    couponCount: number
    remainingCoupons: number
    expiresAt: string
    migratedFrom?: string
    migratedAt?: string
  }
  // Legacy support for old response format
  oldBundle?: {
    bundleId: string
    planId: string
    remainingCoupons: number
    status: string
  }
  newBundle?: {
    _id: string
    bundleId: string
    planId: string
    planName: string
    couponCount: number
    remainingCoupons: number
    expiresAt: string
  }
  user: {
    _id: string
    name: string
    email: string
  }
}

class UserMigrationApiService {
  private getAuthHeaders() {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('admin_access_token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token')
      : null
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Get users eligible for migration from a specific plan
   */
  async getUsersForMigration(sourcePlanId: string): Promise<UserForMigration[]> {
    const response = await fetch(`${getApiBaseUrl()}/movie-pass/migration/users/${sourcePlanId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get users for migration')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Get available plans for migration
   */
  async getAvailablePlans(): Promise<Plan[]> {
    const response = await fetch(`${getApiBaseUrl()}/movie-pass/migration/plans`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get available plans')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Get available batches for a plan
   */
  async getBatchesForPlan(planId: string): Promise<Batch[]> {
    const response = await fetch(`${getApiBaseUrl()}/movie-pass/migration/batches/${planId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get batches for plan')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Migrate user from Silver Pass to Gold Pass
   */
  async migrateUser(
    userId: string,
    oldBundleId: string,
    newPlanId: string,
    newBatchId: string
  ): Promise<MigrationResult> {
    const response = await fetch(`${getApiBaseUrl()}/movie-pass/migration/migrate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        userId,
        oldBundleId,
        newPlanId,
        newBatchId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to migrate user')
    }

    const data = await response.json()
    return data.data
  }
}

export const userMigrationApiService = new UserMigrationApiService()

