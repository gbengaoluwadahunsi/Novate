import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { logger } from './logger'

export interface PracticeInfo {
  organizationName: string;
  organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  practiceLabel: string;
}

export interface MedicalNote {
  id: string;
  patientName: string;
  patientAge: number | null | string;
  patientGender: string;
  noteType: string | null;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  doctorName?: string;
  doctorRegistrationNo?: string;
  doctorDepartment?: string;
  doctorSignature?: string; // Base64 encoded signature image
  doctorStamp?: string; // Base64 encoded stamp image
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
    this.addMedicalContentSections(note);
    
    // Add signature section
    this.addSignatureSection(note);
    
    return this.doc;
  }

  private addHeader(practiceInfo: PracticeInfo, patientName: string) {
    // Main title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 255); // Blue color for the main title
    this.doc.text('MEDICAL CONSULTATION NOTE', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 8;

    // Practice information
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(practiceInfo.organizationName, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 12;
  }

  private addPatientInfoSection(note: MedicalNote, patientName: string) {
    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('PATIENT INFORMATION', this.margin, this.currentY);
    this.currentY += 6;

    // Patient details in a more structured format
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const patientInfo = [
      ['Patient Name:', patientName],
      ['Age:', String(note.patientAge) !== 'N/A' && note.patientAge ? String(note.patientAge) : 'N/A'],
      ['Gender:', note.patientGender || 'N/A'],
      ['Date:', new Date().toLocaleDateString()]
    ];

    patientInfo.forEach(([label, value]) => {
      this.doc.text(label, this.margin, this.currentY);
      this.doc.text(value, this.margin + 30, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 5;
  }

  private addMedicalContentSections(note: MedicalNote) {
    const sections = [
      { title: 'CHIEF COMPLAINT', content: note.chiefComplaint },
      { title: 'HISTORY OF PRESENT ILLNESS', content: note.historyOfPresentIllness },
      { title: 'PHYSICAL EXAMINATION', content: note.physicalExamination },
      { title: 'DIAGNOSIS', content: note.diagnosis },
      { title: 'TREATMENT PLAN', content: note.treatmentPlan }
    ];

    sections.forEach(section => {
      if (section.content && section.content.trim()) {
        this.addSection(section.title, section.content);
      }
    });
  }

  private addSection(title: string, content: string) {
    // Check if we need a new page
    if (this.currentY > 250) {
      this.doc.addPage();
      this.currentY = 20;
    }

    // Section title
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 6;

    // Section content
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Split content into lines that fit within the page width
    const lines = this.doc.splitTextToSize(content, this.contentWidth);
    
    lines.forEach((line: string) => {
      if (this.currentY > 280) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 4;
    });
    
    this.currentY += 3;
  }

  private addSignatureSection(note: MedicalNote) {
    // Check if we need a new page for signatures
    if (this.currentY > 220) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.currentY += 10;

    // Signature section
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    const signatureY = this.currentY;

    // Left side - Doctor's Signature
    const leftX = this.margin;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Doctor\'s Signature', leftX, signatureY);

    // Add signature image if available
    if (note.doctorSignature) {
      try {
        logger.info('📄 Adding signature to PDF:', !!note.doctorSignature);
        
        // Add signature image
        const signatureWidth = 40; // Width in mm
        const signatureHeight = 20; // Height in mm
        const signatureX = leftX;
        const signatureImageY = signatureY + 8;

        this.doc.addImage(
          note.doctorSignature,
          'PNG',
          signatureX,
          signatureImageY,
          signatureWidth,
          signatureHeight
        );

        // Adjust currentY to account for signature image
        this.currentY = signatureImageY + signatureHeight + 5;
      } catch (error) {
        logger.error('📄 Error adding signature to PDF:', error);
        // Fallback to text if image fails
        this.doc.text('Digital signature uploaded', leftX, signatureY + 8);
        this.currentY = signatureY + 15;
      }
    } else {
      // No signature - show placeholder
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setFillColor(250, 250, 250);
      this.doc.rect(leftX, signatureY + 8, 40, 20); // Signature box
      this.doc.setTextColor(150, 150, 150);
      this.doc.setFontSize(8);
      this.doc.text('Signature space', leftX + 2, signatureY + 20);
      this.currentY = signatureY + 30;
    }

    // Show doctor name with "Dr." prefix below signature
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    const doctorName = note.doctorName || 'Dr. [Name]';
    const displayName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;
    this.doc.text(displayName, leftX, this.currentY);
    this.currentY += 4;

    // Registration number
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    const regNumber = note.doctorRegistrationNo ? 
      `Reg. No: ${note.doctorRegistrationNo}` : 
      'Reg. No: [Registration Number]';
    this.doc.text(regNumber, leftX, this.currentY);

    // Right side - Date and Stamp
    const rightX = this.margin + 110;
    this.doc.text('Date', rightX, signatureY);
    this.doc.setFontSize(10);
    this.doc.text(new Date().toLocaleDateString(), rightX, signatureY + 5);

    // Add stamp section
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Official Stamp', rightX, signatureY + 15);

    // Add stamp image if available
    if (note.doctorStamp) {
      try {
        logger.info('📄 Adding stamp to PDF:', !!note.doctorStamp);
        
        // Add stamp image
        const stampWidth = 30; // Width in mm
        const stampHeight = 20; // Height in mm
        const stampX = rightX;
        const stampImageY = signatureY + 20;

        this.doc.addImage(
          note.doctorStamp,
          'PNG',
          stampX,
          stampImageY,
          stampWidth,
          stampHeight
        );
        
        logger.info('📄 Stamp added successfully to PDF');
      } catch (error) {
        logger.error('📄 Error adding stamp to PDF:', error);
        // Fallback to placeholder box if stamp fails
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(rightX, signatureY + 20, 30, 20); // Stamp box
        this.doc.setTextColor(150, 150, 150);
        this.doc.setFontSize(8);
        this.doc.text('Stamp space', rightX + 2, signatureY + 32);
      }
    } else {
      // No stamp - show placeholder
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setFillColor(250, 250, 250);
      this.doc.rect(rightX, signatureY + 20, 30, 20); // Stamp box
      this.doc.setTextColor(150, 150, 150);
      this.doc.setFontSize(8);
      this.doc.text('Stamp space', rightX + 2, signatureY + 32);
    }
  }

  static generateAndDownload(note: MedicalNote, practiceInfo: PracticeInfo, patientName: string): void {
    const generator = new MedicalNotePDFGenerator();
    const pdf = generator.generatePDF(note, practiceInfo, patientName);
    const filename = `medical-note-${patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }
} 