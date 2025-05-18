"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Pen, Trash2, Save } from "lucide-react"

interface SignatureSpaceProps {
  doctorName: string
  registrationNumber: string
  clinic?: string
  onSave?: (signatureDataUrl: string) => void
}

export default function SignatureSpace({
  doctorName,
  registrationNumber,
  clinic = "Novate Medical Center",
  onSave,
}: SignatureSpaceProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPositionRef = useRef({ x: 0, y: 0 })

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const position = getEventPosition(e, rect)

    lastPositionRef.current = position
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const currentPosition = getEventPosition(e, rect)

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#2563eb" // Blue color

    ctx.beginPath()
    ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y)
    ctx.lineTo(currentPosition.x, currentPosition.y)
    ctx.stroke()

    lastPositionRef.current = currentPosition
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const getEventPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    rect: DOMRect,
  ) => {
    let clientX, clientY

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const saveSignature = () => {
    if (!hasSignature || !canvasRef.current) return

    const dataUrl = canvasRef.current.toDataURL("image/png")
    if (onSave) {
      onSave(dataUrl)
    }
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{doctorName}</p>
          <p className="text-sm text-muted-foreground">{registrationNumber}</p>
          <p className="text-sm text-muted-foreground">{clinic}</p>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearSignature} disabled={!hasSignature}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={saveSignature} disabled={!hasSignature}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 mb-2 flex items-center">
          <Pen className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-sm">Sign here</span>
        </div>
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          className="border rounded-md w-full bg-white touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
