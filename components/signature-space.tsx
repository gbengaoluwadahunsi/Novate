"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PenTool, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  CheckCircle,
  User,
  Calendar,
  Clock
} from "lucide-react"

interface SignatureSpaceProps {
  doctorName?: string
  onSave?: (signatureData: any) => void
}

export default function SignatureSpace({ 
  doctorName = "Dr. Sarah Johnson",
  onSave 
}: SignatureSpaceProps) {
  const [signatureData, setSignatureData] = useState({
    type: "digital",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    notes: "",
    signature: null as string | null,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    setContext(ctx)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return
    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    context.beginPath()
    context.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    context.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    context.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (context) {
      context.closePath()
    }
  }

  const clearSignature = () => {
    if (!canvasRef.current || !context) return
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setSignatureData({ ...signatureData, signature: null })
  }

  const saveSignature = () => {
    if (!canvasRef.current) return
    const signature = canvasRef.current.toDataURL()
    setSignatureData({ ...signatureData, signature })
  }

  const handleSave = () => {
    if (signatureData.signature) {
      const finalSignatureData = {
        ...signatureData,
        doctorName,
        timestamp: new Date().toISOString(),
      }
      
      if (onSave) {
        onSave(finalSignatureData)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setSignatureData({ ...signatureData, signature: result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Digital Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Doctor Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{doctorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {signatureData.date} at {signatureData.time}
            </span>
          </div>
        </div>

        {/* Signature Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Signature Type</Label>
          <Select 
            value={signatureData.type} 
            onValueChange={(value) => setSignatureData({ ...signatureData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digital">Digital Signature</SelectItem>
              <SelectItem value="typed">Typed Signature</SelectItem>
              <SelectItem value="uploaded">Uploaded Signature</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Signature Canvas */}
        {signatureData.type === "digital" && (
          <div className="space-y-2">
            <Label>Draw Your Signature</Label>
            <div className="border rounded-lg p-2">
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="w-full h-auto border rounded cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onLoad={initializeCanvas}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={clearSignature}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" variant="outline" onClick={saveSignature}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Typed Signature */}
        {signatureData.type === "typed" && (
          <div className="space-y-2">
            <Label htmlFor="typedSignature">Type Your Signature</Label>
            <Input
              id="typedSignature"
              placeholder="Type your full name as signature..."
              className="font-signature text-lg"
            />
          </div>
        )}

        {/* Upload Signature */}
        {signatureData.type === "uploaded" && (
          <div className="space-y-2">
            <Label htmlFor="signatureUpload">Upload Signature Image</Label>
            <Input
              id="signatureUpload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Input
            id="notes"
            placeholder="Optional notes..."
            value={signatureData.notes}
            onChange={(e) => setSignatureData({ ...signatureData, notes: e.target.value })}
          />
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" disabled={!signatureData.signature}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Apply Signature
        </Button>

        {/* Preview */}
        {signatureData.signature && (
          <div className="mt-4 p-3 border rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-2">Signature Preview:</div>
            <div className="text-sm">
              <div className="font-medium">{doctorName}</div>
              <div className="text-muted-foreground">
                Digitally signed on {signatureData.date} at {signatureData.time}
              </div>
              {signatureData.notes && (
                <div className="text-muted-foreground mt-1">"{signatureData.notes}"</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 