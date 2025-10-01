export type Environment = 'development' | 'render' | 'production'

export interface EnvironmentConfig {
  name: string
  baseUrl: string
  color: string
  icon: string
  description: string
}

export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'Development',
    baseUrl: 'http://localhost:8000/api',
    color: 'text-green-400',
    icon: '🛠️',
    description: 'Local development server'
  },
  render: {
    name: 'Render',
    baseUrl: 'https://compas-6jpv.onrender.com/api',
    color: 'text-yellow-400',
    icon: '🚀',
    description: 'Render staging server'
  },
  production: {
    name: 'Production',
    baseUrl: 'https://api.compasnow.app/api',
    color: 'text-red-400',
    icon: '🏭',
    description: 'Live production server'
  }
}

export const getCurrentEnvironment = (): Environment => {
  if (typeof window === 'undefined') return 'development'
  
  const stored = localStorage.getItem('compas-admin-environment')
  console.log('🔧 getCurrentEnvironment: stored value:', stored)
  
  // Return stored value or default to development
  const result = (stored as Environment) || 'development'
  console.log('🔧 getCurrentEnvironment: returning:', result)
  return result
}

export const setCurrentEnvironment = (env: Environment): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('compas-admin-environment', env)
}

export const getCurrentConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment()
  console.log('🔧 getCurrentConfig called, currentEnv:', currentEnv)
  const config = environments[currentEnv]
  console.log('🔧 getCurrentConfig returning:', config)
  return config
}
