"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Users } from "lucide-react"

interface AnatomicalDiagramProps {
  gender: 'Male' | 'Female' | string
  examinationFindings: Record<string, string>
  onFindingChange: (region: string, finding: string) => void
  patientInfo?: {
    name: string
    age: string
    id: string
  }
}

interface ExaminationRegion {
  id: string
  label: string
  x: number
  y: number
  width?: number
  height?: number
}

// Define examination regions for male body diagram
const MALE_EXAMINATION_REGIONS: ExaminationRegion[] = [
  // Head and Neck
  { id: "Head1", label: "Head", x: 50, y: 5 },
  { id: "Face1", label: "Face", x: 50, y: 15 },
  { id: "Neck1", label: "Neck", x: 50, y: 25 },
  
  // Eyes
  { id: "Eye1", label: "Right Eye", x: 25, y: 15 },
  { id: "Eye2", label: "Left Eye", x: 75, y: 15 },
  
  // Upper Body - Front
  { id: "Shoulder1.1", label: "Right Shoulder", x: 15, y: 35 },
  { id: "Shoulder1.2", label: "Left Shoulder", x: 85, y: 35 },
  { id: "Arm1.1", label: "Right Arm", x: 10, y: 45 },
  { id: "Arm1.2", label: "Left Arm", x: 90, y: 45 },
  { id: "Elbow1.1", label: "Right Elbow", x: 8, y: 55 },
  { id: "Elbow1.2", label: "Left Elbow", x: 92, y: 55 },
  { id: "Forearm1.1", label: "Right Forearm", x: 6, y: 65 },
  { id: "Forearm1.2", label: "Left Forearm", x: 94, y: 65 },
  { id: "Hand1.1", label: "Right Hand", x: 4, y: 75 },
  { id: "Hand1.2", label: "Left Hand", x: 96, y: 75 },

  // Lower Body - Front
  { id: "Hip1.1", label: "Right Hip", x: 30, y: 80 },
  { id: "Hip1.2", label: "Left Hip", x: 70, y: 80 },
  { id: "Thigh1.1", label: "Right Thigh", x: 25, y: 90 },
  { id: "Thigh1.2", label: "Left Thigh", x: 75, y: 90 },
  { id: "Knee1.1", label: "Right Knee", x: 25, y: 105 },
  { id: "Knee1.2", label: "Left Knee", x: 75, y: 105 },
  { id: "Leg1.1", label: "Right Leg", x: 25, y: 115 },
  { id: "Leg1.2", label: "Left Leg", x: 75, y: 115 },
  { id: "Feet1.1", label: "Right Foot", x: 25, y: 130 },
  { id: "Feet1.2", label: "Left Foot", x: 75, y: 130 },
]

// Define examination regions for female body diagram (similar regions but may have different positioning)
const FEMALE_EXAMINATION_REGIONS: ExaminationRegion[] = [
  // Head and Neck (same as male)
  { id: "Head1", label: "Head", x: 50, y: 5 },
  { id: "Face1", label: "Face", x: 50, y: 15 },
  { id: "Neck1", label: "Neck", x: 50, y: 25 },
  
  // Eyes
  { id: "Eye1", label: "Right Eye", x: 25, y: 15 },
  { id: "Eye2", label: "Left Eye", x: 75, y: 15 },
  
  // Upper Body - Front (adjusted for female anatomy)
  { id: "Shoulder1.1", label: "Right Shoulder", x: 15, y: 35 },
  { id: "Shoulder1.2", label: "Left Shoulder", x: 85, y: 35 },
  { id: "Arm1.1", label: "Right Arm", x: 10, y: 45 },
  { id: "Arm1.2", label: "Left Arm", x: 90, y: 45 },
  { id: "Elbow1.1", label: "Right Elbow", x: 8, y: 55 },
  { id: "Elbow1.2", label: "Left Elbow", x: 92, y: 55 },
  { id: "Forearm1.1", label: "Right Forearm", x: 6, y: 65 },
  { id: "Forearm1.2", label: "Left Forearm", x: 94, y: 65 },
  { id: "Hand1.1", label: "Right Hand", x: 4, y: 75 },
  { id: "Hand1.2", label: "Left Hand", x: 96, y: 75 },

  // Lower Body - Front (similar to male)
  { id: "Hip1.1", label: "Right Hip", x: 30, y: 80 },
  { id: "Hip1.2", label: "Left Hip", x: 70, y: 80 },
  { id: "Thigh1.1", label: "Right Thigh", x: 25, y: 90 },
  { id: "Thigh1.2", label: "Left Thigh", x: 75, y: 90 },
  { id: "Knee1.1", label: "Right Knee", x: 25, y: 105 },
  { id: "Knee1.2", label: "Left Knee", x: 75, y: 105 },
  { id: "Leg1.1", label: "Right Leg", x: 25, y: 115 },
  { id: "Leg1.2", label: "Left Leg", x: 75, y: 115 },
  { id: "Feet1.1", label: "Right Foot", x: 25, y: 130 },
  { id: "Feet1.2", label: "Left Foot", x: 75, y: 130 },
]

// SVG Body Outline Components
const MaleBodyOutline = () => (
  <svg viewBox="0 0 200 280" className="w-full h-full">
    {/* Male body outline */}
    <g stroke="#374151" strokeWidth="1.5" fill="none">
      {/* Head */}
      <circle cx="100" cy="20" r="12" />
      
      {/* Neck */}
      <line x1="100" y1="32" x2="100" y2="45" />
      
      {/* Torso */}
      <path d="M 85 45 Q 85 40 90 40 L 110 40 Q 115 40 115 45 L 115 120 Q 115 125 110 125 L 90 125 Q 85 125 85 120 Z" />
      
      {/* Arms */}
      <line x1="85" y1="50" x2="65" y2="65" />
      <line x1="65" y1="65" x2="55" y2="90" />
      <line x1="55" y1="90" x2="50" y2="115" />
      
      <line x1="115" y1="50" x2="135" y2="65" />
      <line x1="135" y1="65" x2="145" y2="90" />
      <line x1="145" y1="90" x2="150" y2="115" />
      
      {/* Legs */}
      <line x1="95" y1="125" x2="90" y2="180" />
      <line x1="90" y1="180" x2="88" y2="220" />
      <line x1="88" y1="220" x2="85" y2="260" />
      
      <line x1="105" y1="125" x2="110" y2="180" />
      <line x1="110" y1="180" x2="112" y2="220" />
      <line x1="112" y1="220" x2="115" y2="260" />
      
      {/* Feet */}
      <line x1="85" y1="260" x2="75" y2="265" />
      <line x1="115" y1="260" x2="125" y2="265" />
    </g>
  </svg>
)

const FemaleBodyOutline = () => (
  <svg viewBox="0 0 200 280" className="w-full h-full">
    {/* Female body outline */}
    <g stroke="#374151" strokeWidth="1.5" fill="none">
      {/* Head */}
      <circle cx="100" cy="20" r="12" />
      
      {/* Neck */}
      <line x1="100" y1="32" x2="100" y2="45" />
      
      {/* Torso - slightly different shape for female */}
      <path d="M 88 45 Q 88 40 92 40 L 108 40 Q 112 40 112 45 L 118 80 Q 118 85 115 85 L 112 120 Q 112 125 108 125 L 92 125 Q 88 125 88 120 L 85 85 Q 82 85 82 80 Z" />
      
      {/* Arms */}
      <line x1="88" y1="50" x2="68" y2="65" />
      <line x1="68" y1="65" x2="58" y2="90" />
      <line x1="58" y1="90" x2="53" y2="115" />
      
      <line x1="112" y1="50" x2="132" y2="65" />
      <line x1="132" y1="65" x2="142" y2="90" />
      <line x1="142" y1="90" x2="147" y2="115" />
      
      {/* Legs - slightly wider hips */}
      <line x1="92" y1="125" x2="88" y2="180" />
      <line x1="88" y1="180" x2="86" y2="220" />
      <line x1="86" y1="220" x2="83" y2="260" />
      
      <line x1="108" y1="125" x2="112" y2="180" />
      <line x1="112" y1="180" x2="114" y2="220" />
      <line x1="114" y1="220" x2="117" y2="260" />
      
      {/* Feet */}
      <line x1="83" y1="260" x2="73" y2="265" />
      <line x1="117" y1="260" x2="127" y2="265" />
    </g>
  </svg>
)

export default function AnatomicalDiagram({
  gender,
  examinationFindings,
  onFindingChange,
  patientInfo
}: AnatomicalDiagramProps) {
  const isMale = gender.toLowerCase() === 'male'
  const regions = isMale ? MALE_EXAMINATION_REGIONS : FEMALE_EXAMINATION_REGIONS
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId)
  }

  const handleFindingChange = (regionId: string, value: string) => {
    onFindingChange(regionId, value)
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      {patientInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {isMale ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              General Examination Inspection (GEI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
              <div>
                <Label className="text-gray-600">Gender:</Label>
                <Badge variant={isMale ? "default" : "secondary"} className="ml-2">
                  {gender}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anatomical Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Physical Examination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 border-2 border-gray-200 rounded-lg bg-gray-50">
              {isMale ? <MaleBodyOutline /> : <FemaleBodyOutline />}
              
              {/* Interactive regions overlay */}
              <div className="absolute inset-0">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    className={`absolute w-4 h-4 rounded-full border-2 transition-all ${
                      examinationFindings[region.id]
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
                ))}
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
                  {regions.find(r => r.id === selectedRegion)?.label || selectedRegion}
                </Label>
                <Textarea
                  value={examinationFindings[selectedRegion] || ''}
                  onChange={(e) => handleFindingChange(selectedRegion, e.target.value)}
                  placeholder="Enter examination findings for this region..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click on a body region to record examination findings</p>
              </div>
            )}

            <Separator />

            {/* Quick findings list */}
            <div className="max-h-60 overflow-y-auto space-y-3">
              <Label className="text-sm font-medium text-gray-700">All Findings:</Label>
              {regions.map((region) => {
                const finding = examinationFindings[region.id]
                if (!finding) return null
                
                return (
                  <div
                    key={region.id}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium text-gray-700">
                        {region.label}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {finding.length > 20 ? `${finding.substring(0, 20)}...` : finding}
                      </Badge>
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