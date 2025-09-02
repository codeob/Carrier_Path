// cvscanner.js
// Implements ATS-like scanning for tech industry CVs.
// Parses CV files, analyzes structure, keywords, and readability, and provides detailed feedback.

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Tech industry skills by job category
const techSkillsByCategory = {
  'Frontend Developer': {
    hardSkills: [
      'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'HTML', 'CSS',
      'TailwindCSS', 'Bootstrap', 'SASS', 'LESS', 'Webpack', 'Vite', 'Redux',
      'Next.js', 'Gatsby', 'GraphQL', 'Apollo', 'Jest', 'Cypress', 'React Testing Library',
      'ES6', 'Babel', 'jQuery', 'Responsive Design', 'Web Accessibility'
    ],
    softSkills: [
      'Problem-Solving', 'Team Collaboration', 'Communication', 'Attention to Detail',
      'Creativity', 'Time Management', 'Adaptability'
    ]
  },
  'Backend Developer': {
    hardSkills: [
      'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'Java', 'Spring',
      'Ruby', 'Rails', 'PHP', 'Laravel', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
      'Redis', 'GraphQL', 'REST API', 'gRPC', 'Docker', 'Kubernetes', 'AWS',
      'Azure', 'GCP', 'Microservices', 'CI/CD', 'Jenkins'
    ],
    softSkills: [
      'Problem-Solving', 'Analytical Thinking', 'Teamwork', 'Communication',
      'Attention to Detail', 'Time Management'
    ]
  },
  'Full Stack Developer': {
    hardSkills: [
      'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
      'Python', 'Django', 'Flask', 'Java', 'Spring', 'SQL', 'NoSQL', 'MongoDB',
      'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'GraphQL', 'REST API',
      'Next.js', 'HTML', 'CSS', 'TailwindCSS', 'Jest', 'Cypress'
    ],
    softSkills: [
      'Problem-Solving', 'Team Collaboration', 'Communication', 'Adaptability',
      'Time Management', 'Leadership'
    ]
  },
  'DevOps Engineer': {
    hardSkills: [
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
      'Jenkins', 'Git', 'CI/CD', 'Linux', 'Bash', 'Python', 'Prometheus',
      'Grafana', 'ELK Stack', 'Nginx', 'Apache', 'CloudFormation'
    ],
    softSkills: [
      'Problem-Solving', 'Collaboration', 'Communication', 'Analytical Thinking',
      'Attention to Detail'
    ]
  },
  'Data Scientist': {
    hardSkills: [
      'Python', 'R', 'SQL', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn',
      'Jupyter', 'Hadoop', 'Spark', 'Tableau', 'Power BI', 'Statistics', 'Machine Learning',
      'Deep Learning', 'Data Visualization', 'Big Data'
    ],
    softSkills: [
      'Analytical Thinking', 'Problem-Solving', 'Communication', 'Attention to Detail',
      'Critical Thinking'
    ]
  }
};

// Helper function to extract text from CV file
async function extractTextFromFile(buffer, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    } else {
      throw new Error('Unsupported file format. Use .pdf or .docx');
    }
  } catch (error) {
    console.error('Error parsing file:', error.message, error.stack);
    throw new Error(`Failed to parse CV file: ${error.message}`);
  }
}

// Helper function to detect CV sections
function detectSections(text) {
  const sections = {
    contact: false,
    summary: false,
    experience: false,
    skills: false,
    education: false,
    certifications: false,
  };

  const lowerText = text.toLowerCase();
  sections.contact = /name|email|phone|linkedin|github/i.test(lowerText);
  sections.summary = /summary|profile|objective/i.test(lowerText);
  sections.experience = /experience|work history|employment/i.test(lowerText);
  sections.skills = /skills|technical skills|soft skills/i.test(lowerText);
  sections.education = /education|degree|university/i.test(lowerText);
  sections.certifications = /certifications|certificates/i.test(lowerText);

  return sections;
}

// Helper function to evaluate readability
function evaluateReadability(text) {
  const bulletCount = (text.match(/•|-|\*/g) || []).length;
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  const avgSentenceLength =
    sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) /
    (sentences.length || 1);
  const hasMetrics = /\d+%|\$\d+|\d+\s*(months|years|projects|clients)/i.test(text);

  let readabilityScore = 50;
  if (bulletCount > 5) readabilityScore += 20;
  if (avgSentenceLength < 20) readabilityScore += 20;
  if (hasMetrics) readabilityScore += 10;
  return Math.min(readabilityScore, 100);
}

// Helper function to detect stand-out achievements
function detectStandOutPoints(text) {
  const achievements = text.match(/\d+%|\$\d+|\d+\s*(months|years|projects|clients)/gi) || [];
  return achievements;
}

async function scanCv(cvBuffer, cvMimetype, jobDescription) {
  try {
    // Extract text from CV
    const cvText = await extractTextFromFile(cvBuffer, cvMimetype);

    // Extract keywords from job description
    const keywords = jobDescription
      .split(/\W+/)
      .map((k) => k.toLowerCase())
      .filter((k) => k.length > 2);

    // Detect job category from job description
    let jobCategory = 'Full Stack Developer'; // Default
    for (const category in techSkillsByCategory) {
      if (jobDescription.toLowerCase().includes(category.toLowerCase())) {
        jobCategory = category;
        break;
      }
    }

    const { hardSkills, softSkills } = techSkillsByCategory[jobCategory];

    // Match keywords and skills
    const cvWords = cvText.toLowerCase();
    const matchedKeywords = keywords.filter((word) => cvWords.includes(word));
    const matchedHardSkills = hardSkills.filter((skill) => cvWords.includes(skill.toLowerCase()));
    const matchedSoftSkills = softSkills.filter((skill) => cvWords.includes(skill.toLowerCase()));
    const missingKeywords = keywords.filter((word) => !matchedKeywords.includes(word));
    const missingHardSkills = hardSkills.filter((skill) => !cvWords.includes(skill.toLowerCase()));
    const missingSoftSkills = softSkills.filter((skill) => !cvWords.includes(skill.toLowerCase()));

    // Calculate scores
    const keywordMatch = Math.floor((matchedKeywords.length / keywords.length) * 100);
    const sectionCount = Object.values(detectSections(cvText)).filter(Boolean).length;
    const structureScore = Math.floor((sectionCount / 6) * 100);
    const readabilityScore = evaluateReadability(cvText);
    const overallScore = Math.floor(
      keywordMatch * 0.5 + structureScore * 0.3 + readabilityScore * 0.2
    );

    // Detect stand-out points
    const standOutPoints = detectStandOutPoints(cvText);

    // Generate detailed feedback (400+ words for good/bad cases)
    const feedback = [];
    const solutions = [];

    if (overallScore >= 90) {
      feedback.push({
        section: 'Overall',
        message: `Your CV is exceptional, achieving an impressive ${overallScore}% match for the ${jobCategory} role. It is highly ATS-compatible, featuring critical technical skills such as ${matchedHardSkills.slice(0, 3).join(', ') || 'none'} and relevant soft skills like ${matchedSoftSkills.slice(0, 3).join(', ') || 'none'}. The CV structure is robust, incorporating all six essential sections: Contact Information, Professional Summary, Work Experience, Skills, Education, and Certifications. This makes it easy for both ATS systems and recruiters to parse and evaluate your qualifications. Your use of concise sentences, effective bullet points, and quantifiable achievements like ${standOutPoints.slice(0, 2).join(', ') || 'measurable results'} significantly enhances your CV's impact. The readability score of ${readabilityScore}% reflects clear formatting and scannable content, which is critical for passing ATS filters. To further elevate your CV, consider emphasizing additional soft skills such as ${softSkills[0]} or ${softSkills[1]} in your experience descriptions to highlight interpersonal strengths. Additionally, ensure that all metrics are as specific as possible, such as "improved system efficiency by 30%" or "delivered 5 projects ahead of schedule," to maximize impact. Tailoring your CV even further to include any niche skills mentioned in the job description will ensure you remain a top candidate.`,
      });
      solutions.push({
        section: 'Overall Improvements',
        message: `Your CV is already in excellent shape, but there are opportunities to refine it further for the ${jobCategory} role. To strengthen soft skills, explicitly mention ${missingSoftSkills.slice(0, 2).join(' or ') || 'teamwork'} in your Work Experience or Summary, such as "collaborated with cross-functional teams to deliver projects." Add more quantifiable achievements to your Experience section, for example, "reduced API response time by 25%" or "implemented 10+ features in React." Ensure your Professional Summary includes 2–3 job-specific keywords like ${missingKeywords.slice(0, 2).join(', ') || 'JavaScript, React'} to enhance ATS compatibility. Maintain consistent formatting throughout, using the same bullet style and font (e.g., Arial, 11–12pt) to avoid parsing issues. Avoid complex layouts, tables, or graphics, as these can confuse ATS systems. If applying to multiple roles, create tailored versions of your CV for each job description, emphasizing relevant skills like ${hardSkills.slice(0, 2).join(', ')} to maintain a high score. Double-check that your Contact Information includes a professional email and LinkedIn profile, and consider adding a GitHub link if relevant to showcase your work.`
      });
    } else if (overallScore >= 70) {
      feedback.push({
        section: 'Overall',
        message: `Your CV scores a solid ${overallScore}% for the ${jobCategory} role, indicating a good foundation but room for improvement. You’ve included relevant technical skills such as ${matchedHardSkills.slice(0, 3).join(', ') || 'none'}, which align well with the job requirements, but you’re missing key skills like ${missingHardSkills.slice(0, 3).join(', ') || 'none'}. Soft skills like ${matchedSoftSkills.slice(0, 2).join(', ') || 'none'} are present, but incorporating ${missingSoftSkills.slice(0, 2).join(', ') || 'communication'} would strengthen your application. Your CV structure includes ${sectionCount}/6 required sections, which is a good start, but missing sections reduce ATS compatibility. The readability score of ${readabilityScore}% suggests decent formatting, but longer sentences or fewer bullet points may hinder scannability. Achievements like ${standOutPoints.slice(0, 2).join(', ') || 'none'} are noted, but adding more quantifiable metrics will make your CV stand out. To improve your chances of being shortlisted, focus on tailoring your CV to the job description, ensuring all required sections are present, and enhancing readability with concise, bullet-pointed descriptions.`,
      });
      solutions.push({
        section: 'Overall Improvements',
        message: `To elevate your CV for the ${jobCategory} role, incorporate missing technical skills like ${missingHardSkills.slice(0, 3).join(', ') || 'Python, SQL'} into your Skills and Experience sections. For example, if you’ve used ${missingHardSkills[0] || 'React'} in a project, state "Developed user interfaces using React for scalable applications." Add soft skills like ${missingSoftSkills.slice(0, 2).join(' or ') || 'problem-solving'} by describing relevant scenarios, such as "Resolved technical challenges to meet project deadlines." Ensure all six sections are included: Contact Information (name, email, LinkedIn), Professional Summary (2–4 sentences with keywords like ${keywords.slice(0, 2).join(', ')}), Work Experience (reverse chronological, e.g., "Software Engineer, ABC Corp, 2020–2023"), Skills (list ${hardSkills.slice(0, 3).join(', ')}), Education, and Certifications. For missing sections, add a Summary with job-specific terms or a Certifications section listing ${missingHardSkills[0] || 'AWS'} credentials. Use bullet points for clarity (e.g., "• Optimized database queries, improving performance by 20%"). Keep sentences under 20 words and avoid tables, graphics, or non-standard fonts like Comic Sans. Tailor your CV for each job to align with specific requirements, ensuring exact keyword matches.`
      });
    } else if (overallScore >= 50) {
      feedback.push({
        section: 'Overall',
        message: `Your CV scores ${overallScore}% for the ${jobCategory} role, placing it in the average range. It includes some relevant skills like ${matchedHardSkills.slice(0, 3).join(', ') || 'none'}, but lacks critical technical skills such as ${missingHardSkills.slice(0, 3).join(', ') || 'none'} and soft skills like ${missingSoftSkills.slice(0, 2).join(', ') || 'none'}. Only ${sectionCount}/6 required sections are present, which significantly weakens ATS compatibility. The readability score of ${readabilityScore}% indicates issues with long sentences or insufficient bullet points, making it harder for recruiters to scan. Achievements like ${standOutPoints.slice(0, 2).join(', ') || 'none'} are present but limited in impact. To improve, focus on adding missing sections, incorporating job-specific keywords, and quantifying achievements to demonstrate value. Tailoring your CV to the job description and adhering to ATS best practices will significantly boost your chances.`,
      });
      solutions.push({
        section: 'Overall Improvements',
        message: `To improve your CV for the ${jobCategory} role, add missing technical skills like ${missingHardSkills.slice(0, 3).join(', ') || 'JavaScript, AWS'} by detailing relevant projects (e.g., "Built REST API using Node.js"). Incorporate soft skills like ${missingSoftSkills.slice(0, 2).join(' or ') || 'leadership'} in your Experience, such as "Led a team of 5 to deliver a project on time." Include all six required sections: Contact Information (name, email, phone, LinkedIn), Professional Summary (2–4 sentences with keywords like ${keywords.slice(0, 2).join(', ')}), Work Experience (reverse chronological, e.g., "Developer, XYZ, 2021–2023"), Skills (e.g., ${hardSkills.slice(0, 3).join(', ')}, ${softSkills.slice(0, 2).join(', ')}), Education, and Certifications. For missing sections, add a Summary with terms like ${missingKeywords[0] || 'React'} or a Certifications section for ${missingHardSkills[0] || 'AWS'}. Use bullet points (e.g., "• Reduced bugs by 30% through testing") and keep sentences concise (<20 words). Avoid tables, graphics, or headers/footers, and use standard fonts like Arial to ensure ATS compatibility. Tailor your CV for each application to match job-specific requirements.`
      });
    } else {
      feedback.push({
        section: 'Overall',
        message: `Your CV scores a low ${overallScore}% for the ${jobCategory} role, indicating significant improvements are needed. It lacks critical technical skills like ${missingHardSkills.slice(0, 3).join(', ') || 'none'} and soft skills such as ${missingSoftSkills.slice(0, 2).join(', ') || 'none'}, which are essential for ATS and recruiter attention. Only ${sectionCount}/6 required sections are present, severely limiting ATS compatibility. The readability score of ${readabilityScore}% suggests issues with dense paragraphs, long sentences, or lack of bullet points, making it difficult to scan. Achievements like ${standOutPoints.slice(0, 2).join(', ') || 'none'} are insufficient to demonstrate impact. Major restructuring is needed to include all standard sections, incorporate job-specific keywords, and highlight quantifiable achievements to improve your chances of being shortlisted.`,
      });
      solutions.push({
        section: 'Overall Improvements',
        message: `To significantly improve your CV for the ${jobCategory} role, start by adding missing technical skills like ${missingHardSkills.slice(0, 3).join(', ') || 'Python, React'} in your Skills and Experience sections (e.g., "Developed web application using React and Node.js"). Include soft skills like ${missingSoftSkills.slice(0, 2).join(' or ') || 'communication'} by describing scenarios (e.g., "Communicated with clients to define project requirements"). Add all six required sections: Contact Information (name, email, phone, LinkedIn), Professional Summary (2–4 sentences with keywords like ${keywords.slice(0, 2).join(', ')}), Work Experience (reverse chronological, e.g., "Software Engineer, ABC Corp, 2020–2023"), Skills (list ${hardSkills.slice(0, 3).join(', ')}, ${softSkills.slice(0, 2).join(', ')}), Education, and Certifications. Use bullet points for clarity (e.g., "• Optimized code, improving performance by 25%"). Keep sentences under 20 words and avoid tables, graphics, or non-standard fonts like Comic Sans. Use Arial or Times New Roman for ATS compatibility. Tailor your CV to each job description, ensuring exact keyword matches to boost your score significantly.`
      });
    }

    // Additional feedback and solutions
    const missingSections = Object.entries(detectSections(cvText))
      .filter(([_, present]) => !present)
      .map(([section]) => section);
    if (missingSections.length > 0) {
      feedback.push({
        section: 'Structure',
        message: `Your CV is missing critical sections: ${missingSections
          .join(', ')
          .replace(/contact|summary|experience|skills|education|certifications/g, (s) =>
            s.charAt(0).toUpperCase() + s.slice(1)
          )}. ATS systems prioritize CVs with all standard sections, so their absence significantly reduces your visibility to recruiters.`,
      });
      solutions.push({
        section: 'Structure Improvements',
        message: `Add the missing sections: ${missingSections
          .join(', ')
          .replace(/contact|summary|experience|skills|education|certifications/g, (s) =>
            s.charAt(0).toUpperCase() + s.slice(1)
          )}. For Contact Information, include your full name, professional email, phone number, and LinkedIn or GitHub URL. Add a Professional Summary (2–4 sentences) incorporating keywords like ${keywords.slice(0, 2).join(', ')} to highlight your fit for the role. List Work Experience in reverse chronological order (e.g., "Frontend Developer, XYZ Corp, 2021–2023"). Include a Skills section with technical skills like ${hardSkills.slice(0, 3).join(', ')} and soft skills like ${softSkills.slice(0, 2).join(', ')}. Add Education (e.g., "BS Computer Science, ABC University") and Certifications (e.g., "AWS Certified Developer"). Use a clean layout with standard fonts like Arial or Times New Roman to ensure ATS compatibility.`
      });
    } else {
      feedback.push({
        section: 'Structure',
        message: `Your CV includes all required sections: Contact Information, Professional Summary, Work Experience, Skills, Education, and Certifications. This makes it highly ATS-compatible. Ensure Work Experience is listed in reverse chronological order and uses consistent formatting to maintain professionalism.`,
      });
      solutions.push({
        section: 'Structure Improvements',
        message: `Your CV structure is solid, but ensure Work Experience is in reverse chronological order (most recent first). Use consistent formatting, such as the same bullet style and font (Arial, 11–12pt) across all sections. Verify that your Contact Information includes a professional email and LinkedIn/GitHub links. In your Professional Summary, incorporate 2–3 job-specific keywords like ${keywords.slice(0, 2).join(', ')} to boost ATS ranking. For Skills, categorize them into Technical (e.g., ${hardSkills.slice(0, 3).join(', ')}) and Soft Skills (e.g., ${softSkills.slice(0, 2).join(', ')}) for clarity. Ensure Certifications are up-to-date and relevant to the ${jobCategory} role.`
      });
    }

    if (missingKeywords.length > 0) {
      feedback.push({
        section: 'Keywords',
        message: `Your CV misses several critical keywords from the job description: ${missingKeywords
          .slice(0, 5)
          .join(', ')}. These keywords are essential for ATS systems to rank your CV highly, as they indicate alignment with the job requirements.`,
      });
      solutions.push({
        section: 'Keyword Improvements',
        message: `Incorporate missing keywords like ${missingKeywords.slice(0, 5).join(', ')} into your CV naturally. Add them to your Skills section (e.g., "Proficient in ${missingKeywords[0] || 'JavaScript'}") or Work Experience (e.g., "Developed features using ${missingKeywords[1] || 'React'}"). Ensure exact matches with job description terms, such as using "Node.js" instead of "Node" if specified. Avoid keyword stuffing by integrating terms contextually, such as in project descriptions or achievements. For example, if the job requires ${missingKeywords[0] || 'AWS'}, mention "Deployed applications on AWS" in your Experience. Review the job description carefully to identify additional relevant terms and incorporate them strategically.`
      });
    } else {
      feedback.push({
        section: 'Keywords',
        message: `Your CV includes all critical keywords from the job description, making it highly ATS-compatible. Keywords like ${matchedKeywords.slice(0, 5).join(', ')} align well with the ${jobCategory} role, ensuring strong visibility to recruiters.`,
      });
      solutions.push({
        section: 'Keyword Improvements',
        message: `Your keyword alignment is excellent, but continue to tailor your CV for each job application to maintain this strength. Ensure keywords like ${matchedKeywords.slice(0, 3).join(', ')} are used naturally in your Skills, Experience, and Summary sections. For example, reinforce ${matchedKeywords[0] || 'JavaScript'} by mentioning specific projects (e.g., "Built scalable web apps using JavaScript"). Avoid overusing terms to prevent appearing unnatural. If applying to different roles, adjust keywords to match each job description precisely, ensuring ATS compatibility.`
      });
    }

    if (readabilityScore < 70) {
      feedback.push({
        section: 'Readability',
        message: `Your CV’s readability score of ${readabilityScore}% is low, likely due to long sentences, dense paragraphs, or insufficient bullet points. ATS systems and recruiters prefer concise, scannable CVs with clear formatting to quickly identify qualifications and achievements.`,
      });
      solutions.push({
        section: 'Readability Improvements',
        message: `Improve readability by shortening sentences to under 20 words and using bullet points for Work Experience and Skills (e.g., "• Developed API with Node.js, reducing latency by 20%"). Add quantifiable achievements, such as "increased efficiency by 15%" or "delivered 3 projects on time," to highlight impact. Replace dense paragraphs with concise bullet points to enhance scannability. Use standard fonts like Arial or Times New Roman (11–12pt) to ensure ATS compatibility. Avoid complex formatting, tables, or graphics that may confuse ATS parsers. For example, list skills as "• JavaScript • React • Teamwork" instead of a paragraph. Ensure consistent spacing and alignment for a professional look.`
      });
    } else {
      feedback.push({
        section: 'Readability',
        message: `Your CV has a strong readability score of ${readabilityScore}%, with effective use of bullet points, concise sentences, and quantifiable achievements like ${standOutPoints.slice(0, 2).join(', ') || 'none'}. This makes it easy for ATS systems and recruiters to scan and evaluate.`,
      });
      solutions.push({
        section: 'Readability Improvements',
        message: `Maintain your strong readability by continuing to use bullet points (e.g., "• Optimized database queries, improving performance by 20%") and keeping sentences under 20 words. Add more quantifiable achievements, such as "reduced costs by 10%" or "completed 5 projects under budget," to further enhance impact. Ensure consistent use of standard fonts like Arial or Times New Roman and avoid any tables, graphics, or headers/footers that could disrupt ATS parsing. If tailoring for a new role, verify that new content maintains this level of clarity and scannability.`
      });
    }

    feedback.push({
      section: 'ATS Best Practices',
      message: `To maximize ATS compatibility, avoid using tables, graphics, icons, or headers/footers, as these elements often fail to parse correctly. Your CV should use standard fonts and a clean, simple layout to ensure all content is machine-readable and appealing to recruiters.`,
    });
    solutions.push({
      section: 'ATS Best Practices Improvements',
      message: `Remove any tables, images, or complex formatting from your CV. Use simple bullet points (e.g., "• Developed web app using React") and standard fonts like Arial or Times New Roman (11–12pt). Ensure all text is in the main body of the document, avoiding headers/footers that ATS systems may ignore. List skills and experiences clearly, using exact keywords from the job description, such as ${keywords.slice(0, 2).join(', ')}. For example, if the job specifies "AWS," use "AWS" instead of "Amazon Web Services." Verify that your Contact Information, Summary, and Skills sections are easily scannable and contain relevant terms to boost ATS ranking.`
    });

    return {
      keywordMatch: `${keywordMatch}%`,
      structureScore: `${structureScore}%`,
      readabilityScore: `${readabilityScore}%`,
      overallScore: `${overallScore}%`,
      matchedKeywords,
      missingKeywords,
      matchedHardSkills,
      matchedSoftSkills,
      standOutPoints,
      feedback,
      solutions,
    };
  } catch (error) {
    console.error('Scanning failed:', error.message, error.stack);
    throw new Error(`Scanning failed: ${error.message}`);
  }
}

module.exports = { scanCv };