"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, FileText, User, Calendar, Clock, TrendingUp, Zap, CheckCircle, AlertTriangle } from 'lucide-react'

interface EnhancedMedicalNote {
  patientInformation: {
    name: string
    age: string
    gender: string
    visitDate?: string
  }
  chiefComplaint: string
  historyOfPresentingIllness: string
  pastMedicalHistory?: string
  systemReview?: string
  physicalExamination?: string
  assessmentAndDiagnosis: string
  icd11Codes?: string[]
  managementPlan: {
    investigations?: string
    treatmentAdministered?: string
    medicationsPrescribed?: string
    patientEducation?: string
    followUp?: string
  }
  doctorDetails?: {
    name: string
    registrationNumber: string
  }
  // Legacy fields for backward compatibility
  historyOfPresentIllness?: string
  diagnosis?: string
  treatmentPlan?: string
}

interface EnhancedMedicalNoteViewerProps {
  medicalNote: EnhancedMedicalNote
  qualityMetrics?: {
    confidence?: number
    processingTime?: number
    hasComprehensiveNote?: boolean
    hasICDCodes?: boolean
    hasManagementPlan?: boolean
  }
  className?: string
}

export default function EnhancedMedicalNoteViewer({
  medicalNote,
  qualityMetrics,
  className = ""
}: EnhancedMedicalNoteViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pastMedicalHistory: false,
    systemReview: false,
    physicalExamination: false,
    managementPlan: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderQualityBadge = () => {
    if (!qualityMetrics?.processingTime) return null
    
    return (
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-blue-100 text-blue-800">
          <Zap className="h-3 w-3" />
          <span>Processed in {qualityMetrics.processingTime}s</span>
        </Badge>
      </div>
    )
  }

  const renderSection = (title: string, content: string | undefined, isExpandable = false, defaultExpanded = false) => {
    if (!content || content.trim() === '') return null

    if (isExpandable) {
      const isExpanded = expandedSections[title] ?? defaultExpanded
      return (
        <Collapsible open={isExpanded} onOpenChange={() => toggleSection(title)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto font-semibold text-left">
              <span>{title}</span>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              {content}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quality Metrics */}
      {renderQualityBadge()}

      {/* Patient Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
              <p className="font-medium">{medicalNote.patientInformation.name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Age</label>
              <p className="font-medium">{medicalNote.patientInformation.age}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Gender</label>
              <p className="font-medium capitalize">{medicalNote.patientInformation.gender}</p>
            </div>
            {medicalNote.patientInformation.visitDate && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Visit Date</label>
                <p className="font-medium">{medicalNote.patientInformation.visitDate}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chief Complaint */}
      {renderSection('Chief Complaint', medicalNote.chiefComplaint)}

      {/* History of Presenting Illness */}
      {renderSection('History of Presenting Illness', medicalNote.historyOfPresentingIllness)}

      {/* Past Medical History */}
      {renderSection('Past Medical History', medicalNote.pastMedicalHistory, true)}

      {/* System Review */}
      {renderSection('System Review', medicalNote.systemReview, true)}

      {/* Physical Examination */}
      {renderSection('Physical Examination', medicalNote.physicalExamination, true)}

      {/* Assessment and Diagnosis */}
      {renderSection('Assessment & Diagnosis', medicalNote.assessmentAndDiagnosis)}

      {/* ICD-11 Codes */}
      {medicalNote.icd11Codes && medicalNote.icd11Codes.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">ICD-11 Codes</h4>
          <div className="flex flex-wrap gap-2">
            {medicalNote.icd11Codes.map((code, index) => (
              <Badge key={index} variant="outline" className="font-mono">
                {code}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Management Plan */}
      {medicalNote.managementPlan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Management Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderSection('Investigations', medicalNote.managementPlan.investigations)}
            {renderSection('Treatment Administered', medicalNote.managementPlan.treatmentAdministered)}
            {renderSection('Medications Prescribed', medicalNote.managementPlan.medicationsPrescribed)}
            {renderSection('Patient Education', medicalNote.managementPlan.patientEducation)}
            {renderSection('Follow-up', medicalNote.managementPlan.followUp)}
          </CardContent>
        </Card>
      )}

      {/* Doctor Details */}
      {medicalNote.doctorDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                <p className="font-medium">{medicalNote.doctorDetails.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Registration No.</label>
                <p className="font-medium">{medicalNote.doctorDetails.registrationNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy Fields (for backward compatibility) */}
      {(medicalNote.historyOfPresentIllness || medicalNote.diagnosis || medicalNote.treatmentPlan) && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-500">Legacy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderSection('History of Present Illness (Legacy)', medicalNote.historyOfPresentIllness)}
            {renderSection('Diagnosis (Legacy)', medicalNote.diagnosis)}
            {renderSection('Treatment Plan (Legacy)', medicalNote.treatmentPlan)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
