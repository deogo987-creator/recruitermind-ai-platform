import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { candidates, jobs, rankings } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { rankCandidate } from '@/lib/utils/ai'
import { v4 as uuid } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId, jobId } = await request.json()

    if (!candidateId || !jobId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify candidate and job exist and belong to user
    const candidate = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, candidateId))
      .limit(1)

    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1)

    if (
      !candidate.length ||
      candidate[0].userId !== session.user.id ||
      !job.length ||
      job[0].userId !== session.user.id
    ) {
      return Response.json({ error: 'Candidate or job not found' }, { status: 404 })
    }

    // Prepare summaries for ranking
    const resumeSummary = `
Name: ${candidate[0].name}
Email: ${candidate[0].email || 'N/A'}
Location: ${candidate[0].location || 'N/A'}
Skills: ${candidate[0].skills?.map((s: any) => s.skill).join(', ') || 'N/A'}
Experience: ${candidate[0].experience?.map((e: any) => `${e.position} at ${e.company}`).join(', ') || 'N/A'}
Education: ${candidate[0].education?.map((e: any) => `${e.degree} from ${e.school}`).join(', ') || 'N/A'}
`

    const jobDescription = job[0].description

    // Rank candidate using Gemini
    const ranking = await rankCandidate(
      candidate[0].name,
      resumeSummary,
      jobDescription
    )

    // Store ranking
    const rankingId = uuid()
    const result = await db
      .insert(rankings)
      .values({
        id: rankingId,
        userId: session.user.id,
        jobId,
        candidateId,
        rank: 1, // Will be determined by comparing with other candidates
        score: ranking.overallScore,
        matchBreakdown: {
          skillMatch: ranking.skillMatch,
          experienceMatch: ranking.experienceMatch,
          educationMatch: ranking.educationMatch,
          cultureFit: ranking.cultureFit,
        },
        explainabilityData: {
          reasoning: ranking.reasoning,
          strengths: ranking.strengths,
          gaps: ranking.gaps,
        },
      })
      .returning()

    // Update candidate with ranking info
    await db
      .update(candidates)
      .set({
        overallRank: ranking.overallScore,
        rankingExplanation: {
          reasoning: ranking.reasoning,
          strengths: ranking.strengths,
          gaps: ranking.gaps,
        },
        matchPercentage: ranking.skillMatch,
      })
      .where(eq(candidates.id, candidateId))

    return Response.json({
      success: true,
      ranking: result[0],
      analysis: ranking,
    })
  } catch (error) {
    console.error('Ranking calculation error:', error)
    return Response.json(
      { error: 'Failed to calculate ranking' },
      { status: 500 }
    )
  }
}
