"use client"

import React from 'react'

// Male Body Diagram - Front View
export const MaleBodyFront: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <ellipse cx="200" cy="50" rx="35" ry="45" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Face features */}
    <circle cx="185" cy="45" r="3" fill="#333"/> {/* Left eye */}
    <circle cx="215" cy="45" r="3" fill="#333"/> {/* Right eye */}
    <path d="M190 55 Q200 60 210 55" stroke="#333" strokeWidth="1.5" fill="none"/> {/* Mouth */}
    
    {/* Neck */}
    <rect x="190" y="90" width="20" height="30" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Shoulders */}
    <line x1="160" y1="130" x2="240" y2="130" stroke="#333" strokeWidth="3"/>
    
    {/* Arms */}
    <rect x="130" y="130" width="25" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left upper arm */}
    <rect x="245" y="130" width="25" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right upper arm */}
    
    {/* Elbows */}
    <circle cx="142" cy="220" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <circle cx="258" cy="220" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Forearms */}
    <rect x="130" y="230" width="25" height="70" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left forearm */}
    <rect x="245" y="230" width="25" height="70" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right forearm */}
    
    {/* Hands */}
    <ellipse cx="142" cy="320" rx="12" ry="18" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="258" cy="320" rx="12" ry="18" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Torso */}
    <rect x="160" y="120" width="80" height="120" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Chest landmarks */}
    <circle cx="180" cy="150" r="2" fill="#666"/> {/* Left nipple */}
    <circle cx="220" cy="150" r="2" fill="#666"/> {/* Right nipple */}
    
    {/* Abdomen */}
    <rect x="170" y="240" width="60" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Pelvis */}
    <rect x="175" y="320" width="50" height="40" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Legs - Thighs */}
    <rect x="175" y="360" width="20" height="90" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left thigh */}
    <rect x="205" y="360" width="20" height="90" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right thigh */}
    
    {/* Knees */}
    <circle cx="185" cy="460" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <circle cx="215" cy="460" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Lower legs */}
    <rect x="175" y="470" width="20" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left leg */}
    <rect x="205" y="470" width="20" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right leg */}
    
    {/* Feet */}
    <ellipse cx="185" cy="570" rx="15" ry="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="215" cy="570" rx="15" ry="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
  </svg>
)

// Female Body Diagram - Front View
export const FemaleBodyFront: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <ellipse cx="200" cy="50" rx="35" ry="45" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Face features */}
    <circle cx="185" cy="45" r="3" fill="#333"/> {/* Left eye */}
    <circle cx="215" cy="45" r="3" fill="#333"/> {/* Right eye */}
    <path d="M190 55 Q200 60 210 55" stroke="#333" strokeWidth="1.5" fill="none"/> {/* Mouth */}
    
    {/* Hair outline */}
    <path d="M165 20 Q200 10 235 20 Q240 35 235 50 Q200 5 165 50 Q160 35 165 20" stroke="#333" strokeWidth="1.5" fill="none"/>
    
    {/* Neck */}
    <rect x="190" y="90" width="20" height="30" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Shoulders */}
    <line x1="160" y1="130" x2="240" y2="130" stroke="#333" strokeWidth="3"/>
    
    {/* Arms */}
    <rect x="130" y="130" width="25" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left upper arm */}
    <rect x="245" y="130" width="25" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right upper arm */}
    
    {/* Elbows */}
    <circle cx="142" cy="220" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <circle cx="258" cy="220" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Forearms */}
    <rect x="130" y="230" width="25" height="70" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left forearm */}
    <rect x="245" y="230" width="25" height="70" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right forearm */}
    
    {/* Hands */}
    <ellipse cx="142" cy="320" rx="12" ry="18" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="258" cy="320" rx="12" ry="18" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Torso - slightly curved for female form */}
    <path d="M160 120 Q150 180 160 240 L240 240 Q250 180 240 120 Z" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Chest landmarks */}
    <circle cx="180" cy="150" r="15" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left breast */}
    <circle cx="220" cy="150" r="15" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right breast */}
    
    {/* Abdomen */}
    <rect x="170" y="240" width="60" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Pelvis - wider for female form */}
    <rect x="170" y="320" width="60" height="40" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Legs - Thighs */}
    <rect x="175" y="360" width="20" height="90" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left thigh */}
    <rect x="205" y="360" width="20" height="90" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right thigh */}
    
    {/* Knees */}
    <circle cx="185" cy="460" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <circle cx="215" cy="460" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Lower legs */}
    <rect x="175" y="470" width="20" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Left leg */}
    <rect x="205" y="470" width="20" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/> {/* Right leg */}
    
    {/* Feet */}
    <ellipse cx="185" cy="570" rx="15" ry="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="215" cy="570" rx="15" ry="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
  </svg>
)

// Body Back View
export const BodyBack: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head - back view */}
    <ellipse cx="200" cy="50" rx="35" ry="45" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Hair */}
    <path d="M165 20 Q200 10 235 20 Q240 35 235 80 Q200 15 165 80 Q160 35 165 20" stroke="#333" strokeWidth="1.5" fill="none"/>
    
    {/* Neck */}
    <rect x="190" y="90" width="20" height="30" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Shoulders */}
    <line x1="160" y1="130" x2="240" y2="130" stroke="#333" strokeWidth="3"/>
    
    {/* Arms */}
    <rect x="130" y="130" width="25" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <rect x="245" y="130" width="25" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Elbows */}
    <circle cx="142" cy="220" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <circle cx="258" cy="220" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Forearms */}
    <rect x="130" y="230" width="25" height="70" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <rect x="245" y="230" width="25" height="70" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Hands */}
    <ellipse cx="142" cy="320" rx="12" ry="18" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="258" cy="320" rx="12" ry="18" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Back torso */}
    <rect x="160" y="120" width="80" height="120" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Spine line */}
    <line x1="200" y1="120" x2="200" y2="320" stroke="#666" strokeWidth="2" strokeDasharray="5,5"/>
    
    {/* Lower back */}
    <rect x="170" y="240" width="60" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Buttocks */}
    <ellipse cx="185" cy="340" rx="20" ry="15" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="215" cy="340" rx="20" ry="15" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Legs - Thighs */}
    <rect x="175" y="360" width="20" height="90" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <rect x="205" y="360" width="20" height="90" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Knees */}
    <circle cx="185" cy="460" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <circle cx="215" cy="460" r="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Calves */}
    <rect x="175" y="470" width="20" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <rect x="205" y="470" width="20" height="80" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Feet */}
    <ellipse cx="185" cy="570" rx="15" ry="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    <ellipse cx="215" cy="570" rx="15" ry="8" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
  </svg>
)

// Chest Examination Diagram
export const ChestDiagram: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 500 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chest outline */}
    <path d="M150 50 Q250 30 350 50 L350 300 Q250 320 150 300 Z" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Clavicles */}
    <path d="M180 70 Q220 60 250 65" stroke="#333" strokeWidth="2"/>
    <path d="M250 65 Q280 60 320 70" stroke="#333" strokeWidth="2"/>
    
    {/* Ribs */}
    <path d="M170 100 Q250 90 330 100" stroke="#666" strokeWidth="1.5"/>
    <path d="M175 130 Q250 120 325 130" stroke="#666" strokeWidth="1.5"/>
    <path d="M180 160 Q250 150 320 160" stroke="#666" strokeWidth="1.5"/>
    <path d="M185 190 Q250 180 315 190" stroke="#666" strokeWidth="1.5"/>
    <path d="M190 220 Q250 210 310 220" stroke="#666" strokeWidth="1.5"/>
    <path d="M195 250 Q250 240 305 250" stroke="#666" strokeWidth="1.5"/>
    
    {/* Sternum */}
    <line x1="250" y1="70" x2="250" y2="280" stroke="#333" strokeWidth="2"/>
    
    {/* Heart area */}
    <path d="M220 140 Q230 130 240 140 Q250 130 260 140 Q260 170 250 180 Q240 170 230 180 Q220 170 220 140" stroke="#e74c3c" strokeWidth="2" fill="rgba(231, 76, 60, 0.1)"/>
    
    {/* Lung areas */}
    <ellipse cx="200" cy="180" rx="40" ry="80" stroke="#3498db" strokeWidth="2" fill="rgba(52, 152, 219, 0.1)"/>
    <ellipse cx="300" cy="180" rx="40" ry="80" stroke="#3498db" strokeWidth="2" fill="rgba(52, 152, 219, 0.1)"/>
    
    {/* Anatomical landmarks */}
    <text x="250" y="45" textAnchor="middle" className="text-xs font-medium">MCL</text>
    <text x="180" y="45" textAnchor="middle" className="text-xs font-medium">A</text>
    <text x="320" y="45" textAnchor="middle" className="text-xs font-medium">P</text>
    <text x="220" y="85" textAnchor="middle" className="text-xs font-medium">T</text>
    <text x="280" y="85" textAnchor="middle" className="text-xs font-medium">M</text>
    
    {/* Examination points */}
    <circle cx="200" cy="120" r="4" fill="#e74c3c" stroke="#fff" strokeWidth="1"/>
    <circle cx="300" cy="120" r="4" fill="#e74c3c" stroke="#fff" strokeWidth="1"/>
    <circle cx="200" cy="160" r="4" fill="#3498db" stroke="#fff" strokeWidth="1"/>
    <circle cx="300" cy="160" r="4" fill="#3498db" stroke="#fff" strokeWidth="1"/>
    <circle cx="200" cy="200" r="4" fill="#3498db" stroke="#fff" strokeWidth="1"/>
    <circle cx="300" cy="200" r="4" fill="#3498db" stroke="#fff" strokeWidth="1"/>
    <circle cx="200" cy="240" r="4" fill="#3498db" stroke="#fff" strokeWidth="1"/>
    <circle cx="300" cy="240" r="4" fill="#3498db" stroke="#fff" strokeWidth="1"/>
  </svg>
)

// Abdominal Examination Diagram
export const AbdominalDiagram: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Abdominal outline */}
    <rect x="100" y="50" width="200" height="250" rx="20" stroke="#333" strokeWidth="2" fill="#f8f9fa"/>
    
    {/* Abdominal regions grid */}
    {/* Vertical lines */}
    <line x1="166" y1="50" x2="166" y2="300" stroke="#666" strokeWidth="1" strokeDasharray="5,5"/>
    <line x1="234" y1="50" x2="234" y2="300" stroke="#666" strokeWidth="1" strokeDasharray="5,5"/>
    
    {/* Horizontal lines */}
    <line x1="100" y1="133" x2="300" y2="133" stroke="#666" strokeWidth="1" strokeDasharray="5,5"/>
    <line x1="100" y1="217" x2="300" y2="217" stroke="#666" strokeWidth="1" strokeDasharray="5,5"/>
    
    {/* Region labels */}
    <text x="133" y="90" textAnchor="middle" className="text-xs font-medium">RH</text>
    <text x="200" y="90" textAnchor="middle" className="text-xs font-medium">E</text>
    <text x="267" y="90" textAnchor="middle" className="text-xs font-medium">LH</text>
    
    <text x="133" y="175" textAnchor="middle" className="text-xs font-medium">RF</text>
    <text x="200" y="175" textAnchor="middle" className="text-xs font-medium">U</text>
    <text x="267" y="175" textAnchor="middle" className="text-xs font-medium">LF</text>
    
    <text x="133" y="260" textAnchor="middle" className="text-xs font-medium">RIF</text>
    <text x="200" y="260" textAnchor="middle" className="text-xs font-medium">H</text>
    <text x="267" y="260" textAnchor="middle" className="text-xs font-medium">LIF</text>
    
    {/* Organ outlines */}
    {/* Liver */}
    <path d="M120 80 Q180 70 220 85 Q240 95 230 120 Q180 110 120 120 Z" stroke="#8e44ad" strokeWidth="1.5" fill="rgba(142, 68, 173, 0.1)"/>
    
    {/* Stomach */}
    <ellipse cx="180" cy="110" rx="25" ry="15" stroke="#e67e22" strokeWidth="1.5" fill="rgba(230, 126, 34, 0.1)"/>
    
    {/* Spleen */}
    <ellipse cx="270" cy="110" rx="15" ry="20" stroke="#27ae60" strokeWidth="1.5" fill="rgba(39, 174, 96, 0.1)"/>
    
    {/* Umbilicus */}
    <circle cx="200" cy="175" r="5" stroke="#333" strokeWidth="2" fill="#fff"/>
    
    {/* Bladder */}
    <ellipse cx="200" cy="270" rx="30" ry="20" stroke="#3498db" strokeWidth="1.5" fill="rgba(52, 152, 219, 0.1)"/>
    
    {/* Examination points */}
    <circle cx="133" cy="100" r="3" fill="#e74c3c" stroke="#fff" strokeWidth="1"/>
    <circle cx="200" cy="100" r="3" fill="#e74c3c" stroke="#fff" strokeWidth="1"/>
    <circle cx="267" cy="100" r="3" fill="#e74c3c" stroke="#fff" strokeWidth="1"/>
    <circle cx="133" cy="175" r="3" fill="#f39c12" stroke="#fff" strokeWidth="1"/>
    <circle cx="267" cy="175" r="3" fill="#f39c12" stroke="#fff" strokeWidth="1"/>
    <circle cx="133" cy="250" r="3" fill="#27ae60" stroke="#fff" strokeWidth="1"/>
    <circle cx="200" cy="250" r="3" fill="#27ae60" stroke="#fff" strokeWidth="1"/>
    <circle cx="267" cy="250" r="3" fill="#27ae60" stroke="#fff" strokeWidth="1"/>
  </svg>
)