"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AI3DBodyDiagram from '@/components/examination/ai-3d-body-diagram'
import { Cpu, Eye, Zap, Users, Activity, Heart, Wind, Shield } from 'lucide-react'

export default function AIDiagramShowcase() {
  const [demoGender, setDemoGender] = useState<string>('Male')
  const [demoExamType, setDemoExamType] = useState<'general' | 'cardiovascular' | 'respiratory' | 'abdominal'>('general')
  const [demoFindings, setDemoFindings] = useState<{ [key: string]: string }>({
    chest: 'Clear lung sounds bilaterally, normal heart rate and rhythm',
    abdomen: 'Soft, non-tender, no organomegaly'
  })

  const handleDemoFindingChange = (region: string, finding: string) => {
    setDemoFindings(prev => ({ ...prev, [region]: finding }))
  }

  const features = [
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "AI-Powered Generation",
      description: "Intelligent diagram generation based on patient gender, examination type, and clinical requirements"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "3D Interactive Interface",
      description: "Fully interactive 3D models with rotate, zoom, and click-to-examine functionality"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Findings sync instantly across all diagram views with visual status indicators"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gender-Specific Anatomy",
      description: "Anatomically accurate representations that adapt to patient demographics"
    }
  ]

  const examinationTypes = [
    { id: 'general', name: 'General Examination', icon: <Activity className="h-4 w-4" />, description: 'Full-body examination overview' },
    { id: 'cardiovascular', name: 'Cardiovascular', icon: <Heart className="h-4 w-4" />, description: 'Heart and circulatory system focus' },
            { id: 'respiratory', name: 'Respiratory', icon: <Wind className="h-4 w-4" />, description: 'Pulmonary system examination' },
    { id: 'abdominal', name: 'Abdominal', icon: <Shield className="h-4 w-4" />, description: 'Digestive system and abdomen' }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered 3D Medical Diagrams
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Revolutionary AI-generated, gender-specific, interactive 3D body diagrams for comprehensive medical examinations
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">🤖 AI-Generated</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">🎮 3D Interactive</Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">⚕️ Medically Accurate</Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Live Interactive Demo
          </CardTitle>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm text-gray-600">Patient Gender:</label>
              <Select value={demoGender} onValueChange={setDemoGender}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Examination Type:</label>
              <Select value={demoExamType} onValueChange={(value: any) => setDemoExamType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {examinationTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <AI3DBodyDiagram
              gender={demoGender}
              findings={demoFindings}
              onFindingChange={handleDemoFindingChange}
              disabled={false}
              examinationType={demoExamType}
            />
          </div>
        </CardContent>
      </Card>

      {/* Examination Types Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Specialized Examination Types</CardTitle>
          <p className="text-gray-600">AI automatically generates focused diagrams for different medical examinations</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {examinationTypes.map(type => (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  {type.icon}
                  <span className="hidden sm:inline">{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {examinationTypes.map(type => (
              <TabsContent key={type.id} value={type.id}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <AI3DBodyDiagram
                      gender={demoGender}
                      findings={demoFindings}
                      onFindingChange={handleDemoFindingChange}
                      disabled={false}
                      examinationType={type.id as any}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {type.icon}
                      {type.name} Examination
                    </h3>
                    <p className="text-gray-600">{type.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium">AI Features:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Gender-specific anatomical focus</li>
                        <li>• Intelligent region highlighting</li>
                        <li>• Real-time examination feedback</li>
                        <li>• Clinical accuracy validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Clinical Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">For Medical Professionals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Visual Examination Guide</p>
                <p className="text-sm text-gray-600">Interactive 3D reference during patient examinations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Comprehensive Documentation</p>
                <p className="text-sm text-gray-600">All findings captured with precise anatomical locations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Specialized Views</p>
                <p className="text-sm text-gray-600">Focused diagrams for specific examination types</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">For Patient Care</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Improved Accuracy</p>
                <p className="text-sm text-gray-600">AI-assisted examination ensures comprehensive coverage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Visual Communication</p>
                <p className="text-sm text-gray-600">3D diagrams help explain findings to patients</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Personalized Care</p>
                <p className="text-sm text-gray-600">Gender-specific and condition-specific protocols</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specs */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-purple-600">AI Generation</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Intelligent prompt construction</li>
                <li>• Gender-aware anatomy</li>
                <li>• Real-time adaptation</li>
                <li>• Medical accuracy validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">3D Rendering</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• React Three Fiber</li>
                <li>• WebGL acceleration</li>
                <li>• Interactive regions</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Integration</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Medical note editor</li>
                <li>• PDF report generation</li>
                <li>• Real-time data sync</li>
                <li>• Fallback systems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}