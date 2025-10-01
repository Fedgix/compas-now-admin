'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  className?: string
}

export default function StatCard({ title, value, icon, change, className = '' }: StatCardProps) {
  const getChangeColor = () => {
    switch (change?.type) {
      case 'increase':
        return 'text-green-400'
      case 'decrease':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  return (
    <div className={`admin-card p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${getChangeColor()}`}>
              {change.value}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
          <div className="text-primary">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}
