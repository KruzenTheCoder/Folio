import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  Certification,
  Education,
  GenerationIntent,
  Project,
  ResumeCustomization,
  ResumeData,
  WorkExperience,
} from "@/types/resume";

interface ResumeStore {
  data: ResumeData;
  intent: GenerationIntent;
  currentStep: number;
  lastSavedAt: string | null;
  setStep: (step: number) => void;
  markSaved: () => void;
  patchData: (patch: Partial<ResumeData>) => void;
  updatePersonalInfo: (info: Partial<ResumeData["personalInfo"]>) => void;
  updateSummary: (summary: string) => void;
  updateSkills: (skills: string) => void;
  setSkills: (skills: string[]) => void;
  updateIntent: (intent: Partial<GenerationIntent>) => void;
  setCustomization: (customization: Partial<ResumeCustomization>) => void;
  addExperience: (exp: Omit<WorkExperience, "id">) => void;
  updateExperience: (id: string, exp: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (edu: Omit<Education, "id">) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addCertification: (certification: Omit<Certification, "id">) => void;
  removeCertification: (id: string) => void;
  resetResume: () => void;
}

const baseCustomization: ResumeCustomization = {
  template: "modern",
  colorScheme: "modern",
  iconStyle: "standard",
  fontPairing: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
  spacing: 16,
  customCss: "",
};

const initialData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  customization: baseCustomization,
};

const initialIntent: GenerationIntent = {
  purpose: "ats-optimized",
  targetIndustry: "Technology",
  targetRole: "Software Engineer",
  experienceLevel: "mid",
  emphasize: ["achievements", "skills"],
  tone: "professional",
  atsRequirements: {
    strictMode: true,
    keywordDensity: "high",
    includeSkillsMatrix: true,
  },
  designPreferences: {
    template: "modern",
    colorScheme: "modern",
    iconStyle: "standard",
  },
};

function normalizePatchedData(current: ResumeData, patch: Partial<ResumeData>): ResumeData {
  const merged: ResumeData = { ...current, ...patch };

  const experience = (patch.experience ?? merged.experience ?? []).map((item) => ({
    ...item,
    id: item.id || uuidv4(),
    responsibilities: Array.isArray(item.responsibilities)
      ? item.responsibilities
      : String(item.responsibilities || "")
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean),
  }));

  const education = (patch.education ?? merged.education ?? []).map((item) => ({
    ...item,
    id: (item as Education).id || uuidv4(),
  }));

  const projects = (patch.projects ?? merged.projects ?? []).map((item) => ({
    ...item,
    id: item.id || uuidv4(),
    technologies: Array.isArray(item.technologies)
      ? item.technologies
      : String(item.technologies || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
  }));

  const certifications = (patch.certifications ?? merged.certifications ?? []).map((item) => ({
    ...item,
    id: item.id || uuidv4(),
  }));

  const skills = Array.isArray(merged.skills)
    ? merged.skills
    : String(merged.skills || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

  return {
    ...merged,
    personalInfo: { ...current.personalInfo, ...(patch.personalInfo || {}) },
    experience,
    education,
    projects,
    certifications,
    skills,
    customization: { ...current.customization, ...(patch.customization || {}) },
  };
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: initialData,
      intent: initialIntent,
      currentStep: 0,
      lastSavedAt: null,
      setStep: (step) => set({ currentStep: step }),
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
      patchData: (patch) =>
        set((state) => ({
          data: normalizePatchedData(state.data, patch),
        })),
      updatePersonalInfo: (info) =>
        set((state) => ({
          data: { ...state.data, personalInfo: { ...state.data.personalInfo, ...info } },
        })),
      updateSummary: (summary) => set((state) => ({ data: { ...state.data, summary } })),
      updateSkills: (skills) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: skills
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          },
        })),
      setSkills: (skills) => set((state) => ({ data: { ...state.data, skills } })),
      updateIntent: (intent) =>
        set((state) => ({
          intent: {
            ...state.intent,
            ...intent,
            atsRequirements: {
              ...state.intent.atsRequirements,
              ...intent.atsRequirements,
            },
            designPreferences: {
              ...state.intent.designPreferences,
              ...intent.designPreferences,
            },
          },
        })),
      setCustomization: (customization) =>
        set((state) => ({
          data: {
            ...state.data,
            customization: { ...state.data.customization, ...customization },
          },
        })),
      addExperience: (exp) =>
        set((state) => ({
          data: { ...state.data, experience: [...state.data.experience, { ...exp, id: uuidv4() }] },
        })),
      updateExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map((item) => (item.id === id ? { ...item, ...exp } : item)),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((item) => item.id !== id),
          },
        })),
      addEducation: (edu) =>
        set((state) => ({
          data: { ...state.data, education: [...state.data.education, { ...edu, id: uuidv4() }] },
        })),
      updateEducation: (id, edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((item) => (item.id === id ? { ...item, ...edu } : item)),
          },
        })),
      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((item) => item.id !== id),
          },
        })),
      addProject: (project) =>
        set((state) => ({
          data: { ...state.data, projects: [...state.data.projects, { ...project, id: uuidv4() }] },
        })),
      updateProject: (id, project) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((item) => (item.id === id ? { ...item, ...project } : item)),
          },
        })),
      removeProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((item) => item.id !== id),
          },
        })),
      addCertification: (certification) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: [...state.data.certifications, { ...certification, id: uuidv4() }],
          },
        })),
      removeCertification: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.filter((item) => item.id !== id),
          },
        })),
      resetResume: () =>
        set({
          data: initialData,
          intent: initialIntent,
          currentStep: 0,
          lastSavedAt: null,
        }),
    }),
    {
      name: "folio-draft-storage",
      version: 2,
    },
  ),
);
