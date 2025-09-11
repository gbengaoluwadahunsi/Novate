"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, FileText, User, Calendar, Clock, TrendingUp, Zap, CheckCircle, AlertTriangle } from 'lucide-react'
import { validateAllVitalSigns, getNormalRange } from "@/lib/vital-signs-validator"

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
  familyHistory?: string
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
  // Vital Signs
  vitalSigns?: {
    temperature?: string
    bloodPressure?: string
    pulseRate?: string
    respiratoryRate?: string
    glucose?: string
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

    // Convert content to bullet points for specific sections
    const shouldUseBulletPoints = [
      'History of Presenting Illness',
      'Past Medical History', 
      'System Review',
      'Physical Examination',
      'Investigations',
      'Treatment Administered',
      'Medications Prescribed',
      'Patient Education',
      'Follow-up',
      'Drug History',
      'Allergies',
      'Family History',
      'Social History',
      'Impression',
      'Diagnosis',
      'Management Plan'
    ].includes(title)

    const formatContent = (text: string) => {
      if (!shouldUseBulletPoints) return text
      
      // Special formatting for Review of Systems
      if (title === 'System Review') {
        return formatReviewOfSystems(text)
      }
      
      // Special formatting for medications
      const medicationFormat = formatMedications(text)
      if (medicationFormat) {
        return medicationFormat
      }
      
      // Special formatting for Physical Examination - handle comma-separated findings
      if (title === 'Physical Examination') {
        // Split by both sentence endings and commas for better granularity
        const findings = text.split(/[.!?]+|,(?=\s)/).filter(s => s.trim().length > 0)
        return findings.map((finding, index) => (
          <li key={index} className="mb-1">
            {finding.trim()}
          </li>
        ))
      }
      
      // Special formatting for Social History - handle structured social factors
      if (title === 'Social History') {
        // Split by common separators and create bullet points
        const socialFactors = text.split(/[.!?]+|,(?=\s)/).filter(s => s.trim().length > 0)
        return socialFactors.map((factor, index) => (
          <li key={index} className="mb-1">
            {factor.trim()}
          </li>
        ))
      }
      
      // Split by common separators and create bullet points
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      return sentences.map((sentence, index) => (
        <li key={index} className="mb-1">
          {sentence.trim()}
          {index < sentences.length - 1 ? '.' : ''}
        </li>
      ))
    }

    // Special function to format Review of Systems with specific categories
    const formatReviewOfSystems = (text: string) => {
      const systemCategories = [
        'General',
        'Ear, Nose, Throat',
        'Cardiovascular',
        'Respiratory',
        'Gastrointestinal',
        'Genitourinary',
        'Neurological',
        'Musculoskeletal',
        'Skin',
        'Endocrine',
        'Hematology',
        'Psychiatry',
        'Ophthalmology'
      ]
      
      return (
        <div className="space-y-3">
          {systemCategories.map((category) => (
            <div key={category} className="border-l-2 border-blue-200 pl-3">
              <h5 className="font-medium text-blue-800 mb-1">{category}:</h5>
              <ul className="list-disc pl-5 space-y-1">
                {text.toLowerCase().includes(category.toLowerCase()) ? (
                  // Extract relevant sentences for this category
                  text.split(/[.!?]+/)
                    .filter(sentence => 
                      sentence.toLowerCase().includes(category.toLowerCase()) && 
                      sentence.trim().length > 0
                    )
                    .map((sentence, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {sentence.trim()}
                      </li>
                    ))
                ) : (
                  <li className="text-sm text-gray-500 italic">No specific findings</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )
    }

    // Special function to format medications with Dose, Frequency, Duration
    const formatMedications = (text: string) => {
      if (title === 'Medications Prescribed' || title === 'Drug History') {
        // Split by common medication separators
        const medications = text.split(/[,;]+/).filter(m => m.trim().length > 0)
        
        return (
          <div className="space-y-3">
            {medications.map((medication, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                <h5 className="font-medium text-gray-800 mb-2">{medication.trim()}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Dose:</span>
                    <span className="ml-2 text-gray-500">Not mentioned</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Frequency:</span>
                    <span className="ml-2 text-gray-500">Not mentioned</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="ml-2 text-gray-500">Not mentioned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
      return null
    }

    // Helper function to distinguish between "Not mentioned" vs "Not mentioned"
    const getNotRecordedText = (title: string) => {
      // For sections that should show "Not mentioned" (meaning the AI didn't capture it)
      const notRecordedSections = [
        'Family History',
        'Social History',
        'Impression',
        'Diagnosis'
      ]
      
      // For sections that should show "Not mentioned" (meaning the patient didn't mention it)
      const notMentionedSections = [
        'Past Medical History',
        'Drug History',
        'Allergies'
      ]
      
      if (notRecordedSections.includes(title)) {
        return 'Not mentioned'
      } else if (notMentionedSections.includes(title)) {
        return 'Not mentioned'
      }
      
      return 'Not available'
    }

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
              {shouldUseBulletPoints ? (
                <ul className="list-disc pl-5 space-y-1">
                  {formatContent(content)}
                </ul>
              ) : (
                content
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          {shouldUseBulletPoints ? (
            <ul className="list-disc pl-5 space-y-1">
              {formatContent(content)}
            </ul>
          ) : (
            content
          )}
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
            <User className="h-5 h-5" />
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

      {/* Vital Signs */}
      {medicalNote.vitalSigns && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Temperature:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={(() => {
                    const validation = validateAllVitalSigns({
                      temperature: medicalNote.vitalSigns?.temperature || ''
                    });
                    return validation.temperature.color;
                  })()}>
                    {medicalNote.vitalSigns.temperature || 'Not mentioned'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const validation = validateAllVitalSigns({
                        temperature: medicalNote.vitalSigns?.temperature || ''
                      });
                      return validation.temperature.message;
                    })()}
                  </span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Blood Pressure:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={(() => {
                    const validation = validateAllVitalSigns({
                      bloodPressure: medicalNote.vitalSigns?.bloodPressure || ''
                    });
                    return validation.bloodPressure.color;
                  })()}>
                    {medicalNote.vitalSigns.bloodPressure || 'Not mentioned'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const validation = validateAllVitalSigns({
                        bloodPressure: medicalNote.vitalSigns?.bloodPressure || ''
                      });
                      return validation.bloodPressure.message;
                    })()}
                  </span>
                </div>
              </div>

              {/* Pulse Rate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pulse Rate:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={(() => {
                    const validation = validateAllVitalSigns({
                      pulseRate: medicalNote.vitalSigns?.pulseRate || ''
                    });
                    return validation.pulseRate.color;
                  })()}>
                    {medicalNote.vitalSigns.pulseRate || 'Not mentioned'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const validation = validateAllVitalSigns({
                        pulseRate: medicalNote.vitalSigns?.pulseRate || ''
                      });
                      return validation.pulseRate.message;
                    })()}
                  </span>
                </div>
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Respiratory Rate:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={(() => {
                    const validation = validateAllVitalSigns({
                      respiratoryRate: medicalNote.vitalSigns?.respiratoryRate || ''
                    });
                    return validation.respiratoryRate.color;
                  })()}>
                    {medicalNote.vitalSigns.respiratoryRate || 'Not mentioned'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const validation = validateAllVitalSigns({
                        respiratoryRate: medicalNote.vitalSigns?.respiratoryRate || ''
                      });
                      return validation.respiratoryRate.message;
                    })()}
                  </span>
                </div>
              </div>

              {/* Glucose */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Glucose Levels:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={(() => {
                    const validation = validateAllVitalSigns({
                      glucose: medicalNote.vitalSigns?.glucose || ''
                    });
                    return validation.glucose.color;
                  })()}>
                    {medicalNote.vitalSigns.glucose || 'Not mentioned'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const validation = validateAllVitalSigns({
                        glucose: medicalNote.vitalSigns?.glucose || ''
                      });
                      return validation.glucose.message;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chief Complaint */}
      {renderSection('Chief Complaint', medicalNote.chiefComplaint)}

      {/* History of Presenting Illness */}
      {renderSection('History of Presenting Illness', medicalNote.historyOfPresentingIllness)}

      {/* Past Medical History */}
      {renderSection('Past Medical History', medicalNote.pastMedicalHistory, true)}

      {/* System Review */}
      {medicalNote.systemReview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Review of Systems</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const systemCategories = [
                'General',
                'Ear, Nose, Throat',
                'Cardiovascular',
                'Respiratory',
                'Gastrointestinal',
                'Genitourinary',
                'Neurological',
                'Musculoskeletal',
                'Skin',
                'Endocrine',
                'Hematology',
                'Psychiatry',
                'Ophthalmology'
              ]
              
              // Find systems that actually have documented findings
              const systemsWithFindings = systemCategories
                .map(category => {
                  const relevantSentences = medicalNote.systemReview!.split(/[.!?]+/)
                    .filter(sentence => 
                      sentence.toLowerCase().includes(category.toLowerCase()) && 
                      sentence.trim().length > 0 &&
                      !sentence.toLowerCase().includes('no specific findings') &&
                      !sentence.toLowerCase().includes('not mentioned') &&
                      !sentence.toLowerCase().includes('unremarkable') &&
                      !sentence.toLowerCase().includes('normal')
                    )
                  
                  return {
                    category,
                    sentences: relevantSentences
                  }
                })
                .filter(system => system.sentences.length > 0)
              
              // If no specific systems found, show the content as general text
              if (systemsWithFindings.length === 0) {
                return (
                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <ul className="list-disc pl-5 space-y-1">
                      {(medicalNote.systemReview || 'No system review available').split(/[.!?]+/).filter(s => s.trim().length > 0).map((sentence, index) => (
                        <li key={index} className="mb-1">{sentence.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )
              }
              
              // Show only systems with actual findings
              return (
                <div className="space-y-3">
                  {systemsWithFindings.map(({ category, sentences }) => (
                    <div key={category} className="border-l-2 border-blue-200 pl-3">
                      <h5 className="font-medium text-blue-800 mb-1">{category}:</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {sentences.map((sentence, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                            {sentence.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Physical Examination */}
      {renderSection('Physical Examination', medicalNote.physicalExamination, true)}

      {/* Assessment and Diagnosis */}
      {renderSection('Assessment & Diagnosis', medicalNote.assessmentAndDiagnosis)}

      {/* ICD-11 Codes */}
      {medicalNote.icd11Codes && medicalNote.icd11Codes.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">ICD-11 Codes</h4>
          <div className="space-y-3">
            {/* Primary Codes */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Primary Codes:</h5>
              <div className="flex flex-wrap gap-2">
                {medicalNote.icd11Codes.slice(0, 2).map((code, index) => (
                  <Badge key={index} variant="default" className="font-mono bg-blue-100 text-blue-800 border-blue-300">
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Additional Suggestions */}
            {medicalNote.icd11Codes.length > 2 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Suggestions:</h5>
                <div className="flex flex-wrap gap-2">
                  {medicalNote.icd11Codes.slice(2).map((code, index) => (
                    <Badge key={index} variant="outline" className="font-mono text-gray-600 border-gray-300">
                      {code}
                    </Badge>
                ))}
                </div>
              </div>
            )}
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
            {medicalNote.managementPlan.investigations && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Investigations</h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalNote.managementPlan.investigations.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {medicalNote.managementPlan.treatmentAdministered && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Treatment Administered</h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalNote.managementPlan.treatmentAdministered.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {medicalNote.managementPlan.medicationsPrescribed && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Medications Prescribed</h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalNote.managementPlan.medicationsPrescribed.split(/[.!?]+/).filter(s => s.trim().length > 0).map((medication, index) => (
                      <li key={index} className="mb-2">
                        <div className="font-medium">{medication.trim()}</div>
                        <div className="text-xs text-gray-500 ml-4 space-y-1">
                          <div>Dose: Not mentioned</div>
                          <div>Frequency: Not mentioned</div>
                          <div>Duration: Not mentioned</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {medicalNote.managementPlan.patientEducation && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Patient Education</h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalNote.managementPlan.patientEducation.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {medicalNote.managementPlan.followUp && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Follow-up</h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalNote.managementPlan.followUp.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Family History with Canvas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Family History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Family History Text */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Family History</h5>
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              {medicalNote.familyHistory ? (
                <ul className="list-disc pl-5 space-y-1">
                  {medicalNote.familyHistory.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                    <li key={index}>{item.trim()}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 italic">Not mentioned</span>
              )}
            </div>
          </div>
          
          {/* Family Tree Canvas */}
          <div>
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Family Tree</h5>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="text-center text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Click to draw family tree</p>
                <p className="text-xs">Use the canvas to visualize family relationships</p>
              </div>
              {/* HTML5 Canvas for Family Tree */}
              <canvas 
                id="familyTreeCanvas" 
                width="400" 
                height="300" 
                className="w-full h-auto border border-gray-200 rounded cursor-crosshair mt-3"
                style={{ backgroundColor: 'white' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
