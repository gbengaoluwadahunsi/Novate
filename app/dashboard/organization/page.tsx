"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Users,
  Settings,
  PlusCircle,
  Filter,
  Search,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function OrganizationDashboardPage() {
  const [activeTab, setActiveTab] = useState("members")
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteEmails, setInviteEmails] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const { toast } = useToast()

  // Mock organization data
  const organization = {
    id: "org_1",
    name: "City Medical Center",
    plan: "Enterprise",
    seatsTotal: 150,
    seatsUsed: 120,
    billingCycle: "Annual",
    nextBillingDate: "2023-12-31",
    admins: ["Dr. Sarah Johnson", "Dr. Robert Williams"],
    departments: ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine"],
    createdAt: "2023-01-15",
  }

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd fetch from your API
      // const response = await fetch(`/api/organizations/${organization.id}/members`)
      // const data = await response.json()
      // setMembers(data.members)

      // Mock data for demonstration
      setMembers([
        {
          id: "user_1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@example.com",
          role: "admin",
          department: "Cardiology",
          status: "active",
          lastActive: "2023-05-01T14:30:00Z",
        },
        {
          id: "user_2",
          name: "Dr. Michael Chen",
          email: "michael.chen@example.com",
          role: "member",
          department: "Neurology",
          status: "active",
          lastActive: "2023-05-02T09:15:00Z",
        },
        {
          id: "user_3",
          name: "Dr. Emily Rodriguez",
          email: "emily.rodriguez@example.com",
          role: "member",
          department: "Pediatrics",
          status: "active",
          lastActive: "2023-05-01T16:45:00Z",
        },
        {
          id: "user_4",
          name: "Dr. James Wilson",
          email: "james.wilson@example.com",
          role: "member",
          department: "Orthopedics",
          status: "pending",
          lastActive: null,
        },
        {
          id: "user_5",
          name: "Dr. Linda Kim",
          email: "linda.kim@example.com",
          role: "member",
          department: "General Medicine",
          status: "active",
          lastActive: "2023-05-01T11:20:00Z",
        },
      ])
    } catch (error) {
      console.error("Failed to fetch members:", error)
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMembers = async () => {
    setIsInviting(true)
    try {
      const emails = inviteEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email)

      if (emails.length === 0) {
        throw new Error("Please enter at least one valid email address")
      }

      // In a real app, you'd send to your API
      // await fetch(`/api/organizations/${organization.id}/members`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ emails })
      // })

      toast({
        title: "Invitations Sent",
        description: `Invitations sent to ${emails.length} doctor${emails.length > 1 ? "s" : ""}`,
      })

      setInviteEmails("")
      setInviteDialogOpen(false)

      // Refresh member list
      fetchMembers()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      // In a real app, you'd send to your API
      // await fetch(`/api/organizations/${organization.id}/members?userId=${userId}`, {
      //   method: 'DELETE'
      // })

      // Optimistically update UI
      setMembers(members.filter((member) => member.id !== userId))

      toast({
        title: "Member Removed",
        description: "The member has been removed from your organization",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    fetchMembers()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today, " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      return "Yesterday, " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else {
      return formatDate(dateString)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Organization Management</h1>
            <p className="text-muted-foreground">Manage your healthcare organization's access and settings</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Organization Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Organization Overview</CardTitle>
            <CardDescription>Basic information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">{organization.name}</h3>
              <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">{organization.plan}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Licensed Seats</span>
                <span className="font-medium">{organization.seatsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats Used</span>
                <span className="font-medium">{organization.seatsUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats Available</span>
                <span className="font-medium">{organization.seatsTotal - organization.seatsUsed}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>

        {/* Billing Information Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Current subscription and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{organization.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium">{organization.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Billing Date</span>
                <span className="font-medium">{formatDate(organization.nextBillingDate)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Billing History
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <PlusCircle className="mr-2 h-4 w-4" /> Invite Doctors
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Doctors</DialogTitle>
                  <DialogDescription>
                    Add doctors to your organization. They will receive an email invitation to join.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="emails">Email Addresses</Label>
                    <Textarea
                      id="emails"
                      placeholder="Enter email addresses separated by commas"
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      You can enter multiple email addresses separated by commas.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteMembers}
                    disabled={isInviting || !inviteEmails.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isInviting ? "Sending Invites..." : "Send Invites"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" /> Manage Departments
            </Button>
            <Button className="w-full" variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Organization Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Organization Members</CardTitle>
                  <CardDescription>Manage doctors and staff in your organization</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search members..."
                      className="pl-8 w-full md:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button size="icon" variant="outline">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="hidden md:flex bg-blue-500 hover:bg-blue-600">
                        <PlusCircle className="mr-2 h-4 w-4" /> Invite
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Doctor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Department
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Last Active
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                                <div className="ml-4">
                                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                                  <div className="h-3 w-24 mt-1 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                    ) : filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">No members found matching your search criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{member.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{member.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                member.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                              }
                            >
                              {member.status === "active" ? (
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {member.status === "active" ? "Active" : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(member.lastActive)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={member.role === "admin" ? "default" : "outline"}>
                              {member.role === "admin" ? "Admin" : "Member"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => window.alert("View details")}>
                                  View details
                                </DropdownMenuItem>
                                {member.role !== "admin" ? (
                                  <DropdownMenuItem onClick={() => window.alert("Make admin")}>
                                    Make admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => window.alert("Remove admin")}>
                                    Remove admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  Remove from organization
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredMembers.length} of {members.length} members
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
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Manage medical departments in your organization</CardDescription>
                </div>
                <Button className="md:w-auto w-full bg-blue-500 hover:bg-blue-600">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Department
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organization.departments.map((department, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{department}</h3>
                      <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 20) + 5} members</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit department</DropdownMenuItem>
                          <DropdownMenuItem>View members</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            Delete department
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Departments
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Organization Activity</CardTitle>
              <CardDescription>Recent activity in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Activity log entries - these would come from a real API */}
                <div className="relative pl-8 before:absolute before:left-3 before:top-1 before:h-full before:w-px before:bg-gray-200 dark:before:bg-gray-800">
                  <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    <Users className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">New user added</p>
                    <p className="text-sm text-muted-foreground">Dr. James Wilson was added to the organization</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="relative pl-8 before:absolute before:left-3 before:top-1 before:h-full before:w-px before:bg-gray-200 dark:before:bg-gray-800">
                  <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                    <Mail className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Invitations sent</p>
                    <p className="text-sm text-muted-foreground">5 new doctors were invited to join the organization</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 4:30 PM</p>
                  </div>
                </div>

                <div className="relative pl-8 before:absolute before:left-3 before:top-1 before:h-full before:w-px before:bg-gray-200 dark:before:bg-gray-800">
                  <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                    <Settings className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Subscription updated</p>
                    <p className="text-sm text-muted-foreground">
                      Organization subscription was upgraded to Enterprise plan
                    </p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                    <Building2 className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">New department created</p>
                    <p className="text-sm text-muted-foreground">Orthopedics department was created</p>
                    <p className="text-xs text-muted-foreground">5 days ago</p>
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
    </div>
  )
}
