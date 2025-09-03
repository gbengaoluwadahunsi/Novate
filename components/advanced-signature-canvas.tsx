"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  CheckCircle,
  User,
  Calendar,
  Clock,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  FileImage,
  Type
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SignatureData {
  type: 'digital' | 'typed' | 'uploaded'
  signature: string | null
  date: string
  time: string
  notes: string
  password?: string
  doctorName: string
  timestamp: string
}

interface AdvancedSignatureCanvasProps {
  doctorName?: string
  onSave?: (signatureData: SignatureData) => void
  onCancel?: () => void
  className?: string
}

export default function AdvancedSignatureCanvas({
  doctorName = "Dr. Sarah Johnson",
  onSave,
  onCancel,
  className = ""
}: AdvancedSignatureCanvasProps) {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [signatureStep, setSignatureStep] = useState<'type' | 'canvas' | 'upload' | 'password' | 'complete'>('type')
  
  const [signatureData, setSignatureData] = useState<SignatureData>({
    type: 'digital',
    signature: null,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    notes: '',
    doctorName,
    timestamp: new Date().toISOString()
  })

  // Canvas initialization
  useEffect(() => {
    if (signatureData.type === 'digital' && canvasRef.current) {
      initializeCanvas()
    }
  }, [signatureData.type])

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with proper scaling
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Set drawing context
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setContext(ctx)
  }, [])

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return
    setIsDrawing(true)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    let clientX: number, clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    context.beginPath()
    context.moveTo(clientX - rect.left, clientY - rect.top)
  }, [context])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    let clientX: number, clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    context.lineTo(clientX - rect.left, clientY - rect.top)
    context.stroke()
  }, [isDrawing, context])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    if (context) {
      context.closePath()
    }
  }, [context])

  const clearSignature = () => {
    if (!canvasRef.current || !context) return
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setSignatureData(prev => ({ ...prev, signature: null }))
  }

  const saveSignature = () => {
    if (!canvasRef.current) return
    const signature = canvasRef.current.toDataURL('image/png')
    setSignatureData(prev => ({ ...prev, signature }))
    toast({
      title: "Signature Saved",
      description: "Your digital signature has been captured successfully.",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setSignatureData(prev => ({ ...prev, signature: result }))
      toast({
        title: "Signature Uploaded",
        description: "Your signature image has been uploaded successfully.",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleTypedSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedSignature = e.target.value
    if (typedSignature.trim()) {
      // Create a canvas to convert typed text to image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 300
        canvas.height = 100
        ctx.font = '24px cursive'
        ctx.fillStyle = '#000'
        ctx.fillText(typedSignature, 10, 60)
        const signature = canvas.toDataURL('image/png')
        setSignatureData(prev => ({ ...prev, signature }))
      }
    } else {
      // Clear signature if input is empty
      setSignatureData(prev => ({ ...prev, signature: null }))
    }
  }

  const handleNextStep = () => {
    if (!signatureData.signature) {
      toast({
        title: "No Signature",
        description: "Please create or upload a signature first.",
        variant: "destructive"
      })
      return
    }

    // For digital signatures, require password
    if (signatureData.type === 'digital') {
      setSignatureStep('password')
      setShowPasswordDialog(true)
    } else {
      // For typed and uploaded signatures, go directly to complete
      setSignatureStep('complete')
    }
  }

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your signature password.",
        variant: "destructive"
      })
      return
    }

    setSignatureData(prev => ({ ...prev, password }))
    setShowPasswordDialog(false)
    setSignatureStep('complete')
    toast({
      title: "Password Set",
      description: "Your signature is now password protected.",
    })
  }

  const handleFinalSave = () => {
    if (onSave) {
      onSave(signatureData)
    }
    toast({
      title: "Signature Applied",
      description: "Your signature has been successfully applied to the document.",
    })
  }

  const getStepStatus = (step: string) => {
    if (step === 'type') {
      return signatureData.signature ? 'completed' : 'current'
    }
    if (step === 'create') {
      return signatureData.signature ? 'completed' : 'pending'
    }
    if (step === 'complete') {
      return signatureStep === 'complete' ? 'completed' : 'pending'
    }
    return 'pending'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Steps */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getStepStatus('type') === 'completed' ? 'text-green-600' : getStepStatus('type') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              getStepStatus('type') === 'completed' ? 'bg-green-100 text-green-600' : 
              getStepStatus('type') === 'current' ? 'bg-blue-100 text-blue-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              {getStepStatus('type') === 'completed' ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Choose Type</span>
          </div>
          
                     <div className={`flex items-center space-x-2 ${getStepStatus('create') === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
               getStepStatus('create') === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
             }`}>
               {getStepStatus('create') === 'completed' ? <CheckCircle className="w-4 h-4" /> : '2'}
             </div>
             <span className="text-sm font-medium">Create/Upload</span>
           </div>
          
          <div className={`flex items-center space-x-2 ${signatureStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              signatureStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {signatureStep === 'complete' ? <CheckCircle className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Advanced Digital Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Signature Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Signature Type</Label>
            <Select 
              value={signatureData.type} 
              onValueChange={(value: 'digital' | 'typed' | 'uploaded') => {
                setSignatureData(prev => ({ ...prev, type: value, signature: null }))
                setSignatureStep('type')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Digital Signature (Draw)
                  </div>
                </SelectItem>
                <SelectItem value="typed">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typed Signature
                  </div>
                </SelectItem>
                <SelectItem value="uploaded">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    Upload Signature Image
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Digital Signature Canvas */}
          {signatureData.type === 'digital' && (
            <div className="space-y-4">
              <Label>Draw Your Signature</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full h-auto border rounded cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Draw your signature above or use touch on mobile devices
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearSignature}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button size="sm" variant="outline" onClick={saveSignature}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Signature
                </Button>
              </div>
            </div>
          )}

          {/* Typed Signature */}
          {signatureData.type === 'typed' && (
            <div className="space-y-4">
              <Label htmlFor="typedSignature">Type Your Signature</Label>
              <Input
                id="typedSignature"
                placeholder="Type your full name as signature..."
                className="font-cursive text-lg h-12"
                onChange={handleTypedSignature}
              />
              <div className="text-xs text-gray-500">
                Your typed signature will be converted to a professional font style
              </div>
              
              {/* Real-time preview for typed signature */}
              {signatureData.signature && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">Preview:</div>
                  <div className="flex items-center justify-center">
                    <img 
                      src={signatureData.signature} 
                      alt="Typed Signature Preview" 
                      className="max-w-full max-h-20 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Signature */}
          {signatureData.type === 'uploaded' && (
            <div className="space-y-4">
              <Label htmlFor="signatureUpload">Upload Signature Image</Label>
              <Input
                id="signatureUpload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <div className="text-xs text-gray-500">
                Supported formats: PNG, JPG, GIF. Max size: 5MB
              </div>
              
              {/* Preview for uploaded signature */}
              {signatureData.signature && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">Uploaded Image Preview:</div>
                  <div className="flex items-center justify-center">
                    <img 
                      src={signatureData.signature} 
                      alt="Uploaded Signature Preview" 
                      className="max-w-full max-h-32 object-contain border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes about this signature..."
              value={signatureData.notes}
              onChange={(e) => setSignatureData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleNextStep} 
              className="flex-1" 
              disabled={!signatureData.signature}
            >
              {signatureData.type === 'digital' ? 'Set Password & Continue' : 'Continue'}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Signature Preview */}
          {signatureData.signature && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-3 text-center">Signature Preview</div>
              <div className="flex items-center justify-center mb-3">
                <img 
                  src={signatureData.signature} 
                  alt="Signature Preview" 
                  className="max-w-full max-h-32 object-contain border rounded"
                />
              </div>
              <div className="text-center space-y-1 text-sm">
                <div className="font-medium">{doctorName}</div>
                <div className="text-muted-foreground">
                  {signatureData.type === 'digital' ? 'Digitally drawn' : 
                   signatureData.type === 'typed' ? 'Typed signature' : 'Uploaded image'} 
                  on {signatureData.date} at {signatureData.time}
                </div>
                {signatureData.notes && (
                  <div className="text-muted-foreground italic">"{signatureData.notes}"</div>
                )}
              </div>
            </div>
          )}

          {/* Final Save Button */}
          {signatureStep === 'complete' && (
            <div className="border-t pt-4">
              <Button onClick={handleFinalSave} className="w-full" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Signature to Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Set Signature Password
            </DialogTitle>
            <DialogDescription>
              Protect your digital signature with a password. This password will be required to apply or modify the signature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signaturePassword">Signature Password</Label>
              <div className="relative">
                <Input
                  id="signaturePassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your signature password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important:</p>
                  <p>Remember this password. You'll need it to apply or modify your signature.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Set Password & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
