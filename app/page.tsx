"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
 import logo from "@/public/novateLogo-removebg-preview2.png"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Mic, FileText, Clock, BarChart3, Shield, Sparkles, ChevronRight } from "lucide-react"

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
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl"
    >
      <div className="relative p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl transition-all duration-300 hover:border-sky-500/20 h-full">
        <div className="h-12 w-12 rounded-full bg-sky-500 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
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
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl"
    >
      <div className="relative p-6 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-sky-500 overflow-hidden mr-4 p-0.5">
            <img
              src={image || "/placeholder.svg?height=100&width=100"}
              alt={name}
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <div>
            <h4 className="font-bold">{name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 italic">&ldquo;{content}&rdquo;</p>
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
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-xl`}
    >
      <div
        className={`relative p-6 ${popular ? "bg-white/90 dark:bg-gray-800/90" : "bg-white/80 dark:bg-gray-800/80"} border ${
          popular
            ? "border-sky-500/50 dark:border-sky-500/50 shadow-lg shadow-sky-500/20"
            : "border-gray-200 dark:border-gray-700"
        } rounded-xl flex flex-col h-full`}
      >
        {popular && (
          <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            MOST POPULAR
          </div>
        )}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-gray-500 dark:text-gray-400">/month</span>
        </div>
        <ul className="space-y-3 mb-6 flex-grow">
            {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-300">{feature}</span>
            </li>
            ))}
        </ul>
        <Button
          className={`w-full mt-auto ${popular ? "bg-sky-500 hover:bg-sky-600 text-white" : ""}`}
          variant={popular ? "default" : "outline"}
        >
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// Animated Stats Counter
function StatsCounter({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
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
      <div className="text-4xl font-bold text-sky-500 mb-2">{count}+</div>
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
      className="text-center max-w-3xl mx-auto mb-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-sky-500">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-lg">{subtitle}</p>
    </motion.div>
  )
}

// Particle Background
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 60 + 20,
            height: Math.random() * 60 + 20,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(14, 165, 233, ${Math.random() * 0.3}), rgba(14, 165, 233, 0))`,
          }}
          animate={{
            y: [0, Math.random() * -100 - 50],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <ParticleBackground />

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-blue-900/5 to-transparent"></div>

        {/* Animated gradient circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-sky-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="mb-6 inline-block"
              >
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#0ea5e9]/20 text-[#0ea5e9] dark:text-[#0ea5e9] border border-[#0ea5e9]/30">
                  AI-Powered Medical Documentation
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold mb-6 text-[#0ea5e9]"
              >
                NovateScribe<sup className="text-black font-normal">TM</sup>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8"
              >
                Transform your medical voice notes into perfectly structured digital records in seconds.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white" asChild>
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">
                    Learn More <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-[400px] lg:h-[500px] w-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 to-blue-500/10 rounded-3xl"></div>
              <div className="h-full w-full rounded-3xl overflow-hidden p-4">
                <MedicalNoteVisual />
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <span className="text-gray-500 dark:text-gray-400 mb-2">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            >
              <ChevronRight className="h-6 w-6 text-sky-500 transform rotate-90" />
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-50/50 dark:via-sky-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="Powerful Features"
            subtitle="Discover how  NovateScribe revolutionizes medical documentation with AI-powered tools"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Mic}
              title="Voice Recognition"
              description="Advanced AI that understands medical terminology with 99% accuracy, even with accents and background noise."
              delay={0.1}
            />
            <FeatureCard
              icon={FileText}
              title="Structured Templates"
              description="Automatically organizes information into professional medical templates that follow industry standards."
              delay={0.2}
            />
            <FeatureCard
              icon={Clock}
              title="Time Saving"
              description="Reduce documentation time by up to 75%, allowing more time for patient care and reducing burnout."
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
              description="Smart recommendations for diagnoses, treatments, and follow-ups based on patient history."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-teal-500/5"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatsCounter value={85} label="Time Saved (%)" delay={0.1} />
            <StatsCounter value={99} label="Accuracy (%)" delay={0.2} />
            <StatsCounter value={5000} label="Doctors Using  NovateScribe" delay={0.3} />
            <StatsCounter value={1000000} label="Notes Processed" delay={0.4} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 dark:via-blue-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="How It Works"
            subtitle="Three simple steps to transform your medical documentation workflow"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                description: "Quickly review, make any edits if needed, and save to your EHR system with one click.",
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
                <div className="relative p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div
                    className={`h-16 w-16 rounded-full bg-sky-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white`}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-50/50 dark:via-teal-950/20 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <SectionHeader
            title="What Doctors Say"
            subtitle="Hear from healthcare professionals who have transformed their documentation process"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Pricing Section */}
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

      {/* CTA Section with World Map Background */}
      <section className="py-20 px-4 relative">
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

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gray-900/70 backdrop-blur-sm p-10 rounded-2xl border border-blue-500/20 shadow-xl"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
            >
              Ready to Transform Your Medical Documentation?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-blue-100 mb-8"
            >
              Join thousands of healthcare professionals worldwide who are saving time and improving patient care with
               NovateScribe<sup className="text-black font-normal">TM</sup>.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-8 py-6 text-lg font-medium"
                asChild
              >
                <Link href="/dashboard">
                  Get Started Today <span className="ml-2">→</span>
                </Link>
              </Button>
            </motion.div>

            {/* Global usage indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">120+</div>
                <div className="text-blue-200 text-sm">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">25,000+</div>
                <div className="text-blue-200 text-sm">Healthcare Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">5M+</div>
                <div className="text-blue-200 text-sm">Patient Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">98%</div>
                <div className="text-blue-200 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
             
                <Image src={logo} alt=" NovateScribe Logo" className=" mr-2 rounded-full" width={120} height={120} />
                

             
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Transforming medical documentation with AI-powered voice recognition.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#0ea5e9] dark:text-[#0ea5e9]">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#0ea5e9] dark:text-[#0ea5e9]">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#0ea5e9] dark:text-[#0ea5e9]">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-500 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9]"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()}  NovateScribe<sup className="text-black font-normal">TM</sup>. All rights reserved.</p>
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
      `}</style>
    </div>
  )
}
