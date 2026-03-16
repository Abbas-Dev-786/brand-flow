import { BrandDNA, CampaignInput, CampaignPack } from './schemas'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export async function onboardBrand(websiteUrl: string): Promise<{ brandId: string, brandDna: BrandDNA }> {
  const res = await fetch(`${API_BASE}/api/brand/onboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ websiteUrl })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getBrand(brandId: string): Promise<{ brandId: string, websiteUrl: string, kbId: string, brandDna: BrandDNA }> {
  const res = await fetch(`${API_BASE}/api/brand/${brandId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateBrandDna(brandId: string, dna: BrandDNA): Promise<{ brandId: string, brandDna: BrandDNA }> {
  const res = await fetch(`${API_BASE}/api/brand/${brandId}/dna`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dna)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function generateCampaign(brandId: string, campaign: CampaignInput): Promise<{ campaignId: string, campaignPack: CampaignPack }> {
  const res = await fetch(`${API_BASE}/api/campaign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandId, campaign })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getCampaigns(brandId: string): Promise<{ campaigns: { id: string, goal: string, campaignPack: CampaignPack, createdAt: string }[] }> {
  const res = await fetch(`${API_BASE}/api/campaign?brandId=${brandId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
