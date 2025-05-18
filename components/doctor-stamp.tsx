"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface DoctorStampProps {
  doctorName: string
  timestamp: string
  registrationNumber?: string
  clinic?: string
}

export default function DoctorStamp({
  doctorName,
  timestamp,
  registrationNumber = "RCMP-12345",
  clinic = "Novate Medical Center",
}: DoctorStampProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      className="relative w-[280px] h-[180px] mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-md p-4 flex flex-col items-center justify-center">
        <div className="text-center w-full">
          <div className="font-semibold text-blue-500 text-lg">{doctorName}</div>
          <div className="text-xs text-muted-foreground mt-1">{timestamp}</div>
          <div className="text-xs text-blue-500/70 mt-1">{registrationNumber}</div>
          <div className="text-xs text-blue-500/70 mt-1">{clinic}</div>
          <div className="mt-4 text-xs text-gray-500">(Official stamp and signature to be added after printing)</div>
        </div>
      </div>
    </motion.div>
  )
}
