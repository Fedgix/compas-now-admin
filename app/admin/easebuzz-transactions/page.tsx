'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Papa from 'papaparse'
import AdminCard from '../../../components/AdminCard'
import AdminTable from '../../../components/AdminTable'

interface Transaction {
  easebuzzId: string
  amount: number
  status: string
  customerName: string
  customerPhone: string
}

const transactionStatuses = [
  'Information',
  'Initiated',
  'Pending',
  'Success',
  'Failure',
  'Usercancelled',
  'Dropped',
  'Bounced',
  'Unknown'
]

export default function EasebuzzTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse CSV file using PapaParse
  const parseCSV = (csv: string): Transaction[] => {
    const results = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase()
    })

    if (results.errors.length > 0) {
      console.error('CSV parsing errors:', results.errors)
      toast.error('Error parsing CSV file. Please check the format.')
      return []
    }

    const data = results.data as any[]
    if (data.length === 0) return []

    // Get header keys - headers are already lowercased by transformHeader
    const headers = Object.keys(data[0])
    
    const easebuzzIdKey = headers.find(h => h.includes('easebuzz') && h.includes('id'))
    const amountKey = headers.find(h => h.includes('amount'))
    const statusKey = headers.find(h => h.includes('status'))
    const nameKey = headers.find(h => h.includes('name'))
    const phoneKey = headers.find(h => h.includes('phone'))

    // Check required columns (status is optional)
    if (!easebuzzIdKey || !amountKey || !nameKey || !phoneKey) {
      toast.error('Invalid CSV format. Required columns: Easebuzz ID, Amount, Customer Name, Customer Phone')
      return []
    }

    // Parse data rows
    const parsed: Transaction[] = []
    data.forEach(row => {
      const easebuzzId = String(row[easebuzzIdKey] || '').trim()
      const amount = parseFloat(String(row[amountKey] || '0').trim())
      const status = statusKey ? String(row[statusKey] || '').trim() : 'Unknown'
      const customerName = String(row[nameKey] || '').trim()
      const customerPhone = String(row[phoneKey] || '').trim()

      // Status is optional, but other fields are required
      if (easebuzzId && !isNaN(amount) && customerName && customerPhone) {
        parsed.push({
          easebuzzId,
          amount,
          status: status || 'Unknown',
          customerName,
          customerPhone
        })
      }
    })

    return parsed
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const parsed = parseCSV(csv)
        
        if (parsed.length === 0) {
          toast.error('No valid transactions found in CSV file')
          return
        }

        setTransactions(parsed)
        toast.success(`Successfully loaded ${parsed.length} transactions`)
      } catch (error) {
        toast.error('Error reading CSV file')
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  // Normalize status to match transactionStatuses array
  const normalizeStatus = (status: string): string => {
    // Remove spaces and convert to lowercase for matching
    const normalized = status.replace(/\s+/g, '').toLowerCase()
    // Map common variations to standard statuses
    const statusMap: { [key: string]: string } = {
      'success': 'Success',
      'failure': 'Failure',
      'pending': 'Pending',
      'initiated': 'Initiated',
      'information': 'Information',
      'usercancelled': 'Usercancelled',
      'usercanceled': 'Usercancelled',
      'dropped': 'Dropped',
      'bounced': 'Bounced',
      'unknown': 'Unknown'
    }
    
    return statusMap[normalized] || status
  }

  // Filter transactions and apply filters whenever dependencies change
  useEffect(() => {
    let filtered = [...transactions]

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => normalizeStatus(t.status) === selectedStatus)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t => 
        t.easebuzzId.toLowerCase().includes(term) ||
        t.customerName.toLowerCase().includes(term) ||
        t.customerPhone.includes(term)
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, selectedStatus, searchTerm])

  // Calculate statistics
  const calculateStats = () => {
    const stats: { [key: string]: { count: number; sum: number } } = {}
    
    transactionStatuses.forEach(status => {
      stats[status] = { count: 0, sum: 0 }
    })

    filteredTransactions.forEach(tx => {
      const normalizedStatus = normalizeStatus(tx.status)
      if (stats[normalizedStatus]) {
        stats[normalizedStatus].count++
        stats[normalizedStatus].sum += tx.amount
      } else {
        stats['Unknown'].count++
        stats['Unknown'].sum += tx.amount
      }
    })

    return stats
  }

  // Calculate recurring amounts (group by amount)
  const calculateRecurringAmounts = () => {
    const amountGroups: { [key: number]: {
      amount: number
      count: number
      total: number
      statusBreakdown: { [key: string]: { count: number; sum: number } }
      transactions: Transaction[]
    } } = {}

    filteredTransactions.forEach(tx => {
      const normalizedStatus = normalizeStatus(tx.status)
      
      if (!amountGroups[tx.amount]) {
        amountGroups[tx.amount] = {
          amount: tx.amount,
          count: 0,
          total: 0,
          statusBreakdown: {},
          transactions: []
        }
        
        // Initialize status breakdown
        transactionStatuses.forEach(status => {
          amountGroups[tx.amount].statusBreakdown[status] = { count: 0, sum: 0 }
        })
      }

      amountGroups[tx.amount].count++
      amountGroups[tx.amount].total += tx.amount
      amountGroups[tx.amount].transactions.push(tx)
      
      if (amountGroups[tx.amount].statusBreakdown[normalizedStatus]) {
        amountGroups[tx.amount].statusBreakdown[normalizedStatus].count++
        amountGroups[tx.amount].statusBreakdown[normalizedStatus].sum += tx.amount
      } else {
        if (!amountGroups[tx.amount].statusBreakdown['Unknown']) {
          amountGroups[tx.amount].statusBreakdown['Unknown'] = { count: 0, sum: 0 }
        }
        amountGroups[tx.amount].statusBreakdown['Unknown'].count++
        amountGroups[tx.amount].statusBreakdown['Unknown'].sum += tx.amount
      }
    })

    // Convert to array and sort by count (most recurring first)
    return Object.values(amountGroups).sort((a, b) => b.count - a.count)
  }

  const stats = calculateStats()
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  const recurringAmounts = calculateRecurringAmounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Easebuzz Transactions</h1>
          <p className="text-white/60">Upload and analyze Easebuzz payment transactions</p>
        </div>
        <div className="flex space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary px-4 py-2"
          >
            📤 Upload CSV
          </button>
          {transactions.length > 0 && (
            <button
              onClick={() => {
                setTransactions([])
                setFilteredTransactions([])
                setSelectedStatus('all')
                setSearchTerm('')
                toast.success('Data cleared')
              }}
              className="btn-secondary px-4 py-2"
            >
              Clear Data
            </button>
          )}
        </div>
      </div>

      {/* Info Alert if status is Unknown */}
      {transactions.length > 0 && stats.Unknown && stats.Unknown.count > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            ℹ️ Your CSV file is missing the "Transaction status" column. All transactions are marked as "Unknown". 
            Add a "Transaction status" column with values like "Success", "Failure", "Pending", etc., to see proper status filtering.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {transactions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminCard>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{filteredTransactions.length}</div>
                <div className="text-white/60">Total Transactions</div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">₹{totalAmount.toLocaleString()}</div>
                <div className="text-white/60">Total Amount</div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  ₹{stats.Success ? stats.Success.sum.toLocaleString() : '0'}
                </div>
                <div className="text-white/60">Successful Amount</div>
              </div>
            </AdminCard>
          </div>

          {/* Recurring Amounts Analysis */}
          {recurringAmounts.length > 0 && (
            <AdminCard>
              <h3 className="text-lg font-semibold text-white mb-4">Recurring Amounts Analysis</h3>
              <div className="space-y-4">
                {recurringAmounts.map((group, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xl font-bold text-white">₹{group.amount.toLocaleString()}</div>
                        <div className="text-white/60 text-sm">Recurring Amount</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{group.count} transactions</div>
                        <div className="text-white/60 text-sm">Total: ₹{group.total.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {/* Status Breakdown */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-white/80 mb-2">Status Breakdown:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(group.statusBreakdown)
                          .filter(([_, data]) => data.count > 0)
                          .map(([status, data]) => (
                            <div key={status} className="bg-white/5 px-3 py-1 rounded text-xs">
                              <span className={`${
                                status === 'Success' ? 'text-green-400' :
                                status === 'Failure' ? 'text-red-400' :
                                status === 'Bounced' ? 'text-red-400' :
                                status === 'Pending' ? 'text-yellow-400' :
                                'text-white/60'
                              }`}>
                                {status}: {data.count} (₹{data.sum.toLocaleString()})
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* User Details */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium">
                        View {group.transactions.length} Transaction{group.transactions.length > 1 ? 's' : ''} Details
                      </summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-2 px-2 text-white/60">Easebuzz ID</th>
                              <th className="text-left py-2 px-2 text-white/60">Customer Name</th>
                              <th className="text-left py-2 px-2 text-white/60">Phone</th>
                              <th className="text-left py-2 px-2 text-white/60">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.transactions.map((tx, txIndex) => (
                              <tr key={txIndex} className="border-b border-white/5">
                                <td className="py-2 px-2 text-white/80">{tx.easebuzzId}</td>
                                <td className="py-2 px-2 text-white/80">{tx.customerName}</td>
                                <td className="py-2 px-2 text-white/80">{tx.customerPhone}</td>
                                <td className="py-2 px-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    normalizeStatus(tx.status) === 'Success' ? 'bg-green-500/20 text-green-400' :
                                    normalizeStatus(tx.status) === 'Failure' ? 'bg-red-500/20 text-red-400' :
                                    normalizeStatus(tx.status) === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    normalizeStatus(tx.status) === 'Bounced' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {/* Status Summary Cards */}
          <AdminCard>
            <h3 className="text-lg font-semibold text-white mb-4">Status Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {transactionStatuses.map(status => (
                <div key={status} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="text-xs text-white/60 mb-1">{status}</div>
                  <div className="text-white font-semibold">{stats[status]?.count || 0}</div>
                  <div className="text-primary text-sm">
                    ₹{stats[status]?.sum.toLocaleString() || '0'}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </>
      )}

      {/* Upload Prompt */}
      {transactions.length === 0 && (
        <AdminCard>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Data Loaded</h3>
            <p className="text-white/60 mb-6">Upload a CSV file to view and analyze Easebuzz transactions</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary px-6 py-3"
            >
              Upload CSV File
            </button>
          </div>
        </AdminCard>
      )}

      {/* Filters */}
      {transactions.length > 0 && (
        <AdminCard>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
              />
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="all">All Status</option>
                {transactionStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <AdminCard>
          <AdminTable
            columns={[
              { key: 'easebuzzId', label: 'Easebuzz ID' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'customerName', label: 'Customer Name' },
              { key: 'customerPhone', label: 'Phone' }
            ]}
            data={filteredTransactions.map(tx => ({
              ...tx,
              amount: `₹${tx.amount.toLocaleString()}`,
              status: (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  normalizeStatus(tx.status) === 'Success' ? 'bg-green-500/20 text-green-400' :
                  normalizeStatus(tx.status) === 'Failure' ? 'bg-red-500/20 text-red-400' :
                  normalizeStatus(tx.status) === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  normalizeStatus(tx.status) === 'Initiated' ? 'bg-blue-500/20 text-blue-400' :
                  normalizeStatus(tx.status) === 'Information' ? 'bg-purple-500/20 text-purple-400' :
                  normalizeStatus(tx.status) === 'Usercancelled' ? 'bg-orange-500/20 text-orange-400' :
                  normalizeStatus(tx.status) === 'Dropped' ? 'bg-gray-500/20 text-gray-400' :
                  normalizeStatus(tx.status) === 'Bounced' ? 'bg-red-500/20 text-red-400' :
                  normalizeStatus(tx.status) === 'Unknown' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {tx.status}
                </span>
              )
            }))}
            title={`Transactions (${filteredTransactions.length})`}
          />
        </AdminCard>
      )}
    </div>
  )
} 