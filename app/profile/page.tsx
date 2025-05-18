"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  FileText,
  Edit2,
  Camera,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock user data
  const user = {
    name: "Dr. Sarah Johnson",
    avatar: "/doctor-profile-avatar.png",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    specialization: "General Medicine",
    joinDate: "January 2020",
    licenseNumber: "RCMP-12345",
    hospital: "City General Hospital",
    bio: "Board-certified physician with over 10 years of experience in general medicine. Specializing in preventive care and chronic disease management.",
    education: [
      {
        degree: "Doctor of Medicine",
        institution: "Harvard Medical School",
        year: "2010",
      },
      {
        degree: "Bachelor of Science in Biology",
        institution: "Stanford University",
        year: "2006",
      },
    ],
    certifications: [
      {
        name: "Board Certification in Internal Medicine",
        issuer: "American Board of Internal Medicine",
        year: "2012",
      },
      {
        name: "Advanced Cardiac Life Support (ACLS)",
        issuer: "American Heart Association",
        year: "2021",
      },
    ],
    stats: {
      patientsServed: 1250,
      notesCreated: 3450,
      hoursLogged: 2800,
      accuracy: 98,
    },
    recentActivity: [
      {
        type: "note",
        title: "Medical Note Created",
        patient: "Ahmed bin Ali",
        time: "10 minutes ago",
      },
      {
        type: "appointment",
        title: "Appointment Completed",
        patient: "Maria Rodriguez",
        time: "1 hour ago",
      },
      {
        type: "patient",
        title: "New Patient Added",
        patient: "John Smith",
        time: "3 hours ago",
      },
    ],
    completionStatus: {
      profileCompletion: 85,
      verificationStatus: "Verified",
      missingItems: ["Upload additional certifications", "Complete specialty questionnaire"],
    },
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-md">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change avatar</span>
                  </Button>
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground mb-4">{user.specialization}</p>
                <Badge variant="outline" className="mb-6">
                  {user.completionStatus.verificationStatus}
                  <CheckCircle2 className="ml-1 h-3 w-3 text-green-500" />
                </Badge>

                <div className="w-full space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{user.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{user.joinDate}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm font-medium">{user.completionStatus.profileCompletion}%</span>
                  </div>
                  <Progress value={user.completionStatus.profileCompletion} className="h-2" />
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Missing items:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                      {user.completionStatus.missingItems.map((item, i) => (
                        <li key={i} className="text-amber-500 dark:text-amber-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-blue-500 hover:bg-blue-600">
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                  <CardDescription>Your professional background and expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-300">{user.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Professional Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">License Number</p>
                            <p className="font-medium">{user.licenseNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Primary Hospital</p>
                            <p className="font-medium">{user.hospital}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Patients Served</p>
                          <p className="text-xl font-bold text-blue-500">{user.stats.patientsServed}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Notes Created</p>
                          <p className="text-xl font-bold text-blue-500">{user.stats.notesCreated}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Hours Logged</p>
                          <p className="text-xl font-bold text-blue-500">{user.stats.hoursLogged}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                          <p className="text-xl font-bold text-blue-500">{user.stats.accuracy}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials">
              <Card>
                <CardHeader>
                  <CardTitle>Education & Certifications</CardTitle>
                  <CardDescription>Your academic background and professional certifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Education</h3>
                    <div className="space-y-4">
                      {user.education.map((edu, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">{edu.degree}</h4>
                            <p className="text-muted-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">Graduated {edu.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Certifications</h3>
                    <div className="space-y-4">
                      {user.certifications.map((cert, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-muted-foreground">{cert.issuer}</p>
                            <p className="text-sm text-muted-foreground">Issued {cert.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" /> Upload New Credential
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {user.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-start">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4 mt-0.5">
                          {activity.type === "note" && (
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                          {activity.type === "appointment" && (
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                          {activity.type === "patient" && <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Patient: {activity.patient} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-3">Security Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mr-4 mt-0.5">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">Successful login</p>
                          <p className="text-sm text-muted-foreground">New York, NY • Today, 9:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-4 mt-0.5">
                          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium">Password changed</p>
                          <p className="text-sm text-muted-foreground">New York, NY • 3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
