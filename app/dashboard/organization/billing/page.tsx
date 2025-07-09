"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, Download, CheckCircle2, Plus, Building2, Users, BarChart3, Mic, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export default function OrganizationBillingPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // Mock subscription data
  const subscription = {
    plan: "Enterprise",
    status: "active",
    billingCycle: "Annual",
    price: "$1,999",
    nextBillingDate: "2023-12-31",
    seatsTotal: 150,
    seatsUsed: 120,
    features: [
      "Unlimited transcriptions",
      "All AI Agents included",
      "Priority support",
      "Enterprise-grade security",
      "Custom templates",
      "Advanced analytics",
      "HIPAA compliance",
      "API access",
    ],
  }

  // Mock payment method
  const paymentMethod = {
    type: "credit_card",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2024,
  }

  // Mock invoice history
  const invoices = [
    {
      id: "INV-001",
      date: "2023-01-15",
      amount: "$1,999.00",
      status: "paid",
    },
    {
      id: "INV-002",
      date: "2022-01-15",
      amount: "$1,799.00",
      status: "paid",
    },
    {
      id: "INV-003",
      date: "2021-01-15",
      amount: "$1,799.00",
      status: "paid",
    },
  ]

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${invoiceId} has been downloaded.`,
    })
  }

  const handleChangePlan = () => {
    toast({
      title: "Contact Sales",
      description: "Our sales team will contact you shortly to discuss plan options.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your organization's subscription and billing details</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your organization's subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan}</h3>
                    <div className="flex items-center mt-1">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                      <span className="text-sm text-muted-foreground ml-2">
                        Billed {subscription.billingCycle.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{subscription.price}</p>
                    <p className="text-sm text-muted-foreground">per year</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">License usage</span>
                      <span className="text-sm font-medium">
                        {subscription.seatsUsed} of {subscription.seatsTotal} seats
                      </span>
                    </div>
                    <Progress value={(subscription.seatsUsed / subscription.seatsTotal) * 100} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Next billing date: {formatDate(subscription.nextBillingDate)}</span>
                    <span>{subscription.seatsTotal - subscription.seatsUsed} seats available</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Plan includes:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleChangePlan} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600">
                  Change Plan
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add Seats
                </Button>
              </CardFooter>
            </Card>

            {/* Usage Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Current billing cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span>Departments</span>
                    </div>
                    <span className="font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                        <Users className="h-4 w-4" />
                      </div>
                      <span>Active Users</span>
                    </div>
                    <span className="font-bold">120 / 150</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                        <Mic className="h-4 w-4" />
                      </div>
                      <span>Transcriptions</span>
                    </div>
                    <span className="font-bold">978</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                        <Bot className="h-4 w-4" />
                      </div>
                      <span>AI Generations</span>
                    </div>
                    <span className="font-bold">2,145</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly growth</span>
                    <div className="flex items-center text-green-500">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      <span>+24%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your organization's payment methods</CardDescription>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {paymentMethod.brand} •••• {paymentMethod.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                      </div>
                      <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Default
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-dashed rounded-lg flex items-center justify-center h-24 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex flex-col items-center">
                    <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-sm font-medium">Add New Payment Method</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
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
                        Invoice
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">No invoices found.</p>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{invoice.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{formatDate(invoice.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{invoice.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Request Custom Invoice
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
