/**
 * Movie Pass API Service
 * Handles all movie pass related API calls
 */

import { getCurrentConfig } from './config'
import { authApiService } from './authApi'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment config
    const config = getCurrentConfig()
    return config.baseUrl
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

class MoviePassApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`
    
    // Get auth token from authApiService
    const token = authApiService.getAccessToken()
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Import movie pass batch from Excel file
   */
  async importBatchFromExcel(formData: FormData): Promise<any> {
    const config = getCurrentConfig()
    const token = authApiService.getAccessToken()
    
    if (!token) {
      throw new Error('Admin authentication required. Please login again.')
    }

    const response = await fetch(`${config.baseUrl}/movie-passes/batches/import-excel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Upload failed')
    }

    return await response.json()
  }

  /**
   * Get all movie pass batches
   */
  async getAllBatches(): Promise<any> {
    return this.request('/movie-passes/batches')
  }

  /**
   * Get batch by ID
   */
  async getBatchById(batchId: string): Promise<any> {
    return this.request(`/movie-passes/batches/${batchId}`)
  }

  /**
   * Get batch statistics
   */
  async getBatchStatistics(): Promise<any> {
    return this.request('/movie-passes/batches/statistics')
  }

  /**
   * Update batch
   */
  async updateBatch(batchId: string, updateData: any): Promise<any> {
    return this.request(`/movie-passes/batches/${batchId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  /**
   * Delete batch
   */
  async deleteBatch(batchId: string): Promise<any> {
    return this.request(`/movie-passes/batches/${batchId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Add coupons to existing batch
   */
  async addCouponsToBatch(batchId: string, couponsData: any): Promise<any> {
    return this.request(`/movie-passes/batches/${batchId}/add-coupons`, {
      method: 'POST',
      body: JSON.stringify(couponsData)
    })
  }

  /**
   * Get all movie passes
   */
  async getAllMoviePasses(): Promise<any> {
    return this.request('/movie-passes/admin/movie-passes')
  }

  /**
   * Get movie passes by batch
   */
  async getMoviePassesByBatch(batchId: string): Promise<any> {
    return this.request(`/movie-passes/admin/movie-passes/batch/${batchId}`)
  }

  /**
   * Get movie passes by user
   */
  async getMoviePassesByUser(userId: string): Promise<any> {
    return this.request(`/movie-passes/admin/movie-passes/user/${userId}`)
  }

  /**
   * Get movie pass statistics
   */
  async getMoviePassStatistics(): Promise<any> {
    return this.request('/movie-passes/admin/movie-passes/statistics')
  }

  /**
   * Allocate movie pass to user
   */
  async allocateMoviePassToUser(allocationData: any): Promise<any> {
    return this.request('/movie-passes/allocate', {
      method: 'POST',
      body: JSON.stringify(allocationData)
    })
  }

  /**
   * Easy upload movie pass batch
   */
  async easyUploadMoviePassBatch(batchData: any): Promise<any> {
    return this.request('/movie-passes/easy-upload', {
      method: 'POST',
      body: JSON.stringify(batchData)
    })
  }
}

export const moviePassApi = new MoviePassApi()
