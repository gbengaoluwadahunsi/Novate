"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, MoreHorizontal, User, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Sample appointment data
const appointments = [
  {
    id: "A001",
    patientName: "Ahmed bin Ali",
    patientId: "P001",
    date: "17 May 2025",
    time: "09:30 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "Confirmed",
    doctor: "Dr. Sarah Johnson",
    location: "Main Clinic, Room 3",
    notes: "Follow-up for sore throat treatment",
  },
  {
    id: "A002",
    patientName: "Fatima Al Mansouri",
    patientId: "P002",
    date: "17 May 2025",
    time: "10:15 AM",
    duration: "45 min",
    type: "Check-up",
    status: "Confirmed",
    doctor: "Dr. Sarah Johnson",
    location: "Main Clinic, Room 3",
    notes: "Regular blood pressure check",
  },
  {
    id: "A003",
    patientName: "Mohammed Al Hashimi",
    patientId: "P003",
    date: "17 May 2025",
    time: "11:30 AM",
    duration: "30 min",
    type: "Consultation",
    status: "Pending",
    doctor: "Dr. Sarah Johnson",
    location: "Main Clinic, Room 3",
    notes: "Diabetes management review",
  },
  {
    id: "A004",
    patientName: "Aisha Abdullah",
    patientId: "P004",
    date: "18 May 2025",
    time: "09:00 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "Confirmed",
    doctor: "Dr. Sarah Johnson",
    location: "Main Clinic, Room 3",
    notes: "Allergy treatment follow-up",
  },
  {
    id: "A005",
    patientName: "Khalid Al Mazrouei",
    patientId: "P005",
    date: "18 May 2025",
    time: "10:00 AM",
    duration: "45 min",
    type: "Treatment",
    status: "Confirmed",
    doctor: "Dr. Sarah Johnson",
    location: "Main Clinic, Room 3",
    notes: "Joint pain management",
  },
]

// Time slots for the calendar view
const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
]

export default function AppointmentsPage() {
  const [view, setView] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState("17 May 2025")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  const filteredAppointments = appointments.filter(
    (appointment) =>
      (filterStatus === "all" || appointment.status.toLowerCase() === filterStatus.toLowerCase()) &&
      (view === "calendar" ? appointment.date === selectedDate : true),
  )

  const handleAddAppointment = () => {
    toast({
      title: "Feature Not Available",
      description: "Adding new appointments is not available in the demo version.",
    })
  }

  const handleDateChange = (direction: "prev" | "next") => {
    // Simple date navigation for demo purposes
    if (selectedDate === "17 May 2025" && direction === "next") {
      setSelectedDate("18 May 2025")
    } else if (selectedDate === "18 May 2025" && direction === "prev") {
      setSelectedDate("17 May 2025")
    }
  }

  const handleAppointmentAction = (action: string, appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId)

    toast({
      title: `${action} Appointment`,
      description: `${action} appointment for ${appointment?.patientName} on ${appointment?.date} at ${appointment?.time}`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your patient appointments</p>
          </div>
        </div>
      </motion.div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Appointment Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  className={`rounded-none ${view === "list" ? "bg-muted" : ""}`}
                  onClick={() => setView("list")}
                >
                  List
                </Button>
                <Button
                  variant="ghost"
                  className={`rounded-none ${view === "calendar" ? "bg-muted" : ""}`}
                  onClick={() => setView("calendar")}
                >
                  Calendar
                </Button>
              </div>
              <Button onClick={handleAddAppointment} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" /> New Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "list" ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left font-medium">Patient</th>
                      <th className="h-12 px-4 text-left font-medium">Date & Time</th>
                      <th className="h-12 px-4 text-left font-medium">Type</th>
                      <th className="h-12 px-4 text-left font-medium">Status</th>
                      <th className="h-12 px-4 text-left font-medium">Doctor</th>
                      <th className="h-12 px-4 text-left font-medium">Location</th>
                      <th className="h-12 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {appointment.patientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{appointment.patientName}</div>
                                <div className="text-xs text-muted-foreground">ID: {appointment.patientId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{appointment.time}</span>
                                <span className="text-xs text-muted-foreground ml-1">({appointment.duration})</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{appointment.type}</td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant="outline"
                              className={
                                appointment.status === "Confirmed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                  : appointment.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                                    : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">{appointment.doctor}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>{appointment.location}</span>
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
                                <DropdownMenuItem onClick={() => handleAppointmentAction("View", appointment.id)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAppointmentAction("Edit", appointment.id)}>
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAppointmentAction("Reschedule", appointment.id)}>
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleAppointmentAction("Cancel", appointment.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="h-24 text-center">
                          No appointments found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => handleDateChange("prev")}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous Day
                </Button>
                <h3 className="text-lg font-medium">{selectedDate}</h3>
                <Button variant="outline" size="sm" onClick={() => handleDateChange("next")}>
                  Next Day <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-[100px_1fr] h-[600px]">
                  {/* Time slots column */}
                  <div className="border-r">
                    <div className="h-12 border-b bg-muted/50 flex items-center justify-center font-medium">Time</div>
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className={`h-12 flex items-center justify-center text-sm text-muted-foreground ${
                          index < timeSlots.length - 1 ? "border-b" : ""
                        }`}
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Appointments column */}
                  <div className="relative">
                    <div className="h-12 border-b bg-muted/50 flex items-center px-4 font-medium">Appointments</div>
                    {timeSlots.map((time, index) => (
                      <div key={time} className={`h-12 px-4 ${index < timeSlots.length - 1 ? "border-b" : ""}`}>
                        {filteredAppointments
                          .filter((a) => a.time === time)
                          .map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`h-10 rounded-md px-3 py-1 flex items-center text-sm ${
                                appointment.status === "Confirmed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : appointment.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              <User className="h-3.5 w-3.5 mr-2" />
                              <span className="font-medium mr-2">{appointment.patientName}</span>
                              <span className="text-xs">({appointment.type})</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-auto"
                                onClick={() => handleAppointmentAction("View", appointment.id)}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredAppointments.length}</strong> appointments
          </div>
          {view === "list" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
