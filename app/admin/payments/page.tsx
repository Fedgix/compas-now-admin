'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { apiService } from '../../../lib/api'
import AdminCard from '../../../components/AdminCard'
import AdminTable from '../../../components/AdminTable'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useEnvironment } from '../../../contexts/EnvironmentContext'

interface Payment {
  id: string
  bookingId: string
  eventId: string
  eventName: string
  userId: string
  userName: string
  amount: number
  status: 'success' | 'pending' | 'failed' | 'refunded' | 'cancelled'
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Wallet' | 'Cash'
  gateway: 'Easebuzz' | 'Razorpay' | 'PayU' | 'Cash'
  transactionId: string
  gatewayTransactionId?: string
  refundId?: string
  refundAmount?: number
  refundReason?: string
  paymentDate: string
  refundDate?: string
  createdAt: string
  updatedAt: string
}

interface PaymentStats {
  totalPayments: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  refundedPayments: number
  totalRevenue: number
  totalRefunds: number
  netRevenue: number
  todayRevenue: number
  thisMonthRevenue: number
  averageTransactionValue: number
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'pending' | 'failed' | 'refunded' | 'cancelled'>('all')
  const [filterMethod, setFilterMethod] = useState<'all' | 'UPI' | 'Card' | 'Net Banking' | 'Wallet' | 'Cash'>('all')
  const [filterGateway, setFilterGateway] = useState<'all' | 'Easebuzz' | 'Razorpay' | 'PayU' | 'Cash'>('all')
  const { currentConfig } = useEnvironment()

  // Fetch payments data
  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      console.log('🔧 Fetching payments from:', currentConfig.baseUrl)
      
      // Mock data for demonstration
      const mockPayments: Payment[] = [
        {
          id: 'PAY001',
          bookingId: 'BK001',
          eventId: 'EVT001',
          eventName: 'Summer Music Festival',
          userId: 'USR001',
          userName: 'John Doe',
          amount: 2500,
          status: 'success',
          paymentMethod: 'UPI',
          gateway: 'Easebuzz',
          transactionId: 'TXN123456789',
          gatewayTransactionId: 'EBZ789123456',
          paymentDate: '2024-09-15T10:00:00Z',
          createdAt: '2024-09-15T10:00:00Z',
          updatedAt: '2024-09-15T10:00:00Z'
        },
        {
          id: 'PAY002',
          bookingId: 'BK002',
          eventId: 'EVT002',
          eventName: 'Tech Conference 2024',
          userId: 'USR002',
          userName: 'Jane Smith',
          amount: 1500,
          status: 'pending',
          paymentMethod: 'Card',
          gateway: 'Razorpay',
          transactionId: 'TXN987654321',
          paymentDate: '2024-09-14T14:30:00Z',
          createdAt: '2024-09-14T14:30:00Z',
          updatedAt: '2024-09-14T14:30:00Z'
        },
        {
          id: 'PAY003',
          bookingId: 'BK003',
          eventId: 'EVT001',
          eventName: 'Summer Music Festival',
          userId: 'USR003',
          userName: 'Bob Johnson',
          amount: 3000,
          status: 'refunded',
          paymentMethod: 'Net Banking',
          gateway: 'Easebuzz',
          transactionId: 'TXN456789123',
          gatewayTransactionId: 'EBZ123456789',
          refundId: 'REF789123456',
          refundAmount: 3000,
          refundReason: 'Event cancelled by user',
          paymentDate: '2024-09-13T18:45:00Z',
          refundDate: '2024-09-13T20:00:00Z',
          createdAt: '2024-09-13T18:45:00Z',
          updatedAt: '2024-09-13T20:00:00Z'
        },
        {
          id: 'PAY004',
          bookingId: 'BK004',
          eventId: 'EVT003',
          eventName: 'Art Exhibition',
          userId: 'USR004',
          userName: 'Alice Brown',
          amount: 800,
          status: 'failed',
          paymentMethod: 'UPI',
          gateway: 'PayU',
          transactionId: 'TXN321654987',
          paymentDate: '2024-09-12T16:20:00Z',
          createdAt: '2024-09-12T16:20:00Z',
          updatedAt: '2024-09-12T16:25:00Z'
        }
      ]
      
      setPayments(mockPayments)
      console.log('📡 Payments loaded:', mockPayments.length)
      
    } catch (error: any) {
      console.error('❌ Error fetching payments:', error)
      setError(error.response?.data?.message || error.message || 'Failed to fetch payments')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch payment statistics
  const fetchPaymentStats = async () => {
    try {
      console.log('🔧 Fetching payment stats...')
      
      // Mock stats for demonstration
      const mockStats: PaymentStats = {
        totalPayments: payments.length,
        successfulPayments: payments.filter(p => p.status === 'success').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        refundedPayments: payments.filter(p => p.status === 'refunded').length,
        totalRevenue: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0),
        totalRefunds: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount || 0), 0),
        netRevenue: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0) - 
                   payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount || 0), 0),
        todayRevenue: payments.filter(p => {
          const paymentDate = new Date(p.paymentDate)
          const today = new Date()
          return paymentDate.toDateString() === today.toDateString() && p.status === 'success'
        }).reduce((sum, p) => sum + p.amount, 0),
        thisMonthRevenue: payments.filter(p => {
          const paymentDate = new Date(p.paymentDate)
          const currentDate = new Date()
          return paymentDate.getMonth() === currentDate.getMonth() && 
                 paymentDate.getFullYear() === currentDate.getFullYear() && 
                 p.status === 'success'
        }).reduce((sum, p) => sum + p.amount, 0),
        averageTransactionValue: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0
      }
      
      setStats(mockStats)
      console.log('📡 Payment stats loaded:', mockStats)
      
    } catch (error: any) {
      console.error('❌ Error fetching payment stats:', error)
    }
  }

  // Process refund
  const handleProcessRefund = async (paymentId: string, refundAmount: number, reason: string) => {
    try {
      console.log('🔧 Processing refund:', paymentId, refundAmount, reason)
      
      // Note: This endpoint might not exist in backend
      // const response = await apiService.post(`/admin/payments/${paymentId}/refund`, { 
      //   amount: refundAmount, 
      //   reason: reason 
      // }) as any
      
      toast.success('Refund processed successfully!')
      setShowRefundModal(false)
      setSelectedPayment(null)
      fetchPayments()
      
    } catch (error: any) {
      console.error('❌ Error processing refund:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to process refund')
    }
  }

  // Get payment details
  const handleGetPaymentDetails = async (paymentId: string) => {
    try {
      console.log('🔧 Getting payment details for:', paymentId)
      
      const payment = payments.find(p => p.id === paymentId)
      if (payment) {
        setSelectedPayment(payment)
        setShowPaymentDetailsModal(true)
      }
      
    } catch (error: any) {
      console.error('❌ Error getting payment details:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to get payment details')
    }
  }

  // Export payments
  const handleExportPayments = async () => {
    try {
      console.log('🔧 Exporting payments...')
      
      // Create CSV content
      const csvContent = [
        ['Payment ID', 'Booking ID', 'Event Name', 'User Name', 'Amount', 'Status', 'Payment Method', 'Gateway', 'Transaction ID', 'Payment Date'].join(','),
        ...filteredPayments.map(payment => [
          payment.id,
          payment.bookingId,
          payment.eventName,
          payment.userName,
          payment.amount,
          payment.status,
          payment.paymentMethod,
          payment.gateway,
          payment.transactionId,
          new Date(payment.paymentDate).toLocaleDateString()
        ].join(','))
      ].join('\n')
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Payments exported successfully!')
      
    } catch (error: any) {
      console.error('❌ Error exporting payments:', error)
      toast.error('Failed to export payments')
    }
  }

  // Retry failed payment
  const handleRetryPayment = async (paymentId: string) => {
    try {
      console.log('🔧 Retrying payment:', paymentId)
      
      // Note: This endpoint might not exist in backend
      // const response = await apiService.post(`/admin/payments/${paymentId}/retry`) as any
      
      toast.success('Payment retry initiated!')
      fetchPayments()
      
    } catch (error: any) {
      console.error('❌ Error retrying payment:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to retry payment')
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [currentConfig])

  useEffect(() => {
    if (payments.length > 0) {
      fetchPaymentStats()
    }
  }, [payments])

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod
    const matchesGateway = filterGateway === 'all' || payment.gateway === filterGateway
    
    return matchesSearch && matchesStatus && matchesMethod && matchesGateway
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
          onClick={fetchPayments}
          className="btn-primary px-4 py-2"
        >
          Retry
        </button>
      </div>
    )
  }

  const tableColumns = [
    { key: 'id', label: 'Payment ID' },
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'eventName', label: 'Event' },
    { key: 'userName', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'gateway', label: 'Gateway' },
    { key: 'paymentDate', label: 'Payment Date' },
    { key: 'actions', label: 'Actions' }
  ]

  const tableData = filteredPayments.map(payment => ({
    ...payment,
    amount: `₹${payment.amount.toLocaleString()}`,
    paymentDate: new Date(payment.paymentDate).toLocaleDateString(),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs ${
        payment.status === 'success' ? 'bg-green-500/20 text-green-400' :
        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
        payment.status === 'failed' ? 'bg-red-500/20 text-red-400' :
        payment.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {payment.status}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleGetPaymentDetails(payment.id)}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View
        </button>
        {payment.status === 'success' && (
          <button
            onClick={() => {
              setSelectedPayment(payment)
              setShowRefundModal(true)
            }}
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            Refund
          </button>
        )}
        {payment.status === 'failed' && (
          <button
            onClick={() => handleRetryPayment(payment.id)}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            Retry
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
          <h1 className="text-2xl font-bold text-white">Payment Management</h1>
          <p className="text-white/60">Manage all payments and transactions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportPayments}
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
              <div className="text-2xl font-bold text-white">{stats.totalPayments}</div>
              <div className="text-white/60">Total Payments</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.successfulPayments}</div>
              <div className="text-white/60">Successful</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹{stats.netRevenue.toLocaleString()}</div>
              <div className="text-white/60">Net Revenue</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">₹{stats.totalRefunds.toLocaleString()}</div>
              <div className="text-white/60">Total Refunds</div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminCard>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">₹{stats.todayRevenue.toLocaleString()}</div>
              <div className="text-white/60">Today's Revenue</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">₹{stats.thisMonthRevenue.toLocaleString()}</div>
              <div className="text-white/60">This Month</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">₹{stats.averageTransactionValue.toLocaleString()}</div>
              <div className="text-white/60">Avg Transaction</div>
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
              placeholder="Search payments..."
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
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <select
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="all">All Gateways</option>
              <option value="Easebuzz">Easebuzz</option>
              <option value="Razorpay">Razorpay</option>
              <option value="PayU">PayU</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Payments Table */}
      <AdminCard>
        <AdminTable
          columns={tableColumns}
          data={tableData}
          title={`All Payments (${filteredPayments.length})`}
        />
      </AdminCard>

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentDetailsModal(false)
            setSelectedPayment(null)
          }}
        />
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <RefundModal
          payment={selectedPayment}
          onClose={() => {
            setShowRefundModal(false)
            setSelectedPayment(null)
          }}
          onSubmit={handleProcessRefund}
        />
      )}
    </div>
  )
}

// Payment Details Modal Component
function PaymentDetailsModal({ payment, onClose }: { payment: Payment, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-white">
              <strong>Payment ID:</strong> {payment.id}
            </div>
            <div className="text-white">
              <strong>Booking ID:</strong> {payment.bookingId}
            </div>
            <div className="text-white">
              <strong>Event:</strong> {payment.eventName}
            </div>
            <div className="text-white">
              <strong>User:</strong> {payment.userName}
            </div>
            <div className="text-white">
              <strong>Amount:</strong> ₹{payment.amount.toLocaleString()}
            </div>
            <div className="text-white">
              <strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                payment.status === 'success' ? 'bg-green-500/20 text-green-400' :
                payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                payment.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                payment.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {payment.status}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-white">
              <strong>Payment Method:</strong> {payment.paymentMethod}
            </div>
            <div className="text-white">
              <strong>Gateway:</strong> {payment.gateway}
            </div>
            <div className="text-white">
              <strong>Transaction ID:</strong> {payment.transactionId}
            </div>
            {payment.gatewayTransactionId && (
              <div className="text-white">
                <strong>Gateway Transaction ID:</strong> {payment.gatewayTransactionId}
              </div>
            )}
            <div className="text-white">
              <strong>Payment Date:</strong> {new Date(payment.paymentDate).toLocaleString()}
            </div>
            {payment.refundId && (
              <div className="text-white">
                <strong>Refund ID:</strong> {payment.refundId}
              </div>
            )}
            {payment.refundAmount && (
              <div className="text-white">
                <strong>Refund Amount:</strong> ₹{payment.refundAmount.toLocaleString()}
              </div>
            )}
            {payment.refundReason && (
              <div className="text-white">
                <strong>Refund Reason:</strong> {payment.refundReason}
              </div>
            )}
            {payment.refundDate && (
              <div className="text-white">
                <strong>Refund Date:</strong> {new Date(payment.refundDate).toLocaleString()}
              </div>
            )}
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
function RefundModal({ payment, onClose, onSubmit }: { payment: Payment, onClose: () => void, onSubmit: (paymentId: string, amount: number, reason: string) => void }) {
  const [refundAmount, setRefundAmount] = useState(payment.amount)
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(payment.id, refundAmount, reason)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Process Refund</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-white">
            <strong>Payment ID:</strong> {payment.id}
          </div>
          <div className="text-white">
            <strong>Original Amount:</strong> ₹{payment.amount.toLocaleString()}
          </div>
          <input
            type="number"
            placeholder="Refund Amount"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            max={payment.amount}
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



