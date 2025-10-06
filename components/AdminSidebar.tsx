'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/movies', label: 'Movies' },
  { href: '/admin/persons', label: 'Persons' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/subscription-plans', label: 'Subscription Plans' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 admin-sidebar z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:h-screen
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/1024.png" 
                  alt="Compas Admin Logo" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none">COMPAS</span>
                <span className="text-primary font-bold text-lg leading-none">ADMIN</span>
              </div>
            </Link>
            
            {/* Close button for mobile */}
            <button
              onClick={onToggle}
              className="lg:hidden text-white hover:text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-white/80 hover:text-primary hover:bg-white/5'
                    }
                  `}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  <span className="w-5 h-5 text-center">
                    {item.label === 'Dashboard' && '📊'}
                    {item.label === 'Events' && '🎬'}
                    {item.label === 'Movies' && '🎞️'}
                    {item.label === 'Persons' && '👤'}
                    {item.label === 'Users' && '👥'}
                    {item.label === 'Bookings' && '🎫'}
                    {item.label === 'Payments' && '💳'}
                    {item.label === 'Subscription Plans' && '🎭'}
                    {item.label === 'Analytics' && '📈'}
                    {item.label === 'Notifications' && '🔔'}
                    {item.label === 'Reports' && '📋'}
                    {item.label === 'Settings' && '⚙️'}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-black text-sm">👤</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Admin User</p>
                <p className="text-white/60 text-xs">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}