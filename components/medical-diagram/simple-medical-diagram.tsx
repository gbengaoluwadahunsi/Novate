"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { 
  selectDynamicDiagram, 
  loadDiagramCoordinates,
  type DiagramConfig
} from '@/lib/dynamic-diagram-selector'

interface SimpleMedicalDiagramProps {
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

export default function SimpleMedicalDiagram({ patientGender, examinationData }: SimpleMedicalDiagramProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [findings, setFindings] = useState<Finding[]>([])
  const [currentDiagram, setCurrentDiagram] = useState<DiagramConfig | null>(null)
  const [coordinates, setCoordinates] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize dynamic diagram selection
  useEffect(() => {
    async function initializeDynamicDiagram() {
      setIsLoading(true)
      try {
        // Get intelligent diagram selection
        const diagramAnalysis = selectDynamicDiagram(patientGender, examinationData)
        setCurrentDiagram(diagramAnalysis.primaryDiagram)

        // Load coordinates for the selected diagram
        const coords = await loadDiagramCoordinates(diagramAnalysis.primaryDiagram)
        setCoordinates(coords)

      } catch (error) {
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
  }, [patientGender, examinationData])

  // Process examination data to extract findings
  useEffect(() => {
    const extractedFindings: Finding[] = []
    
    // Process each examination type
    Object.entries(examinationData).forEach(([type, data]) => {
      if (data && data.trim()) {
        // Simple extraction - you can enhance this with more sophisticated parsing
        const bodyPart = type.replace('Examination', '').toLowerCase()
        extractedFindings.push({
          bodyPart: bodyPart === 'general' ? 'general' : bodyPart,
          description: data.trim(),
          coordinates: coordinates?.[bodyPart] || coordinates?.general
        })
      }
    })

    setFindings(extractedFindings)
  }, [examinationData, coordinates])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const getMarkerPosition = (coords: { x: number; y: number }) => {
    if (!imageRef.current) return { left: 0, top: 0 }
    
    const rect = imageRef.current.getBoundingClientRect()
    return {
      left: (coords.x / 100) * rect.width,
      top: (coords.y / 100) * rect.height
    }
  }

  if (isLoading || !currentDiagram) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Check if there's any examination data
  const hasExaminationData = Object.values(examinationData).some(
    value => value && value.trim() && value !== 'Not recorded' && value !== 'N/A' && value !== 'n/a' && value !== 'N/a'
  )

  // If no examination data, show "no data" state
  if (!hasExaminationData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-4 sm:py-8 text-gray-500">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-3xl sm:text-4xl text-gray-300">🩺</div>
            <p className="text-sm font-medium">No examination conducted</p>
            <p className="text-xs text-gray-400">Physical examination findings will appear here when documented.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Medical Diagram */}
          <div className="flex-1 flex justify-center">
            <div className="relative max-w-full">
              <Image
                src={currentDiagram.imagePath}
                alt={`${patientGender} ${currentDiagram.type} medical diagram`}
                width={currentDiagram.dimensions.width}
                height={currentDiagram.dimensions.height}
                className="w-full h-auto max-w-full object-contain border border-gray-200 rounded-lg"
                priority
              />
              
              {/* Markers - Only show if there are findings */}
              {imageLoaded && findings.map((finding, index) => {
                if (!finding.coordinates) return null
                
                const position = getMarkerPosition(finding.coordinates)
                
                return (
                  <div
                    key={index}
                    className="absolute bg-red-500 border-2 border-white text-white rounded-full flex items-center justify-center font-bold shadow-lg z-10 w-6 h-6 text-xs md:w-7 md:h-7 md:text-sm"
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
            </div>
          </div>

          {/* Findings List - Only show if there are findings */}
          {findings.length > 0 && (
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {findings.map((finding, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {finding.bodyPart}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {finding.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}