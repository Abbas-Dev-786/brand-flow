"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CampaignPack, CampaignInput } from '@/lib/schemas'
import { generateCampaign, getCampaigns, getBrand } from '@/lib/api'
import { CampaignForm } from '@/components/CampaignForm'
import { CampaignPackPreview } from '@/components/CampaignPackPreview'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, PlusCircle, Sparkles, LayoutDashboard } from 'lucide-react'

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
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-white/20 shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/brand/${brandId}`)} 
              className="hover:bg-slate-100 rounded-full text-slate-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> DNA
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Campaign Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              {brandWebsiteUrl ? new URL(brandWebsiteUrl).hostname : ''}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Sidebar - Campaign History */}
        <aside className="w-full lg:w-80 shrink-0 bg-white border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-50">
            <Button
              onClick={() => setSelectedPack(null)}
              className={`w-full justify-center gap-2 h-14 rounded-2xl font-bold transition-all border-2 ${
                selectedPack === null 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-300"
              }`}
            >
              <PlusCircle className="w-5 h-5" /> New Campaign
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <div className="flex items-center gap-2 px-2 pb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black tracking-widest uppercase text-slate-400">History</span>
            </div>
            {campaigns.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No campaigns generated yet.</p>
              </div>
            ) : (
              campaigns.map(camp => (
                <button
                  key={camp.id}
                  onClick={() => setSelectedPack(camp.campaignPack)}
                  className={`w-full text-left p-4 rounded-2xl transition-all group ${
                    selectedPack === camp.campaignPack
                      ? 'bg-indigo-50 border border-indigo-100 shadow-sm'
                      : 'hover:bg-slate-50/80 border border-transparent'
                  }`}
                >
                  <div className={`text-sm font-bold leading-tight mb-2 ${selectedPack === camp.campaignPack ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {camp.goal}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {new Date(camp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>Variant 1</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30 p-6 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-8 animate-in">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-sm">
                <p className="text-red-700 text-sm font-bold uppercase tracking-widest mb-1">Error Occurred</p>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {!selectedPack ? (
              <div className="max-w-2xl mx-auto py-12">
                <div className="mb-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-200 flex items-center justify-center mx-auto transform -rotate-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900">Start a Campaign</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
                    Define your goal and let AI craft the perfect multi-channel launch package.
                  </p>
                </div>
                <CampaignForm onSubmit={handleGenerate} isGenerating={generating} />
              </div>
            ) : (
              <div className="animate-in">
                <CampaignPackPreview pack={selectedPack} />
              </div>
            )}
          </div>
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
