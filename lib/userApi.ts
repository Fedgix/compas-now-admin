/**
 * User Management API Integration
 * Handles all API calls related to user management
 */

import { apiService } from './api'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  isActive: boolean
  isVerified: boolean
  totalBookings: number
  totalSpent: number
  createdAt: string
  lastLoginAt?: string
  profileImage?: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  newUsersThisMonth: number
  totalRevenue: number
  averageSpending: number
}

interface CreateUserData {
  name: string
  email: string
  phone: string
  city: string
  state: string
  password: string
}

interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  isActive?: boolean
  isVerified?: boolean
}

interface ApiResponse<T> {
  status: string
  message: string
  data: T
  error?: string
}

interface PaginatedResponse<T> {
  status: string
  message: string
  data: {
    users: T[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

interface UserFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'active' | 'inactive' | 'verified' | 'unverified'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const userApi = {
  // Get all users with pagination and filters
  getAllUsers: async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams()
    
    if (filters.page) queryParams.append('page', filters.page.toString())
    if (filters.limit) queryParams.append('limit', filters.limit.toString())
    if (filters.search) queryParams.append('search', filters.search)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

    const response = await apiService.get<PaginatedResponse<User>>(`/admin/users?${queryParams.toString()}`)
    return response
  },

  // Get user statistics
  getUserStatistics: async (): Promise<ApiResponse<UserStats>> => {
    const response = await apiService.get<ApiResponse<UserStats>>('/admin/users/statistics')
    return response
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiService.get<ApiResponse<User>>(`/admin/users/${userId}`)
    return response
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<ApiResponse<User>> => {
    const response = await apiService.post<ApiResponse<User>>('/admin/users', userData)
    return response
  },

  // Update user
  updateUser: async (userId: string, userData: UpdateUserData): Promise<ApiResponse<User>> => {
    const response = await apiService.put<ApiResponse<User>>(`/admin/users/${userId}`, userData)
    return response
  },

  // Delete user (soft delete)
  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiService.delete<ApiResponse<void>>(`/admin/users/${userId}`)
    return response
  },

  // Activate user
  activateUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiService.patch<ApiResponse<User>>(`/admin/users/${userId}/activate`)
    return response
  },

  // Deactivate user
  deactivateUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiService.patch<ApiResponse<User>>(`/admin/users/${userId}/deactivate`)
    return response
  },

  // Get user bookings
  getUserBookings: async (userId: string, pagination: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams()
    if (pagination.page) queryParams.append('page', pagination.page.toString())
    if (pagination.limit) queryParams.append('limit', pagination.limit.toString())

    const response = await apiService.get<ApiResponse<any>>(`/admin/users/${userId}/bookings?${queryParams.toString()}`)
    return response
  },

  // Get user payments
  getUserPayments: async (userId: string, pagination: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams()
    if (pagination.page) queryParams.append('page', pagination.page.toString())
    if (pagination.limit) queryParams.append('limit', pagination.limit.toString())

    const response = await apiService.get<ApiResponse<any>>(`/admin/users/${userId}/payments?${queryParams.toString()}`)
    return response
  },

  // Get user movie passes
  getUserMoviePasses: async (userId: string, pagination: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams()
    if (pagination.page) queryParams.append('page', pagination.page.toString())
    if (pagination.limit) queryParams.append('limit', pagination.limit.toString())

    const response = await apiService.get<ApiResponse<any>>(`/admin/users/${userId}/movie-passes?${queryParams.toString()}`)
    return response
  },

  // Export users
  exportUsers: async (format: 'csv' | 'json' = 'csv', filters: UserFilters = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams()
    queryParams.append('format', format)
    
    if (filters.search) queryParams.append('search', filters.search)
    if (filters.status) queryParams.append('status', filters.status)

    const response = await fetch(`${apiService.instance.defaults.baseURL}/admin/users/export?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to export users')
    }

    return response.blob()
  }
}

export type { User, UserStats, CreateUserData, UpdateUserData, UserFilters, ApiResponse, PaginatedResponse }
