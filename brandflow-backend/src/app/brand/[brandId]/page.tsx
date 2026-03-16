"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BrandDNA } from '@/lib/schemas'
import { getBrand, updateBrandDna } from '@/lib/api'
import { BrandDnaEditor } from '@/components/BrandDnaEditor'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe } from 'lucide-react'

export default function BrandPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [brandData, setBrandData] = useState<{ websiteUrl: string, brandDna: BrandDNA } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBrand() {
      try {
        const data = await getBrand(brandId)
        setBrandData({ websiteUrl: data.websiteUrl, brandDna: data.brandDna })
      } catch (err: any) {
        setError(err.message || 'Failed to load brand data')
      } finally {
        setLoading(false)
      }
    }
    if (brandId) fetchBrand()
  }, [brandId])

  const handleSaveDna = async (editedDna: BrandDNA) => {
    try {
      await updateBrandDna(brandId, editedDna)
      setBrandData(prev => prev ? { ...prev, brandDna: editedDna } : null)
      // Optional: Add a toast notification here
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>
  if (!brandData) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Globe className="text-indigo-500" />
            <a href={brandData.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
              {new URL(brandData.websiteUrl).hostname}
            </a>
          </div>
          <Button
            onClick={() => router.push(`/campaign?brandId=${brandId}`)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md gap-2"
          >
            Ready to launch? Create Campaign <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Your Brand DNA</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We extracted the core essence of your brand. Review and tweak the details below to ensure every generated campaign hits the mark perfectly.
          </p>
        </div>

        <BrandDnaEditor dna={brandData.brandDna} onSave={handleSaveDna} />
      </main>
    </div>
  )
}
