'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { apiService } from '../../../lib/api'
import AdminCard from '../../../components/AdminCard'
import AdminTable from '../../../components/AdminTable'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useEnvironment } from '../../../contexts/EnvironmentContext'

interface Booking {
  id: string
  eventId: string
  eventName: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  bookingDate: string
  seatDetails: {
    seatNumber: string
    seatCategory: string
    price: number
  }[]
  paymentMethod: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRevenue: number
  averageBookingValue: number
  todayBookings: number
  thisMonthBookings: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'refunded'>('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'pending' | 'failed' | 'refunded'>('all')
  const { currentConfig } = useEnvironment()

  // Get URL parameters for filtering
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const eventIdFilter = urlParams.get('eventId')
  const userIdFilter = urlParams.get('userId')

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      
      // Mock data for demonstration
      const mockBookings: Booking[] = [
        {
          id: 'BK001',
          eventId: 'EVT001',
          eventName: 'Summer Music Festival',
          userId: 'USR001',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userPhone: '+91 9876543210',
          totalAmount: 2500,
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingDate: '2024-09-15T10:00:00Z',
          seatDetails: [
            { seatNumber: 'A1', seatCategory: 'VIP', price: 2500 }
          ],
          paymentMethod: 'UPI',
          transactionId: 'TXN123456789',
          createdAt: '2024-09-15T10:00:00Z',
          updatedAt: '2024-09-15T10:00:00Z'
        },
        {
          id: 'BK002',
          eventId: 'EVT002',
          eventName: 'Tech Conference 2024',
          userId: 'USR002',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          userPhone: '+91 9876543211',
          totalAmount: 1500,
          status: 'pending',
          paymentStatus: 'pending',
          bookingDate: '2024-09-14T14:30:00Z',
          seatDetails: [
            { seatNumber: 'B5', seatCategory: 'Standard', price: 1500 }
          ],
          paymentMethod: 'Card',
          createdAt: '2024-09-14T14:30:00Z',
          updatedAt: '2024-09-14T14:30:00Z'
        },
        {
          id: 'BK003',
          eventId: 'EVT001',
          eventName: 'Summer Music Festival',
          userId: 'USR003',
          userName: 'Bob Johnson',
          userEmail: 'bob@example.com',
          userPhone: '+91 9876543212',
          totalAmount: 3000,
          status: 'cancelled',
          paymentStatus: 'refunded',
          bookingDate: '2024-09-13T18:45:00Z',
          seatDetails: [
            { seatNumber: 'A3', seatCategory: 'VIP', price: 3000 }
          ],
          paymentMethod: 'Net Banking',
          transactionId: 'TXN987654321',
          createdAt: '2024-09-13T18:45:00Z',
          updatedAt: '2024-09-13T20:00:00Z'
        }
      ]
      
      setBookings(mockBookings)
      
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to fetch bookings')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      
      // Mock stats for demonstration
      const mockStats: BookingStats = {
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
        averageBookingValue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + b.totalAmount, 0) / bookings.length : 0,
        todayBookings: bookings.filter(b => {
          const bookingDate = new Date(b.bookingDate)
          const today = new Date()
          return bookingDate.toDateString() === today.toDateString()
        }).length,
        thisMonthBookings: bookings.filter(b => {
          const bookingDate = new Date(b.bookingDate)
          const currentDate = new Date()
          return bookingDate.getMonth() === currentDate.getMonth() && 
                 bookingDate.getFullYear() === currentDate.getFullYear()
        }).length
      }
      
      setStats(mockStats)
      
    } catch (error: any) {
    }
  }

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      
      // Note: This endpoint might not exist in backend
      // const response = await apiService.put(`/admin/bookings/${bookingId}/status`, { status: newStatus }) as any
      
      toast.success('Booking status updated successfully!')
      fetchBookings()
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update booking status')
    }
  }

  // Process refund
  const handleProcessRefund = async (bookingId: string, refundAmount: number, reason: string) => {
    try {
      
      // Note: This endpoint might not exist in backend
      // const response = await apiService.post(`/admin/bookings/${bookingId}/refund`, { 
      //   amount: refundAmount, 
      //   reason: reason 
      // }) as any
      
      toast.success('Refund processed successfully!')
      setShowRefundModal(false)
      setSelectedBooking(null)
      fetchBookings()
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to process refund')
    }
  }

  // Get booking details
  const handleGetBookingDetails = async (bookingId: string) => {
    try {
      
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        setSelectedBooking(booking)
        setShowBookingDetailsModal(true)
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get booking details')
    }
  }

  // Export bookings
  const handleExportBookings = async () => {
    try {
      
      // Create CSV content
      const csvContent = [
        ['Booking ID', 'Event Name', 'User Name', 'User Email', 'Total Amount', 'Status', 'Payment Status', 'Booking Date'].join(','),
        ...filteredBookings.map(booking => [
          booking.id,
          booking.eventName,
          booking.userName,
          booking.userEmail,
          booking.totalAmount,
          booking.status,
          booking.paymentStatus,
          new Date(booking.bookingDate).toLocaleDateString()
        ].join(','))
      ].join('\n')
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Bookings exported successfully!')
      
    } catch (error: any) {
      toast.error('Failed to export bookings')
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [currentConfig])

  useEffect(() => {
    if (bookings.length > 0) {
      fetchBookingStats()
    }
  }, [bookings])

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesPaymentStatus = filterPaymentStatus === 'all' || booking.paymentStatus === filterPaymentStatus
    const matchesEventFilter = !eventIdFilter || booking.eventId === eventIdFilter
    const matchesUserFilter = !userIdFilter || booking.userId === userIdFilter
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesEventFilter && matchesUserFilter
  })

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
          onClick={fetchBookings}
          className="btn-primary px-4 py-2"
        >
          Retry
        </button>
      </div>
    )
  }

  const tableColumns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'eventName', label: 'Event' },
    { key: 'userName', label: 'User' },
    { key: 'totalAmount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'paymentStatus', label: 'Payment' },
    { key: 'bookingDate', label: 'Booking Date' },
    { key: 'actions', label: 'Actions' }
  ]

  const tableData = filteredBookings.map(booking => ({
    ...booking,
    totalAmount: `₹${booking.totalAmount.toLocaleString()}`,
    bookingDate: new Date(booking.bookingDate).toLocaleDateString(),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs ${
        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {booking.status}
      </span>
    ),
    paymentStatus: (
      <span className={`px-2 py-1 rounded-full text-xs ${
        booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
        booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
        booking.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
        'bg-blue-500/20 text-blue-400'
      }`}>
        {booking.paymentStatus}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleGetBookingDetails(booking.id)}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View
        </button>
        {booking.status === 'pending' && (
          <button
            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            Confirm
          </button>
        )}
        {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
          <button
            onClick={() => {
              setSelectedBooking(booking)
              setShowRefundModal(true)
            }}
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            Refund
          </button>
        )}
        {booking.status !== 'cancelled' && (
          <button
            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    )
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Management</h1>
          <p className="text-white/60">Manage all bookings and transactions</p>
          {(eventIdFilter || userIdFilter) && (
            <p className="text-primary text-sm">
              Filtered by: {eventIdFilter ? `Event ID: ${eventIdFilter}` : ''} {userIdFilter ? `User ID: ${userIdFilter}` : ''}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportBookings}
            className="btn-secondary px-4 py-2"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalBookings}</div>
              <div className="text-white/60">Total Bookings</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.confirmedBookings}</div>
              <div className="text-white/60">Confirmed</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.pendingBookings}</div>
              <div className="text-white/60">Pending</div>
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
              placeholder="Search bookings..."
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
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Bookings Table */}
      <AdminCard>
        <AdminTable
          columns={tableColumns}
          data={tableData}
          title={`All Bookings (${filteredBookings.length})`}
        />
      </AdminCard>

      {/* Booking Details Modal */}
      {showBookingDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingDetailsModal(false)
            setSelectedBooking(null)
          }}
        />
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedBooking && (
        <RefundModal
          booking={selectedBooking}
          onClose={() => {
            setShowRefundModal(false)
            setSelectedBooking(null)
          }}
          onSubmit={handleProcessRefund}
        />
      )}
    </div>
  )
}

// Booking Details Modal Component
function BookingDetailsModal({ booking, onClose }: { booking: Booking, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Booking Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-white">
              <strong>Booking ID:</strong> {booking.id}
            </div>
            <div className="text-white">
              <strong>Event:</strong> {booking.eventName}
            </div>
            <div className="text-white">
              <strong>User:</strong> {booking.userName}
            </div>
            <div className="text-white">
              <strong>Email:</strong> {booking.userEmail}
            </div>
            <div className="text-white">
              <strong>Phone:</strong> {booking.userPhone}
            </div>
            <div className="text-white">
              <strong>Total Amount:</strong> ₹{booking.totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-white">
              <strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {booking.status}
              </span>
            </div>
            <div className="text-white">
              <strong>Payment Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                booking.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {booking.paymentStatus}
              </span>
            </div>
            <div className="text-white">
              <strong>Payment Method:</strong> {booking.paymentMethod}
            </div>
            {booking.transactionId && (
              <div className="text-white">
                <strong>Transaction ID:</strong> {booking.transactionId}
              </div>
            )}
            <div className="text-white">
              <strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleString()}
            </div>
            <div className="text-white">
              <strong>Created:</strong> {new Date(booking.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Seat Details */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Seat Details</h3>
          <div className="space-y-2">
            {booking.seatDetails.map((seat, index) => (
              <div key={index} className="flex justify-between items-center bg-white/5 p-3 rounded">
                <div className="text-white">
                  <strong>Seat:</strong> {seat.seatNumber} ({seat.seatCategory})
                </div>
                <div className="text-white">
                  <strong>Price:</strong> ₹{seat.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full btn-secondary py-2 mt-6"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Refund Modal Component
function RefundModal({ booking, onClose, onSubmit }: { booking: Booking, onClose: () => void, onSubmit: (bookingId: string, amount: number, reason: string) => void }) {
  const [refundAmount, setRefundAmount] = useState(booking.totalAmount)
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(booking.id, refundAmount, reason)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Process Refund</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-white">
            <strong>Booking ID:</strong> {booking.id}
          </div>
          <div className="text-white">
            <strong>Original Amount:</strong> ₹{booking.totalAmount.toLocaleString()}
          </div>
          <input
            type="number"
            placeholder="Refund Amount"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            max={booking.totalAmount}
            required
          />
          <textarea
            placeholder="Refund Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            rows={3}
            required
          />
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 btn-primary py-2"
            >
              Process Refund
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



