'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'

interface ResumeUploadProps {
  onSuccess?: (resume: any) => void
  onError?: (error: string) => void
}

export function ResumeUpload({ onSuccess, onError }: ResumeUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files?.[0]) {
      uploadResume(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.[0]) {
      uploadResume(files[0])
    }
  }

  const uploadResume = async (file: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onSuccess?.(data.resume)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Drag and drop your resume here</p>
          <p className="text-xs text-muted-foreground">or click to select</p>
        </div>

        <label>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileInput}
            disabled={isLoading}
            className="hidden"
          />
          <Button
            as="span"
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Select File'
            )}
          </Button>
        </label>
      </div>
    </div>
  )
}
