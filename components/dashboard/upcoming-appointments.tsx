"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

type Appointment = {
  patient: string
  time: string
  type: string
  progress: number
}

export function UpcomingAppointments() {
  const appointments: Appointment[] = [
    {
      patient: "Ahmed bin Ali",
      time: "Today, 2:00 PM",
      type: "Follow-up",
      progress: 100,
    },
    {
      patient: "Maria Rodriguez",
      time: "Today, 3:30 PM",
      type: "Consultation",
      progress: 100,
    },
    {
      patient: "John Smith",
      time: "Tomorrow, 10:00 AM",
      type: "Check-up",
      progress: 70,
    },
    {
      patient: "Sarah Johnson",
      time: "Tomorrow, 11:30 AM",
      type: "Review",
      progress: 40,
    },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-sky-500" />
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <p className="text-sm text-muted-foreground">Your schedule for the next 48 hours</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium">{appointment.patient}</p>
                <span className="text-sm text-muted-foreground">{appointment.time}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">{appointment.type}</span>
                <span className="text-xs font-medium">{appointment.progress === 100 ? "Ready" : "Preparation"}</span>
              </div>
              <Progress
                value={appointment.progress}
                className="h-1.5"
                indicatorClassName={appointment.progress === 100 ? "bg-teal-600" : "bg-amber-500"}
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full text-sky-500 hover:text-sky-600 hover:bg-sky-50" asChild>
          <Link href="/dashboard/appointments">
            View All Appointments <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
