'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { authService } from '../../../lib/auth'
export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Debug: Component mount

  // Test function
  const testClick = () => {
    alert('Button click is working!')
  }

  // Check if already authenticated
  useEffect(() => {
    const authState = authService.getAuthState()
    if (authState.isAuthenticated) {
      router.push('/admin')
    } else {
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      
      const response = await authService.login(email, password)
      
      if (response.success) {
        toast.success(`Welcome back, ${response.data?.admin.name}!`)
        router.push('/admin')
      } else {
        toast.error(response.message || 'Login failed')
      }
    } catch (error: any) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold text-white mb-2">Compas Admin</h1>
          <p className="text-white/60">Sign in to your admin account</p>
        </div>

        {/* Environment Indicator - Removed for now */}

        {/* Login Form */}
        <div className="admin-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="admin@compas.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Test Button */}
            <button
              type="button"
              onClick={testClick}
              className="w-full bg-red-500 hover:bg-red-600 py-2 text-white rounded-lg mb-4"
            >
              🧪 TEST BUTTON
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Having trouble signing in? Contact your system administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-sm">
            © 2024 Compas. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
