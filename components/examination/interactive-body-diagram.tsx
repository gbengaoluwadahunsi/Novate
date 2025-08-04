"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface InteractiveBodyDiagramProps {
  gender: string
  findings: { [key: string]: string }
  onFindingChange: (region: string, finding: string) => void
  disabled?: boolean
}

// Body regions for examination
const MALE_BODY_REGIONS = [
  { id: 'head', name: 'Head', x: 150, y: 50 },
  { id: 'neck', name: 'Neck', x: 150, y: 90 },
  { id: 'chest', name: 'Chest', x: 150, y: 130 },
  { id: 'abdomen', name: 'Abdomen', x: 150, y: 180 },
  { id: 'pelvisgroins', name: 'Pelvis/Groins', x: 150, y: 220 },
  { id: 'leftarm', name: 'Left Arm', x: 100, y: 140 },
  { id: 'rightarm', name: 'Right Arm', x: 200, y: 140 },
  { id: 'leftleg', name: 'Left Leg', x: 130, y: 280 },
  { id: 'rightleg', name: 'Right Leg', x: 170, y: 280 },
  { id: 'back', name: 'Back', x: 400, y: 150 }
]

const FEMALE_BODY_REGIONS = [
  { id: 'head', name: 'Head', x: 150, y: 50 },
  { id: 'neck', name: 'Neck', x: 150, y: 90 },
  { id: 'chest', name: 'Chest/Breasts', x: 150, y: 130 },
  { id: 'abdomen', name: 'Abdomen', x: 150, y: 180 },
  { id: 'pelvisgroins', name: 'Pelvis/Groins', x: 150, y: 220 },
  { id: 'leftarm', name: 'Left Arm', x: 100, y: 140 },
  { id: 'rightarm', name: 'Right Arm', x: 200, y: 140 },
  { id: 'leftleg', name: 'Left Leg', x: 130, y: 280 },
  { id: 'rightleg', name: 'Right Leg', x: 170, y: 280 },
  { id: 'back', name: 'Back', x: 400, y: 150 }
]

// Male body outline SVG
const MaleBodyOutline = ({ onRegionClick, selectedRegion, findings }: any) => (
  <div className="relative">
    <svg width="500" height="350" viewBox="0 0 500 350" className="border rounded">
      {/* Male body outline - front view */}
      <g className="body-outline">
        {/* Head */}
        <circle cx="150" cy="50" r="20" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Neck */}
        <rect x="140" y="70" width="20" height="20" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Torso */}
        <rect x="125" y="90" width="50" height="80" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Arms */}
        <rect x="80" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
        <rect x="180" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Legs */}
        <rect x="125" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
        <rect x="155" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
        
        {/* Back view */}
        <g transform="translate(280, 0)">
          <circle cx="150" cy="50" r="20" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="140" y="70" width="20" height="20" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="125" y="90" width="50" height="80" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="80" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="180" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="125" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="155" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
        </g>
      </g>
      
      {/* Interactive regions */}
      {MALE_BODY_REGIONS.map((region) => (
        <circle
          key={region.id}
          cx={region.x}
          cy={region.y}
          r="12"
          fill={selectedRegion === region.id ? "#3b82f6" : findings[region.id] ? "#10b981" : "#ef4444"}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80"
          onClick={() => onRegionClick(region.id)}
        />
      ))}
      
      {/* Labels */}
      <text x="150" y="320" textAnchor="middle" className="text-sm font-medium">Front View</text>
      <text x="430" y="320" textAnchor="middle" className="text-sm font-medium">Back View</text>
    </svg>
  </div>
)

// Female body outline SVG
const FemaleBodyOutline = ({ onRegionClick, selectedRegion, findings }: any) => (
  <div className="relative">
    <svg width="500" height="350" viewBox="0 0 500 350" className="border rounded">
      {/* Female body outline - front view */}
      <g className="body-outline">
        {/* Head */}
        <circle cx="150" cy="50" r="20" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Neck */}
        <rect x="140" y="70" width="20" height="20" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Torso with breast indication */}
        <rect x="125" y="90" width="50" height="80" fill="none" stroke="#333" strokeWidth="2"/>
        <circle cx="135" cy="110" r="8" fill="none" stroke="#333" strokeWidth="1"/>
        <circle cx="165" cy="110" r="8" fill="none" stroke="#333" strokeWidth="1"/>
        {/* Arms */}
        <rect x="80" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
        <rect x="180" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
        {/* Legs */}
        <rect x="125" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
        <rect x="155" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
        
        {/* Back view */}
        <g transform="translate(280, 0)">
          <circle cx="150" cy="50" r="20" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="140" y="70" width="20" height="20" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="125" y="90" width="50" height="80" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="80" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="180" y="100" width="40" height="15" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="125" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
          <rect x="155" y="170" width="20" height="60" fill="none" stroke="#333" strokeWidth="2"/>
        </g>
      </g>
      
      {/* Interactive regions */}
      {FEMALE_BODY_REGIONS.map((region) => (
        <circle
          key={region.id}
          cx={region.x}
          cy={region.y}
          r="12"
          fill={selectedRegion === region.id ? "#3b82f6" : findings[region.id] ? "#10b981" : "#ef4444"}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80"
          onClick={() => onRegionClick(region.id)}
        />
      ))}
      
      {/* Labels */}
      <text x="150" y="320" textAnchor="middle" className="text-sm font-medium">Front View</text>
      <text x="430" y="320" textAnchor="middle" className="text-sm font-medium">Back View</text>
    </svg>
  </div>
)

export default function InteractiveBodyDiagram({
  gender,
  findings,
  onFindingChange,
  disabled = false
}: InteractiveBodyDiagramProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  
  const bodyRegions = gender === 'Female' ? FEMALE_BODY_REGIONS : MALE_BODY_REGIONS
  const BodyOutline = gender === 'Female' ? FemaleBodyOutline : MaleBodyOutline

  const handleRegionClick = (regionId: string) => {
    if (disabled) return
    setSelectedRegion(regionId)
  }

  const handleFindingChange = (value: string) => {
    if (selectedRegion) {
      onFindingChange(selectedRegion, value)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Examination</CardTitle>
        <div className="flex gap-2 text-sm">
          <Badge variant="destructive">⚫ Not Examined</Badge>
          <Badge variant="default" className="bg-green-500">⚫ Examined</Badge>  
          <Badge variant="default">⚫ Currently Selected</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Body Diagram */}
          <div>
            <BodyOutline 
              onRegionClick={handleRegionClick}
              selectedRegion={selectedRegion}
              findings={findings}
            />
          </div>
          
          {/* Examination Input */}
          <div className="space-y-4">
            {selectedRegion ? (
              <div>
                <Label>
                  Examination findings for: {bodyRegions.find(r => r.id === selectedRegion)?.name}
                </Label>
                <Textarea
                  value={findings[selectedRegion] || ''}
                  onChange={(e) => handleFindingChange(e.target.value)}
                  disabled={disabled}
                  placeholder="Enter examination findings for this region..."
                  rows={4}
                />
                {!disabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRegion(null)}
                    className="mt-2"
                  >
                    Close
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Click on a body region to add examination findings</p>
                <p className="text-sm mt-2">Red dots = Not examined | Green dots = Examined</p>
              </div>
            )}
            
            {/* Summary of examined regions */}
            <div className="space-y-2">
              <Label>Examined Regions Summary:</Label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {Object.entries(findings).filter(([_, finding]) => finding.trim()).map(([regionId, finding]) => {
                  const regionName = bodyRegions.find(r => r.id === regionId)?.name
                  return (
                    <div key={regionId} className="text-sm p-2 bg-gray-50 rounded">
                      <strong>{regionName}:</strong> {finding.slice(0, 60)}{finding.length > 60 ? '...' : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}