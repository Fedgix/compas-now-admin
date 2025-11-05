/**
 * Migration API Service
 * Handles image migration from Cloudinary/external URLs to S3
 */

import { getCurrentConfig } from './config'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment config
    const config = getCurrentConfig()
    return config.baseUrl
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
}

interface ImageInfo {
  id: string
  module: string
  field: string
  fieldIndex?: number
  oldUrl: string
  source: 'cloudinary' | 'external' | 's3'
  status: 'pending' | 'already_migrated'
}

interface ScanResult {
  total: number
  cloudinary: number
  external: number
  alreadyS3: number
  images: ImageInfo[]
}

interface MigrationResult {
  total: number
  success: number
  failed: number
  skipped: number
  results: Array<{
    success: boolean
    message: string
    oldUrl: string
    newUrl?: string
    error?: string
    skipped?: boolean
    dryRun?: boolean
    index: number
    total: number
    imageInfo: ImageInfo
  }>
}

interface MigrationStats {
  [module: string]: {
    total: number
    cloudinary: number
    external: number
    alreadyS3: number
    pending: number
    error?: string
  }
}

class MigrationApiService {
  private getAuthHeaders() {
    // Get token from localStorage (same as other API services)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('admin_access_token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token')
      : null
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Scan module for images to migrate
   */
  async scanModule(module: string): Promise<ScanResult> {
    const response = await fetch(`${getApiBaseUrl()}/migration/scan/${module}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to scan module')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Preview migration (dry run)
   */
  async previewMigration(module: string, imageIds?: string[]): Promise<MigrationResult> {
    const response = await fetch(`${getApiBaseUrl()}/migration/preview/${module}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ imageIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to preview migration')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Migrate images for a module
   */
  async migrateModule(module: string, imageIds?: string[]): Promise<MigrationResult> {
    const response = await fetch(`${getApiBaseUrl()}/migration/migrate/${module}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ imageIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to migrate module')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Migrate single image
   */
  async migrateImage(imageInfo: ImageInfo): Promise<{
    success: boolean
    message: string
    oldUrl: string
    newUrl?: string
    error?: string
  }> {
    const response = await fetch(`${getApiBaseUrl()}/migration/migrate-image`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ imageInfo }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to migrate image')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats(): Promise<MigrationStats> {
    const response = await fetch(`${getApiBaseUrl()}/migration/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get migration stats')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Get failed migrations for a module
   */
  async getFailedMigrations(module: string): Promise<{
    total: number
    logs: Array<{
      id: string
      entityId: string
      module: string
      field: string
      fieldIndex: number | null
      oldUrl: string
      newUrl: string | null
      error: string | null
      createdAt: string
      retryCount: number
    }>
  }> {
    const response = await fetch(`${getApiBaseUrl()}/migration/failed/${module}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get failed migrations')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Rollback single image migration
   */
  async rollbackImage(entityId: string, module: string, field: string, fieldIndex?: number): Promise<{
    success: boolean
    message: string
    oldUrl: string
    newUrl?: string
  }> {
    const response = await fetch(`${getApiBaseUrl()}/migration/rollback-image`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ entityId, module, field, fieldIndex }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to rollback image')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Rollback failed migrations for a module
   */
  async rollbackFailedMigrations(module: string, logIds?: string[]): Promise<{
    total: number
    success: number
    failed: number
    results: Array<{
      success: boolean
      logId: string
      entityId: string
      message?: string
      error?: string
    }>
  }> {
    const response = await fetch(`${getApiBaseUrl()}/migration/rollback/${module}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ logIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to rollback failed migrations')
    }

    const data = await response.json()
    return data.data
  }
}

export default new MigrationApiService()

