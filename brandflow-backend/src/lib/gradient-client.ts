import { BrandDNA, CampaignInput, CampaignPack, ApiBrandDNASchema, ApiCampaignPackSchema } from './schemas'

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
  const result = await gradientPost('brand-dna', { kb_id: kbId })
  return ApiBrandDNASchema.parse(result)
}

export async function generateCampaignPack(params: {
  brandDna: BrandDNA
  campaign: CampaignInput
}): Promise<CampaignPack> {
  // Map camelCase TS inputs to snake_case Python inputs
  const payload = {
    brand_dna: {
      tone: params.brandDna.tone,
      target_audience: params.brandDna.targetAudience,
      values: params.brandDna.values,
      key_messages: params.brandDna.keyMessages,
      proof_points: params.brandDna.proofPoints,
      visual_style: params.brandDna.visualStyle || []
    },
    campaign: {
      goal: params.campaign.goal,
      offer: params.campaign.offer,
      audience: params.campaign.audience,
      channel_preferences: params.campaign.channelPreferences || []
    }
  }

  const result = await gradientPost('campaign-pack', payload)
  return ApiCampaignPackSchema.parse(result)
}
