import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { analyzeJobPosting } from '@/lib/utils/ai'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, jobText } = await request.json()

    if (!jobId || !jobText) {
      return Response.json(
        { error: 'Missing jobId or jobText' },
        { status: 400 }
      )
    }

    // Verify job belongs to user
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1)

    if (!job.length || job[0].userId !== session.user.id) {
      return Response.json({ error: 'Job not found' }, { status: 404 })
    }

    // Analyze job using Gemini
    const analysis = await analyzeJobPosting(jobText)

    // Update job with analysis
    const result = await db
      .update(jobs)
      .set({
        analyzed: true,
        analysisData: analysis,
        requirements: analysis.requiredSkills,
        preferredQualifications: analysis.preferredSkills,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning()

    return Response.json({
      success: true,
      job: result[0],
      analysis,
    })
  } catch (error) {
    console.error('Job analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze job' },
      { status: 500 }
    )
  }
}
