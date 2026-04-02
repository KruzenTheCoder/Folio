"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useResumeStore } from "@/stores/resume-store";
import { ParseResult, ResumeData, ClarifyingQuestion } from "@/types/resume";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";

const steps = [
  "Personal Info",
  "Summary",
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications",
  "Customize",
];

const personalSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
});

export function ResumeBuilderWorkspace() {
  const router = useRouter();
  const {
    data,
    intent,
    currentStep,
    setStep,
    updatePersonalInfo,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    setSkills,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    removeCertification,
    setCustomization,
    patchData,
    markSaved,
    lastSavedAt,
  } = useResumeStore();

  const [mode, setMode] = useState<"guided" | "paste">("guided");
  const [pasteTab, setPasteTab] = useState<"text" | "pdf" | "linkedin">("text");
  const [rawText, setRawText] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputId = "resume-pdf-input";
  const [reviewData, setReviewData] = useState<ResumeData | null>(null);
  const [postProcessing, setPostProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<"executive-dark" | "aurora-split" | "minimal-luxe" | "bold-contrast" | "neo-brutalism" | "editorial-chic" | "aurora-glass">("executive-dark");
  const [stepError, setStepError] = useState<string | null>(null);

  const [activeDictationField, setActiveDictationField] = useState<string | null>(null);
  const { isListening, start, stop, interim, isSupported } = useSpeechToText({
    onResult: (text) => {
      if (!activeDictationField) return;
      if (activeDictationField === "rawText") {
        setRawText((prev) => prev ? prev + " " + text : text);
      } else if (activeDictationField === "summary") {
        updateSummary(data.summary ? data.summary + " " + text : text);
      } else if (activeDictationField.startsWith("clarify:")) {
        const q = activeDictationField.replace("clarify:", "");
        setClarifyingAnswers((prev) => ({
          ...prev,
          [q]: (prev[q] ? prev[q] + " " : "") + text,
        }));
      }
      setActiveDictationField(null);
    },
    onError: (err) => {
      console.error(err);
      setActiveDictationField(null);
    }
  });

  const toggleDictation = (field: string) => {
    if (activeDictationField === field && isListening) {
      stop();
      setActiveDictationField(null);
    } else {
      if (isListening) stop();
      setActiveDictationField(field);
      start();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      markSaved();
    }, 10000);
    return () => clearInterval(interval);
  }, [markSaved]);

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  const parseAndTransform = async () => {
    setParsing(true);
    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const result = (await response.json()) as ParseResult;
      setParseResult(result);
      patchData(result.extractedData);
      if ((result.confidence?.overall || 0) < 0.8) {
        const clarifying = await fetch("/api/clarify-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ missingFields: result.recommendations.missingElements, userData: result.extractedData }),
        });
        const clarifyingResult = await clarifying.json();
        setClarifyingQuestions(clarifyingResult.questions || []);
      } else {
        setClarifyingQuestions([]);
      }
    } finally {
      setParsing(false);
    }
  };

  const askForAtsFixes = async () => {
    const response = await fetch("/api/clarify-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missingFields: ["quantified_impact", "role_keywords", "targeted_summary"],
        userData: data,
      }),
    });
    const result = await response.json();
    setClarifyingQuestions(result.questions || []);
  };

  const onPdfSelected = async (file: File) => {
    setUploadError(null);
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ingest/pdf", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || "Failed to process PDF");
      } else {
        if (json.parsed) {
          setParseResult(json.parsed as ParseResult);
          patchData(json.parsed.extractedData);
          if ((json.parsed.confidence?.overall || 0) < 0.8) {
            const clarifying = await fetch("/api/clarify-questions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                missingFields: json.parsed.recommendations?.missingElements || [],
                userData: json.parsed.extractedData,
              }),
            });
            const clarifyingResult = await clarifying.json();
            setClarifyingQuestions(clarifyingResult.questions || []);
          } else {
            setClarifyingQuestions([]);
          }
        } else if (json.extractedText) {
          setRawText(json.extractedText as string);
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const autoFixForReview = async () => {
    setPostProcessing(true);
    setReviewData(null);
    try {
      const res = await fetch("/api/ai/post-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, intent }),
      });
      const json = await res.json();
      if (json.data) {
        setReviewData(json.data as ResumeData);
      }
    } finally {
      setPostProcessing(false);
    }
  };

  const applyClarifications = async () => {
    setPostProcessing(true);
    setReviewData(null);
    try {
      const formattedClarifications: Record<string, string> = {};
      clarifyingQuestions.forEach(q => {
        if (clarifyingAnswers[q.id]) {
          formattedClarifications[q.text] = clarifyingAnswers[q.id];
        }
      });
      
      const res = await fetch("/api/ai/post-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, intent, clarifications: formattedClarifications }),
      });
      const json = await res.json();
      if (json.data) {
        setReviewData(json.data as ResumeData);
      }
    } finally {
      setPostProcessing(false);
    }
  };

  const acceptReviewData = () => {
    if (reviewData) {
      patchData(reviewData);
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "folio_builder_handoff",
            JSON.stringify({
              data: reviewData,
              intent,
              ts: Date.now(),
            })
          );
        }
      } catch {}
      router.push("/editor/new?fromBuilder=1");
    }
  };

  const generatePreview = async () => {
    const map = {
      personalInfo: {
        fullName: data.personalInfo.fullName || "",
        email: data.personalInfo.email || "",
        phone: data.personalInfo.phone || "",
        linkedin: data.personalInfo.linkedin || "",
        portfolio: data.personalInfo.portfolio || "",
        location: data.personalInfo.location || "",
      },
      summary: data.summary || "",
      experience: (data.experience || []).map((e) => ({
        jobTitle: e.jobTitle,
        company: e.company,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrentRole: e.isCurrentRole,
        responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities.join("\n") : e.responsibilities || "",
      })),
      education: (data.education || []).map((ed) => ({
        institution: ed.institution,
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        graduationDate: ed.graduationDate,
        status: ed.status,
      })),
      skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills || "",
      additional: {},
    };
    const res = await fetch("/api/templates/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: map, template: previewTemplate }),
    });
    const json = await res.json();
    if (json.html) {
      setPreviewHtml(json.html);
      setShowPreview(true);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    if (currentStep === 2) {
      const items = Array.from(data.experience);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destinationIndex, 0, reorderedItem);
      patchData({ experience: items });
    } else if (currentStep === 3) {
      const items = Array.from(data.education);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destinationIndex, 0, reorderedItem);
      patchData({ education: items });
    }
  };

  const onNext = () => {
    setStepError(null);
    if (currentStep === 0) {
      const result = personalSchema.safeParse({
        fullName: data.personalInfo.fullName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
      });
      if (!result.success) {
        setStepError("Please complete Full name, valid Email, and Phone before continuing.");
        return;
      }
    }

    if (currentStep >= steps.length - 1) {
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "folio_builder_handoff",
            JSON.stringify({
              data,
              intent,
              ts: Date.now(),
            })
          );
        }
      } catch {}
      router.push("/editor/new?fromBuilder=1");
      return;
    }

    setStep(Math.min(currentStep + 1, steps.length - 1));
  };

  const onBack = () => setStep(Math.max(currentStep - 1, 0));

  return (
    <div className="space-y-6">
      <div className="flex gap-2 glass-card p-2 rounded-xl w-fit">
        <button className={`px-4 py-2 rounded-lg ${mode === "guided" ? "bg-primary text-primary-foreground" : "text-white/60"}`} onClick={() => setMode("guided")}>
          Guided Form Wizard
        </button>
        <button className={`px-4 py-2 rounded-lg ${mode === "paste" ? "bg-primary text-primary-foreground" : "text-white/60"}`} onClick={() => setMode("paste")}>
          Paste & Transform
        </button>
      </div>

      {mode === "guided" ? (
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Step {currentStep + 1} of 8</span>
              <span className="text-white/50">{steps[currentStep]}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" animate={{ width: `${progress}%` }} />
            </div>
          </div>

          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <input className="glass-input rounded-xl px-4 py-3" placeholder="Full name" value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo({ fullName: e.target.value })} />
              <input className="glass-input rounded-xl px-4 py-3" placeholder="Email" value={data.personalInfo.email} onChange={(e) => updatePersonalInfo({ email: e.target.value })} />
              <input className="glass-input rounded-xl px-4 py-3" placeholder="Phone" value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo({ phone: e.target.value })} />
              <input className="glass-input rounded-xl px-4 py-3" placeholder="Location" value={data.personalInfo.location} onChange={(e) => updatePersonalInfo({ location: e.target.value })} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="relative">
              <textarea 
                className="glass-input rounded-xl w-full min-h-36 p-4" 
                placeholder="Write a professional summary or leave blank for AI draft." 
                value={data.summary + (activeDictationField === "summary" && interim ? " " + interim : "")} 
                onChange={(e) => updateSummary(e.target.value)} 
              />
              {isSupported && (
                <button
                  className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${activeDictationField === "summary" && isListening ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50 hover:text-white/80 hover:bg-white/20"}`}
                  onClick={() => toggleDictation("summary")}
                  title={activeDictationField === "summary" && isListening ? "Stop listening" : "Dictate summary"}
                >
                  {activeDictationField === "summary" && isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="experience-list">
                {(provided) => (
                  <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                    {data.experience.map((exp, index) => (
                      <Draggable key={exp.id} draggableId={exp.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="glass rounded-xl p-4 space-y-2 relative group"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white/80 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={16} />
                            </div>
                            <div className="flex gap-2 pl-6">
                              <input className="glass-input rounded-lg px-3 py-2 flex-1" value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })} />
                              <input className="glass-input rounded-lg px-3 py-2 flex-1" value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} />
                              <button className="px-3 py-2 rounded-lg bg-red-500/20" onClick={() => removeExperience(exp.id)}>Remove</button>
                            </div>
                            <textarea
                              className="glass-input rounded-lg w-full p-3 pl-8"
                              value={Array.isArray(exp.responsibilities) 
                                ? exp.responsibilities.map(b => typeof b === 'string' ? b : (b as any).actionItem || (b as any).message || JSON.stringify(b)).join("\n") 
                                : exp.responsibilities}
                              onChange={(e) => updateExperience(exp.id, { responsibilities: e.target.value.split("\n").filter(Boolean) })}
                              placeholder="One bullet per line"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button
                      className="px-4 py-2 rounded-lg bg-white/10"
                      onClick={() =>
                        addExperience({
                          jobTitle: "Role",
                          company: "Company",
                          startDate: "2024",
                          endDate: "",
                          isCurrentRole: true,
                          responsibilities: ["Delivered measurable impact."],
                        })
                      }
                    >
                      Add Experience
                    </button>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {currentStep === 3 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="education-list">
                {(provided) => (
                  <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                    {data.education.map((edu, index) => (
                      <Draggable key={edu.id} draggableId={edu.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="glass rounded-xl p-4 flex gap-2 relative group pl-10"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white/80 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={16} />
                            </div>
                            <input className="glass-input rounded-lg px-3 py-2 flex-1" value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} />
                            <input className="glass-input rounded-lg px-3 py-2 flex-1" value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} />
                            <button className="px-3 py-2 rounded-lg bg-red-500/20" onClick={() => removeEducation(edu.id)}>Remove</button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => addEducation({ institution: "University", degree: "Degree", status: "completed" })}>
                      Add Education
                    </button>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {currentStep === 4 && (
            <textarea
              className="glass-input rounded-xl w-full min-h-28 p-4"
              value={Array.isArray(data.skills) ? data.skills.join(", ") : data.skills}
              onChange={(e) => setSkills(e.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
              placeholder="Skills separated by commas"
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-3">
              {data.projects.map((project) => (
                <div key={project.id} className="glass rounded-xl p-4 flex gap-2">
                  <input className="glass-input rounded-lg px-3 py-2 flex-1" value={project.name} onChange={(e) => updateProject(project.id, { name: e.target.value })} />
                  <input className="glass-input rounded-lg px-3 py-2 flex-1" value={project.description} onChange={(e) => updateProject(project.id, { description: e.target.value })} />
                  <button className="px-3 py-2 rounded-lg bg-red-500/20" onClick={() => removeProject(project.id)}>Remove</button>
                </div>
              ))}
              <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => addProject({ name: "Project", description: "Impact statement", technologies: [] })}>
                Add Project
              </button>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="glass rounded-xl p-4 flex justify-between">
                  <span>{cert.name} · {cert.issuer}</span>
                  <button className="px-3 py-1 rounded-lg bg-red-500/20" onClick={() => removeCertification(cert.id)}>Remove</button>
                </div>
              ))}
              <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => addCertification({ name: "Certification", issuer: "Issuer" })}>
                Add Certification
              </button>
            </div>
          )}

          {currentStep === 7 && (
            <div className="grid md:grid-cols-3 gap-3">
              {["modern", "classic", "creative", "technical", "executive", "minimal"].map((template) => (
                <button
                  key={template}
                  className={`p-4 rounded-xl border ${data.customization.template === template ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}
                  onClick={() => setCustomization({ template })}
                >
                  {template}
                </button>
              ))}
              <select className="glass-input rounded-xl px-3 py-2" value={intent.tone} onChange={(e) => useResumeStore.getState().updateIntent({ tone: e.target.value as "professional" | "conversational" | "technical" | "creative" })}>
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-white/50">Last auto-save: {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : "Not yet"}</span>
              {stepError && <p className="text-xs text-amber-300">{stepError}</p>}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/10" onClick={onBack}>Back</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={onNext}>
                {currentStep >= steps.length - 1 ? "Continue to Editor" : "Next"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-lg ${pasteTab === "text" ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70"}`} onClick={() => setPasteTab("text")}>
              Paste Text
            </button>
            <button className={`px-4 py-2 rounded-lg ${pasteTab === "pdf" ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70"}`} onClick={() => setPasteTab("pdf")}>
              Upload PDF
            </button>
            <button className={`px-4 py-2 rounded-lg ${pasteTab === "linkedin" ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70"}`} onClick={() => setPasteTab("linkedin")}>
              Import LinkedIn
            </button>
          </div>
          {pasteTab === "text" && (
            <div className="relative">
              <textarea 
                className="glass-input rounded-xl w-full min-h-64 p-4" 
                placeholder="Paste existing resume text here..." 
                value={rawText + (activeDictationField === "rawText" && interim ? " " + interim : "")} 
                onChange={(e) => setRawText(e.target.value)} 
              />
              {isSupported && (
                <button
                  className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${activeDictationField === "rawText" && isListening ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50 hover:text-white/80 hover:bg-white/20"}`}
                  onClick={() => toggleDictation("rawText")}
                  title={activeDictationField === "rawText" && isListening ? "Stop listening" : "Dictate text"}
                >
                  {activeDictationField === "rawText" && isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              <button disabled={!rawText || parsing} className="px-4 py-2 mt-4 rounded-lg bg-blue-600 disabled:bg-blue-800/40 w-fit" onClick={parseAndTransform}>
                {parsing ? "Parsing..." : "Parse with AI"}
              </button>
            </div>
          )}
          {pasteTab === "pdf" && (
            <div className="space-y-3">
              <input id={fileInputId} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && onPdfSelected(e.target.files[0])} />
              <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => document.getElementById(fileInputId)?.click()} disabled={uploading}>
                {uploading ? "Processing..." : "Choose PDF"}
              </button>
              {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
              <p className="text-xs text-white/50">We securely extract text locally and do not store your file.</p>
            </div>
          )}
          {pasteTab === "linkedin" && (
            <div className="space-y-3">
              <p className="text-sm text-white/70">Export your LinkedIn profile as PDF and upload it here. We will parse it automatically.</p>
              <input id={`${fileInputId}-li`} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && onPdfSelected(e.target.files[0])} />
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => document.getElementById(`${fileInputId}-li`)?.click()} disabled={uploading}>
                  {uploading ? "Processing..." : "Upload LinkedIn PDF"}
                </button>
                <a href="https://www.linkedin.com/help/linkedin/answer/a507735/export-your-profile-to-a-pdf" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-white/10">
                  How to export PDF
                </a>
              </div>
              {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
            </div>
          )}
          {parseResult && (
            <div className="space-y-3">
              <div className="glass rounded-xl p-4">
                <p className="text-sm">Overall confidence: <span className={parseResult.confidence.overall >= 0.8 ? "text-green-400" : "text-amber-400"}>{Math.round(parseResult.confidence.overall * 100)}%</span></p>
              </div>
              {clarifyingQuestions.length > 0 && (
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Clarifying Questions</p>
                  </div>
                  {clarifyingQuestions.map((q) => (
                    <div key={q.id} className="space-y-1 relative">
                      <p className="text-sm text-white/75">{q.text}</p>
                      <div className="relative">
                        <input 
                          className="glass-input rounded-lg w-full px-3 py-2 pr-10" 
                          value={(clarifyingAnswers[q.id] || "") + (activeDictationField === `clarify:${q.id}` && interim ? " " + interim : "")} 
                          onChange={(e) => setClarifyingAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} 
                        />
                        {isSupported && (
                          <button
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${activeDictationField === `clarify:${q.id}` && isListening ? "bg-red-500/20 text-red-400" : "text-white/40 hover:text-white/80 hover:bg-white/10"}`}
                            onClick={() => toggleDictation(`clarify:${q.id}`)}
                            title={activeDictationField === `clarify:${q.id}` && isListening ? "Stop listening" : "Dictate answer"}
                          >
                            {activeDictationField === `clarify:${q.id}` && isListening ? <MicOff size={14} /> : <Mic size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button className="px-4 py-2 rounded-lg bg-blue-600" onClick={applyClarifications} disabled={postProcessing}>
                    {postProcessing ? "Preparing review..." : "Apply Clarifications & Prepare Review"}
                  </button>
                </div>
              )}
              {clarifyingQuestions.length === 0 && (
                <button className="px-4 py-2 rounded-lg bg-blue-600" onClick={autoFixForReview} disabled={postProcessing}>
                  {postProcessing ? "Preparing review..." : "Auto-Fix & Prepare Review"}
                </button>
              )}
              {reviewData && (
                <div className="glass rounded-xl p-4 space-y-3">
                  <p className="font-medium">Review Structured Resume Data</p>
                  <div className="text-sm space-y-2">
                    <p><span className="text-white/60">Name:</span> {reviewData.personalInfo.fullName}</p>
                    <p><span className="text-white/60">Summary:</span> {reviewData.summary}</p>
                    <div>
                      <p className="text-white/60">Experience:</p>
                      <ul className="list-disc pl-5">
                        {reviewData.experience.map((exp, index) => (
                          <li key={exp.id || `exp-${index}`}>
                            {exp.jobTitle} at {exp.company} — {exp.startDate} to {exp.isCurrentRole ? "Present" : exp.endDate || "N/A"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-white/60">Skills:</p>
                      <p>{Array.isArray(reviewData.skills) ? reviewData.skills.join(", ") : reviewData.skills}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => setReviewData(null)}>Discard</button>
                    <button className="px-4 py-2 rounded-lg bg-blue-600" onClick={acceptReviewData}>Accept & Open Editor</button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <button className="px-4 py-2 rounded-lg bg-white/10" onClick={askForAtsFixes}>Analyze ATS & Ask Questions</button>
            <button className="px-4 py-2 rounded-lg bg-white/10" onClick={generatePreview}>Live Preview</button>
            <select className="glass-input rounded-xl px-3 py-2" value={previewTemplate} onChange={(e) => setPreviewTemplate(e.target.value as typeof previewTemplate)}>
              <option value="executive-dark">Executive Dark</option>
              <option value="aurora-split">Aurora Split</option>
              <option value="minimal-luxe">Minimal Luxe</option>
              <option value="bold-contrast">Bold Contrast</option>
              <option value="neo-brutalism">Neo Brutalism</option>
              <option value="editorial-chic">Editorial Chic</option>
              <option value="aurora-glass">Aurora Glass</option>
            </select>
          </div>
        </div>
      )}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-neutral-900 rounded-xl w-full max-w-5xl h-[80vh] flex flex-col">
            <div className="p-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70">Template</span>
                <select className="bg-white/10 text-sm rounded px-2 py-1" value={previewTemplate} onChange={(e) => setPreviewTemplate(e.target.value as typeof previewTemplate)}>
                  <option value="executive-dark">Executive Dark</option>
                  <option value="aurora-split">Aurora Split</option>
                  <option value="minimal-luxe">Minimal Luxe</option>
                  <option value="bold-contrast">Bold Contrast</option>
                  <option value="neo-brutalism">Neo Brutalism</option>
                  <option value="editorial-chic">Editorial Chic</option>
                  <option value="aurora-glass">Aurora Glass</option>
                </select>
                <button className="px-3 py-1 rounded bg-white/10 text-sm" onClick={generatePreview}>Regenerate</button>
              </div>
              <button className="px-3 py-1 rounded bg-white/10 text-sm" onClick={() => setShowPreview(false)}>Close</button>
            </div>
            <div className="flex-1">
              <iframe title="guided-preview" srcDoc={previewHtml} className="w-full h-full bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
