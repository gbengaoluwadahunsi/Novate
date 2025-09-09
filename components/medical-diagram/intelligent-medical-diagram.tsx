"use client"

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Eye, AlertCircle, Brain, Activity, Target } from "lucide-react"
import { IntelligentMedicalAnalyzer, type IntelligentAnalysis, type ClinicalFinding, type MedicalContext } from "@/lib/intelligent-medical-analyzer"

// Coordinate mappings for all diagram types
const COORDINATE_MAPPINGS: Record<string, Record<string, {x: number, y: number, width: number, height: number}>> = {
  malefront: {
    "head": { "x": 256, "y": 42, "width": 30, "height": 30 },
    "face": { "x": 254, "y": 75, "width": 30, "height": 30 },
    "nose": { "x": 256, "y": 104, "width": 25, "height": 25 },
    "left_eye": { "x": 274, "y": 82, "width": 25, "height": 25 },
    "right_eye": { "x": 236, "y": 79, "width": 25, "height": 25 },
    "mouth": { "x": 258, "y": 118, "width": 25, "height": 25 },
    "left_ear": { "x": 299, "y": 92, "width": 25, "height": 25 },
    "right_ear": { "x": 213, "y": 98, "width": 25, "height": 25 },
    "neck": { "x": 254, "y": 154, "width": 30, "height": 30 },
    "chest": { "x": 256, "y": 204, "width": 40, "height": 40 },
    "abdomen": { "x": 258, "y": 309, "width": 40, "height": 40 },
    "left_shoulder": { "x": 327, "y": 164, "width": 30, "height": 30 },
    "right_shoulder": { "x": 187, "y": 166, "width": 30, "height": 30 },
    "left_arm": { "x": 354, "y": 255, "width": 30, "height": 30 },
    "right_arm": { "x": 162, "y": 253, "width": 30, "height": 30 },
    "left_elbow": { "x": 352, "y": 310, "width": 25, "height": 25 },
    "right_elbow": { "x": 160, "y": 310, "width": 25, "height": 25 },
    "left_forearm": { "x": 368, "y": 339, "width": 30, "height": 30 },
    "right_forearm": { "x": 144, "y": 341, "width": 30, "height": 30 },
    "left_wrist": { "x": 382, "y": 383, "width": 25, "height": 25 },
    "right_wrist": { "x": 136, "y": 385, "width": 25, "height": 25 },
    "left_hand": { "x": 386, "y": 418, "width": 25, "height": 25 },
    "right_hand": { "x": 124, "y": 418, "width": 25, "height": 25 },
    "left_thigh": { "x": 297, "y": 466, "width": 35, "height": 35 },
    "right_thigh": { "x": 213, "y": 470, "width": 35, "height": 35 },
    "left_knee": { "x": 289, "y": 542, "width": 25, "height": 25 },
    "right_knee": { "x": 215, "y": 542, "width": 25, "height": 25 },
    "left_calf": { "x": 287, "y": 616, "width": 30, "height": 30 },
    "right_calf": { "x": 223, "y": 618, "width": 30, "height": 30 },
    "left_ankle": { "x": 279, "y": 689, "width": 25, "height": 25 },
    "right_ankle": { "x": 229, "y": 689, "width": 25, "height": 25 },
    "left_foot": { "x": 295, "y": 722, "width": 30, "height": 30 },
    "right_foot": { "x": 221, "y": 724, "width": 30, "height": 30 },
    "heart": { "x": 299, "y": 222, "width": 25, "height": 25 },
    "lungs": { "x": 215, "y": 204, "width": 30, "height": 30 },
    "stomach": { "x": 279, "y": 259, "width": 25, "height": 25 },
    "liver": { "x": 217, "y": 253, "width": 25, "height": 25 }
  },
  femalefront: {
    "head": { "x": 266, "y": 42, "width": 50, "height": 50 },
    "face": { "x": 266, "y": 89, "width": 50, "height": 50 },
    "neck": { "x": 266, "y": 158, "width": 50, "height": 50 },
    "chest": { "x": 266, "y": 222, "width": 50, "height": 50 },
    "heart": { "x": 307, "y": 253, "width": 50, "height": 50 },
    "lungs": { "x": 231, "y": 199, "width": 50, "height": 50 },
    "abdomen": { "x": 266, "y": 321, "width": 50, "height": 50 },
    "stomach": { "x": 285, "y": 284, "width": 50, "height": 50 },
    "liver": { "x": 234, "y": 276, "width": 50, "height": 50 }
  }
  // Add more mappings as needed
}

interface IntelligentMedicalDiagramProps {
  patientGender: 'male' | 'female'
  medicalNoteText?: string
  analysisMode?: 'intelligent' | 'basic'
}

export default function IntelligentMedicalDiagram({ 
  patientGender, 
  medicalNoteText,
  analysisMode = 'intelligent' 
}: IntelligentMedicalDiagramProps) {

  // Intelligent Medical Text Analysis for Clinical Understanding
  const getIntelligentAnalysis = (): IntelligentAnalysis => {
    if (!medicalNoteText) {
      return IntelligentMedicalAnalyzer.getInstance().analyzeMedicalText('', {
        patientGender,
        examinationType: 'general',
        bodySystems: []
      })
    }

    // Use intelligent medical analyzer
    const analyzer = IntelligentMedicalAnalyzer.getInstance()
    const context: MedicalContext = {
      patientGender,
      examinationType: 'comprehensive' as const,
      bodySystems: ['cardiovascular', 'respiratory', 'gastrointestinal', 'neurological', 'musculoskeletal']
    }
    
    return analyzer.analyzeMedicalText(medicalNoteText, context)
  }

  // Get intelligent analysis
  const intelligentAnalysis = getIntelligentAnalysis()
  
  // Convert intelligent analysis to diagram format for compatibility
  const relevantDiagrams = intelligentAnalysis.recommendedDiagrams.map((diagramType, index) => ({
    type: diagramType,
    priority: index + 1,
    findings: intelligentAnalysis.findings.map(f => f.text),
    reason: intelligentAnalysis.clinicalSummary
  }))

  // Function to get display name for diagram type
  const getDiagramDisplayName = (type: string): string => {
    const names: Record<string, string> = {
      'leftside': 'Left Side View',
      'rightside': 'Right Side View', 
      'femaleleftside': 'Left Side View',
      'femalerightside': 'Right Side View',
      'cardiorespi': 'Cardiorespiratory',
      'femalecardiorespi': 'Cardiorespiratory',
      'maleabdominallinguinal': 'Abdominal',
      'femaleabdominallinguinal': 'Abdominal',
      'back': 'Back View',
      'femaleback': 'Back View',
      'front': 'Front View',
      'femalefront': 'Front View'
    }
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Function to identify relevant body parts from medical text
  const getRelevantBodyParts = (text: string, diagramType: string): string[] => {
    if (!text) return []
    
    const lowerText = text.toLowerCase()
    const relevantParts: string[] = []
    
    // Get available coordinates for this diagram type
    const coordinates = COORDINATE_MAPPINGS[`${patientGender}${diagramType}`] || {}
    const availableParts = Object.keys(coordinates)
    
    // Map medical terms to body parts
    const bodyPartMappings: Record<string, string[]> = {
      'head': ['head', 'skull'],
      'face': ['face', 'facial'],
      'eye': ['left_eye', 'right_eye'],
      'eyes': ['left_eye', 'right_eye'],
      'neck': ['neck', 'cervical_spine'],
      'chest': ['chest'],
      'abdomen': ['abdomen'],
      'heart': ['heart'],
      'lungs': ['lungs'],
      'stomach': ['stomach'],
      'liver': ['liver']
    }
    
    // Check for mentions of body parts in the text
    Object.entries(bodyPartMappings).forEach(([term, parts]) => {
      if (lowerText.includes(term)) {
        parts.forEach(part => {
          if (availableParts.includes(part) && !relevantParts.includes(part)) {
            relevantParts.push(part)
          }
        })
      }
    })
    
    // If no specific parts found, show commonly examined areas
    if (relevantParts.length === 0) {
      const commonParts = ['head', 'chest', 'abdomen', 'heart', 'lungs'].filter(part => 
        availableParts.includes(part)
      )
      return commonParts
    }
    
    return relevantParts
  }

  return (
    <div className="w-full">
      <Card className="shadow-lg">
        <CardContent className="px-4 py-2 pt-4">
          <div className="space-y-4">
            {relevantDiagrams.map((diagram, index) => (
              <div key={diagram.type} className="border rounded-lg p-3 bg-gray-50">
                {/* Side-by-side Layout: Image Left, Findings Right */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left Side - Medical Diagram */}
                  <div className="md:w-1/2 flex-shrink-0">
                    <div className="relative max-w-xs mx-auto md:mx-0">
                      <div className="relative w-full overflow-hidden rounded-lg border bg-gray-100 shadow-sm">
                        <Image
                          src={`/medical-images/${diagram.type}.png`}
                          alt={`${diagram.type} medical diagram`}
                          width={512}
                          height={768}
                          className="w-full h-auto object-contain"
                          priority={index === 0}
                        />
                        
                        {/* Intelligent Coordinate Markers - Connected to Clinical Findings */}
                        {(() => {
                          const relevantParts = getRelevantBodyParts(medicalNoteText || '', diagram.type)
                          const coordinates = COORDINATE_MAPPINGS[diagram.type] || {}
                          
                          return relevantParts.map((partName, partIndex) => {
                            const coord = coordinates[partName]
                            if (!coord) return null
                            
                            // Find which finding corresponds to this body part
                            const findingIndex = intelligentAnalysis.findings.findIndex(finding => 
                              finding.text.toLowerCase().includes(partName.toLowerCase()) ||
                              partName.toLowerCase().includes(finding.bodyRegion.toLowerCase())
                            )
                            
                            // If no direct match, assign sequential number
                            const markerNumber = findingIndex >= 0 ? findingIndex + 1 : partIndex + 1
                            
                            // Get the finding for color coding
                            const finding = findingIndex >= 0 ? intelligentAnalysis.findings[findingIndex] : null
                            
                            return (
                              <div
                                key={partName}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                                style={{
                                  left: `${(coord.x / 512) * 100}%`,
                                  top: `${(coord.y / 768) * 100}%`,
                                }}
                              >
                                {/* Intelligent Marker - Color Coded by Clinical Significance */}
                                <div
                                  className={`w-6 h-6 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer flex items-center justify-center ${
                                    finding?.clinicalSignificance === 'abnormal'
                                      ? 'bg-red-500'
                                      : finding?.clinicalSignificance === 'normal'
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{
                                    boxShadow: `0 0 12px ${
                                      finding?.clinicalSignificance === 'abnormal'
                                        ? 'rgba(239, 68, 68, 0.6)'
                                        : finding?.clinicalSignificance === 'normal'
                                        ? 'rgba(34, 197, 94, 0.6)'
                                        : 'rgba(59, 130, 246, 0.6)'
                                    }`,
                                  }}
                                  title={`${partName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Finding #${markerNumber}`}
                                >
                                  <span className="text-white text-xs font-bold">
                                    {markerNumber}
                                  </span>
                                </div>
                                
                                {/* Enhanced Clinical Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-gray-700 shadow-lg"
                                     style={{ zIndex: 1000 }}>
                                  <div className="font-semibold">Finding #{markerNumber}</div>
                                  <div className="text-gray-300">
                                    {partName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  {finding && (
                                    <div className="mt-1 border-t border-gray-600 pt-1">
                                      <div className={`inline-block px-2 py-1 rounded text-xs ${
                                        finding.clinicalSignificance === 'abnormal'
                                          ? 'bg-red-600 text-white'
                                          : finding.clinicalSignificance === 'normal'
                                          ? 'bg-green-600 text-white'
                                          : 'bg-blue-600 text-white'
                                      }`}>
                                        {finding.clinicalSignificance.charAt(0).toUpperCase() + finding.clinicalSignificance.slice(1)}
                                      </div>
                                      {finding.severity && (
                                        <div className="inline-block px-2 py-1 rounded text-xs bg-orange-600 text-white ml-1">
                                          {finding.severity}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Clinical Findings with Intelligence */}
                  <div className="md:w-1/2 flex-shrink-0 min-w-0 md:pr-4">
                    <div className="mb-3">
                      <h5 className="text-md font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        Clinical Findings Analysis
                      </h5>
                      <p className="text-sm text-gray-600">
                        Intelligent analysis of examination findings with clinical significance
                      </p>
                    </div>

                    <div className="space-y-2">
                      {diagram.findings.map((finding, findingIndex) => {
                        // Find corresponding intelligent finding
                        const intelligentFinding = intelligentAnalysis.findings.find(f => f.text === finding)
                        
                        return (
                          <div
                            key={findingIndex}
                            className={`p-3 rounded-lg border bg-white hover:shadow-md transition-shadow mr-2 border-l-4 ${
                              intelligentFinding?.clinicalSignificance === 'abnormal' 
                                ? 'border-l-red-500 bg-red-50' 
                                : intelligentFinding?.clinicalSignificance === 'normal'
                                ? 'border-l-green-500 bg-green-50'
                                : 'border-l-blue-500'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Finding Number - Color Coded by Clinical Significance */}
                              <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-md ${
                                intelligentFinding?.clinicalSignificance === 'abnormal'
                                  ? 'bg-red-500'
                                  : intelligentFinding?.clinicalSignificance === 'normal'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}>
                                {findingIndex + 1}
                              </div>
                              
                              {/* Finding Details */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 font-medium capitalize break-words">
                                  {finding}
                                </p>
                                
                                {/* Clinical Intelligence Details */}
                                {intelligentFinding && (
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          intelligentFinding.clinicalSignificance === 'abnormal'
                                            ? 'bg-red-50 text-red-700 border-red-300'
                                            : intelligentFinding.clinicalSignificance === 'normal'
                                            ? 'bg-green-50 text-green-700 border-green-300'
                                            : 'bg-gray-50 text-gray-700 border-gray-300'
                                        }`}
                                      >
                                        {intelligentFinding.clinicalSignificance.charAt(0).toUpperCase() + intelligentFinding.clinicalSignificance.slice(1)}
                                      </Badge>
                                      {intelligentFinding.severity && (
                                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                          {intelligentFinding.severity}
                                        </Badge>
                                      )}
                                      {intelligentFinding.laterality && (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                                          {intelligentFinding.laterality}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <p><strong>Location:</strong> {intelligentFinding.anatomicalLocation}</p>
                                      <p><strong>Type:</strong> {intelligentFinding.findingType}</p>
                                      <p><strong>Priority:</strong> {intelligentFinding.priority}/5</p>
                                    </div>
                                  </div>
                                )}
                                
                                <p className="text-xs text-blue-600 mt-2 font-medium">
                                  ← See marker #{findingIndex + 1} on diagram
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {diagram.findings.length === 0 && (
                        <div className="text-center py-3 text-gray-500 text-sm mr-2">
                          No specific findings for this region
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
