'use client'

import { useState, useEffect } from 'react'
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX, FiDownload, FiInfo } from 'react-icons/fi'
import { moviePassApi } from '@/lib/moviePassApi'
import { authApiService } from '@/lib/authApi'
import { subscriptionPlanApi } from '@/lib/subscriptionPlanApi'
import { useRouter } from 'next/navigation'

interface UploadResult {
  batch: {
    id: string
    batchId: string
    batchName: string
    planType: string
    totalMoviePasses: number
    availableMoviePasses: number
    status: string
    expiryDate: string
  }
  totalProcessed: number
  totalCreated: number
  duplicatesSkipped: number
  duplicateCodes: string[]
  expiryDate: string
}

export default function ImportExcelPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  
  // Form data
  const [planId, setPlanId] = useState('')
  const [planType, setPlanType] = useState('SILVER')
  const [batchName, setBatchName] = useState('Silver Batch - October 2025')
  const [expiryDays, setExpiryDays] = useState(30)

  // Check authentication and load plans on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authApiService.isAuthenticated()) {
        setIsAuthenticated(true)
        await loadAvailablePlans()
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  // Load available subscription plans
  const loadAvailablePlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await subscriptionPlanApi.getAllSubscriptionPlans()
      
      // Handle response structure - check if it has 'data' property
      const plansData = (response as any)?.data || response
      
      if (plansData && Array.isArray(plansData)) {
        setAvailablePlans(plansData)
        
        // Set default plan if available
        if (plansData.length > 0) {
          const defaultPlan = plansData.find(plan => (plan.planId || plan.name) === 'SILVER') || plansData[0]
          setPlanId(defaultPlan._id || defaultPlan.id)
          setPlanType(defaultPlan.planId || defaultPlan.name)
        }
      } else {
        setError('No subscription plans found')
      }
    } catch (error) {
      setError('Failed to load subscription plans: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xlsx, .xls) or CSV file')
        return
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    if (!planId || !planType || !batchName || !expiryDays) {
      setError('Please fill in all required fields: Select a subscription plan, Batch Name, and Expiry Days')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('excelFile', file)
      formData.append('planId', planId)
      formData.append('planType', planType)
      formData.append('batchName', batchName)
      formData.append('expiryDays', expiryDays.toString())

      const data = await moviePassApi.importBatchFromExcel(formData)

      if (data.status === 'success') {
        setResult(data.data)
        setSuccess(`Successfully imported ${data.data.totalCreated} movie passes from Excel file!`)
      } else {
        throw new Error(data.message || 'Upload failed')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setSuccess(null)
    setPlanId('')
    setPlanType('SILVER')
    setBatchName('Silver Batch - October 2025')
    setExpiryDays(30)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-white mb-4 text-xl">Authentication Required</p>
          <p className="text-gray-400 mb-6">You need to be logged in as an admin to access this page.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-primary text-black px-6 py-2 rounded-lg hover:bg-primary/90 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Import Movie Pass Batch from Excel</h1>
          <p className="text-gray-400">Upload an Excel file to import movie pass coupons in bulk</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <FiInfo className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-blue-300 mb-3">Instructions</h3>
              <div className="text-blue-200 space-y-2">
                <p>• Excel file should have voucher codes in the second column</p>
                <p>• First row should contain headers (Sr No., Voucher No, etc.)</p>
                <p>• File size limit: 10MB maximum</p>
                <p>• Supported formats: .xlsx, .xls, .csv</p>
                <p>• Duplicate voucher codes will be automatically skipped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <span className="text-green-300">{success}</span>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Upload Excel File</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Excel File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    file 
                      ? 'border-green-500 bg-green-900/10 hover:bg-green-900/20' 
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-center">
                    {file ? (
                      <div className="flex items-center gap-3">
                        <FiFile className="h-8 w-8 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-green-300">{file.name}</p>
                          <p className="text-xs text-green-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-300">
                          Click to upload Excel file
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          .xlsx, .xls, .csv (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Subscription Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Subscription Plan *
              </label>
              {loadingPlans ? (
                <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-400 rounded-md flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  Loading plans...
                </div>
              ) : (
                <select
                  value={planId}
                  onChange={(e) => {
                    const selectedPlan = availablePlans.find(plan => (plan._id || plan.id) === e.target.value)
                    if (selectedPlan) {
                      setPlanId(selectedPlan._id || selectedPlan.id)
                      setPlanType(selectedPlan.planId || selectedPlan.name)
                    } else {
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={uploading}
                >
                  <option value="">Select a plan...</option>
                  {availablePlans.map((plan) => (
                    <option key={plan._id || plan.id} value={plan._id || plan.id}>
                      {plan.planId || plan.name} - {plan.displayName || plan.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Plan Type (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan Type
              </label>
              <input
                type="text"
                value={planType}
                readOnly
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-300 rounded-md cursor-not-allowed"
                placeholder="Will be set automatically"
              />
            </div>

            {/* Plan ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan ID
              </label>
              <input
                type="text"
                value={planId}
                readOnly
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-300 rounded-md cursor-not-allowed"
                placeholder="Will be set automatically"
              />
            </div>

            {/* Loading Plans Message */}
            {loadingPlans && (
              <div className="md:col-span-2 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                  <span className="text-yellow-300">Loading subscription plans from server...</span>
                </div>
              </div>
            )}

            {/* No Plans Available */}
            {!loadingPlans && availablePlans.length === 0 && (
              <div className="md:col-span-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-300">No subscription plans found. Please create a plan first.</span>
                </div>
              </div>
            )}

            {/* Selected Plan Preview */}
            {planId && !loadingPlans && (
              <div className="md:col-span-2 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FiInfo className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-medium text-blue-300">Selected Plan Preview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-200">Plan Type:</span>
                      <span className="text-white font-medium">{planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Plan ID:</span>
                      <span className="text-white font-mono text-sm">{planId}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {availablePlans.find(plan => (plan._id || plan.id) === planId) && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-blue-200">Plan Name:</span>
                          <span className="text-white">
                            {availablePlans.find(plan => (plan._id || plan.id) === planId)?.displayName || 
                             availablePlans.find(plan => (plan._id || plan.id) === planId)?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-200">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            availablePlans.find(plan => (plan._id || plan.id) === planId)?.isActive 
                              ? 'bg-green-900/50 text-green-300' 
                              : 'bg-red-900/50 text-red-300'
                          }`}>
                            {availablePlans.find(plan => (plan._id || plan.id) === planId)?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="md:col-span-2 p-3 bg-gray-700 rounded-md text-xs">
                <div className="text-gray-400 mb-2">Debug Info:</div>
                <div>Available Plans: {availablePlans.length}</div>
                <div>Selected Plan ID: {planId || 'None'}</div>
                <div>Selected Plan Type: {planType || 'None'}</div>
                <div>Loading Plans: {loadingPlans ? 'Yes' : 'No'}</div>
                {availablePlans.length > 0 && (
                  <div className="mt-2">
                    <div className="text-gray-400">First Plan:</div>
                    <div>ID: {availablePlans[0]._id || availablePlans[0].id}</div>
                    <div>Type: {availablePlans[0].planId || availablePlans[0].name}</div>
                    <div>Name: {availablePlans[0].displayName || availablePlans[0].name || 'N/A'}</div>
                  </div>
                )}
              </div>
            )}

            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Batch Name *
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                placeholder="Enter batch name"
                disabled={uploading}
              />
            </div>

            {/* Expiry Days */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiry Days *
              </label>
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                placeholder="30"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !planId}
              className="px-6 py-2 bg-primary text-black rounded-md hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="h-4 w-4" />
                  Upload & Import
                </>
              )}
            </button>
            
            <button
              onClick={resetForm}
              disabled={uploading}
              className="px-6 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiX className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Import Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{result.totalCreated}</div>
                <div className="text-sm text-green-300">Movie Passes Created</div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{result.totalProcessed}</div>
                <div className="text-sm text-blue-300">Total Processed</div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{result.duplicatesSkipped}</div>
                <div className="text-sm text-yellow-300">Duplicates Skipped</div>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{result.batch.availableMoviePasses}</div>
                <div className="text-sm text-purple-300">Available Now</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Batch Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Batch ID:</span>
                    <span className="text-white">{result.batch.batchId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Type:</span>
                    <span className="text-white">{result.batch.planType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">{result.batch.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expiry Date:</span>
                    <span className="text-white">
                      {new Date(result.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {result.duplicateCodes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Duplicate Codes Skipped</h3>
                  <div className="bg-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="text-xs text-gray-300 space-y-1">
                      {result.duplicateCodes.slice(0, 10).map((code, index) => (
                        <div key={index}>{code}</div>
                      ))}
                      {result.duplicateCodes.length > 10 && (
                        <div className="text-gray-400">
                          ... and {result.duplicateCodes.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
