import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { resumes } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { v4 as uuid } from 'uuid'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const filename = `resumes/${session.user.id}/${uuid()}-${file.name}`
    const blob = await put(filename, file, {
      access: 'private',
    })

    // Extract candidate info from form data
    const candidateName = formData.get('candidateName') as string | null
    const candidateEmail = formData.get('candidateEmail') as string | null

    // Create resume record in database
    const resumeId = uuid()
    
    const result = await db
      .insert(resumes)
      .values({
        id: resumeId,
        userId: session.user.id,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        fileType: file.type,
        candidateName,
        candidateEmail,
        extracted: false,
      })
      .returning()

    return Response.json({
      success: true,
      resume: result[0],
      uploadUrl: blob.url,
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return Response.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    )
  }
}
