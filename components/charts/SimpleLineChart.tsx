'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  label: string
  value: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  fillColor?: string
}

export default function SimpleLineChart({ 
  data, 
  height = 200, 
  color = '#3B82F6',
  fillColor = 'rgba(59, 130, 246, 0.1)'
}: SimpleLineChartProps) {
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
    const minValue = Math.min(...data.map(d => d.value))
    const valueRange = maxValue - minValue || 1

    // Calculate points
    const points: { x: number; y: number }[] = []
    const stepX = (width - padding * 2) / (data.length - 1 || 1)

    data.forEach((point, i) => {
      const x = padding + i * stepX
      const y = height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2)
      points.push({ x, y })
    })

    // Draw fill area
    if (points.length > 0) {
      ctx.fillStyle = fillColor
      ctx.beginPath()
      ctx.moveTo(points[0].x, height - padding)
      points.forEach(point => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.lineTo(points[points.length - 1].x, height - padding)
      ctx.closePath()
      ctx.fill()
    }

    // Draw line
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    // Draw points
    points.forEach(point => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
      ctx.fill()
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

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'

    data.forEach((point, i) => {
      const x = padding + i * stepX
      ctx.fillText(point.label, x, height - 10)
    })

  }, [data, height, color, fillColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px` }}
      className="rounded-lg"
    />
  )
}

