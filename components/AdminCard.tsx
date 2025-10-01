'use client'

import { ReactNode } from 'react'

interface AdminCardProps {
  title?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export default function AdminCard({ title, children, className = '', headerAction }: AdminCardProps) {
  return (
    <div className={`admin-card p-6 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
