// Template Engine - Generates world-class HTML resumes from user data
// Each template is a self-contained HTML document with embedded CSS + Google Fonts

export type TemplateId = 'executive-dark' | 'aurora-split' | 'minimal-luxe' | 'bold-contrast' | 'nordic-frost' | 'creative-coral' | 'tech-terminal' | 'gradient-pro' | 'neo-brutalism' | 'editorial-chic' | 'aurora-glass';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
  preview: string; // emoji or icon
}


// ═══════════════════════════════════════════════════
// TEMPLATE 9: NEO BRUTALISM
// Thick borders, bright yellow, high contrast
// ═══════════════════════════════════════════════════
function neoBrutalismTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Driven and disruptive professional creating high-impact solutions.';
  const skills = skillTags(d.skills || 'Strategy, Innovation, Execution');

  const contactLine = [email, phone, location].filter(Boolean).map(c => esc(c!)).join(' &bull; ');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="exp-block"><h3>' + esc(exp.jobTitle) + ' @ ' + esc(exp.company) + '</h3><div class="exp-date">' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</div>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-block"><h3>' + esc(edu.degree) + '</h3><p>' + esc(edu.institution) + (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</p></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk',sans-serif;background:#fef3c7;display:flex;justify-content:center;padding:40px 20px;color:#000}
.resume{width:794px;min-height:1123px;background:#fef3c7;position:relative;display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:30px}
.box{background:#fff;border:4px solid #000;box-shadow:6px 6px 0px #000;padding:25px}
.header{grid-column:1 / -1}
.header h1{font-size:46px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;margin-bottom:10px;line-height:1}
.contact{font-weight:700;font-size:13px;display:flex;gap:15px;flex-wrap:wrap}
.summary-box{background:#3b82f6;color:#fff}
.skills-box{background:#ef4444;color:#fff}
h2{font-size:22px;font-weight:900;text-transform:uppercase;border-bottom:4px solid currentColor;padding-bottom:5px;margin-bottom:20px}
.summary-box p{font-size:14px;font-weight:700;line-height:1.6}
.exp-block{margin-bottom:25px}
.exp-block h3{font-size:16px;font-weight:900;margin-bottom:5px}
.exp-date{display:inline-block;border:2px solid #000;padding:2px 8px;font-size:12px;font-weight:700;margin-bottom:10px;background:#fff;color:#000}
.exp-block ul{padding-left:20px}
.exp-block li{font-weight:700;font-size:12px;margin-bottom:6px;line-height:1.5}
.skill-tags{display:flex;flex-wrap:wrap;gap:8px}
.skill-tags span{border:2px solid #fff;background:rgba(255,255,255,0.2);padding:5px 12px;font-weight:900;font-size:12px}
.edu-block{margin-bottom:20px}
.edu-block h3{font-size:16px;font-weight:900}
.edu-block p{font-weight:700;font-size:12px}
@media print{body{padding:0;background:#fef3c7}}
</style></head><body><div class="resume"><div class="box header"><h1>${name}</h1><div class="contact">${contactLine}</div></div><div class="box summary-box"><h2>Summary</h2><p>${summary}</p></div><div class="box skills-box"><h2>Skills</h2><div class="skill-tags">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div><div class="box"><h2>Experience</h2>${expHTML}</div><div class="box"><h2>Education</h2>${eduHTML}</div></div></body></html>`;
}

// ═══════════════════════════════════════════════════
// TEMPLATE 10: EDITORIAL CHIC
// High-fashion magazine style, giant serif fonts
// ═══════════════════════════════════════════════════
function editorialChicTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Elegant and articulate professional.';
  const skills = skillTags(d.skills || 'Creative Direction, Strategy');

  const contactLine = [email, phone, location].filter(Boolean).map(c => esc(c!)).join('&nbsp;&nbsp;&mdash;&nbsp;&nbsp;');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="item"><div class="item-title">' + esc(exp.jobTitle) + '</div><div class="item-sub">' + esc(exp.company) + ' | ' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</div>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="item"><div class="item-title">' + esc(edu.degree) + '</div><div class="item-sub">' + esc(edu.institution) + (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</div></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#e5e7eb;display:flex;justify-content:center;padding:40px 20px;color:#4b5563}
.resume{width:794px;min-height:1123px;background:#fff;padding:60px 50px;box-shadow:0 10px 30px rgba(0,0,0,0.1)}
.header{text-align:center;margin-bottom:40px}
.header h1{font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:700;color:#111827;letter-spacing:-1px;line-height:1}
.contact-line{border-top:1px solid #111827;border-bottom:1px solid #111827;padding:12px 0;margin:25px 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#111827}
.summary{font-family:'Cormorant Garamond',serif;font-size:20px;line-height:1.6;text-align:center;color:#111827;max-width:650px;margin:0 auto 50px;font-style:italic}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:50px}
h2{font-family:'Cormorant Garamond',serif;font-size:26px;color:#111827;margin-bottom:20px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
.item{margin-bottom:25px}
.item-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#111827;margin-bottom:4px}
.item-sub{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px}
ul{padding-left:18px}
li{font-size:12px;line-height:1.6;margin-bottom:6px}
.skills{list-style:none;padding:0}
.skills li{font-size:13px;border-bottom:1px solid #f3f4f6;padding-bottom:5px;margin-bottom:8px}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="header"><h1>${name}</h1><div class="contact-line">${contactLine}</div><div class="summary">${summary}</div></div><div class="grid"><div><h2>Experience</h2>${expHTML}</div><div><h2>Education</h2>${eduHTML}<h2 style="margin-top:40px">Expertise</h2><ul class="skills">${skills.map(s => '<li>' + esc(s) + '</li>').join('')}</ul></div></div></div></body></html>`;
}

// ═══════════════════════════════════════════════════
// TEMPLATE 11: AURORA GLASS
// Glassmorphism, beautiful gradients, modern
// ═══════════════════════════════════════════════════
function auroraGlassTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Innovative professional.';
  const skills = skillTags(d.skills || 'Design, Engineering');

  const contactLine = [email, phone, location].filter(Boolean).map(c => esc(c!)).join('&nbsp;&nbsp;&bull;&nbsp;&nbsp;');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="item"><div class="item-title">' + esc(exp.jobTitle) + ' <span>@ ' + esc(exp.company) + '</span></div><div class="item-date">' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</div>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="item"><div class="item-title">' + esc(edu.degree) + '</div><div class="item-sub">' + esc(edu.institution) + (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</div></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',sans-serif;background:#0f172a;display:flex;justify-content:center;padding:40px 20px;color:#334155}
.resume{width:794px;min-height:1123px;background:linear-gradient(135deg,#f0fdfa,#fdf4ff,#eff6ff);padding:35px;display:grid;grid-template-columns:1fr 280px;gap:20px;box-shadow:0 15px 40px rgba(0,0,0,0.2)}
.glass{background:rgba(255,255,255,0.6);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.8);border-radius:20px;padding:25px;box-shadow:0 8px 32px rgba(30,27,75,0.04)}
.header{grid-column:1 / -1;text-align:center}
.header h1{font-size:42px;color:#1e1b4b;margin-bottom:10px;letter-spacing:-0.5px}
.contact{font-size:12px;font-weight:500;color:#8b5cf6}
h2{font-size:18px;color:#1e1b4b;margin-bottom:15px;display:flex;align-items:center;gap:10px}
h2::after{content:'';flex:1;height:2px;background:linear-gradient(90deg,#8b5cf6,transparent);opacity:0.2;border-radius:2px}
.summary-box{grid-column:1 / -1;font-size:14px;line-height:1.6}
.item{margin-bottom:20px}
.item-title{font-size:16px;font-weight:600;color:#1e1b4b;margin-bottom:4px}
.item-title span{color:#8b5cf6;font-weight:500}
.item-date,.item-sub{font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
ul{padding-left:18px}
li{font-size:13px;line-height:1.6;margin-bottom:6px}
.skill-tags{display:flex;flex-wrap:wrap;gap:8px}
.skill-tags span{background:rgba(139,92,246,0.1);color:#8b5cf6;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:600;border:1px solid rgba(139,92,246,0.2)}
.col-right{display:flex;flex-direction:column;gap:20px}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="glass header"><h1>${name}</h1><div class="contact">${contactLine}</div></div><div class="glass summary-box"><h2>Summary</h2><p>${summary}</p></div><div class="glass"><h2>Experience</h2>${expHTML}</div><div class="col-right"><div class="glass"><h2>Expertise</h2><div class="skill-tags">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div><div class="glass"><h2>Education</h2>${eduHTML}</div></div></div></body></html>`;
}

export const TEMPLATES: TemplateConfig[] = [
  { id: 'executive-dark', name: 'Executive Dark', description: 'Dark sidebar with amber glow accents & timeline', accent: '#f59e0b', preview: '🌙' },
  { id: 'aurora-split', name: 'Aurora Split', description: 'Deep navy with violet-cyan aurora gradients', accent: '#8b5cf6', preview: '🌌' },
  { id: 'minimal-luxe', name: 'Minimal Luxe', description: 'Clean white with emerald accents & modern type', accent: '#059669', preview: '✨' },
  { id: 'bold-contrast', name: 'Bold Contrast', description: 'Stark black & white with red-orange highlights', accent: '#ef4444', preview: '🔥' },
  { id: 'nordic-frost', name: 'Nordic Frost', description: 'Ultra-minimal white with steel blue accents', accent: '#4a6fa5', preview: '❄️' },
  { id: 'creative-coral', name: 'Creative Coral', description: 'Playful indigo header with coral accent cards', accent: '#f97066', preview: '🎨' },
  { id: 'tech-terminal', name: 'Tech Terminal', description: 'Dark terminal theme with neon green accents', accent: '#34d399', preview: '💻' },
  { id: 'gradient-pro', name: 'Gradient Pro', description: 'Purple gradient header with modern rounded cards', accent: '#7c3aed', preview: '🟣' },
  { id: 'neo-brutalism', name: 'Neo Brutalism', description: 'High contrast with thick borders and vibrant yellow accents', accent: '#fbbf24', preview: '⚡' },
  { id: 'editorial-chic', name: 'Editorial Chic', description: 'High-fashion magazine layout with dramatic serif typography', accent: '#111827', preview: '📰' },
  { id: 'aurora-glass', name: 'Aurora Glass', description: 'Modern glassmorphism with soft ambient gradients', accent: '#8b5cf6', preview: '🪞' },
];

interface ResumeInput {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
    location: string;
  };
  summary?: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrentRole?: boolean;
    responsibilities: string | string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationDate?: string;
    status?: string;
  }>;
  skills: string | string[];
  additional?: {
    certifications?: string;
    projects?: string;
    languages?: string;
  };
}

// Helper: escape HTML
function esc(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Helper: split responsibilities into bullet items
function bullets(text: string | string[] | undefined | null): string[] {
  if (Array.isArray(text)) {
    return text.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(text || "").split(/\n|;/).map((s) => s.trim()).filter(Boolean);
}

// Helper: split skills into tags
function skillTags(skills: string | string[] | undefined | null): string[] {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(skills || "").split(/,|;|\n/).map((s) => s.trim()).filter(Boolean);
}

// Helper: calculate years of experience
function yearsOfExp(experience: ResumeInput['experience']): number {
  if (!experience.length) return 0;
  const dates = experience.map(e => {
    const year = parseInt(String(e.startDate || "").replace(/\D/g, '').slice(0, 4));
    return isNaN(year) ? new Date().getFullYear() : year;
  });
  const earliest = Math.min(...dates);
  return new Date().getFullYear() - earliest;
}

export function generateTemplate(data: ResumeInput, templateId: TemplateId = 'executive-dark'): string {
  switch (templateId) {
    case 'executive-dark': return executiveDarkTemplate(data);
    case 'aurora-split': return auroraSplitTemplate(data);
    case 'minimal-luxe': return minimalLuxeTemplate(data);
    case 'bold-contrast': return boldContrastTemplate(data);
    case 'nordic-frost': return nordicFrostTemplate(data);
    case 'creative-coral': return creativeCoralTemplate(data);
    case 'tech-terminal': return techTerminalTemplate(data);
    case 'gradient-pro': return gradientProTemplate(data);
    case 'neo-brutalism': return neoBrutalismTemplate(data);
    case 'editorial-chic': return editorialChicTemplate(data);
    case 'aurora-glass': return auroraGlassTemplate(data);
    default: return executiveDarkTemplate(data);
  }
}

// ═══════════════════════════════════════════════════
// TEMPLATE 1: EXECUTIVE DARK
// Dark sidebar, amber glow, timeline, stat boxes
// ═══════════════════════════════════════════════════
function executiveDarkTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const linkedin = esc(d.personalInfo.linkedin);
  const portfolio = esc(d.personalInfo.portfolio);
  const summary = esc(d.summary) || 'Experienced professional with a proven track record of delivering exceptional results. Passionate about leveraging expertise to drive growth and create meaningful impact.';
  const skills = skillTags(d.skills || 'Leadership, Communication, Strategic Planning');
  const yrs = yearsOfExp(d.experience);

  const contactItems = [
    { icon: '&#128222;', text: phone },
    { icon: '&#9993;', text: email },
    { icon: '&#128205;', text: location },
    ...(linkedin ? [{ icon: '&#128279;', text: 'LinkedIn' }] : []),
    ...(portfolio ? [{ icon: '&#127760;', text: 'Portfolio' }] : []),
  ];

  const expHTML = d.experience.map((exp) => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="timeline-entry">' +
      '<div class="timeline-dot"></div>' +
      '<div class="timeline-top">' +
        '<div>' +
          '<div class="timeline-company">' + esc(exp.company) + '</div>' +
          '<div class="timeline-role">' + esc(exp.jobTitle) + '</div>' +
        '</div>' +
        '<span class="timeline-date">' + esc(exp.startDate) + ' &#8212; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</span>' +
      '</div>' +
      (bItems.length ? '<ul class="timeline-bullets">' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') +
    '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-card">' +
      '<h4>' + esc(edu.degree) + '</h4>' +
      '<p>' + esc(edu.institution) + (edu.fieldOfStudy ? ' &mdash; ' + esc(edu.fieldOfStudy) : '') +
      (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</p>' +
    '</div>'
  ).join('');

  const certsHTML = d.additional?.certifications ? '<div class="sidebar-section"><div class="sidebar-title">Certifications</div><div class="tags-container">' +
    skillTags(d.additional.certifications).map(c => '<span class="tag">' + esc(c) + '</span>').join('') + '</div></div>' : '';
  const langsHTML = d.additional?.languages ? '<div class="sidebar-section"><div class="sidebar-title">Languages</div><div class="tags-container">' +
    skillTags(d.additional.languages).map(l => '<span class="tag">' + esc(l) + '</span>').join('') + '</div></div>' : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>
:root{--bg-deep:#0a0b10;--bg-sidebar:#0f1016;--accent:#f59e0b;--accent-bright:#fbbf24;--accent-dark:#d97706;--text-white:#ffffff;--text-light:#e5e7eb;--text-muted:#9ca3af;--text-dim:#6b7280}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#1f2028;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:var(--bg-deep);display:flex;position:relative;box-shadow:0 25px 80px rgba(0,0,0,0.5)}
.resume::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 600px 500px at 100% 0%,rgba(245,158,11,0.15) 0%,transparent 60%),radial-gradient(ellipse 500px 600px at 0% 100%,rgba(217,119,6,0.12) 0%,transparent 60%),radial-gradient(ellipse 400px 400px at 80% 60%,rgba(251,191,36,0.08) 0%,transparent 50%);pointer-events:none;z-index:1}
.sidebar{width:35%;background:var(--bg-sidebar);padding:45px 28px;position:relative;z-index:2;display:flex;flex-direction:column}
.sidebar::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--accent),var(--accent-bright),var(--accent))}
.profile-block{text-align:center;margin-bottom:35px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,0.06)}
.profile-icon{width:70px;height:70px;margin:0 auto 18px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(245,158,11,0.3),inset 0 1px 0 rgba(255,255,255,0.2);font-size:32px;color:#000}
.profile-name{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:var(--text-white);letter-spacing:2px;text-transform:uppercase}
.profile-tagline{font-size:11px;color:var(--accent);margin-top:4px;letter-spacing:1px}
.sidebar-section{margin-bottom:28px}
.sidebar-title{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--accent);margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(245,158,11,0.2)}
.contact-list{list-style:none}
.contact-list li{display:flex;align-items:center;gap:12px;margin-bottom:14px;font-size:12px;color:var(--text-light)}
.contact-icon{width:32px;height:32px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.tags-container{display:flex;flex-wrap:wrap;gap:6px}
.tag{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:6px 11px;border-radius:6px;font-size:10px;color:var(--text-light);font-weight:500}
.edu-card{background:rgba(255,255,255,0.02);border-left:3px solid var(--accent);padding:14px;border-radius:0 8px 8px 0;margin-bottom:12px}
.edu-card h4{font-size:12px;font-weight:600;color:var(--text-white);margin-bottom:4px}
.edu-card p{font-size:10px;color:var(--text-muted);line-height:1.5}
.sidebar-footer{margin-top:auto;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);font-size:10px;color:var(--text-dim);text-align:center}
.main{width:65%;padding:45px 40px;position:relative;z-index:2;display:flex;flex-direction:column}
.main-header{margin-bottom:30px;padding-bottom:25px;border-bottom:1px solid rgba(255,255,255,0.06)}
.main-header h1{font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:800;letter-spacing:-2px;line-height:1;color:var(--text-white);margin-bottom:8px}
.main-header .role{font-size:14px;font-weight:600;color:var(--accent);letter-spacing:3px;text-transform:uppercase}
.stats-row{display:flex;gap:15px;margin-bottom:28px}
.stat-box{flex:1;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:12px;padding:16px 14px;text-align:center}
.stat-number{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:var(--accent);line-height:1}
.stat-label{font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-top:5px}
.section-heading{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.section-number{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:var(--accent)}
.section-heading h2{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:var(--text-white)}
.section-heading::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(245,158,11,0.3),transparent)}
.summary-text{font-size:13px;line-height:1.7;color:var(--text-muted);margin-bottom:28px}
.timeline{position:relative;padding-left:24px;margin-bottom:25px}
.timeline::before{content:'';position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,var(--accent),rgba(245,158,11,0.1));border-radius:2px}
.timeline-entry{position:relative;margin-bottom:24px}
.timeline-entry:last-child{margin-bottom:0}
.timeline-dot{position:absolute;left:-24px;top:6px;width:12px;height:12px;background:var(--bg-deep);border:2px solid var(--accent);border-radius:50%;z-index:2}
.timeline-entry:first-child .timeline-dot{background:var(--accent);box-shadow:0 0 12px rgba(245,158,11,0.5)}
.timeline-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;flex-wrap:wrap;gap:8px}
.timeline-company{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:var(--text-white)}
.timeline-role{font-size:12px;color:var(--accent);font-weight:500}
.timeline-date{font-size:11px;font-weight:600;color:var(--text-dim);background:rgba(255,255,255,0.04);padding:4px 12px;border-radius:20px;white-space:nowrap}
.timeline-bullets{list-style:none;margin-top:8px}
.timeline-bullets li{position:relative;padding-left:16px;margin-bottom:6px;font-size:11px;color:var(--text-muted);line-height:1.5}
.timeline-bullets li::before{content:'\\25B8';position:absolute;left:0;color:var(--accent);font-size:10px}
.main-footer{margin-top:auto;background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.04));border:1px solid rgba(245,158,11,0.2);border-radius:14px;padding:22px 24px;display:flex;justify-content:space-between;align-items:center}
.footer-text h3{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:var(--text-white);margin-bottom:4px}
.footer-text p{font-size:11px;color:var(--text-muted)}
.footer-contact{text-align:right}
.footer-contact div{font-size:12px;font-weight:600;color:var(--text-light);margin-bottom:4px}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume" id="resume"><aside class="sidebar"><div class="profile-block"><div class="profile-icon">&#128161;</div><div class="profile-name">${name}</div><div class="profile-tagline">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div></div><div class="sidebar-section"><div class="sidebar-title">Contact Details</div><ul class="contact-list">${contactItems.map(c => '<li><span class="contact-icon">' + c.icon + '</span><span>' + c.text + '</span></li>').join('')}</ul></div><div class="sidebar-section"><div class="sidebar-title">Core Competencies</div><div class="tags-container">${skills.map(s => '<span class="tag">' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="sidebar-section"><div class="sidebar-title">Education</div>' + eduHTML + '</div>' : ''}${certsHTML}${langsHTML}<div class="sidebar-footer">References available upon request</div></aside><main class="main"><header class="main-header"><h1>${name}</h1><div class="role">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div></header><div class="stats-row"><div class="stat-box"><div class="stat-number">${yrs || '5'}+</div><div class="stat-label">Years Experience</div></div><div class="stat-box"><div class="stat-number">${d.experience.length || 1}</div><div class="stat-label">Companies</div></div><div class="stat-box"><div class="stat-number">${skills.length}</div><div class="stat-label">Core Skills</div></div></div><div class="section-heading"><span class="section-number">01</span><h2>Professional Summary</h2></div><p class="summary-text">${summary}</p><div class="section-heading"><span class="section-number">02</span><h2>Career Journey</h2></div><div class="timeline">${expHTML || '<div class="timeline-entry"><div class="timeline-dot"></div><div class="timeline-top"><div><div class="timeline-company">Your Company</div><div class="timeline-role">Your Role</div></div><span class="timeline-date">2020 &#8212; Present</span></div></div>'}</div><div class="main-footer"><div class="footer-text"><h3>Let\'s Connect</h3><p>Open to new opportunities</p></div><div class="footer-contact"><div>${phone}</div><div>${email}</div></div></div></main></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 2: AURORA SPLIT
// Deep navy, violet-cyan split design, modern cards
// ═══════════════════════════════════════════════════
function auroraSplitTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Dynamic professional with extensive experience driving innovation and delivering measurable results across diverse industries.';
  const skills = skillTags(d.skills || 'Strategy, Innovation, Leadership');
  yearsOfExp(d.experience);

  const contactLine = [email, phone, location, d.personalInfo.linkedin, d.personalInfo.portfolio].filter(Boolean).map(c => esc(c!)).join('&nbsp;&nbsp;&#183;&nbsp;&nbsp;');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="exp-card"><div class="exp-header"><div><h3>' + esc(exp.jobTitle) + '</h3><span class="exp-company">' + esc(exp.company) + '</span></div><span class="exp-date">' + esc(exp.startDate) + ' &#8212; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</span></div>' +
      (bItems.length ? '<ul class="exp-bullets">' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-item"><h4>' + esc(edu.degree) + '</h4><p>' + esc(edu.institution) + (edu.graduationDate ? ' &mdash; ' + esc(edu.graduationDate) : '') + '</p></div>'
  ).join('');

  const addSections: string[] = [];
  if (d.additional?.certifications) addSections.push('<div class="add-section"><h3>Certifications</h3><div class="add-tags">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>');
  if (d.additional?.languages) addSections.push('<div class="add-section"><h3>Languages</h3><div class="add-tags">' + skillTags(d.additional.languages).map(l => '<span>' + esc(l) + '</span>').join('') + '</div></div>');
  if (d.additional?.projects) addSections.push('<div class="add-section"><h3>Projects</h3><p class="add-text">' + esc(d.additional.projects) + '</p></div>');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0c0e1a;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#0f1120;position:relative;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,0.6)}
.resume::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 700px 500px at 0% 0%,rgba(139,92,246,0.18),transparent 60%),radial-gradient(ellipse 600px 600px at 100% 100%,rgba(6,182,212,0.15),transparent 60%),radial-gradient(ellipse 400px 300px at 50% 30%,rgba(139,92,246,0.08),transparent 50%);pointer-events:none;z-index:0}
.content{position:relative;z-index:1;padding:50px 45px}
.header{text-align:center;margin-bottom:40px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,0.06)}
.header h1{font-family:'Outfit',sans-serif;font-size:48px;font-weight:800;letter-spacing:-2px;color:#fff;margin-bottom:6px}
.header h1 span{background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.header .role{font-size:14px;font-weight:600;color:#8b5cf6;letter-spacing:4px;text-transform:uppercase;margin-bottom:14px}
.header .contact{font-size:11px;color:#6b7280;line-height:1.8}
.two-col{display:flex;gap:35px}
.col-main{flex:1.8}
.col-side{flex:1}
.section{margin-bottom:30px}
.section-title{font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#8b5cf6;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(139,92,246,0.2);display:flex;align-items:center;gap:8px}
.section-title::before{content:'';width:6px;height:6px;background:#8b5cf6;border-radius:50%;box-shadow:0 0 8px rgba(139,92,246,0.6)}
.summary{font-size:13px;line-height:1.8;color:#9ca3af}
.exp-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:18px;margin-bottom:14px}
.exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.exp-card h3{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:#fff}
.exp-company{font-size:12px;color:#06b6d4;font-weight:500}
.exp-date{font-size:10px;color:#6b7280;background:rgba(139,92,246,0.1);padding:4px 12px;border-radius:20px;font-weight:600}
.exp-bullets{list-style:none;margin-top:6px}
.exp-bullets li{position:relative;padding-left:16px;margin-bottom:5px;font-size:11px;color:#9ca3af;line-height:1.6}
.exp-bullets li::before{content:'';position:absolute;left:0;top:7px;width:5px;height:5px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:50%}
.skill-grid{display:flex;flex-wrap:wrap;gap:6px}
.skill-grid span{background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15);padding:6px 12px;border-radius:8px;font-size:10px;color:#c4b5fd;font-weight:500}
.edu-item{border-left:3px solid #06b6d4;padding:12px 14px;margin-bottom:10px;background:rgba(6,182,212,0.04);border-radius:0 8px 8px 0}
.edu-item h4{font-size:12px;font-weight:600;color:#fff;margin-bottom:3px}
.edu-item p{font-size:10px;color:#6b7280}
.add-section{margin-bottom:16px}
.add-section h3{font-size:10px;font-weight:700;color:#06b6d4;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
.add-tags{display:flex;flex-wrap:wrap;gap:5px}
.add-tags span{background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.15);padding:5px 10px;border-radius:6px;font-size:10px;color:#67e8f9}
.add-text{font-size:11px;color:#9ca3af;line-height:1.6}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="content"><header class="header"><h1>${name.split(' ').length > 1 ? esc(name.split(' ')[0]) + ' <span>' + esc(name.split(' ').slice(1).join(' ')) + '</span>' : name}</h1><div class="role">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div><div class="contact">${contactLine}</div></header><div class="two-col"><div class="col-main"><div class="section"><div class="section-title">Summary</div><p class="summary">${summary}</p></div><div class="section"><div class="section-title">Experience</div>${expHTML}</div></div><div class="col-side"><div class="section"><div class="section-title">Skills</div><div class="skill-grid">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="section"><div class="section-title">Education</div>' + eduHTML + '</div>' : ''}${addSections.join('')}</div></div></div></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 3: MINIMAL LUXE
// Clean white, emerald accents, premium typography
// ═══════════════════════════════════════════════════
function minimalLuxeTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Results-driven professional with a passion for excellence and a commitment to delivering outstanding outcomes.';
  const skills = skillTags(d.skills || 'Leadership, Strategy, Innovation');

  const contactParts = [phone, email, location, d.personalInfo.linkedin, d.personalInfo.portfolio].filter(Boolean).map(c => esc(c!));

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="exp-entry"><div class="exp-meta"><span class="exp-dates">' + esc(exp.startDate) + ' &#8212; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</span></div><div class="exp-body"><h3>' + esc(exp.jobTitle) + '</h3><p class="exp-co">' + esc(exp.company) + '</p>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div></div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-row"><span class="edu-date">' + esc(edu.graduationDate || '') + '</span><div><strong>' + esc(edu.degree) + '</strong><br/><span class="edu-inst">' + esc(edu.institution) + (edu.fieldOfStudy ? ' &mdash; ' + esc(edu.fieldOfStudy) : '') + '</span></div></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#e8e6e1;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#faf9f7;box-shadow:0 20px 60px rgba(0,0,0,0.1);overflow:hidden}
.header{padding:50px 50px 35px;border-bottom:2px solid #059669}
.header h1{font-family:'Playfair Display',serif;font-size:44px;font-weight:700;color:#111827;letter-spacing:-1px;line-height:1;margin-bottom:4px}
.header .subtitle{font-size:14px;font-weight:500;color:#059669;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
.header .contact-row{display:flex;flex-wrap:wrap;gap:16px;font-size:11px;color:#6b7280}
.header .contact-row span{display:flex;align-items:center;gap:5px}
.header .contact-row .dot{width:3px;height:3px;background:#059669;border-radius:50%}
.body-content{padding:35px 50px 50px;display:flex;gap:40px}
.col-left{flex:1.6}
.col-right{flex:1;padding-left:30px;border-left:1px solid #e5e7eb}
.sec{margin-bottom:28px}
.sec-title{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#059669;margin-bottom:14px;display:flex;align-items:center;gap:10px}
.sec-title::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#d1fae5,transparent)}
.summary-p{font-size:13px;line-height:1.8;color:#4b5563}
.exp-entry{display:flex;gap:20px;margin-bottom:22px}
.exp-meta{width:110px;flex-shrink:0}
.exp-dates{font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.5px}
.exp-body h3{font-size:15px;font-weight:700;color:#111827;margin-bottom:2px}
.exp-co{font-size:12px;color:#059669;font-weight:500;margin-bottom:8px}
.exp-body ul{list-style:none;padding:0}
.exp-body li{position:relative;padding-left:14px;margin-bottom:5px;font-size:11px;color:#6b7280;line-height:1.6}
.exp-body li::before{content:'';position:absolute;left:0;top:7px;width:4px;height:4px;background:#059669;border-radius:50%}
.skill-tags{display:flex;flex-wrap:wrap;gap:6px}
.skill-tags span{background:#ecfdf5;border:1px solid #a7f3d0;padding:5px 12px;border-radius:6px;font-size:10px;color:#065f46;font-weight:500}
.edu-row{display:flex;gap:14px;margin-bottom:14px;font-size:12px;color:#4b5563;line-height:1.5}
.edu-row strong{color:#111827;font-size:12px}
.edu-date{font-size:10px;font-weight:600;color:#9ca3af;min-width:60px;flex-shrink:0;padding-top:2px}
.edu-inst{font-size:11px;color:#6b7280}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="header"><h1>${name}</h1><div class="subtitle">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div><div class="contact-row">${contactParts.map((c, i) => (i > 0 ? '<span class="dot"></span>' : '') + '<span>' + c + '</span>').join('')}</div></div><div class="body-content"><div class="col-left"><div class="sec"><div class="sec-title">Summary</div><p class="summary-p">${summary}</p></div><div class="sec"><div class="sec-title">Experience</div>${expHTML}</div></div><div class="col-right"><div class="sec"><div class="sec-title">Skills</div><div class="skill-tags">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="sec"><div class="sec-title">Education</div>' + eduHTML + '</div>' : ''}${d.additional?.certifications ? '<div class="sec"><div class="sec-title">Certifications</div><div class="skill-tags">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>' : ''}${d.additional?.languages ? '<div class="sec"><div class="sec-title">Languages</div><div class="skill-tags">' + skillTags(d.additional.languages).map(l => '<span>' + esc(l) + '</span>').join('') + '</div></div>' : ''}</div></div></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 4: BOLD CONTRAST
// Black & white with red-orange punches, modern grid
// ═══════════════════════════════════════════════════
function boldContrastTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'High-performance leader with a relentless focus on results and a passion for building great teams.';
  const skills = skillTags(d.skills || 'Leadership, Execution, Strategy');
  const yrs = yearsOfExp(d.experience);

  const contactLine = [email, phone, location].filter(Boolean).join(' &bull; ');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="job"><div class="job-head"><div class="job-title">' + esc(exp.jobTitle) + '</div><div class="job-date">' + esc(exp.startDate) + ' &#8212; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</div></div><div class="job-company">' + esc(exp.company) + '</div>' +
      (bItems.length ? '<ul class="job-list">' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-block"><div class="edu-degree">' + esc(edu.degree) + '</div><div class="edu-school">' + esc(edu.institution) + (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</div></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#1a1a1a;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#000;color:#fff;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,0.8)}
.top-bar{height:6px;background:linear-gradient(90deg,#ef4444,#f97316,#ef4444)}
.header{padding:50px 50px 30px;position:relative}
.header::after{content:'';position:absolute;bottom:0;left:50px;right:50px;height:1px;background:linear-gradient(90deg,#ef4444,transparent 50%,#ef4444)}
.header h1{font-size:56px;font-weight:900;letter-spacing:-3px;line-height:0.95;margin-bottom:8px}
.header h1 .accent{color:#ef4444}
.header .title-role{font-size:13px;font-weight:600;color:#ef4444;letter-spacing:5px;text-transform:uppercase;margin-bottom:14px}
.header .contact-line{font-size:11px;color:#6b7280;letter-spacing:0.5px}
.metrics{display:flex;padding:25px 50px;gap:0;border-bottom:1px solid rgba(255,255,255,0.06)}
.metric{flex:1;text-align:center;padding:12px 0;border-right:1px solid rgba(255,255,255,0.06)}
.metric:last-child{border-right:none}
.metric-val{font-size:32px;font-weight:900;color:#ef4444;letter-spacing:-1px}
.metric-label{font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
.body-wrap{padding:30px 50px 50px;display:flex;gap:35px}
.main-col{flex:1.6}
.side-col{flex:1}
.sec{margin-bottom:30px}
.sec-head{font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#ef4444;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(239,68,68,0.2)}
.summary-text{font-size:13px;line-height:1.8;color:#9ca3af}
.job{margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.04)}
.job:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.job-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;flex-wrap:wrap;gap:6px}
.job-title{font-size:15px;font-weight:700;color:#fff}
.job-date{font-size:10px;color:#6b7280;font-weight:600}
.job-company{font-size:12px;color:#ef4444;font-weight:500;margin-bottom:10px}
.job-list{list-style:none;padding:0}
.job-list li{position:relative;padding-left:16px;margin-bottom:5px;font-size:11px;color:#9ca3af;line-height:1.6}
.job-list li::before{content:'';position:absolute;left:0;top:7px;width:6px;height:2px;background:#ef4444;border-radius:1px}
.skill-wrap{display:flex;flex-wrap:wrap;gap:6px}
.skill-wrap span{padding:6px 14px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);border-radius:6px;font-size:10px;color:#fca5a5;font-weight:500}
.edu-block{margin-bottom:14px}
.edu-degree{font-size:13px;font-weight:700;color:#fff}
.edu-school{font-size:11px;color:#6b7280}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="top-bar"></div><div class="header"><h1>${name.split(' ').length > 1 ? esc(name.split(' ')[0]) + ' <span class="accent">' + esc(name.split(' ').slice(1).join(' ')) + '</span>' : name}</h1><div class="title-role">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div><div class="contact-line">${contactLine}</div></div><div class="metrics"><div class="metric"><div class="metric-val">${yrs || 5}+</div><div class="metric-label">Years Exp.</div></div><div class="metric"><div class="metric-val">${d.experience.length || 1}</div><div class="metric-label">Companies</div></div><div class="metric"><div class="metric-val">${skills.length}</div><div class="metric-label">Skills</div></div></div><div class="body-wrap"><div class="main-col"><div class="sec"><div class="sec-head">Summary</div><p class="summary-text">${summary}</p></div><div class="sec"><div class="sec-head">Experience</div>${expHTML}</div></div><div class="side-col"><div class="sec"><div class="sec-head">Skills</div><div class="skill-wrap">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="sec"><div class="sec-head">Education</div>' + eduHTML + '</div>' : ''}${d.additional?.certifications ? '<div class="sec"><div class="sec-head">Certifications</div><div class="skill-wrap">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>' : ''}${d.additional?.languages ? '<div class="sec"><div class="sec-head">Languages</div><div class="skill-wrap">' + skillTags(d.additional.languages).map(l => '<span>' + esc(l) + '</span>').join('') + '</div></div>' : ''}</div></div></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 5: NORDIC FROST
// Ultra-minimal white, steel blue accents, generous space
// ═══════════════════════════════════════════════════
function nordicFrostTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Methodical professional committed to precision, clarity, and meaningful contribution across every engagement.';
  const skills = skillTags(d.skills || 'Analysis, Strategy, Communication');

  const contactParts = [phone, email, location, d.personalInfo.linkedin, d.personalInfo.portfolio].filter(Boolean).map(c => esc(c!));

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="exp"><div class="exp-left"><span class="exp-date">' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</span></div><div class="exp-right"><h3>' + esc(exp.jobTitle) + '</h3><p class="exp-co">' + esc(exp.company) + '</p>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div></div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-item"><strong>' + esc(edu.degree) + '</strong><br/><span class="edu-meta">' + esc(edu.institution) + (edu.fieldOfStudy ? ' &mdash; ' + esc(edu.fieldOfStudy) : '') + (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</span></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#e2e8f0;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#f8f9fb;box-shadow:0 15px 50px rgba(0,0,0,0.08);overflow:hidden}
.header{padding:65px 70px 40px;text-align:left}
.header h1{font-size:36px;font-weight:300;color:#1e293b;letter-spacing:2px;line-height:1.1;margin-bottom:6px}
.header .role{font-size:12px;font-weight:600;color:#4a6fa5;letter-spacing:4px;text-transform:uppercase;margin-bottom:18px}
.header .contact{display:flex;flex-wrap:wrap;gap:14px;font-size:10px;color:#94a3b8;letter-spacing:0.5px}
.header .contact span{display:flex;align-items:center;gap:4px}
.header .contact .sep{width:3px;height:3px;background:#cbd5e1;border-radius:50%}
.divider{margin:0 70px;height:1px;background:#cbd5e1}
.body{padding:35px 70px 60px;display:flex;gap:45px}
.col-main{flex:1.6}
.col-side{flex:1;padding-left:35px;border-left:1px solid #e2e8f0}
.sec{margin-bottom:30px}
.sec-title{font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#4a6fa5;margin-bottom:16px}
.summary-text{font-size:12px;line-height:1.9;color:#64748b;font-weight:300}
.exp{display:flex;gap:22px;margin-bottom:24px}
.exp-left{width:100px;flex-shrink:0}
.exp-date{font-size:10px;font-weight:500;color:#94a3b8}
.exp-right h3{font-size:14px;font-weight:600;color:#1e293b;margin-bottom:2px}
.exp-co{font-size:11px;color:#4a6fa5;font-weight:500;margin-bottom:8px}
.exp-right ul{list-style:none;padding:0}
.exp-right li{position:relative;padding-left:12px;margin-bottom:4px;font-size:11px;color:#64748b;line-height:1.7;font-weight:300}
.exp-right li::before{content:'';position:absolute;left:0;top:8px;width:3px;height:3px;background:#4a6fa5;border-radius:50%}
.skill-list{display:flex;flex-wrap:wrap;gap:6px}
.skill-list span{padding:5px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;color:#475569;font-weight:500}
.edu-item{margin-bottom:14px;font-size:12px;color:#475569;line-height:1.5}
.edu-item strong{font-weight:600;color:#1e293b}
.edu-meta{font-size:10px;color:#94a3b8}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="header"><h1>${name}</h1><div class="role">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div><div class="contact">${contactParts.map((c, i) => (i > 0 ? '<span class="sep"></span>' : '') + '<span>' + c + '</span>').join('')}</div></div><div class="divider"></div><div class="body"><div class="col-main"><div class="sec"><div class="sec-title">Summary</div><p class="summary-text">${summary}</p></div><div class="sec"><div class="sec-title">Experience</div>${expHTML}</div></div><div class="col-side"><div class="sec"><div class="sec-title">Skills</div><div class="skill-list">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="sec"><div class="sec-title">Education</div>' + eduHTML + '</div>' : ''}${d.additional?.certifications ? '<div class="sec"><div class="sec-title">Certifications</div><div class="skill-list">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>' : ''}${d.additional?.languages ? '<div class="sec"><div class="sec-title">Languages</div><div class="skill-list">' + skillTags(d.additional.languages).map(l => '<span>' + esc(l) + '</span>').join('') + '</div></div>' : ''}</div></div></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 6: CREATIVE CORAL
// Indigo header band, coral accents, playful cards
// ═══════════════════════════════════════════════════
function creativeCoralTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Creative professional who thrives on bringing bold ideas to life and crafting compelling narratives.';
  const skills = skillTags(d.skills || 'Creativity, Design Thinking, Innovation');

  const contactLine = [email, phone, location].filter(Boolean).map(c => esc(c!)).join('&nbsp;&nbsp;&#183;&nbsp;&nbsp;');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="exp-card"><div class="exp-top"><div><h3>' + esc(exp.jobTitle) + '</h3><span class="exp-company">' + esc(exp.company) + '</span></div><span class="exp-date">' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</span></div>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-card"><h4>' + esc(edu.degree) + '</h4><p>' + esc(edu.institution) + (edu.graduationDate ? ' &mdash; ' + esc(edu.graduationDate) : '') + '</p></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#f5f0ec;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#fffbfa;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08)}
.hero{background:#1e1b4b;padding:45px 50px 40px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;right:-60px;top:-60px;width:250px;height:250px;background:radial-gradient(circle,rgba(249,112,102,0.25),transparent 60%);border-radius:50%}
.hero h1{font-family:'Poppins',sans-serif;font-size:38px;font-weight:700;color:#fff;letter-spacing:-1px;line-height:1.1;margin-bottom:6px;position:relative}
.hero .role{font-size:13px;font-weight:600;color:#f97066;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;position:relative}
.hero .contact{font-size:11px;color:#c7d2fe;position:relative}
.content{padding:35px 50px 50px}
.two-col{display:flex;gap:35px}
.main-col{flex:1.7}
.side-col{flex:1}
.sec{margin-bottom:28px}
.sec-label{font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;color:#1e1b4b;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #f97066}
.summary{font-size:12px;line-height:1.8;color:#4b5563}
.exp-card{background:#fef2f2;border-radius:14px;padding:18px;margin-bottom:14px;border-left:4px solid #f97066}
.exp-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.exp-card h3{font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;color:#1e1b4b}
.exp-company{font-size:11px;color:#f97066;font-weight:500}
.exp-date{font-size:10px;color:#9ca3af;font-weight:600;background:#fff;padding:3px 10px;border-radius:20px}
.exp-card ul{list-style:none;padding:0}
.exp-card li{position:relative;padding-left:14px;margin-bottom:4px;font-size:11px;color:#4b5563;line-height:1.6}
.exp-card li::before{content:'';position:absolute;left:0;top:7px;width:5px;height:5px;background:#f97066;border-radius:50%}
.skill-grid{display:flex;flex-wrap:wrap;gap:6px}
.skill-grid span{background:#fef2f2;border:1px solid #fecaca;padding:6px 13px;border-radius:20px;font-size:10px;color:#9f1239;font-weight:500}
.edu-card{margin-bottom:12px;padding:12px 14px;border-radius:10px;background:#f8fafc}
.edu-card h4{font-size:12px;font-weight:600;color:#1e1b4b;margin-bottom:2px}
.edu-card p{font-size:10px;color:#6b7280}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="hero"><h1>${name}</h1><div class="role">${esc(d.experience[0]?.jobTitle) || 'Creative Professional'}</div><div class="contact">${contactLine}</div></div><div class="content"><div class="sec"><div class="sec-label">About Me</div><p class="summary">${summary}</p></div><div class="two-col"><div class="main-col"><div class="sec"><div class="sec-label">Experience</div>${expHTML}</div></div><div class="side-col"><div class="sec"><div class="sec-label">Skills</div><div class="skill-grid">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="sec"><div class="sec-label">Education</div>' + eduHTML + '</div>' : ''}${d.additional?.certifications ? '<div class="sec"><div class="sec-label">Certifications</div><div class="skill-grid">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>' : ''}${d.additional?.languages ? '<div class="sec"><div class="sec-label">Languages</div><div class="skill-grid">' + skillTags(d.additional.languages).map(l => '<span>' + esc(l) + '</span>').join('') + '</div></div>' : ''}</div></div></div></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 7: TECH TERMINAL
// Dark background, neon green, monospace elements
// ═══════════════════════════════════════════════════
function techTerminalTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Full-stack engineer passionate about building performant, scalable systems and open-source tools.';
  const skills = skillTags(d.skills || 'TypeScript, React, Node.js, AWS');

  const contactLine = [email, phone, location, d.personalInfo.linkedin, d.personalInfo.portfolio].filter(Boolean).map(c => esc(c!)).join('&nbsp;&nbsp;<span class="sep">|</span>&nbsp;&nbsp;');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="job"><div class="job-head"><div class="job-title">' + esc(exp.jobTitle) + ' <span class="at">@</span> ' + esc(exp.company) + '</div><div class="job-date">' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</div></div>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li><span class="prompt">&gt;</span> ' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-row"><span class="edu-label">' + esc(edu.degree) + '</span> <span class="edu-detail">' + esc(edu.institution) + (edu.graduationDate ? ' | ' + esc(edu.graduationDate) : '') + '</span></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#020617;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#0f172a;box-shadow:0 25px 80px rgba(0,0,0,0.6);overflow:hidden;position:relative}
.resume::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 500px 400px at 50% 0%,rgba(52,211,153,0.06),transparent 60%);pointer-events:none}
.top-accent{height:3px;background:linear-gradient(90deg,#34d399,#059669,#34d399)}
.header{padding:40px 45px 30px;position:relative;z-index:1}
.header h1{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:#e2e8f0;letter-spacing:-0.5px;margin-bottom:4px}
.header .role{font-family:'JetBrains Mono',monospace;font-size:12px;color:#34d399;letter-spacing:1px;margin-bottom:16px}
.header .contact{font-size:11px;color:#64748b}
.header .contact .sep{color:#334155}
.section{padding:0 45px;margin-bottom:25px;position:relative;z-index:1}
.sec-head{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#34d399;letter-spacing:1.5px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.sec-head::before{content:'//';color:#475569}
.sec-head::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#1e293b,transparent)}
.summary{font-size:12px;color:#94a3b8;line-height:1.8}
.two-col{display:flex;gap:35px;padding:0 45px 50px}
.col-main{flex:1.7}
.col-side{flex:1}
.job{margin-bottom:22px;padding:16px;background:#1e293b;border:1px solid #334155;border-radius:8px}
.job-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.job-title{font-size:14px;font-weight:600;color:#e2e8f0}
.job-title .at{color:#34d399}
.job-date{font-family:'JetBrains Mono',monospace;font-size:10px;color:#64748b}
.job ul{list-style:none;padding:0}
.job li{margin-bottom:4px;font-size:11px;color:#94a3b8;line-height:1.6;display:flex;gap:6px}
.job li .prompt{color:#34d399;font-family:'JetBrains Mono',monospace;font-size:10px;flex-shrink:0;margin-top:2px}
.skill-tags{display:flex;flex-wrap:wrap;gap:6px}
.skill-tags span{font-family:'JetBrains Mono',monospace;background:#0f172a;border:1px solid #34d399;padding:5px 12px;border-radius:4px;font-size:10px;color:#34d399;font-weight:500}
.edu-row{margin-bottom:10px;font-size:12px;color:#cbd5e1;line-height:1.5}
.edu-label{font-weight:600}
.edu-detail{color:#64748b;font-size:11px}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="top-accent"></div><div class="header"><h1>${name}</h1><div class="role">${esc(d.experience[0]?.jobTitle) || 'Software Engineer'}</div><div class="contact">${contactLine}</div></div><div class="section"><div class="sec-head">Summary</div><p class="summary">${summary}</p></div><div class="two-col"><div class="col-main"><div class="sec-head">Experience</div>${expHTML}</div><div class="col-side"><div style="margin-bottom:25px"><div class="sec-head">Tech Stack</div><div class="skill-tags">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div style="margin-bottom:25px"><div class="sec-head">Education</div>' + eduHTML + '</div>' : ''}${d.additional?.certifications ? '<div style="margin-bottom:25px"><div class="sec-head">Certifications</div><div class="skill-tags">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>' : ''}${d.additional?.projects ? '<div style="margin-bottom:25px"><div class="sec-head">Projects</div><p class="summary">' + esc(d.additional.projects) + '</p></div>' : ''}</div></div></div></body></html>`;
}


// ═══════════════════════════════════════════════════
// TEMPLATE 8: GRADIENT PRO
// Purple gradient header, rounded cards, modern feel
// ═══════════════════════════════════════════════════
function gradientProTemplate(d: ResumeInput): string {
  const name = esc(d.personalInfo.fullName) || 'Your Name';
  const email = esc(d.personalInfo.email) || 'email@example.com';
  const phone = esc(d.personalInfo.phone) || '(555) 000-0000';
  const location = esc(d.personalInfo.location) || 'City, State';
  const summary = esc(d.summary) || 'Forward-thinking professional with a passion for leveraging technology to drive business transformation and growth.';
  const skills = skillTags(d.skills || 'Strategy, Innovation, Leadership');

  const contactLine = [email, phone, location].filter(Boolean).map(c => esc(c!)).join('&nbsp;&nbsp;&#183;&nbsp;&nbsp;');

  const expHTML = d.experience.map(exp => {
    const bItems = bullets(exp.responsibilities);
    return '<div class="exp-card"><div class="exp-top"><div><h3>' + esc(exp.jobTitle) + '</h3><span class="exp-co">' + esc(exp.company) + '</span></div><span class="exp-date">' + esc(exp.startDate) + ' &mdash; ' + (exp.isCurrentRole ? 'Present' : esc(exp.endDate) || 'Present') + '</span></div>' +
      (bItems.length ? '<ul>' + bItems.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') + '</div>';
  }).join('');

  const eduHTML = d.education.map(edu =>
    '<div class="edu-item"><h4>' + esc(edu.degree) + '</h4><p>' + esc(edu.institution) + (edu.graduationDate ? ' &mdash; ' + esc(edu.graduationDate) : '') + '</p></div>'
  ).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${name} | Resume</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#ddd6fe;display:flex;justify-content:center;padding:40px 20px}
.resume{width:794px;min-height:1123px;background:#f5f3ff;box-shadow:0 20px 60px rgba(0,0,0,0.12);overflow:hidden}
.hero{background:linear-gradient(135deg,#4c1d95 0%,#6d28d9 50%,#7c3aed 100%);padding:48px 50px 42px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;right:-40px;bottom:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,0.3),transparent 60%);border-radius:50%}
.hero::after{content:'';position:absolute;left:-20px;top:-20px;width:150px;height:150px;background:radial-gradient(circle,rgba(59,130,246,0.2),transparent 60%);border-radius:50%}
.hero h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:40px;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1.1;margin-bottom:6px;position:relative;z-index:1}
.hero .role{font-size:13px;font-weight:600;color:#c4b5fd;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;position:relative;z-index:1}
.hero .contact{font-size:11px;color:#ddd6fe;position:relative;z-index:1}
.body-content{padding:35px 50px 50px;display:flex;gap:35px}
.col-main{flex:1.7}
.col-side{flex:1}
.sec{margin-bottom:28px}
.sec-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4c1d95;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #ddd6fe;display:flex;align-items:center;gap:8px}
.sec-title::before{content:'';width:6px;height:6px;background:#7c3aed;border-radius:50%}
.summary-text{font-size:12px;line-height:1.8;color:#4b5563}
.exp-card{background:#fff;border-radius:14px;padding:18px;margin-bottom:14px;box-shadow:0 2px 8px rgba(124,58,237,0.06);border:1px solid #ede9fe}
.exp-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.exp-card h3{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;color:#1e1b4b}
.exp-co{font-size:11px;color:#7c3aed;font-weight:500}
.exp-date{font-size:10px;color:#9ca3af;background:#f5f3ff;padding:3px 10px;border-radius:20px;font-weight:600}
.exp-card ul{list-style:none;padding:0}
.exp-card li{position:relative;padding-left:14px;margin-bottom:4px;font-size:11px;color:#4b5563;line-height:1.6}
.exp-card li::before{content:'';position:absolute;left:0;top:7px;width:5px;height:5px;background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:50%}
.skill-grid{display:flex;flex-wrap:wrap;gap:6px}
.skill-grid span{background:#ede9fe;border:1px solid #ddd6fe;padding:6px 13px;border-radius:8px;font-size:10px;color:#5b21b6;font-weight:500}
.edu-item{margin-bottom:12px;padding:12px 14px;border-radius:10px;background:#fff;border:1px solid #ede9fe}
.edu-item h4{font-size:12px;font-weight:600;color:#1e1b4b;margin-bottom:2px}
.edu-item p{font-size:10px;color:#6b7280}
@media print{body{padding:0;background:none}.resume{box-shadow:none}}
</style></head><body><div class="resume"><div class="hero"><h1>${name}</h1><div class="role">${esc(d.experience[0]?.jobTitle) || 'Professional'}</div><div class="contact">${contactLine}</div></div><div class="body-content"><div class="col-main"><div class="sec"><div class="sec-title">Summary</div><p class="summary-text">${summary}</p></div><div class="sec"><div class="sec-title">Experience</div>${expHTML}</div></div><div class="col-side"><div class="sec"><div class="sec-title">Skills</div><div class="skill-grid">${skills.map(s => '<span>' + esc(s) + '</span>').join('')}</div></div>${eduHTML ? '<div class="sec"><div class="sec-title">Education</div>' + eduHTML + '</div>' : ''}${d.additional?.certifications ? '<div class="sec"><div class="sec-title">Certifications</div><div class="skill-grid">' + skillTags(d.additional.certifications).map(c => '<span>' + esc(c) + '</span>').join('') + '</div></div>' : ''}${d.additional?.languages ? '<div class="sec"><div class="sec-title">Languages</div><div class="skill-grid">' + skillTags(d.additional.languages).map(l => '<span>' + esc(l) + '</span>').join('') + '</div></div>' : ''}</div></div></div></body></html>`;
}
