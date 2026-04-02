"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phases = ["Parsing", "Writing", "ATS", "Styling"];

const beforeBullets = [
  "Worked on frontend stuff",
  "Helped with projects",
  "Did some coding tasks",
  "Managed team members",
  "Improved performance",
  "Built features",
];

const afterBullets = [
  "Architected React component library used by 12 teams",
  "Led migration to TypeScript, reducing bugs by 47%",
  "Optimized bundle size by 62%, improving LCP by 1.8s",
  "Mentored 8 engineers with 100% promotion rate",
  "Delivered $2.1M revenue feature in 6-week sprint",
  "Built real-time dashboard serving 50K daily users",
];

const weakPhrases = ["responsible for", "helped with", "worked on", "various tasks", "stuff"];
const strongPhrases = ["spearheaded", "architected", "delivered", "reduced by 47%", "increased 3x"];

export function ResumeStoryboard() {
  const [step, setStep] = useState(0);
  const status = useMemo(() => phases[step % phases.length], [step]);
  
  const [typedIdx, setTypedIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedIdx, setFeedIdx] = useState(0);
  const [bulletTransformIdx, setBulletTransformIdx] = useState(0);
  const [atsScore, setAtsScore] = useState(34);
  const [currentBulletText, setCurrentBulletText] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);

  const prompts = useMemo(
    () => [
      "Quantify this achievement...",
      "Add metrics to impact...",
      "Use stronger action verbs...",
      "Highlight leadership...",
      "Emphasize technical depth...",
    ],
    []
  );

  const feed = useMemo(
    () => [
      "✓ PDF structure parsed",
      "✓ 6 bullet points found",
      "⚡ Weak verbs detected",
      "⚡ Missing metrics",
      "→ Enhancing content...",
      "✓ Keywords optimized",
    ],
    []
  );

  // Phase cycling
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % phases.length), 3200);
    return () => clearInterval(id);
  }, []);

  // Prompt typing
  useEffect(() => {
    const phrase = prompts[typedIdx % prompts.length];
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(id);
        setTimeout(() => setTypedIdx((v) => v + 1), 600);
      }
    }, 28);
    return () => clearInterval(id);
  }, [typedIdx, prompts]);

  // Feed cycling
  useEffect(() => {
    const id = setInterval(() => setFeedIdx((v) => v + 1), 1100);
    return () => clearInterval(id);
  }, []);

  // Bullet transformation during Writing phase
  useEffect(() => {
    if (status === "Writing") {
      setIsTransforming(true);
      const transformInterval = setInterval(() => {
        setBulletTransformIdx((prev) => (prev + 1) % 3);
      }, 1000);
      return () => {
        clearInterval(transformInterval);
        setIsTransforming(false);
      };
    }
  }, [status]);

  // Typewriter effect for bullet transformation
  useEffect(() => {
    if (status === "Writing" && isTransforming) {
      const targetText = afterBullets[bulletTransformIdx];
      let charIdx = 0;
      setCurrentBulletText("");
      
      const typeInterval = setInterval(() => {
        if (charIdx <= targetText.length) {
          setCurrentBulletText(targetText.slice(0, charIdx));
          charIdx++;
        } else {
          clearInterval(typeInterval);
        }
      }, 20);
      
      return () => clearInterval(typeInterval);
    }
  }, [status, bulletTransformIdx, isTransforming]);

  // ATS Score animation
  useEffect(() => {
    if (status === "ATS") {
      const targetScore = 94;
      const duration = 2000;
      const startScore = 34;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAtsScore(Math.round(startScore + (targetScore - startScore) * easeOut));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    } else if (status === "Parsing") {
      setAtsScore(34);
    }
  }, [status]);

  const lineVariants = {
    hidden: { opacity: 0, x: -24 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 * i, duration: 0.4, ease: "easeOut" },
    }),
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 6 },
    show: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: 0.06 * i, duration: 0.3 },
    }),
  };

  const ticker = useMemo(() => {
    if (status === "Parsing") return "Extracting content • Analyzing structure • Finding weak spots";
    if (status === "Writing") return "Rewriting bullets • Adding metrics • Strengthening verbs";
    if (status === "ATS") return "Matching keywords • Optimizing format • Boosting score";
    return "Applying design • Balancing whitespace • Final polish";
  }, [status]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-emerald-400";
    if (score >= 60) return "from-yellow-500 to-yellow-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className="relative mx-auto mt-6 w-full max-w-4xl">
      {/* Background glow */}
      <div className="absolute -z-10 inset-0 rounded-3xl blur-[60px] opacity-30 bg-gradient-to-r from-[oklch(0.70_0.18_270)] via-[oklch(0.65_0.20_300)] to-[oklch(0.60_0.18_220)]" />
      
      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {phases.map((phase, i) => (
          <div key={phase} className="flex items-center">
            <motion.div
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                i === step
                  ? "bg-gradient-to-r from-[oklch(0.70_0.18_270)] to-[oklch(0.60_0.20_300)] text-white"
                  : i < step
                  ? "bg-white/10 text-white/70"
                  : "bg-white/5 text-white/40"
              }`}
              animate={i === step ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {i < step && "✓ "}{phase}
            </motion.div>
            {i < phases.length - 1 && (
              <div className="w-8 h-px mx-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-[oklch(0.70_0.18_270)] to-[oklch(0.60_0.20_300)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  style={{ transformOrigin: "left" }}
                />
                <div className="h-full bg-white/10 -mt-px" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-3xl p-6 overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex gap-6">
          {/* Left Sidebar - Activity Feed */}
          <aside className="hidden md:flex w-52 flex-col">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[oklch(0.70_0.18_270)] to-[oklch(0.65_0.20_300)] flex items-center justify-center"
                animate={{ rotate: [0, 6, 0, -6, 0], y: [0, -4, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-lg">🤖</span>
              </motion.div>
              <div>
                <div className="text-xs text-white/80 font-medium">AI Engine</div>
                <div className="text-[10px] text-white/50">Processing...</div>
              </div>
            </div>

            {/* Problem Detection */}
            <div className="mb-4">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Issues Found</div>
              <div className="space-y-1.5">
                {weakPhrases.slice(0, 3).map((phrase, i) => (
                  <motion.div
                    key={phrase}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: status === "Parsing" ? [0.5, 1, 0.5] : 0.6,
                      x: 0 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <span className="text-red-400 text-[10px]">✗</span>
                    <span className="text-[10px] text-red-300/80 line-through">{phrase}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Improvements Applied */}
            <div className="mb-4">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Improvements</div>
              <div className="space-y-1.5">
                {strongPhrases.slice(0, 3).map((phrase, i) => (
                  <motion.div
                    key={phrase}
                    className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: status === "Writing" || status === "ATS" ? 1 : 0.4,
                      x: 0 
                    }}
                    transition={{ duration: 0.3, delay: i * 0.15 }}
                  >
                    <span className="text-emerald-400 text-[10px]">✓</span>
                    <span className="text-[10px] text-emerald-300/80">{phrase}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="flex-1">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Live Activity</div>
              <div className="space-y-1">
                {feed.slice(0, 4).map((_, i) => {
                  const item = feed[(feedIdx + i) % feed.length];
                  const isActive = i === 0;
                  return (
                    <motion.div
                      key={`${feedIdx}-${i}`}
                      className={`px-2 py-1.5 rounded text-[10px] border ${
                        isActive 
                          ? "bg-[oklch(0.70_0.18_270)]/10 border-[oklch(0.70_0.18_270)]/30 text-white/90"
                          : "bg-white/5 border-white/10 text-white/60"
                      }`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      {item}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content - Resume Preview */}
          <main className="flex-1 space-y-4">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-[oklch(0.70_0.18_270)] to-[oklch(0.60_0.20_300)] flex items-center justify-center text-lg font-bold text-white"
                  animate={{ 
                    scale: status === "Parsing" ? [1, 1.05, 1] : 1,
                    boxShadow: status === "Styling" 
                      ? ["0 0 0 0 rgba(139,92,246,0)", "0 0 20px 4px rgba(139,92,246,0.3)", "0 0 0 0 rgba(139,92,246,0)"]
                      : "none"
                  }} 
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  JD
                </motion.div>
                <div className="flex-1">
                  <motion.div 
                    className="text-white font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    John Developer
                  </motion.div>
                  <motion.div 
                    className="text-sm text-[oklch(0.70_0.18_270)]"
                    animate={{ opacity: status !== "Parsing" ? 1 : 0.5 }}
                  >
                    Senior Software Engineer
                  </motion.div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {["john@email.com", "(555) 123-4567", "San Francisco, CA", "linkedin.com/in/john"].map((t, i) => (
                  <motion.div 
                    key={t} 
                    className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-white/70"
                    custom={i}
                    variants={chipVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {t}
                  </motion.div>
                ))}
              </div>

              {/* AI Prompt Composer */}
              <div className="mt-3">
                <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5">AI Prompt</div>
                <div className="relative rounded-lg bg-white/5 border border-white/10 p-2.5 overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[oklch(0.70_0.18_270)]/5 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="text-[oklch(0.70_0.18_270)]">→</span>
                    <span className="text-xs text-white/80 font-mono">
                      {typed}
                      <motion.span
                        className="inline-block w-[2px] h-[14px] bg-white/80 ml-0.5 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Section with Live Transformation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60 uppercase tracking-wider font-medium">Experience</div>
                {status === "Writing" && (
                  <motion.div
                    className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ✨ Enhancing...
                  </motion.div>
                )}
              </div>

              {/* Experience Cards */}
              {[0, 1].map((cardIdx) => (
                <div 
                  key={cardIdx} 
                  className="rounded-lg bg-white/[0.03] border border-white/10 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px]"
                        animate={{ opacity: status === "Styling" ? [0.7, 1, 0.7] : 0.7 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {cardIdx === 0 ? "🏢" : "🚀"}
                      </motion.div>
                      <div>
                        <div className="text-xs text-white/90 font-medium">
                          {cardIdx === 0 ? "Tech Corp Inc." : "StartupXYZ"}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {cardIdx === 0 ? "Lead Engineer" : "Software Engineer"}
                        </div>
                      </div>
                    </div>
                    <motion.div 
                      className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-white/60"
                      animate={{ opacity: status === "Styling" ? [0.7, 1, 0.7] : 0.7 }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      {cardIdx === 0 ? "2021 — Present" : "2018 — 2021"}
                    </motion.div>
                  </div>

                  {/* Bullet Points with Transformation */}
                  <div className="space-y-2 pl-1">
                    {[0, 1, 2].map((bulletIdx) => {
                      const globalIdx = cardIdx * 3 + bulletIdx;
                      const isCurrentlyTransforming = status === "Writing" && bulletTransformIdx === bulletIdx && cardIdx === 0;
                      const isTransformed = status === "Writing" ? bulletIdx < bulletTransformIdx || cardIdx > 0 : status !== "Parsing";
                      
                      return (
                        <motion.div 
                          key={bulletIdx} 
                          className="flex items-start gap-2"
                          animate={{
                            borderColor: isCurrentlyTransforming 
                              ? "rgba(139, 92, 246, 0.5)" 
                              : "transparent"
                          }}
                        >
                          <motion.div 
                            className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.18_270)] flex-shrink-0"
                            animate={{ 
                              scale: isCurrentlyTransforming ? [1, 1.5, 1] : 1,
                              boxShadow: isCurrentlyTransforming 
                                ? ["0 0 0 0 rgba(139,92,246,0.4)", "0 0 0 6px rgba(139,92,246,0)", "0 0 0 0 rgba(139,92,246,0)"]
                                : "none"
                            }}
                            transition={{ duration: 0.8, repeat: isCurrentlyTransforming ? Infinity : 0 }}
                          />
                          <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait">
                              {isCurrentlyTransforming ? (
                                <motion.div
                                  key="transforming"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="space-y-1"
                                >
                                  <div className="text-[11px] text-white/30 line-through">
                                    {beforeBullets[globalIdx % beforeBullets.length]}
                                  </div>
                                  <div className="text-[11px] text-emerald-400 leading-relaxed">
                                    {currentBulletText}
                                    <motion.span
                                      className="inline-block w-[2px] h-[12px] bg-emerald-400 ml-0.5 align-middle"
                                      animate={{ opacity: [1, 0] }}
                                      transition={{ duration: 0.4, repeat: Infinity }}
                                    />
                                  </div>
                                </motion.div>
                              ) : isTransformed ? (
                                <motion.div
                                  key="transformed"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-[11px] text-white/80 leading-relaxed"
                                >
                                  {afterBullets[globalIdx % afterBullets.length]}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="original"
                                  className="text-[11px] text-white/50 leading-relaxed"
                                >
                                  {beforeBullets[globalIdx % beforeBullets.length]}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          {/* Transformation indicator */}
                          {isCurrentlyTransforming && (
                            <motion.div
                              className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex-shrink-0"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              rewriting
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60 uppercase tracking-wider font-medium">Skills</div>
                {status === "ATS" && (
                  <motion.div
                    className="text-[10px] text-emerald-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    4/6 keywords matched ✓
                  </motion.div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "TypeScript", matched: true },
                  { name: "React", matched: true },
                  { name: "Node.js", matched: true },
                  { name: "AWS", matched: true },
                  { name: "Python", matched: false },
                  { name: "GraphQL", matched: false },
                ].map((skill, i) => (
                  <motion.div 
                    key={skill.name}
                    className={`px-3 py-1 rounded-lg border text-xs transition-all duration-300 ${
                      status === "Styling" 
                        ? "bg-gradient-to-r from-[oklch(0.70_0.18_270)] to-[oklch(0.60_0.20_300)] border-transparent text-white/90"
                        : status === "ATS" && skill.matched
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : status === "ATS" && !skill.matched
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400/70"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                    custom={i}
                    variants={chipVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {status === "ATS" && skill.matched && <span className="mr-1">✓</span>}
                    {skill.name}
                  </motion.div>
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar - Analytics */}
          <aside className="hidden lg:flex w-56 flex-col gap-3">
            {/* ATS Score Card */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">ATS Score</span>
                <motion.span 
                  className={`text-lg font-bold ${getScoreColor(atsScore)}`}
                  key={atsScore}
                >
                  {atsScore}%
                </motion.span>
              </div>
              
              {/* Score Bar */}
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(atsScore)}`}
                  animate={{ width: `${atsScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Score Breakdown */}
              <div className="space-y-2 pt-1">
                {[
                  { label: "Keywords", value: status === "ATS" || status === "Styling" ? 92 : 34, icon: "🔑" },
                  { label: "Impact", value: status !== "Parsing" ? 88 : 28, icon: "💪" },
                  { label: "Format", value: status === "Styling" ? 100 : 76, icon: "📄" },
                ].map((metric, i) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-white/50">{metric.icon} {metric.label}</span>
                      <span className={`${metric.value >= 80 ? "text-emerald-400" : metric.value >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {metric.value}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          metric.value >= 80 ? "from-emerald-500 to-emerald-400" 
                          : metric.value >= 60 ? "from-yellow-500 to-yellow-400" 
                          : "from-red-500 to-red-400"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Transformation</div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-[9px] text-red-400/70 uppercase mb-1">Before</div>
                  <div className="text-[10px] text-white/50 line-through leading-relaxed">
                    "Worked on various frontend projects"
                  </div>
                </div>
                <motion.div 
                  className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20"
                  animate={{ 
                    opacity: status !== "Parsing" ? 1 : 0.5,
                    scale: status === "Writing" ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 1.5, repeat: status === "Writing" ? Infinity : 0 }}
                >
                  <div className="text-[9px] text-emerald-400/70 uppercase mb-1">After</div>
                  <div className="text-[10px] text-emerald-300 leading-relaxed">
                    "Architected React library used by 12 teams, reducing dev time by 40%"
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Template Preview */}
            <motion.div 
              className="rounded-xl bg-white/5 border border-white/10 p-3"
              animate={{ opacity: status === "Styling" ? 1 : 0.6 }}
            >
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Template</div>
              <div className="grid grid-cols-2 gap-1.5">
                {["Modern", "Classic", "Creative", "Minimal"].map((template, i) => (
                  <motion.div
                    key={template}
                    className={`h-8 rounded flex items-center justify-center text-[9px] ${
                      i === 0 && status === "Styling"
                        ? "bg-gradient-to-r from-[oklch(0.70_0.18_270)] to-[oklch(0.60_0.20_300)] text-white"
                        : "bg-white/10 text-white/50"
                    }`}
                    animate={i === 0 && status === "Styling" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {template}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="h-10 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-sm text-white/80">{ticker}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">{status}</span>
              <span className="text-xs text-white/30">|</span>
              <span className="text-xs text-emerald-400">{Math.round((step + 1) / phases.length * 100)}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-[oklch(0.70_0.18_270)] via-[oklch(0.65_0.20_300)] to-[oklch(0.60_0.20_300)]"
              key={status + "bar"}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}