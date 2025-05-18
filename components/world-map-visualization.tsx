"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

// Define the healthcare professional data with locations
const healthcareProfessionals = [
  {
    id: 1,
    location: "New York, USA",
    position: { x: "25%", y: "35%" },
    specialty: "Cardiologist",
    image: "/doctor-profile-avatar.png",
  },
  {
    id: 2,
    location: "London, UK",
    position: { x: "45%", y: "30%" },
    specialty: "Neurologist",
    image: "/female-doctor-profile-avatar.png",
  },
  {
    id: 3,
    location: "Tokyo, Japan",
    position: { x: "80%", y: "40%" },
    specialty: "Pediatrician",
    image: "/asian-doctor-profile-avatar.png",
  },
  {
    id: 4,
    location: "Sydney, Australia",
    position: { x: "85%", y: "70%" },
    specialty: "Surgeon",
    image: "/placeholder.svg?height=60&width=60&query=australian%20doctor%20profile%20professional%20medical%20avatar",
  },
  {
    id: 5,
    location: "Cairo, Egypt",
    position: { x: "55%", y: "45%" },
    specialty: "General Practitioner",
    image:
      "/placeholder.svg?height=60&width=60&query=middle%20eastern%20doctor%20profile%20professional%20medical%20avatar",
  },
  {
    id: 6,
    location: "Rio de Janeiro, Brazil",
    position: { x: "35%", y: "65%" },
    specialty: "Dermatologist",
    image:
      "/placeholder.svg?height=60&width=60&query=latin%20american%20doctor%20profile%20professional%20medical%20avatar",
  },
  {
    id: 7,
    location: "Mumbai, India",
    position: { x: "65%", y: "48%" },
    specialty: "Radiologist",
    image: "/placeholder.svg?height=60&width=60&query=indian%20doctor%20profile%20professional%20medical%20avatar",
  },
  {
    id: 8,
    location: "Cape Town, South Africa",
    position: { x: "52%", y: "70%" },
    specialty: "Psychiatrist",
    image: "/placeholder.svg?height=60&width=60&query=african%20doctor%20profile%20professional%20medical%20avatar",
  },
]

interface WorldMapVisualizationProps {
  isRecording?: boolean
}

export function WorldMapVisualization({ isRecording = false }: WorldMapVisualizationProps) {
  const [activeDoctor, setActiveDoctor] = useState<number | null>(null)
  const [showRandomActivity, setShowRandomActivity] = useState(false)
  const [activityLocation, setActivityLocation] = useState<number>(0)

  // Randomly highlight doctors to simulate activity
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * healthcareProfessionals.length)
      setActivityLocation(randomIndex)
      setShowRandomActivity(true)

      setTimeout(() => {
        setShowRandomActivity(false)
      }, 3000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl bg-blue-50 dark:bg-blue-950/30">
      {/* World Map Background */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <Image
          src="/placeholder.svg?height=800&width=1600&query=world%20map%20simple%20blue%20outline%20no%20text%20clean"
          alt="World Map"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Pulsing circles to represent activity */}
      <div className="absolute inset-0">
        {healthcareProfessionals.map((doctor, index) => (
          <div
            key={doctor.id}
            className="absolute"
            style={{
              left: doctor.position.x,
              top: doctor.position.y,
            }}
          >
            <div
              className={`relative cursor-pointer group`}
              onMouseEnter={() => setActiveDoctor(doctor.id)}
              onMouseLeave={() => setActiveDoctor(null)}
            >
              {/* Pulsing circle */}
              <motion.div
                className={`absolute -inset-4 rounded-full bg-blue-500 opacity-0 ${
                  showRandomActivity && activityLocation === index ? "animate-ping" : ""
                }`}
                animate={
                  showRandomActivity && activityLocation === index ? { scale: [0, 1.5], opacity: [0, 0.2, 0] } : {}
                }
                transition={{ duration: 2, repeat: 0 }}
              />

              {/* Doctor image */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative z-10 rounded-full overflow-hidden border-2 border-white shadow-lg"
                style={{ width: "40px", height: "40px" }}
              >
                <Image
                  src={doctor.image || "/placeholder.svg"}
                  alt={`Doctor in ${doctor.location}`}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </motion.div>

              {/* Info tooltip */}
              <AnimatePresence>
                {activeDoctor === doctor.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm"
                  >
                    <div className="font-medium text-blue-600 dark:text-blue-400">{doctor.specialty}</div>
                    <div className="text-gray-600 dark:text-gray-300">{doctor.location}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {showRandomActivity && activityLocation === index ? "Currently recording a note" : "Active user"}
                    </div>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-gray-800"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Connection lines when recording */}
      {isRecording && (
        <svg className="absolute inset-0 w-full h-full z-0 opacity-30">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {healthcareProfessionals.map((doctor, index) => {
            // Only draw lines to some doctors for cleaner visualization
            if (index % 2 === 0) {
              const x1 = "50%"
              const y1 = "50%"
              const x2 = doctor.position.x
              const y2 = doctor.position.y

              return (
                <motion.line
                  key={`line-${doctor.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#lineGradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                />
              )
            }
            return null
          })}
        </svg>
      )}

      {/* Central recording indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg ${
            isRecording ? "ring-4 ring-blue-500 ring-opacity-50" : ""
          }`}
          animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className={`w-10 h-10 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}>
            <span className="sr-only">{isRecording ? "Recording" : "Start Recording"}</span>
          </div>
        </motion.div>
      </div>

      {/* Overlay text */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="inline-block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
          {isRecording
            ? "Recording in progress... Healthcare professionals worldwide use Novate for medical documentation"
            : "Join thousands of healthcare professionals worldwide using Novate"}
        </div>
      </div>
    </div>
  )
}
