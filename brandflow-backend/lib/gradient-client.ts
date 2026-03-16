import { BrandDNA, BrandDNASchema, CampaignInput, CampaignPack, CampaignPackSchema } from './schemas'

const GRADIENT_BASE_URL = process.env.GRADIENT_BASE_URL!
const GRADIENT_API_KEY = process.env.GRADIENT_API_KEY!

async function gradientPost(endpoint: string, body: any) {
  const response = await fetch(`${GRADIENT_BASE_URL}/entrypoints/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GRADIENT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Gradient ${endpoint} failed: ${response.statusText}`)
  }

  return response.json()
}

export async function generateBrandDNA(kbId: string): Promise<BrandDNA> {
  const result = await gradientPost('brand-dna', { kbId })
  return BrandDNASchema.parse(result)
}

export async function generateCampaignPack(params: {
  brandDna: BrandDNA
  campaign: CampaignInput
}): Promise<CampaignPack> {
  const result = await gradientPost('campaign-pack', params)
  return CampaignPackSchema.parse(result)
}
