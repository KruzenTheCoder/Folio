import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number should be valid"),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().min(2, "Location is required"),
});

export const professionalSummarySchema = z.object({
  summary: z.string().max(1200),
});

export const workExperienceSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company name is required"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().optional(),
  isCurrentRole: z.boolean(),
  responsibilities: z.union([
    z.string().min(10, "Please add some responsibilities"),
    z.array(z.string().min(3)).min(1, "Add at least one responsibility"),
  ]),
}).refine((data) => {
  if (!data.isCurrentRole && !data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date is required if not currently working here",
  path: ["endDate"],
});

export const educationSchema = z.object({
  institution: z.string().min(2, "Institution is required"),
  degree: z.string().min(2, "Degree/Certification is required"),
  fieldOfStudy: z.string().optional(),
  graduationDate: z.string().optional(),
  status: z.enum(["completed", "in-progress", "expected"]),
});

export const skillsSchema = z.object({
  skills: z.union([
    z.string().min(2, "Skills are required"),
    z.array(z.string().min(1)).min(1, "Add at least one skill"),
  ]),
});

type ResumeValidationInput = {
  personalInfo?: { fullName?: string };
  experience?: unknown[];
  education?: unknown[];
  skills?: string[] | string;
  summary?: string;
};

export const fillMissingFieldsWarning = (data: ResumeValidationInput) => {
  const missing: string[] = [];
  if (!data.personalInfo?.fullName) missing.push("Personal Info: Full Name");
  if (!data.experience?.length) missing.push("Work Experience");
  if (!data.education?.length) missing.push("Education");
  if (!data.skills?.length) missing.push("Skills");
  if (!data.summary) missing.push("Summary");
  return missing;
};
