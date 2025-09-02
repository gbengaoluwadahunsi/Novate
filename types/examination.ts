export interface ExaminationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'cardiovascular' | 'respiratory' | 'gastrointestinal' | 'neurological' | 'musculoskeletal' | 'dermatological' | 'other';
  bodySystems: BodySystem[];
  findings: ExaminationFinding[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BodySystem {
  id: string;
  name: string;
  description: string;
  examinationPoints: ExaminationPoint[];
  normalFindings: string[];
  abnormalFindings: string[];
}

export interface ExaminationPoint {
  id: string;
  name: string;
  description: string;
  technique: string;
  normalFindings: string[];
  abnormalFindings: string[];
  clinicalSignificance: string;
}

export interface ExaminationFinding {
  id: string;
  bodySystemId: string;
  examinationPointId: string;
  finding: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  clinicalSignificance: string;
  recommendations: string[];
  timestamp: string;
}
