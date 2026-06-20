import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { candidates, skillEvidence } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { verifySkill } from '@/lib/utils/ai'
import { v4 as uuid } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId, skill, resumeContext } = await request.json()

    if (!candidateId || !skill || !resumeContext) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify candidate exists and belongs to user
    const candidate = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, candidateId))
      .limit(1)

    if (!candidate.length || candidate[0].userId !== session.user.id) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Verify skill using Gemini
    const verification = await verifySkill(
      candidate[0].name,
      skill,
      resumeContext
    )

    // Store skill evidence
    const evidenceId = uuid()
    const result = await db
      .insert(skillEvidence)
      .values({
        id: evidenceId,
        userId: session.user.id,
        candidateId,
        skill,
        confidenceScore: verification.confidenceScore,
        evidenceSources: verification.evidenceSources,
        verificationStatus: verification.verificationStatus,
      })
      .returning()

    return Response.json({
      success: true,
      evidence: result[0],
      verification,
    })
  } catch (error) {
    console.error('Skill verification error:', error)
    return Response.json(
      { error: 'Failed to verify skill' },
      { status: 500 }
    )
  }
}
