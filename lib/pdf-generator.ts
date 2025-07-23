import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface PracticeInfo {
  organizationName: string;
  organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  practiceLabel: string;
}

export interface MedicalNote {
  id: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string;
  noteType: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  doctorName?: string;
  doctorRegistrationNo?: string;
  doctorDepartment?: string;
  doctorSignature?: string; // Base64 encoded signature image
  createdAt: string;
  updatedAt: string;
}

export class MedicalNotePDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private readonly pageWidth: number = 210; // A4 width in mm
  private readonly margin: number = 20;
  private readonly contentWidth: number = this.pageWidth - (this.margin * 2);

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  generatePDF(note: MedicalNote, practiceInfo: PracticeInfo, patientName: string): jsPDF {
    this.currentY = 20;
    
    // Add header matching the image format
    this.addHeader(practiceInfo, patientName);
    
    // Add patient information section
    this.addPatientInfoSection(note, patientName);
    
    // Add medical content sections
    this.addMedicalSections(note);
    
    // Add signature section
    this.addSignatureSection(note);
    
    return this.doc;
  }

  private addHeader(practiceInfo: PracticeInfo, patientName: string) {
    // Practice name only (centered)
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(practiceInfo.organizationName, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 8;

    // Main title
    this.doc.setFontSize(16);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(0, 0, 255); // Blue color for the main title
    this.doc.text('MEDICAL CONSULTATION NOTE', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 8;

    // Separator line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addPatientInfoSection(note: MedicalNote, patientName: string) {
    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('PATIENT INFORMATION', this.margin, this.currentY);
    this.currentY += 6;

    // Separator line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;

    // Patient info in two columns
    this.doc.setFontSize(10);
    this.doc.setFont(undefined, 'normal');
    this.doc.setTextColor(0, 0, 0);

    // Left column
    this.doc.text(`Patient Name: ${patientName}`, this.margin, this.currentY);
    this.doc.text(`Age: ${note.patientAge ? note.patientAge.toString() : 'N/A'}`, this.margin, this.currentY + 5);
    this.doc.text(`Gender: ${note.patientGender}`, this.margin, this.currentY + 10);

    // Right column
    const rightColumnX = this.pageWidth / 2 + 10;
    this.doc.text(`Visit Date: ${new Date(note.createdAt).toLocaleDateString()}`, rightColumnX, this.currentY);
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, rightColumnX, this.currentY + 5);

    this.currentY += 20;
  }

  private addMedicalSections(note: MedicalNote) {
    const sections = [
      { title: 'CHIEF COMPLAINT', content: note.chiefComplaint },
      { title: 'HISTORY OF PRESENTING ILLNESS', content: note.historyOfPresentIllness },
      { title: 'PHYSICAL EXAMINATION', content: note.physicalExamination },
      { title: 'ASSESSMENT AND DIAGNOSIS', content: note.diagnosis },
      { title: 'MANAGEMENT PLAN', content: this.formatManagementPlan(note.treatmentPlan) }
    ];

    sections.forEach(section => {
      if (section.content && section.content.trim()) {
        this.addSection(section.title, section.content);
      }
    });
  }

  private formatManagementPlan(managementPlan?: string): string {
    if (!managementPlan) return '';
    
    try {
      // Try to parse if it's JSON
      const parsed = JSON.parse(managementPlan);
      let formatted = '';
      
      if (parsed.investigations) {
        formatted += `Investigations: ${parsed.investigations}\n`;
      }
      if (parsed.treatmentAdministered) {
        formatted += `Treatment Administered: ${parsed.treatmentAdministered}\n`;
      }
      if (parsed.medicationsPrescribed) {
        formatted += `Medications Prescribed: ${parsed.medicationsPrescribed}\n`;
      }
      if (parsed.patientEducation) {
        formatted += `Patient Education: ${parsed.patientEducation}\n`;
      }
      if (parsed.followUp) {
        formatted += `Follow-up: ${parsed.followUp}\n`;
      }
      
      return formatted.trim();
    } catch {
      // If not JSON, return as is
      return managementPlan;
    }
  }

  private addSection(title: string, content: string) {
    // Check if we need a new page
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 20;
    }

    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 6;

    // Separator line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;

    // Section content
    this.doc.setFontSize(10);
    this.doc.setFont(undefined, 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(content, this.contentWidth);
    lines.forEach(line => {
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 8;
  }

  private addSignatureSection(note: MedicalNote) {
    // Check if we need a new page
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.currentY += 10;

    // Separator line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;

    // Signature section
    const leftX = this.margin;
    const rightX = this.pageWidth / 2 + 10;
    const signatureY = this.currentY;

    // Left side - Doctor's Signature
    this.doc.setFontSize(10);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Doctor\'s Signature', leftX, signatureY);
    this.doc.setFont(undefined, 'normal');
    
    // Add signature image if available
    if (note.doctorSignature) {
      try {
        console.log('📄 Adding signature to PDF:', !!note.doctorSignature);
        
        // Add signature image
        const signatureWidth = 40; // Width in mm
        const signatureHeight = 20; // Height in mm
        const signatureX = leftX;
        const signatureImageY = signatureY + 8;
        
        this.doc.addImage(
          note.doctorSignature, 
          'JPEG', 
          signatureX, 
          signatureImageY, 
          signatureWidth, 
          signatureHeight
        );
        
        // Adjust currentY to account for signature image
        this.currentY = signatureImageY + signatureHeight + 5;
      } catch (error) {
        console.error('📄 Error adding signature to PDF:', error);
        // Fallback to text if image fails
        this.doc.text('Digital signature uploaded', leftX, signatureY + 8);
        this.currentY = signatureY + 15;
      }
    } else {
      // No signature - show placeholder
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineWidth(0.5);
      this.doc.rect(leftX, signatureY + 8, 40, 20); // Signature box
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('Signature space', leftX + 2, signatureY + 20);
      this.currentY = signatureY + 30;
    }
    
    // Show doctor name with "Dr." prefix below signature
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    const doctorName = note.doctorName ? 
      (note.doctorName.startsWith('Dr.') ? note.doctorName : `Dr. ${note.doctorName}`) : 
      'Dr. [Name]';
    this.doc.text(doctorName, leftX, this.currentY);
    
    // Always show "Reg. No." with or without number
    const regNumber = note.doctorRegistrationNo ? 
      `Reg. No: ${note.doctorRegistrationNo}` : 
      'Reg. No:';
    this.doc.text(regNumber, leftX, this.currentY + 5);

    // Right side - Date
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Date', rightX, signatureY);
    this.doc.setFont(undefined, 'normal');
    this.doc.text(new Date().toLocaleDateString(), rightX, signatureY + 5);

    this.currentY += 15;
  }

  // Static method for easy usage
  static generateAndDownload(note: MedicalNote, practiceInfo: PracticeInfo, patientName: string, filename?: string) {
    const generator = new MedicalNotePDFGenerator();
    const pdf = generator.generatePDF(note, practiceInfo, patientName);
    
    const defaultFilename = `medical-note-${practiceInfo.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}-${(patientName || 'patient').replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    pdf.save(filename || defaultFilename);
    return pdf;
  }
} 