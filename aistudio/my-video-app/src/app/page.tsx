'use client'

import { useState } from 'react'
import { refinePrompt, generateVideo } from './actions'

export default function Home() {
  const [roughIdea, setRoughIdea] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (!roughIdea) return
    setLoading(true)
    setError('')
    setVideoUrl('')

    setStatus('Refining prompt...')
    const refineResult = await refinePrompt(roughIdea)
    if (!refineResult.success) {
      setError(refineResult.error)
      setStatus('')
      setLoading(false)
      return
    }

    setStatus('Generating video (this may take 1-3 minutes)...')
    const videoResult = await generateVideo(refineResult.data)
    if (!videoResult.success) {
      setError(videoResult.error)
      setStatus('')
      setLoading(false)
      return
    }

    setVideoUrl(videoResult.data)
    setStatus('Done!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">AI Video Generator</h1>
        <p className="text-gray-400 mb-6">Describe your idea and let AI create a video clip</p>

        <input
          className="border border-gray-700 bg-gray-900 text-white p-3 w-full mb-4 rounded-lg focus:outline-none focus:border-blue-500"
          value={roughIdea}
          onChange={(e) => setRoughIdea(e.target.value)}
          placeholder="e.g. A cat jumping over a rainbow at sunset"
          disabled={loading}
        />

        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 rounded-lg w-full font-medium transition-colors"
          onClick={handleGenerate}
          disabled={loading || !roughIdea}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>

        {status && <p className="mt-4 text-blue-400">{status}</p>}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm font-medium">Error</p>
            <p className="text-red-200 text-sm mt-1 break-all">{error}</p>
          </div>
        )}
        {videoUrl && (
          <video src={videoUrl} controls className="mt-6 w-full rounded-lg" />
        )}
      </div>
    </div>
  )
}
