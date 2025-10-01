'use client'

import { useState, useEffect } from 'react'
import { getCurrentConfig, Environment } from '../lib/config'
import { apiService } from '../lib/api'
import { useEnvironment } from '../contexts/EnvironmentContext'

export default function EnvironmentIndicator() {
  const { currentConfig, currentEnvironment } = useEnvironment()
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Test connection when environment changes
    testConnection()
  }, [currentEnvironment])

  const testConnection = async () => {
    setIsTesting(true)
    try {
      const result = await apiService.testConnection()
      setConnectionStatus(result.success)
    } catch (error) {
      setConnectionStatus(false)
    } finally {
      setIsTesting(false)
    }
  }

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-black/50 rounded-lg border border-white/10">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🛠️</span>
          <div>
            <div className="text-sm font-medium text-green-400">
              Development
            </div>
            <div className="text-xs text-white/60">
              Local development server
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <button className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
            Test
          </button>
        </div>
        
        <div className="text-xs text-white/40 font-mono">
          http://localhost:8000/api
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-black/50 rounded-lg border border-white/10">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{currentConfig.icon}</span>
        <div>
          <div className={`text-sm font-medium ${currentConfig.color}`}>
            {currentConfig.name}
          </div>
          <div className="text-xs text-white/60">
            {currentConfig.description}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Connection Status */}
        {isTesting ? (
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        ) : connectionStatus !== null ? (
          <div className={`
            w-2 h-2 rounded-full
            ${connectionStatus ? 'bg-green-400' : 'bg-red-400'}
          `} />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-400" />
        )}
        
        <button
          onClick={testConnection}
          disabled={isTesting}
          className="text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test'}
        </button>
      </div>
      
      <div className="text-xs text-white/40 font-mono">
        {currentConfig.baseUrl}
      </div>
    </div>
  )
}
