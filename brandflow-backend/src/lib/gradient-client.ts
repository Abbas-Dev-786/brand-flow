import { BrandDNA, CampaignInput, CampaignPack, ApiBrandDNASchema, ApiCampaignPackSchema } from './schemas'

const GRADIENT_BASE_URL = process.env.GRADIENT_BASE_URL!
const GRADIENT_API_KEY = process.env.GRADIENT_API_KEY!

async function gradientPost(body: any) {
  // Use the unified /run endpoint for local development
  // 12-minute timeout: the agent may poll KB indexing for up to 10 min + LLM call time
  const response = await fetch(`${GRADIENT_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GRADIENT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12 * 60 * 1000),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gradient API failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Gradient Agent Error: ${data.error}`)
  }
  return data
}

export async function ingestWebsite(url: string): Promise<{ kb_id: string }> {
  const result = await gradientPost({
    action: 'ingest-website',
    url: url
  })
  return result
}

export async function generateBrandDNA(kbId: string): Promise<BrandDNA> {
  const result = await gradientPost({
    action: 'generate-brand-dna',
    kb_id: kbId,
    wait_for_indexing: false // Disable internal polling in the agent since we'll poll from the backend
  })
  return ApiBrandDNASchema.parse(result)
}

export async function checkStatus(kbId: string): Promise<any> {
  const result = await gradientPost({
    action: 'check-status',
    kb_id: kbId
  })
  return result
}

export async function generateCampaignPack(params: {
  brandDna: BrandDNA
  campaign: CampaignInput
}): Promise<CampaignPack> {
  // Map camelCase TS inputs to snake_case Python inputs
  const payload = {
    action: 'generate-campaign-pack',
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

  const result = await gradientPost(payload)
  return ApiCampaignPackSchema.parse(result)
}
