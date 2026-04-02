export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
    location: string;
  };
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[] | string;
  projects: Project[];
  certifications: Certification[];
  customization: ResumeCustomization;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  responsibilities: string[] | string;
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationDate?: string;
  status: 'completed' | 'in-progress' | 'expected';
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ResumeCustomization {
  template: string;
  colorScheme: 'conservative' | 'modern' | 'bold';
  iconStyle: 'minimal' | 'standard' | 'none';
  fontPairing: {
    heading: string;
    body: string;
  };
  spacing: number;
  customCss?: string;
}

export interface GenerationIntent {
  purpose: 'ats-optimized' | 'creative-showcase' | 'executive-level' | 'career-change' | 'first-job';
  targetIndustry: string;
  targetRole: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  emphasize: ('achievements' | 'skills' | 'education' | 'projects')[];
  tone: 'professional' | 'conversational' | 'technical' | 'creative';
  atsRequirements: {
    strictMode: boolean;
    keywordDensity: 'low' | 'medium' | 'high';
    includeSkillsMatrix: boolean;
  };
  designPreferences: {
    template: string;
    colorScheme: 'conservative' | 'modern' | 'bold';
    iconStyle: 'minimal' | 'standard' | 'none';
  };
}

export interface ClarifyingQuestion {
  id: string;
  field: string;
  text: string;
  type: 'text' | 'number' | 'bullets' | 'date';
  placeholder: string;
}

export interface ParseConfidence {
  overall: number;
  fields: Record<string, number>;
}

export interface ParseResult {
  extractedData: ResumeData;
  confidence: ParseConfidence;
  ambiguities: string[];
  recommendations: {
    templateStyle: string;
    missingElements: string[];
    industryDetected: string;
  };
}

export interface ResumeTemplate {
  id: string;
  name: string;
  preview: string;
  cssVariables: Record<string, string>;
}
