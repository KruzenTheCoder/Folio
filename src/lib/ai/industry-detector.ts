export const INDUSTRIES = {
  SOFTWARE: 'software',
  DATA: 'data',
  DESIGN: 'design',
  MARKETING: 'marketing',
  SALES: 'sales',
  FINANCE: 'finance',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  ENGINEERING: 'engineering',
  HR: 'hr',
  OPERATIONS: 'operations',
  CUSTOMER_SUCCESS: 'customer_success',
  PRODUCT: 'product',
  LEGAL: 'legal',
  GENERAL: 'general'
} as const;

export type Industry = typeof INDUSTRIES[keyof typeof INDUSTRIES];

interface IndustryPattern {
  keywords: string[];
  titles: string[];
  skills: string[];
}

const INDUSTRY_PATTERNS: Record<Industry, IndustryPattern> = {
  software: {
    keywords: ['software', 'developer', 'engineer', 'programming', 'code', 'api', 'backend', 'frontend', 'fullstack', 'devops'],
    titles: ['software engineer', 'developer', 'programmer', 'sre', 'devops', 'architect'],
    skills: ['javascript', 'python', 'java', 'c#', '.net', 'react', 'node', 'sql', 'aws', 'azure', 'docker', 'kubernetes']
  },
  data: {
    keywords: ['data', 'analytics', 'analysis', 'scientist', 'analyst', 'bi', 'insights', 'ml', 'machine learning'],
    titles: ['data scientist', 'data analyst', 'data engineer', 'ml engineer', 'bi analyst'],
    skills: ['python', 'sql', 'r', 'tableau', 'power bi', 'pandas', 'spark', 'tensorflow', 'pytorch']
  },
  design: {
    keywords: ['design', 'ui', 'ux', 'graphic', 'visual', 'creative', 'figma', 'adobe'],
    titles: ['designer', 'ui/ux', 'product designer', 'graphic designer', 'creative director'],
    skills: ['figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'prototyping', 'wireframing']
  },
  marketing: {
    keywords: ['marketing', 'campaign', 'seo', 'content', 'social media', 'brand', 'digital marketing'],
    titles: ['marketing manager', 'digital marketer', 'content manager', 'seo specialist', 'brand manager'],
    skills: ['google analytics', 'seo', 'sem', 'facebook ads', 'google ads', 'hubspot', 'mailchimp']
  },
  sales: {
    keywords: ['sales', 'business development', 'account', 'revenue', 'pipeline', 'deals', 'closing'],
    titles: ['sales', 'account executive', 'business development', 'sales manager', 'account manager'],
    skills: ['salesforce', 'crm', 'negotiation', 'prospecting', 'b2b', 'saas sales']
  },
  finance: {
    keywords: ['finance', 'accounting', 'financial', 'investment', 'banking', 'audit', 'tax'],
    titles: ['financial analyst', 'accountant', 'cfo', 'controller', 'auditor', 'investment banker'],
    skills: ['excel', 'quickbooks', 'financial modeling', 'gaap', 'sap', 'oracle financials']
  },
  healthcare: {
    keywords: ['healthcare', 'medical', 'clinical', 'patient', 'health', 'nurse', 'physician'],
    titles: ['nurse', 'physician', 'healthcare', 'clinical', 'medical', 'pharmacist'],
    skills: ['patient care', 'medical records', 'epic', 'cerner', 'hipaa']
  },
  education: {
    keywords: ['teacher', 'education', 'instruction', 'curriculum', 'training', 'learning'],
    titles: ['teacher', 'instructor', 'professor', 'educator', 'trainer'],
    skills: ['curriculum development', 'classroom management', 'online teaching', 'learning management']
  },
  engineering: {
    keywords: ['mechanical', 'electrical', 'civil', 'engineer', 'manufacturing', 'systems'],
    titles: ['mechanical engineer', 'electrical engineer', 'civil engineer', 'systems engineer'],
    skills: ['autocad', 'solidworks', 'matlab', 'cad', 'manufacturing']
  },
  hr: {
    keywords: ['human resources', 'hr', 'recruiting', 'talent', 'recruitment', 'benefits', 'compensation'],
    titles: ['hr manager', 'recruiter', 'talent acquisition', 'hr business partner'],
    skills: ['workday', 'adp', 'recruiting', 'onboarding', 'hris']
  },
  operations: {
    keywords: ['operations', 'logistics', 'supply chain', 'process', 'efficiency', 'project management'],
    titles: ['operations manager', 'project manager', 'logistics', 'supply chain manager'],
    skills: ['project management', 'six sigma', 'lean', 'process improvement', 'jira']
  },
  customer_success: {
    keywords: ['customer success', 'customer service', 'support', 'client relations', 'customer experience'],
    titles: ['customer success', 'support', 'customer service', 'client manager'],
    skills: ['zendesk', 'intercom', 'customer retention', 'account management']
  },
  product: {
    keywords: ['product management', 'product manager', 'roadmap', 'feature', 'product strategy'],
    titles: ['product manager', 'product owner', 'product lead'],
    skills: ['product management', 'roadmap', 'agile', 'scrum', 'jira', 'product strategy']
  },
  legal: {
    keywords: ['legal', 'attorney', 'lawyer', 'counsel', 'compliance', 'contract'],
    titles: ['attorney', 'lawyer', 'legal counsel', 'paralegal'],
    skills: ['legal research', 'contract law', 'compliance', 'litigation']
  },
  general: {
    keywords: [],
    titles: [],
    skills: []
  }
};

export function detectIndustry(jobDescription: string, resumeText?: string): Industry {
  const text = `${jobDescription} ${resumeText || ''}`.toLowerCase();
  
  const scores: Record<Industry, number> = {} as any;
  
  // Score each industry
  for (const [industry, patterns] of Object.entries(INDUSTRY_PATTERNS)) {
    let score = 0;
    
    // Check keywords
    for (const keyword of patterns.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }
    
    // Check titles
    for (const title of patterns.titles) {
      if (text.includes(title.toLowerCase())) {
        score += 5;
      }
    }
    
    // Check skills
    for (const skill of patterns.skills) {
      if (text.includes(skill.toLowerCase())) {
        score += 2;
      }
    }
    
    scores[industry as Industry] = score;
  }
  
  // Get industry with highest score
  const sortedIndustries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  const topIndustry = sortedIndustries[0];
  
  // If no clear match, return general
  if (topIndustry[1] === 0) {
    return INDUSTRIES.GENERAL;
  }
  
  return topIndustry[0] as Industry;
}

export function getIndustryContext(industry: Industry) {
  return INDUSTRY_PATTERNS[industry];
}
