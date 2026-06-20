'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { resumes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuid } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createResume(data: {
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  candidateName?: string
  candidateEmail?: string
}) {
  const userId = await getUserId()

  const resumeId = uuid()
  
  const result = await db
    .insert(resumes)
    .values({
      id: resumeId,
      userId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      fileType: data.fileType,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      extracted: false,
    })
    .returning()

  revalidatePath('/resumes')
  return result[0]
}

export async function getResumes() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.createdAt)
}

export async function getResumeById(resumeId: string) {
  const userId = await getUserId()
  
  const result = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, resumeId))
    .limit(1)

  if (!result.length || result[0].userId !== userId) {
    throw new Error('Resume not found')
  }

  return result[0]
}

export async function updateResumeExtraction(resumeId: string, extractedData: any) {
  const userId = await getUserId()

  const result = await db
    .update(resumes)
    .set({
      extracted: true,
      extractedData,
      skills: extractedData.skills,
      experience: extractedData.experience,
      education: extractedData.education,
      updatedAt: new Date(),
    })
    .where(eq(resumes.id, resumeId))
    .returning()

  revalidatePath('/resumes')
  return result[0]
}

export async function deleteResume(resumeId: string) {
  const userId = await getUserId()

  await db
    .delete(resumes)
    .where(eq(resumes.id, resumeId))

  revalidatePath('/resumes')
}
