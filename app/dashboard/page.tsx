import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getJobs } from '@/app/actions/jobs'
import { getResumes } from '@/app/actions/resumes'
import { FileText, Briefcase, Settings, LogOut } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - RecruiterMind AI',
  description: 'Manage your recruitment workflow with AI',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const jobs = await getJobs()
  const resumes = await getResumes()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">RecruiterMind AI</h1>
            <p className="text-sm text-muted-foreground">
              Intelligent recruitment platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold">Welcome, {session.user.name}</h2>
          <p className="mt-2 text-muted-foreground">
            Streamline your hiring process with AI-powered resume analysis and candidate ranking
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold">{jobs.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resumes</p>
                <p className="text-3xl font-bold">{resumes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidates</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/job-intelligence">
            <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
              <Briefcase className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Job Intelligence</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload and analyze job postings
              </p>
            </div>
          </Link>

          <Link href="/resume-intelligence">
            <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
              <FileText className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Resume Intelligence</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload and extract resume data
              </p>
            </div>
          </Link>

          <Link href="/candidate-rankings">
            <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
              <FileText className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Candidate Rankings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View ranked candidates for jobs
              </p>
            </div>
          </Link>

          <Link href="/copilot">
            <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
              <FileText className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Recruiter Copilot</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Chat with your AI recruitment assistant
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
