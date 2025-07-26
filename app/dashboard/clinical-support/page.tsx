"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Stethoscope, Search, Brain, BookOpen, Pill, FileText, Microscope, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Sample clinical guidelines
const clinicalGuidelines = [
  {
    id: "CG001",
    title: "Hypertension Management in Adults",
    organization: "American Heart Association",
    lastUpdated: "January 2025",
    category: "Cardiovascular",
    tags: ["Hypertension", "Blood Pressure", "Cardiovascular"],
  },
  {
    id: "CG002",
    title: "Type 2 Diabetes Management",
    organization: "American Diabetes Association",
    lastUpdated: "March 2025",
    category: "Endocrinology",
    tags: ["Diabetes", "Blood Sugar", "Endocrinology"],
  },
  {
    id: "CG003",
    title: "Asthma Diagnosis and Management",
    organization: "Global Initiative for Asthma",
    lastUpdated: "February 2025",
    category: "Respiratory",
    tags: ["Asthma", "Respiratory", "Pulmonary"],
  },
  {
    id: "CG004",
    title: "Acute Pharyngitis Treatment Guidelines",
    organization: "Infectious Diseases Society of America",
    lastUpdated: "April 2025",
    category: "Infectious Disease",
    tags: ["Pharyngitis", "Sore Throat", "Antibiotics"],
  },
]

// Sample drug information
const drugInformation = [
  {
    id: "DI001",
    name: "Lisinopril",
    category: "ACE Inhibitor",
    usedFor: "Hypertension, Heart Failure",
    commonDosage: "10-40 mg daily",
    sideEffects: ["Dry cough", "Dizziness", "Headache"],
    interactions: ["NSAIDs", "Potassium supplements", "Lithium"],
  },
  {
    id: "DI002",
    name: "Metformin",
    category: "Biguanide",
    usedFor: "Type 2 Diabetes",
    commonDosage: "500-2000 mg daily",
    sideEffects: ["Nausea", "Diarrhea", "Abdominal discomfort"],
    interactions: ["Alcohol", "Contrast dyes", "Certain antibiotics"],
  },
  {
    id: "DI003",
    name: "Albuterol",
    category: "Beta-2 Agonist",
    usedFor: "Asthma, COPD",
    commonDosage: "2 puffs every 4-6 hours as needed",
    sideEffects: ["Tremor", "Nervousness", "Tachycardia"],
    interactions: ["Beta-blockers", "Certain diuretics", "MAO inhibitors"],
  },
]

// Sample differential diagnoses
const differentialDiagnoses = [
  {
    id: "DD001",
    symptom: "Chest Pain",
    possibleCauses: [
      { condition: "Acute Coronary Syndrome", likelihood: "High", urgency: "Emergency" },
      { condition: "Pulmonary Embolism", likelihood: "Medium", urgency: "Emergency" },
      { condition: "Aortic Dissection", likelihood: "Low", urgency: "Emergency" },
      { condition: "Gastroesophageal Reflux", likelihood: "Medium", urgency: "Non-urgent" },
      { condition: "Musculoskeletal Pain", likelihood: "High", urgency: "Non-urgent" },
    ],
  },
  {
    id: "DD002",
    symptom: "Headache",
    possibleCauses: [
      { condition: "Tension Headache", likelihood: "High", urgency: "Non-urgent" },
      { condition: "Migraine", likelihood: "High", urgency: "Non-urgent" },
      { condition: "Subarachnoid Hemorrhage", likelihood: "Low", urgency: "Emergency" },
      { condition: "Meningitis", likelihood: "Low", urgency: "Emergency" },
      { condition: "Brain Tumor", likelihood: "Very Low", urgency: "Urgent" },
    ],
  },
  {
    id: "DD003",
    symptom: "Sore Throat",
    possibleCauses: [
      { condition: "Viral Pharyngitis", likelihood: "Very High", urgency: "Non-urgent" },
      { condition: "Streptococcal Pharyngitis", likelihood: "Medium", urgency: "Non-urgent" },
      { condition: "Epiglottitis", likelihood: "Very Low", urgency: "Emergency" },
      { condition: "Peritonsillar Abscess", likelihood: "Low", urgency: "Urgent" },
      { condition: "Allergic Rhinitis", likelihood: "Medium", urgency: "Non-urgent" },
    ],
  },
]

export default function ClinicalSupportPage() {
  const [activeTab, setActiveTab] = useState("guidelines")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredGuidelines = clinicalGuidelines.filter(
    (guideline) =>
      guideline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guideline.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guideline.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guideline.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredDrugs = drugInformation.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.usedFor.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredDiagnoses = differentialDiagnoses.filter(
    (diagnosis) =>
      diagnosis.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diagnosis.possibleCauses.some((cause) => cause.condition.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleViewResource = (resourceType: string, resourceId: string) => {
    toast({
      title: `View ${resourceType}`,
      description: `Viewing ${resourceType} with ID ${resourceId} - This is a demo action.`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Clinical Support</h1>
            <p className="text-muted-foreground">Access clinical guidelines, drug information, and diagnostic tools</p>
          </div>
        </div>
      </motion.div>

      <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        <AlertTitle>Beta Feature</AlertTitle>
        <AlertDescription>
          Clinical Support is currently in beta. Information provided should be verified with official sources.
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clinical resources..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="guidelines" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Guidelines
          </TabsTrigger>
          <TabsTrigger value="drugs" className="flex items-center gap-2">
            <Pill className="h-4 w-4" /> Drug Information
          </TabsTrigger>
          <TabsTrigger value="differential" className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> Differential Diagnosis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Guidelines</CardTitle>
              <CardDescription>Evidence-based recommendations for diagnosis and treatment</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredGuidelines.length > 0 ? (
                <div className="space-y-4">
                  {filteredGuidelines.map((guideline) => (
                    <div key={guideline.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{guideline.title}</h3>
                          <p className="text-sm text-muted-foreground">{guideline.organization}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {guideline.category}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {guideline.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Last updated: {guideline.lastUpdated}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResource("Guideline", guideline.id)}
                          >
                            View Guideline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No guidelines found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or browse all guidelines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drugs">
          <Card>
            <CardHeader>
              <CardTitle>Drug Information</CardTitle>
              <CardDescription>Comprehensive information on medications and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDrugs.length > 0 ? (
                <div className="space-y-4">
                  {filteredDrugs.map((drug) => (
                    <div key={drug.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{drug.name}</h3>
                          <p className="text-sm text-muted-foreground">{drug.category}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {drug.usedFor}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Common Dosage</h4>
                          <p className="text-sm">{drug.commonDosage}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Side Effects</h4>
                          <ul className="text-sm list-disc pl-5">
                            {drug.sideEffects.map((effect, index) => (
                              <li key={index}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Common Interactions</h4>
                        <div className="flex flex-wrap gap-1">
                          {drug.interactions.map((interaction, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResource("Drug Information", drug.id)}
                        >
                          Full Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No medications found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or browse all medications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="differential">
          <Card>
            <CardHeader>
              <CardTitle>Differential Diagnosis</CardTitle>
              <CardDescription>Explore possible diagnoses based on presenting symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDiagnoses.length > 0 ? (
                <div className="space-y-6">
                  {filteredDiagnoses.map((diagnosis) => (
                    <div key={diagnosis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium text-lg mb-4">
                        Presenting Symptom: <span className="text-blue-600">{diagnosis.symptom}</span>
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left p-2 border">Possible Condition</th>
                              <th className="text-left p-2 border">Likelihood</th>
                              <th className="text-left p-2 border">Urgency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnosis.possibleCauses.map((cause, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2 border">{cause.condition}</td>
                                <td className="p-2 border">
                                  <Badge
                                    variant="outline"
                                    className={
                                      cause.likelihood === "High" || cause.likelihood === "Very High"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : cause.likelihood === "Medium"
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                          : "bg-gray-50 text-gray-700 border-gray-200"
                                    }
                                  >
                                    {cause.likelihood}
                                  </Badge>
                                </td>
                                <td className="p-2 border">
                                  <Badge
                                    variant="outline"
                                    className={
                                      cause.urgency === "Emergency"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : cause.urgency === "Urgent"
                                          ? "bg-orange-50 text-orange-700 border-orange-200"
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                    }
                                  >
                                    {cause.urgency}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResource("Differential Diagnosis", diagnosis.id)}
                        >
                          Detailed Analysis
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Microscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No differential diagnoses found</h3>
                  <p className="text-muted-foreground">Try searching for a different symptom or condition</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
