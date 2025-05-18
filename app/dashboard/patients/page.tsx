"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Search, Plus, Filter, MoreHorizontal, Edit, Trash2, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Sample patient data
const patients = [
  {
    id: "P001",
    name: "Ahmed bin Ali",
    age: 28,
    gender: "Male",
    phone: "+971 50 123 4567",
    email: "ahmed.ali@example.com",
    lastVisit: "17 May 2025",
    status: "Active",
    condition: "Acute pharyngitis",
  },
  {
    id: "P002",
    name: "Fatima Al Mansouri",
    age: 35,
    gender: "Female",
    phone: "+971 55 987 6543",
    email: "fatima.m@example.com",
    lastVisit: "12 May 2025",
    status: "Active",
    condition: "Hypertension",
  },
  {
    id: "P003",
    name: "Mohammed Al Hashimi",
    age: 42,
    gender: "Male",
    phone: "+971 52 456 7890",
    email: "mohammed.h@example.com",
    lastVisit: "5 May 2025",
    status: "Active",
    condition: "Type 2 Diabetes",
  },
  {
    id: "P004",
    name: "Aisha Abdullah",
    age: 29,
    gender: "Female",
    phone: "+971 54 321 0987",
    email: "aisha.a@example.com",
    lastVisit: "30 April 2025",
    status: "Inactive",
    condition: "Allergic rhinitis",
  },
  {
    id: "P005",
    name: "Khalid Al Mazrouei",
    age: 55,
    gender: "Male",
    phone: "+971 56 789 0123",
    email: "khalid.m@example.com",
    lastVisit: "25 April 2025",
    status: "Active",
    condition: "Osteoarthritis",
  },
]

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddPatient = () => {
    toast({
      title: "Feature Not Available",
      description: "Adding new patients is not available in the demo version.",
    })
  }

  const handleAction = (action: string, patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)

    toast({
      title: `${action} Patient`,
      description: `${action} ${patient?.name} (${patientId}) - This is a demo action.`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage your patient records</p>
          </div>
        </div>
      </motion.div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Patient Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={handleAddPatient} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" /> Add Patient
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
                    <th className="h-12 px-4 text-left font-medium">Patient ID</th>
                    <th className="h-12 px-4 text-left font-medium">Name</th>
                    <th className="h-12 px-4 text-left font-medium">Age/Gender</th>
                    <th className="h-12 px-4 text-left font-medium">Contact</th>
                    <th className="h-12 px-4 text-left font-medium">Last Visit</th>
                    <th className="h-12 px-4 text-left font-medium">Status</th>
                    <th className="h-12 px-4 text-left font-medium">Condition</th>
                    <th className="h-12 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle font-medium">{patient.id}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{patient.name}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {patient.age} / {patient.gender}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="text-xs">{patient.phone}</span>
                            <span className="text-xs text-muted-foreground">{patient.email}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{patient.lastVisit}</td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className={
                              patient.status === "Active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
                            }
                          >
                            {patient.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{patient.condition}</td>
                        <td className="p-4 align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction("View", patient.id)}>
                                <FileText className="h-4 w-4 mr-2" /> View Records
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction("Schedule", patient.id)}>
                                <Calendar className="h-4 w-4 mr-2" /> Schedule Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction("Edit", patient.id)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction("Delete", patient.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Patient
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="h-24 text-center">
                        No patients found matching your search.
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
            Showing <strong>{filteredPatients.length}</strong> of <strong>{patients.length}</strong> patients
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
