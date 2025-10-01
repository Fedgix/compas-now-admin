'use client'

import { ReactNode } from 'react'

interface AdminTableProps {
  headers?: string[]
  columns?: { key: string; label: string }[]
  data?: any[]
  title?: string
  children?: ReactNode
  className?: string
}

export default function AdminTable({ 
  headers = [], 
  columns = [], 
  data = [], 
  title, 
  children, 
  className = '' 
}: AdminTableProps) {
  // Use columns if provided, otherwise use headers
  const tableHeaders = columns.length > 0 ? columns.map(col => col.label) : headers
  
  return (
    <div className={`admin-table overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {tableHeaders && tableHeaders.length > 0 ? tableHeaders.map((header, index) => (
                <th key={index} className="px-6 py-4 text-left text-sm font-medium text-white/80">
                  {header}
                </th>
              )) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-white/80">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="px-6 py-8 text-center text-white/60">
                  No data available
                </td>
              </tr>
            )}
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface AdminTableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AdminTableRow({ children, className = '', onClick }: AdminTableRowProps) {
  return (
    <tr 
      className={`hover:bg-white/5 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface AdminTableCellProps {
  children: ReactNode
  className?: string
}

export function AdminTableCell({ children, className = '' }: AdminTableCellProps) {
  return (
    <td className={`px-6 py-4 text-sm text-white/80 ${className}`}>
      {children}
    </td>
  )
}
