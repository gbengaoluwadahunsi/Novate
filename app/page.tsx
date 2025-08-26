"use client"

import { useRef, useState, useEffect } from "react"
import { Metadata } from "next"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
 import { Logo } from "@/components/ui/logo"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Mic, FileText, Clock, BarChart3, Shield, Sparkles, ChevronRight } from "lucide-react"
import ClientOnly from "@/components/client-only"
import { usePublicDashboardStats } from "@/hooks/use-dashboard-stats"
import { useAppSelector } from "@/store/hooks"

// Medical Note Component for Hero
function MedicalNoteVisual() {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
      {/* Medical Note Paper Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-sky-50 dark:bg-sky-950/20">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-sky-600 dark:text-sky-400">PATIENT MEDICAL RECORD</h3>
              <div className="text-xs text-gray-500 mt-1">Ref: MR-2025-05-17-001</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Date: 17 May 2025</div>
              <div className="text-xs text-gray-500 mt-1">Time: 09:30 AM</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Patient Info */}
          <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Patient Name:</span>
                <span className="ml-2 font-medium">John Smith</span>
              </div>
              <div>
                <span className="text-gray-500">DOB:</span>
                <span className="ml-2 font-medium">12 Jan 1980</span>
              </div>
              <div>
                <span className="text-gray-500">Patient ID:</span>
                <span className="ml-2 font-medium">P-12345</span>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>
                <span className="ml-2 font-medium">Male</span>
              </div>
            </div>
          </div>

          {/* Medical Note Sections */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">CHIEF COMPLAINT</h4>
              <div className="pl-2 text-sm border-l-2 border-sky-500">
                <p>Patient presents with persistent headache for the past 3 days, accompanied by mild fever.</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">HISTORY OF PRESENT ILLNESS</h4>
              <div className="pl-2 text-sm border-l-2 border-sky-500">
                <p>Headache began gradually and has increased in intensity. Patient reports pain is concentrated...</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">PHYSICAL EXAMINATION</h4>
              <div className="pl-2 text-sm border-l-2 border-sky-500">
                <p>Vital signs: BP 130/85, HR 78, Temp 37.8°C. Patient appears mildly distressed...</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">ASSESSMENT</h4>
              <div className="pl-2 text-sm border-l-2 border-sky-500">
                <p>1. Acute sinusitis, likely viral in origin</p>
                <p>2. Dehydration, mild</p>
              </div>
            </div>

            {/* Animated typing effect for the last section */}
            <div>
              <h4 className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">PLAN</h4>
              <div className="pl-2 text-sm border-l-2 border-sky-500 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    repeatDelay: 1,
                  }}
                  className="h-5 bg-sky-100 dark:bg-sky-900/20 absolute left-0 top-0"
                />
                <p className="relative z-10">1. Recommend rest and increased fluid intake</p>
                <p className="relative z-10">2. Acetaminophen 500mg every 6 hours as needed for pain and fever</p>
                <p className="relative z-10">3. Follow up in 3 days if symptoms persist or worsen</p>
              </div>
            </div>
          </div>

          {/* Voice to Text Indicator */}
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <Mic className="h-3 w-3 text-sky-500 mr-1" />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Voice transcription complete
            </motion.div>
          </div>
        </div>
      </div>

      {/* Animated elements */}
      <motion.div
        className="absolute -top-2 -right-2 h-16 w-16 bg-sky-500 rounded-full flex items-center justify-center text-white"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>

      {/* Floating waveform */}
      <motion.div
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 flex space-x-1"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-sky-500"
            animate={{ height: [10, 20 + i * 5, 10] }}
            transition={{ duration: 1, delay: i * 0.1, repeat: Number.POSITIVE_INFINITY }}
          />
        ))}
      </motion.div>
    </div>
  )
}

// Animated Feature Card
function FeatureCard({ icon: Icon, title, description, delay = 0 }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.03,
        y: -8,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl cursor-pointer group"
    >
      <div className="relative p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl h-full transition-all duration-300 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:shadow-2xl group-hover:shadow-sky-500/20 group-hover:border-sky-300 dark:group-hover:border-sky-600">
        <motion.div 
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-sky-500 flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 group-hover:bg-sky-600 group-hover:shadow-lg group-hover:shadow-sky-500/50"
          whileHover={{ 
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 group-hover:scale-110" />
        </motion.div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">{title}</h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">{description}</p>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </motion.div>
  )
}

// Testimonial Card
interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  image: string;
  delay?: number;
}

function TestimonialCard({ name, role, content, image, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl h-full cursor-pointer group"
    >
      <div className="relative p-6 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl h-full flex flex-col transition-all duration-300 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:shadow-xl group-hover:shadow-sky-500/10 group-hover:border-sky-300 dark:group-hover:border-sky-600">
        <div className="flex items-center mb-4">
          <motion.div 
            className="h-12 w-12 rounded-full bg-sky-500 overflow-hidden mr-4 p-0.5 transition-all duration-300 group-hover:bg-sky-600 group-hover:shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={image || "/placeholder.svg?height=100&width=100"}
              alt={name}
              className="h-full w-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
            />
          </motion.div>
          <div>
            <h4 className="font-bold transition-colors duration-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">{name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-sky-500">{role}</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 italic flex-1 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">&ldquo;{content}&rdquo;</p>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
      </div>
    </motion.div>
  )
}

// Pricing Card
interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  popular?: boolean;
  delay?: number;
}

function PricingCard({ title, price, features, popular = false, delay = 0 }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: popular ? 1.05 : 1.03,
        y: -10,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-xl cursor-pointer group`}
    >
      <div
        className={`relative p-6 ${popular ? "bg-white/90 dark:bg-gray-800/90" : "bg-white/80 dark:bg-gray-800/80"} border ${
          popular
            ? "border-sky-500/50 dark:border-sky-500/50 shadow-lg shadow-sky-500/20"
            : "border-gray-200 dark:border-gray-700"
        } rounded-xl flex flex-col h-full transition-all duration-300 group-hover:shadow-2xl ${
          popular 
            ? "group-hover:shadow-sky-500/30 group-hover:border-sky-400" 
            : "group-hover:shadow-sky-500/20 group-hover:border-sky-300 dark:group-hover:border-sky-600"
        }`}
      >
        {popular && (
          <motion.div 
            className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg transition-all duration-300 group-hover:bg-sky-600"
            whileHover={{ scale: 1.05 }}
          >
            MOST POPULAR
          </motion.div>
        )}
        <h3 className="text-xl font-bold mb-2 transition-colors duration-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold transition-colors duration-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">${price}</span>
          <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-sky-500">/month</span>
        </div>
        <ul className="space-y-3 mb-6 flex-grow">
            {features.map((feature: string, i: number) => (
            <motion.li 
              key={i} 
              className="flex items-start"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2 className="h-5 w-5 text-sky-500 mr-2 flex-shrink-0 mt-0.5 transition-colors duration-300 group-hover:text-sky-600" />
              <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">{feature}</span>
            </motion.li>
            ))}
        </ul>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className={`w-full mt-auto transition-all duration-300 ${popular ? "bg-sky-500 hover:bg-sky-600 text-white group-hover:shadow-lg" : "group-hover:border-sky-500 group-hover:text-sky-600"}`}
            variant={popular ? "default" : "outline"}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </motion.div>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${popular ? 'from-sky-500/15' : 'from-sky-500/10'} via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
        
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
      </div>
    </motion.div>
  )
}

// Animated Stats Counter
function StatsCounter({ value, label, delay = 0, loading = false }: { value: number; label: string; delay?: number; loading?: boolean }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000 // ms
      const frameDuration = 1000 / 60 // 60fps
      const totalFrames = Math.round(duration / frameDuration)
      let frame = 0

      const counter = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        setCount(Math.floor(value * progress))

        if (frame === totalFrames) {
          clearInterval(counter)
          setCount(value)
        }
      }, frameDuration)

      return () => clearInterval(counter)
    }
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl font-bold text-sky-500 mb-2">
        {loading ? (
          <div className="animate-pulse bg-sky-200 dark:bg-sky-800 h-12 w-20 mx-auto rounded"></div>
        ) : (
          `${count.toLocaleString()}+`
        )}
      </div>
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
    </motion.div>
  )
}

// Animated Section Header
interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 px-2"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-sky-500">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">{subtitle}</p>
    </motion.div>
  )
}

// Particle Background
function ParticleBackground() {
  const [showParticles, setShowParticles] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  // Detect iOS devices
  useEffect(() => {
    const detectIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    }
    
    setIsIOS(detectIOS())
  }, [])

  // Delay particle rendering to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(true)
    }, isIOS ? 2500 : 1500) // Longer delay on iOS for better stability

    return () => clearTimeout(timer)
  }, [isIOS])

  // Don't render particles at all until ready
  if (!showParticles) {
    return null
  }

  // iOS-optimized particles (much fewer for performance)
  const iosParticles = [
    { width: 50, height: 50, top: 20, left: 15, opacity: 0.15, delay: 0 },
    { width: 40, height: 40, top: 60, left: 70, opacity: 0.12, delay: 0.5 },
    { width: 35, height: 35, top: 80, left: 25, opacity: 0.10, delay: 1.0 },
    { width: 45, height: 45, top: 30, left: 80, opacity: 0.08, delay: 1.5 }
  ];

  // Full particle data for non-iOS devices
  const fullParticles = [
    { width: 45, height: 52, top: 44, left: 42, opacity: 0.24, delay: 0 },
    { width: 74, height: 32, top: 82, left: 46, opacity: 0.09, delay: 0.1 },
    { width: 72, height: 66, top: 87, left: 22, opacity: 0.20, delay: 0.2 },
    { width: 44, height: 59, top: 86, left: 1, opacity: 0.06, delay: 0.3 },
    { width: 55, height: 37, top: 5, left: 62, opacity: 0.21, delay: 0.4 },
    { width: 33, height: 48, top: 21, left: 77, opacity: 0.22, delay: 0.5 },
    { width: 75, height: 20, top: 65, left: 37, opacity: 0.04, delay: 0.6 },
    { width: 69, height: 61, top: 57, left: 92, opacity: 0.20, delay: 0.7 },
    { width: 31, height: 21, top: 16, left: 30, opacity: 0.15, delay: 0.8 },
    { width: 49, height: 50, top: 72, left: 48, opacity: 0.08, delay: 0.9 },
    { width: 27, height: 72, top: 39, left: 4, opacity: 0.25, delay: 1 },
    { width: 66, height: 42, top: 57, left: 9, opacity: 0.27, delay: 1.1 },
    { width: 52, height: 78, top: 6, left: 58, opacity: 0.01, delay: 1.2 },
    { width: 66, height: 40, top: 70, left: 55, opacity: 0.26, delay: 1.3 },
    { width: 32, height: 38, top: 50, left: 47, opacity: 0.09, delay: 1.4 },
    { width: 65, height: 62, top: 48, left: 15, opacity: 0.29, delay: 1.5 },
    { width: 65, height: 52, top: 85, left: 71, opacity: 0.23, delay: 1.6 },
    { width: 64, height: 67, top: 46, left: 59, opacity: 0.26, delay: 1.7 },
    { width: 67, height: 40, top: 69, left: 23, opacity: 0.24, delay: 1.8 },
    { width: 76, height: 28, top: 83, left: 19, opacity: 0.18, delay: 1.9 }
  ];

  const particles = isIOS ? iosParticles : fullParticles;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: particle.width,
            height: particle.height,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            background: `radial-gradient(circle, rgba(14, 165, 233, ${particle.opacity}), rgba(14, 165, 233, 0))`,
          }}
          initial={{
            y: 0,
            opacity: 0,
          }}
          animate={{
            y: isIOS ? [0, -80] : [0, -150], // Smaller movement on iOS
            opacity: isIOS ? [0, 0.3, 0] : [0, 0.5, 0], // Lower opacity on iOS
          }}
          transition={{
            duration: isIOS ? 20 : 15, // Slower, gentler animation on iOS
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: isIOS ? "linear" : "easeInOut", // Simpler easing on iOS
            delay: particle.delay * (isIOS ? 0.5 : 0.1), // Longer stagger on iOS
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [isIOS, setIsIOS] = useState(false)
  
  // Detect iOS devices
  useEffect(() => {
    const detectIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    }
    
    setIsIOS(detectIOS())
  }, [])

  const { scrollYProgress } = useScroll()
  // Disable scroll-based animations on iOS to prevent interference
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], isIOS ? [1, 1] : [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], isIOS ? [1, 1] : [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.2], isIOS ? [0, 0] : [0, -50])
  
  // Fetch dynamic dashboard statistics
  const { stats, loading, error } = usePublicDashboardStats()
  
  // Get authentication state
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Validate and sanitize stats to prevent negative or unreasonable values
  const sanitizedStats = {
    ...stats,
    timeSavedPercentage: Math.max(0, Math.min(100, stats.timeSavedPercentage || 85)), // Ensure between 0-100, default to 85
    accuracy: Math.max(0, Math.min(100, stats.accuracy || 99)), // Ensure between 0-100, default to 99
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      style={{ 
        // iOS-specific scroll optimization
        WebkitOverflowScrolling: isIOS ? 'touch' : 'auto',
        scrollBehavior: isIOS ? 'auto' : 'smooth',
        transform: isIOS ? 'translate3d(0,0,0)' : 'none' // Force hardware acceleration on iOS
      }}
    >
      <Navbar />
      <ParticleBackground />

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-20 overflow-hidden"
      >
        {/* Hero background with blob colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-blue-600/15 to-sky-500/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/40 to-transparent dark:from-gray-900/80 dark:via-gray-900/60 dark:to-transparent"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="mb-4 sm:mb-6 flex justify-center lg:justify-start">
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#0ea5e9]/20 text-[#0ea5e9] dark:text-[#0ea5e9] border border-[#0ea5e9]/30 whitespace-nowrap">
                  AI-Powered Medical Documentation
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-[#0ea5e9] text-center lg:text-left">
                NovateScribe<sup className="text-black dark:text-white font-normal">TM</sup>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-center lg:text-left">
                Transform your medical voice notes into perfectly structured digital records in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white w-full sm:w-auto" asChild>
                  <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                    {isAuthenticated ? "Dashboard" : "Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="#features">
                    Learn More <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 to-blue-500/10 rounded-3xl"></div>
              <div className="h-full w-full rounded-3xl overflow-hidden p-2 sm:p-4">
                <MedicalNoteVisual />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
              <ChevronRight className="h-6 w-6 text-sky-500 transform rotate-90" />
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-2 sm:px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-50/50 dark:via-sky-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="Powerful Features"
            subtitle="Discover how  NovateScribe revolutionizes medical documentation with AI-powered tools"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <FeatureCard
              icon={Mic}
              title="Voice Recognition"
              description="Advanced AI that understands medical terminology with 99% accuracy, even with accents and background noise."
              delay={0.1}
            />
            <FeatureCard
              icon={FileText}
              title="Structured but Customizable Templates"
              description="Generative AI creates customizable medical templates that cater to your specific specialty and subspecialty in medicine."
              delay={0.2}
            />
            <FeatureCard
              icon={Clock}
              title="Time Saving"
              description="Reduce documentation time by up to 85%, allowing more time for patient care and reducing burnout."
              delay={0.3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics Dashboard"
              description="Gain insights into practice patterns, common diagnoses, and documentation efficiency."
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title="HIPAA Compliant"
              description="Enterprise-grade security with end-to-end encryption and compliance with healthcare regulations."
              delay={0.5}
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Suggestions"
              description="Patient progress and record summarization with smart recommendations for diagnoses, treatments, and follow-ups."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-20 px-2 sm:px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 dark:via-blue-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="How It Works"
            subtitle="Three simple steps to transform your medical documentation workflow"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 items-stretch">
            {[
              {
                step: "1",
                title: "Record",
                description: "Speak naturally during or after patient consultations using our mobile or desktop app.",
              },
              {
                step: "2",
                title: "Process",
                description:
                  "Our AI instantly transcribes and structures your voice notes into professional medical documentation.",
              },
              {
                step: "3",
                title: "Review & Save",
                description: "Quickly review the generated medical note, make any edits if needed, and save securely to Cloud.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-500/10 to-teal-400/10 backdrop-blur-sm"></div>
                <div className="relative p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl h-full flex flex-col">
                  <div
                    className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-sky-500 flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 text-white`}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 flex-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Hidden for now */}
      {false && (
      <section id="testimonials" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-50/50 dark:via-teal-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="What Doctors Say"
            subtitle="Hear from healthcare professionals who have transformed their documentation process"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <TestimonialCard
              name="Dr. Sarah Johnson"
              role="Cardiologist"
              content=" NovateScribe has cut my documentation time in half. The accuracy with medical terminology is impressive, and the structured templates make my notes more consistent."
              image="/placeholder.svg?height=100&width=100"
              delay={0.1}
            />
            <TestimonialCard
              name="Dr. Michael Chen"
              role="Family Physician"
              content="As someone who sees 30+ patients a day,  NovateScribe has been a game-changer. I can now focus more on my patients instead of paperwork."
              image="/placeholder.svg?height=100&width=100"
              delay={0.2}
            />
            <TestimonialCard
              name="Dr. Aisha Patel"
              role="Pediatrician"
              content="The voice recognition works perfectly even with children making noise in the background. The time I save goes directly to providing better care."
              image="/placeholder.svg?height=100&width=100"
              delay={0.3}
            />
          </div>
        </div>
      </section>
      )}

      {/* Pricing Section - Hidden for now */}
      {false && (
      <section id="pricing" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/50 dark:via-purple-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="Simple, Transparent Pricing"
            subtitle="Choose the plan that works best for your practice"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Solo Practice"
              price={49}
              features={[
                "Up to 100 notes per month",
                "Basic templates",
                "Email support",
                "Mobile & desktop access",
                "Basic analytics",
              ]}
              delay={0.1}
            />
            <PricingCard
              title="Group Practice"
              price={99}
              features={[
                "Up to 500 notes per month",
                "Advanced templates",
                "Priority support",
                "Mobile & desktop access",
                "Advanced analytics",
                "EHR integration",
              ]}
              popular={true}
              delay={0.2}
            />
            <PricingCard
              title="Enterprise"
              price={249}
              features={[
                "Unlimited notes",
                "Custom templates",
                "24/7 dedicated support",
                "Mobile & desktop access",
                "Advanced analytics",
                "EHR integration",
                "Custom AI training",
                "Multi-location support",
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>
      )}

      {/* CTA Section with World Map Background */}
      <section className="py-12 sm:py-20 px-2 sm:px-4 relative">
        {/* World Map Background */}
        <div className="absolute inset-0 bg-gray-900/90">
          <img
            src="/world-map-doctors.png"
            alt="World map with doctors"
            className="w-full h-full object-cover opacity-40 mix-blend-lighten"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-600/20"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10 px-2 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gray-900/70 backdrop-blur-sm p-4 sm:p-6 lg:p-10 rounded-2xl border border-blue-500/20 shadow-xl mx-2 sm:mx-0"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white"
            >
              Ready to Transform Your Medical Documentation?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8"
            >
              Join healthcare professionals worldwide who are saving time and improving patient care with
               NovateScribe<sup className="text-black dark:text-white font-normal">TM</sup>.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center mb-8 sm:mb-12"
            >
              <Button
                size="lg"
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium w-full sm:w-auto max-w-xs sm:max-w-none"
                asChild
              >
                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Today"} <span className="ml-2">→</span>
                </Link>
              </Button>
            </motion.div>

            {/* Global usage indicators */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-sm sm:max-w-md mx-auto">
              <div className="text-center bg-blue-900/30 rounded-lg p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">
                  {loading ? "85+" : `${sanitizedStats.timeSavedPercentage}+`}%
                </div>
                <div className="text-blue-200 text-xs sm:text-sm">Time Saved</div>
              </div>
              <div className="text-center bg-blue-900/30 rounded-lg p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">
                  {loading ? "99+" : `${sanitizedStats.accuracy}+`}%
                </div>
                <div className="text-blue-200 text-xs sm:text-sm">Accuracy Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-2 sm:px-4 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
             
                <Logo width={100} height={100} className="mx-auto sm:mx-0 mr-0 sm:mr-2 rounded-full" alt="NovateScribe Logo" />
                

             
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">
                Transforming medical documentation with AI-powered voice recognition.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-bold mb-3 sm:mb-4 text-[#0ea5e9] dark:text-[#0ea5e9]">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] text-sm sm:text-base"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] text-sm sm:text-base"
                  >
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-bold mb-3 sm:mb-4 text-[#0ea5e9] dark:text-[#0ea5e9]">Get Started</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/register"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] text-sm sm:text-base"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] text-sm sm:text-base"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] text-sm sm:text-base"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-bold mb-3 sm:mb-4 text-[#0ea5e9] dark:text-[#0ea5e9]">Support</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Contact: Coming Soon</span>
                </li>
                <li>
                  <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Help Center: Coming Soon</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8">
            {/* Mobile: Center everything vertically, Desktop: Horizontal layout */}
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-0 sm:flex-row text-gray-500 dark:text-gray-400">
              {/* Logo - centered on mobile */}
              <div className="flex items-center justify-center">
                <Logo width={32} height={32} className="rounded-full" alt="NovateScribe Logo" />
              </div>
              
              {/* Copyright text - centered on mobile, inline on desktop */}
              <div className="text-center sm:text-left sm:ml-3">
                <div className="text-sm sm:text-base">
                  &copy; {new Date().getFullYear()} NovateScribe<sup className="text-black dark:text-white font-normal">TM</sup>
                </div>
                <div className="text-sm sm:text-base sm:inline sm:ml-1">
                  All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* iOS-specific performance optimizations */
        @supports (-webkit-overflow-scrolling: touch) {
          * {
            -webkit-transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            -webkit-perspective: 1000;
          }
          
          body {
            -webkit-overflow-scrolling: touch;
            -webkit-transform: translateZ(0);
          }
          
          /* Reduce animation complexity on iOS */
          .animate-blob {
            animation: none !important;
          }
          
          /* Optimize scrolling performance */
          .scroll-smooth {
            scroll-behavior: auto;
          }
        }

        /* Force hardware acceleration for better performance */
        .relative {
          transform: translateZ(0);
        }
      `}</style>
    </div>
  )
}
