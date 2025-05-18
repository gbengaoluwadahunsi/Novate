"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileStack,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Eye,
  Share2,
  Trash2,
  Calendar,
  FileText,
  FileImage,
  FileIcon as FilePdf,
} from "lucide-react"
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

// Sample documents data
const documents = [
  {
    id: "DOC001",
    name: "Ahmed bin Ali - Medical History.pdf",
    type: "PDF",
    size: "2.4 MB",
    patientName: "Ahmed bin Ali",
    patientId: "P001",
    uploadDate: "17 May 2025",
    category: "Medical History",
    tags: ["Medical History", "Patient Records"],
  },
  {
    id: "DOC002",
    name: "Fatima Al Mansouri - Blood Test Results.jpg",
    type: "Image",
    size: "1.8 MB",
    patientName: "Fatima Al Mansouri",
    patientId: "P002",
    uploadDate: "12 May 2025",
    category: "Lab Results",
    tags: ["Lab Results", "Blood Test"],
  },
  {
    id: "DOC003",
    name: "Mohammed Al Hashimi - Diabetes Management Plan.docx",
    type: "Document",
    size: "0.5 MB",
    patientName: "Mohammed Al Hashimi",
    patientId: "P003",
    uploadDate: "5 May 2025",
    category: "Treatment Plan",
    tags: ["Diabetes", "Treatment Plan"],
  },
  {
    id: "DOC004",
    name: "Aisha Abdullah - Allergy Test Results.pdf",
    type: "PDF",
    size: "3.2 MB",
    patientName: "Aisha Abdullah",
    patientId: "P004",
    uploadDate: "30 April 2025",
    category: "Lab Results",
    tags: ["Allergies", "Test Results"],
  },
  {
    id: "DOC005",
    name: "Khalid Al Mazrouei - X-Ray Knee.jpg",
    type: "Image",
    size: "4.1 MB",
    patientName: "Khalid Al Mazrouei",
    patientId: "P005",
    uploadDate: "25 April 2025",
    category: "Imaging",
    tags: ["X-Ray", "Knee", "Osteoarthritis"],
  },
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { toast } = useToast()

  const filteredDocuments = documents.filter(
    (doc) =>
      (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (categoryFilter === "all" || doc.category === categoryFilter),
  )

  const handleUploadDocument = () => {
    toast({
      title: "Feature Not Available",
      description: "Uploading documents is not available in the demo version.",
    })
  }

  const handleDocumentAction = (action: string, documentId: string) => {
    const document = documents.find((d) => d.id === documentId)

    toast({
      title: `${action} Document`,
      description: `${action} document ${document?.name} - This is a demo action.`,
    })
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "Image":
        return <FileImage className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <FileStack className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground">Manage and organize patient documents</p>
          </div>
        </div>
      </motion.div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Document Library</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Medical History">Medical History</SelectItem>
                  <SelectItem value="Lab Results">Lab Results</SelectItem>
                  <SelectItem value="Treatment Plan">Treatment Plans</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={handleUploadDocument} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" /> Upload Document
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
                    <th className="h-12 px-4 text-left font-medium">Document</th>
                    <th className="h-12 px-4 text-left font-medium">Patient</th>
                    <th className="h-12 px-4 text-left font-medium">Category</th>
                    <th className="h-12 px-4 text-left font-medium">Upload Date</th>
                    <th className="h-12 px-4 text-left font-medium">Size</th>
                    <th className="h-12 px-4 text-left font-medium">Tags</th>
                    <th className="h-12 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            {getDocumentIcon(doc.type)}
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div>
                            <div>{doc.patientName}</div>
                            <div className="text-xs text-muted-foreground">ID: {doc.patientId}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{doc.category}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{doc.uploadDate}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{doc.size}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map((tag, index) => (
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
                              <DropdownMenuItem onClick={() => handleDocumentAction("View", doc.id)}>
                                <Eye className="h-4 w-4 mr-2" /> View Document
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDocumentAction("Download", doc.id)}>
                                <Download className="h-4 w-4 mr-2" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDocumentAction("Share", doc.id)}>
                                <Share2 className="h-4 w-4 mr-2" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDocumentAction("Delete", doc.id)}
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
                      <td colSpan={7} className="h-24 text-center">
                        No documents found matching your search.
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
            Showing <strong>{filteredDocuments.length}</strong> of <strong>{documents.length}</strong> documents
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
