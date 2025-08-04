"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Clock, 
  User, 
  FileText, 
  Eye, 
  Download,
  ChevronRight,
  MessageSquare
} from 'lucide-react'

interface NoteVersion {
  version: number
  timestamp: string
  changes: string
  author: string
  changeType: 'ai_transcription' | 'user_edit' | 'doctor_review' | 'system_update'
  summary?: string
}

interface NoteVersionHistoryProps {
  isOpen: boolean
  onClose: () => void
  versions: NoteVersion[]
  currentVersion: number
  onViewVersion: (version: number) => void
  onRestoreVersion: (version: number) => void
}

export default function NoteVersionHistory({
  isOpen,
  onClose,
  versions,
  currentVersion,
  onViewVersion,
  onRestoreVersion
}: NoteVersionHistoryProps) {
  
  const getChangeTypeColor = (type: NoteVersion['changeType']) => {
    switch (type) {
      case 'ai_transcription':
        return 'bg-blue-100 text-blue-800'
      case 'user_edit':
        return 'bg-green-100 text-green-800'
      case 'doctor_review':
        return 'bg-purple-100 text-purple-800'
      case 'system_update':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeTypeLabel = (type: NoteVersion['changeType']) => {
    switch (type) {
      case 'ai_transcription':
        return 'AI Transcription'
      case 'user_edit':
        return 'User Edit'
      case 'doctor_review':
        return 'Doctor Review'
      case 'system_update':
        return 'System Update'
      default:
        return 'Unknown'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Note Version History
            <Badge variant="outline" className="ml-2">
              {versions.length} versions
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[60vh]">
          {/* Version List */}
          <div className="lg:col-span-1">
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-4">
                {versions.map((version) => (
                  <Card
                    key={version.version}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      version.version === currentVersion
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onViewVersion(version.version)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getChangeTypeColor(version.changeType)}`}
                          >
                            v{version.version}
                          </Badge>
                          {version.version === currentVersion && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(version.timestamp)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="h-3 w-3" />
                          {version.author}
                        </div>
                        
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getChangeTypeColor(version.changeType)}`}
                        >
                          {getChangeTypeLabel(version.changeType)}
                        </Badge>
                        
                        <div className="text-xs text-gray-700 line-clamp-2">
                          {version.summary || version.changes}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Version Details */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Version Details</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100%-80px)]">
                  {versions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Show details for the selected version (for now, just the first one) */}
                      {versions.map((version) => 
                        version.version === currentVersion ? (
                          <div key={version.version} className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="font-medium">Version {version.version}</div>
                                  <div className="text-sm text-gray-600">
                                    {formatTimestamp(version.timestamp)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-auto">
                                <Badge className={getChangeTypeColor(version.changeType)}>
                                  {getChangeTypeLabel(version.changeType)}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Changes Made
                                </h4>
                                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                  {version.changes}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Author Information
                                </h4>
                                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                  Modified by: <strong>{version.author}</strong>
                                </div>
                              </div>

                              {version.summary && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                                  <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                    {version.summary}
                                  </div>
                                </div>
                              )}
                            </div>

                            {version.version !== currentVersion && (
                              <div className="pt-4 border-t">
                                <Button
                                  onClick={() => onRestoreVersion(version.version)}
                                  className="w-full"
                                >
                                  Restore This Version
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No version selected</p>
                      <p className="text-xs">Click on a version to view details</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}