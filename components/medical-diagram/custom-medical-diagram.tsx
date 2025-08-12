"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Stethoscope, 
  Eye, 
  Activity,
  Heart,
  Wind,
  Brain
} from "lucide-react"
import { 
  findBodyPartCoordinates, 
  getBodyPartsForView,
  anatomicalViews,
  type BodyPartCoordinate 
} from '@/data/medical-coordinates'
import { getMappedCoordinates } from '@/data/mapped-coordinates'

export interface Symptom {
  name: string
  bodyPart: string
  severity: 'mild' | 'moderate' | 'severe'
  description?: string
  duration?: string
}

export interface MedicalDiagramData {
  symptoms: Symptom[]
  patientInfo: {
    age: number
    gender: 'male' | 'female'
    conditions?: string[]
  }
}

interface CustomMedicalDiagramProps {
  data: MedicalDiagramData
  gender: 'male' | 'female'
  view?: 'front' | 'back' | 'leftside' | 'rightside' | 'cardiorespiratory' | 'abdominal'
  showControls?: boolean
  className?: string
  onSymptomClick?: (symptom: Symptom) => void
}

const CustomMedicalDiagram: React.FC<CustomMedicalDiagramProps> = ({
  data,
  gender,
  view = 'front',
  showControls = true,
  className = '',
  onSymptomClick
}) => {
  const [selectedView, setSelectedView] = useState<'front' | 'back' | 'leftside' | 'rightside' | 'cardiorespiratory' | 'abdominal'>(view)
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(gender)
  const [hoveredSymptom, setHoveredSymptom] = useState<Symptom | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Helper function to get accurate coordinates from your mapped JSON data
  const getAccurateCoordinates = (bodyPart: string, view: string, gender: string) => {
    // Use the comprehensive mapped coordinates from your JSON files
    const coords = getMappedCoordinates(bodyPart, view, gender)
    
    if (coords) {
      // Debug logging to see coordinates
      console.log(`Mapping ${bodyPart} for ${gender} ${view}:`, {
        normalized: coords
      })
      
      return coords
    }
    
    // Return null if no mapping found - will use normalizeCoordinates as fallback
    return null
  }

  // Get current anatomical view (handle gender-neutral views)
  const currentView = anatomicalViews.find(av => av.view === selectedView && 
    (av.gender === selectedGender || 
     (selectedView === 'cardiorespiratory' || selectedView === 'abdominal') && av.gender === 'neutral'))
  
  // Map symptoms to coordinates
  const symptomCoordinates = data.symptoms.map(symptom => {
    // First try to find coordinates using the standard lookup
    let coordinates = findBodyPartCoordinates(symptom.bodyPart, selectedView, selectedGender)
    
    console.log(`Standard lookup for ${symptom.bodyPart}:`, coordinates)
    
    // If not found, try to get accurate coordinates from JSON mapping
    if (!coordinates) {
      const accurateCoords = getAccurateCoordinates(symptom.bodyPart, selectedView, selectedGender)
      if (accurateCoords) {
        coordinates = { 
          name: symptom.bodyPart, 
          coordinates: accurateCoords, 
          region: symptom.bodyPart,
          aliases: []
        }
        console.log(`Using custom coordinates for ${symptom.bodyPart}:`, coordinates)
      }
    }
    
    const result = {
      ...symptom,
      coordinates: coordinates?.coordinates || { x: 0.5, y: 0.5 },
      found: !!coordinates
    }
    
    console.log(`Final mapping for ${symptom.bodyPart}:`, result)
    
    return result
  }).filter(s => s.found) // Only show symptoms we can map

  const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe': return 'bg-red-500 border-red-600'
      case 'moderate': return 'bg-yellow-500 border-yellow-600'
      case 'mild': return 'bg-green-500 border-green-600'
      default: return 'bg-blue-500 border-blue-600'
    }
  }

  const getSeverityTextColor = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe': return 'text-red-700 border-red-200 bg-red-50'
      case 'moderate': return 'text-yellow-700 border-yellow-200 bg-yellow-50'
      case 'mild': return 'text-green-700 border-green-200 bg-green-50'
      default: return 'text-blue-700 border-blue-200 bg-blue-50'
    }
  }

  // Helper function to normalize coordinates from pixel values (800x1200) to percentage
  const normalizeCoordinates = (coordinates: { x: number; y: number }) => {
    // Check if coordinates are already normalized (0-1 range) or pixel values (>1)
    if (coordinates.x <= 1 && coordinates.y <= 1) {
      // Already normalized
      return coordinates
    }
    // Convert from 800x1200 pixel coordinates to normalized
    return {
      x: coordinates.x / 800,
      y: coordinates.y / 1200
    }
  }



  const getViewIcon = (viewType: string) => {
    switch (viewType) {
      case 'front': return <User className="w-4 h-4" />
      case 'back': return <Activity className="w-4 h-4" />
      case 'leftside': return <Eye className="w-4 h-4" />
      case 'rightside': return <Eye className="w-4 h-4" />
      default: return <Stethoscope className="w-4 h-4" />
    }
  }

  if (!currentView) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Medical diagram not available</p>
          <p className="text-sm text-gray-400 mt-2">
            {selectedGender} {selectedView} view not found
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          Medical Body Diagram
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Patient: {selectedGender === 'male' ? '👨' : '👩'} {selectedGender}</span>
          <span>View: {selectedView}</span>
          <span>Findings: {symptomCoordinates.length}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          {showControls && (
            <div className="space-y-2">
              {/* Basic Views */}
              <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="front" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    {getViewIcon('front')}
                    <span className="hidden xs:inline">Front</span>
                    <span className="xs:hidden">F</span>
                  </TabsTrigger>
                  <TabsTrigger value="back" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    {getViewIcon('back')}
                    <span className="hidden xs:inline">Back</span>
                    <span className="xs:hidden">B</span>
                  </TabsTrigger>
                  <TabsTrigger value="leftside" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    {getViewIcon('leftside')}
                    <span className="hidden xs:inline">Left</span>
                    <span className="xs:hidden">L</span>
                  </TabsTrigger>
                  <TabsTrigger value="rightside" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    {getViewIcon('rightside')}
                    <span className="hidden xs:inline">Right</span>
                    <span className="xs:hidden">R</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Specialized Views */}
              <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cardiorespiratory" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Cardio/Resp</span>
                    <span className="sm:hidden">Heart</span>
                  </TabsTrigger>
                  <TabsTrigger value="abdominal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Abdominal</span>
                    <span className="sm:hidden">Abdomen</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Diagram */}
            <div className="flex-1">
              <div className="relative bg-white border rounded-lg p-2 sm:p-4" ref={imageRef}>
                {/* Anatomical Image */}
                <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[2/3]">
                  <Image
                    src={currentView.imagePath}
                    alt={`${selectedGender} ${selectedView} view`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 40vw"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      console.error(`Failed to load image: ${currentView.imagePath}`)
                      setImageLoaded(false)
                    }}
                  />

                  {/* Symptom Markers */}
                  {imageLoaded && symptomCoordinates.map((symptom, index) => {
                    // Try to get accurate coordinates from JSON mapping first
                    const accurateCoords = getAccurateCoordinates(symptom.bodyPart, selectedView, selectedGender)
                    const normalizedCoords = accurateCoords || normalizeCoordinates(symptom.coordinates)
                    return (
                      <div key={index}>
                        {/* Numbered Marker */}
                        <div
                          className={`absolute w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform flex items-center justify-center text-white font-bold text-xs sm:text-sm ${getSeverityColor(symptom.severity)}`}
                          style={{
                            left: `${normalizedCoords.x * 100}%`,
                            top: `${normalizedCoords.y * 100}%`,
                            zIndex: 10
                          }}
                          onMouseEnter={() => setHoveredSymptom(symptom)}
                          onMouseLeave={() => setHoveredSymptom(null)}
                          onClick={() => onSymptomClick?.(symptom)}
                          title={`${index + 1}. ${symptom.name} (${symptom.severity})`}
                        >
                          {index + 1}
                        </div>
                        
                        {/* Tooltip on Hover */}
                        {hoveredSymptom === symptom && (
                          <div
                            className="absolute bg-black text-white text-xs rounded px-2 py-1 pointer-events-none z-20 whitespace-nowrap"
                            style={{
                              left: `${normalizedCoords.x * 100}%`,
                              top: `${(normalizedCoords.y * 100) - 10}%`,
                              transform: 'translateX(-50%) translateY(-100%)'
                            }}
                          >
                            <div className="font-medium">#{index + 1}: {symptom.name}</div>
                            <div className="text-gray-300">{symptom.severity}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Fallback if image doesn't load */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                      <div className="text-center p-4">
                        <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {selectedGender === 'male' ? '👨' : '👩'} {selectedGender}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {selectedView} view
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-3 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border-white border-2"></div>
                    <span>Severe</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 border-white border-2"></div>
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-white border-2"></div>
                    <span>Mild</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms List */}
            <div className="lg:w-80 lg:flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="w-4 h-4" />
                  Detected Symptoms
                </h3>
                
                {symptomCoordinates.length > 0 ? (
                  <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
                    {symptomCoordinates.map((symptom, index) => (
                      <div 
                        key={index} 
                        className="p-2 sm:p-3 border rounded-lg hover:bg-white cursor-pointer transition-colors bg-white"
                        onClick={() => onSymptomClick?.(symptom)}
                      >
                        <div className="flex items-start gap-3 mb-1">
                          {/* Number Badge */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${getSeverityColor(symptom.severity)}`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                              <span className="font-medium text-xs sm:text-sm break-words">{symptom.name}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs self-start flex-shrink-0 ${getSeverityTextColor(symptom.severity)}`}
                              >
                                {symptom.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1 break-words">
                              Location: {symptom.bodyPart}
                            </p>
                            {symptom.description && (
                              <p className="text-xs text-gray-500 break-words">{symptom.description}</p>
                            )}
                            {symptom.duration && (
                              <p className="text-xs text-gray-400">Duration: {symptom.duration}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs sm:text-sm">No symptoms detected</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add medical findings to visualize
                    </p>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
          <p className="hidden sm:block">Custom Medical Diagram • {symptomCoordinates.length} findings mapped</p>
          <p className="hidden sm:block">Gender: {selectedGender} • View: {selectedView} • {getBodyPartsForView(selectedView, selectedGender).length} body parts available</p>
          <p className="sm:hidden">{symptomCoordinates.length} findings • {selectedGender} {selectedView}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomMedicalDiagram