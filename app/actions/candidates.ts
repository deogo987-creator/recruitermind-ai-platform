'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { candidates, skillEvidence } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createCandidate(data: {
  resumeId: string
  jobId: string
  name: string
  email?: string
  phone?: string
  location?: string
  skills?: any[]
  experience?: any[]
  education?: any[]
}) {
  const userId = await getUserId()

  const candidateId = uuid()

  const result = await db
    .insert(candidates)
    .values({
      id: candidateId,
      userId,
      resumeId: data.resumeId,
      jobId: data.jobId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      skills: data.skills || [],
      experience: data.experience || [],
      education: data.education || [],
    })
    .returning()

  revalidatePath('/candidate-rankings')
  return result[0]
}

export async function getCandidates(jobId?: string) {
  const userId = await getUserId()

  let query = db
    .select()
    .from(candidates)
    .where(eq(candidates.userId, userId))

  if (jobId) {
    query = db
      .select()
      .from(candidates)
      .where(and(eq(candidates.userId, userId), eq(candidates.jobId, jobId)))
  }

  return query
}

export async function updateCandidateRanking(
  candidateId: string,
  data: {
    overallRank?: number
    rankingExplanation?: any
    matchPercentage?: number
    verificationScore?: number
    verificationDetails?: any
  }
) {
  const userId = await getUserId()

  const result = await db
    .update(candidates)
    .set({
      overallRank: data.overallRank,
      rankingExplanation: data.rankingExplanation,
      matchPercentage: data.matchPercentage,
      verificationScore: data.verificationScore,
      verificationDetails: data.verificationDetails,
      updatedAt: new Date(),
    })
    .where(eq(candidates.id, candidateId))
    .returning()

  revalidatePath('/candidate-rankings')
  return result[0]
}

export async function addSkillEvidence(data: {
  candidateId: string
  skill: string
  confidenceScore: number
  evidenceSources?: any[]
  verificationStatus: 'verified' | 'partial' | 'unverified'
}) {
  const userId = await getUserId()

  const evidenceId = uuid()

  const result = await db
    .insert(skillEvidence)
    .values({
      id: evidenceId,
      userId,
      candidateId: data.candidateId,
      skill: data.skill,
      confidenceScore: data.confidenceScore,
      evidenceSources: data.evidenceSources || [],
      verificationStatus: data.verificationStatus,
    })
    .returning()

  return result[0]
}

export async function getSkillEvidence(candidateId: string) {
  const userId = await getUserId()

  return db
    .select()
    .from(skillEvidence)
    .where(
      and(
        eq(skillEvidence.userId, userId),
        eq(skillEvidence.candidateId, candidateId)
      )
    )
}
