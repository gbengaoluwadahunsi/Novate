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
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg hover:scale-150 transition-all duration-300 cursor-pointer ${
                  colorMap[finding.color || 'red']
                } ${hoveredFinding === finding.id ? 'animate-pulse scale-125' : 'animate-pulse'}`}
              />
              
              {/* Tooltip */}
              <div className={`absolute left-5 -top-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700 z-20 pointer-events-none transition-all duration-200 min-w-max max-w-64 ${
                hoveredFinding === finding.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <div className="font-semibold text-yellow-300 mb-1">{finding.label}</div>
                <div className="text-gray-200 text-xs leading-relaxed break-words">{finding.value}</div>
                {/* Tooltip arrow */}
                <div className="absolute left-[-6px] top-3 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-gray-900"></div>
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

    // Head findings - anatomically correct positioning
    if (gei.Head?.Head1) {
      findings.general.push({
        id: 'head1',
        label: 'Head',
        value: gei.Head.Head1,
        position: { x: 50, y: 8 }, // Top of head
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
        position: { x: 50, y: 15 }, // Center of face
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
        position: { x: 45, y: 13 }, // Right eye (patient's right)
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Eyes?.Eye2) {
      findings.general.push({
        id: 'eye2',
        label: 'Left Eye', 
        value: gei.Eyes.Eye2,
        position: { x: 55, y: 13 }, // Left eye (patient's left)
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
        position: { x: 50, y: 20 }, // Neck area
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
        position: { x: 35, y: 28 }, // Right shoulder (patient's right)
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Shoulders?.Shoulder1?.[2]) {
      findings.general.push({
        id: 'shoulder2',
        label: 'Left Shoulder',
        value: gei.Shoulders.Shoulder1[2],
        position: { x: 65, y: 28 }, // Left shoulder (patient's left)
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
        position: { x: 25, y: 40 }, // Right upper arm
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Arms?.Arm1?.[2]) {
      findings.general.push({
        id: 'arm2',
        label: 'Left Arm',
        value: gei.Arms.Arm1[2],
        position: { x: 75, y: 40 }, // Left upper arm
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
        position: { x: 20, y: 58 }, // Right hand
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Arms?.Hand1?.[2]) {
      findings.general.push({
        id: 'hand2',
        label: 'Left Hand',
        value: gei.Arms.Hand1[2],
        position: { x: 80, y: 58 }, // Left hand
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
        position: { x: 45, y: 68 }, // Right thigh
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Legs?.Thigh1?.[2]) {
      findings.general.push({
        id: 'thigh2',
        label: 'Left Thigh',
        value: gei.Legs.Thigh1[2],
        position: { x: 55, y: 68 }, // Left thigh
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
        position: { x: 45, y: 80 }, // Right knee
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Legs?.Knee1?.[2]) {
      findings.general.push({
        id: 'knee2',
        label: 'Left Knee',
        value: gei.Legs.Knee1[2],
        position: { x: 55, y: 80 }, // Left knee
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
        position: { x: 45, y: 92 }, // Right foot
        color: 'red',
        section: 'general'
      })
    }

    if (gei.Legs?.Feet1?.[2]) {
      findings.general.push({
        id: 'feet2',
        label: 'Left Foot',
        value: gei.Legs.Feet1[2],
        position: { x: 55, y: 92 }, // Left foot
        color: 'red',
        section: 'general'
      })
    }
  }

  // Convert CVS/Respiratory data
  if (examinationData.CVSRespExamination?.Chest) {
    const chest = examinationData.CVSRespExamination.Chest

    // Heart sounds - anatomically correct positioning for chest diagram
    if (chest.A) {
      findings.cardiovascular.push({
        id: 'aortic',
        label: 'Aortic Area',
        value: chest.A,
        position: { x: 65, y: 25 }, // Right 2nd intercostal space (Aortic area)
        color: 'red',
        section: 'cardiovascular'
      })
    }

    if (chest.P) {
      findings.cardiovascular.push({
        id: 'pulmonary',
        label: 'Pulmonary Area',
        value: chest.P,
        position: { x: 35, y: 25 }, // Left 2nd intercostal space (Pulmonary area)
        color: 'red',
        section: 'cardiovascular'
      })
    }

    if (chest.T) {
      findings.cardiovascular.push({
        id: 'tricuspid',
        label: 'Tricuspid Area',
        value: chest.T,
        position: { x: 60, y: 50 }, // Left lower sternal border (Tricuspid area)
        color: 'red',
        section: 'cardiovascular'
      })
    }

    if (chest.M) {
      findings.cardiovascular.push({
        id: 'mitral',
        label: 'Mitral Area',
        value: chest.M,
        position: { x: 35, y: 60 }, // Apex/5th intercostal space (Mitral area)
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
        position: { x: 65, y: 10 }, // Right side of neck for JVP
        color: 'red',
        section: 'cardiovascular'
      })
    }

    // Lung sounds - anatomically correct positioning
    if (chest.G) {
      findings.respiratory.push({
        id: 'general_lung',
        label: 'General Lung Sounds',
        value: chest.G,
        position: { x: 50, y: 35 }, // Central chest area
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.G2) {
      findings.respiratory.push({
        id: 'adventitious',
        label: 'Adventitious Sounds',
        value: chest.G2,
        position: { x: 50, y: 45 }, // Mid chest
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.G3_1) {
      findings.respiratory.push({
        id: 'left_lower',
        label: 'Left Lower Lobe',
        value: chest.G3_1,
        position: { x: 25, y: 70 }, // Left lower chest
        color: 'blue',
        section: 'respiratory'
      })
    }

    if (chest.G3_2) {
      findings.respiratory.push({
        id: 'right_lower',
        label: 'Right Lower Lobe',
        value: chest.G3_2,
        position: { x: 75, y: 70 }, // Right lower chest
        color: 'blue',
        section: 'respiratory'
      })
    }
  }

  // Convert Abdominal data
  if (examinationData.AbdominalInguinalExamination) {
    const abdomen = examinationData.AbdominalInguinalExamination

    // Abdominal findings - anatomically correct positioning
    if (abdomen.Stomach) {
      findings.abdominal.push({
        id: 'stomach',
        label: 'Stomach',
        value: abdomen.Stomach,
        position: { x: 45, y: 20 }, // Left upper quadrant (Epigastric/LUQ)
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Liver) {
      findings.abdominal.push({
        id: 'liver',
        label: 'Liver',
        value: abdomen.Liver,
        position: { x: 65, y: 25 }, // Right upper quadrant
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Spleen) {
      findings.abdominal.push({
        id: 'spleen',
        label: 'Spleen',
        value: abdomen.Spleen,
        position: { x: 25, y: 30 }, // Left upper quadrant
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Umbilicus) {
      findings.abdominal.push({
        id: 'umbilicus',
        label: 'Umbilicus',
        value: abdomen.Umbilicus,
        position: { x: 50, y: 50 }, // Center of abdomen
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Bladder) {
      findings.abdominal.push({
        id: 'bladder',
        label: 'Bladder',
        value: abdomen.Bladder,
        position: { x: 50, y: 75 }, // Suprapubic/hypogastric area
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.RF) {
      findings.abdominal.push({
        id: 'right_flank',
        label: 'Right Flank',
        value: abdomen.RF,
        position: { x: 80, y: 50 }, // Right flank/lumbar
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.LF) {
      findings.abdominal.push({
        id: 'left_flank',
        label: 'Left Flank',
        value: abdomen.LF,
        position: { x: 20, y: 50 }, // Left flank/lumbar
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Appendix_RIF) {
      findings.abdominal.push({
        id: 'appendix',
        label: 'Appendix (RIF)',
        value: abdomen.Appendix_RIF,
        position: { x: 65, y: 70 }, // Right iliac fossa (McBurney's point)
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.LIF) {
      findings.abdominal.push({
        id: 'lif',
        label: 'LIF',
        value: abdomen.LIF,
        position: { x: 35, y: 70 }, // Left iliac fossa
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Scrotum) {
      findings.abdominal.push({
        id: 'scrotum',
        label: 'Scrotum',
        value: abdomen.Scrotum,
        position: { x: 50, y: 85 }, // Scrotal area
        color: 'green',
        section: 'abdominal'
      })
    }

    // Inguinal findings - anatomically correct
    if (abdomen.Inguinal?.['1_1']) {
      findings.abdominal.push({
        id: 'inguinal_right',
        label: 'Right Inguinal',
        value: abdomen.Inguinal['1_1'],
        position: { x: 60, y: 80 }, // Right inguinal canal
        color: 'green',
        section: 'abdominal'
      })
    }

    if (abdomen.Inguinal?.['1_2']) {
      findings.abdominal.push({
        id: 'inguinal_left',
        label: 'Left Inguinal',
        value: abdomen.Inguinal['1_2'],
        position: { x: 40, y: 80 }, // Left inguinal canal
        color: 'green',
        section: 'abdominal'
      })
    }
  }

  return findings
}