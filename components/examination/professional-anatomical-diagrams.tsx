"use client"

import React from 'react'
import Image from 'next/image'

// Professional Male Body Diagram - Front View (using uploaded SVG)
export const ProfessionalMaleBodyFront: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/svg/b20f2eb0-83a1-432b-b5d4-6783b04f1336-0.svg"
      alt="Professional Male Body - Front View"
      width={300}
      height={400}
      className="w-full h-auto"
    />
  </div>
)

// Professional Female Body Diagram - Front View (using uploaded SVG)
export const ProfessionalFemaleBodyFront: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/svg/b20f2eb0-83a1-432b-b5d4-6783b04f1336-1.svg"
      alt="Professional Female Body - Front View"
      width={300}
      height={400}
      className="w-full h-auto"
    />
  </div>
)

// Professional Male Body Diagram - Back View (using uploaded SVG)
export const ProfessionalMaleBodyBack: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/svg/101f1ee9-b262-4822-a578-eefed3d5f54b-0.svg"
      alt="Professional Male Body - Back View"
      width={300}
      height={400}
      className="w-full h-auto"
    />
  </div>
)

// Professional Female Body Diagram - Back View (using uploaded SVG)
export const ProfessionalFemaleBodyBack: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/svg/101f1ee9-b262-4822-a578-eefed3d5f54b-0.svg"
      alt="Professional Female Body - Back View"
      width={300}
      height={400}
      className="w-full h-auto"
    />
  </div>
)

// Professional Male Body Diagram - Side View (using uploaded SVG)
export const ProfessionalMaleBodySide: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/svg/101f1ee9-b262-4822-a578-eefed3d5f54b-1.svg"
      alt="Professional Male Body - Side View"
      width={300}
      height={400}
      className="w-full h-auto"
    />
  </div>
)

// Professional Female Body Diagram - Side View (using uploaded SVG)
export const ProfessionalFemaleBodySide: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/svg/101f1ee9-b262-4822-a578-eefed3d5f54b-1.svg"
      alt="Professional Female Body - Side View"
      width={300}
      height={400}
      className="w-full h-auto"
    />
  </div>
)

// Backward compatibility - keeping the original components
export const ProfessionalBodyBack = ProfessionalMaleBodyBack
export const ProfessionalBodySide = ProfessionalMaleBodySide

// If you have additional SVG files for chest and abdominal diagrams, we can use those too
// For now, keeping simpler chest and abdominal diagrams as fallback

// Professional Chest Diagram (simplified for overlay points)
export const ProfessionalChestDiagram: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 350" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Upper chest outline */}
    <path
      d="M50 80
         Q100 60 200 60
         Q300 60 350 80
         L320 120
         Q200 100 80 120
         Z"
      stroke="#2c3e50"
      strokeWidth="2"
      fill="#f8f9fa"
      opacity="0.3"
    />

    {/* Ribcage - detailed anatomical outline */}
    <path
      d="M80 120
         C70 130 65 140 68 150
         C70 160 75 170 80 180
         C85 190 90 200 95 210
         C100 220 105 230 110 240
         C115 250 120 260 125 270
         C130 280 140 285 150 285

         L250 285
         C260 285 270 280 275 270
         C280 260 285 250 290 240
         C295 230 300 220 305 210
         C310 200 315 190 320 180
         C325 170 330 160 332 150
         C335 140 330 130 320 120

         Q300 100 200 100
         Q100 100 80 120"
      stroke="#2c3e50"
      strokeWidth="2"
      fill="#f8f9fa"
      opacity="0.2"
    />

    {/* Individual ribs */}
    {Array.from({ length: 7 }, (_, i) => (
      <g key={i}>
        <path
          d={`M${90 + i * 3} ${130 + i * 20} Q200 ${125 + i * 20} ${310 - i * 3} ${130 + i * 20}`}
          stroke="#7f8c8d"
          strokeWidth="1.5"
          fill="none"
        />
      </g>
    ))}

    {/* Heart outline */}
    <path
      d="M160 150
         C150 140 140 145 140 160
         C140 175 160 195 180 210
         C200 195 220 175 220 160
         C220 145 210 140 200 150
         C190 140 170 140 160 150 Z"
      stroke="#e74c3c"
      strokeWidth="2"
      fill="#ffebee"
      opacity="0.5"
    />

    {/* Lung outlines */}
    <ellipse cx="130" cy="180" rx="40" ry="65" stroke="#3498db" strokeWidth="2" fill="#e3f2fd" opacity="0.3"/>
    <ellipse cx="270" cy="180" rx="40" ry="65" stroke="#3498db" strokeWidth="2" fill="#e3f2fd" opacity="0.3"/>

    {/* Anatomical landmarks - exactly as in template */}
    <text x="200" y="50" textAnchor="middle" className="text-sm font-medium" fill="#2c3e50">MCL</text>
    <line x1="200" y1="55" x2="200" y2="300" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="3,3"/>

    <text x="120" y="100" textAnchor="middle" className="text-sm font-semibold" fill="#2c3e50">A</text>
    <text x="280" y="100" textAnchor="middle" className="text-sm font-semibold" fill="#2c3e50">P</text>
    <text x="160" y="130" textAnchor="middle" className="text-sm font-semibold" fill="#2c3e50">T</text>
    <text x="240" y="130" textAnchor="middle" className="text-sm font-semibold" fill="#2c3e50">M</text>

    {/* Additional anatomical reference lines */}
    <line x1="120" y1="105" x2="120" y2="280" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
    <line x1="280" y1="105" x2="280" y2="280" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
  </svg>
)

// Professional Abdominal Diagram (simplified for overlay points)
export const ProfessionalAbdominalDiagram: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 300 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Abdominal outline */}
    <path
      d="M75 50
         C70 50 65 55 65 60
         L60 180
         C60 200 65 220 75 235
         L80 250
         C85 265 90 280 95 295
         C100 310 105 325 110 340
         C115 355 125 365 140 370
         L160 375
         L170 375
         C185 370 195 360 200 345
         C205 330 210 315 215 300
         C220 285 225 270 230 255
         L235 240
         C245 225 250 205 250 185
         L245 65
         C245 55 240 50 235 50
         L75 50 Z"
      stroke="#2c3e50"
      strokeWidth="2"
      fill="#f8f9fa"
      opacity="0.3"
    />

    {/* Abdominal regions - 9 quadrants */}
    {/* Vertical lines */}
    <line x1="120" y1="50" x2="115" y2="370" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
    <line x1="180" y1="50" x2="185" y2="370" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
    
    {/* Horizontal lines */}
    <line x1="65" y1="140" x2="245" y2="140" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
    <line x1="70" y1="250" x2="240" y2="250" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>

    {/* Organ representations */}
    {/* Liver (right upper quadrant) */}
    <path
      d="M185 60
         C220 60 240 80 240 110
         C240 125 235 135 225 140
         L190 140
         C185 135 185 125 185 110
         L185 60 Z"
      stroke="#8b4513"
      strokeWidth="1.5"
      fill="#deb887"
      opacity="0.4"
    />

    {/* Stomach (left upper quadrant) */}
    <ellipse cx="100" cy="100" rx="25" ry="35" stroke="#9932cc" strokeWidth="1.5" fill="#dda0dd" opacity="0.4"/>

    {/* Small intestine loops */}
    <circle cx="120" cy="190" r="15" stroke="#228b22" strokeWidth="1" fill="#98fb98" opacity="0.3"/>
    <circle cx="150" cy="200" r="12" stroke="#228b22" strokeWidth="1" fill="#98fb98" opacity="0.3"/>
    <circle cx="180" cy="190" r="15" stroke="#228b22" strokeWidth="1" fill="#98fb98" opacity="0.3"/>

    {/* Bladder (lower central) */}
    <ellipse cx="150" cy="320" rx="20" ry="15" stroke="#4169e1" strokeWidth="1.5" fill="#87ceeb" opacity="0.4"/>

    {/* Anatomical landmarks */}
    <text x="90" y="80" textAnchor="middle" className="text-xs font-medium" fill="#2c3e50">RUQ</text>
    <text x="210" y="80" textAnchor="middle" className="text-xs font-medium" fill="#2c3e50">LUQ</text>
    <text x="90" y="190" textAnchor="middle" className="text-xs font-medium" fill="#2c3e50">RLQ</text>
    <text x="210" y="190" textAnchor="middle" className="text-xs font-medium" fill="#2c3e50">LLQ</text>
    <text x="150" y="190" textAnchor="middle" className="text-xs font-medium" fill="#2c3e50">Umbilical</text>

    {/* Central reference line */}
    <line x1="150" y1="50" x2="150" y2="370" stroke="#bdc3c7" strokeWidth="1" strokeDasharray="3,3"/>
  </svg>
)