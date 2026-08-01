'use client'

import { useState, useRef, useEffect } from 'react'
import {
  refinePrompt, generateVideo,
  searchUnsplash, getPopularUnsplash,
  saveGeneration, getGenerationHistory, getUsageStats, clearHistory, exportHistoryCsv,
} from './actions'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()

type Tab = 'studio' | 'images' | 'data'

interface UnsplashImage {
  id: string; url: string; thumb: string; small: string; alt: string
}

interface GenRecord {
  id: string; timestamp: string; roughIdea: string
  refinedPrompt: string; duration: number; status: string; error?: string
}

interface UsageStats {
  totalGenerations: number; successfulGenerations: number
  failedGenerations: number; averageDuration: number; totalApiCalls: number
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('studio')

  // Studio state
  const [roughIdea, setRoughIdea] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [titleText, setTitleText] = useState('')
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [showTitleInput, setShowTitleInput] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const genStart = useRef(0)

  // Images state
  const [searchQuery, setSearchQuery] = useState('')
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null)
  const [popularLoaded, setPopularLoaded] = useState(false)

  // Data state
  const [history, setHistory] = useState<GenRecord[]>([])
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [csvData, setCsvData] = useState('')

  // --- Studio ---

  async function loadFFmpeg() {
    if (ffmpegLoaded) return
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    setFfmpegLoaded(true)
  }

  async function handleGenerate() {
    if (!roughIdea) return
    setLoading(true); setError(''); setVideoUrl(''); setShowTitleInput(false); setTitleText('')
    genStart.current = Date.now()
    setStatus('Refining prompt with OpenRouter...')
    const refineResult = await refinePrompt(roughIdea)
    if (!refineResult.success) {
      setError(refineResult.error); setStatus(''); setLoading(false)
      await saveGeneration({ roughIdea, refinedPrompt: '', duration: Date.now() - genStart.current, status: 'failed', error: refineResult.error })
      return
    }

    setStatus('Generating video with NVIDIA AI (1-3 min)...')
    const videoResult = await generateVideo(refineResult.data)
    if (!videoResult.success) {
      setError(videoResult.error); setStatus(''); setLoading(false)
      await saveGeneration({ roughIdea, refinedPrompt: refineResult.data, duration: Date.now() - genStart.current, status: 'failed', error: videoResult.error })
      return
    }

    setVideoUrl(videoResult.data)
    setStatus('Done! Add title overlay or download below.')
    setLoading(false); setShowTitleInput(true)
    await saveGeneration({ roughIdea, refinedPrompt: refineResult.data, duration: Date.now() - genStart.current, status: 'success' })
  }

  async function handleAddTitle() {
    if (!titleText || !videoUrl) return
    setProcessing(true); setStatus('Adding title overlay with FFmpeg...')
    try {
      await loadFFmpeg()
      const videoRes = await fetch(videoUrl)
      const videoBlob = await videoRes.blob()
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob))
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `drawtext=text='${titleText}':fontcolor=white:fontsize=36:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=h-th-40:enable='between(t,0,3)'`,
        '-c:a', 'copy', 'output.mp4',
      ])
      const data = await ffmpeg.readFile('output.mp4')
      const src = typeof data === 'string' ? new TextEncoder().encode(data) : data
      const bytes = new Uint8Array(src.byteLength)
      bytes.set(src)
      const blob = new Blob([bytes.buffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      if (videoRef.current) videoRef.current.src = url
      setVideoUrl(url); setStatus('Title overlay applied!')
    } catch (e) {
      setError(`FFmpeg error: ${e instanceof Error ? e.message : String(e)}`)
    }
    setProcessing(false)
  }

  function handleDownload(url: string, filename: string) {
    fetch(url).then(r => r.blob()).then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = filename; a.click()
    })
  }

  // --- Images ---

  async function handleSearchImages() {
    if (!searchQuery) return
    setImagesLoading(true)
    const result = await searchUnsplash(searchQuery)
    if (result.success) setImages(result.data)
    else setError(result.error)
    setImagesLoading(false)
  }

  async function loadPopular() {
    if (popularLoaded) return
    setImagesLoading(true)
    const result = await getPopularUnsplash()
    if (result.success) { setImages(result.data); setPopularLoaded(true) }
    setImagesLoading(false)
  }

  useEffect(() => { if (tab === 'images' && images.length === 0) loadPopular() }, [tab])

  // --- Data ---

  async function loadData() {
    setDataLoading(true)
    const [h, s] = await Promise.all([getGenerationHistory(), getUsageStats()])
    setHistory(h); setStats(s)
    setDataLoading(false)
  }

  useEffect(() => { if (tab === 'data') loadData() }, [tab])

  async function handleClearHistory() {
    await clearHistory()
    setHistory([]); setStats(null)
  }

  async function handleExportCsv() {
    const result = await exportHistoryCsv()
    if (result.success) setCsvData(result.data)
  }

  useEffect(() => {
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'ai-studio-data.csv'; a.click()
      setCsvData('')
    }
  }, [csvData])

  // --- UI ---

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'studio', label: 'Studio', icon: '🎬' },
    { key: 'images', label: 'Images', icon: '🖼️' },
    { key: 'data', label: 'Data', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">
            <span className="text-blue-400">AI</span> Studio
          </h1>
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status & Error bar */}
        {status && <p className="mb-4 text-blue-400 text-sm">{status}</p>}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* ===== STUDIO TAB ===== */}
        {tab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h2 className="text-lg font-semibold mb-3">Create Video</h2>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Ideas are moderated for family-friendly content</p>
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Safe
                  </span>
                </div>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                  value={roughIdea}
                  onChange={(e) => setRoughIdea(e.target.value)}
                  placeholder="Describe your video idea...&#10;e.g. A cat jumping over a rainbow at sunset"
                  disabled={loading || processing}
                />
                <button
                  className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 rounded-lg w-full font-medium transition-colors"
                  onClick={handleGenerate}
                  disabled={loading || processing || !roughIdea}
                >
                  {loading ? 'Generating...' : 'Generate Video'}
                </button>
              </div>

              {showTitleInput && (
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">FFmpeg — Add Title Overlay</h3>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      value={titleText}
                      onChange={(e) => setTitleText(e.target.value)}
                      placeholder="Title text"
                      disabled={processing}
                    />
                    <button
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                      onClick={handleAddTitle}
                      disabled={processing || !titleText}
                    >
                      {processing ? 'Processing...' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Output panel */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 min-h-[400px] flex flex-col items-center justify-center">
                {videoUrl ? (
                  <div className="w-full space-y-4">
                    <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg" />
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg w-full font-medium transition-colors"
                      onClick={() => handleDownload(videoUrl, 'ai-video.mp4')}
                    >
                      Download Video
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-600 text-center">
                    <p className="text-5xl mb-3">🎬</p>
                    <p className="text-lg">Your generated video will appear here</p>
                    <p className="text-sm mt-1">OpenRouter refines → NVIDIA generates → FFmpeg processes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== IMAGES TAB ===== */}
        {tab === 'images' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="text-lg font-semibold mb-3">Search Stock Images</h2>
              <p className="text-sm text-gray-400 mb-1">Search millions of free stock photos from Unsplash</p>
              <p className="text-xs text-gray-500 mb-4">Queries are moderated; NSFW results are filtered out</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                  onClick={handleSearchImages}
                  disabled={imagesLoading || !searchQuery}
                >
                  {imagesLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-colors text-left"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={img.thumb}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {images.length === 0 && !imagesLoading && (
              <div className="text-center text-gray-600 py-16">
                <p className="text-5xl mb-3">🖼️</p>
                <p className="text-lg">Search for stock images or browse popular photos</p>
                <p className="text-sm mt-1">Powered by Unsplash</p>
              </div>
            )}

            {imagesLoading && (
              <div className="text-center text-gray-400 py-8">
                <p>Loading images...</p>
              </div>
            )}

            {selectedImage && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                <div className="bg-gray-900 rounded-xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <img src={selectedImage.small} alt={selectedImage.alt} className="w-full" />
                  <div className="p-4 flex items-center justify-between">
                    <p className="text-sm text-gray-400">Stock photo via Unsplash</p>
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        onClick={() => handleDownload(selectedImage.url + '&w=1920', `unsplash-${selectedImage.id}.jpg`)}
                      >
                        Download
                      </button>
                      <button className="text-gray-400 hover:text-white px-3 py-2" onClick={() => setSelectedImage(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== DATA TAB ===== */}
        {tab === 'data' && (
          <div className="space-y-6">
            {/* Stats cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Generations', value: stats.totalGenerations, color: 'text-blue-400' },
                  { label: 'Successful', value: stats.successfulGenerations, color: 'text-green-400' },
                  { label: 'Failed', value: stats.failedGenerations, color: 'text-red-400' },
                  { label: 'Avg Duration', value: `${stats.averageDuration}s`, color: 'text-yellow-400' },
                  { label: 'API Calls', value: stats.totalApiCalls, color: 'text-purple-400' },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* History table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generation History</h2>
                <div className="flex gap-2">
                  <button
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    onClick={handleExportCsv}
                    disabled={history.length === 0}
                  >
                    Export CSV
                  </button>
                  <button
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    onClick={handleClearHistory}
                    disabled={history.length === 0}
                  >
                    Clear
                  </button>
                </div>
              </div>
              {dataLoading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <p className="text-4xl mb-2">📊</p>
                  <p>No generation data yet. Generate a video in the Studio tab.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400">
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Idea</th>
                        <th className="text-left p-3 font-medium">Duration</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((r) => (
                        <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="p-3 text-gray-400 whitespace-nowrap">
                            {new Date(r.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 max-w-[300px] truncate">{r.roughIdea}</td>
                          <td className="p-3 text-gray-400">{r.duration}s</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              r.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
