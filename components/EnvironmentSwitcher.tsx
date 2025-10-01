'use client'

import { useState, useEffect } from 'react'
import { Environment, environments, getCurrentEnvironment, setCurrentEnvironment, getCurrentConfig } from '../lib/config'
import { apiService } from '../lib/api'
import { useEnvironment } from '../contexts/EnvironmentContext'

interface EnvironmentSwitcherProps {
  onEnvironmentChange?: (env: Environment) => void
}

export default function EnvironmentSwitcher({ onEnvironmentChange }: EnvironmentSwitcherProps) {
  const { currentEnvironment, switchEnvironment } = useEnvironment()
  const [isOpen, setIsOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{ [key in Environment]?: boolean }>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleEnvironmentChange = async (env: Environment) => {
    switchEnvironment(env)
    setIsOpen(false)
    
    if (onEnvironmentChange) {
      onEnvironmentChange(env)
    }

    // Test connection to new environment
    await testConnection(env)
  }

  const testConnection = async (env: Environment) => {
    setIsTesting(true)
    try {
      const result = await apiService.testConnection()
      setConnectionStatus(prev => ({
        ...prev,
        [env]: result.success
      }))
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [env]: false
      }))
    } finally {
      setIsTesting(false)
    }
  }

  const testAllConnections = async () => {
    setIsTesting(true)
    const results: { [key in Environment]?: boolean } = {}
    
    for (const env of Object.keys(environments) as Environment[]) {
      try {
        const result = await apiService.testConnection()
        results[env] = result.success
      } catch (error) {
        results[env] = false
      }
    }
    
    setConnectionStatus(results)
    setIsTesting(false)
  }

  const currentConfig = getCurrentConfig()

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="relative">
        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 text-green-400 border-green-400/30 bg-black/50">
          <span className="text-lg">🛠️</span>
          <span className="text-sm font-medium">Development</span>
          <span className="text-xs opacity-60">▼</span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Overlay to close dropdown - MOVED TO TOP */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative z-50">
        {/* Environment Switcher Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
            ${currentConfig.color} border-current/30 bg-black/50 hover:bg-black/70
          `}
        >
          <span className="text-lg">{currentConfig.icon}</span>
          <span className="text-sm font-medium">{currentConfig.name}</span>
          <span className="text-xs opacity-60">▼</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-md rounded-lg shadow-lg border border-white/10 py-2 z-50">
          {/* Header */}
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Environment Settings</h3>
              <button
                onClick={testAllConnections}
                disabled={isTesting}
                className="text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test All'}
              </button>
            </div>
          </div>

          {/* Environment Options */}
          <div className="py-2">
            {Object.entries(environments).map(([key, config]) => {
              const env = key as Environment
              const isActive = currentEnvironment === env
              const isConnected = connectionStatus[env]
              
              return (
                <button
                  key={env}
                  onClick={() => handleEnvironmentChange(env)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors
                    ${isActive ? 'bg-primary/10 border-l-2 border-primary' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{config.icon}</span>
                    <div className="text-left">
                      <div className={`font-medium ${config.color}`}>
                        {config.name}
                      </div>
                      <div className="text-xs text-white/60">
                        {config.description}
                      </div>
                      <div className="text-xs text-white/40 font-mono">
                        {config.baseUrl}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Connection Status */}
                    {connectionStatus[env] !== undefined && (
                      <div className={`
                        w-2 h-2 rounded-full
                        ${connectionStatus[env] ? 'bg-green-400' : 'bg-red-400'}
                      `} />
                    )}
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <span className="text-primary text-sm">✓</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/10">
            <div className="text-xs text-white/60">
              Current: <span className="font-mono">{currentConfig.baseUrl}</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
