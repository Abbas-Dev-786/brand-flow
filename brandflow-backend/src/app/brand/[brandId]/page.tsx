"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BrandDNA } from '@/lib/schemas'
import { getBrand, updateBrandDna } from '@/lib/api'
import { BrandDnaEditor } from '@/components/BrandDnaEditor'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Globe, Sparkles } from 'lucide-react'

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
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div className="glass p-8 rounded-2xl max-w-md">
        <p className="text-red-500 font-bold text-xl mb-4">Error</p>
        <p className="text-slate-600 mb-6">{error}</p>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl">
          Return Home
        </Button>
      </div>
    </div>
  )
  if (!brandData) return null

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-indigo-100/20 rounded-full blur-[100px] -z-10" />
      
      <header className="sticky top-0 z-50 glass border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
              className="hover:bg-slate-100 rounded-full text-slate-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-slate-200/50 shadow-sm">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                {new URL(brandData.websiteUrl).hostname}
              </span>
            </div>
          </div>
          
          <Button
            onClick={() => router.push(`/campaign?brandId=${brandId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 rounded-xl px-6 py-5 h-auto font-bold group"
          >
            Create Campaign <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 animate-in">
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest border border-indigo-100">
            <Sparkles className="w-3 h-3" /> Brand Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Your Brand DNA
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-medium">
            Our AI has decoded your brand's essence. Refine these core pillars to ensure every generated campaign feels authentic and hits the mark.
          </p>
        </div>

        <BrandDnaEditor dna={brandData.brandDna} onSave={handleSaveDna} />
      </main>
    </div>
  )
}
