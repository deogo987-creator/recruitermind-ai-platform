'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rankings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createRanking(data: {
  jobId: string
  candidateId: string
  rank: number
  score: number
  matchBreakdown?: any
  explainabilityData?: any
}) {
  const userId = await getUserId()

  const rankingId = uuid()

  const result = await db
    .insert(rankings)
    .values({
      id: rankingId,
      userId,
      jobId: data.jobId,
      candidateId: data.candidateId,
      rank: data.rank,
      score: data.score,
      matchBreakdown: data.matchBreakdown,
      explainabilityData: data.explainabilityData,
    })
    .returning()

  revalidatePath('/candidate-rankings')
  return result[0]
}

export async function getRankings(jobId: string) {
  const userId = await getUserId()

  return db
    .select()
    .from(rankings)
    .where(and(eq(rankings.userId, userId), eq(rankings.jobId, jobId)))
}

export async function updateRanking(rankingId: string, data: any) {
  const userId = await getUserId()

  const result = await db
    .update(rankings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(rankings.id, rankingId))
    .returning()

  revalidatePath('/candidate-rankings')
  return result[0]
}
