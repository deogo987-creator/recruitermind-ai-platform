/**
 * AI utilities for Gemini API interactions
 */

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Schema for job extraction
const JobAnalysisSchema = z.object({
  title: z.string(),
  requiredSkills: z.array(z.object({
    skill: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    years: z.number().optional(),
  })),
  preferredSkills: z.array(z.string()).optional(),
  experience: z.object({
    minYears: z.number(),
    preferredYears: z.number(),
  }),
  education: z.array(z.string()).optional(),
  keyResponsibilities: z.array(z.string()),
  keyQualifications: z.array(z.string()),
})

// Schema for resume extraction
const ResumeAnalysisSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.object({
    skill: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    yearsOfExperience: z.number().optional(),
  })),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    year: z.number().optional(),
  })),
  certifications: z.array(z.string()).optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
})

// Schema for skill verification
const SkillVerificationSchema = z.object({
  skill: z.string(),
  confidenceScore: z.number().min(0).max(100),
  evidenceSources: z.array(z.object({
    source: z.string(), // 'resume', 'github', 'project', 'education'
    evidence: z.string(),
    confidence: z.number().min(0).max(100),
  })),
  verificationStatus: z.enum(['verified', 'partial', 'unverified']),
})

// Schema for ranking
const CandidateRankingSchema = z.object({
  candidateId: z.string(),
  overallScore: z.number().min(0).max(100),
  skillMatch: z.number().min(0).max(100),
  experienceMatch: z.number().min(0).max(100),
  educationMatch: z.number().min(0).max(100),
  cultureFit: z.number().min(0).max(100),
  reasoning: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
})

export async function analyzeJobPosting(jobText: string) {
  const model = google('gemini-2.0-flash')
  
  const result = await generateObject({
    model,
    schema: JobAnalysisSchema,
    prompt: `Analyze this job posting and extract structured data:

${jobText}

Extract the job title, required skills with levels, preferred skills, years of experience needed, education requirements, key responsibilities, and key qualifications.`,
  })

  return result.object
}

export async function analyzeResume(resumeText: string) {
  const model = google('gemini-2.0-flash')
  
  const result = await generateObject({
    model,
    schema: ResumeAnalysisSchema,
    prompt: `Analyze this resume and extract structured data:

${resumeText}

Extract the candidate's name, contact info, summary, skills with proficiency levels, work experience, education, certifications, and any social profiles.`,
  })

  return result.object
}

export async function verifySkill(candidateName: string, skill: string, resumeContext: string) {
  const model = google('gemini-2.0-flash')
  
  const result = await generateObject({
    model,
    schema: SkillVerificationSchema,
    prompt: `Verify the "${skill}" skill for candidate ${candidateName}.

Resume Context:
${resumeContext}

Based on the resume, determine if this skill is evidenced, what sources support it, and provide a confidence score from 0-100.`,
  })

  return result.object
}

export async function rankCandidate(
  candidateName: string,
  resumeSummary: string,
  jobDescription: string
) {
  const model = google('gemini-2.0-flash')
  
  const result = await generateObject({
    model,
    schema: CandidateRankingSchema,
    prompt: `Rank this candidate for the job position.

Candidate: ${candidateName}
Resume Summary:
${resumeSummary}

Job Description:
${jobDescription}

Provide an overall score (0-100) and scores for skill match, experience match, education match, and culture fit. List key strengths and any gaps.`,
  })

  return result.object
}
