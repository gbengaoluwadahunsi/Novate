"use client"

import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface ICD11Code {
  code: string;
  title: string;
}

interface ICD11CodesDisplayProps {
  medicalNote: {
    icd11Codes?: string[];
    icd11Titles?: string[];
    icd11SourceSentence?: string;
  };
  onCodeSelect?: (code: string, title: string, index: number) => void;
  className?: string;
}

export default function ICD11CodesDisplay({
  medicalNote,
  onCodeSelect,
  className = ""
}: ICD11CodesDisplayProps) {
  const { toast } = useToast();
  const [codes, setCodes] = useState<ICD11Code[]>([]);
  const [primaryCodeIndex, setPrimaryCodeIndex] = useState<number>(0);

  useEffect(() => {
    // Handle different data formats
    let codes: ICD11Code[] = [];
    
    if (medicalNote.icd11Codes && Array.isArray(medicalNote.icd11Codes)) {
      codes = medicalNote.icd11Codes.map((code, index) => ({
        code,
        title: (medicalNote.icd11Titles || [])[index] || 'Unknown condition',
      }));
    }
    
    // Ensure we show all available codes up to 4
    const initialCodes = codes.slice(0, 4);
    
    setCodes(initialCodes);
    if (initialCodes.length > 0) {
      setPrimaryCodeIndex(0);
    }
  }, [medicalNote.icd11Codes, medicalNote.icd11Titles]);

  const handlePrimaryCodeChange = (index: number) => {
    if (primaryCodeIndex === index) return;
    
    const selectedCode = codes[index];
    if (onCodeSelect) {
      onCodeSelect(selectedCode.code, selectedCode.title, index);
    }
  };

  if (!codes || codes.length === 0) {
    return <p className="text-gray-500 text-sm">No ICD-11 codes assigned</p>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {codes.map(({ code, title }, index) => (
        <div key={`${code}-${index}`} className="flex items-center space-x-3">
          <Checkbox
            id={`code-${index}`}
            checked={index === primaryCodeIndex}
            onCheckedChange={() => handlePrimaryCodeChange(index)}
            aria-label={`Set ${code} as primary`}
          />
          <label htmlFor={`code-${index}`} className="flex-1 cursor-pointer text-sm">
            <span className="font-medium">{code}</span> - <span>{title}</span>
            {medicalNote.icd11SourceSentence && (
              <p className="text-xs text-gray-500 ml-1">{medicalNote.icd11SourceSentence}</p>
            )}
          </label>
        </div>
      ))}
    </div>
  );
}
