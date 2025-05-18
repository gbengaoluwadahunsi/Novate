"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ScanIcon, Upload, FileText, Camera, Check, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArray])
      toast({
        title: "Files Added",
        description: `${filesArray.length} file(s) added for scanning.`,
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const startScanning = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to scan.",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setScanProgress(0)
    setScanComplete(false)

    // Simulate scanning process
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setScanComplete(true)
          toast({
            title: "Scanning Complete",
            description: `Successfully processed ${selectedFiles.length} document(s).`,
          })
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const resetScanner = () => {
    setSelectedFiles([])
    setScanProgress(0)
    setScanComplete(false)
  }

  const activateCamera = () => {
    toast({
      title: "Camera Activated",
      description: "This feature is not available in the demo version.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <ScanIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Document Scanner</h1>
            <p className="text-muted-foreground">Scan and digitize medical documents</p>
          </div>
        </div>
      </motion.div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>This is a demonstration. No actual scanning is being performed.</AlertDescription>
      </Alert>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Medical Document Scanner</CardTitle>
          <CardDescription>Upload or scan medical documents to digitize and process them</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="camera">Use Camera</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {!scanComplete ? (
                <>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        document.getElementById("file-upload")?.click()
                      }}
                    >
                      Select Files
                    </Button>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {isScanning ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Processing documents...</span>
                            <span>{Math.round(scanProgress)}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2" />
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={resetScanner}>
                            Clear All
                          </Button>
                          <Button onClick={startScanning} className="bg-blue-500 hover:bg-blue-600">
                            Start Scanning
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Scanning Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    All {selectedFiles.length} document(s) have been successfully processed
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Processing complete</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="mt-6">
                    <Button onClick={resetScanner} className="bg-blue-500 hover:bg-blue-600">
                      Scan New Documents
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="camera" className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Use Camera</h3>
                <p className="text-sm text-muted-foreground mb-4">Position your document in front of the camera</p>
                <Button onClick={activateCamera} className="bg-blue-500 hover:bg-blue-600">
                  Activate Camera
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>Supported formats: JPG, PNG, PDF (up to 10MB per file)</p>
        </CardFooter>
      </Card>
    </div>
  )
}
