'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/events', label: 'Events', icon: '🎬' },
  { href: '/admin/movies', label: 'Movies', icon: '🎞️' },
  { href: '/admin/persons', label: 'Persons', icon: '👤' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/users/analytics', label: 'Users Analytics', icon: '📈' },
  { href: '/admin/bookings', label: 'Bookings', icon: '🎫' },
  { href: '/admin/coupons', label: 'Discount Coupons', icon: '🎟️' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { 
    label: 'Movie Pass System',
    icon: '🎬',
    isGroup: true,
    items: [
      { href: '/admin/subscription-plans', label: 'Subscription Plans', icon: '🎭' },
      { href: '/admin/movie-passes/analytics', label: 'Movie Pass Batches', icon: '📦' },
      { href: '/admin/movie-passes/import-excel', label: 'Import Excel', icon: '📊' },
      { 
        label: 'Analytics',
        icon: '📈',
        isSubGroup: true,
        items: [
          { href: '/admin/movie-pass-analytics', label: 'Overview', icon: '📊' },
          { href: '/admin/movie-pass-analytics/batches', label: 'Batch Analytics', icon: '📦' },
          { href: '/admin/movie-pass-analytics/subscriptions', label: 'Subscriptions', icon: '💼' },
          { href: '/admin/movie-pass-analytics/revenue', label: 'Revenue', icon: '💰' },
          { href: '/admin/movie-pass-analytics/users', label: 'User Behavior', icon: '👥' },
        ]
      }
    ]
  },
  { href: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/admin/reports', label: 'Reports', icon: '📋' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Movie Pass System'])

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    )
  }

  const renderMenuItem = (item: any, depth = 0) => {
    if (item.isGroup || item.isSubGroup) {
      const isExpanded = expandedGroups.includes(item.label)
      const hasActiveChild = item.items?.some((subItem: any) => 
        subItem.href === pathname || 
        (subItem.items && subItem.items.some((nested: any) => nested.href === pathname))
      )

      return (
        <div key={item.label} className={depth > 0 ? 'ml-4' : ''}>
          <button
            onClick={() => toggleGroup(item.label)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
              ${hasActiveChild
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-white/80 hover:text-primary hover:bg-white/5'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <span className="w-5 h-5 text-center">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.items?.map((subItem: any) => renderMenuItem(subItem, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    const isActive = pathname === item.href
    
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
          ${depth > 0 ? 'ml-4' : ''}
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
        <span className="w-5 h-5 text-center">{item.icon}</span>
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

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
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => renderMenuItem(item))}
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