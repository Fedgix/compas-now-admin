'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  label: string
  value: number
  color: string
}

interface SimplePieChartProps {
  data: DataPoint[]
  size?: number
}

export default function SimplePieChart({ 
  data, 
  size = 200
}: SimplePieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Calculate total
    const total = data.reduce((sum, point) => sum + point.value, 0)
    
    // Draw pie chart
    const centerX = size / 2
    const centerY = size / 2
    const radius = Math.min(size, size) / 2 - 20

    let currentAngle = -Math.PI / 2

    data.forEach((point) => {
      const sliceAngle = (point.value / total) * 2 * Math.PI

      // Draw slice
      ctx.fillStyle = point.color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw percentage in the middle of slice
      const percentage = ((point.value / total) * 100).toFixed(1)
      const labelAngle = currentAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${percentage}%`, labelX, labelY)

      currentAngle += sliceAngle
    })

  }, [data, size])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-lg"
      />
      <div className="mt-4 space-y-2">
        {data.map((point, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: point.color }}
            />
            <span className="text-sm text-white/80">
              {point.label}: {point.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

