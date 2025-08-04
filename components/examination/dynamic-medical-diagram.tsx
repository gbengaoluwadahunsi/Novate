"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'

interface ExaminationFinding {
  id: string
  label: string
  value: string
  position: {
    x: number  // Percentage (0-100)
    y: number  // Percentage (0-100)
  }
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  section: 'general' | 'cardiovascular' | 'respiratory' | 'abdominal' | 'other'
}

interface DynamicMedicalDiagramProps {
  diagramComponent: React.ComponentType<{ className?: string }>
  findings: ExaminationFinding[]
  title: string
  className?: string
  maxWidth?: string
}

const colorMap = {
  red: 'bg-red-500 border-red-600',
  blue: 'bg-blue-500 border-blue-600', 
  green: 'bg-green-500 border-green-600',
  yellow: 'bg-yellow-500 border-yellow-600',
  purple: 'bg-purple-500 border-purple-600'
}

export default function DynamicMedicalDiagram({
  diagramComponent: DiagramComponent,
  findings,
  title,
  className = '',
  maxWidth = 'max-w-md'
}: DynamicMedicalDiagramProps) {
  const [hoveredFinding, setHoveredFinding] = useState<string | null>(null)

  return (
    <div className={`${maxWidth} mx-auto ${className}`}>
      <h4 className="text-sm font-medium mb-3 text-gray-700 text-center">{title}</h4>
      <Card className="bg-gray-50 p-4">
        <div className="relative">
          {/* Base Diagram */}
          <DiagramComponent className="w-full h-auto" />
          
          {/* Dynamic Findings Overlay */}
          {findings.map((finding) => (
            <div
              key={finding.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${finding.position.x}%`,
                top: `${finding.position.y}%`
              }}
              onMouseEnter={() => setHoveredFinding(finding.id)}
              onMouseLeave={() => setHoveredFinding(null)}
            >
              {/* Finding Point */}
              <div 
                className={`w-3 h-3 rounded-full border-2 border-white shadow-lg animate-pulse hover:scale-125 transition-all duration-200 ${
                  colorMap[finding.color || 'red']
                }`}
              />
              
              {/* Tooltip */}
              <div className={`absolute left-4 top-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity duration-200 ${
                hoveredFinding === finding.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="font-medium">{finding.label}</div>
                <div className="text-gray-300 max-w-48 break-words">{finding.value}</div>
              </div>
            </div>
          ))}
          
          {/* Connected Lines (optional enhancement) */}
          {findings.map((finding) => (
            <svg
              key={`line-${finding.id}`} 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {/* You can add connecting lines here if needed */}
            </svg>
          ))}
        </div>
        
        {/* Legend */}
        {findings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Examination Findings:</div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {findings.slice(0, 3).map((finding) => (
                <div key={`legend-${finding.id}`} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colorMap[finding.color || 'red'].split(' ')[0]}`} />
                  <span className="text-gray-700 truncate">{finding.label}: {finding.value.slice(0, 30)}{finding.value.length > 30 ? '...' : ''}</span>
                </div>
              ))}
              {findings.length > 3 && (
                <div className="text-gray-500 text-xs">+{findings.length - 3} more findings</div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Utility function to convert examination data to findings format
export function convertExaminationDataToFindings(examinationData: any): {
  general: ExaminationFinding[]
  cardiovascular: ExaminationFinding[]
  respiratory: ExaminationFinding[]  
  abdominal: ExaminationFinding[]
} {
  const findings = {
    general: [] as ExaminationFinding[],
    cardiovascular: [] as ExaminationFinding[],
    respiratory: [] as ExaminationFinding[],
    abdominal: [] as ExaminationFinding[]
  }

  // Convert GEI (General Examination) data
  if (examinationData.GEI) {
    const gei = examinationData.GEI

    // Head findings
    if (gei.Head?.Head1) {
      findings.general.push({
        id: 'head1',
        label: 'Head',
        value: gei.Head.Head1,
        position: { x: 50, y: 12 }, // Top center of head
        color: 'red',
        section: 'general'
      })
    }

    // Face findings
    if (gei.Face?.Face1) {
      findings.general.push({
        id: 'face1', 
        label: 'Face',
        value: gei.Face.Face1,
        position: { x: 50, y: 18 }, // Face area
        color: 'red',
        section: 'general'
      })
    }

    // Eye findings
    if (gei.Eyes?.Eye1) {
      findings.general.push({
        id: 'eye1',
        label: 'Right Eye',
        value: gei.Eyes.Eye1,
        position: { x: 46, y: 16 }, // Right eye position
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Eyes?.Eye2) {
      findings.general.push({
        id: 'eye2',
        label: 'Left Eye', 
        value: gei.Eyes.Eye2,
        position: { x: 54, y: 16 }, // Left eye position
        color: 'red',
        section: 'general'
      })
    }

    // Neck findings
    if (gei.Neck?.Neck1) {
      findings.general.push({
        id: 'neck1',
        label: 'Neck',
        value: gei.Neck.Neck1,
        position: { x: 50, y: 25 }, // Neck area
        color: 'red',
        section: 'general'
      })
    }

    // Shoulder findings
    if (gei.Shoulders?.Shoulder1?.[1]) {
      findings.general.push({
        id: 'shoulder1',
        label: 'Right Shoulder',
        value: gei.Shoulders.Shoulder1[1],
        position: { x: 32, y: 35 }, // Right shoulder
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Shoulders?.Shoulder1?.[2]) {
      findings.general.push({
        id: 'shoulder2',
        label: 'Left Shoulder',
        value: gei.Shoulders.Shoulder1[2],
        position: { x: 68, y: 35 }, // Left shoulder
        color: 'red',
        section: 'general'
      })
    }

    // Arm findings
    if (gei.Arms?.Arm1?.[1]) {
      findings.general.push({
        id: 'arm1',
        label: 'Right Arm',
        value: gei.Arms.Arm1[1],
        position: { x: 28, y: 45 }, // Right arm
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Arms?.Arm1?.[2]) {
      findings.general.push({
        id: 'arm2',
        label: 'Left Arm',
        value: gei.Arms.Arm1[2],
        position: { x: 72, y: 45 }, // Left arm
        color: 'red',
        section: 'general'
      })
    }

    // Hand findings
    if (gei.Arms?.Hand1?.[1]) {
      findings.general.push({
        id: 'hand1',
        label: 'Right Hand',
        value: gei.Arms.Hand1[1],
        position: { x: 24, y: 65 }, // Right hand
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Arms?.Hand1?.[2]) {
      findings.general.push({
        id: 'hand2',
        label: 'Left Hand',
        value: gei.Arms.Hand1[2],
        position: { x: 76, y: 65 }, // Left hand
        color: 'red',
        section: 'general'
      })
    }

    // Leg findings
    if (gei.Legs?.Thigh1?.[1]) {
      findings.general.push({
        id: 'thigh1',
        label: 'Right Thigh',
        value: gei.Legs.Thigh1[1],
        position: { x: 46, y: 75 }, // Right thigh
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Legs?.Thigh1?.[2]) {
      findings.general.push({
        id: 'thigh2',
        label: 'Left Thigh',
        value: gei.Legs.Thigh1[2],
        position: { x: 54, y: 75 }, // Left thigh
        color: 'red',
        section: 'general'
      })
    }

    // Knee findings
    if (gei.Legs?.Knee1?.[1]) {
      findings.general.push({
        id: 'knee1',
        label: 'Right Knee',
        value: gei.Legs.Knee1[1],
        position: { x: 46, y: 85 }, // Right knee
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Legs?.Knee1?.[2]) {
      findings.general.push({
        id: 'knee2',
        label: 'Left Knee',
        value: gei.Legs.Knee1[2],
        position: { x: 54, y: 85 }, // Left knee
        color: 'red',
        section: 'general'
      })
    }

    // Feet findings
    if (gei.Legs?.Feet1?.[1]) {
      findings.general.push({
        id: 'feet1',
        label: 'Right Foot',
        value: gei.Legs.Feet1[1],
        position: { x: 46, y: 95 }, // Right foot
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Legs?.Feet1?.[2]) {
      findings.general.push({
        id: 'feet2',
        label: 'Left Foot',
        value: gei.Legs.Feet1[2],
        position: { x: 54, y: 95 }, // Left foot
        color: 'red',
        section: 'general'
      })
    }
  }

  // Convert CVS/Respiratory data
  if (examinationData.CVSRespExamination?.Chest) {
    const chest = examinationData.CVSRespExamination.Chest

    // Heart sounds
    if (chest.A) {
      findings.cardiovascular.push({
        id: 'aortic',
        label: 'Aortic Area',
        value: chest.A,
        position: { x: 30, y: 25 }, // Aortic area
        color: 'red',
        section: 'cardiovascular'
      })
    }

    if (chest.P) {
      findings.respiratory.push({
        id: 'pulmonary',
        label: 'Pulmonary Area',
        value: chest.P,
        position: { x: 68, y: 25 }, // Pulmonary area
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.T) {
      findings.cardiovascular.push({
        id: 'tricuspid',
        label: 'Tricuspid Area',
        value: chest.T,
        position: { x: 40, y: 35 }, // Tricuspid area
        color: 'red',
        section: 'cardiovascular'
      })
    }

    if (chest.M) {
      findings.cardiovascular.push({
        id: 'mitral',
        label: 'Mitral Area',
        value: chest.M,
        position: { x: 60, y: 35 }, // Mitral area
        color: 'red',
        section: 'cardiovascular'
      })
    }

    // JVP
    if (chest.JVP) {
      findings.cardiovascular.push({
        id: 'jvp',
        label: 'JVP',
        value: chest.JVP,
        position: { x: 35, y: 15 }, // Neck area for JVP
        color: 'red',
        section: 'cardiovascular'
      })
    }

    // Lung sounds
    if (chest.G) {
      findings.respiratory.push({
        id: 'general_lung',
        label: 'General Lung Sounds',
        value: chest.G,
        position: { x: 50, y: 45 }, // Central chest
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.G2) {
      findings.respiratory.push({
        id: 'adventitious',
        label: 'Adventitious Sounds',
        value: chest.G2,
        position: { x: 50, y: 55 }, // Lower chest
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.G3_1) {
      findings.respiratory.push({
        id: 'left_lower',
        label: 'Left Lower Lobe',
        value: chest.G3_1,
        position: { x: 30, y: 65 }, // Left lower lobe
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.G3_2) {
      findings.respiratory.push({
        id: 'right_lower',
        label: 'Right Lower Lobe',
        value: chest.G3_2,
        position: { x: 70, y: 65 }, // Right lower lobe
        color: 'blue',
        section: 'respiratory'
      })
    }
  }

  // Convert Abdominal data
  if (examinationData.AbdominalInguinalExamination) {
    const abdomen = examinationData.AbdominalInguinalExamination

    if (abdomen.Stomach) {
      findings.abdominal.push({
        id: 'stomach',
        label: 'Stomach',
        value: abdomen.Stomach,
        position: { x: 50, y: 25 }, // Epigastric area
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Liver) {
      findings.abdominal.push({
        id: 'liver',
        label: 'Liver',
        value: abdomen.Liver,
        position: { x: 28, y: 30 }, // Right hypochondriac
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Spleen) {
      findings.abdominal.push({
        id: 'spleen',
        label: 'Spleen',
        value: abdomen.Spleen,
        position: { x: 72, y: 35 }, // Left hypochondriac
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Umbilicus) {
      findings.abdominal.push({
        id: 'umbilicus',
        label: 'Umbilicus',
        value: abdomen.Umbilicus,
        position: { x: 50, y: 45 }, // Umbilical area
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Bladder) {
      findings.abdominal.push({
        id: 'bladder',
        label: 'Bladder',
        value: abdomen.Bladder,
        position: { x: 50, y: 65 }, // Hypogastric area
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.RF) {
      findings.abdominal.push({
        id: 'right_flank',
        label: 'Right Flank',
        value: abdomen.RF,
        position: { x: 28, y: 50 }, // Right lumbar
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.LF) {
      findings.abdominal.push({
        id: 'left_flank',
        label: 'Left Flank',
        value: abdomen.LF,
        position: { x: 72, y: 50 }, // Left lumbar
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Appendix_RIF) {
      findings.abdominal.push({
        id: 'appendix',
        label: 'Appendix (RIF)',
        value: abdomen.Appendix_RIF,
        position: { x: 28, y: 65 }, // Right iliac fossa
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.LIF) {
      findings.abdominal.push({
        id: 'lif',
        label: 'LIF',
        value: abdomen.LIF,
        position: { x: 72, y: 65 }, // Left iliac fossa
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Scrotum) {
      findings.abdominal.push({
        id: 'scrotum',
        label: 'Scrotum',
        value: abdomen.Scrotum,
        position: { x: 50, y: 80 }, // Genital area
        color: 'green',
        section: 'abdominal'
      })
    }

    // Inguinal findings
    if (abdomen.Inguinal?.['1_1']) {
      findings.abdominal.push({
        id: 'inguinal_right',
        label: 'Right Inguinal',
        value: abdomen.Inguinal['1_1'],
        position: { x: 40, y: 75 }, // Right inguinal
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Inguinal?.['1_2']) {
      findings.abdominal.push({
        id: 'inguinal_left',
        label: 'Left Inguinal',
        value: abdomen.Inguinal['1_2'],
        position: { x: 60, y: 75 }, // Left inguinal
        color: 'green',
        section: 'abdominal'
      })
    }
  }

  return findings
}