"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HeartHandshake, Target } from "lucide-react"

interface AbdominalDiagramProps {
  examinationData: any
  onFieldChange: (field: string, value: string) => void
  patientInfo?: {
    name: string
    age: string
    id: string
  }
}

// Define examination regions based on the Abdominal template
const ABDOMINAL_EXAMINATION_REGIONS = [
  // Upper abdomen
  { id: "Stomach", label: "Stomach", x: 50, y: 15 },
  { id: "Liver", label: "Liver", x: 30, y: 25 },
  { id: "Spleen", label: "Spleen", x: 70, y: 25 },
  
  // Mid abdomen - anatomical regions
  { id: "RH", label: "Right Hypochondrium", x: 25, y: 35 },
  { id: "E", label: "Epigastric", x: 50, y: 35 },
  { id: "LH", label: "Left Hypochondrium", x: 75, y: 35 },
  
  // Central abdomen
  { id: "RF", label: "Right Flank", x: 25, y: 50 },
  { id: "UR", label: "Umbilical Region", x: 50, y: 50 },
  { id: "LF", label: "Left Flank", x: 75, y: 50 },
  { id: "Umbilicus", label: "Umbilicus", x: 50, y: 55 },
  
  // Lower abdomen
  { id: "RIF", label: "Right Iliac Fossa", x: 25, y: 65 },
  { id: "H", label: "Hypogastric", x: 50, y: 65 },
  { id: "LIF", label: "Left Iliac Fossa", x: 75, y: 65 },
  { id: "Appendix_RIF", label: "Appendix (RIF)", x: 30, y: 70 },
  
  // Lower regions
  { id: "Bladder", label: "Bladder", x: 50, y: 80 },
  
  // Inguinal regions
  { id: "1_1", label: "Right Inguinal", x: 35, y: 85 },
  { id: "1_2", label: "Left Inguinal", x: 65, y: 85 },
  
  // Reproductive
  { id: "Scrotum", label: "Scrotum", x: 50, y: 90 },
]

// SVG Abdominal Diagram
const AbdominalDiagramSVG = () => (
  <svg viewBox="0 0 200 180" className="w-full h-full">
    <g stroke="#374151" strokeWidth="1.5" fill="none">
      {/* Main abdominal outline */}
      <path d="M 60 20 Q 50 15 45 25 L 40 60 Q 40 70 45 75 L 45 120 Q 45 130 50 135 L 70 155 Q 100 165 130 155 L 150 135 Q 155 130 155 120 L 155 75 Q 160 70 160 60 L 155 25 Q 150 15 140 20 L 60 20 Z" />
      
      {/* Anatomical region divisions - 9 regions */}
      {/* Horizontal lines */}
      <line x1="60" y1="45" x2="140" y2="45" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="55" y1="75" x2="145" y2="75" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" />
      
      {/* Vertical lines */}
      <line x1="75" y1="25" x2="70" y2="130" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="125" y1="25" x2="130" y2="130" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" />
      
      {/* Umbilicus */}
      <circle cx="100" cy="60" r="3" fill="#f59e0b" opacity="0.6" />
      
      {/* Organ outlines (approximate) */}
      {/* Liver */}
      <path d="M 70 30 Q 65 25 80 28 L 110 32 Q 120 30 115 40 L 110 50 Q 105 45 95 45 L 75 42 Q 70 40 70 30" 
            fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
      
      {/* Stomach */}
      <ellipse cx="90" cy="35" rx="12" ry="8" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1" opacity="0.4" />
      
      {/* Spleen */}
      <ellipse cx="125" cy="40" rx="8" ry="12" fill="#fce7f3" stroke="#ec4899" strokeWidth="1" opacity="0.4" />
      
      {/* Bladder */}
      <ellipse cx="100" cy="110" rx="15" ry="10" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1" opacity="0.4" />
      
      {/* Appendix area marker */}
      <circle cx="80" cy="85" r="2" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
      
      {/* Inguinal canal areas */}
      <ellipse cx="80" cy="125" rx="8" ry="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
      <ellipse cx="120" cy="125" rx="8" ry="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
      
      {/* Lower pelvic area */}
      <path d="M 85 140 Q 90 145 100 145 Q 110 145 115 140 L 115 155 Q 110 160 100 160 Q 90 160 85 155 Z"
            fill="#fef7cd" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
      
      {/* Reference labels areas */}
      <text x="50" y="35" fontSize="8" fill="#6b7280">RH</text>
      <text x="95" y="35" fontSize="8" fill="#6b7280">E</text>
      <text x="135" y="35" fontSize="8" fill="#6b7280">LH</text>
      
      <text x="50" y="60" fontSize="8" fill="#6b7280">RF</text>
      <text x="95" y="70" fontSize="8" fill="#6b7280">UR</text>
      <text x="135" y="60" fontSize="8" fill="#6b7280">LF</text>
      
      <text x="45" y="85" fontSize="8" fill="#6b7280">RIF</text>
      <text x="95" y="85" fontSize="8" fill="#6b7280">H</text>
      <text x="135" y="85" fontSize="8" fill="#6b7280">LIF</text>
    </g>
  </svg>
)

export default function AbdominalDiagram({
  examinationData,
  onFieldChange,
  patientInfo
}: AbdominalDiagramProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  
  const getFieldValue = (field: string): string => {
    if (field.includes('.')) {
      const [section, subfield] = field.split('.')
      return examinationData?.[section]?.[subfield] || ''
    }
    return examinationData?.[field] || ''
  }

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId)
  }

  const handleFieldChange = (field: string, value: string) => {
    onFieldChange(field, value)
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      {patientInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartHandshake className="h-5 w-5 text-green-600" />
              Abdominal & Inguinal Examination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Patient's Name:</Label>
                <div className="font-medium">{patientInfo.name}</div>
              </div>
              <div>
                <Label className="text-gray-600">Patient's Age:</Label>
                <div className="font-medium">{patientInfo.age}</div>
              </div>
              <div>
                <Label className="text-gray-600">Patient's ID:</Label>
                <div className="font-medium">{patientInfo.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abdominal Examination Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Target className="h-5 w-5" />
              Abdominal Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 border-2 border-gray-200 rounded-lg bg-gray-50">
              <AbdominalDiagramSVG />
              
              {/* Interactive regions overlay */}
              <div className="absolute inset-0">
                {ABDOMINAL_EXAMINATION_REGIONS.map((region) => {
                  const hasFindings = getFieldValue(region.id).trim() !== ''
                  
                  return (
                    <button
                      key={region.id}
                      className={`absolute w-4 h-4 rounded-full border-2 transition-all text-xs ${
                        hasFindings
                          ? 'bg-red-500 border-red-600 shadow-lg'
                          : selectedRegion === region.id
                          ? 'bg-blue-500 border-blue-600'
                          : 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500'
                      }`}
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => handleRegionClick(region.id)}
                      title={region.label}
                    />
                  )
                })}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 border-yellow-500 border"></div>
                <span>Normal/Not examined</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border-red-600 border"></div>
                <span>Abnormal finding recorded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border-blue-600 border"></div>
                <span>Currently selected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examination Findings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Examination Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRegion ? (
              <div>
                <Label className="text-sm font-medium">
                  {ABDOMINAL_EXAMINATION_REGIONS.find(r => r.id === selectedRegion)?.label || selectedRegion}
                </Label>
                <Textarea
                  value={getFieldValue(selectedRegion)}
                  onChange={(e) => handleFieldChange(selectedRegion, e.target.value)}
                  placeholder="Enter examination findings for this region..."
                  className="mt-2"
                  rows={3}
                />
                
                {/* Quick input suggestions for common findings */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRegion === 'Liver' && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs" 
                            onClick={() => handleFieldChange(selectedRegion, 'Hepatomegaly')}>
                        Hepatomegaly
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Normal size')}>
                        Normal size
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Tender')}>
                        Tender
                      </Badge>
                    </>
                  )}
                  {selectedRegion === 'Spleen' && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Splenomegaly')}>
                        Splenomegaly
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Not palpable')}>
                        Not palpable
                      </Badge>
                    </>
                  )}
                  {selectedRegion === 'Appendix_RIF' && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Tender on palpation')}>
                        Tender
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'McBurney\'s point tender')}>
                        McBurney's point
                      </Badge>
                    </>
                  )}
                  {selectedRegion === 'Bladder' && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Distended')}>
                        Distended
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Empty')}>
                        Empty
                      </Badge>
                    </>
                  )}
                  {(selectedRegion === '1_1' || selectedRegion === '1_2') && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'No hernia')}>
                        No hernia
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(selectedRegion, 'Inguinal hernia present')}>
                        Hernia present
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <HeartHandshake className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click on an abdominal region to record examination findings</p>
              </div>
            )}

            <Separator />

            {/* Quick findings summary */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              <Label className="text-sm font-medium text-gray-700">Recorded Findings:</Label>
              {ABDOMINAL_EXAMINATION_REGIONS.map((region) => {
                const finding = getFieldValue(region.id)
                if (!finding.trim()) return null
                
                return (
                  <div
                    key={region.id}
                    className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-700">{region.label}:</span>
                      <span className="text-gray-600 ml-2">
                        {finding.length > 25 ? `${finding.substring(0, 25)}...` : finding}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 