'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Environment, getCurrentEnvironment, setCurrentEnvironment, getCurrentConfig } from '../lib/config'
import { apiService } from '../lib/api'

interface EnvironmentContextType {
  currentEnvironment: Environment
  currentConfig: ReturnType<typeof getCurrentConfig>
  switchEnvironment: (env: Environment) => void
  testConnection: () => Promise<{ success: boolean; message: string; responseTime?: number }>
  connectionStatus: boolean | null
  isTesting: boolean
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined)

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [currentEnvironment, setCurrentEnvironmentState] = useState<Environment>('development')
  const [currentConfig, setCurrentConfigState] = useState(getCurrentConfig())
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    const env = getCurrentEnvironment()
    setCurrentEnvironmentState(env)
    setCurrentConfigState(getCurrentConfig())
    apiService.updateEnvironment(env)
  }, [])

  const switchEnvironment = (env: Environment) => {
    setCurrentEnvironmentState(env)
    setCurrentEnvironment(env)
    setCurrentConfigState(getCurrentConfig())
    apiService.updateEnvironment(env)
    
    // Test connection to new environment
    testConnection()
  }

  const testConnection = async () => {
    setIsTesting(true)
    try {
      const result = await apiService.testConnection()
      setConnectionStatus(result.success)
      return result
    } catch (error: any) {
      setConnectionStatus(false)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Connection failed'
      }
    } finally {
      setIsTesting(false)
    }
  }

  const value: EnvironmentContextType = {
    currentEnvironment,
    currentConfig,
    switchEnvironment,
    testConnection,
    connectionStatus,
    isTesting
  }

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext)
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider')
  }
  return context
}
