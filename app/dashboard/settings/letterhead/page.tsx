"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, 
  X, 
  FileImage, 
  Settings, 
  Building, 
  Save, 
  Eye,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LetterheadSettings {
  id: string
  organizationName: string
  organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE'
  letterheadImage: string | null // Base64 encoded
  isActive: boolean
  createdAt: string
  lastModified: string
}

export default function LetterheadSettingsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [letterheadSettings, setLetterheadSettings] = useState<LetterheadSettings>({
    id: '',
    organizationName: '',
    organizationType: 'CLINIC',
    letterheadImage: null,
    isActive: false,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  })

  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleLetterheadUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (PNG, JPG, GIF, etc.)',
          variant: 'destructive'
        })
        return
      }

      // Validate file size (max 10MB for letterheads)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 10MB',
          variant: 'destructive'
        })
        return
      }

      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        setLetterheadSettings(prev => ({
          ...prev,
          letterheadImage: base64String,
          lastModified: new Date().toISOString()
        }))
        toast({
          title: 'Letterhead Uploaded',
          description: 'Organization letterhead has been uploaded successfully',
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLetterhead = () => {
    setLetterheadSettings(prev => ({
      ...prev,
      letterheadImage: null,
      lastModified: new Date().toISOString()
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast({
      title: 'Letterhead Removed',
      description: 'Organization letterhead has been removed',
    })
  }

  const handleSaveSettings = () => {
    // Here you would typically save to your backend/database
    // For now, we'll simulate saving to localStorage
    localStorage.setItem('letterheadSettings', JSON.stringify({
      ...letterheadSettings,
      id: letterheadSettings.id || `lh_${Date.now()}`,
      lastModified: new Date().toISOString()
    }))
    
    toast({
      title: 'Settings Saved',
      description: 'Letterhead settings have been saved successfully. New medical notes will use this letterhead.',
    })
  }

  const handleActivateLetterhead = () => {
    setLetterheadSettings(prev => ({
      ...prev,
      isActive: !prev.isActive,
      lastModified: new Date().toISOString()
    }))
  }

  const generateSampleMedicalNote = () => {
    // This would generate a sample PDF with the letterhead
    toast({
      title: 'Sample Generated',
      description: 'Sample medical note with letterhead has been generated',
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Letterhead Settings</h1>
          <p className="text-muted-foreground">
            Configure your organization's letterhead for medical notes
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={letterheadSettings.organizationName}
                onChange={(e) => setLetterheadSettings(prev => ({
                  ...prev,
                  organizationName: e.target.value
                }))}
                placeholder="Enter your organization name"
              />
            </div>
            
            <div>
              <Label htmlFor="org-type">Organization Type</Label>
              <select
                id="org-type"
                value={letterheadSettings.organizationType}
                onChange={(e) => setLetterheadSettings(prev => ({
                  ...prev,
                  organizationType: e.target.value as 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE'
                }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="HOSPITAL">Hospital</option>
                <option value="CLINIC">Clinic</option>
                <option value="PRIVATE_PRACTICE">Private Practice</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Letterhead Status</Label>
                <p className="text-xs text-gray-500">
                  When active, new medical notes will automatically use this letterhead
                </p>
              </div>
              <Button
                variant={letterheadSettings.isActive ? "default" : "outline"}
                onClick={handleActivateLetterhead}
                disabled={!letterheadSettings.letterheadImage}
              >
                {letterheadSettings.isActive ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Letterhead Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Letterhead Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center bg-gray-50">
              {letterheadSettings.letterheadImage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={letterheadSettings.letterheadImage} 
                    alt="Organization Letterhead" 
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Upload your organization letterhead</p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB. Recommended size: 1200x300px
                  </p>
                </div>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {letterheadSettings.letterheadImage ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleLetterheadUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Letterhead
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={removeLetterhead}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleLetterheadUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Letterhead
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {isPreviewMode && letterheadSettings.letterheadImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Letterhead Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white">
              {/* Letterhead */}
              <div className="mb-6">
                <img 
                  src={letterheadSettings.letterheadImage} 
                  alt="Organization Letterhead" 
                  className="w-full h-auto object-contain"
                />
              </div>
              
              {/* Sample Medical Note Content */}
              <div className="space-y-4 text-sm">
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Patient Name:</strong> John Doe</p>
                    <p><strong>Age:</strong> 45 years</p>
                  </div>
                  <div>
                    <p><strong>Gender:</strong> Male</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">CHIEF COMPLAINT</h4>
                  <p>Presented with headache for three days</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">HISTORY OF PRESENT ILLNESS</h4>
                  <p>Patient reports persistent headache with onset 3 days ago...</p>
                </div>
                
                <div className="mt-8 pt-4 border-t">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500">Doctor's Signature</p>
                      <div className="w-32 h-8 border-b border-gray-300 mt-2"></div>
                      <p className="text-xs mt-1">Dr. [Name]</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Official Stamp</p>
                      <div className="w-20 h-12 border border-gray-300 mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button onClick={generateSampleMedicalNote} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate Sample PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            How Letterhead Integration Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📄 Automatic Integration</h4>
                <p className="text-gray-600">
                  Once uploaded and activated, your letterhead will automatically appear at the top 
                  of all new medical notes instead of the default header.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🏥 Multi-Organization Support</h4>
                <p className="text-gray-600">
                  Different clinics and hospitals can upload their own letterheads. 
                  Each organization's notes will use their specific letterhead.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">📱 Student Version</h4>
                <p className="text-gray-600">
                  Medical student versions of notes will not use real letterheads 
                  and will generate random patient data for privacy.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🔄 Easy Updates</h4>
                <p className="text-gray-600">
                  You can change or remove your letterhead at any time. 
                  New notes will immediately use the updated letterhead.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">💡 Recommended Specifications</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Image format: PNG (preferred) or JPG</li>
                <li>Recommended size: 1200x300 pixels</li>
                <li>Maximum file size: 10MB</li>
                <li>Include organization name, logo, contact information</li>
                <li>Ensure text is readable when scaled down</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 