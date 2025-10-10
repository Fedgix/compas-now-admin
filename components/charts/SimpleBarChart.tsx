'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  data: DataPoint[]
  height?: number
  defaultColor?: string
}

export default function SimpleBarChart({ 
  data, 
  height = 200,
  defaultColor = '#3B82F6'
}: SimpleBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value))

    // Calculate bar dimensions
    const barWidth = (width - padding * 2) / data.length * 0.8
    const barSpacing = (width - padding * 2) / data.length

    // Draw bars
    data.forEach((point, i) => {
      const barHeight = (point.value / maxValue) * (height - padding * 2)
      const x = padding + i * barSpacing + (barSpacing - barWidth) / 2
      const y = height - padding - barHeight

      // Draw bar
      ctx.fillStyle = point.color || defaultColor
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(point.value.toString(), x + barWidth / 2, y - 5)

      // Draw label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '11px sans-serif'
      ctx.save()
      ctx.translate(x + barWidth / 2, height - 10)
      ctx.rotate(-Math.PI / 4)
      ctx.textAlign = 'right'
      ctx.fillText(point.label, 0, 0)
      ctx.restore()
    })

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    
    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

  }, [data, height, defaultColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="rounded-lg"
    />
  )
}

