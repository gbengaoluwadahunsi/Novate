"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, TrendingUp } from "lucide-react"

interface WorldMapVisualizationProps {
  data?: {
    totalDoctors: number
    activeCountries: number
    growthRate: number
    topCountries: Array<{
      country: string
      doctors: number
      percentage: number
    }>
  }
}

export default function WorldMapVisualization({ data }: WorldMapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Default data if none provided
  const defaultData = {
    totalDoctors: 15420,
    activeCountries: 67,
    growthRate: 23.5,
    topCountries: [
      { country: "United States", doctors: 3240, percentage: 21 },
      { country: "United Kingdom", doctors: 2180, percentage: 14.1 },
      { country: "Canada", doctors: 1560, percentage: 10.1 },
      { country: "Australia", doctors: 1240, percentage: 8 },
      { country: "Germany", doctors: 980, percentage: 6.4 },
    ],
  }

  const visualizationData = data || defaultData

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw a simple world map representation
    drawWorldMap(ctx, canvas.width, canvas.height)
  }, [])

  const drawWorldMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Set canvas style
    ctx.strokeStyle = "#e5e7eb"
    ctx.fillStyle = "#f3f4f6"
    ctx.lineWidth = 1

    // Draw continents (simplified representation)
    const continents = [
      // North America
      { x: 50, y: 100, width: 120, height: 80 },
      // South America
      { x: 80, y: 200, width: 80, height: 120 },
      // Europe
      { x: 200, y: 80, width: 60, height: 60 },
      // Africa
      { x: 200, y: 150, width: 80, height: 120 },
      // Asia
      { x: 280, y: 80, width: 120, height: 100 },
      // Australia
      { x: 320, y: 200, width: 60, height: 40 },
    ]

    continents.forEach((continent) => {
      ctx.fillRect(continent.x, continent.y, continent.width, continent.height)
      ctx.strokeRect(continent.x, continent.y, continent.width, continent.height)
    })

    // Draw data points for active countries
    const dataPoints = [
      { x: 110, y: 130, size: 8, color: "#3b82f6" },
      { x: 230, y: 110, size: 6, color: "#3b82f6" },
      { x: 340, y: 120, size: 10, color: "#3b82f6" },
      { x: 350, y: 220, size: 4, color: "#3b82f6" },
      { x: 220, y: 200, size: 7, color: "#3b82f6" },
      { x: 130, y: 250, size: 5, color: "#3b82f6" },
    ]

    dataPoints.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI)
      ctx.fillStyle = point.color
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Global Reach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {visualizationData.totalDoctors.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              Total Doctors
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {visualizationData.activeCountries}
            </div>
            <div className="text-sm text-muted-foreground">Active Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              +{visualizationData.growthRate}%
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Growth Rate
            </div>
          </div>
        </div>

        {/* World Map */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-auto border rounded-lg bg-gray-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white/90">
              Interactive Map Coming Soon
            </Badge>
          </div>
        </div>

        {/* Top Countries */}
        <div>
          <h4 className="font-semibold mb-3">Top Countries</h4>
          <div className="space-y-2">
            {visualizationData.topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{country.country}</span>
                  <Badge variant="outline" className="text-xs">
                    {country.doctors.toLocaleString()} doctors
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {country.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 