"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Search, Filter, Plus, MoreHorizontal, Download, Eye, Share2, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Sample medical records data
const medicalRecords = [
  {
    id: "MR001",
    patientName: "Ahmed bin Ali",
    patientId: "P001",
    recordType: "Consultation Note",
    date: "17 May 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Finalized",
    tags: ["Acute pharyngitis", "Sore throat"],
  },
  {
    id: "MR002",
    patientName: "Fatima Al Mansouri",
    patientId: "P002",
    recordType: "Lab Results",
    date: "12 May 2025",
    doctor: "Dr. Michael Chen",
    department: "Cardiology",
    status: "Finalized",
    tags: ["Hypertension", "Blood work"],
  },
  {
    id: "MR003",
    patientName: "Mohammed Al Hashimi",
    patientId: "P003",
    recordType: "Treatment Plan",
    date: "5 May 2025",
    doctor: "Dr. Aisha Patel",
    department: "Endocrinology",
    status: "Finalized",
    tags: ["Type 2 Diabetes", "Medication adjustment"],
  },
  {
    id: "MR004",
    patientName: "Aisha Abdullah",
    patientId: "P004",
    recordType: "Prescription",
    date: "30 April 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Finalized",
    tags: ["Allergic rhinitis", "Antihistamines"],
  },
  {
    id: "MR005",
    patientName: "Khalid Al Mazrouei",
    patientId: "P005",
    recordType: "Consultation Note",
    date: "25 April 2025",
    doctor: "Dr. James Wilson",
    department: "Orthopedics",
    status: "Draft",
    tags: ["Osteoarthritis", "Joint pain"],
  },
]

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recordTypeFilter, setRecordTypeFilter] = useState("all")
  const { toast } = useToast()

  const filteredRecords = medicalRecords.filter(
    (record) =>
      (record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (recordTypeFilter === "all" || record.recordType === recordTypeFilter),
  )

  const handleCreateRecord = () => {
    toast({
      title: "Feature Not Available",
      description: "Creating new medical records is not available in the demo version.",
    })
  }

  const handleRecordAction = (action: string, recordId: string) => {
    const record = medicalRecords.find((r) => r.id === recordId)

    toast({
      title: `${action} Record`,
      description: `${action} record ${recordId} for ${record?.patientName} - This is a demo action.`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">Manage patient medical records and documentation</p>
          </div>
        </div>
      </motion.div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Medical Records</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Consultation Note">Consultation Notes</SelectItem>
                  <SelectItem value="Lab Results">Lab Results</SelectItem>
                  <SelectItem value="Treatment Plan">Treatment Plans</SelectItem>
                  <SelectItem value="Prescription">Prescriptions</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={handleCreateRecord} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" /> Create Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left font-medium">Record ID</th>
                    <th className="h-12 px-4 text-left font-medium">Patient</th>
                    <th className="h-12 px-4 text-left font-medium">Type</th>
                    <th className="h-12 px-4 text-left font-medium">Date</th>
                    <th className="h-12 px-4 text-left font-medium">Doctor</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                    <th className="h-12 px-4 text-left font-medium">Tags</th>
                    <th className="h-12 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle font-medium">{record.id}</td>
                        <td className="p-4 align-middle">
                          <div>
                            <div className="font-medium">{record.patientName}</div>
                            <div className="text-xs text-muted-foreground">ID: {record.patientId}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{record.recordType}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{record.date}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div>
                            <div>{record.doctor}</div>
                            <div className="text-xs text-muted-foreground">{record.department}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className={
                              record.status === "Finalized"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                            }
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1">
                            {record.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRecordAction("View", record.id)}>
                                <Eye className="h-4 w-4 mr-2" /> View Record
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRecordAction("Download", record.id)}>
                                <Download className="h-4 w-4 mr-2" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRecordAction("Share", record.id)}>
                                <Share2 className="h-4 w-4 mr-2" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRecordAction("Delete", record.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="h-24 text-center">
                        No records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredRecords.length}</strong> of <strong>{medicalRecords.length}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
