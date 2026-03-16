"use client"

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { onboardBrand } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOnboardBrand = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { brandId } = await onboardBrand(url)
      router.push(`/brand/${brandId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to onboard brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <main className="max-w-4xl mx-auto px-4 py-24 w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Your AI Marketing Department
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Paste your website. Get your Brand DNA. Generate on-brand campaigns for every launch.
          </p>
        </div>

        <form onSubmit={handleOnboardBrand} className="max-w-md mx-auto">
          <div className="relative">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="text-2xl py-8 px-8 text-center rounded-2xl shadow-2xl border-2 border-indigo-200 focus:border-indigo-400 bg-white"
            />
            <Button
              type="submit"
              disabled={loading || !url}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-lg px-8 py-6 rounded-xl shadow-xl transition-all disabled:opacity-70 text-white font-semibold"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Generate Brand DNA"}
            </Button>
          </div>
          {error && <p className="text-red-500 text-center mt-12 font-medium">{error}</p>}
        </form>
      </main>
    </div>
  )
}
