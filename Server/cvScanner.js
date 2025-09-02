const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const multer = require('multer');

// Ensure Uploads directory exists
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadsDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const percentages = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

// Comprehensive list of programming languages, frameworks, and tools
const relevantKeywords = {
  frontend: [
    'javascript', 'typescript', 'html', 'css', 'dart', 'elm', 'kotlin', 'swift',
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'gatsby', 'ember',
    'backbone', 'jquery', 'bootstrap', 'tailwind', 'bulma', 'foundation', 'material-ui',
    'chakra-ui', 'ant-design', 'semantic-ui', 'flutter', 'react-native',
    'webpack', 'vite', 'parcel', 'esbuild', 'rollup', 'babel', 'eslint', 'prettier',
    'postcss', 'sass', 'less', 'stylus', 'figma', 'sketch', 'adobe-xd', 'storybook'
  ],
  backend: [
    'javascript', 'typescript', 'python', 'java', 'ruby', 'php', 'go', 'c#', 'scala',
    'perl', 'r', 'c++', 'rust', 'kotlin', 'erlang', 'elixir',
    'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'hibernate', 'rails',
    'sinatra', 'laravel', 'symfony', 'asp.net', 'phoenix', 'micronaut', 'quarkus',
    'mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'cassandra', 'dynamodb',
    'mariadb', 'oracle', 'sql-server',
    'docker', 'kubernetes', 'jenkins', 'travis-ci', 'circleci', 'github-actions',
    'ansible', 'terraform', 'nginx', 'apache', 'prometheus', 'grafana', 'postman'
  ],
  ai: [
    'python', 'r', 'julia', 'c++', 'java', 'scala', 'javascript',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy',
    'huggingface', 'spacy', 'nltk', 'opencv', 'tensorflow.js', 'brain.js', 'deeplearning4j',
    'github-copilot', 'claude-code', 'amazon-codewhisperer', 'sourcegraph', 'tabnine',
    'mutable.ai', 'google-cloud-ai', 'watsonx', 'azure-machine-learning', 'adobe-sensei',
    'amazon-sagemaker', 'ibm-watson', 'docusaurus', 'algolia', 'uipath', 'coderabbit',
    'v0', 'code-llama', 'codeparrot', 'devin', 'devika', 'replit-agent', 'lovable',
    'bolt', 'firebase-studio', 'base44'
  ],
  mobile: [
    'swift', 'kotlin', 'java', 'dart', 'javascript', 'c#', 'python', 'lua', 'rust', 'go',
    'flutter', 'react-native', 'xamarin', 'ionic', 'cordova', 'phonegap', 'nativescript',
    'android-studio', 'xcode', 'gradle', 'cocoapods', 'fastlane', 'appium', 'espresso',
    'xcuitest', 'detox', 'firebase', 'supabase', 'realm'
  ]
};

// Common CV issues and corresponding advice
const cvIssues = {
  missingSkills: (missing) => [
    `Your CV is missing key skills: ${missing.join(', ')}. Consider adding these to your skills section or showcasing projects that demonstrate proficiency in these areas.`,
    `Learn these skills through online platforms like Coursera (coursera.org), Udemy (udemy.com), or freeCodeCamp (freecodecamp.org). For example, for React, try the "React - The Complete Guide" course on Udemy.`,
    `Contribute to open-source projects on GitHub (github.com) to gain practical experience with these technologies.`,
    `Include certifications (e.g., Meta Front-End Developer Certificate from Coursera) to validate your skills.`
  ],
  outdatedTools: (outdated) => [
    `Your CV mentions outdated tools or frameworks: ${outdated.join(', ')}. Modern job roles often require newer alternatives like ${suggestModernAlternatives(outdated)}.`,
    `Update your skillset by exploring documentation on official sites (e.g., react.dev for React, nextjs.org for Next.js).`,
    `Practice by building a small project, such as a portfolio site, using modern frameworks to demonstrate relevance.`,
    `Join communities like Dev.to (dev.to) or Stack Overflow (stackoverflow.com) to stay updated on industry trends.`
  ],
  vagueDescriptions: [
    `Your CV includes vague descriptions (e.g., "worked on web projects"). Be specific by mentioning technologies used, such as "Developed a responsive e-commerce platform using React, Node.js, and MongoDB".`,
    `Quantify achievements where possible, e.g., "Improved page load time by 30% using lazy loading in React".`,
    `Use action verbs like "developed", "optimized", or "implemented" to make your experience more impactful.`,
    `Refer to resume-building tools like Jobscan (jobscan.co) or Zety (zety.com) for tips on writing precise descriptions.`
  ],
  missingProjects: [
    `Your CV lacks specific project examples. Include 2-3 relevant projects showcasing skills mentioned in the job description, e.g., a mobile app built with Flutter or an AI model using TensorFlow.`,
    `Create a GitHub repository (github.com) to host your projects and link it in your CV for credibility.`,
    `Use platforms like Dribbble (dribbble.com) for UI/UX projects or Kaggle (kaggle.com) for AI projects to showcase your work.`,
    `Ensure project descriptions highlight the problem solved, technologies used, and outcomes achieved.`
  ],
  insufficientExperience: [
    `Your CV shows limited experience in the required domain. Highlight transferable skills, such as problem-solving from Python projects for AI roles.`,
    `Enroll in a bootcamp like Codetrain Africa (codetrainafrica.com) or General Assembly (generalassemb.ly) to gain hands-on experience.`,
    `Participate in hackathons on platforms like Devpost (devpost.com) to build and showcase relevant experience.`,
    `Consider freelance projects on Upwork (upwork.com) or Fiverr (fiverr.com) to build a portfolio.`
  ]
};

// List of 14 strong resume builder websites
const resumeWebsites = [
  { name: 'Resume Genius', url: 'https://resumegenius.com/' },
  { name: 'Kickresume', url: 'https://www.kickresume.com/' },
  { name: 'Zety', url: 'https://zety.com/' },
  { name: 'Novorésumé', url: 'https://novoresume.com/' },
  { name: 'Resume.co', url: 'https://resume.co/' },
  { name: 'ResumeBuilder.com', url: 'https://www.resumebuilder.com/' },
  { name: 'Rezi', url: 'https://www.rezi.ai/' },
  { name: 'Enhancv', url: 'https://enhancv.com/' },
  { name: 'Teal', url: 'https://www.tealhq.com/' },
  { name: 'Careerflow', url: 'https://www.careerflow.ai/' },
  { name: 'Resume-Now', url: 'https://www.resume-now.com/' },
  { name: 'Jobscan', url: 'https://www.jobscan.co/' },
  { name: 'Canva Resume Builder', url: 'https://www.canva.com/create/resumes/' },
  { name: 'MyPerfectResume', url: 'https://www.myperfectresume.com/' }
];

// Suggest modern alternatives for outdated tools
const suggestModernAlternatives = (outdated) => {
  const modernMap = {
    'jquery': 'React or Vue',
    'backbone': 'Angular or Svelte',
    'grunt': 'Webpack or Vite',
    'gwt': 'Flutter or React Native'
  };
  return outdated.map(tool => modernMap[tool.toLowerCase()] || `${tool} (consider newer frameworks)`).join(', ');
};

const getMatchPercentage = async (jobDescription, cv) => {
  const jobLower = jobDescription.toLowerCase();
  const cvLower = cv.toLowerCase();
  
  // Combine all keywords
  const allKeywords = [...new Set([
    ...relevantKeywords.frontend,
    ...relevantKeywords.backend,
    ...relevantKeywords.ai,
    ...relevantKeywords.mobile
  ])];

  // Count matches and identify missing keywords
  let matches = 0;
  const missingKeywords = { frontend: [], backend: [], ai: [], mobile: [] };
  const outdatedTools = [];
  
  let jobKeywordCount = 0;
  allKeywords.forEach(keyword => {
    const inJob = jobLower.includes(keyword);
    const inCv = cvLower.includes(keyword);
    
    if (inJob) {
      jobKeywordCount++;
      if (inCv) {
        matches++;
      } else {
        if (relevantKeywords.frontend.includes(keyword)) missingKeywords.frontend.push(keyword);
        else if (relevantKeywords.backend.includes(keyword)) missingKeywords.backend.push(keyword);
        else if (relevantKeywords.ai.includes(keyword)) missingKeywords.ai.push(keyword);
        else if (relevantKeywords.mobile.includes(keyword)) missingKeywords.mobile.push(keyword);
      }
    }
    // Identify outdated tools
    if (inCv && ['jquery', 'backbone', 'grunt', 'gwt'].includes(keyword)) {
      outdatedTools.push(keyword);
    }
  });

  // Calculate raw score (0-100)
  const rawScore = jobKeywordCount > 0 ? (matches / jobKeywordCount) * 100 : 0;
  
  // Map to nearest allowed percentage
  const percentage = percentages.reduce((prev, curr) =>
    Math.abs(curr - rawScore) < Math.abs(prev - rawScore) ? curr : prev
  );

  // Generate detailed feedback (~2000 characters total, ~1000 per good/bad case)
  let feedback = [];
  if (percentage >= 70) {
    feedback.push(`Your CV aligns strongly with the job description, scoring ${percentage}%. Strengths include:`);
    const matchedKeywords = {
      frontend: relevantKeywords.frontend.filter(kw => jobLower.includes(kw) && cvLower.includes(kw)),
      backend: relevantKeywords.backend.filter(kw => jobLower.includes(kw) && cvLower.includes(kw)),
      ai: relevantKeywords.ai.filter(kw => jobLower.includes(kw) && cvLower.includes(kw)),
      mobile: relevantKeywords.mobile.filter(kw => jobLower.includes(kw) && cvLower.includes(kw))
    };
    if (matchedKeywords.frontend.length > 0) {
      feedback.push(`Frontend: Excellent inclusion of skills like ${matchedKeywords.frontend.join(', ')}. These are critical for creating responsive, user-friendly interfaces. Modern frameworks like React or Tailwind CSS are in high demand for web development roles. Consider adding a project like a portfolio site using Next.js to further showcase your skills.`);
    }
    if (matchedKeywords.backend.length > 0) {
      feedback.push(`Backend: Strong match with technologies like ${matchedKeywords.backend.join(', ')}. Backend skills ensure robust server-side logic and database management, vital for scalable applications. Highlight deployments using Docker or Kubernetes to demonstrate DevOps knowledge.`);
    }
    if (matchedKeywords.ai.length > 0) {
      feedback.push(`AI: Great use of tools like ${matchedKeywords.ai.join(', ')}. AI expertise is increasingly important for data-driven roles, showcasing your ability to handle complex models. Mention specific models like BERT or projects on Kaggle to add depth.`);
    }
    if (matchedKeywords.mobile.length > 0) {
      feedback.push(`Mobile: Well done including ${matchedKeywords.mobile.join(', ')}. Mobile development skills are key for building apps that reach wide audiences on iOS and Android. Include app store links or user metrics to validate your work.`);
    }
    feedback.push('To further enhance your CV:');
    feedback.push('1. Quantify achievements, e.g., "Optimized API response time by 25% using FastAPI". This adds credibility and impact.');
    feedback.push('2. Include links to a GitHub portfolio or live projects to demonstrate your work to recruiters.');
    feedback.push('3. Keep your CV concise (1-2 pages), use professional fonts (e.g., Arial, 10-12pt), and ensure ATS compatibility.');
    feedback.push('4. Join communities like Dev.to or Reddit’s r/programming to network and stay updated on industry trends.');
  } else {
    feedback.push(`Your CV has a match score of ${percentage}%, indicating significant room for improvement. Key areas to address:`);
    if (missingKeywords.frontend.length > 0) {
      feedback.push(...cvIssues.missingSkills(missingKeywords.frontend));
    }
    if (missingKeywords.backend.length > 0) {
      feedback.push(...cvIssues.missingSkills(missingKeywords.backend));
    }
    if (missingKeywords.ai.length > 0) {
      feedback.push(...cvIssues.missingSkills(missingKeywords.ai));
    }
    if (missingKeywords.mobile.length > 0) {
      feedback.push(...cvIssues.missingSkills(missingKeywords.mobile));
    }
    if (outdatedTools.length > 0) {
      feedback.push(...cvIssues.outdatedTools(outdatedTools));
    }
    feedback.push(...cvIssues.vagueDescriptions);
    feedback.push(...cvIssues.missingProjects);
    feedback.push(...cvIssues.insufficientExperience);
    feedback.push('General Advice: Tailor your CV to the job by incorporating missing keywords naturally. Use a clean, ATS-friendly format (e.g., via Resume Genius or Zety). Keep it 1-2 pages, use action verbs, and proofread for errors. Adding a skills section and portfolio links can significantly boost your application.');
  }

  return { percentage, feedback, websites: percentage < 70 ? resumeWebsites : [] };
};

router.post('/scan', upload.single('cv'), async (req, res) => {
  try {
    const jobDescription = req.body.jobDesc;
    let cv = req.body.cvText || '';

    if (req.file) {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        cv = data.text;
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('PDF parsing error:', error);
        return res.status(500).json({ message: 'Failed to parse PDF file' });
      }
    }

    if (!jobDescription || !cv.trim()) {
      return res.status(400).json({ message: 'Job description and CV are required' });
    }

    const result = await getMatchPercentage(jobDescription, cv);
    res.json(result);
  } catch (error) {
    console.error('CV scan error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
    }
    if (error.message === 'Only PDF files are allowed') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }
    res.status(500).json({ message: 'Failed to process CV scan request' });
  }
});

module.exports = router;