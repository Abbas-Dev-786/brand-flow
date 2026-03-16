import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { CampaignInputSchema, BrandDNASchema } from '@/lib/schemas'
import { generateCampaignPack } from '@/lib/gradient-client'

const prisma = new PrismaClient()

const PostCampaignSchema = z.object({
  brandId: z.string().uuid(),
  campaign: CampaignInputSchema
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { brandId } = req.query
    if (!brandId || typeof brandId !== 'string') {
      return res.status(400).json({ error: 'Missing brandId query parameter' })
    }

    try {
      const campaigns = await prisma.campaign.findMany({
        where: { brandId },
        orderBy: { createdAt: 'desc' }
      })
      return res.json({ campaigns })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { brandId, campaign } = PostCampaignSchema.parse(req.body)

      // Fetch the brand and its DNA
      const brand = await prisma.brand.findUnique({ where: { id: brandId } })
      if (!brand) return res.status(404).json({ error: 'Brand not found' })

      const activeDna = BrandDNASchema.parse(brand.brandDnaEdited || brand.brandDnaRaw)

      // Generate the campaign pack from Gradient
      const campaignPack = await generateCampaignPack({
        brandDna: activeDna,
        campaign: campaign
      })

      // Save to Database
      const savedCampaign = await prisma.campaign.create({
        data: {
          brandId,
          goal: campaign.goal,
          offer: campaign.offer,
          audience: campaign.audience,
          channelPrefs: campaign.channelPreferences || [],
          campaignPack: campaignPack
        }
      })

      return res.status(201).json({
        campaignId: savedCampaign.id,
        campaignPack: savedCampaign.campaignPack
      })
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).end()
}
