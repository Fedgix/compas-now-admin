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
  return (stored as Environment) || 'development'
}

export const setCurrentEnvironment = (env: Environment): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('compas-admin-environment', env)
}

export const getCurrentConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment()
  return environments[currentEnv]
}
