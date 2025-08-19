"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, RotateCcw, Brain, Stethoscope } from "lucide-react"
import { 
  selectDynamicDiagram, 
  getRecommendedDiagrams,
  loadDiagramCoordinates,
  type DiagramConfig,
  type ExaminationAnalysis
} from '@/lib/dynamic-diagram-selector'


interface EnhancedMedicalDiagramProps {
  patientGender: 'male' | 'female'
  examinationData: {
    generalExamination?: string
    cardiovascularExamination?: string
    respiratoryExamination?: string
    abdominalExamination?: string
    otherSystemsExamination?: string
  }
}

interface Finding {
  bodyPart: string
  description: string
  coordinates?: { x: number; y: number }
}

export default function EnhancedMedicalDiagram({ patientGender, examinationData }: EnhancedMedicalDiagramProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [findings, setFindings] = useState<Finding[]>([])
  const [analysis, setAnalysis] = useState<ExaminationAnalysis | null>(null)
  const [currentDiagram, setCurrentDiagram] = useState<DiagramConfig | null>(null)
  const [coordinates, setCoordinates] = useState<any>(null)
  const [alternativeDiagrams, setAlternativeDiagrams] = useState<DiagramConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Initialize dynamic diagram selection
  useEffect(() => {
    async function initializeDynamicDiagram() {
      setIsLoading(true)
      try {
        // Get intelligent diagram selection

        // Get intelligent diagram selection
        const diagramAnalysis = selectDynamicDiagram(patientGender, examinationData)
        setAnalysis(diagramAnalysis)
        setCurrentDiagram(diagramAnalysis.primaryDiagram)

        // Get alternative diagram options
        const alternatives = getRecommendedDiagrams(patientGender, examinationData, 5)
        setAlternativeDiagrams(alternatives.slice(1)) // Exclude primary

        // Load coordinates for the selected diagram
        const coords = await loadDiagramCoordinates(diagramAnalysis.primaryDiagram)
        setCoordinates(coords)

      } catch (error) {
        // Error initializing enhanced dynamic diagram
        
        // Fallback to front view
        const fallbackConfig: DiagramConfig = {
          type: 'front' as const,
          imagePath: `/medical-images/${patientGender}front.png`,
          jsonKey: `${patientGender}front.png`,
          priority: 1,
          dimensions: { width: 750, height: 1140 }
        }
        
        setCurrentDiagram(fallbackConfig)
        
        // Try to load fallback coordinates
        try {
          const fallbackCoords = patientGender === 'male' ? 
            await import('../../scripts/mappedJsons/malefront.json') :
            await import('../../scripts/mappedJsons/femalefront.json')
          setCoordinates(fallbackCoords.default || fallbackCoords)
              } catch (coordError) {
        // Error loading fallback coordinates
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeDynamicDiagram()
  }, [patientGender, JSON.stringify(examinationData)])

  // Switch to a different diagram view
  const switchDiagram = async (newDiagramConfig: DiagramConfig) => {
    setIsLoading(true)
    try {
      setCurrentDiagram(newDiagramConfig)
      setImageLoaded(false)
      
      // Load new coordinates
      const newCoords = await loadDiagramCoordinates(newDiagramConfig)
      setCoordinates(newCoords)
      
    } catch (error) {
        // Error switching diagram
    } finally {
      setIsLoading(false)
    }
  }

  // Extract findings from examination text - Enhanced for dynamic diagrams
  const extractFindingsFromText = (text: string): Finding[] => {
    if (!text || !coordinates || !currentDiagram) return []
    
    const activeCoords = coordinates.coordinates_by_image?.[currentDiagram.jsonKey]?.coordinates || coordinates
    
    if (!activeCoords) return []
    
    if (!activeCoords) return []
    
    const bodyParts = Object.keys(activeCoords)
    const findings: Finding[] = []
    
    bodyParts.forEach(bodyPart => {
      // Enhanced pattern matching for different body regions
      const bodyPartVariants = [
        bodyPart,
        bodyPart.replace('_', ' '),
        bodyPart.replace('left_', 'left '),
        bodyPart.replace('right_', 'right ')
      ]
      
      // Medical examination keywords that indicate findings
      const medicalKeywords = [
        'pain', 'tender', 'swollen', 'abnormal', 'inflamed', 'red', 'bruise', 
        'wound', 'mass', 'lump', 'enlarged', 'positive', 'negative', 'normal',
        'palpable', 'visible', 'audible', 'present', 'absent', 'clear', 'dull'
      ]
      
      const patterns = [
        // Body part followed by finding
        new RegExp(`\\b${bodyPart.replace('_', '[ _]')}\\b.*?(?:${medicalKeywords.join('|')})`, 'gi'),
        // Finding followed by body part
        new RegExp(`(?:${medicalKeywords.join('|')}).*?\\b${bodyPart.replace('_', '[ _]')}\\b`, 'gi'),
        // Direct mention with punctuation
        new RegExp(`\\b${bodyPart.replace('_', '[ _]')}\\s*[:,-]\\s*\\w+`, 'gi')
      ]
      
      let foundMatch = false
      const lowerText = text.toLowerCase()
      
      // Check for body part variants in text
      const variantFound = bodyPartVariants.some(variant => 
        lowerText.includes(variant.toLowerCase())
      )
      
      if (variantFound && !foundMatch) {
        // Find the most relevant sentence
        const sentences = text.split(/[.!?]+/)
        const relevantSentence = sentences.find(sentence => 
          bodyPartVariants.some(variant => 
            sentence.toLowerCase().includes(variant.toLowerCase())
          )
        )?.trim()
        
        if (relevantSentence && relevantSentence.length > 5) {
          const coord = activeCoords[bodyPart]
          if (coord && typeof coord === 'object' && coord.x !== undefined && coord.y !== undefined) {
            findings.push({
              bodyPart: bodyPart.replace(/_/g, ' '),
              description: relevantSentence.length > 100 ? 
                relevantSentence.substring(0, 97) + '...' : 
                relevantSentence,
              coordinates: coord
            })
            foundMatch = true
          }
        }
      }
    })
    
    return findings
  }
  
  // Update findings when examination data or diagram changes
  useEffect(() => {
    if (!currentDiagram || !coordinates) return
    
    const allExaminationText = [
      examinationData.generalExamination || '',
      examinationData.cardiovascularExamination || '',
      examinationData.respiratoryExamination || '',
      examinationData.abdominalExamination || '',
      examinationData.otherSystemsExamination || ''
    ].join(' ')
    
    const extractedFindings = extractFindingsFromText(allExaminationText)
    setFindings(extractedFindings)
  }, [examinationData, coordinates, currentDiagram])

  const handleImageLoad = () => {
    setImageLoaded(true)

  }

  // Enhanced marker position calculation with dynamic image dimensions
  const getMarkerPosition = (coords: { x: number; y: number }) => {
    if (!imageRef.current || !imageLoaded || !currentDiagram) return { left: 0, top: 0 }

    const imageElement = imageRef.current
    
    // Get actual displayed image dimensions
    const displayWidth = imageElement.offsetWidth
    const displayHeight = imageElement.offsetHeight
    
    // Use dynamic dimensions based on current diagram
    const ORIGINAL_MAPPING_WIDTH = currentDiagram.dimensions.width
    const ORIGINAL_MAPPING_HEIGHT = currentDiagram.dimensions.height
    
    // Calculate position as percentage of original mapping, then scale to display
    const percentX = coords.x / ORIGINAL_MAPPING_WIDTH
    const percentY = coords.y / ORIGINAL_MAPPING_HEIGHT
    
    // Apply percentage to actual displayed image dimensions
    const scaledX = percentX * displayWidth
    const scaledY = percentY * displayHeight
    
    return {
      left: scaledX,
      top: scaledY
    }
  }

  // Reset function to reinitialize the diagram
  const handleReset = async () => {
    setIsLoading(true)
    setImageLoaded(false)
    setFindings([])
    
    try {
      // Get intelligent diagram selection
      const diagramAnalysis = selectDynamicDiagram(patientGender, examinationData)
      setAnalysis(diagramAnalysis)
      setCurrentDiagram(diagramAnalysis.primaryDiagram)

      // Get alternative diagram options
      const alternatives = getRecommendedDiagrams(patientGender, examinationData, 5)
      setAlternativeDiagrams(alternatives.slice(1)) // Exclude primary

      // Load coordinates for the selected diagram
      const coords = await loadDiagramCoordinates(diagramAnalysis.primaryDiagram)
      setCoordinates(coords)

      // Enhanced dynamic diagram reset successfully
    } catch (error) {
      // Error resetting enhanced dynamic diagram
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading || !currentDiagram) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Medical Examination Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if there's any examination data
  const hasExaminationData = Object.values(examinationData).some(
    value => value && value.trim() && value !== 'Not recorded' && value !== 'N/A' && value !== 'n/a' && value !== 'N/a'
  )

  // If no examination data, show "no data" state
  if (!hasExaminationData) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Medical Examination Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center space-y-2">
              <div className="text-4xl text-gray-300">🩺</div>
              <p className="text-sm font-medium">No examination conducted</p>
              <p className="text-xs text-gray-400">Physical examination findings will appear here when documented.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            Medical Examination Diagram
            <Badge variant="secondary" className="ml-2">
              {patientGender.charAt(0).toUpperCase() + patientGender.slice(1)}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Main Diagram */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full max-w-full overflow-hidden rounded-lg border bg-gray-50 dark:bg-gray-900">
              {currentDiagram && (
                <div className="relative w-full h-auto">
                  <Image
                    ref={imageRef}
                    src={currentDiagram.imagePath}
                    alt={`${patientGender} ${currentDiagram.type} view`}
                    width={currentDiagram.dimensions.width}
                    height={currentDiagram.dimensions.height}
                    className="w-full h-auto max-w-full object-contain"
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                </div>
              )}
              
              {/* Markers - Enhanced */}
              {imageLoaded && findings.map((finding, index) => {
                if (!finding.coordinates) return null
                
                const position = getMarkerPosition(finding.coordinates)
                
                return (
                  <div
                    key={index}
                    className="absolute bg-red-500 border-2 border-white text-white rounded-full flex items-center justify-center font-bold shadow-lg cursor-pointer hover:bg-red-600 transition-all duration-200 hover:scale-110 z-10 w-6 h-6 text-xs md:w-7 md:h-7 md:text-sm"
                    style={{
                      left: `calc(${position.left}px - 0.75rem)`,
                      top: `calc(${position.top}px - 0.75rem)`,
                      transform: currentDiagram.mirrorImage ? 'scaleX(-1)' : 'none'
                    }}
                    title={`${finding.bodyPart}: ${finding.description}`}
                  >
                    {index + 1}
                  </div>
                )
              })}
              
              {findings.length === 0 && imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-white text-center p-4">
                    <p className="font-medium">No findings detected</p>
                    <p className="text-sm opacity-80 mt-1">
                      Try switching to a different view or add more examination details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Findings List */}
          <div className="w-full lg:w-1/3 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Examination Findings
              <Badge variant="outline">{findings.length}</Badge>
            </h3>
            
            {findings.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {findings.map((finding, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {finding.bodyPart}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {finding.description}
                        </p>
                        {finding.coordinates && (
                          <p className="text-xs text-gray-400 mt-2">
                            Position: ({finding.coordinates.x}, {finding.coordinates.y})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Stethoscope className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">No examination findings detected</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add detailed physical examination notes to see findings mapped on the diagram
                </p>
              </div>
            )}

            {/* Diagram Information */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Current View</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Type:</strong> {currentDiagram.type.charAt(0).toUpperCase() + currentDiagram.type.slice(1)}</p>
                <p><strong>Dimensions:</strong> {currentDiagram.dimensions.width} × {currentDiagram.dimensions.height}</p>
                {currentDiagram.mirrorImage && (
                  <p><strong>Mirror:</strong> Applied</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}