'use client'

import { useState, useEffect } from 'react'
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX, FiDownload, FiInfo } from 'react-icons/fi'
import { moviePassApi } from '@/lib/moviePassApi'
import { authApiService } from '@/lib/authApi'
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
  
  // Form data
  const [planId, setPlanId] = useState('68e32f69118b2ded55539180') // Default SILVER plan ID
  const [planType, setPlanType] = useState('SILVER')
  const [batchName, setBatchName] = useState('Silver Batch - October 2025')
  const [expiryDays, setExpiryDays] = useState(30)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (authApiService.isAuthenticated()) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

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
      setError('Please fill in all required fields')
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
      console.error('Upload error:', err)
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
    setPlanId('68e32f69118b2ded55539180')
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

            {/* Plan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan Type *
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={uploading}
              >
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD</option>
              </select>
            </div>

            {/* Plan ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan ID *
              </label>
              <input
                type="text"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-400"
                placeholder="Enter plan ID"
                disabled={uploading}
              />
            </div>

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
              disabled={uploading || !file}
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
