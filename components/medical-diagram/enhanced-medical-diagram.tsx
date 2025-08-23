"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Brain, Stethoscope, Eye } from "lucide-react"
import { 
  selectDynamicDiagram, 
  getRecommendedDiagrams,
  getAllRelevantDiagrams,
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
  onFindingsChange?: (findings: Finding[]) => void
  medicalNoteText?: string
}

interface Finding {
  id: string
  bodyPart: string
  description: string
  type: 'normal' | 'abnormal' | 'pain' | 'swelling' | 'rash' | 'mass'
  coordinates?: { x: number; y: number }
  diagramType?: string
  timestamp: string
  source: 'manual' | 'auto-extracted' | 'examination-data'
}



// Finding types with colors
const findingTypes = {
  normal: { color: '#10b981', label: 'Normal', bgColor: 'bg-green-100' },
  abnormal: { color: '#ef4444', label: 'Abnormal', bgColor: 'bg-red-100' },
  pain: { color: '#f59e0b', label: 'Pain/Tenderness', bgColor: 'bg-yellow-100' },
  swelling: { color: '#8b5cf6', label: 'Swelling', bgColor: 'bg-purple-100' },
  rash: { color: '#ec4899', label: 'Rash/Skin Issue', bgColor: 'bg-pink-100' },
  mass: { color: '#6b7280', label: 'Mass/Lump', bgColor: 'bg-gray-100' }
}

export default function EnhancedMedicalDiagram({ 
  patientGender, 
  examinationData, 
  onFindingsChange,
  medicalNoteText
}: EnhancedMedicalDiagramProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [findings, setFindings] = useState<Finding[]>([])
  const [analysis, setAnalysis] = useState<ExaminationAnalysis | null>(null)
  const [activeDiagrams, setActiveDiagrams] = useState<DiagramConfig[]>([])
  const [diagramCoordinates, setDiagramCoordinates] = useState<Record<string, any>>({})
  const [alternativeDiagrams, setAlternativeDiagrams] = useState<DiagramConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  


  // Initialize multiple dynamic diagrams
  useEffect(() => {
    async function initializeMultipleDiagrams() {
      setIsLoading(true)
      try {
        // Get all relevant diagrams that should be displayed simultaneously
        const relevantDiagrams = getAllRelevantDiagrams(patientGender, examinationData, 1)
        setActiveDiagrams(relevantDiagrams)

        // Get single diagram analysis for metadata
        const diagramAnalysis = selectDynamicDiagram(patientGender, examinationData)
        setAnalysis(diagramAnalysis)

        // Load coordinates for all active diagrams
        const coordinatesMap: Record<string, any> = {}
        for (const diagram of relevantDiagrams) {
          try {
            const coords = await loadDiagramCoordinates(diagram)
            coordinatesMap[diagram.type] = coords
          } catch (error) {
            console.warn(`Failed to load coordinates for ${diagram.type}`)
          }
        }
        setDiagramCoordinates(coordinatesMap)

      } catch (error) {
        // Fallback to front view only
        const fallbackConfig: DiagramConfig = {
          type: 'front' as const,
          imagePath: `/medical-images/${patientGender}front.png`,
          jsonKey: `${patientGender}front.png`,
          priority: 1,
          dimensions: { width: 750, height: 1140 }
        }
        
        setActiveDiagrams([fallbackConfig])
        
        // Try to load fallback coordinates
        try {
          const fallbackCoords = patientGender === 'male' ? 
            await import('../../scripts/mappedJsons/malefront.json') :
            await import('../../scripts/mappedJsons/femalefront.json')
          setDiagramCoordinates({ front: fallbackCoords.default || fallbackCoords })
        } catch (coordError) {
          console.error('Error loading fallback coordinates')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeMultipleDiagrams()
  }, [patientGender, JSON.stringify(examinationData)])





  // Auto-generate findings from medical note text
  useEffect(() => {
    if (medicalNoteText && findings.length === 0) {
      generateFindingsFromMedicalNote(medicalNoteText)
    }
  }, [medicalNoteText])

  // Generate findings from medical note content  
  const generateFindingsFromMedicalNote = (noteText: string) => {
    const autoFindings: Finding[] = []
    const lowerText = noteText.toLowerCase()

    // Neurological findings patterns
    if (lowerText.includes('weakness') && (lowerText.includes('left') || lowerText.includes('right'))) {
      const side = lowerText.includes('left') ? 'left' : 'right'
      autoFindings.push({
        id: `auto-weakness-${Date.now()}`,
        bodyPart: 'head',
        description: `${side.charAt(0).toUpperCase() + side.slice(1)}-sided weakness affecting face, arm, and leg`,
        type: 'abnormal' as keyof typeof findingTypes,
        coordinates: getBodyPartCoordinates('head'),
        timestamp: new Date().toISOString(),
        source: 'auto-extracted'
      })
    }

    if (lowerText.includes('facial') && lowerText.includes('droop')) {
      autoFindings.push({
        id: `auto-facial-${Date.now()}`,
        bodyPart: 'head', 
        description: 'Facial drooping observed on left side',
        type: 'abnormal' as keyof typeof findingTypes,
        coordinates: getBodyPartCoordinates('head'),
        timestamp: new Date().toISOString(),
        source: 'auto-extracted'
      })
    }

    if (lowerText.includes('heart') && lowerText.includes('regular')) {
      autoFindings.push({
        id: `auto-heart-${Date.now()}`,
        bodyPart: 'chest',
        description: 'Heart sounds regular, no murmurs detected',
        type: 'normal' as keyof typeof findingTypes,
        coordinates: getBodyPartCoordinates('chest'),
        timestamp: new Date().toISOString(),
        source: 'auto-extracted'
      })
    }

    if (lowerText.includes('lung') && lowerText.includes('clear')) {
      autoFindings.push({
        id: `auto-lungs-${Date.now()}`,
        bodyPart: 'chest',
        description: 'Lungs clear to auscultation bilaterally',  
        type: 'normal' as keyof typeof findingTypes,
        coordinates: getBodyPartCoordinates('chest'),
        timestamp: new Date().toISOString(),
        source: 'auto-extracted'
      })
    }

    // Add stroke-related findings based on assessment
    if (lowerText.includes('stroke') || lowerText.includes('cerebrovascular')) {
      autoFindings.push({
        id: `auto-stroke-${Date.now()}`,
        bodyPart: 'head',
        description: 'Clinical presentation consistent with possible stroke - urgent evaluation required',
        type: 'abnormal' as keyof typeof findingTypes,
        coordinates: getBodyPartCoordinates('head'),
        timestamp: new Date().toISOString(),
        source: 'auto-extracted'
      })
    }

    if (autoFindings.length > 0) {
      setFindings(prev => [...prev, ...autoFindings])
    }
  }

  // Notify parent of findings changes
  useEffect(() => {
    if (onFindingsChange) {
      onFindingsChange(findings)
    }
  }, [findings, onFindingsChange])





  const getBodyPartCoordinates = (bodyPart: string, diagramCoords?: any) => {
    const coords = diagramCoords || (activeDiagrams.length > 0 ? diagramCoordinates[activeDiagrams[0].type] : null)
    if (!coords) return null
    
    // Try to find matching coordinates in the JSON mapping
    const coordKey = Object.keys(coords).find(key => 
      key.toLowerCase().includes(bodyPart.toLowerCase()) ||
      bodyPart.toLowerCase().includes(key.toLowerCase())
    )
    
    return coordKey ? coords[coordKey] : null
  }

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>, diagram?: DiagramConfig) => {
    const targetElement = event.currentTarget
    const diagramType = diagram?.type || activeDiagrams[0]?.type
    const coords = diagramCoordinates[diagramType]
    
    if (!targetElement || !coords) return

    const rect = targetElement.getBoundingClientRect()
    const scaleX = targetElement.naturalWidth / rect.width
    const scaleY = targetElement.naturalHeight / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    // Find clicked body part
    let clickedBodyPart = ''
    let minDistance = Infinity
    
    Object.entries(coords).forEach(([key, coord]: [string, any]) => {
      if (coord && typeof coord === 'object' && coord.x !== undefined && coord.y !== undefined) {
        const distance = Math.sqrt(
          Math.pow(x - coord.x, 2) + Math.pow(y - coord.y, 2)
        )
        
        if (distance < minDistance && distance < 100) { // Within 100px threshold
          minDistance = distance
          clickedBodyPart = key
        }
      }
    })

    if (clickedBodyPart) {
      // Coordinate mapping functionality preserved for existing system
      console.log('Clicked body part:', clickedBodyPart, 'on diagram:', diagramType)
    }
  }



    return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                Enhanced Physical Examination Mapper
          </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Interactive medical diagram with intelligent finding extraction
              </p>
            </div>
            
            {analysis && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  {analysis.confidence.toFixed(0)}% Match
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {activeDiagrams.length} diagram{activeDiagrams.length === 1 ? '' : 's'} active
                </Badge>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mt-4">

            
            {activeDiagrams.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {activeDiagrams.map((diagram, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {diagram.type}
                  </Badge>
                ))}
              </div>
            )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Multiple Diagrams - Vertical Stack */}
        <div className="space-y-8">
          {activeDiagrams.map((diagram, index) => (
            <div key={diagram.type} className="w-full">
              {/* Diagram Section Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  {diagram.type.charAt(0).toUpperCase() + diagram.type.slice(1)} View
                </h3>
                <p className="text-sm text-gray-600">
                  {diagram.type === 'cardiorespi' ? 'Heart and respiratory system examination' :
                   diagram.type === 'abdominallinguinal' ? 'Abdominal and inguinal region examination' :
                   diagram.type === 'back' ? 'Back and spine examination' :
                   diagram.type === 'front' ? 'General anterior body examination' :
                   diagram.type === 'leftside' ? 'Left lateral body examination' :
                   diagram.type === 'rightside' ? 'Right lateral body examination' :
                   'Medical examination diagram'}
                </p>
              </div>

              {/* Diagram Container - Full Width with Optimal Size */}
              <div className="flex justify-center mb-6">
                <div className="relative max-w-2xl w-full">
                  <div className="relative w-full overflow-hidden rounded-lg border bg-white dark:bg-white">
                    <div className="relative w-full h-auto">
                      <Image
                        ref={index === 0 ? imageRef : undefined}
                        src={diagram.imagePath}
                        alt={`${patientGender} ${diagram.type} view`}
                        width={diagram.dimensions.width}
                        height={diagram.dimensions.height}
                        className="w-full h-auto max-w-full object-contain cursor-crosshair"
                        onLoad={() => index === 0 && setImageLoaded(true)}
                        onClick={(e) => handleImageClick(e, diagram)}
                        priority={index === 0}
                      />
                      
                      {/* Interactive Markers for this specific diagram */}
                      {findings
                        .filter(finding => finding.diagramType === diagram.type || (!finding.diagramType && index === 0))
                        .map((finding) => {
                          const coords = finding.coordinates || getBodyPartCoordinates(finding.bodyPart, diagramCoordinates[diagram.type])
                          if (!coords) return null
                          
                          return (
                            <div
                              key={finding.id}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                              style={{
                                left: `${coords.x}%`,
                                top: `${coords.y}%`,
                              }}
                            >
                              {/* Marker Circle */}
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: findingTypes[finding.type].color }}
                                title={finding.description}
                              />
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {finding.description.length > 30 
                                  ? finding.description.substring(0, 27) + '...' 
                                  : finding.description}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                  

                </div>
              </div>

              {/* Findings Summary for this Diagram */}
              {findings.filter(finding => finding.diagramType === diagram.type || (!finding.diagramType && index === 0)).length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Findings on {diagram.type} view:</h4>
                  <div className="space-y-1">
                    {findings
                      .filter(finding => finding.diagramType === diagram.type || (!finding.diagramType && index === 0))
                      .map((finding) => (
                        <div key={finding.id} className="flex items-center justify-between text-xs">
                          <span>
                            <span className="font-medium">{finding.bodyPart}:</span> {finding.description}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${findingTypes[finding.type].bgColor}`}
                          >
                            {findingTypes[finding.type].label}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Separator between diagrams */}
              {index < activeDiagrams.length - 1 && (
                <div className="border-t border-gray-200 my-8"></div>
              )}
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
    </div>
  )
}