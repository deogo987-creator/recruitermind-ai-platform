import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { resumes } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { analyzeResume } from '@/lib/utils/ai'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeId, resumeText } = await request.json()

    if (!resumeId || !resumeText) {
      return Response.json(
        { error: 'Missing resumeId or resumeText' },
        { status: 400 }
      )
    }

    // Verify resume belongs to user
    const resume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1)

    if (!resume.length || resume[0].userId !== session.user.id) {
      return Response.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Analyze resume using Gemini
    const analysis = await analyzeResume(resumeText)

    // Update resume with analysis
    const result = await db
      .update(resumes)
      .set({
        extracted: true,
        extractedData: analysis,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        candidateName: analysis.name,
        candidateEmail: analysis.email,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId))
      .returning()

    return Response.json({
      success: true,
      resume: result[0],
      analysis,
    })
  } catch (error) {
    console.error('Resume analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}
