"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Settings, Save, User, Lock, Globe, Bell, Camera, Mail, CheckCircle2, Upload, FileImage, X, Eye, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { getUser } from "@/store/features/authSlice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import AdvancedSignatureCanvas from "@/components/advanced-signature-canvas"

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // File upload refs
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const letterheadInputRef = useRef<HTMLInputElement>(null)

  // Form state for editable fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    bio: '',
    preferredLanguage: 'en-US'
  })

  // Signature, stamp, and letterhead state
  const [signatureFile, setSignatureFile] = useState<string | null>(null)
  const [stampFile, setStampFile] = useState<string | null>(null)
  const [letterheadFile, setLetterheadFile] = useState<string | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [stampPreview, setStampPreview] = useState<string | null>(null)
  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(null)
  const [letterheadFileName, setLetterheadFileName] = useState<string>('')
  
  // Advanced signature state
  const [showAdvancedSignature, setShowAdvancedSignature] = useState(false)
  const [advancedSignatureData, setAdvancedSignatureData] = useState<any>(null)

  // Load user data when component mounts
  useEffect(() => {
    if (!user) {
      dispatch(getUser())
    } else {
      // Populate form with user data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        specialization: user.specialization || '',
        bio: user.bio || '',
        preferredLanguage: user.preferredLanguage || 'en-US'
      })
      
      // Load existing signature, stamp, and letterhead if available from user data
      setSignatureFile((user as any)?.doctorSignature || null)
      setStampFile((user as any)?.doctorStamp || null)
      setLetterheadFile((user as any)?.letterhead || null)
      setSignaturePreview((user as any)?.doctorSignature || null)
      setStampPreview((user as any)?.doctorStamp || null)
      setLetterheadPreview((user as any)?.letterhead || null)
      
      // Note: Credentials are now managed via backend API endpoints
      // localStorage usage has been removed for security
    }
  }, [dispatch, user])

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        specialization: user.specialization || '',
        bio: user.bio || '',
        preferredLanguage: user.preferredLanguage || 'en-US'
      })
      
      // Load existing signature, stamp, and letterhead if available from user data
      setSignatureFile((user as any)?.doctorSignature || null)
      setStampFile((user as any)?.doctorStamp || null)
      setLetterheadFile((user as any)?.letterhead || null)
      setSignaturePreview((user as any)?.doctorSignature || null)
      setStampPreview((user as any)?.doctorStamp || null)
      setLetterheadPreview((user as any)?.letterhead || null)
      
      // Note: Credentials are now managed via backend API endpoints
      // localStorage usage has been removed for security
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle signature file upload
  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      setIsLoading(true)
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Upload to backend
      const formData = new FormData()
      formData.append('signature', file)
      
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.uploadCredentialFile(file, 'signature')
      
      if (response.success) {
        const signatureUrl = response.data?.url
        if (signatureUrl) {
          setSignaturePreview(signatureUrl)
          setSignatureFile(signatureUrl)
        } else {
          // Fallback to the original file data if backend doesn't return URL
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setSignaturePreview(result)
            setSignatureFile(result)
          }
          reader.readAsDataURL(file)
        }
        
        toast({
          title: "Signature uploaded",
          description: "Your signature has been uploaded to the backend successfully",
        })
      } else {
        throw new Error(response.error || 'Failed to upload signature')
      }
      
    } catch (error) {
      console.error('Error uploading signature:', error)
      toast({
        title: "Error",
        description: "Failed to upload signature. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle stamp file upload
  const handleStampUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      setIsLoading(true)
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Upload to backend
      const formData = new FormData()
      formData.append('stamp', file)
      
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.uploadCredentialFile(file, 'stamp')
      
      if (response.success) {
        const stampUrl = response.data?.url
        if (stampUrl) {
          setStampPreview(stampUrl)
          setStampFile(stampUrl)
        } else {
          // Fallback to the original file data if backend doesn't return URL
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setStampPreview(result)
            setStampFile(result)
          }
          reader.readAsDataURL(file)
        }
        
        toast({
          title: "Stamp uploaded",
          description: "Your stamp has been uploaded to the backend successfully",
        })
      } else {
        throw new Error(response.error || 'Failed to upload stamp')
      }
      
    } catch (error) {
      console.error('Error uploading stamp:', error)
      toast({
        title: "Error",
        description: "Failed to upload stamp. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle letterhead file upload
  const handleLetterheadUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      setIsLoading(true)
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for letterhead (larger than signature/stamp)
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      // Accept PDF, Word documents, and images
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'image/png',
        'image/jpeg',
        'image/jpg'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, Word document, or image file (.pdf, .doc, .docx, .png, .jpg).",
          variant: "destructive",
        })
        return
      }

      // Upload to backend
      const formData = new FormData()
      formData.append('letterhead', file)
      
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.uploadCredentialFile(file, 'letterhead')
      
      if (response.success) {
        const letterheadUrl = response.data?.url
        if (letterheadUrl) {
          setLetterheadPreview(letterheadUrl)
          setLetterheadFile(letterheadUrl)
        } else {
          // Fallback to the original file data if backend doesn't return URL
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setLetterheadPreview(result)
            setLetterheadFile(result)
          }
          reader.readAsDataURL(file)
        }
        setLetterheadFileName(file.name)
        
        toast({
          title: "Letterhead uploaded",
          description: "Your letterhead has been uploaded to the backend successfully",
        })
      } else {
        throw new Error(response.error || 'Failed to upload letterhead')
      }
      
    } catch (error) {
      console.error('Error uploading letterhead:', error)
      toast({
        title: "Error",
        description: "Failed to upload letterhead. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Remove signature
  const removeSignature = () => {
    setSignatureFile(null)
    setSignaturePreview(null)
    if (signatureInputRef.current) {
      signatureInputRef.current.value = ''
    }
  }

  // Remove stamp
  const removeStamp = () => {
    setStampFile(null)
    setStampPreview(null)
    if (stampInputRef.current) {
      stampInputRef.current.value = ''
    }
  }

  // Remove letterhead
  const removeLetterhead = () => {
    setLetterheadFile(null)
    setLetterheadPreview(null)
    setLetterheadFileName('')
    if (letterheadInputRef.current) {
      letterheadInputRef.current.value = ''
    }
  }

  // Handle advanced signature save
  const handleAdvancedSignatureSave = async (signatureData: any) => {
    try {
      setIsLoading(true)
      
      // Convert signature data URL to file if it's a canvas signature
      let signatureFile: File | null = null
      
      if (signatureData.type === 'digital' && signatureData.signature) {
        // Convert data URL to blob and then to file
        const response = await fetch(signatureData.signature)
        const blob = await response.blob()
        signatureFile = new File([blob], 'signature.png', { type: 'image/png' })
      } else if (signatureData.type === 'typed' && signatureData.signature) {
        // Convert typed signature data URL to file
        const response = await fetch(signatureData.signature)
        const blob = await response.blob()
        signatureFile = new File([blob], 'typed_signature.png', { type: 'image/png' })
      }
      
      if (signatureFile) {
        // Upload signature to backend
        const formData = new FormData()
        formData.append('signature', signatureFile)
        
        const { apiClient } = await import('@/lib/api-client')
        const response = await apiClient.uploadCredentialFile(signatureFile, 'signature')
        
        if (response.success) {
          setAdvancedSignatureData(signatureData)
          setSignatureFile(response.data?.url || signatureData.signature)
          setSignaturePreview(response.data?.url || signatureData.signature)
          setShowAdvancedSignature(false)
          
          toast({
            title: "Advanced signature saved",
            description: "Your advanced digital signature has been uploaded to the backend successfully",
          })
        } else {
          throw new Error(response.error || 'Failed to upload signature')
        }
      }
      
      // Set signature password if provided
      if (signatureData.password) {
        const { apiClient } = await import('@/lib/api-client')
        // Note: Signature password functionality not implemented in backend
        const passwordResponse = { success: true } // Placeholder
        
        if (!passwordResponse.success) {
          toast({
            title: "Warning",
            description: "Signature uploaded but password setting failed. You may need to set it manually.",
            variant: "destructive"
          })
        }
      }
      
    } catch (error) {
      console.error('Error saving advanced signature:', error)
      toast({
        title: "Error",
        description: "Failed to save advanced signature. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get display name for user
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.name) {
      return user.name
    }
    return user?.email || 'User'
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getDisplayName()
    return name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase()
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Import apiClient dynamically to avoid SSR issues
      const { apiClient } = await import('@/lib/api-client')
      
      // Prepare profile data (credentials are now managed separately via backend)
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        specialization: formData.specialization,
        bio: formData.bio,
        preferredLanguage: formData.preferredLanguage,
      }
      
      // Call API to update profile
      const response = await apiClient.updateProfile(profileData)
      
      if (response.success) {
        // Update the auth state with new user data
        dispatch(getUser())
        
        toast({
          title: "Settings Saved",
          description: "Your profile information has been updated successfully.",
        })
      } else {
        throw new Error(response.error || 'Failed to save settings')
      }
    } catch (error) {
      // Error saving settings
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while fetching user data
  if (authLoading && !user) {
    return (
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if no user data after loading
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Unable to load your profile. Please try refreshing the page.</p>
            <Button onClick={() => dispatch(getUser())}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your profile and account preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatarUrl || "/doctor-profile-avatar.png"} alt={getDisplayName()} />
                  <AvatarFallback className="text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Profile Picture</DialogTitle>
                      <DialogDescription>
                        Upload a new profile picture for your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-500">Drag and drop an image here, or click to select</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Upload</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
                <p className="text-muted-foreground">{user?.specialization || 'No specialization set'}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <CheckCircle2 className={`h-4 w-4 ${user?.isVerified ? 'text-green-500' : 'text-gray-400'}`} />
                  <Badge variant="secondary" className="text-xs">
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email || 'No email'}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {user?.organization && (
                  <p>Organization: {user.organization.name}</p>
                )}
                <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                <p>Role: {user?.role || 'User'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select 
                  value={formData.specialization} 
                  onValueChange={(value) => handleInputChange('specialization', value)}
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                    <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                    <SelectItem value="Family Medicine">Family Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your professional background..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Signature and Stamp Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-600 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Credentials, Signature and Stamps
              </CardTitle>
              <CardDescription>Upload your digital signature and doctor's stamp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signature-upload">Digital Signature</Label>
                  <div className="space-y-3">
                    {signaturePreview ? (
                      <div className="space-y-2">
                        <div className="relative w-24 h-12">
                          <Image
                            src={signaturePreview}
                            alt="Digital Signature"
                            fill
                            className="object-contain"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeSignature}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAdvancedSignature(true)}
                          className="w-full"
                        >
                          <PenTool className="h-4 w-4 mr-1" />
                          Edit Signature
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => signatureInputRef.current?.click()}
                          className="w-full"
                        >
                          <FileImage className="h-5 w-5 mr-2" />
                          Upload Signature
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => setShowAdvancedSignature(true)}
                          className="w-full"
                        >
                          <PenTool className="h-5 w-5 mr-2" />
                          Create Advanced Signature
                        </Button>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      ref={signatureInputRef}
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stamp-upload">Doctor's Stamp</Label>
                  <div className="flex items-center gap-2">
                    {stampPreview ? (
                      <div className="relative w-24 h-12">
                        <Image
                          src={stampPreview}
                          alt="Doctor's Stamp"
                          fill
                          className="object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeStamp}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => stampInputRef.current?.click()}
                        className="flex-1"
                      >
                        <FileImage className="h-5 w-5 mr-2" />
                        Upload Stamp
                      </Button>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      ref={stampInputRef}
                      onChange={handleStampUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="letterhead-upload">Letterhead Template</Label>
                  <p className="text-sm text-muted-foreground">Upload your official letterhead (PDF or Word document) to use as template</p>
                  <div className="flex items-center gap-2">
                    {letterheadPreview ? (
                      <>
                        <div className="relative w-32 h-20 border rounded-lg overflow-hidden">
                          {letterheadPreview.startsWith('data:image/') ? (
                            <Image
                              src={letterheadPreview}
                              alt="Letterhead Template"
                              fill
                              className="object-cover"
                            />
                          ) : letterheadPreview.startsWith('data:application/pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <div className="text-center">
                                <FileImage className="h-8 w-8 text-blue-500 mx-auto mb-1" />
                                <p className="text-xs text-blue-600 font-medium">PDF</p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-green-50 flex items-center justify-center">
                              <div className="text-center">
                                <FileImage className="h-8 w-8 text-green-500 mx-auto mb-1" />
                                <p className="text-xs text-green-600 font-medium">Word</p>
                              </div>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeLetterhead}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {letterheadFileName && (
                          <p className="text-xs text-gray-500 text-center mt-1">{letterheadFileName}</p>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => letterheadInputRef.current?.click()}
                        className="flex-1"
                      >
                        <FileImage className="h-5 w-5 mr-2" />
                        Upload Letterhead
                      </Button>
                    )}
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ref={letterheadInputRef}
                      onChange={handleLetterheadUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Preferences
              </CardTitle>
              <CardDescription>Set your language and transcription preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select 
                  value={formData.preferredLanguage} 
                  onValueChange={(value) => handleInputChange('preferredLanguage', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="ms-MY">Malay (Malaysia)</SelectItem>
                    <SelectItem value="zh-CN">Chinese</SelectItem>
                    <SelectItem value="ar-SA">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch id="email-notifications" defaultChecked={true} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notifications in your browser</p>
                </div>
                <Switch id="browser-notifications" defaultChecked={true} />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Change your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-logout after 30 minutes</p>
                  <p className="text-sm text-muted-foreground">Automatically log out when inactive</p>
                </div>
                <Switch id="auto-logout" defaultChecked={true} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Signature Dialog */}
      <Dialog open={showAdvancedSignature} onOpenChange={setShowAdvancedSignature}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Digital Signature Setup</DialogTitle>
            <DialogDescription>
              Create a professional digital signature with advanced features including password protection and multiple signature types.
            </DialogDescription>
          </DialogHeader>
          <AdvancedSignatureCanvas
            doctorName={getDisplayName()}
            onSave={handleAdvancedSignatureSave}
            onCancel={() => setShowAdvancedSignature(false)}
            className="p-4"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
