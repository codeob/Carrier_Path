// cvScanner.js
// Strict ATS-style CV scanner aligned with a comprehensive job categories database.
// Parses PDF/DOCX resumes, detects structure, matches role-specific keywords/skills/tools
// against job descriptions and a curated role catalog, then produces strict scores and
// role-tailored guidance for ATS consumption.

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Roles catalog: condensed but broad coverage across global categories (1–16)
// Each role contains meta fields and representative keywords/tools/skills/qualifications.
// This structure is designed to be extended with additional roles over time.
const rolesCatalog = {
  // 1. Technology & IT
  'Software Developer / Engineer': {
    roleDescription: 'Designs, codes, tests, and maintains software applications across web, desktop, or enterprise systems with agile collaboration and DevOps integration.',
    keyPoints: 'Quantify impact (e.g., reduced load time by 40%), link GitHub/portfolio, highlight remote collaboration and open-source contributions.',
    keywords: ['software development','coding','programming','debugging','agile','scrum','version control','api integration','oop','sdlc','refactoring','unit testing','ci/cd','microservices','rest','graphql','sql','nosql','javascript','typescript','python','java','c#','.net'],
    tools: ['VS Code','IntelliJ IDEA','Eclipse','Git','GitHub','GitLab','Bitbucket','Jest','JUnit','Selenium','Postman','Maven','Gradle','Jenkins','MySQL','PostgreSQL','MongoDB','AWS','Azure','Docker','Kubernetes'],
    qualifications: 'BS in CS/SE/IT; certifications like OCJP, Azure Developer Associate, AWS Developer Associate, ISTQB Foundation, CSD.',
    hardSkills: ['Algorithms','Data Structures','Software Architecture','Database Design','API Development','Containerization','Orchestration','Cloud Deployment','Secure Coding (OWASP)'],
    softSkills: ['Problem-Solving','Team Collaboration','Communication','Time Management','Adaptability']
  },
  'Frontend Developer': {
    roleDescription: 'Builds responsive, accessible user interfaces with modern JS frameworks and close UI/UX collaboration.',
    keyPoints: 'Show live demos, quantify UX impact, include A/B testing experience and accessibility (WCAG).',
    keywords: ['frontend','ui/ux','html5','css3','javascript','react','angular','vue','responsive design','bootstrap','tailwind','sass','less','webpack','babel','pwa','dom','redux','typescript','seo','accessibility'],
    tools: ['React','Next.js','Gatsby','Vite','Jest','Cypress','Figma','Adobe XD','Lighthouse'],
    qualifications: 'BSc in Web Dev/Design/CS; Google UX, freeCodeCamp Responsive Web Design, W3C Accessibility.',
    hardSkills: ['Component Architecture','CSS Grid/Flexbox','ES6+','API Consumption','Performance Auditing','SSR','Design Systems'],
    softSkills: ['User Empathy','Creativity','Communication','Attention to Detail']
  },
  'Backend Developer': {
    roleDescription: 'Develops server-side logic, APIs, and databases for secure, scalable systems.',
    keyPoints: 'Emphasize scalability/security, DB optimization, and reliability in high-traffic contexts.',
    keywords: ['backend','server-side','node.js','express','django','flask','spring boot','laravel','authentication','jwt','oauth','sql','orm','redis','queues','microservices','rest','graphql','serverless','logging','elk'],
    tools: ['Node.js','Express','Django','Spring Boot','Laravel','PostgreSQL','MySQL','MongoDB','Redis','RabbitMQ','Nginx','Apache','ELK','AWS Lambda'],
    qualifications: 'BS in CS/IS; AWS/GCP/Azure certs; CKA; Security+.',
    hardSkills: ['Query Optimization','Sharding','Event-Driven Architecture','gRPC','WebSockets','ACID Transactions','Rate Limiting','Encryption (AES)'],
    softSkills: ['Analytical Thinking','Documentation','Stakeholder Alignment']
  },
  'Full-Stack Developer': {
    roleDescription: 'End-to-end development across frontend and backend, with deployment and feedback loops.',
    keyPoints: 'Demonstrate full-cycle projects (e.g., MERN), balance FE/BE metrics, show DevOps fundamentals.',
    keywords: ['full stack','mern','mean','frontend','backend','database','deployment','integration testing','cloud-native'],
    tools: ['React','Node.js','Express','MongoDB','PostgreSQL','Docker','Kubernetes','Vercel','Netlify'],
    qualifications: 'BS CS or Full-Stack Diploma; IBM Full Stack Developer, Udacity Full-Stack.',
    hardSkills: ['Full SDLC','E2E Testing','CI/CD Pipelines','Monorepos','Jamstack'],
    softSkills: ['Holistic Thinking','Multitasking']
  },
  'DevOps Engineer': {
    roleDescription: 'Automates infrastructure and CI/CD pipelines, ensuring observability and reliability.',
    keyPoints: 'Highlight deployment acceleration, IaC, and GitOps practices with measurable outcomes.',
    keywords: ['devops','ci/cd','terraform','ansible','docker','kubernetes','linux','bash','prometheus','grafana','nginx','sre','gitops'],
    tools: ['Jenkins','GitHub Actions','Terraform','Ansible','Docker','Kubernetes','Prometheus','Grafana','ArgoCD'],
    qualifications: 'AWS DevOps Engineer, Kubernetes CKA.',
    hardSkills: ['Blue-Green Deploys','Chaos Engineering','Observability','FinOps'],
    softSkills: ['Automation Mindset','Collaboration']
  },
  'Data Scientist': {
    roleDescription: 'Builds ML/statistical models to derive insights and predictions from data.',
    keyPoints: 'Showcase model impact (e.g., forecast accuracy), include reproducible notebooks.',
    keywords: ['data science','python','r','pandas','numpy','sklearn','tensorflow','pytorch','sql','tableau','power bi','hadoop','spark','statistics','a/b testing'],
    tools: ['Jupyter','Scikit-learn','TensorFlow','PyTorch','Tableau','Spark'],
    qualifications: 'MS Data Science/Stats; Google Data Analytics; Azure Data Scientist.',
    hardSkills: ['Regression/Classification','Feature Engineering','Time-Series','NLP Basics'],
    softSkills: ['Storytelling','Critical Thinking']
  },

  // 2. Healthcare & Medical
  'General Practitioner (GP)': {
    roleDescription: 'Primary care physician diagnosing common illnesses and managing chronic conditions.',
    keyPoints: 'Emphasize patient outcomes and cultural competency; include telemedicine experience.',
    keywords: ['primary care','diagnosis','preventive medicine','ehr','telemedicine','chronic disease','vaccinations'],
    tools: ['Epic','Cerner','OpenEMR'],
    qualifications: 'MD/DO/MBBS; Board Certified Family Medicine (ABFM); ACLS/BLS.',
    hardSkills: ['Differential Diagnosis','Pharmacology','Screenings'],
    softSkills: ['Empathy','Holistic Care']
  },
  'Registered Nurse (RN)': {
    roleDescription: 'Direct patient care, medication administration, vitals monitoring across shifts.',
    keyPoints: 'Quantify patient load and outcomes; highlight shift flexibility.',
    keywords: ['nursing','patient care','iv therapy','wound care','vital signs','medication administration','triage','telemetry'],
    tools: ['Epic','Cerner'],
    qualifications: 'ADN/BSN; NCLEX-RN; ACLS.',
    hardSkills: ['Catheter Insertion','Triage'],
    softSkills: ['Compassion','Teamwork']
  },

  // 5. Finance, Banking & Accounting
  'Accountant': {
    roleDescription: 'Prepares financial statements, tax returns, and ensures compliance with GAAP/IFRS.',
    keyPoints: 'Demonstrate zero discrepancies and on-time filings; showcase automation with Excel.',
    keywords: ['accounting','gaap','ifrs','financial reporting','reconciliation','tax preparation','audit'],
    tools: ['QuickBooks','Xero','Excel','DBeaver'],
    qualifications: 'BAcc; CPA/ACCA.',
    hardSkills: ['Journal Entries','Depreciation','Variance Analysis'],
    softSkills: ['Attention to Detail','Integrity']
  },
  'Financial Analyst': {
    roleDescription: 'Builds financial models and forecasts for decision support.',
    keyPoints: 'Highlight forecast accuracy and ROI of recommendations.',
    keywords: ['financial analysis','excel modeling','dcf','budgeting','variance analysis','fp&a'],
    tools: ['Excel','Tableau','Power BI'],
    qualifications: 'BFin; CFA L1+.',
    hardSkills: ['Ratio Analysis','Scenario Modeling'],
    softSkills: ['Communication','Insight Synthesis']
  },

  // 6. Business, Management & Administration
  'Business Analyst': {
    roleDescription: 'Bridges business needs and IT solutions through requirements and process modeling.',
    keyPoints: 'Document on-time requirements delivery; showcase BPMN/UML artifacts.',
    keywords: ['business analysis','requirements','uml','bpmn','stakeholder','user stories','acceptance criteria'],
    tools: ['Jira','Confluence','Visio','Lucidchart'],
    qualifications: 'BSBA; CBAP/PMI-PBA.',
    hardSkills: ['Use Case Writing','Process Mapping'],
    softSkills: ['Elicitation','Facilitation']
  },
  'Product Manager': {
    roleDescription: 'Defines product vision and roadmaps, drives cross-functional delivery.',
    keyPoints: 'Show product growth metrics and outcomes; map roadmap to KPIs.',
    keywords: ['product management','roadmap','user stories','mvp','market research','kpis'],
    tools: ['Jira','Aha!','Productboard'],
    qualifications: 'BS; CSPO.',
    hardSkills: ['Prioritization','Discovery'],
    softSkills: ['Stakeholder Management','Strategic Thinking']
  },
  'Project Manager': {
    roleDescription: 'Leads projects to on-time, on-budget completion using agile/waterfall methods.',
    keyPoints: 'Quantify on-time delivery and budget adherence; risk mitigation examples.',
    keywords: ['project management','pmbok','gantt','risk register','agile','waterfall','stakeholder'],
    tools: ['MS Project','Asana','Trello'],
    qualifications: 'PMP/PRINCE2.',
    hardSkills: ['Critical Path','Risk Management'],
    softSkills: ['Leadership','Conflict Resolution']
  },

  // 7. Sales, Marketing & Customer Service
  'Sales Executive': {
    roleDescription: 'Executes sales cycles to hit quotas, manages pipeline and negotiations.',
    keyPoints: 'Highlight quota attainment and deal sizes; outline verticals.',
    keywords: ['sales','pipeline','crm','negotiation','cold calling','prospecting','closing'],
    tools: ['Salesforce','HubSpot'],
    qualifications: 'BBus; CPSP.',
    hardSkills: ['Objection Handling','Contracting'],
    softSkills: ['Persuasion','Resilience']
  },
  'Digital Marketing Specialist': {
    roleDescription: 'Grows traffic/leads via SEO/PPC and content marketing.',
    keyPoints: 'Share traffic/lead growth metrics; A/B test results.',
    keywords: ['digital marketing','seo','ppc','content marketing','google ads','analytics','sem'],
    tools: ['SEMrush','Google Analytics','Ahrefs'],
    qualifications: 'BS Marketing; Google Ads.',
    hardSkills: ['Keyword Research','Campaign Optimization'],
    softSkills: ['Trend Spotting','Copy Collaboration']
  },

  // 8. Law, Legal & Security
  'Lawyer / Attorney': {
    roleDescription: 'Represents clients, drafts legal documents, and litigates cases.',
    keyPoints: 'Include case outcomes and specialties; demonstrate research and writing.',
    keywords: ['litigation','contracts','discovery','depositions','legal research','ip','immigration'],
    tools: ['Westlaw','LexisNexis'],
    qualifications: 'JD/LLB; Bar Admission.',
    hardSkills: ['Brief Writing','Contract Drafting'],
    softSkills: ['Advocacy','Negotiation']
  },

  // 9. Creative Arts, Media & Design
  'Graphic Designer': {
    roleDescription: 'Creates visual content for brands across digital and print.',
    keyPoints: 'Show portfolio and conversion results; maintain brand consistency.',
    keywords: ['graphic design','illustrator','photoshop','branding','typography','layout'],
    tools: ['Adobe Illustrator','Photoshop','InDesign'],
    qualifications: 'BFA; Adobe Certified Expert.',
    hardSkills: ['Color Theory','Vector Graphics'],
    softSkills: ['Creativity','Client Communication']
  },
  'UI/UX Designer': {
    roleDescription: 'Designs user interfaces and experiences with research and prototyping.',
    keyPoints: 'Provide usability test outcomes and inclusive design practices.',
    keywords: ['ui/ux','figma','wireframing','prototyping','user research','accessibility'],
    tools: ['Figma','Sketch','Penpot'],
    qualifications: 'BS UX; Nielsen Norman.',
    hardSkills: ['Heuristic Evaluation','Design Systems'],
    softSkills: ['Empathy','Collaboration']
  },

  // 12. Logistics & Supply Chain (subset)
  'Supply Chain Analyst': {
    roleDescription: 'Analyzes logistics data to optimize costs and delivery performance.',
    keyPoints: 'Demonstrate cost savings and OTIF improvements.',
    keywords: ['supply chain','forecasting','optimization','kpis','sap'],
    tools: ['Tableau','Llamasoft','Excel'],
    qualifications: 'BS SCM; CSCP.',
    hardSkills: ['Network Optimization','KPI Reporting'],
    softSkills: ['Analytical Thinking','Communication']
  },
  'Logistics Coordinator': {
    roleDescription: 'Coordinates shipments and multimodal logistics, ensuring OTIF delivery.',
    keyPoints: 'List carriers and lanes; highlight customs/documentation expertise.',
    keywords: ['logistics','freight forwarding','tracking','customs','scheduling','bill of lading'],
    tools: ['Freightos','WMS'],
    qualifications: 'Diploma Logistics; CTL.',
    hardSkills: ['Documentation','Scheduling'],
    softSkills: ['Coordination','Problem-Solving']
  },

  // 4. Education & Training (subset)
  'Teacher': {
    roleDescription: 'Delivers curriculum, assesses performance, and manages the classroom environment.',
    keyPoints: 'Show pass rates and inclusive practices; include LMS experience.',
    keywords: ['teaching','curriculum','lesson planning','assessment','classroom management','lms'],
    tools: ['Google Classroom','Moodle'],
    qualifications: 'BEd/PGCE; Teaching License.',
    hardSkills: ['Differentiated Instruction','Rubrics'],
    softSkills: ['Engagement','Inclusivity']
  },

  // 3. Engineering & Manufacturing (subset)
  'Mechanical Engineer': {
    roleDescription: 'Designs mechanical systems and components; prototypes and tests with CAD/FEA.',
    keyPoints: 'Provide CAD portfolio and quantified design outcomes.',
    keywords: ['mechanical engineering','cad','solidworks','fea','thermodynamics','manufacturing','prototyping'],
    tools: ['SolidWorks','ANSYS','Fusion 360'],
    qualifications: 'BME; PE Mechanical; Six Sigma.',
    hardSkills: ['Stress Analysis','Kinematics'],
    softSkills: ['Innovation','Attention to Detail']
  },

  // 11. Trades & Skilled Labor (subset)
  'Electrician': {
    roleDescription: 'Installs and repairs electrical systems with adherence to safety codes.',
    keyPoints: 'Document safety record and compliance; list complex jobs.',
    keywords: ['electrical','wiring','nec codes','troubleshooting','panels','solar pv'],
    tools: ['Multimeter','AutoCAD Electrical'],
    qualifications: 'Apprenticeship; Journeyman Electrician.',
    hardSkills: ['Conduit Bending','Panel Work'],
    softSkills: ['Safety Awareness','Reliability']
  },

  // Generic fallback
  'Generic': {
    roleDescription: 'General role matching for unspecified categories across global markets.',
    keyPoints: 'Use standard sections, quantify outcomes, and ensure ATS-friendly formatting.',
    keywords: ['communication','project management','excel','presentation','documentation','research','leadership'],
    tools: ['Excel','PowerPoint','Word'],
    qualifications: 'Relevant degree/certifications based on role.',
    hardSkills: ['Problem-Solving','Data Analysis'],
    softSkills: ['Collaboration','Time Management']
  }
};

// Extract text from CV file
async function extractTextFromFile(buffer, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text || '';
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value || '';
    } else {
      throw new Error('Unsupported file format. Use PDF or DOCX (.docx).');
    }
  } catch (error) {
    console.error('Error parsing file:', error.message, error.stack);
    throw new Error(`Failed to parse CV file: ${error.message}`);
  }
}

// Detect CV sections
function detectSections(text) {
  const lowerText = text.toLowerCase();
  return {
    contact: /name|email|phone|linkedin|github|address/.test(lowerText),
    summary: /summary|profile|objective/.test(lowerText),
    experience: /experience|work history|employment/.test(lowerText),
    skills: /skills|technical skills|soft skills/.test(lowerText),
    education: /education|degree|university|college/.test(lowerText),
    certifications: /certifications|certificates|licenses/.test(lowerText),
  };
}

// Evaluate readability (strict heuristics suitable for ATS checks)
function evaluateReadability(text) {
  const bulletCount = (text.match(/[•\-\*\u2022]/g) || []).length;
  const sentences = text.split(/[.!?\n]/).filter((s) => s.trim().length > 0);
  const avgSentenceLength =
    sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / (sentences.length || 1);
  const hasMetrics = /\b(\d+%|\$\d+(?:,\d{3})*|\d+\s*(months|years|projects|clients|deals|patients))\b/i.test(text);

  let readabilityScore = 40;
  if (bulletCount >= 8) readabilityScore += 25; // strong bullet usage
  else if (bulletCount >= 4) readabilityScore += 15;
  if (avgSentenceLength < 18) readabilityScore += 20; // concise
  if (hasMetrics) readabilityScore += 15; // measurable impact
  return Math.max(0, Math.min(100, readabilityScore));
}

// Detect stand-out achievements (simple numeric/percent/quantity cues)
function detectStandOutPoints(text) {
  const matches = text.match(/\b(\d+%|\$\d+(?:,\d{3})*|\d+\s*(?:months|years|projects|clients|sales|deals))\b/gi) || [];
  return matches.slice(0, 25);
}

// Tokenize job description into keywords (lowercased, length>2)
function extractKeywords(jobDescription) {
  return (jobDescription || '')
    .split(/[^a-zA-Z0-9+.#/]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 2)
    .slice(0, 200); // cap to avoid noise
}

// Determine the best matching role given the job description
function detectRole(jobDescription) {
  const jd = (jobDescription || '').toLowerCase();
  let bestRole = 'Generic';
  let bestScore = -1;
  for (const [role, meta] of Object.entries(rolesCatalog)) {
    const tokens = [role]
      .concat(meta.keywords || [])
      .concat(meta.hardSkills || [])
      .concat(meta.softSkills || [])
      .concat(meta.tools || [])
      .map((t) => String(t).toLowerCase());
    const score = tokens.reduce((acc, t) => acc + (jd.includes(t) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }
  return bestRole;
}

async function scanCv(cvBuffer, cvMimetype, jobDescription) {
  try {
    // Extract text from CV
    const cvText = await extractTextFromFile(cvBuffer, cvMimetype);
    const cvLower = cvText.toLowerCase();

    // Extract keywords from JD and detect role
    const jdKeywords = extractKeywords(jobDescription);
    const role = detectRole(jobDescription);
    const roleMeta = rolesCatalog[role] || rolesCatalog.Generic;

    // Aggregate canonical keywords for matching
    const roleKeywords = (roleMeta.keywords || []).map((k) => String(k).toLowerCase());
    const unionKeywords = Array.from(new Set(jdKeywords.concat(roleKeywords))).slice(0, 300);

    // Match keywords and skills/tools
    const matchedKeywords = unionKeywords.filter((word) => cvLower.includes(word)).slice(0, 200);
    const matchedHardSkills = (roleMeta.hardSkills || []).filter((s) => cvLower.includes(String(s).toLowerCase()));
    const matchedSoftSkills = (roleMeta.softSkills || []).filter((s) => cvLower.includes(String(s).toLowerCase()));
    const matchedTools = (roleMeta.tools || []).filter((t) => cvLower.includes(String(t).toLowerCase()));

    const missingKeywords = unionKeywords.filter((word) => !cvLower.includes(word)).slice(0, 50);

    // Scores (Very Strict)
    const sectionsMap = detectSections(cvText);
    const sectionCount = Object.values(sectionsMap).filter(Boolean).length; // out of 6
    const structureScore = Math.floor((sectionCount / 6) * 100);
    const readabilityScore = evaluateReadability(cvText);
    const keywordMatch = Math.floor((matchedKeywords.length / Math.max(1, unionKeywords.length)) * 100);

    // Strict weighting and penalties
    let overallScore = Math.floor(keywordMatch * 0.6 + structureScore * 0.25 + readabilityScore * 0.15);
    const missingSectionsCount = Object.values(sectionsMap).filter((present) => !present).length;
    if (missingSectionsCount > 0) overallScore = Math.max(0, overallScore - missingSectionsCount * 6);
    if (unionKeywords.length >= 12 && matchedKeywords.length < 4) overallScore = Math.max(0, overallScore - 10); // severe keyword miss
    overallScore = Math.max(0, Math.min(100, overallScore));

    // Detect stand-out points
    const standOutPoints = detectStandOutPoints(cvText);

    // Generate feedback and solutions
    const feedback = [];
    const solutions = [];

    if (overallScore >= 79) {
      feedback.push({
        section: 'Overall',
        message: `Congratulations! Your CV achieved a strong ${overallScore}% match for the ${role} role. You are qualified and should apply to this job with confidence. Prepare hard for the interview by reviewing the job description and practicing common questions.`,
      });
      solutions.push({
        section: 'Next Steps',
        message: `Apply now and prepare thoroughly for the interview. Focus on articulating your achievements with measurable results (e.g., increased efficiency by 20%). Ensure your recent experience highlights the most relevant ${role} tools (e.g., ${(roleMeta.tools || []).slice(0, 3).join(', ')}), and maintain ATS-friendly formatting (Arial/Times New Roman 10–12pt, no tables/graphics in core sections).`
      });
    } else {
      feedback.push({
        section: 'Overall',
        message: `Your CV scored ${overallScore}% for the ${role} role. You are not yet qualified for this position. Targeted improvements are needed to increase your match and ATS compatibility.`,
      });
      const missingSectionsList = Object.entries(sectionsMap)
        .filter(([_, present]) => !present)
        .map(([section]) => section);
      const missingSectionsAdvice = missingSectionsList.length
        ? `Add missing sections: ${missingSectionsList.join(', ').replace(/\b\w/g, (c) => c.toUpperCase())}. `
        : '';
      solutions.push({
        section: 'Targeted Improvements',
        message: `${missingSectionsAdvice}Incorporate relevant keywords such as ${missingKeywords.slice(0, 8).join(', ') || 'keywords from the job description'} under Skills and in bullet points describing your impact (e.g., "reduced cost by 15%"). Use ATS-friendly formatting (Arial 10–12pt, no tables/graphics in core sections), and ensure bullets are concise (<18 words).`
      });
    }

    // Structure feedback
    const missingSectionsList = Object.entries(sectionsMap)
      .filter(([_, present]) => !present)
      .map(([section]) => section);
    if (missingSectionsList.length > 0) {
      feedback.push({
        section: 'Structure',
        message: `Your CV is missing critical sections: ${missingSectionsList
          .join(', ')
          .replace(/contact|summary|experience|skills|education|certifications/g, (s) => s.charAt(0).toUpperCase() + s.slice(1))}. ATS systems prioritize CVs with all standard sections.`,
      });
      solutions.push({
        section: 'Structure Improvements',
        message: `Add the missing sections. For Summary, include 2–3 role-specific keywords (e.g., ${unionKeywords.slice(0, 2).join(', ')}). Under Work Experience, use bullets with metrics (e.g., “Improved throughput by 25%”). Ensure a clear Skills section grouped by categories (Tools, Frameworks, Soft Skills).`
      });
    }

    // Keyword feedback
    if (missingKeywords.length > 0) {
      feedback.push({
        section: 'Keywords',
        message: `Some critical keywords from the job description and the role profile are missing: ${missingKeywords.slice(0, 10).join(', ')}. These improve ATS ranking when used naturally.`,
      });
      solutions.push({
        section: 'Keyword Improvements',
        message: `Add missing keywords where relevant (Skills and Work Experience). Use exact phrases from the job description when applicable (e.g., “Node.js”, not just “Node”). Avoid keyword stuffing; integrate them naturally into achievement-oriented bullets.`
      });
    }

    // Role meta guidance block for ATS UI
    const roleGuidance = {
      role,
      roleDescription: roleMeta.roleDescription,
      keyPoints: roleMeta.keyPoints,
      cvStructure: 'Use 1–2 pages, standard sections (Contact, Summary, Experience, Skills, Education, Certifications), ATS-safe fonts (Arial/Times 10–12pt), and avoid tables/graphics in key sections.',
      toolsAndSoftware: roleMeta.tools || [],
      qualifications: roleMeta.qualifications || '',
      skills: {
        hard: roleMeta.hardSkills || [],
        soft: roleMeta.softSkills || []
      }
    };

    return {
      keywordMatch: `${Math.max(0, Math.min(100, keywordMatch))}%`,
      structureScore: `${structureScore}%`,
      readabilityScore: `${readabilityScore}%`,
      overallScore: `${overallScore}%`,
      matchedKeywords,
      missingKeywords,
      matchedHardSkills,
      matchedSoftSkills,
      matchedTools,
      standOutPoints,
      category: role,
      feedback,
      solutions,
      roleGuidance,
    };
  } catch (error) {
    console.error('Scanning failed:', error.message, error.stack);
    throw new Error(`Scanning failed: ${error.message}`);
  }
}

module.exports = { scanCv };