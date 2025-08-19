
import { apiClient } from '@/lib/api-client';

export interface DuplicateDetectionResult {
  totalNotes: number;
  duplicatesFound: number;
  uniqueNotes: number;
  duplicateGroups: Array<{
    patientName: string;
    count: number;
    noteIds: string[];
    createdWithin: string;
  }>;
}

export interface DatabaseCleanupOptions {
  dryRun?: boolean;
  maxAgeMinutes?: number;
  includePendingTranscriptions?: boolean;
}

/**
 * Advanced duplicate detection with multiple criteria
 */
export async function detectDuplicateNotes(): Promise<DuplicateDetectionResult> {
  try {
    // Starting comprehensive duplicate detection
    
    // Fetch all notes for analysis
    const response = await apiClient.getMedicalNotes({ page: 1, limit: 10000 });
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch notes for duplicate detection');
    }

    const allNotes = response.data.notes;
    // Analyzing notes for duplicates

    // Group potentially duplicate notes
    const duplicateGroups: { [key: string]: any[] } = {};
    const duplicateNoteIds = new Set<string>();

    // Create grouping key based on patient info and time window
    allNotes.forEach((note) => {
      const key = `${note.patientName?.toLowerCase()}_${note.patientAge}_${note.patientGender?.toLowerCase()}`;
      
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(note);
    });

    // Analyze each group for time-based duplicates
    const detectedDuplicateGroups: DuplicateDetectionResult['duplicateGroups'] = [];

    Object.entries(duplicateGroups).forEach(([groupKey, notes]) => {
      if (notes.length < 2) return; // No duplicates possible

      // Sort by creation time
      notes.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

      const groupDuplicates: string[] = [];
      
      // Check for notes created within 5 minutes of each other
      for (let i = 1; i < notes.length; i++) {
        const prevNote = notes[i - 1];
        const currentNote = notes[i];
        
        const timeDiff = Math.abs(
          new Date(currentNote.createdAt || 0).getTime() - 
          new Date(prevNote.createdAt || 0).getTime()
        );

        // Consider duplicates if within 5 minutes and similar content
        if (timeDiff < 5 * 60 * 1000) {
          const contentSimilarity = calculateContentSimilarity(prevNote, currentNote);
          
          if (contentSimilarity > 0.8) { // 80% similarity threshold
            duplicateNoteIds.add(currentNote.id);
            groupDuplicates.push(currentNote.id);
          }
        }
      }

      if (groupDuplicates.length > 0) {
        detectedDuplicateGroups.push({
          patientName: notes[0].patientName || 'Unknown',
          count: groupDuplicates.length + 1, // Include the original
          noteIds: [notes[0].id, ...groupDuplicates],
          createdWithin: '5 minutes'
        });
      }
    });

    const result: DuplicateDetectionResult = {
      totalNotes: allNotes.length,
      duplicatesFound: duplicateNoteIds.size,
      uniqueNotes: allNotes.length - duplicateNoteIds.size,
      duplicateGroups: detectedDuplicateGroups
    };

    // Duplicate detection completed

    return result;

  } catch (error) {
    // Error during duplicate detection
    throw error;
  }
}

/**
 * Calculate content similarity between two notes
 */
function calculateContentSimilarity(note1: any, note2: any): number {
  const fields = ['chiefComplaint', 'diagnosis', 'treatmentPlan'];
  let totalSimilarity = 0;
  let fieldsCompared = 0;

  fields.forEach(field => {
    const value1 = (note1[field] || '').toLowerCase().trim();
    const value2 = (note2[field] || '').toLowerCase().trim();
    
    if (value1 && value2) {
      const similarity = calculateStringSimilarity(value1, value2);
      totalSimilarity += similarity;
      fieldsCompared++;
    }
  });

  return fieldsCompared > 0 ? totalSimilarity / fieldsCompared : 0;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Clean up duplicate notes from the database
 */
export async function cleanupDuplicateNotes(options: DatabaseCleanupOptions = {}): Promise<{
  success: boolean;
  deletedCount: number;
  errors: string[];
}> {
  const { dryRun = true } = options;
  
  try {
         // Starting database cleanup
    
    const duplicateResult = await detectDuplicateNotes();
    
         if (duplicateResult.duplicatesFound === 0) {
       // No duplicates found. Database is clean!
      return { success: true, deletedCount: 0, errors: [] };
    }

    const errors: string[] = [];
    let deletedCount = 0;

    if (!dryRun) {
      // Delete duplicate notes (keep the first one in each group)
      for (const group of duplicateResult.duplicateGroups) {
        const [keepNoteId, ...deleteNoteIds] = group.noteIds;
        
        for (const noteId of deleteNoteIds) {
          try {
            const deleteResponse = await apiClient.deleteMedicalNote(noteId);
                         if (deleteResponse.success) {
               deletedCount++;
               // Deleted duplicate note
            } else {
              errors.push(`Failed to delete note ${noteId}: ${deleteResponse.error}`);
            }
                     } catch (error) {
             const errorMsg = `Error deleting note ${noteId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
             errors.push(errorMsg);
             // Error deleting note
          }
        }
      }
    } else {
             // Dry run - just count what would be deleted
       deletedCount = duplicateResult.duplicateGroups.reduce((sum, group) => sum + (group.count - 1), 0);
       // DRY RUN: Would delete duplicate notes
    }

         // Cleanup completed
    
    return {
      success: true,
      deletedCount,
      errors
    };

     } catch (error) {
     // Error during database cleanup
    return {
      success: false,
      deletedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown cleanup error']
    };
  }
}

/**
 * Optimize database performance by cleaning up old data
 */
export async function optimizeDatabasePerformance(): Promise<{
  success: boolean;
  optimizations: string[];
  errors: string[];
}> {
  const optimizations: string[] = [];
  const errors: string[] = [];

  try {
         // Starting database performance optimization

    // 1. Clean up duplicates
    const cleanupResult = await cleanupDuplicateNotes({ dryRun: false });
    if (cleanupResult.success && cleanupResult.deletedCount > 0) {
      optimizations.push(`Removed ${cleanupResult.deletedCount} duplicate notes`);
    }
    errors.push(...cleanupResult.errors);

    // 2. Analyze note patterns for optimization
    const duplicateResult = await detectDuplicateNotes();
    optimizations.push(`Analyzed ${duplicateResult.totalNotes} total notes`);
    optimizations.push(`Found ${duplicateResult.uniqueNotes} unique notes`);

    // 3. Memory optimization
    if (typeof window !== 'undefined') {
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        optimizations.push('Cleared browser caches');
      }
    }

         // Database optimization completed

    return {
      success: true,
      optimizations,
      errors
    };

     } catch (error) {
     // Error during database optimization
    return {
      success: false,
      optimizations,
      errors: [error instanceof Error ? error.message : 'Unknown optimization error']
    };
  }
}

/**
 * Generate database health report
 */
export async function generateDatabaseHealthReport(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  summary: {
    totalNotes: number;
    duplicatesFound: number;
    uniqueNotes: number;
    duplicatePercentage: number;
  };
  recommendations: string[];
  duplicateGroups: DuplicateDetectionResult['duplicateGroups'];
}> {
  try {
         // Generating database health report
    
    const duplicateResult = await detectDuplicateNotes();
    const duplicatePercentage = (duplicateResult.duplicatesFound / duplicateResult.totalNotes) * 100;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    if (duplicatePercentage > 20) {
      status = 'critical';
      recommendations.push('Immediate cleanup required - high duplicate rate detected');
      recommendations.push('Review note creation process to prevent duplicates');
    } else if (duplicatePercentage > 5) {
      status = 'warning';
      recommendations.push('Consider running duplicate cleanup');
      recommendations.push('Monitor note creation patterns');
    } else {
      recommendations.push('Database is in good health');
      recommendations.push('Continue regular monitoring');
    }

    const report = {
      status,
      summary: {
        totalNotes: duplicateResult.totalNotes,
        duplicatesFound: duplicateResult.duplicatesFound,
        uniqueNotes: duplicateResult.uniqueNotes,
        duplicatePercentage: Math.round(duplicatePercentage * 100) / 100
      },
      recommendations,
      duplicateGroups: duplicateResult.duplicateGroups
    };

         // Database health report generated
    
    return report;

     } catch (error) {
     // Error generating database health report
    throw error;
  }
}