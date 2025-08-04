"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Activity } from "lucide-react"

interface CVSRespiratoryDiagramProps {
  examinationData: any
  onFieldChange: (field: string, value: string) => void
  patientInfo?: {
    name: string
    age: string
    id: string
  }
}

// Define examination zones based on the CVS/Respiratory template
const CVS_EXAMINATION_ZONES = [
  // Neck examination
  { id: "JVP", label: "JVP", x: 50, y: 15 },
  
  // Chest zones - Upper
  { id: "A", label: "Aortic Area", x: 35, y: 25 },
  { id: "P", label: "Pulmonary Area", x: 65, y: 25 },
  
  // Mid-chest
  { id: "T", label: "Tricuspid Area", x: 35, y: 35 },
  { id: "M", label: "Mitral Area", x: 65, y: 35 },
  
  // General examination areas
  { id: "G", label: "General", x: 50, y: 20 },
  { id: "G2", label: "Precordium", x: 50, y: 30 },
  { id: "G3_1", label: "Bilateral Basal", x: 30, y: 55 },
  { id: "G3_2", label: "G3_2", x: 70, y: 55 },
  
  // Percussion zones (left side)
  { id: "1_1", label: "Zone 1.1", x: 20, y: 40 },
  { id: "2_1", label: "Zone 2.1", x: 20, y: 45 },
  { id: "3_1", label: "Zone 3.1", x: 20, y: 50 },
  { id: "4_1", label: "Zone 4.1", x: 20, y: 55 },
  { id: "5_1", label: "Zone 5.1", x: 20, y: 60 },
  { id: "6_1", label: "Zone 6.1", x: 20, y: 65 },
  { id: "7_1", label: "Zone 7.1", x: 20, y: 70 },
  
  // Percussion zones (right side)
  { id: "1_2", label: "Zone 1.2", x: 80, y: 40 },
  { id: "2_2", label: "Zone 2.2", x: 80, y: 45 },
  { id: "3_2", label: "Zone 3.2", x: 80, y: 50 },
  { id: "4_2", label: "Zone 4.2", x: 80, y: 55 },
  { id: "5_2", label: "Zone 5.2", x: 80, y: 60 },
  { id: "6_2", label: "Zone 6.2", x: 80, y: 65 },
  { id: "7_2", label: "Zone 7.2", x: 80, y: 70 },
  
  // Auscultation zones (left)
  { id: "2_1_1", label: "Ausc 2.1.1", x: 25, y: 45 },
  { id: "2_1_2", label: "Ausc 2.1.2", x: 25, y: 50 },
  { id: "2_1_3", label: "Ausc 2.1.3", x: 25, y: 55 },
  
  // Auscultation zones (right)
  { id: "2_2_1", label: "Ausc 2.2.1", x: 75, y: 45 },
  { id: "2_2_2", label: "Ausc 2.2.2", x: 75, y: 50 },
  { id: "2_2_3", label: "Ausc 2.2.3", x: 75, y: 55 },
]

// SVG Chest Diagram
const ChestDiagram = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <g stroke="#374151" strokeWidth="1.5" fill="none">
      {/* Neck outline */}
      <rect x="90" y="5" width="20" height="15" rx="3" />
      
      {/* Upper chest/shoulders */}
      <path d="M 60 20 Q 50 15 40 20 L 40 40 Q 40 45 45 45 L 90 45 L 90 20 Z" />
      <path d="M 140 20 Q 150 15 160 20 L 160 40 Q 160 45 155 45 L 110 45 L 110 20 Z" />
      
      {/* Chest cavity - ribcage outline */}
      <path d="M 60 45 Q 55 50 55 60 L 55 80 Q 55 90 60 95 L 85 110 Q 100 115 115 110 L 140 95 Q 145 90 145 80 L 145 60 Q 145 50 140 45 Z" />
      
      {/* Ribcage lines */}
      <path d="M 60 50 Q 100 48 140 50" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 62 55 Q 100 53 138 55" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 64 60 Q 100 58 136 60" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 66 65 Q 100 63 134 65" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 68 70 Q 100 68 132 70" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 70 75 Q 100 73 130 75" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 72 80 Q 100 78 128 80" stroke="#d1d5db" strokeWidth="1" />
      <path d="M 74 85 Q 100 83 126 85" stroke="#d1d5db" strokeWidth="1" />
      
      {/* Heart outline (approximate) */}
      <path d="M 85 55 Q 80 50 75 55 Q 75 60 80 65 L 100 80 L 120 65 Q 125 60 125 55 Q 120 50 115 55 Q 110 50 100 55 Q 90 50 85 55" 
            fill="#fef2f2" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
      
      {/* Lung areas */}
      <ellipse cx="80" cy="70" rx="15" ry="25" fill="#f0f9ff" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
      <ellipse cx="120" cy="70" rx="15" ry="25" fill="#f0f9ff" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
      
      {/* Sternum line */}
      <line x1="100" y1="45" x2="100" y2="110" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
      
      {/* Mid-clavicular lines */}
      <line x1="80" y1="20" x2="80" y2="110" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="1,1" />
      <line x1="120" y1="20" x2="120" y2="110" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="1,1" />
    </g>
  </svg>
)

export default function CVSRespiratoryDiagram({
  examinationData,
  onFieldChange,
  patientInfo
}: CVSRespiratoryDiagramProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  
  const getFieldValue = (fieldPath: string): string => {
    const pathParts = fieldPath.split('.')
    let value = examinationData
    
    for (const part of pathParts) {
      value = value?.[part]
    }
    
    return value || ''
  }

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId)
  }

  const handleFieldChange = (field: string, value: string) => {
    onFieldChange(field, value)
  }

  // Get the appropriate field path for each zone
  const getFieldPath = (zoneId: string): string => {
    if (zoneId === 'JVP') return 'Chest.JVP'
    if (zoneId === 'G') return 'Chest.G'
    if (zoneId === 'G2') return 'Chest.G2'
    if (zoneId === 'M') return 'Chest.M'
    if (zoneId === 'T') return 'Chest.T'
    if (zoneId === 'G3_1') return 'Chest.G3_1'
    if (zoneId === 'G3_2') return 'Chest.G3_2'
    if (zoneId.includes('_')) {
      if (zoneId.includes('_1_')) return `Chest.Auscultation.${zoneId}`
      if (zoneId.includes('_2_')) return `Chest.Auscultation.${zoneId}`
      return `Chest.Percussion.${zoneId}`
    }
    return `Chest.${zoneId}`
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      {patientInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              Cardiovascular & Respiratory Examination
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
        {/* Chest Examination Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Activity className="h-5 w-5" />
              Chest Examination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 border-2 border-gray-200 rounded-lg bg-gray-50">
              <ChestDiagram />
              
              {/* Interactive zones overlay */}
              <div className="absolute inset-0">
                {CVS_EXAMINATION_ZONES.map((zone) => {
                  const fieldPath = getFieldPath(zone.id)
                  const hasFindings = getFieldValue(fieldPath).trim() !== ''
                  
                  return (
                    <button
                      key={zone.id}
                      className={`absolute w-3 h-3 rounded-full border-2 transition-all text-xs ${
                        hasFindings
                          ? 'bg-red-500 border-red-600 shadow-lg'
                          : selectedZone === zone.id
                          ? 'bg-blue-500 border-blue-600'
                          : 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500'
                      }`}
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => handleZoneClick(zone.id)}
                      title={zone.label}
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
            {selectedZone ? (
              <div>
                <Label className="text-sm font-medium">
                  {CVS_EXAMINATION_ZONES.find(z => z.id === selectedZone)?.label || selectedZone}
                </Label>
                <Textarea
                  value={getFieldValue(getFieldPath(selectedZone))}
                  onChange={(e) => handleFieldChange(getFieldPath(selectedZone), e.target.value)}
                  placeholder="Enter examination findings for this zone..."
                  className="mt-2"
                  rows={3}
                />
                
                {/* Quick input suggestions for common findings */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedZone === 'JVP' && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs" 
                            onClick={() => handleFieldChange(getFieldPath(selectedZone), 'Raised')}>
                        Raised
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(getFieldPath(selectedZone), 'Normal')}>
                        Normal
                      </Badge>
                    </>
                  )}
                  {selectedZone === 'M' && (
                    <>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(getFieldPath(selectedZone), '1st and 2nd heart sounds are heard with normal intensity.')}>
                        Normal S1/S2
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-xs"
                            onClick={() => handleFieldChange(getFieldPath(selectedZone), 'Murmur present')}>
                        Murmur
                      </Badge>
                    </>
                  )}
                  {selectedZone.includes('7_') && (
                    <Badge variant="outline" className="cursor-pointer text-xs"
                          onClick={() => handleFieldChange(getFieldPath(selectedZone), 'Stony dullness')}>
                      Stony dullness
                    </Badge>
                  )}
                  {selectedZone.includes('2_2_3') && (
                    <Badge variant="outline" className="cursor-pointer text-xs"
                          onClick={() => handleFieldChange(getFieldPath(selectedZone), 'Decrease resonance')}>
                      Decreased resonance
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click on a chest zone to record examination findings</p>
              </div>
            )}

            <Separator />

            {/* Quick findings summary */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              <Label className="text-sm font-medium text-gray-700">Recorded Findings:</Label>
              {CVS_EXAMINATION_ZONES.map((zone) => {
                const fieldPath = getFieldPath(zone.id)
                const finding = getFieldValue(fieldPath)
                if (!finding.trim()) return null
                
                return (
                  <div
                    key={zone.id}
                    className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-700">{zone.label}:</span>
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