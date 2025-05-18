"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft } from "lucide-react"
import MedicalNoteTemplateEditable from "./medical-note-template-editable"

interface MedicalNoteWithSidebarProps {
  initialData: any
  onSave: (data: any) => void
}

export default function MedicalNoteWithSidebar({ initialData, onSave }: MedicalNoteWithSidebarProps) {
  const [showSidebar, setShowSidebar] = useState(true)

  return (
    <div className="container mx-auto py-6">
      <div className="flex mb-6 items-center">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-blue-500">Medical Note Editor</h1>
          <p className="text-muted-foreground">Review and edit the transcribed medical note</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {showSidebar && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <div className="p-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Patient Information
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Chief Complaint
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      History of Presenting Illness
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Past Medical History
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      System Review
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Physical Examination
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Diagnosis
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Management Plan
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Medical Certificate
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Doctor Details
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        <div className={`${showSidebar ? "lg:col-span-3" : "lg:col-span-4"}`}>
          <MedicalNoteTemplateEditable initialData={initialData} onSave={onSave} />
        </div>
      </div>
    </div>
  )
}
