'use client'

interface MetricCardProps {
  title: string
  value: string | number
  icon: string
  change?: number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  change,
  subtitle,
  color = 'blue'
}: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  }

  const changeColor = change && change > 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className={`
      bg-gradient-to-br ${colorClasses[color]}
      border rounded-xl p-6
      hover:scale-105 transition-all duration-200
      cursor-pointer
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {subtitle && (
            <p className="text-white/50 text-xs">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center space-x-1 mt-2 ${changeColor}`}>
              <span className="text-sm font-medium">
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-white/50">vs last period</span>
            </div>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

