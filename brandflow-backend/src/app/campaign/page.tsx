"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CampaignPack, CampaignInput } from '@/lib/schemas'
import { generateCampaign, getCampaigns, getBrand } from '@/lib/api'
import { CampaignForm } from '@/components/CampaignForm'
import { CampaignPackPreview } from '@/components/CampaignPackPreview'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, PlusCircle } from 'lucide-react'

type CampaignRecord = {
  id: string
  goal: string
  campaignPack: CampaignPack
  createdAt: string
}

function CampaignContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const brandId = searchParams.get('brandId')

  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([])
  const [selectedPack, setSelectedPack] = useState<CampaignPack | null>(null)
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brandId) {
      router.push('/')
      return
    }

    async function loadData() {
      try {
        const [brandData, campaignsData] = await Promise.all([
          getBrand(brandId!),
          getCampaigns(brandId!)
        ])
        setBrandWebsiteUrl(brandData.websiteUrl)
        setCampaigns(campaignsData.campaigns)

        if (campaignsData.campaigns.length > 0) {
          setSelectedPack(campaignsData.campaigns[0].campaignPack)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load campaigns')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [brandId, router])

  const handleGenerate = async (input: CampaignInput) => {
    if (!brandId) return
    setGenerating(true)
    setError(null)
    try {
      const res = await generateCampaign(brandId, input)
      const newCampaign: CampaignRecord = {
        id: res.campaignId,
        goal: input.goal,
        campaignPack: res.campaignPack,
        createdAt: new Date().toISOString()
      }
      setCampaigns(prev => [newCampaign, ...prev])
      setSelectedPack(res.campaignPack)
    } catch (err: any) {
      setError(err.message || 'Failed to generate campaign pack')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/brand/${brandId}`)} className="text-gray-500 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Brand DNA
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">Campaign Studio</h1>
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {brandWebsiteUrl ? new URL(brandWebsiteUrl).hostname : ''}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8">
        {/* Sidebar - Campaign History */}
        <aside className="w-full md:w-1/4 lg:w-1/5 shrink-0 flex flex-col gap-4">
          <Button
            onClick={() => setSelectedPack(null)}
            variant={selectedPack === null ? "default" : "outline"}
            className="w-full justify-start gap-2 h-12 border-dashed border-2 hover:bg-gray-100"
          >
            <PlusCircle className="w-5 h-5 text-indigo-500" /> New Campaign
          </Button>

          <div className="bg-white rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Recent
              </h3>
            </div>
            <div className="overflow-y-auto p-2 space-y-1">
              {campaigns.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No campaigns yet.</p>
              ) : (
                campaigns.map(camp => (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedPack(camp.campaignPack)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border ${
                      selectedPack === camp.campaignPack
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm font-medium'
                        : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="line-clamp-2 leading-tight">{camp.goal}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(camp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="w-full md:w-3/4 lg:w-4/5 flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {!selectedPack ? (
            <div className="max-w-2xl">
              <CampaignForm onSubmit={handleGenerate} isGenerating={generating} />
            </div>
          ) : (
            <div className="w-full max-w-4xl pb-16">
              <CampaignPackPreview pack={selectedPack} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function CampaignPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CampaignContent />
    </Suspense>
  )
}
