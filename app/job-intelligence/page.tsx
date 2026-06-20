'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Trash2, Plus } from 'lucide-react'
import { getJobs } from '@/app/actions/jobs'
import { useEffect } from 'react'

export default function JobIntelligencePage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddJob, setShowAddJob] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const data = await getJobs()
      setJobs(data)
    } catch (error) {
      console.error('Failed to load jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddJob = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in all fields')
      return
    }

    try {
      // This will be connected to the createJob action
      console.log('Adding job:', formData)
      setFormData({ title: '', description: '' })
      setShowAddJob(false)
      await loadJobs()
    } catch (error) {
      console.error('Failed to add job')
    }
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
            <h1 className="text-2xl font-bold">Job Intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Create and analyze job postings
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Add Job Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Jobs</h2>
            <Button onClick={() => setShowAddJob(!showAddJob)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>

          {showAddJob && (
            <div className="mt-6 rounded-lg border border-border bg-card p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Job Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                    placeholder="e.g., Senior React Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                    placeholder="Paste job description here..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddJob}>Create Job</Button>
                  <Button variant="outline" onClick={() => setShowAddJob(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No jobs yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.description?.substring(0, 50)}...
                    </p>
                    {job.analyzed && (
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
                    setJobs(jobs.filter((j) => j.id !== job.id))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
