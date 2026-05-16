'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void
  accept?: Record<string, string[]>
  maxSize?: number
}

export function FileUpload({ onFileContent, accept, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)
      setError(null)
      setUploaded(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error al procesar el archivo')
        }

        const data = await res.json()
        setUploaded(file.name)
        onFileContent(data.content, file.name)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setUploading(false)
      }
    },
    [onFileContent]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize,
    multiple: false
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploaded
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Procesando archivo...</p>
          </div>
        ) : uploaded ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">✅</span>
            <p className="text-sm font-medium text-green-700">{uploaded}</p>
            <p className="text-xs text-gray-500">Haz clic o arrastra para cambiar el archivo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-400">PDF, Word (.docx), JPG, PNG — máximo 10MB</p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
