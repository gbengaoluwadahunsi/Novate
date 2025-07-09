"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, FileText, CheckCircle } from "lucide-react"

interface DoctorStampProps {
  doctorName?: string
  licenseNumber?: string
  specialization?: string
  onStamp?: (stampData: any) => void
}

export default function DoctorStamp({
  doctorName = "Dr. Sarah Johnson",
  licenseNumber = "MD123456",
  specialization = "Internal Medicine",
  onStamp,
}: DoctorStampProps) {
  const [stampData, setStampData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    notes: "",
    type: "reviewed",
  })

  const handleStamp = () => {
    const finalStampData = {
      ...stampData,
      doctorName,
      licenseNumber,
      specialization,
      timestamp: new Date().toISOString(),
    }
    
    if (onStamp) {
      onStamp(finalStampData)
    }
    
    // Reset form
    setStampData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      notes: "",
      type: "reviewed",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Medical Note Stamp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Doctor Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{doctorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {licenseNumber}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {specialization}
            </Badge>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={stampData.date}
              onChange={(e) => setStampData({ ...stampData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={stampData.time}
              onChange={(e) => setStampData({ ...stampData, time: e.target.value })}
            />
          </div>
        </div>

        {/* Stamp Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Stamp Type</Label>
          <Select value={stampData.type} onValueChange={(value) => setStampData({ ...stampData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Input
            id="notes"
            placeholder="Optional notes..."
            value={stampData.notes}
            onChange={(e) => setStampData({ ...stampData, notes: e.target.value })}
          />
        </div>

        {/* Stamp Button */}
        <Button onClick={handleStamp} className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          Apply Stamp
        </Button>

        {/* Preview */}
        <div className="mt-4 p-3 border rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground mb-2">Stamp Preview:</div>
          <div className="text-sm">
            <div className="font-medium">{doctorName}</div>
            <div className="text-muted-foreground">
              {stampData.type.charAt(0).toUpperCase() + stampData.type.slice(1)} on {stampData.date} at {stampData.time}
            </div>
            {stampData.notes && <div className="text-muted-foreground mt-1">"{stampData.notes}"</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 