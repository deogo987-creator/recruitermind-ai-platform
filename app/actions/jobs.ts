'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createJob(data: {
  title: string
  description: string
  requirements: any[]
  preferredQualifications?: any[]
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
}) {
  const userId = await getUserId()

  const jobId = uuid()
  
  const result = await db
    .insert(jobs)
    .values({
      id: jobId,
      userId,
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      preferredQualifications: data.preferredQualifications || [],
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      analyzed: false,
    })
    .returning()

  revalidatePath('/jobs')
  return result[0]
}

export async function getJobs() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(jobs.createdAt)
}

export async function getJobById(jobId: string) {
  const userId = await getUserId()
  
  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)

  if (!result.length || result[0].userId !== userId) {
    throw new Error('Job not found')
  }

  return result[0]
}

export async function updateJobAnalysis(jobId: string, analysisData: any) {
  const userId = await getUserId()

  const result = await db
    .update(jobs)
    .set({
      analyzed: true,
      analysisData,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning()

  revalidatePath('/jobs')
  return result[0]
}

export async function deleteJob(jobId: string) {
  const userId = await getUserId()

  await db
    .delete(jobs)
    .where(eq(jobs.id, jobId))

  revalidatePath('/jobs')
}
