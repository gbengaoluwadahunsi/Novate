"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Star,
  Award,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ICD11CodeSuggestionsProps {
  medicalNote: {
    icd11CodesList?: string[];
    icd11TitlesList?: string[];
    icd11SourceSentence?: string;
    // Legacy support for old format
    icd11Codes?: any;
  };
  onCodeSelect?: (code: string, title: string, index: number) => void;
  className?: string;
}

export default function ICD11CodeSuggestions({ 
  medicalNote, 
  onCodeSelect, 
  className = "" 
}: ICD11CodeSuggestionsProps) {
  const { toast } = useToast();
  const [selectedCode, setSelectedCode] = useState<number | null>(null);

  // Extract codes and titles from the new format
  const codes = medicalNote.icd11CodesList || [];
  const titles = medicalNote.icd11TitlesList || [];
  const sourceSentence = medicalNote.icd11SourceSentence || '';

  const handleCodeSelect = (code: string, title: string, index: number) => {
    setSelectedCode(index);
    
    if (onCodeSelect) {
      onCodeSelect(code, title, index);
    }
    
    toast({
      title: "ICD-11 Code Selected",
      description: `Selected: ${code} - ${title}`,
    });
  };

  const copyCodeToClipboard = (code: string, title: string) => {
    const textToCopy = `${code} - ${title}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${code} - ${title}`,
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    });
  };

  const openICD11Reference = (code: string) => {
    // Open WHO ICD-11 reference in new tab
    const url = `https://icd.who.int/browse11/l-m/en#/http://id.who.int/icd/entity/${code}`;
    window.open(url, '_blank');
  };

  const getCodeIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Star className="h-4 w-4" />;
      case 1:
        return <Award className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCodeBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <Star className="h-3 w-3 mr-1" />
            Primary
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Award className="h-3 w-3 mr-1" />
            Secondary
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Lightbulb className="h-3 w-3 mr-1" />
            Suggestion {index + 1}
          </Badge>
        );
    }
  };

  // If no codes available, show empty state
  if (!codes || codes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>ICD-11 Codes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No ICD-11 codes suggested</p>
              <p className="text-xs mt-1">
                Complete the diagnosis section to get code suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>ICD-11 Code Suggestions</span>
          <Badge variant="outline">{codes.length} codes</Badge>
        </CardTitle>
        {sourceSentence && (
          <div className="text-sm text-muted-foreground italic">
            <strong>Based on:</strong> "{sourceSentence}"
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Code Suggestions */}
        <div className="space-y-3">
          {codes.map((code, index) => {
            const title = titles[index] || 'Unknown condition';
            const isSelected = selectedCode === index;
            
            return (
              <div
                key={index}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }
                  ${index === 0 ? 'border-l-4 border-l-green-500' : ''}
                  ${index === 1 ? 'border-l-4 border-l-blue-500' : ''}
                  ${index > 1 ? 'border-l-4 border-l-yellow-500' : ''}
                `}
                onClick={() => handleCodeSelect(code, title, index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCodeIcon(index)}
                      <span className="font-bold text-lg">{code}</span>
                      {getCodeBadge(index)}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">
                      {title}
                    </h4>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCodeSelect(code, title, index);
                        }}
                        className={isSelected ? 'bg-blue-100 border-blue-300' : ''}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Select This Code'
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCodeToClipboard(code, title);
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openICD11Reference(code);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Reference
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Code Summary */}
        {selectedCode !== null && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Selected Code:</h5>
            <div className="text-blue-800">
              <p className="font-mono font-bold">{codes[selectedCode]}</p>
              <p className="text-sm">{titles[selectedCode]}</p>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">How to Use:</h5>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Primary:</strong> Most likely diagnosis based on symptoms</li>
            <li>• <strong>Secondary:</strong> Alternative diagnosis to consider</li>
            <li>• <strong>Suggestions:</strong> Additional codes that may be relevant</li>
            <li>• Click "Reference" to view detailed WHO ICD-11 information</li>
            <li>• Use "Copy" to copy the code and title to clipboard</li>
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Medical Disclaimer:</strong> These are AI-generated suggestions based on the medical note content. 
            Always verify codes against official ICD-11 documentation and use clinical judgment for final diagnosis coding.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
