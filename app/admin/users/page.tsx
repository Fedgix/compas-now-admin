'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { userApi, type User, type UserStats, type CreateUserData, type UpdateUserData } from '../../../lib/userApi'
import AdminCard from '../../../components/AdminCard'
import AdminTable from '../../../components/AdminTable'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useEnvironment } from '../../../contexts/EnvironmentContext'

// Types are now imported from userApi

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'verified' | 'unverified'>('all')
  const { currentConfig } = useEnvironment()

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      console.log('🔧 Fetching users from:', currentConfig.baseUrl)
      
      const response = await userApi.getAllUsers({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: filterStatus,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      if (response.status === 'success') {
        setUsers(response.data.users)
        console.log('📡 Users loaded:', response.data.users.length)
      } else {
        setError(response.message || 'Failed to fetch users')
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching users:', error)
      setError(error.response?.data?.message || error.message || 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      console.log('🔧 Fetching user stats...')
      
      const response = await userApi.getUserStatistics()
      
      if (response.status === 'success') {
        setStats(response.data)
        console.log('📡 User stats loaded:', response.data)
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching user stats:', error)
    }
  }

  // Create new user
  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      console.log('🔧 Creating user:', userData)
      
      const response = await userApi.createUser(userData)
      
      if (response.status === 'success') {
        toast.success('User created successfully!')
        setShowCreateModal(false)
        fetchUsers()
      } else {
        toast.error(response.message || 'Failed to create user')
      }
      
    } catch (error: any) {
      console.error('❌ Error creating user:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create user')
    }
  }

  // Update user
  const handleUpdateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      console.log('🔧 Updating user:', userId, userData)
      
      const response = await userApi.updateUser(userId, userData)
      
      if (response.status === 'success') {
        toast.success('User updated successfully!')
        setShowEditModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast.error(response.message || 'Failed to update user')
      }
      
    } catch (error: any) {
      console.error('❌ Error updating user:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to update user')
    }
  }

  // Deactivate user
  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return
    
    try {
      console.log('🔧 Deactivating user:', userId)
      
      const response = await userApi.deactivateUser(userId)
      
      if (response.status === 'success') {
        toast.success('User deactivated successfully!')
        fetchUsers()
      } else {
        toast.error(response.message || 'Failed to deactivate user')
      }
      
    } catch (error: any) {
      console.error('❌ Error deactivating user:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to deactivate user')
    }
  }

  // Get user details
  const handleGetUserDetails = async (userId: string) => {
    try {
      console.log('🔧 Getting user details for:', userId)
      
      const response = await userApi.getUserById(userId)
      
      if (response.status === 'success') {
        setSelectedUser(response.data)
        setShowUserDetailsModal(true)
      } else {
        toast.error(response.message || 'Failed to get user details')
      }
      
    } catch (error: any) {
      console.error('❌ Error getting user details:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to get user details')
    }
  }

  // Get user bookings
  const handleGetUserBookings = async (userId: string) => {
    try {
      console.log('🔧 Getting user bookings for:', userId)
      
      const response = await userApi.getUserBookings(userId)
      
      if (response.status === 'success') {
        console.log('📡 User bookings loaded:', response.data.bookings)
        toast.success(`Found ${response.data.bookings.length} bookings for this user`)
        // Navigate to bookings page with user filter
        window.location.href = `/admin/bookings?userId=${userId}`
      } else {
        toast.error(response.message || 'Failed to get user bookings')
      }
      
    } catch (error: any) {
      console.error('❌ Error getting user bookings:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to get user bookings')
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchUserStats()
  }, [currentConfig])

  useEffect(() => {
    if (searchTerm || filterStatus !== 'all') {
      fetchUsers()
    }
  }, [searchTerm, filterStatus])

  // Users are already filtered by API, no need for client-side filtering
  const filteredUsers = users

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="btn-primary px-4 py-2"
        >
          Retry
        </button>
      </div>
    )
  }

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status' },
    { key: 'totalBookings', label: 'Bookings' },
    { key: 'totalSpent', label: 'Total Spent' },
    { key: 'actions', label: 'Actions' }
  ]

  const tableData = filteredUsers.map(user => ({
    ...user,
    totalSpent: `₹${user.totalSpent.toLocaleString()}`,
    status: (
      <div className="flex space-x-1">
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.isVerified ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {user.isVerified ? 'Verified' : 'Unverified'}
        </span>
      </div>
    ),
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleGetUserDetails(user._id)}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View
        </button>
        <button
          onClick={() => {
            setSelectedUser(user)
            setShowEditModal(true)
          }}
          className="text-green-400 hover:text-green-300 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => handleGetUserBookings(user._id)}
          className="text-yellow-400 hover:text-yellow-300 text-sm"
        >
          Bookings
        </button>
        <button
          onClick={() => handleDeactivateUser(user._id)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Deactivate
        </button>
      </div>
    )
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/60">Manage all users and their accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2"
        >
          + Create User
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-white/60">Total Users</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
              <div className="text-white/60">Active Users</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.verifiedUsers}</div>
              <div className="text-white/60">Verified Users</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-white/60">Total Revenue</div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Users Table */}
      <AdminCard>
        <AdminTable
          columns={tableColumns}
          data={tableData}
          title={`All Users (${filteredUsers.length})`}
        />
      </AdminCard>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSubmit={(data) => handleUpdateUser((selectedUser as any).id || (selectedUser as any)._id, data)}
        />
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetailsModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

// Create User Modal Component
function CreateUserModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: CreateUserData) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    password: '',
    isActive: true,
    isVerified: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <div className="flex space-x-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                className="mr-2"
              />
              Verified
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 btn-primary py-2"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSubmit }: { user: User, onClose: () => void, onSubmit: (data: Partial<User>) => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    state: user.state,
    isActive: user.isActive,
    isVerified: user.isVerified
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <div className="flex space-x-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                className="mr-2"
              />
              Verified
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 btn-primary py-2"
            >
              Update User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// User Details Modal Component
function UserDetailsModal({ user, onClose }: { user: User, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">User Details</h2>
        <div className="space-y-4">
          <div className="text-white">
            <strong>Name:</strong> {user.name}
          </div>
          <div className="text-white">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="text-white">
            <strong>Phone:</strong> {user.phone}
          </div>
          <div className="text-white">
            <strong>Location:</strong> {user.city}, {user.state}
          </div>
          <div className="text-white">
            <strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              user.isVerified ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {user.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div className="text-white">
            <strong>Total Bookings:</strong> {user.totalBookings}
          </div>
          <div className="text-white">
            <strong>Total Spent:</strong> ₹{user.totalSpent.toLocaleString()}
          </div>
          <div className="text-white">
            <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </div>
          {user.lastLoginAt && (
            <div className="text-white">
              <strong>Last Login:</strong> {new Date(user.lastLoginAt).toLocaleString()}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full btn-secondary py-2 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}



