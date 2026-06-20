import { pgTable, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core'

// ============================================================================
// BETTER AUTH TABLES (do not modify)
// ============================================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// ============================================================================
// APP TABLES
// ============================================================================

// Jobs table
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: jsonb('requirements').notNull(), // Array of skills required
  preferredQualifications: jsonb('preferredQualifications'), // Array of nice-to-have skills
  fileUrl: text('fileUrl'),
  fileName: text('fileName'),
  fileSize: integer('fileSize'),
  fileType: text('fileType'),
  analyzed: boolean('analyzed').notNull().default(false),
  analysisData: jsonb('analysisData'), // Stores extracted requirements from AI
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Resumes table
export const resumes = pgTable('resumes', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  fileName: text('fileName').notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileSize: integer('fileSize'),
  fileType: text('fileType'),
  candidateName: text('candidateName'),
  candidateEmail: text('candidateEmail'),
  extracted: boolean('extracted').notNull().default(false),
  extractedData: jsonb('extractedData'), // Stores parsed resume info
  skills: jsonb('skills'), // Extracted skills
  experience: jsonb('experience'), // Work history
  education: jsonb('education'), // Education details
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Candidates table
export const candidates = pgTable('candidates', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  resumeId: text('resumeId').notNull(),
  jobId: text('jobId').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  location: text('location'),
  skills: jsonb('skills'), // Array of {skill, proficiency, yearsOfExperience}
  experience: jsonb('experience'), // Array of {company, role, duration, description}
  education: jsonb('education'), // Array of {school, degree, field, year}
  verificationScore: integer('verificationScore'), // 0-100 skill verification score
  verificationDetails: jsonb('verificationDetails'), // Detailed verification breakdown
  githubProfile: text('githubProfile'),
  githubAnalyzed: boolean('githubAnalyzed').notNull().default(false),
  githubAnalysis: jsonb('githubAnalysis'), // GitHub insights
  overallRank: integer('overallRank'), // Ranking 1-100
  rankingExplanation: jsonb('rankingExplanation'), // Why ranked this way
  matchPercentage: integer('matchPercentage'), // % match with job
  hiddenTalentScore: integer('hiddenTalentScore'), // Score for hidden talent (0-100)
  hiddenTalentInsights: jsonb('hiddenTalentInsights'), // Insights about hidden talents
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Skill Evidence table - stores verification sources for each skill
export const skillEvidence = pgTable('skillEvidence', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  candidateId: text('candidateId').notNull(),
  skill: text('skill').notNull(),
  confidenceScore: integer('confidenceScore').notNull(), // 0-100
  evidenceSources: jsonb('evidenceSources'), // Array of {source, evidence, confidence}
  verificationStatus: text('verificationStatus').notNull(), // 'verified', 'partial', 'unverified'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Rankings table - stores job-candidate rankings
export const rankings = pgTable('rankings', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  jobId: text('jobId').notNull(),
  candidateId: text('candidateId').notNull(),
  rank: integer('rank').notNull(), // 1, 2, 3, etc.
  score: integer('score').notNull(), // 0-100
  matchBreakdown: jsonb('matchBreakdown'), // {skillMatch: %, experience: %, education: %, etc}
  explainabilityData: jsonb('explainabilityData'), // Detailed reasoning
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Copilot Chat History
export const chatMessages = pgTable('chatMessages', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  sessionId: text('sessionId').notNull(), // Conversation session ID
  jobId: text('jobId'), // If candidate-aware mode
  candidateId: text('candidateId'), // If candidate-aware mode
  role: text('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  metadata: jsonb('metadata'), // Extra data for tools, citations, etc
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Analysis Jobs table - stores background job tracking
export const analysisJobs = pgTable('analysisJobs', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(), // 'resume_extract', 'job_analyze', 'skill_verify', 'github_analyze', 'ranking'
  referenceId: text('referenceId').notNull(), // ID of the item being analyzed
  status: text('status').notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  progress: integer('progress').notNull().default(0), // 0-100
  errorMessage: text('errorMessage'),
  result: jsonb('result'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
