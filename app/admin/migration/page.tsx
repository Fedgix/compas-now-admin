'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import migrationApiService from '@/lib/migrationApi'

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

const MODULES = [
  { value: 'user', label: 'Users (Avatar)' },
  { value: 'movie', label: 'Movies (Poster, Backdrop, Images)' },
  { value: 'event', label: 'Events (Venue Image, Images)' },
  { value: 'person', label: 'Persons (Avatar)' },
  { value: 'pvr', label: 'PVR Theaters (Brand Logo)' },
  { value: 'production-company', label: 'Production Companies (Logo)' },
]

export default function MigrationPage() {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [previewResult, setPreviewResult] = useState<MigrationResult | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<any>(null)
  const [failedMigrations, setFailedMigrations] = useState<any[]>([])
  const [showFailedMigrations, setShowFailedMigrations] = useState(false)

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  // Load failed migrations when module changes
  useEffect(() => {
    if (selectedModule) {
      loadFailedMigrations()
    }
  }, [selectedModule])

  const loadStats = async () => {
    try {
      const statsData = await migrationApiService.getMigrationStats()
      setStats(statsData)
    } catch (error: any) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleScan = async () => {
    if (!selectedModule) {
      toast.error('Please select a module')
      return
    }

    try {
      setLoading(true)
      const result = await migrationApiService.scanModule(selectedModule)
      setScanResult(result)
      setSelectedImages(new Set()) // Reset selection
      toast.success(`Found ${result.total} images (${result.cloudinary} Cloudinary, ${result.external} external)`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to scan module')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!selectedModule) {
      toast.error('Please select a module')
      return
    }

    if (!scanResult || scanResult.images.length === 0) {
      toast.error('Please scan first')
      return
    }

    try {
      setLoading(true)
      const imageIds = selectedImages.size > 0 
        ? Array.from(selectedImages)
        : undefined
      const result = await migrationApiService.previewMigration(selectedModule, imageIds)
      setPreviewResult(result)
      toast.success(`Preview completed: ${result.total} images`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to preview migration')
    } finally {
      setLoading(false)
    }
  }

  const handleMigrate = async () => {
    if (!selectedModule) {
      toast.error('Please select a module')
      return
    }

    if (!scanResult || scanResult.images.length === 0) {
      toast.error('Please scan first')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to migrate ${selectedImages.size > 0 ? selectedImages.size : scanResult.images.filter(img => img.status === 'pending').length} images? This will update the database.`
    )

    if (!confirmed) return

    try {
      setMigrating(true)
      const imageIds = selectedImages.size > 0 
        ? Array.from(selectedImages)
        : undefined
      const result = await migrationApiService.migrateModule(selectedModule, imageIds)
      setMigrationResult(result)
      toast.success(`Migration completed: ${result.success} successful, ${result.failed} failed`)
      
      // Reload scan to show updated status
      await handleScan()
      await loadStats()
      await loadFailedMigrations()
    } catch (error: any) {
      toast.error(error.message || 'Failed to migrate')
    } finally {
      setMigrating(false)
    }
  }

  const loadFailedMigrations = async () => {
    if (!selectedModule) return
    
    try {
      const result = await migrationApiService.getFailedMigrations(selectedModule)
      setFailedMigrations(result.logs || [])
    } catch (error: any) {
      console.error('Failed to load failed migrations:', error)
    }
  }

  const handleRollbackFailed = async () => {
    if (!selectedModule || failedMigrations.length === 0) {
      toast.error('No failed migrations to rollback')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to rollback ${failedMigrations.length} failed migrations? This will restore old URLs.`
    )

    if (!confirmed) return

    try {
      setMigrating(true)
      const result = await migrationApiService.rollbackFailedMigrations(selectedModule)
      toast.success(`Rollback completed: ${result.success} successful, ${result.failed} failed`)
      
      // Reload data
      await loadFailedMigrations()
      await handleScan()
      await loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to rollback')
    } finally {
      setMigrating(false)
    }
  }

  const handleRollbackSingle = async (logId: string, entityId: string, field: string, fieldIndex: number | null) => {
    if (!selectedModule) return

    const confirmed = window.confirm('Are you sure you want to rollback this image? This will restore the old URL.')

    if (!confirmed) return

    try {
      setMigrating(true)
      await migrationApiService.rollbackImage(entityId, selectedModule, field, fieldIndex ?? undefined)
      toast.success('Image rolled back successfully')
      
      // Reload data
      await loadFailedMigrations()
      await handleScan()
      await loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to rollback image')
    } finally {
      setMigrating(false)
    }
  }

  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }
    setSelectedImages(newSelection)
  }

  const selectAllPending = () => {
    if (!scanResult) return
    const pendingImages = scanResult.images
      .filter(img => img.status === 'pending')
      .map(img => img.id)
    setSelectedImages(new Set(pendingImages))
  }

  const clearSelection = () => {
    setSelectedImages(new Set())
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'cloudinary':
        return 'bg-blue-100 text-blue-800'
      case 'external':
        return 'bg-yellow-100 text-yellow-800'
      case 's3':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'already_migrated':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Migration</h1>
      <p className="text-gray-600 mb-6">
        Migrate images from Cloudinary/external URLs to S3 storage
      </p>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Migration Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats).map(([module, stat]: [string, any]) => (
              <div key={module} className="p-3 bg-white rounded border">
                <div className="text-sm font-medium text-gray-700 capitalize">{module.replace('-', ' ')}</div>
                <div className="text-2xl font-bold mt-1">{stat.pending || 0}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Module
        </label>
        <select
          value={selectedModule}
          onChange={(e) => {
            setSelectedModule(e.target.value)
            setScanResult(null)
            setPreviewResult(null)
            setMigrationResult(null)
            setSelectedImages(new Set())
          }}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select Module --</option>
          {MODULES.map((module) => (
            <option key={module.value} value={module.value}>
              {module.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleScan}
          disabled={!selectedModule || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Scanning...' : 'Scan Module'}
        </button>
        {scanResult && scanResult.images.filter(img => img.status === 'pending').length > 0 && (
          <>
            <button
              onClick={handlePreview}
              disabled={loading || migrating}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Previewing...' : 'Preview Migration'}
            </button>
            <button
              onClick={handleMigrate}
              disabled={loading || migrating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrating ? 'Migrating...' : 'Migrate Images'}
            </button>
            <button
              onClick={selectAllPending}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Select All Pending
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Clear Selection
            </button>
            {failedMigrations.length > 0 && (
              <>
                <button
                  onClick={() => setShowFailedMigrations(!showFailedMigrations)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {showFailedMigrations ? 'Hide' : 'Show'} Failed ({failedMigrations.length})
                </button>
                <button
                  onClick={handleRollbackFailed}
                  disabled={migrating}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rollback All Failed
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Scan Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold">{scanResult.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cloudinary</div>
                <div className="text-2xl font-bold text-blue-600">{scanResult.cloudinary}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">External</div>
                <div className="text-2xl font-bold text-yellow-600">{scanResult.external}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Already S3</div>
                <div className="text-2xl font-bold text-green-600">{scanResult.alreadyS3}</div>
              </div>
            </div>
          </div>

          {/* Images Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedImages.size > 0 && selectedImages.size === scanResult.images.filter(img => img.status === 'pending').length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllPending()
                          } else {
                            clearSelection()
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Old URL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scanResult.images.map((image, index) => (
                    <tr key={`${image.id}-${image.field}-${image.fieldIndex || ''}-${index}`} className={image.status === 'pending' ? 'hover:bg-gray-50' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          disabled={image.status !== 'pending'}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {image.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {image.field}
                        {image.fieldIndex !== undefined && `[${image.fieldIndex}]`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(image.source)}`}>
                          {image.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(image.status)}`}>
                          {image.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        <a
                          href={image.oldUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {image.oldUrl}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preview Results */}
      {previewResult && (
        <div className="mb-6 bg-yellow-50 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Preview Results (Dry Run)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold">{previewResult.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Would Migrate</div>
              <div className="text-2xl font-bold text-green-600">{previewResult.success}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Would Skip</div>
              <div className="text-2xl font-bold text-gray-600">{previewResult.skipped}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Would Fail</div>
              <div className="text-2xl font-bold text-red-600">{previewResult.failed}</div>
            </div>
          </div>
        </div>
      )}

      {/* Migration Results */}
      {migrationResult && (
        <div className="mb-6 bg-green-50 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Migration Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold">{migrationResult.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Successful</div>
              <div className="text-2xl font-bold text-green-600">{migrationResult.success}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Skipped</div>
              <div className="text-2xl font-bold text-gray-600">{migrationResult.skipped}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">{migrationResult.failed}</div>
            </div>
          </div>

          {/* Failed Results */}
          {migrationResult.results.filter(r => !r.success && !r.skipped).length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Failed Migrations:</h3>
              <div className="space-y-2">
                {migrationResult.results
                  .filter(r => !r.success && !r.skipped)
                  .map((result, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded text-sm">
                      <div className="font-medium">Error: {result.error || result.message}</div>
                      <div className="text-gray-600 truncate">{result.oldUrl}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Failed Migrations */}
      {showFailedMigrations && failedMigrations.length > 0 && (
        <div className="mb-6 bg-red-50 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 text-red-800">Failed Migrations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Entity ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Field</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Old URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Error</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedMigrations.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{log.entityId.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.field}
                      {log.fieldIndex !== null && `[${log.fieldIndex}]`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      <a
                        href={log.oldUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {log.oldUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">{log.error}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleRollbackSingle(log.id, log.entityId, log.field, log.fieldIndex)}
                        disabled={migrating}
                        className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-xs"
                      >
                        Rollback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

