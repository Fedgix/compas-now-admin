'use client'

import { useState } from 'react'
import EnvironmentSwitcher from './EnvironmentSwitcher'

interface AdminHeaderProps {
  admin?: any
  onLogout?: () => void
}

export default function AdminHeader({ admin, onLogout }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    }
  }

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Page title */}
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            Compas Admin
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Environment Switcher */}
          <EnvironmentSwitcher />

          {/* Search */}
          <div className="hidden md:flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
            <span className="text-white/60">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-white placeholder-white/60 outline-none text-sm w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-white/80 hover:text-primary transition-colors">
            🔔
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-black text-sm">👤</span>
              </div>
              <span className="hidden md:block text-sm font-medium">{admin?.name || 'Admin'}</span>
            </button>

            {/* Profile dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-md rounded-lg shadow-lg border border-white/10 py-2 z-50">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-white font-semibold">{admin?.name || 'Admin User'}</p>
                  <p className="text-gray-400 text-sm">{admin?.email || 'admin@compas.com'}</p>
                </div>
                
                <button className="flex items-center w-full px-4 py-2 text-white hover:bg-white/10 transition-colors">
                  <span className="mr-3">⚙️</span>
                  Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-white hover:bg-white/10 transition-colors"
                >
                  <span className="mr-3">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}