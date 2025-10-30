"use client"

import { useEffect, useMemo, useState } from 'react'
import { dashboardApiService } from '@/lib/dashboardApi'

type Period = 'daily' | 'weekly' | 'monthly'

export default function UsersAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('daily')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [series, setSeries] = useState<{ date: string; count: number }[]>([])
  const [totals, setTotals] = useState<{ rangeNewUsers: number; allTimeUsers: number }>({ rangeNewUsers: 0, allTimeUsers: 0 })
  const [activeSeries, setActiveSeries] = useState<{ date: string; count: number }[]>([])
  const [activeTotals, setActiveTotals] = useState<{ rangeActiveUsers: number; allTimeActiveUsers: number }>({ rangeActiveUsers: 0, allTimeActiveUsers: 0 })
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const { startDate, endDate } = useMemo(() => {
    const end = new Date()
    const start = new Date()
    if (period === 'monthly') start.setMonth(start.getMonth() - 12)
    else if (period === 'weekly') start.setDate(start.getDate() - 12 * 7)
    else start.setDate(start.getDate() - 30)
    return { startDate: start.toISOString(), endDate: end.toISOString() }
  }, [period])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await dashboardApiService.getUserGrowthSeries({ startDate, endDate, groupBy: period, tz: 'Asia/Kolkata' })
        setSeries(data.series || [])
        setTotals(data.totals || { rangeNewUsers: 0, allTimeUsers: 0 })
        const act = await dashboardApiService.getActiveUsersSeries({ startDate, endDate, groupBy: period, tz: 'Asia/Kolkata' })
        setActiveSeries(act.series || [])
        setActiveTotals(act.totals || { rangeActiveUsers: 0, allTimeActiveUsers: 0 })
        if (data?.series) {
          // Debug: log first few points
          // eslint-disable-next-line no-console
          console.table(data.series.slice(0, 8))
          // eslint-disable-next-line no-console
          console.log('[USERS_ANALYTICS] points:', data.series.length, 'period:', period)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period, startDate, endDate])

  // Normalize series to include all periods with zero counts
  // Use server-filled series directly to avoid timezone/bucket mismatches
  const serverSeries = series

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">User Growth</h1>
        <div className="inline-flex rounded-md shadow-sm border overflow-hidden">
          {(['daily','weekly','monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm ${period===p? 'bg-black text-white':'bg-white text-gray-700'} ${p!=='monthly'?'border-r':''}`}
            >
              {p[0].toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">New Users (Range)</div>
          <div className="text-2xl font-semibold">{totals.rangeNewUsers}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">All-time Users</div>
          <div className="text-2xl font-semibold">{totals.allTimeUsers}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">Users over time</div>
          <div className="text-xs text-gray-500">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</div>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <Chart
            data={serverSeries}
            hoverIdx={hoverIdx}
            setHoverIdx={setHoverIdx}
            period={period}
          />
        )}
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">Active Users (Successful Transactions)</div>
          <div className="text-xs text-gray-500">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</div>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <Chart
            data={activeSeries}
            hoverIdx={hoverIdx}
            setHoverIdx={setHoverIdx}
            period={period}
          />
        )}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Active Users (Range)</div>
            <div className="text-2xl font-semibold">{activeTotals.rangeActiveUsers}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">All-time Active Users</div>
            <div className="text-2xl font-semibold">{activeTotals.allTimeActiveUsers}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chart({ data, hoverIdx, setHoverIdx, period }: { data: { date: string; count: number }[]; hoverIdx: number | null; setHoverIdx: (i: number|null)=>void; period: Period }) {
  // Coerce counts to numbers to avoid flat line due to string values
  const numericData = data?.map(d => ({ date: d.date, count: Number(d.count) || 0 })) || []
  const padding = 40
  const w = 900
  const h = 280
  const max = Math.max(1, ...numericData.map(d => d.count))
  const step = numericData.length>1 ? (w - padding*2) / (numericData.length - 1) : 0
  const points = numericData.map((d, i) => {
    const x = padding + i * step
    const y = padding + (1 - d.count / max) * (h - padding*2)
    return { x, y, raw: d }
  })

  const path = points.length > 0 ? points.map((p, i) => `${i===0? 'M':'L'}${p.x},${p.y}`).join(' ') : ''
  const hasLine = points.length > 0
  const hasArea = points.length > 1

  const yTicks = 4
  const yVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i))
  const xLabelEvery = Math.max(1, Math.floor((numericData.length || 1) / 6))

  const handleMouseMove: React.MouseEventHandler<SVGRectElement> = (e) => {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const rel = Math.max(0, Math.min(w - padding*2, x - padding))
    const idx = step > 0 ? Math.round(rel / step) : 0
    const clamped = Math.max(0, Math.min(points.length - 1, idx))
    if (clamped !== hoverIdx) setHoverIdx(clamped)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[920px]">
        <svg width={w} height={h} className="bg-white rounded-md">
          {/* Gridlines */}
          {yVals.map((val, i) => {
            const y = padding + (1 - val / max) * (h - padding*2)
            return <line key={i} x1={padding} y1={y} x2={w - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
          })}
          {/* Axes */}
          <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="#9ca3af" />
          <line x1={padding} y1={padding} x2={padding} y2={h - padding} stroke="#9ca3af" />

          {/* Line */}
          {hasLine && (
            <path d={path} stroke="#2563eb" strokeWidth={2} fill="none" />
          )}
          {/* Area fill (light) */}
          {hasArea && (
            <path d={`${path} L ${w - padding},${h - padding} L ${padding},${h - padding} Z`} fill="#2563eb20" />
          )}

          {/* Points and hover */}
          {points.map((p, i) => (
            <g key={i} pointerEvents="none">
              <circle cx={p.x} cy={p.y} r={3} fill="#2563eb" />
              {/* Value labels - avoid clutter by sampling when many points */}
              {(() => {
                const maxLabels = 30
                const every = Math.max(1, Math.ceil(points.length / maxLabels))
                if (i % every !== 0 && i !== points.length - 1) return null
                return (
                  <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="10" fill="#374151" fontWeight={600}>
                    {p.raw.count}
                  </text>
                )
              })()}
            </g>
          ))}

          {/* Single overlay for stable hover without flicker */}
          <rect
            x={padding}
            y={padding}
            width={w - padding*2}
            height={h - padding*2}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
          />

          {/* X labels */}
          {points.map((p, i) => {
            if (i % xLabelEvery !== 0 && i !== points.length - 1) return null
            const d = new Date(p.raw.date)
            const label = period === 'monthly' ? d.toLocaleString(undefined, { month: 'short', year: '2-digit' })
              : period === 'weekly' ? d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
              : d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
            return (
              <text key={i} x={p.x} y={h - padding + 18} textAnchor="middle" fontSize="10" fill="#6b7280">{label}</text>
            )
          })}

          {/* Y labels */}
          {yVals.map((val, i) => {
            const y = padding + (1 - val / max) * (h - padding*2)
            return <text key={i} x={padding - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
          })}

          {/* Tooltip */}
          {hoverIdx !== null && points[hoverIdx] && (
            <g pointerEvents="none">
              <line x1={points[hoverIdx].x} y1={padding} x2={points[hoverIdx].x} y2={h - padding} stroke="#93c5fd" strokeDasharray="4 4" />
              <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r={5} fill="#1d4ed8" />
              {/* Tooltip box */}
              {(() => {
                const d = points[hoverIdx]
                const date = new Date(d.raw.date)
                const title = period === 'monthly' ? date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
                  : date.toLocaleString(undefined, { dateStyle: 'medium' })
                const boxW = 180
                const boxH = 60
                const boxX = Math.min(Math.max(d.x - boxW / 2, padding), w - padding - boxW)
                const boxY = Math.max(d.y - boxH - 10, padding)
                return (
                  <g>
                    <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={8} ry={8} fill="#111827" opacity={0.95} />
                    <text x={boxX + 10} y={boxY + 20} fontSize="12" fill="#93c5fd">{title}</text>
                    <text x={boxX + 10} y={boxY + 38} fontSize="14" fill="#e5e7eb" fontWeight={600}>New Users: {d.raw.count}</text>
                    <text x={boxX + 10} y={boxY + 54} fontSize="11" fill="#9ca3af">Index {hoverIdx + 1} / {numericData.length}</text>
                  </g>
                )
              })()}
            </g>
          )}
        </svg>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-blue-600" /> New Users</div>
          <div className="ml-auto text-xs text-gray-500">Max: {max}</div>
        </div>
      </div>
    </div>
  )
}


