'use client'

import { useState } from 'react'
import { ResumeUpload } from '@/components/resume-upload'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText, Trash2 } from 'lucide-react'
import { getResumes } from '@/app/actions/resumes'
import { useEffect } from 'react'

export default function ResumeIntelligencePage() {
  const [resumes, setResumes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      const data = await getResumes()
      setResumes(data)
    } catch (error) {
      setErrorMessage('Failed to load resumes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeUploaded = (resume: any) => {
    setResumes([...resumes, resume])
    setSuccessMessage('Resume uploaded successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleError = (error: string) => {
    setErrorMessage(error)
    setTimeout(() => setErrorMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Resume Intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Upload and analyze resumes
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Upload Resume</h2>
          <ResumeUpload
            onSuccess={handleResumeUploaded}
            onError={handleError}
          />
        </div>

        {/* Resumes List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Your Resumes</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : resumes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No resumes yet. Upload one to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{resume.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {resume.candidateName || 'Unknown candidate'}
                      </p>
                      {resume.extracted && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ✓ Analyzed
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResumes(resumes.filter((r) => r.id !== resume.id))
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
