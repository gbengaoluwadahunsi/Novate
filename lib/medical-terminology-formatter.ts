/**
 * Medical Terminology Formatter
 * 
 * Provides consistent formatting for medical note fields,
 * ensuring all empty/missing values display as "Not mentioned"
 * as per the backend API standardization.
 */

export interface MedicalFieldFormatOptions {
  showBulletPoints?: boolean;
  maxLength?: number;
  showEmptyMessage?: boolean;
}

/**
 * Format a medical field value with consistent "Not mentioned" terminology
 */
export function formatMedicalField(
  fieldValue: string | null | undefined, 
  options: MedicalFieldFormatOptions = {}
): {
  formatted: string;
  isEmpty: boolean;
  isBulletPoints: boolean;
} {
  const { 
    showBulletPoints = false, 
    maxLength,
    showEmptyMessage = true 
  } = options;

  // Handle null, undefined, or empty values
  if (!fieldValue || 
      fieldValue.trim() === '' || 
      fieldValue.toLowerCase() === 'not mentioned' ||
      fieldValue.toLowerCase() === 'not recorded' ||
      fieldValue.toLowerCase() === 'n/a' ||
      fieldValue.toLowerCase() === 'none') {
    return {
      formatted: showEmptyMessage ? 'Not mentioned' : '',
      isEmpty: true,
      isBulletPoints: false
    };
  }

  let formatted = fieldValue.trim();

  // Apply length limit if specified
  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength) + '...';
  }

  // Check if content should be formatted as bullet points
  const shouldUseBulletPoints = showBulletPoints && shouldFormatAsBulletPoints(formatted);

  if (shouldUseBulletPoints) {
    formatted = formatAsBulletPoints(formatted);
  }

  return {
    formatted,
    isEmpty: false,
    isBulletPoints: shouldUseBulletPoints
  };
}

/**
 * Determine if content should be formatted as bullet points
 */
function shouldFormatAsBulletPoints(text: string): boolean {
  // Check for multiple sentences or semicolon-separated items
  const sentences = text.split(/[.!?;]+/).filter(s => s.trim().length > 0);
  return sentences.length > 1;
}

/**
 * Format text as bullet points
 */
function formatAsBulletPoints(text: string): string {
  // Split by sentences and semicolons
  const items = text.split(/[.!?;]+/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  if (items.length <= 1) {
    return text;
  }

  return items.map(item => `• ${item}`).join('\n');
}

/**
 * Format medication text with proper structure
 */
export function formatMedications(medicationText: string | null | undefined): {
  formatted: string;
  isEmpty: boolean;
  medications: Array<{
    name: string;
    details: string[];
  }>;
} {
  const result = formatMedicalField(medicationText);
  
  if (result.isEmpty) {
    return {
      formatted: result.formatted,
      isEmpty: true,
      medications: []
    };
  }

  // Parse medication format: "Paracetamol (Panadol) continued; dose Not mentioned; frequency Not mentioned; duration Not mentioned"
  const medicationEntries = result.formatted.split(/[;,]/).map(med => med.trim());
  const medications: Array<{ name: string; details: string[] }> = [];

  medicationEntries.forEach(entry => {
    const parts = entry.split(/[;:]/).map(part => part.trim());
    if (parts.length > 0) {
      medications.push({
        name: parts[0],
        details: parts.slice(1).filter(detail => detail.length > 0)
      });
    }
  });

  return {
    formatted: result.formatted,
    isEmpty: false,
    medications
  };
}

/**
 * Format vital signs with consistent terminology
 */
export function formatVitalSigns(vitalSigns: {
  temperature?: string;
  pulseRate?: string;
  bloodPressure?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  glucose?: string;
}): Record<string, { formatted: string; isEmpty: boolean }> {
  const formatted: Record<string, { formatted: string; isEmpty: boolean }> = {};

  Object.entries(vitalSigns).forEach(([key, value]) => {
    formatted[key] = formatMedicalField(value);
  });

  return formatted;
}

/**
 * Format examination findings with bullet points
 */
export function formatExaminationFindings(
  examination: string | null | undefined
): {
  formatted: string;
  isEmpty: boolean;
  sections: Array<{
    title: string;
    findings: string[];
  }>;
} {
  const result = formatMedicalField(examination, { showBulletPoints: true });
  
  if (result.isEmpty) {
    return {
      formatted: result.formatted,
      isEmpty: true,
      sections: []
    };
  }

  // Try to parse structured examination data
  const sections: Array<{ title: string; findings: string[] }> = [];
  
  // Look for section headers (e.g., "General:", "Cardiovascular:", etc.)
  const sectionMatches = result.formatted.match(/([A-Z][a-z]+\s*[A-Z]*[a-z]*):([^:]+?)(?=[A-Z][a-z]+\s*[A-Z]*[a-z]*:|$)/g);
  
  if (sectionMatches && sectionMatches.length > 0) {
    sectionMatches.forEach(match => {
      const [title, ...findings] = match.split(':');
      sections.push({
        title: title.trim(),
        findings: findings.join(':').split(/[.;]/).map(f => f.trim()).filter(f => f.length > 0)
      });
    });
  }

  return {
    formatted: result.formatted,
    isEmpty: false,
    sections
  };
}

/**
 * Standardize all legacy terminology to "Not mentioned"
 */
export function standardizeTerminology(text: string | null | undefined): string {
  if (!text) return 'Not mentioned';
  
  const standardized = text
    .replace(/not recorded/gi, 'Not mentioned')
    .replace(/not available/gi, 'Not mentioned')
    .replace(/n\/a/gi, 'Not mentioned')
    .replace(/none reported/gi, 'Not mentioned')
    .replace(/nil/gi, 'Not mentioned')
    .replace(/^-$/g, 'Not mentioned')
    .replace(/^none$/gi, 'Not mentioned');
    
  return standardized.trim() || 'Not mentioned';
}

/**
 * React component helper for consistent medical field display
 */
export function getMedicalFieldProps(
  fieldValue: string | null | undefined,
  options: MedicalFieldFormatOptions = {}
) {
  const result = formatMedicalField(fieldValue, options);
  
  return {
    text: result.formatted,
    isEmpty: result.isEmpty,
    className: result.isEmpty ? 'text-muted-foreground italic' : 'text-foreground',
    'data-empty': result.isEmpty,
    'data-bullet-points': result.isBulletPoints
  };
}
