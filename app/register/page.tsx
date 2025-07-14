"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "@/public/novateLogo-removebg-preview.png"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, ArrowLeft, CheckCircle2, AlertCircle, Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch } from "@/store/hooks"
import { register } from "@/store/features/authSlice"
import { INITIAL_LANGUAGES, fetchSupportedLanguages, type Language } from "@/app/config/languages"
import { resendVerificationEmail } from "@/store/features/authSlice"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  specialization: string
  registrationNo: string
  licenseNumber: string
  hospital: string
  preferredLanguage: string
  acceptTerms: boolean
}

interface FormErrors {
  [key: string]: string
}



export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    registrationNo: "",
    licenseNumber: "",
    hospital: "",
    preferredLanguage: "en-US", // Default to English for testing
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [apiError, setApiError] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(INITIAL_LANGUAGES)
  
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Load supported languages from backend
  useEffect(() => {
    const loadLanguages = async () => {
      const supportedLanguages = await fetchSupportedLanguages()
      setAvailableLanguages(supportedLanguages)
      // Languages loaded for registration form
    }
    loadLanguages()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    else if (formData.firstName.trim().length < 2) newErrors.firstName = "First name must be at least 2 characters"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    else if (formData.lastName.trim().length < 2) newErrors.lastName = "Last name must be at least 2 characters"
    
    // Check if first name and last name are identical (likely user error)
    if (formData.firstName.trim() === formData.lastName.trim() && formData.firstName.trim().length > 0) {
      newErrors.firstName = "First name and last name cannot be identical"
      newErrors.lastName = "Please enter your first name and last name separately"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.preferredLanguage) {
      newErrors.preferredLanguage = "Please select a preferred language for transcription services"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms of Service and Privacy Policy"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    let isValid = false
    switch (step) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      default:
        isValid = true
    }
    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    setIsLoading(true)
    setApiError("")
    try {
      const registrationData: any = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        preferredLanguage: formData.preferredLanguage,
      }
      if (formData.specialization) registrationData.specialization = formData.specialization
      if (formData.registrationNo) registrationData.registrationNo = formData.registrationNo.trim()
      if (formData.licenseNumber) registrationData.licenseNumber = formData.licenseNumber.trim()
      
      const result = await dispatch(register(registrationData))
      if (result.type === 'auth/register/fulfilled') {
        setRegistrationComplete(true)
      } else {
        const errorMessage = result.payload as string || "Registration failed. Please try again."
        setApiError(errorMessage)
      }
    } catch (error) {
              // Registration error
      setApiError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email || resendLoading) return
    
    setResendLoading(true)
    setApiError("")
    try {
      const result = await dispatch(resendVerificationEmail(formData.email))
      if (result.type === 'auth/resendVerificationEmail/fulfilled') {
        setResendSuccess(true)
        // Reset success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        const errorMessage = result.payload as string || "Failed to resend verification email"
        setApiError(errorMessage)
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex justify-center"><Image src={logo} alt="Novate AI Logo" className="h-20 w-20 rounded-full" /></div>
              <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
              <CardDescription className="text-center">We've sent a verification link to your email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"><Mail className="w-8 h-8 text-green-600 dark:text-green-400" /></div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Verification Email Sent</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">We've sent a verification email to:</p>
                  <p className="font-medium text-blue-600">{formData.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please check your email and click the verification link to activate your account.</p>
                </div>
              </div>
              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              {resendSuccess && (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Verification email has been resent successfully!</AlertDescription>
                </Alert>
              )}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> You must verify your email before you can log in. If you don't see the email, please check your spam folder.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>Go to Login Page</Button>
              <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                Didn't receive the email?{" "}
                <button 
                  className={`text-blue-500 hover:text-blue-700 hover:underline ${resendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-blue-500 hover:text-blue-700 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Link>
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center"><Image src={logo} alt="Novate AI Logo" className="h-20 w-20 rounded-full" /></div>
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              {step === 1 ? "Enter your personal information" : step === 2 ? "Tell us about your professional background" : "Review and confirm your information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="w-full flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                  {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                </div>
                <div className={`flex-1 h-1 mx-2 ${step > 1 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"} transition-colors`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                  {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : "2"}
                </div>
                <div className={`flex-1 h-1 mx-2 ${step > 2 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"} transition-colors`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>3</div>
              </div>
            </div>
            {apiError && <Alert className="mb-4" variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{apiError}</AlertDescription></Alert>}
            <form onSubmit={step === 3 ? handleSubmit : undefined}>
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" placeholder="e.g., Gbenga" value={formData.firstName} onChange={handleChange} className={errors.firstName ? "border-red-500" : ""} />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" placeholder="e.g., Oluwadahunsi" value={formData.lastName} onChange={handleChange} className={errors.lastName ? "border-red-500" : ""} />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Please enter your first name and last name separately. For example, if your full name is "Gbenga Oluwadahunsi", enter "Gbenga" as first name and "Oluwadahunsi" as last name.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="doctor@example.com" value={formData.email} onChange={handleChange} className={errors.email ? "border-red-500" : ""} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} className={errors.password ? "border-red-500" : ""} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}<span className="sr-only">Toggle password visibility</span></Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    <p className="text-xs text-gray-500">Must be at least 8 characters with uppercase, lowercase, and number.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? "border-red-500" : ""} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}<span className="sr-only">Toggle password visibility</span></Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Medical Specialization (Optional)</Label>
                    <Select value={formData.specialization} onValueChange={(value) => handleSelectChange("specialization", value)}>
                      <SelectTrigger id="specialization"><SelectValue placeholder="Select specialization" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNo">Medical Registration Number (Optional)</Label>
                    <Input id="registrationNo" name="registrationNo" placeholder="REG-12345" value={formData.registrationNo} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Medical License Number (Optional)</Label>
                    <Input id="licenseNumber" name="licenseNumber" placeholder="LIC-67890" value={formData.licenseNumber} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Primary Hospital/Clinic (Optional)</Label>
                    <Input id="hospital" name="hospital" placeholder="City General Hospital" value={formData.hospital} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Language for Transcription *</Label>
                    <Select value={formData.preferredLanguage} onValueChange={(value) => handleSelectChange("preferredLanguage", value)}>
                      <SelectTrigger className={errors.preferredLanguage ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select your preferred language" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>{language.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.preferredLanguage && <p className="text-sm text-red-500">{errors.preferredLanguage}</p>}
                    <p className="text-xs text-gray-500">This language will be used for transcription.</p>
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Review Your Information</h3>
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4">
                        <span className="text-gray-500 dark:text-gray-400">Name:</span><span className="break-words">Dr. {formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4">
                        <span className="text-gray-500 dark:text-gray-400">Email:</span><span className="break-all text-xs sm:text-sm">{formData.email}</span>
                      </div>
                      {formData.specialization && <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4"><span className="text-gray-500 dark:text-gray-400">Specialization:</span><span className="break-words">{formData.specialization}</span></div>}
                      {formData.registrationNo && <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4"><span className="text-gray-500 dark:text-gray-400">Registration No:</span><span className="break-words">{formData.registrationNo}</span></div>}
                      {formData.licenseNumber && <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4"><span className="text-gray-500 dark:text-gray-400">License Number:</span><span className="break-words">{formData.licenseNumber}</span></div>}
                      {formData.hospital && <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4"><span className="text-gray-500 dark:text-gray-400">Hospital/Clinic:</span><span className="break-words">{formData.hospital}</span></div>}
                      <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-4">
                        <span className="text-gray-500 dark:text-gray-400">Language:</span><span className="break-words">{availableLanguages.find(lang => lang.code === formData.preferredLanguage)?.name || "Not selected"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))} className={errors.acceptTerms ? "border-red-500" : ""} />
                      <Label htmlFor="acceptTerms" className="text-sm leading-5">I agree to the <a href="#" className="text-blue-500 hover:text-blue-700 underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:text-blue-700 underline">Privacy Policy</a></Label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>After registration, you'll receive a verification email. You must verify your email before you can log in.</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <div className="mt-6 flex justify-between">
                {step > 1 && <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading}>Back</Button>}
                {step < 3 ? <Button type="button" className="ml-auto bg-blue-500 hover:bg-blue-600" onClick={handleNextStep}>Continue</Button> : <Button type="submit" className="ml-auto bg-blue-500 hover:bg-blue-600" disabled={isLoading}>{isLoading ? "Creating Account..." : "Create Account"}</Button>}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:text-blue-700 hover:underline">Sign in</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}