import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight">
            RecruiterMind AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Intelligent recruitment platform powered by AI
          </p>
          <p className="max-w-md text-base text-muted-foreground">
            Streamline your hiring process with AI-powered resume analysis, skill verification, and intelligent candidate ranking.
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-card p-6 text-left">
            <h3 className="font-semibold">Resume Intelligence</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Automatically extract and parse candidate information from resumes
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 text-left">
            <h3 className="font-semibold">Skill Verification</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Verify candidate skills with confidence scores based on multiple evidence sources
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 text-left">
            <h3 className="font-semibold">AI Ranking</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get explainable AI-powered candidate rankings with detailed reasoning
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
